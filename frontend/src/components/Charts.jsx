import React from 'react';
import { LineChart,  Line,  BarChart,  Bar,  XAxis,  YAxis,  CartesianGrid,  Tooltip,  Legend,  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area} from 'recharts';

export const COLORS = {
  primary: '#5f6fff',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  gray: '#6b7280'
};

export const PIE_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.blue,
  COLORS.purple,
  COLORS.teal,
  COLORS.pink,
  COLORS.cyan
];

export const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-900 dark:text-white font-medium">
              {entry.name}: {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const UserGrowthChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-80 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-slate-400 dark:text-slate-500">Loading chart data...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-lg flex items-center justify-center">
        <div className="text-slate-400 dark:text-slate-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="totalUsersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="newUsersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip formatter={(value) => value.toLocaleString()} />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="totalUsers"
            stroke={COLORS.primary}
            fillOpacity={1}
            fill="url(#totalUsersGradient)"
            name="Total Users"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="newUsers"
            stroke={COLORS.success}
            fillOpacity={1}
            fill="url(#newUsersGradient)"
            name="New Users"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const UserDistributionChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-80 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-slate-400 dark:text-slate-500">Loading chart data...</div>
      </div>
    );
  }

  if (!data || !data.roleDistribution || data.roleDistribution.length === 0) {
    return (
      <div className="h-80 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-lg flex items-center justify-center">
        <div className="text-slate-400 dark:text-slate-500">No data available</div>
      </div>
    );
  }

  const pieData = data.roleDistribution.map((item) => ({
    name: item.role === 'patient' ? 'Patients' : 
          item.role === 'doctor' ? 'Doctors' :
          item.role === 'admin' ? 'Admins' : item.role,
    value: item.count,
    percentage: item.percentage
  }));

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip formatter={(value) => value.toLocaleString()} />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontWeight: '500' }}>
                {value} ({entry.payload.percentage}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DoctorSpecializationChart = ({ data, loading }) => {
  if (loading || !data || !data.specializationDistribution || data.specializationDistribution.length === 0) {
    return (
      <div className="h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg flex items-center justify-center">
        <div className="text-slate-400 dark:text-slate-500">
          {loading ? 'Loading specialization data...' : 'No specialization data available'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.specializationDistribution} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" stroke="#64748b" fontSize={12} />
          <YAxis 
            dataKey="specialization" 
            type="category" 
            stroke="#64748b" 
            fontSize={11}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill={COLORS.blue} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MonthlyTrendsChart = ({ data, loading }) => {
  if (loading || !data || !data.monthlyDistribution || data.monthlyDistribution.length === 0) {
    return (
      <div className="h-48 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-lg flex items-center justify-center">
        <div className="text-slate-400 dark:text-slate-500">
          {loading ? 'Loading trends data...' : 'No trends data available'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.monthlyDistribution}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke={COLORS.purple} 
            strokeWidth={3}
            dot={{ fill: COLORS.purple, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
