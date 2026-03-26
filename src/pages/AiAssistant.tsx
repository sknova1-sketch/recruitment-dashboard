import { useState, useMemo, useEffect } from 'react';
import { PageType } from '../App';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calculator, FileText, Sparkles, CalendarIcon, Info, RefreshCw } from 'lucide-react';

interface AiAssistantProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

/** 주말(토,일)일 경우 차주 월요일로 이동 */
function adjustToWeekday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() + 1); // 일 -> 월
  if (day === 6) d.setDate(d.getDate() + 2); // 토 -> 월
  return d;
}

/** 합류 시점: (기준일 + 21일) 후 다가오는 다음 월요일 */
function calcJoinDate(offerDate: Date): Date {
  const d = new Date(offerDate);
  d.setDate(d.getDate() + 21);
  const day = d.getDay();
  if (day !== 1) {
    const add = day === 0 ? 1 : (8 - day);
    d.setDate(d.getDate() + add);
  }
  return d;
}

export default function AiAssistant({ currentPage, onNavigate }: AiAssistantProps) {
  // === 계산기 상태 (localStorage) ===
  const [startDate, setStartDate] = useState<string>(() => localStorage.getItem('calcStartDate') || '');
  
  useEffect(() => {
    localStorage.setItem('calcStartDate', startDate);
  }, [startDate]);

  const calculatedSchedule = useMemo(() => {
    if (!startDate) return null;
    let current = new Date(startDate);
    
    // 서류 모집 (공고시작 + 14일)
    current.setDate(current.getDate() + 14);
    const recruitEnd = adjustToWeekday(current);
    
    // 1차 인터뷰 (서류모집 + 7일)
    current = new Date(recruitEnd);
    current.setDate(current.getDate() + 7);
    const interview1End = adjustToWeekday(current);
    
    // 2차 인터뷰 (1차 + 7일)
    current = new Date(interview1End);
    current.setDate(current.getDate() + 7);
    const interview2End = adjustToWeekday(current);

    // 합격자 발표 및 처우 협의 (2차 + 3일)
    current = new Date(interview2End);
    current.setDate(current.getDate() + 3);
    const offerEnd = adjustToWeekday(current);
    
    // 채용 적정 완료일 (2차 + 11일)
    current = new Date(interview2End);
    current.setDate(current.getDate() + 11);
    const targetCompletion = adjustToWeekday(current);
    
    // 합류 시점 (합격자 발표 + 3주 후 월요일)
    const joinDate = calcJoinDate(offerEnd);

    const formatDate = (d: Date) => d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

    return {
      recruitEnd: formatDate(recruitEnd),
      interview1End: formatDate(interview1End),
      interview2End: formatDate(interview2End),
      offerEnd: formatDate(offerEnd),
      targetCompletion: formatDate(targetCompletion),
      joinDate: formatDate(joinDate),
    };
  }, [startDate]);

  // === JD 코파일럿 상태 (localStorage) ===
  const [jdTeam, setJdTeam] = useState(() => localStorage.getItem('jdTeam') || '');
  const [jdRole, setJdRole] = useState(() => localStorage.getItem('jdRole') || '');
  const [jdRequirements, setJdRequirements] = useState(() => localStorage.getItem('jdRequirements') || '');
  const [jdPreferred, setJdPreferred] = useState(() => localStorage.getItem('jdPreferred') || '');
  const [jdDontList, setJdDontList] = useState(() => localStorage.getItem('jdDontList') || '');
  const [jdResult, setJdResult] = useState(() => localStorage.getItem('jdResult') || '');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('jdTeam', jdTeam);
    localStorage.setItem('jdRole', jdRole);
    localStorage.setItem('jdRequirements', jdRequirements);
    localStorage.setItem('jdPreferred', jdPreferred);
    localStorage.setItem('jdDontList', jdDontList);
    localStorage.setItem('jdResult', jdResult);
  }, [jdTeam, jdRole, jdRequirements, jdPreferred, jdDontList, jdResult]);

  const canGenerate = jdTeam.trim() || jdRole.trim() || jdRequirements.trim();

  const handleGenerateJD = () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setTimeout(() => {
      // ─── 파싱 헬퍼 ───────────────────────────────────────────────────
      const lines = (str: string) =>
        str.trim().split('\n').map(l => l.trim()).filter(Boolean);

      const teamLines   = lines(jdTeam);
      const roleLines   = lines(jdRole);
      const reqLines    = lines(jdRequirements);
      const prefLines   = lines(jdPreferred);
      const dontLines   = lines(jdDontList);

      // ─── 직무 타이틀 추론 (첫 번째 역할 키워드에서 추출) ─────────────
      const roleName = roleLines.length
        ? roleLines[0].replace(/[·\-·:.]/g, '').split(/\s+/).slice(0, 4).join(' ')
        : '담당자';

      // ─── 1. 포지션 소개 (직무의 의미와 기대 임팩트) ──────────────────
      const positionIntro = `\n\n📌 포지션 소개\n\
이 포지션은 단순한 실무 실행을 넘어, 조직의 핵심 성과를 직접 만들어내는 역할을 담당합니다.\
${roleLines.length ? `\n${roleName} 포지션은 ` + roleLines.slice(0, 2).join(', ') + ' 등의 핵심 영역에서 실질적인 비즈니스 임팩트를 창출합니다.' : ''}\
\n채용 완료 후 즉시 업무를 주도적으로 리드할 수 있는 분을 찾고 있으며, 함께 성장할 준비가 된 분을 환영합니다.`;

      // ─── 2. 팀 소개 (입력값 + 직무 맥락 기반 상세화) ─────────────────
      let teamSection = '';
      if (teamLines.length > 0 || roleLines.length > 0) {
        const teamDescRaw = teamLines.join(' ');
        const domainHint = reqLines.join(' ') + ' ' + roleLines.join(' ');
        const isDev = /개발|engineer|dev|backend|frontend|서버|api/i.test(domainHint);
        const isPlan = /기획|planner|product|pm|서비스기획/i.test(domainHint);
        const isData = /데이터|data|분석|analytics/i.test(domainHint);
        const isMarketing = /마케팅|marketing|퍼포먼스|캠페인/i.test(domainHint);
        const isBiz = /사업|영업|파트너십|biz|business/i.test(domainHint);

        const teamFlair = isDev
          ? '기술적 완성도와 실서비스 임팩트를 동시에 추구하는 팀으로, 코드 리뷰·A/B 테스트·지속적 개선 문화가 자리잡혀 있습니다.'
          : isPlan
          ? '데이터와 사용자 인사이트를 기반으로 제품 방향을 설계하고, 다양한 이해관계자와의 협업을 통해 서비스를 고도화하는 팀입니다.'
          : isData
          ? '비즈니스 의사결정을 데이터로 뒷받침하며, 분석→인사이트→실행의 사이클을 빠르게 돌리는 것을 지향하는 팀입니다.'
          : isMarketing
          ? '퍼포먼스 데이터를 기반으로 캠페인을 설계하고 지속적으로 최적화하며, 실질적인 성과 지표를 주도하는 팀입니다.'
          : isBiz
          ? '파트너·시장·고객을 연결하며 새로운 사업 기회를 발굴하고, 전략부터 실행까지 전 단계를 주도하는 팀입니다.'
          : '수평적 소통과 빠른 실행을 지향하며, 담당자가 스스로 문제를 정의하고 해결책을 제안할 수 있는 환경을 만들어가고 있습니다.';

        teamSection = `\n\n🏢 팀 소개\n${teamDescRaw ? teamDescRaw + '\n' : ''}${teamFlair}\n단순히 업무를 처리하는 것이 아닌, 팀이 나아가는 방향에 함께 기여하는 구성원을 찾고 있습니다.`;
      }

      // ─── 3. 주요 업무 (카테고리로 묶어 구조화) ───────────────────────
      let roleSection = '';
      if (roleLines.length > 0) {
        // 3줄 이하: 각 업무를 확장, 그 이상: 그룹핑
        if (roleLines.length <= 3) {
          const expanded = roleLines.map(task =>
            `  - ${task}`
          ).join('\n');
          roleSection = `\n\n💼 포지션 설명 및 주요 업무\n이 포지션은 아래 핵심 영역에서 실질적인 리더십을 발휘하게 됩니다.\n\n핵심 업무\n${expanded}\n  - 관련 유관 부서 및 외부 파트너와의 커뮤니케이션 및 협업\n  - 업무 성과 지표(KPI) 설정 및 주기적 결과 리뷰와 개선안 도출`;
        } else {
          const half = Math.ceil(roleLines.length / 2);
          const group1 = roleLines.slice(0, half).map(l => `  - ${l}`).join('\n');
          const group2 = roleLines.slice(half).map(l => `  - ${l}`).join('\n');
          roleSection = `\n\n💼 포지션 설명 및 주요 업무\n이 포지션은 다음 영역에서 실질적인 성과를 만들어내는 역할을 담당합니다.\n\n기획 및 실행\n${group1}\n\n운영 및 협업\n${group2}\n  - 유관 부서 및 파트너와의 원활한 커뮤니케이션\n  - 진행 현황 보고 및 개선 제안`;
        }
      }

      // ─── 4. 자격 요건 (입력값 + 채용 전문가 보완) ────────────────────
      let reqSection = '';
      if (reqLines.length > 0) {
        const reqBullets = reqLines.map(r => `  - ${r}`).join('\n');
        reqSection = `\n\n📋 자격 요건 (필수)\n아래 역량을 보유하신 분을 찾고 있습니다.\n${reqBullets}\n  - 스스로 우선순위를 설정하고 업무를 진행할 수 있는 자기 주도적 실행력\n  - 새로운 도구·방법론을 빠르게 습득하고 현업에 적용하는 학습 민첩성`;
      }

      // ─── 5. 우대 사항 ─────────────────────────────────────────────────
      let prefSection = '';
      if (prefLines.length > 0) {
        const prefBullets = prefLines.map(p => `  - ${p}`).join('\n');
        prefSection = `\n\n⭐ 우대 사항\n아래 경험이 있으시면 더욱 환영합니다.\n${prefBullets}\n  - AI 등 첨단 도구를 활용하여 업무 속도·품질을 향상시킨 경험\n  - 작은 가설을 빠르게 검증하고 결과를 팀에 공유한 경험`;
      }

      // ─── 6. 이런 분을 찾습니다 (타겟 인재상) ────────────────────────
      const domainForIdeal = (reqLines.join(' ') + roleLines.join(' ')).toLowerCase();
      const idealTraits = [
        '방향이 주어졌을 때 빠르게 실행으로 전환하고, 중간에 장애물이 생겨도 스스로 해결책을 찾아내는 분',
        '데이터와 사용자 피드백을 근거로 의사결정하고, 그 과정을 팀과 투명하게 공유하는 분',
        '\"완벽한 준비\" 보다 \"빠른 시도와 개선\"을 선호하며, 실패에서 배우는 것을 두려워하지 않는 분',
        /개발|api|서버/i.test(domainForIdeal)
          ? '코드 품질과 서비스 안정성에 자부심을 갖고, 동료 코드 리뷰를 통해 함께 성장하는 것을 즐기는 분'
          : '새로운 아이디어를 제안하는 것에 적극적이고, 실행 후 결과를 수치로 증명하는 데 익숙한 분',
      ];
      const idealSection = `\n\n🎯 이런 분을 찾습니다\n${idealTraits.map(t => `  - ${t}`).join('\n')}`;

      // ─── 7. 이 포지션과 맞지 않는 분 (Don't List) ────────────────────
      let dontSection = '';
      if (dontLines.length > 0) {
        const dontBullets = dontLines.map(d =>
          `  - ${d.replace(/^[-•·]?\s*/, '')}`
        ).join('\n');
        dontSection = `\n\n⚠️ 이 포지션은 이런 분과는 맞지 않아요\n아래에 해당하신다면 지원 전에 한 번 더 검토해 주시기 바랍니다.\n${dontBullets}\n  - 명확한 답이 정해진 업무 환경을 선호하시는 분 (이 포지션은 스스로 문제를 정의하고 답을 만들어나가야 합니다)`;
      }

      // ─── 최종 조합 ────────────────────────────────────────────────────
      const title = roleName ? `[ ${roleName} ]` : '[ 채용 공고 ]';
      setJdResult(
        `${title}${positionIntro}${teamSection}${roleSection}${reqSection}${prefSection}${idealSection}${dontSection}`
      );
      setIsGenerating(false);
    }, 1800);
  };

  const handleResetJD = () => {
    setJdTeam(''); setJdRole(''); setJdRequirements(''); setJdPreferred(''); setJdDontList(''); setJdResult('');
  };

  const inputClass = "w-full p-3.5 bg-gray-50 border-2 border-transparent rounded-xl text-[13px] font-medium text-gray-900 outline-none focus:bg-white focus:border-gray-900 transition-all resize-none placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center w-full">
      <div className="w-full max-w-[1500px]">
        <Header currentPage={currentPage} onNavigate={onNavigate} />
      </div>

      <main className="w-full max-w-[1500px] mx-auto px-6 py-10 flex flex-col items-center">
        
        {/* 상단 타이틀 */}
        <div className="w-full text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-5 group cursor-default">
             <Sparkles className="w-4 h-4 text-[#E8603C] group-hover:scale-110 transition-transform" />
             <span className="text-sm font-bold text-[#E8603C] tracking-tight">For Hiring Managers</span>
          </div>
          <h2 className="text-[36px] font-bold text-gray-900 tracking-tight leading-tight mb-4">
            현업을 위한 AI 채용 도우미
          </h2>
          <p className="text-[15px] text-gray-400 font-medium mx-auto leading-normal whitespace-nowrap">
            데이터에 기반한 예상 합류일 계산부터 직무 기술서 자동 초안 작성까지, 성공적인 인재 영입을 위한 스마트한 의사결정을 지원합니다.
          </p>
          <br /><br /><br />
        </div>

        {/* ===== 좌우 2컬럼 배치: JD(좌) + 계산기(우) ===== */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ===== 좌측: JD 코파일럿 ===== */}
          <div className="flex flex-col gap-6">
            <section className="neu-card p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                <FileText className="w-48 h-48 text-gray-900 translate-x-24 -translate-y-24" />
              </div>
              
              <div className="flex items-start justify-between border-b border-gray-50 pb-5 mb-6 relative z-10 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[18px] font-bold text-gray-900 tracking-tight mb-1 text-left">AI 직무 기술서(JD) 코파일럿</h3>
                    <p className="text-gray-400 font-medium text-[13px] text-left">편하게 생각나는 내용들을 작성해 주세요.</p>
                  </div>
                </div>
                <button 
                  onClick={handleResetJD}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  초기화
                </button>
              </div>

              {/* 5개 입력 섹션 */}
              <div className="flex flex-col gap-3.5 relative z-10 text-left">
                <div className="text-left">
                  <label className="text-[17px] font-semibold text-gray-900 mb-2 block text-left">
                    <span className="text-violet-500 mr-2 font-bold">1.</span>소속 팀에 대하여 설명해주세요.
                  </label>
                  <textarea value={jdTeam} onChange={(e) => setJdTeam(e.target.value)}
                    placeholder="예: EMR개발팀은 병원 전자의무기록 시스템을 개발하는 팀입니다..." rows={2} className={inputClass} />
                </div>
                <div className="text-left">
                  <label className="text-[17px] font-semibold text-gray-900 mb-2 block text-left">
                    <span className="text-violet-500 mr-2 font-bold">2.</span>직무명과 해야하는 일에 대하여 설명해주세요.
                  </label>
                  <textarea value={jdRole} onChange={(e) => setJdRole(e.target.value)}
                    placeholder="예: 백엔드 개발자. Java/Spring 기반 API 설계 및 개발..." rows={2} className={inputClass} />
                </div>
                <div className="text-left">
                  <label className="text-[17px] font-semibold text-gray-900 mb-2 block text-left">
                    <span className="text-violet-500 mr-2 font-bold">3.</span>필수 요구사항을 작성해주세요.
                  </label>
                  <textarea value={jdRequirements} onChange={(e) => setJdRequirements(e.target.value)}
                    placeholder="예: Java/Spring 경력 3년 이상, REST API 설계 경험 필수..." rows={2} className={inputClass} />
                </div>
                <div className="text-left">
                  <label className="text-[17px] font-semibold text-gray-900 mb-2 block text-left">
                    <span className="text-violet-500 mr-2 font-bold">4.</span>우대사항을 작성해주세요.
                  </label>
                  <textarea value={jdPreferred} onChange={(e) => setJdPreferred(e.target.value)}
                    placeholder="예: MSA 경험, 의료/헬스케어 도메인 경험, AWS 인프라 운영..." rows={2} className={inputClass} />
                </div>
                <div className="text-left">
                  <label className="text-[17px] font-semibold text-gray-900 mb-2 block text-left">
                    <span className="text-violet-500 mr-2 font-bold">5.</span>이런 사람은 해당 직무 또는 우리 팀과 잘 맞지 않는 부분을 작성해주세요. <span className="text-gray-500 font-normal text-[15px]">(Don't List)</span>
                  </label>
                  <textarea value={jdDontList} onChange={(e) => setJdDontList(e.target.value)}
                    placeholder="예: 주도적으로 일하기보다 지시만 기다리는 분..." rows={2} className={inputClass} />
                </div>

                <button 
                  onClick={handleGenerateJD}
                  disabled={!canGenerate || isGenerating}
                  className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white text-[15px] font-semibold transition-all disabled:opacity-30 hover:from-violet-700 hover:via-indigo-700 hover:to-purple-700 active:scale-[0.99] shadow-lg shadow-violet-200/50 mt-2"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />초안 생성 중...</span>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>초안 생성하기</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {jdResult && (
              <section className="neu-card p-8 fade-in text-left">
                <h4 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  생성된 JD 초안
                </h4>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 whitespace-pre-wrap text-[13px] text-gray-700 font-medium leading-relaxed shadow-sm text-left">
                  {jdResult}
                </div>
              </section>
            )}
          </div>

          {/* ===== 우측: 채용 소요일 계산기 ===== */}
          <div className="flex flex-col gap-6 text-left">
            <section className="neu-card p-8 text-left">
              <div className="flex items-start gap-4 border-b border-gray-50 pb-5 mb-6 text-left">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-[18px] font-bold text-gray-900 tracking-tight mb-1 text-left">채용 적정 소요일 계산기</h3>
                  <p className="text-gray-400 font-medium text-[13px] text-left">채용 시작일을 선택하면 예상 합류 일정까지 자동으로 계산해 드립니다.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-6 text-left">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] ml-1 text-left">채용 공고 시작 예정일</label>
                <div className="relative group text-left">
                  {/* 주황색 좌측 아이콘 (뒤에 깔림) */}
                  <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-[22px] h-[22px] text-orange-500 pointer-events-none z-0" />
                  {/* 실제 input. picker-indicator를 좌측으로 절대위치 + 투명도0, 우측 공간 확보 */}
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full pl-[98px] py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-[16px] font-semibold outline-none focus:bg-white focus:border-gray-200 transition-all text-left
                               [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-5 [&::-webkit-calendar-picker-indicator]:w-7 [&::-webkit-calendar-picker-indicator]:h-7 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0
                               [&::-webkit-datetime-edit]:pl-8 ${startDate ? 'text-gray-900' : 'text-transparent'}`}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  <h4 className="text-[13px] font-bold text-gray-700 tracking-wide">이용 안내</h4>
                </div>
                <ul className="space-y-2.5 text-[13px] text-gray-600 leading-relaxed text-left">
                  <li className="flex gap-2">
                    <span className="text-gray-500 shrink-0">•</span>
                    <span>본 시뮬레이션은 우리 조직의 과거 채용 데이터를 기반으로 설계되었습니다.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-500 shrink-0">•</span>
                    <span>산출된 일정은 <strong className="text-gray-800">'단일 채용 사이클(1 Cycle)'</strong>이 성공적으로 완료됨을 가정하며, 인터뷰 단계에서 적격자 미선발 등의 사유로 채용이 재진행될 경우 일정은 순차적으로 지연될 수 있습니다.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-500 shrink-0">•</span>
                    <span>안정적인 인력 확보를 위한 <strong className="text-gray-800">'채용 적정 완료일'</strong>은 리스크 관리 및 인재 풀 확보를 고려하여 통상 <strong className="text-gray-800">2.5 사이클(약 40일)</strong>의 기간을 두고 채용을 계획 하시는 것을 권장합니다.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-500 shrink-0">•</span>
                    <span><strong className="text-gray-800">2.5 사이클(Cycle)의 의미</strong></span>
                  </li>
                </ul>
                <div className="ml-4 space-y-1.5 text-[12px] text-gray-500 leading-relaxed text-left">
                  <p><strong className="text-gray-700">1 Cycle (1.0)</strong>: 첫 번째 공고에서 바로 채용에 성공하는 경우 (가장 이상적)</p>
                  <p><strong className="text-gray-700">2 Cycles (2.0)</strong>: 첫 번째 후보자군에서 적격자가 없어 공고를 재개하거나 타겟팅을 수정할 경우</p>
                  <p><strong className="text-gray-700">0.5 Cycle (+0.5)</strong>: 최종 합격자의 처우 협의 결렬이나 입사 포기 등 돌발 변수에 대비한 완충 기간</p>
                </div>
              </div>
            </section>

            {calculatedSchedule && (
              <section className="neu-card p-8 fade-in text-left">
                <br />
                <h4 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  예상 합류 타임라인
                </h4>
                <div className="flex flex-col space-y-6 relative before:absolute before:inset-y-0 before:left-[13px] before:w-[2px] before:bg-gray-100 text-left">
                  
                  {[
                    { label: '서류 모집', date: calculatedSchedule.recruitEnd, sub: '+ 14일' },
                    { label: '1차 인터뷰', date: calculatedSchedule.interview1End, sub: '+ 7일' },
                    { label: '2차 인터뷰', date: calculatedSchedule.interview2End, sub: '+ 7일' },
                    { label: '합격자 발표 및 처우 협의', date: calculatedSchedule.offerEnd, sub: '+ 3일' },
                    { label: '채용 적정 완료일', date: calculatedSchedule.targetCompletion, sub: '+ 11일' },
                  ].map((item) => (
                    <div key={item.label} className="grid grid-cols-[28px_1fr] gap-5 relative z-10 items-start text-left">
                      <div className="w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center ring-4 ring-gray-50 shadow-sm shrink-0" />
                      <div className="flex flex-col pt-0.5 text-left">
                        <p className="text-[13px] font-bold text-[#E8603C] mb-0.5 text-left">{item.label}</p>
                        <p className="text-[17px] font-bold text-gray-900 leading-tight tracking-tight text-left">{item.date}</p>
                        <br />
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-[28px_1fr] gap-5 relative z-10 pt-3 items-center text-left">
                    <div className="w-11 h-11 -ml-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center ring-6 ring-orange-50 shadow-lg shadow-orange-300/20 shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col text-left">
                      <p className="text-[11px] font-bold text-[#E8603C] mb-1 flex items-center gap-2 text-left">
                        <span className="px-2 py-0.5 rounded bg-orange-50 text-[10px] tracking-widest text-[#E8603C]">합류 시점</span>
                        <span className="text-[10px] text-orange-400 font-medium">(통상 3주 기간 부여)</span>
                      </p>
                      <p className="text-[32px] font-bold text-[#E8603C] leading-none tracking-tighter text-left">{calculatedSchedule.joinDate}</p>
                      <p className="text-[11px] text-[#E8603C]/50 mt-1 text-left">합격자 발표 후 3주 뒤 월요일 (모든 단계 영업일 보정됨)</p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

        </div>
        <Footer />
      </main>
    </div>
  );
}
