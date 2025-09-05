import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext.jsx'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export const AnalyticsPage = () => {
  const {token} = useAuth()
  const [data,setData] = useState([])
  useEffect(()=> { if(token){ axios.get((import.meta.env.VITE_API_URL||'http://localhost:5000/api')+'/analytics/adherence',{headers:{Authorization:'Bearer '+token}}).then(r=> setData(r.data.daily||[])) } },[token])
  return <div className="max-w-4xl mx-auto py-10 space-y-6">
    <h2 className="text-2xl font-bold">Adherence</h2>
    <div className="h-72 bg-white dark:bg-neutral-900 rounded-xl p-4 border border-white/10">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="date" stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="currentColor" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip wrapperClassName="text-sm" />
            <Bar dataKey="taken" stackId="a" fill="#5f6fff" />
            <Bar dataKey="missed" stackId="a" fill="#f87171" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
}
