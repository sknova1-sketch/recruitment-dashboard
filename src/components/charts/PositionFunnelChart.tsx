// === 커스텀 SVG 채용 단계 퍼널 차트 ===
// 요청 #4: 하단 건수 사이 퍼센트 전환율 배지 모두 삭제

import { useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';

export interface FunnelData {
  stage: string;
  count: number;
  avgDays: number;
}

interface PositionFunnelChartProps {
  data: FunnelData[];
}

export default function PositionFunnelChart({ data }: PositionFunnelChartProps) {
  const stepsCount = data.length;
  
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  const viewBoxWidth = 1000;
  const viewBoxHeight = 220;
  const columnWidth = viewBoxWidth / stepsCount;
  const yCenter = viewBoxHeight / 2;
  const maxFunnelHeight = 160;
  const minFunnelHeight = 16;

  const points = useMemo(() => {
    return data.map((item, index) => {
      const centerX = (index + 0.5) * columnWidth;
      const height = (item.count / maxCount) * maxFunnelHeight;
      const actualHeight = Math.max(height, minFunnelHeight);
      
      return {
        x: centerX,
        topY: yCenter - (actualHeight / 2),
        bottomY: yCenter + (actualHeight / 2),
        count: item.count,
        stage: item.stage,
        avgDays: item.avgDays
      };
    });
  }, [data, columnWidth, maxCount, maxFunnelHeight, minFunnelHeight]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';

    let d = `M 0 ${points[0].topY}`;
    d += ` L ${points[0].x} ${points[0].topY}`; 

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const cpX1 = current.x + (next.x - current.x) * 0.4;
      const cpX2 = next.x - (next.x - current.x) * 0.4;
      d += ` C ${cpX1} ${current.topY}, ${cpX2} ${next.topY}, ${next.x} ${next.topY}`;
    }
    
    const lastPoint = points[points.length - 1];
    d += ` L ${viewBoxWidth} ${lastPoint.topY}`;
    d += ` L ${viewBoxWidth} ${lastPoint.bottomY}`;
    d += ` L ${lastPoint.x} ${lastPoint.bottomY}`;

    for (let i = points.length - 2; i >= 0; i--) {
      const current = points[i + 1];
      const next = points[i];
      const cpX1 = current.x - (current.x - next.x) * 0.4;
      const cpX2 = next.x + (current.x - next.x) * 0.4;
      d += ` C ${cpX1} ${current.bottomY}, ${cpX2} ${next.bottomY}, ${next.x} ${next.bottomY}`;
    }

    d += ` L 0 ${points[0].bottomY} Z`;
    return d;
  }, [points, viewBoxWidth]);

  return (
    <div className="neu-card p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[16px] font-bold text-gray-900 tracking-tight">채용 단계 퍼널</h3>
          <p className="text-[12px] text-gray-400 mt-0.5 font-medium">현재 활성화된 포지션 기준</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          상세 필터
        </button>
      </div>

      <div className="relative w-full pt-2 pb-4">
        
        {/* 상단 라벨 (단계명만) */}
        <div className="flex w-full mb-5">
          {points.map((p, i) => (
            <div key={`header-${i}`} className="flex-1 flex flex-col items-center justify-end text-center relative z-10" style={{ height: '36px' }}>
              {i > 0 && (
                <div className="absolute left-0 top-0 bottom-[-220px] w-px bg-gray-100/50 pointer-events-none" />
              )}
              <h4 className="text-[13px] font-semibold text-gray-800">
                {p.stage}
              </h4>
            </div>
          ))}
        </div>

        {/* SVG 퍼널 그래픽 - 신비로운 인디고/바이올렛 그라데이션 */}
        <div className="relative w-full" style={{ aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}` }}>
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full absolute inset-0 z-0"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="funnel-gradient-mystic" x1="0" y1="0" x2={viewBoxWidth} y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#312e81" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#4c1d95" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#6d28d9" stopOpacity="0.65" />
                <stop offset="75%" stopColor="#8b5cf6" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="funnel-highlight" x1="0" y1="0" x2="0" y2={viewBoxHeight} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.3" />
                <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                <stop offset="100%" stopColor="#312e81" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path d={pathD} fill="url(#funnel-gradient-mystic)" />
            <path d={pathD} fill="url(#funnel-highlight)" />
          </svg>

          {/* 퍼널 내부 세로 구분선만 */}
          <div className="absolute inset-0 flex w-full h-full items-center z-10">
            {points.map((_p, i) => (
              <div key={`overlay-${i}`} className="flex-1 flex items-center justify-center relative h-full">
                {i > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/20" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 라벨 (건수만, 퍼센트 전환율 배지 완전 삭제) */}
        <div className="flex w-full mt-5 relative items-center">
          {points.map((p, i) => (
            <div key={`footer-${i}`} className="flex-1 flex flex-col items-center relative">
              <p className="text-[14px] font-bold text-gray-800">{p.count}건</p>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
