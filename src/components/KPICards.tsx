// === KPI 카드 컴포넌트 ===
// Antigravity 스타일: 순백 뉴모픽 카드, 가로 배치
// 요청 #4: "GC 케어" → "GC케어" (띄어쓰기 제거)

import { Briefcase, Building2 } from 'lucide-react';
import { KPIData } from '../types';

interface KPICardsProps {
  kpi: KPIData;
}

export default function KPICards({ kpi }: KPICardsProps) {
  const cards = [
    {
      label: '전체 채용공고',
      value: kpi.totalActive,
      subLabel: '활성화된 포지션 총계',
      icon: <Briefcase className="w-6 h-6 text-gray-400" />,
    },
    {
      label: 'GC케어',
      value: kpi.gcCareCount,
      subLabel: '활성 채용 중',
      icon: <Building2 className="w-6 h-6 text-gray-400" />,
    },
    {
      label: 'GC메디아이',
      value: kpi.gcMediaiCount,
      subLabel: '활성 채용 중',
      icon: <Building2 className="w-6 h-6 text-gray-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className="neu-card px-7 py-6 flex items-center justify-between fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="space-y-1">
            <p className="text-[14px] font-semibold text-gray-900">{card.label}</p>
            <p className="text-[12px] text-gray-400 font-medium">{card.subLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[36px] font-bold text-gray-900 tracking-tighter leading-none">{card.value}</span>
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
