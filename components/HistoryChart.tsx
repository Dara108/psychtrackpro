
import React, { useEffect, useState } from 'react';
import { AssessmentResult, ScaleType } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface HistoryChartProps {
  results: AssessmentResult[];
}

const SCALE_COLORS: Record<string, string> = {
  [ScaleType.PHQ9]: '#6366f1',
  [ScaleType.GAD7]: '#f59e0b',
  [ScaleType.SAPS]: '#ec4899',
  [ScaleType.SANS]: '#8b5cf6',
  [ScaleType.BPRS]: '#ef4444',
  [ScaleType.CAINS]: '#06b6d4',
  'DEFAULT': '#94a3b8'
};

const HistoryChart: React.FC<HistoryChartProps> = ({ results }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // A slight timeout is more reliable than a simple mount check for Recharts
    // in complex grid/flex layouts to avoid -1 width/height errors.
    const timer = setTimeout(() => setIsReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (!results || results.length === 0) {
    return (
      <div className="h-72 w-full flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No assessment data available for this patient.
      </div>
    );
  }

  const data = results
    .map(r => ({
      date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: r.totalScore,
      type: r.scaleType,
      fullDate: r.date
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  const uniqueScales = Array.from(new Set(data.map(d => d.type)));

  return (
    <div className="w-full relative bg-white" style={{ height: '288px' }}>
      {isReady && (
        <ResponsiveContainer width="99%" height="100%" debounce={1}>
          <LineChart margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11 }} 
              padding={{ left: 10, right: 10 }}
              allowDuplicatedCategory={false}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11 }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px' 
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
            {uniqueScales.map(scale => (
              <Line 
                key={scale}
                data={data.filter(d => d.type === scale)}
                type="monotone" 
                dataKey="score" 
                name={scale} 
                stroke={SCALE_COLORS[scale as string] || SCALE_COLORS.DEFAULT} 
                strokeWidth={2.5}
                dot={{ r: 4, fill: SCALE_COLORS[scale as string] || SCALE_COLORS.DEFAULT, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default HistoryChart;
