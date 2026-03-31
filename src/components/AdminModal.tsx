// === 관리자 모달 (확장: 채용현황 + 포지션 관리) ===
// 수정: 오픈일 필드 추가, 삭제 버그 수정(상태 기반 확인), 별 즐겨찾기 아이콘

import { useState, useEffect } from 'react';
import { X, Lock, Save, LogOut, Plus, Trash2, Edit3, ChevronDown, Star } from 'lucide-react';
import { useAdmin, HiringStats, STAGE_ORDER, COMPANIES } from '../store/adminStore';
import { Position, Company, StageType } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'hiring' | 'positions' | 'closed';

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const { hiringStats, updateHiringStats, isAuthenticated, login, logout, sortedPositions, addPosition, updatePosition, deletePosition, favorites, toggleFavorite } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [editStats, setEditStats] = useState<HiringStats>(hiringStats);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>('positions');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  // 삭제 확인용 상태 (window.confirm 대신 상태 기반으로 변경 - 모달 오버레이 충돌 방지)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEditStats(hiringStats);
      setPassword('');
      setError('');
      setSaved(false);
      setEditingId(null);
      setShowAddForm(false);
      setDeleteConfirmId(null);
    }
  }, [isOpen, hiringStats]);

  if (!isOpen) return null;

  const handleLogin = () => {
    if (login(password)) setError('');
    else { setError('비밀번호가 틀렸습니다.'); setPassword(''); }
  };

  const handleSaveStats = () => {
    const updated: HiringStats = {
      ...editStats,
      gcCare: { ...editStats.gcCare, total: editStats.gcCare.fulltime + editStats.gcCare.contract + editStats.gcCare.intern },
      gcMediai: { ...editStats.gcMediai, total: editStats.gcMediai.fulltime + editStats.gcMediai.contract + editStats.gcMediai.intern },
      totalFulltime: editStats.gcCare.fulltime + editStats.gcMediai.fulltime,
      totalContract: editStats.gcCare.contract + editStats.gcMediai.contract,
      totalIntern: editStats.gcCare.intern + editStats.gcMediai.intern,
      grandTotal: editStats.gcCare.fulltime + editStats.gcCare.contract + editStats.gcCare.intern + editStats.gcMediai.fulltime + editStats.gcMediai.contract + editStats.gcMediai.intern,
    };
    updateHiringStats(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateStatsField = (company: 'gcCare' | 'gcMediai', field: 'fulltime' | 'contract' | 'intern', value: number) => {
    setEditStats(prev => ({ ...prev, [company]: { ...prev[company], [field]: value } }));
  };

  // 삭제 확인 (상태 기반 - window.confirm 사용 안함)
  const confirmDelete = (id: string) => {
    deletePosition(id);
    setDeleteConfirmId(null);
  };

  return (
    <>
      {/* 오버레이 - deleteConfirmId가 있을 땐 닫기 방지 */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]" onClick={() => { if (!deleteConfirmId) onClose(); }} />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[680px] max-h-[85vh] overflow-hidden neu-card p-0 flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-[16px] font-bold text-gray-900">관리자 설정</h3>
          </div>
          <button onClick={() => { onClose(); logout(); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-[15px] font-semibold text-gray-900">관리자 비밀번호를 입력하세요</p>
              <p className="text-[13px] text-gray-400">채용 현황 데이터를 수정하려면 인증이 필요합니다.</p>
            </div>
            <div className="flex gap-3 justify-center">
              {[0, 1, 2, 3].map((i) => (
                <input key={i} type="password" maxLength={1} value={password[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!/^\d?$/.test(val)) return;
                    const newPw = password.split(''); newPw[i] = val; setPassword(newPw.join(''));
                    if (val && i < 3) { const next = e.target.parentElement?.children[i + 1] as HTMLInputElement; next?.focus(); }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !password[i] && i > 0) { const prev = (e.target as HTMLElement).parentElement?.children[i - 1] as HTMLInputElement; prev?.focus(); }
                    if (e.key === 'Enter' && password.length === 4) handleLogin();
                  }}
                  className="w-14 h-16 rounded-xl bg-gray-50 border-2 border-gray-200 text-center text-2xl font-bold text-gray-900 outline-none focus:border-gray-900 transition-colors"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            {error && <p className="text-center text-red-500 text-[13px] font-medium">{error}</p>}
            <button onClick={handleLogin} disabled={password.length !== 4}
              className="w-full py-4 rounded-xl bg-gray-900 text-white font-semibold text-[14px] disabled:opacity-30 hover:bg-gray-800 transition-colors">
              확인
            </button>
          </div>
        ) : (
          <>
            {/* 탭 헤더 (텍스트형 -> 녹색 둥근 버튼형으로 개선) */}
            <div className="flex border-b border-gray-100 px-5 py-3 flex-shrink-0 gap-3">
              <button onClick={() => setTab('positions')}
                className={`px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-300 ${
                  tab === 'positions' 
                    ? 'bg-white text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-300' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                포지션 현황
              </button>
              <button onClick={() => setTab('closed')}
                className={`px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-300 ${
                  tab === 'closed' 
                    ? 'bg-white text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-300' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                채용 완료(Closed)
              </button>
              <button onClick={() => setTab('hiring')}
                className={`px-4 py-2 text-[13px] font-bold rounded-full transition-all duration-300 ${
                  tab === 'hiring' 
                    ? 'bg-white text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-300' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>
                올해 채용 수치표
              </button>
              <div className="flex-1" />
              <button onClick={() => { logout(); onClose(); }} className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-red-500 transition-colors self-center">
                <LogOut className="w-3.5 h-3.5" /> 로그아웃
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === 'hiring' ? (
                <div className="space-y-5">
                  <p className="text-[14px] font-semibold text-gray-700">26년 채용 현황 데이터 관리</p>
                  {(['gcCare', 'gcMediai'] as const).map((company) => (
                    <div key={company} className="space-y-2">
                      <h4 className="text-[13px] font-semibold text-gray-500">{company === 'gcCare' ? 'GC케어' : 'GC메디아이'}</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {(['fulltime', 'contract', 'intern'] as const).map((field) => (
                          <div key={field} className="space-y-1">
                            <label className="text-[11px] text-gray-400 font-medium">{field === 'fulltime' ? '정규직' : field === 'contract' ? '계약직' : '인턴'}</label>
                            <input type="number" min={0} value={editStats[company][field]}
                              onChange={(e) => updateStatsField(company, field, parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[14px] font-semibold text-gray-900 outline-none focus:border-gray-400 transition-colors text-center" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={handleSaveStats}
                    className={`w-full py-3 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                    {saved ? <><span>✓</span> 저장 완료!</> : <><Save className="w-4 h-4" /> 저장</>}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-semibold text-gray-700">
                      {tab === 'closed' ? '채용 완료(Closed) 포지션' : '현재 진행 중인 활성 포지션'}
                    </p>
                    <button onClick={() => { setShowAddForm(true); setEditingId(null); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-900 text-white text-[12px] font-semibold hover:bg-gray-800 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> 포지션 추가
                    </button>
                  </div>

                  {showAddForm && (
                    <PositionForm 
                      onSave={(pos) => { 
                        addPosition(pos); 
                        setShowAddForm(false); 
                        if (pos.current_stage === '입사확정' || pos.current_stage === '채용완료') setTab('closed');
                      }}
                      onCancel={() => setShowAddForm(false)}
                    />
                  )}

                  {sortedPositions
                    .filter(pos => tab === 'closed' 
                      ? (pos.current_stage === '입사확정' || pos.current_stage === '채용완료')
                      : (pos.current_stage !== '입사확정' && pos.current_stage !== '채용완료'))
                    // 닫힌 포지션 탭은 최신순 정렬 표시
                    .sort((a, b) => tab === 'closed' ? (b.open_date || '').localeCompare(a.open_date || '') : 0)
                    .map((pos) => (
                    <div key={pos.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50/50 transition-colors">
                      {editingId === pos.id ? (
                        <PositionForm
                          initial={pos}
                          onSave={(updated) => { 
                            updatePosition(pos.id, updated); 
                            setEditingId(null); 
                            if (updated.current_stage === '입사확정' || updated.current_stage === '채용완료') setTab('closed');
                          }}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : deleteConfirmId === pos.id ? (
                        /* 인라인 삭제 확인 UI (window.confirm 대체) */ 
                        <div className="flex items-center justify-between bg-red-50 rounded-lg p-3 -m-1">
                          <p className="text-[13px] font-medium text-red-700">
                            <strong>{pos.position_title}</strong>을(;��) 삭제�瓲*S�V�"�b0?
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => confirmDelete(pos.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700">
                              삭제
                            </button>
                            <button onClick={() => setDeleteConfirmId(null)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 text-[12px] font-semibold hover:bg-gray-50">
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          {/* 즐겨찾기 별 아이콘 */}
                          <button onClick={() => toggleFavorite(pos.id)}
                            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${favorites.has(pos.id) ? 'text-amber-400 hover:text-amber-500' : 'text-gray-200 hover:text-gray-400'}`}>
                            <Star className="w-4 h-4" fill={favorites.has(pos.id) ? 'currentColor' : 'none'} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.company === 'GC케어' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                {pos.company === 'GC케어' ? 'CARE' : 'MEDIAI'}
                              </span>
                              <span className="text-[14px] font-semibold text-gray-900 truncate">{pos.position_title}</span>
                              <span className="text-[11px] text-gray-300 font-medium ml-auto flex-shrink-0">{pos.open_date}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[12px] text-gray-400">
                              <span>{pos.team}</span>
                              <span>·</span>
                              <span>{pos.department}</span>
                              <span>·</span>
                              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[11px] font-medium text-gray-600">{pos.current_stage}</span>
                              <span>·</span>
                              <span>{pos.employment_type}</span>
                              <span>·</span>
                              <span>{pos.headcount}명</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => setEditingId(pos.id)}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteConfirmId(pos.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// === 포지션 추가/수정 인라인 폼 (오픈일 필드 추가) ===
function PositionForm({ initial, onSave, onCancel }: { 
  initial?: Position; 
  onSave: (pos: any) => void; 
  onCancel: () => void; 
}) {
  const [company, setCompany] = useState<Company>(initial?.company || 'GC메디아이');
  const [team, setTeam] = useState(initial?.team || '');
  const [department, setDepartment] = useState(initial?.department || '');
  const [title, setTitle] = useState(initial?.position_title || '');
  const [empType, setEmpType] = useState<'정규직' | '계약직'>(initial?.employment_type || '정규직');
  const [headcount, setHeadcount] = useState(initial?.headcount || 1);
  const [stage, setStage] = useState<StageType>(initial?.current_stage || '접수');
  // 요청 #1: 오픈일 입력/수정 필드 추가
  const [openDate, setOpenDate] = useState(initial?.open_date || new Date().toISOString().split('T')[0]);
  // 요청: 입사확정일(completion_date) 필드 추가
  const [completionDate, setCompletionDate] = useState(initial?.completion_date || new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    if (!team.trim() || !title.trim()) return;
    const data = {
      ...(initial || {
        id: `NEW-${Date.now()}`,
        job_family: '개발' as const,
        hiring_manager: '',
        request_date: new Date().toISOString().split('T')[0],
        days_in_stage: 0,
        total_elapsed_days: 0,
        target_days: 45,
        status_flag: '정상' as const,
        applicant_count: 0,
        interview_count: 0,
        offer_count: 0,
        jd_status: '미작성' as const,
        posting_url: '',
        jd_url: '',
        is_active: (stage !== '채용완료' && stage !== '입사확정'),
        update_logs: [],
      }),
      company,
      team,
      department,
      position_title: title,
      employment_type: empType,
      headcount,
      current_stage: stage,
      open_date: openDate,
      completion_date: (stage === '채용완료' || stage === '입사확정') ? completionDate : null,
      is_active: (stage !== '채용완료' && stage !== '입사확정'),
    };
    onSave(data);
  };

  const selectClass = "w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[13px] font-medium text-gray-900 outline-none focus:border-gray-400 transition-colors appearance-none";
  const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-[13px] font-medium text-gray-900 outline-none focus:border-gray-400 transition-colors";

  return (
    <div className="border-2 border-gray-900 rounded-xl p-4 bg-gray-50/50 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1 block">회사</label>
          <div className="relative">
            <select value={company} onChange={(e) => setCompany(e.target.value as Company)} className={selectClass}>
              {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1 block">채용형태</label>
          <div className="relative">
            <select value={empType} onChange={(e) => setEmpType(e.target.value as '정규직' | '계약직')} className={selectClass}>
              <option value="정규직">정규직</option>
              <option value="계약직">계약직</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1 block">팀</label>
          <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="예: EMR개발팀" className={inputClass} />
        </div>
        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1 block">본부</label>
          <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="예: PI본부" className={inputClass} />
        </div>
      </div>

      <div>
        <label className="text-[11px] text-gray-400 font-medium mb-1 block">포지션명</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 백엔드 개발" className={inputClass} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1 block">진행단계</label>
          <div className="relative">
            <select value={stage} onChange={(e) => setStage(e.target.value as StageType)} className={selectClass}>
              {STAGE_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1 block">인원</label>
          <input type="number" min={1} value={headcount} onChange={(e) => setHeadcount(parseInt(e.target.value) || 1)} className={`${inputClass} text-center`} />
        </div>
        {/* 요청 #1: 오픈일 필드 */}
        <div>
          <label className="text-[11px] text-gray-400 font-medium mb-1 block">오픈일</label>
          <input type="date" value={openDate} onChange={(e) => setOpenDate(e.target.value)} className={inputClass} />
        </div>
      </div>

      {(stage === '채용완료' || stage === '입사확정') && (
        <div className="pt-1 border-t border-gray-200/50 mt-2">
          <label className="text-[11px] text-[#E8603C] font-bold mb-1 block">확정일자 (입사/종료일)</label>
          <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className={`${inputClass} !border-[#E8603C]/30 !bg-orange-50/30`} />
        </div>
      )}

      <div className="flex gap-2 pt-1 mt-2">
        <button onClick={handleSubmit}
          className="flex-1 py-2.5 rounded-lg bg-gray-900 text-white text-[13px] font-semibold hover:bg-gray-800 flex items-center justify-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> {initial ? '수정 저장' : '추가'}
        </button>
        <button onClick={onCancel}
          className="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-gray-500 text-[13px] font-semibold hover:bg-gray-50">
          취소
        </button>
      </div>
    </div>
  );
}
