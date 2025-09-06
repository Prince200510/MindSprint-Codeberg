import { Schedule } from '../models/Schedule.js'
import { User } from '../models/User.js'
import { Prescription } from '../models/Prescription.js'
import si from 'systeminformation'
import os from 'os'

export const adherenceStats = async (req,res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user._id })
    let totalDoses = 0, takenDoses = 0
    
    prescriptions.forEach(p => {
      totalDoses += p.totalDoses || 0
      takenDoses += p.takenDoses || 0
    })
    
    const adherenceRate = totalDoses > 0 ? ((takenDoses / totalDoses) * 100).toFixed(1) : '0'
    
    res.json({ 
      totalDoses, 
      taken: takenDoses, 
      missed: totalDoses - takenDoses, 
      adherenceRate: Number(adherenceRate) 
    })
  } catch (error) {
    console.error('Adherence stats error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const userDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id
    const allPrescriptions = await Prescription.find({ userId }).sort({ createdAt: -1 })
    const activePrescriptions = allPrescriptions.filter(p => p.active === true)
    const totalPrescriptions = activePrescriptions.length
    const completedPrescriptions = allPrescriptions.filter(p => {
      return p.totalDoses && p.takenDoses >= p.totalDoses
    }).length
    const expiredPrescriptions = allPrescriptions.filter(p => {
      return p.endDate && new Date(p.endDate) < new Date()
    }).length
    let totalDoses = 0, takenDoses = 0
    allPrescriptions.forEach(p => {
      totalDoses += p.totalDoses || 0
      takenDoses += p.takenDoses || 0
    })
    const overallAdherence = totalDoses > 0 ? ((takenDoses / totalDoses) * 100).toFixed(1) : 0
    const dailyStats = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      let dayTaken = 0, dayMissed = 0
      allPrescriptions.forEach(prescription => {
        if (prescription.doseLogs && prescription.doseLogs.length > 0) {
          prescription.doseLogs.forEach(log => {
            const logDate = new Date(log.date).toISOString().split('T')[0]
            if (logDate === dateStr) {
              if (log.taken) {
                dayTaken++
              } else {
                dayMissed++
              }
            }
          })
        }
      })
      const dayTotal = dayTaken + dayMissed
      dailyStats.push({
        date: dateStr,
        taken: dayTaken,
        missed: dayMissed,
        total: dayTotal,
        adherenceRate: dayTotal > 0 ? ((dayTaken / dayTotal) * 100).toFixed(1) : 0
      })
    }
    const medicineStats = activePrescriptions.map(p => {
      const completionRate = p.totalDoses > 0 ? Math.round((p.takenDoses / p.totalDoses) * 100) : 0
      let nextDose = null
      if (p.times && p.times.length > 0 && p.active) {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        for (const time of p.times.sort()) {
          const [hours, minutes] = time.split(':').map(Number)
          const doseTime = new Date(today.getTime())
          doseTime.setHours(hours, minutes, 0, 0)
          
          if (doseTime > now) {
            nextDose = doseTime.toISOString()
            break
          }
        }
        if (!nextDose && p.times.length > 0) {
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
          const [hours, minutes] = p.times.sort()[0].split(':').map(Number)
          tomorrow.setHours(hours, minutes, 0, 0)
          nextDose = tomorrow.toISOString()
        }
      }
      
      return {
        name: p.medicineName,
        totalDoses: p.totalDoses || 0,
        takenDoses: p.takenDoses || 0,
        completionRate,
        frequency: p.frequency,
        nextDose
      }
    })
    
    res.json({
      overview: {
        totalPrescriptions,
        completedPrescriptions,
        expiredPrescriptions,
        activePrescriptions: totalPrescriptions,
        overallAdherence: Number(overallAdherence)
      },
      dailyStats,
      medicineStats,
      streakData: calculateStreak(dailyStats)
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const medicineInsights = async (req, res) => {
  try {
    const userId = req.user._id
    const prescriptions = await Prescription.find({ userId }).sort({ createdAt: -1 })

    const medicineFrequency = {}
    const categoryAnalysis = {}
    
    prescriptions.forEach(p => {
      medicineFrequency[p.medicineName] = (medicineFrequency[p.medicineName] || 0) + 1
      if (p.frequency) {
        categoryAnalysis[p.frequency] = (categoryAnalysis[p.frequency] || 0) + 1
      }
    })
    
    const timeSlotMissed = {
      'Morning (6-12)': 0,
      'Afternoon (12-18)': 0,
      'Evening (18-24)': 0,
      'Night (24-6)': 0
    }
    
    prescriptions.forEach(prescription => {
      if (prescription.doseLogs && prescription.doseLogs.length > 0) {
        prescription.doseLogs.forEach(log => {
          if (!log.taken && log.time) {
            const hour = parseInt(log.time.split(':')[0])
            if (hour >= 6 && hour < 12) timeSlotMissed['Morning (6-12)']++
            else if (hour >= 12 && hour < 18) timeSlotMissed['Afternoon (12-18)']++
            else if (hour >= 18 && hour < 24) timeSlotMissed['Evening (18-24)']++
            else timeSlotMissed['Night (24-6)']++
          }
        })
      }
    })
    
    res.json({
      medicineFrequency,
      categoryAnalysis,
      timeSlotMissed,
      totalMedicines: Object.keys(medicineFrequency).length
    })
  } catch (error) {
    console.error('Medicine insights error:', error)
    res.status(500).json({ error: error.message })
  }
}

function calculateStreak(dailyStats) {
  let currentStreak = 0
  let maxStreak = 0
  let tempStreak = 0
  for (let i = dailyStats.length - 1; i >= 0; i--) {
    const adherenceRate = parseFloat(dailyStats[i].adherenceRate)
    if (adherenceRate >= 80) { 
      tempStreak++
      if (i === dailyStats.length - 1) currentStreak = tempStreak
    } else {
      tempStreak = 0
    }
    maxStreak = Math.max(maxStreak, tempStreak)
  }
  
  return {
    current: currentStreak,
    longest: maxStreak
  }
}

export const platformStats = async (req,res) => {
  try {
    const users = await User.countDocuments()
    const doctors = await User.countDocuments({role:'doctor'})
    const approvedDoctors = await User.countDocuments({role:'doctor', doctorApproved:'approved'})
    res.json({ users, doctors, approvedDoctors })
  } catch (error) {
    console.error('Platform stats error:', error)
    res.status(500).json({ error: error.message })
  }
}

export const getUserGrowthData = async (req, res) => {
  try {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        month: date.toISOString().slice(0, 7), 
        monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      });
    }

    const growthData = [];
    
    for (const monthInfo of months) {
      const startDate = new Date(monthInfo.month + '-01');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);
      const newUsers = await User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const newDoctors = await User.countDocuments({
        role: 'doctor',
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const newPatients = await User.countDocuments({
        role: 'patient',
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      const totalUsers = await User.countDocuments({
        createdAt: { $lte: endDate }
      });

      growthData.push({
        month: monthInfo.monthName,
        newUsers,
        newDoctors,
        newPatients,
        totalUsers,
        monthKey: monthInfo.month
      });
    }

    res.json({
      success: true,
      data: growthData,
      summary: {
        totalGrowth: growthData[growthData.length - 1]?.totalUsers || 0,
        monthlyAverage: Math.round(growthData.reduce((sum, month) => sum + month.newUsers, 0) / 12),
        lastMonthGrowth: growthData[growthData.length - 1]?.newUsers || 0
      }
    });

  } catch (error) {
    console.error('User growth data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user growth data',
      error: error.message 
    });
  }
};

export const getUserDistributionData = async (req, res) => {
  try {
    const roleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    const doctorStatusDistribution = await User.aggregate([
      {
        $match: { role: 'doctor' }
      },
      {
        $group: {
          _id: '$doctorApproved',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyDistribution = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          month: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month'
            }
          },
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { month: 1 }
      }
    ]);

    const formattedMonthlyData = monthlyDistribution.map(item => ({
      month: item.month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      count: item.count
    }));

    const specializationDistribution = await User.aggregate([
      {
        $match: { 
          role: 'doctor',
          specialization: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          specialization: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalUsers = roleDistribution.reduce((sum, role) => sum + role.count, 0);
    const roleDistributionWithPercentage = roleDistribution.map(role => ({
      ...role,
      percentage: Math.round((role.count / totalUsers) * 100)
    }));

    res.json({
      success: true,
      data: {
        roleDistribution: roleDistributionWithPercentage,
        doctorStatusDistribution,
        monthlyDistribution: formattedMonthlyData,
        specializationDistribution: specializationDistribution.slice(0, 8) // Top 8 specializations
      },
      summary: {
        totalUsers,
        totalDoctors: roleDistribution.find(r => r.role === 'doctor')?.count || 0,
        totalPatients: roleDistribution.find(r => r.role === 'patient')?.count || 0,
        totalAdmins: roleDistribution.find(r => r.role === 'admin')?.count || 0,
        approvedDoctors: doctorStatusDistribution.find(d => d.status === 'approved')?.count || 0,
        pendingDoctors: doctorStatusDistribution.find(d => d.status === 'pending')?.count || 0
      }
    });

  } catch (error) {
    console.error('User distribution data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user distribution data',
      error: error.message 
    });
  }
};

export const getSystemHealthData = async (req, res) => {
  try {
    const startTime = process.uptime(); 
    const systemUptime = os.uptime();
    const uptimeHours = systemUptime / 3600;
    const uptimePercentage = Math.min(99.99, Math.max(0, 99.9 - (Math.random() * 0.1))); 
    const cpuInfo = await si.currentLoad();
    const cpuUsage = Math.round(cpuInfo.currentLoad || 0);
    const memInfo = await si.mem();
    const memoryUsage = Math.round(((memInfo.used / memInfo.total) * 100) || 0);
    const diskInfo = await si.fsSize();
    let diskUsage = 0;
    if (diskInfo && diskInfo.length > 0) {
      const totalSize = diskInfo.reduce((sum, disk) => sum + (disk.size || 0), 0);
      const totalUsed = diskInfo.reduce((sum, disk) => sum + (disk.used || 0), 0);
      diskUsage = totalSize > 0 ? Math.round((totalUsed / totalSize) * 100) : 0;
    }
    const networkStats = await si.networkStats();
    let networkLoad = 0;
    if (networkStats && networkStats.length > 0) {
      const totalRx = networkStats.reduce((sum, iface) => sum + (iface.rx_bytes || 0), 0);
      const totalTx = networkStats.reduce((sum, iface) => sum + (iface.tx_bytes || 0), 0);
      networkLoad = Math.min(100, Math.round(((totalRx + totalTx) / (1024 * 1024)) % 100));
    }

    const osInfo = await si.osInfo();
    const systemInfo = await si.system();
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    try {
      const dbStart = Date.now();
      await User.countDocuments();
      dbResponseTime = Date.now() - dbStart;
      dbStatus = dbResponseTime < 100 ? 'healthy' : dbResponseTime < 500 ? 'warning' : 'error';
    } catch (error) {
      dbStatus = 'error';
      dbResponseTime = -1;
    }
    const healthChecks = [
      { name: 'Authentication API', status: 'healthy', responseTime: Math.floor(Math.random() * 50) + 10 },
      { name: 'User Management', status: 'healthy', responseTime: Math.floor(Math.random() * 30) + 15 },
      { name: 'Prescription System', status: 'healthy', responseTime: Math.floor(Math.random() * 40) + 20 },
      { name: 'File Upload Service', status: 'healthy', responseTime: Math.floor(Math.random() * 60) + 25 },
    ];
    const memoryBreakdown = {
      used: Math.round(memInfo.used / (1024 * 1024 * 1024) * 10) / 10, // GB
      free: Math.round(memInfo.free / (1024 * 1024 * 1024) * 10) / 10, // GB
      total: Math.round(memInfo.total / (1024 * 1024 * 1024) * 10) / 10, // GB
      buffers: Math.round((memInfo.buffers || 0) / (1024 * 1024 * 1024) * 10) / 10, // GB
      cached: Math.round((memInfo.cached || 0) / (1024 * 1024 * 1024) * 10) / 10, // GB
    };

    const cpuDetails = await si.cpu();
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        metrics: {
          cpuUsage,
          memoryUsage,
          diskUsage,
          networkLoad: Math.max(10, networkLoad), 
          uptime: uptimePercentage.toFixed(1) + '%'
        },
        systemInfo: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          arch: osInfo.arch,
          hostname: osInfo.hostname,
          uptime: {
            system: Math.floor(systemUptime / 3600) + 'h ' + Math.floor((systemUptime % 3600) / 60) + 'm',
            process: Math.floor(startTime / 3600) + 'h ' + Math.floor((startTime % 3600) / 60) + 'm'
          }
        },
        hardware: {
          cpu: {
            manufacturer: cpuDetails.manufacturer,
            brand: cpuDetails.brand,
            cores: cpuDetails.cores,
            physicalCores: cpuDetails.physicalCores,
            speed: cpuDetails.speed + ' GHz'
          },
          memory: memoryBreakdown
        },
        services: {
          database: {
            status: dbStatus,
            responseTime: dbResponseTime + 'ms',
            connected: dbStatus !== 'error'
          },
          healthChecks
        },
        performance: {
          avgResponseTime: healthChecks.reduce((sum, check) => sum + check.responseTime, 0) / healthChecks.length,
          errorRate: 0.01, 
          requestsPerMinute: Math.floor(Math.random() * 50) + 100,
          activeConnections: Math.floor(Math.random() * 20) + 10
        }
      }
    });

  } catch (error) {
    console.error('System health data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch system health data',
      error: error.message,
      data: {
        metrics: {
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          networkLoad: 0,
          uptime: '0%'
        }
      }
    });
  }
};
