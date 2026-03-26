// === 평균 채용 소요기간 차트 (직군별) ===
// BCG/맥킨지 스타일: 넉넉한 패딩, 여유있는 차트 높이

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { DurationData } from '../../types';

interface DurationChartProps {
  data: DurationData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const avgDays = payload.find((p: any) => p.dataKey === 'avgDays')?.value || 0;
    const targetDays = payload.find((p: any) => p.dataKey === 'targetDays')?.value || 0;
    const diff = avgDays - targetDays;

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-sm">
        <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
        <p className="text-gray-600">
          평균 소요: <span className="font-medium text-gray-800">{avgDays}일</span>
        </p>
        <p className="text-gray-600">
          적정 기간: <span className="font-medium text-gray-800">{targetDays}일</span>
        </p>
        <p className={`mt-1.5 font-medium ${diff > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
          {diff > 0 ? `+${diff}일 초과` : `${Math.abs(diff)}일 여유`}
        </p>
      </div>
    );
  }
  return null;
};

export default function DurationChart({ data }: DurationChartProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/80 card-hover">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">직군별 채용 소요기간</h3>
          <p className="text-xs text-gray-400 mt-1">평균 소요일 vs 적정기간</p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barGap={3} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              unit="일"
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            />
            <Bar
              dataKey="avgDays"
              name="평균 소요일"
              fill="#8B5CF6"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="targetDays"
              name="적정 기간"
              fill="#E2E8F0"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
