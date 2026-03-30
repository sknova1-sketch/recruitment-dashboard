import { useState } from 'react';
import { Search, Settings, Calendar } from 'lucide-react';
import { PageType } from '../App';
import AdminModal from './AdminModal';

interface HeaderProps {
  onSearch?: (value: string) => void;
  searchValue?: string;
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export default function Header({ onSearch, searchValue, currentPage, onNavigate }: HeaderProps) {
  const [adminOpen, setAdminOpen] = useState(false);

  const now = new Date();
  const day = now.getDate();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekday = weekdays[now.getDay()];
  const month = months[now.getMonth()];

  return (
    <>
      <header className="w-full sticky top-0 z-50">
        <div className="neu-card mx-6 mt-5 mb-2 px-8 py-5 flex items-center justify-between gap-5">

          {/* 좌측: GC 로고 + 타이틀 */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <img src="/gc-logo.png" alt="GC" className="w-11 h-11 rounded-xl object-contain" />
            <div>
              <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Recruitment Dashboard</p>
              <h1 className="text-[18px] font-bold text-gray-900 tracking-tight leading-tight">채용 운영 대시보드</h1>
            </div>
          </div>

          {/* 중앙 좌측: 날짜 */}
          <div className="hidden md:flex items-center gap-3 px-5 py-3 rounded-xl bg-gray-50 border border-gray-100">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-[22px] font-bold text-gray-900 leading-none">{day}</span>
            <span className="text-[12px] text-gray-400 font-medium">{weekday}, {month}</span>
          </div>

          {/* 중앙: 스위치 토글 (배경 고정, 흔들림 없음) */}
          <div className="flex-1 flex justify-center">
            <div className="bg-gray-100 rounded-full p-1 flex items-center" style={{ width: '320px' }}>
              {/* 대시보드 버튼 - AI 도우미와 완전히 동일한 보라색 글로우 이펙트 적용 */}
              <button
                onClick={() => onNavigate('dashboard')}
                className={`rounded-full py-2.5 text-[13px] font-semibold transition-all duration-300 relative z-10 ${
                  currentPage === 'dashboard'
                    ? 'bg-white text-gray-900 shadow-[0_0_15px_rgba(139,92,246,0.25)] ring-1 ring-violet-200'
                    : 'bg-transparent text-gray-400 hover:text-gray-600'
                }`}
                style={{ width: '156px' }}
              >
                대시보드
              </button>
              {/* AI 도우미 버튼 - 은은한 보라색 그라데이션 테두리(glowing effect) */}
              <button
                onClick={() => onNavigate('ai-assistant')}
                className={`rounded-full py-2.5 text-[13px] font-semibold transition-all duration-300 relative z-10 ${
                  currentPage === 'ai-assistant'
                    ? 'bg-white text-gray-900 shadow-[0_0_15px_rgba(139,92,246,0.25)] ring-1 ring-violet-200'
                    : 'bg-transparent text-gray-400 hover:text-gray-600'
                }`}
                style={{ width: '156px' }}
              >
                AI채용 도우미
              </button>
            </div>
          </div>

          {/* 우측: 검색 + 톱니바퀴 */}
          <div className="flex items-center gap-3">
            {onSearch !== undefined && (
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={searchValue || ''}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-[44px] pr-4 py-2.5 w-[170px] bg-gray-50 text-gray-700 placeholder:text-gray-300 rounded-xl text-[13px] border border-gray-100 outline-none focus:bg-white focus:ring-2 focus:ring-gray-200 transition-all"
                />
              </div>
            )}

            <button 
              onClick={() => setAdminOpen(true)}
              className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
            >
              <Settings className="w-[18px] h-[18px]" />
            </button>
          </div>

        </div>
      </header>

      <AdminModal isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}
