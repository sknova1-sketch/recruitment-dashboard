// === 익명 의견 게시판 팝업 ===
// "채용 프로세스 개선 의견" 버튼 클릭 시 50% 크기 새 창으로 표시

import { useState, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackItem {
  id: string;
  content: string;
  createdAt: string;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [content, setContent] = useState('');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  // localStorage에서 기존 의견 불러오기
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('feedbacks');
      if (stored) setFeedbacks(JSON.parse(stored));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;
    const newItem: FeedbackItem = {
      id: Date.now().toString(),
      content: content.trim(),
      createdAt: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [newItem, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem('feedbacks', JSON.stringify(updated));
    setContent('');
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]" onClick={onClose} />

      {/* 팝업 (화면의 50% 크기) */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[50vw] h-[70vh] neu-card p-0 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">채용 프로세스 개선 의견</h3>
              <p className="text-[12px] text-gray-400 font-medium">익명으로 의견을 남겨주세요</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 의견 목록 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {feedbacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-[15px] text-gray-400 font-medium">아직 등록된 의견이 없습니다.</p>
              <p className="text-[13px] text-gray-300 font-medium mt-1">아래에서 첫 번째 의견을 남겨주세요!</p>
            </div>
          ) : (
            feedbacks.map((item) => (
              <div key={item.id} className="neu-card-flat p-5">
                <p className="text-[14px] text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{item.content}</p>
                <p className="text-[11px] text-gray-300 font-medium mt-3">{item.createdAt} · 익명</p>
              </div>
            ))
          )}
        </div>

        {/* 입력 영역 */}
        <div className="p-5 border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="채용 프로세스에 대한 개선 의견을 남겨주세요..."
              rows={2}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-[14px] font-medium text-gray-900 outline-none focus:border-gray-400 resize-none placeholder:text-gray-300 transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="px-5 py-3 rounded-xl bg-gray-900 text-white disabled:opacity-30 hover:bg-gray-800 transition-colors self-end flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
