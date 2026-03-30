import { useState } from 'react';
import { PageType } from '../App';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calculator, FileText, Sparkles, CalendarIcon, Clock, RefreshCw, Plus, Copy, Check, ChevronDown, Briefcase, Users, Building2 } from 'lucide-react';

interface AiAssistantProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

/* ── 영업일 계산 유틸 ── */
function addWeekdays(base: Date, days: number): Date {
  const d = new Date(base);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

/* ── 타임라인 스텝 정의 ── */
const TIMELINE = [
  { label: '공고 오픈', days: 0, emoji: '📋', bg: 'bg-blue-500' },
  { label: '서류 마감', days: 14, emoji: '📝', bg: 'bg-indigo-500' },
  { label: '서류 합격 발표', days: 17, emoji: '✅', bg: 'bg-violet-500' },
  { label: '1차 면접', days: 21, emoji: '🗣', bg: 'bg-purple-500' },
  { label: '최종 면접', days: 28, emoji: '🎯', bg: 'bg-pink-500' },
  { label: '처우 협의', days: 32, emoji: '💼', bg: 'bg-rose-500' },
  { label: '최종 합격 발표', days: 35, emoji: '🎉', bg: 'bg-orange-500' },
  { label: '입사 예정일', days: 56, emoji: '🚀', bg: 'bg-emerald-500' },
];

/* ── JD 템플릿 생성기 ── */
function buildJD(title: string, team: string, dept: string, empType: string, resp: string, req: string): string {
  const lines: string[] = [];
  lines.push(`[${empType}] ${title}`);
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push('▎ 팀 소개');
  if (team || dept) {
    lines.push(`${team || ''}${dept ? ` / ${dept}` : ''}에서 함께할 동료를 찾습니다.`);
  }
  lines.push('우리 팀은 구성원이 주도적으로 일하며, 빠르게 성장하는 환경을 지향합니다.');
  lines.push('');
  lines.push('▎ 이런 일을 합니다');
  if (resp.trim()) {
    resp.split('\n').filter(Boolean).forEach(l => {
      const line = l.replace(/^[-•]\s*/, '').trim();
      if (line) lines.push(`  • ${line}`);
    });
  } else {
    lines.push('  • 주요 업무를 입력해주세요');
  }
  lines.push('');
  lines.push('▎ 이런 분을 찾습니다');
  if (req.trim()) {
    req.split('\n').filter(Boolean).forEach(l => {
      const line = l.replace(/^[-•]\s*/, '').trim();
      if (line) lines.push(`  • ${line}`);
    });
  } else {
    lines.push('  • 자격 요건을 입력해주세요');
  }
  lines.push('');
  lines.push('▎ 근무 조건');
  lines.push(`  • 고용 형태: ${empType}`);
  lines.push('  • 근무지: 경기도 용인시 (GC녹십자 본사)');
  lines.push('  • 복리후생: 4대 보험, 연차, 경조사 지원, 사내 식당');
  lines.push('');
  lines.push('▎ 지원 방법');
  lines.push('  채용 페이지를 통해 이력서 및 자기소개서를 제출해주세요.');
  lines.push('  서류 접수 후 개별 안내 드립니다.');
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return lines.join('\n');
}

/* ════════════════════════════════════════════════════════════ */
export default function AiAssistant({ currentPage, onNavigate }: AiAssistantProps) {

  /* ── JD Copilot state ── */
  const [jdTitle, setJdTitle] = useState('');
  const [jdTeam, setJdTeam] = useState('');
  const [jdDept, setJdDept] = useState('');
  const [jdEmpType, setJdEmpType] = useState('정규직');
  const [jdResp, setJdResp] = useState('');
  const [jdReq, setJdReq] = useState('');
  const [jdResult, setJdResult] = useState('');
  const [jdLoading, setJdLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ── Timeline Calculator state ── */
  const [openDate, setOpenDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeline, setTimeline] = useState<{ label: string; date: Date; days: number; emoji: string; bg: string }[]>([]);

  /* ── handlers ── */
  const handleGenerate = async () => {
    if (!jdTitle.trim()) return;
    setJdLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setJdResult(buildJD(jdTitle, jdTeam, jdDept, jdEmpType, jdResp, jdReq));
    setJdLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jdResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCalc = () => {
    const base = new Date(openDate);
    setTimeline(TIMELINE.map(s => ({ ...s, date: s.days === 0 ? base : addWeekdays(base, s.days) })));
  };

  /* ── 공통 스타일 ── */
  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-[13px] font-medium text-gray-900 outline-none focus:ring-2 focus:ring-offset-1 transition-all placeholder:text-gray-300';
  const labelCls = 'block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Header currentPage={currentPage} onNavigate={onNavigate} />

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-6 py-8">

        {/* ── 페이지 타이틀 ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-bold text-violet-600">AI 채용 도우미</span>
          </div>
          <h1 className="text-[22px] font-extrabold text-gray-900 leading-tight">채용 업무를 AI로 더 빠르게</h1>
          <p className="text-[13px] text-gray-400 mt-1.5 leading-relaxed">JD 초안 자동 생성과 채용 일정 계산으로 준비 시간을 절약하세요.</p>
        </div>

        {/* ── 2컬럼 그리드 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ═══ LEFT: JD 코파일럿 ═══ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">

            {/* 카드 헤더 */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-[18px] h-[18px] text-violet-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-extrabold text-gray-900 leading-snug">AI 직무기술서(JD) 코파일럿</h2>
                  <p className="text-[12px] text-gray-400 mt-0.5">포지션 정보를 입력하면 JD 초안을 자동 생성합니다</p>
                </div>
              </div>
            </div>

            {/* 입력 폼 */}
            <div className="p-6 space-y-4">
              {/* 직무명 (필수) */}
              <div>
                <label className={labelCls}>직무명 <span className="text-rose-400">*</span></label>
                <input value={jdTitle} onChange={e => setJdTitle(e.target.value)}
                  placeholder="예: 백엔드 개발자, HR Business Partner"
                  className={`${inputCls} focus:ring-violet-400`} />
              </div>

              {/* 팀 / 부서 2열 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>팀</label>
                  <input value={jdTeam} onChange={e => setJdTeam(e.target.value)}
                    placeholder="예: 기업문화팀"
                    className={`${inputCls} focus:ring-violet-400`} />
                </div>
                <div>
                  <label className={labelCls}>부서</label>
                  <input value={jdDept} onChange={e => setJdDept(e.target.value)}
                    placeholder="예: 경영지원본부"
                    className={`${inputCls} focus:ring-violet-400`} />
                </div>
              </div>

              {/* 고용 형태 */}
              <div>
                <label className={labelCls}>고용 형태</label>
                <div className="flex gap-2">
                  {['정규직', '계약직', '인턴'].map(t => (
                    <button key={t} onClick={() => setJdEmpType(t)}
                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                        jdEmpType === t
                          ? 'bg-violet-600 text-white shadow-[0_2px_8px_rgba(139,92,246,0.3)]'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 border border-gray-100'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 주요 업무 */}
              <div>
                <label className={labelCls}>주요 담당 업무</label>
                <textarea value={jdResp} onChange={e => setJdResp(e.target.value)} rows={3}
                  placeholder={"한 줄에 하나씩 작성하세요\n예: 채용 프로세스 기획 및 운영\n    온보딩 프로그램 설계"}
                  className={`${inputCls} focus:ring-violet-400 resize-none leading-relaxed`} />
              </div>

              {/* 자격 요건 */}
              <div>
                <label className={labelCls}>자격 요건</label>
                <textarea value={jdReq} onChange={e => setJdReq(e.target.value)} rows={3}
                  placeholder={"한 줄에 하나씩 작성하세요\n예: 해당 분야 3년 이상 경력\n    관련 자격증 보유자 우대"}
                  className={`${inputCls} focus:ring-violet-400 resize-none leading-relaxed`} />
              </div>

              {/* 생성 버튼 */}
              <button onClick={handleGenerate} disabled={!jdTitle.trim() || jdLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-purple-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_2px_12px_rgba(139,92,246,0.25)]">
                {jdLoading
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> 생성 중...</>
                  : <><Sparkles className="w-4 h-4" /> JD 초안 생성</>}
              </button>
            </div>

            {/* 결과 영역 */}
            {jdResult && (
              <div className="border-t border-gray-100">
                <div className="flex items-center justify-between px-6 py-3 bg-violet-50/60">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[12px] font-bold text-violet-700">JD 초안 생성 완료</span>
                  </div>
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-violet-200 text-[11px] font-bold text-violet-600 hover:bg-violet-50 transition-all">
                    {copied ? <><Check className="w-3 h-3" /> 복사됨</> : <><Copy className="w-3 h-3" /> 복사</>}
                  </button>
                </div>
                <div className="px-6 py-5">
                  <pre className="text-[12.5px] leading-[1.8] text-gray-700 whitespace-pre-wrap font-[Pretendard,system-ui,sans-serif] tracking-tight max-h-[400px] overflow-y-auto">
                    {jdResult}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* ═══ RIGHT: 채용 소요일 계산기 ═══ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">

            {/* 카드 헤더 */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-[18px] h-[18px] text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-[15px] font-extrabold text-gray-900 leading-snug">채용 적정 소요일 계산기</h2>
                  <p className="text-[12px] text-gray-400 mt-0.5">공고 오픈일 기준 전체 채용 일정을 자동 산출합니다</p>
                </div>
              </div>
            </div>

            {/* 입력 */}
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>공고 오픈 예정일</label>
                <input type="date" value={openDate} onChange={e => setOpenDate(e.target.value)}
                  className={`${inputCls} focus:ring-emerald-400`} />
              </div>

              <button onClick={handleCalc}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-[0_2px_12px_rgba(16,185,129,0.25)]">
                <CalendarIcon className="w-4 h-4" />
                일정 계산하기
              </button>
            </div>

            {/* 타임라인 결과 */}
            {timeline.length > 0 ? (
              <div className="border-t border-gray-100 px-6 py-5">
                {/* 총 소요 기간 요약 */}
                <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span className="text-[12px] font-extrabold text-emerald-700">총 소요 기간</span>
                  </div>
                  <p className="text-[20px] font-black text-emerald-800 leading-tight">
                    약 {timeline[timeline.length - 1].days}영업일
                    <span className="text-[13px] font-semibold text-emerald-500 ml-2">
                      (약 {Math.ceil(timeline[timeline.length - 1].days * 1.4)}일)
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-500 mt-1">주말 제외 기준 · 면접 일정에 따라 변동 가능</p>
                </div>

                {/* 스텝 리스트 */}
                <div className="space-y-2">
                  {timeline.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 group">
                      {/* 원형 아이콘 */}
                      <div className="relative flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-full ${step.bg} flex items-center justify-center shadow-sm flex-shrink-0`}>
                          <span className="text-[14px] leading-none">{step.emoji}</span>
                        </div>
                        {i < timeline.length - 1 && (
                          <div className="w-px h-3 bg-gray-200 mt-0.5" />
                        )}
                      </div>
                      {/* 내용 */}
                      <div className="flex-1 flex items-center justify-between py-2.5 px-4 rounded-xl bg-gray-50/80 group-hover:bg-gray-100/80 transition-colors min-w-0">
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-gray-800 truncate">{step.label}</p>
                          {step.days > 0 && (
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">오픈 후 +{step.days}영업일</p>
                          )}
                        </div>
                        <span className="text-[12px] font-semibold text-gray-600 flex-shrink-0 ml-3 tabular-nums">
                          {fmtDate(step.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-6 pb-10 pt-6">
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <CalendarIcon className="w-6 h-6 text-gray-200" />
                  </div>
                  <p className="text-[13px] text-gray-300 font-semibold leading-relaxed">오픈 예정일을 선택하고<br/>계산하기 버튼을 눌러보세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
