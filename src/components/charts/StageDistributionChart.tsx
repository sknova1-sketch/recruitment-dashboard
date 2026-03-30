// === 채용 단계별 포지션 분포 차트 ===
// BCG/맥킨지 스타일: 넓녁한 카드 패딩, 높이 확대, 세련된 헤더

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { StageDistribution } from '../../types';

interface StageDistributionChartProps {
  data: StageDistribution[];
}


// 커스텀 툴팀 - 호버 시 상세 정보 표시
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 text-sm">
        <p className="font-semibold text-gray-800 mb-1.5">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-gray-600 leading-relaxed">
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-medium text-gray-800">{entry.value}건</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function StageDistributionChart({ data }: StageDistributionChartProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100/80 card-hover">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">채용 단계별 포지션 분포</h3>
          <p className="text-xs text-gray-400 mt-1">현재 활성 포지션 기준</p>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="stage"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              allowDecimals={false}
              dx={-4}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
            />
            <Bar
              dataKey="gcCare"
              name="GC케어"
              stackId="company"
              fill="#8B5CF6"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="gcMediai"
              name="GC메디아이"
              stackId="company"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
