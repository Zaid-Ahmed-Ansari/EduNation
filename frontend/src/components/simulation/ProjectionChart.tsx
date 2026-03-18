import  { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { GlassPanel } from '../ui/GlassPanel';
import {type ProjectionTimeline } from '../../simulation/engine';

interface ChartProps {
  data: ProjectionTimeline[];
  dataKey: keyof ProjectionTimeline;
  title: string;
  color: string;
  formatValue?: (val: number) => string;
}

export const ProjectionChart = ({ data, dataKey, title, color, formatValue }: ChartProps) => {
  // Format graph data structure simply
  const chartData = useMemo(() => {
    return data.map(point => ({
      year: `Year ${point.yearOffset}`,
      [dataKey]: point[dataKey as keyof ProjectionTimeline],
    }));
  }, [data, dataKey]);

  return (
    <GlassPanel className="h-64 flex flex-col gap-2 relative">
      <h3 className="text-sm font-semibold tracking-wide text-slate-300">{title}</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickMargin={8} />
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickFormatter={(val) => formatValue ? formatValue(val) : val} 
              width={60}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(val: any) => [formatValue ? formatValue(Number(val)) : Number(val).toFixed(2), title]}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey as string} 
              stroke={color} 
              strokeWidth={3}
              dot={{ r: 3, fill: '#0f172a', strokeWidth: 2 }}
              activeDot={{ r: 6 }} 
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
};
