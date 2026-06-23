'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrafficData } from '@/hooks/useModerationDashboard';

export function TrafficChart({ data }: { data: TrafficData[] }) {
  return (
    <div className="h-[300px] w-full mt-4">
      <LineChart width={undefined} height={undefined} data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} style={{ width: '100%', height: '100%' }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ backgroundColor: '#0c1222', borderRadius: '8px', border: '1px solid #1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)', color: '#f1f5f9' }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
        <Line type="monotone" dataKey="logins" name="User Logins" stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="actions" name="User Actions" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
      </LineChart>
    </div>
  );
}
