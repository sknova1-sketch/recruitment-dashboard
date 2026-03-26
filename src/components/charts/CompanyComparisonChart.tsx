// === 회사별 소요기간 비교 차트 ===
// BCG/맥킨지 스타일

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DurationData } from '../../types';

interface CompanyComparisonChartProps {
  data: DurationData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-sm">
        <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-gray-600 leading-relaxed">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-medium text-gray-800">{entry.value}일</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CompanyComparisonChart({ data }: CompanyComparisonChartProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/80 card-hover">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">회사별 채용 소요기간</h3>
          <p className="text-xs text-gray-400 mt-1">평균 소요일 vs 적정기간</p>
        </div>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={10} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              unit="일"
              dx={-4}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            />
            <Bar
              dataKey="avgDays"
              name="평균 소요일"
              fill="#8B5CF6"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="targetDays"
              name="적정 기간"
              fill="#E2E8F0"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
