// === 앱 루트 ===
<<<<<<< HEAD
// ErrorBoundary로 앱 전체를 감주서 크래시를 방지합니다.
=======
// ErrorBoundary로 앱 전체를 감싸서 크래시를 방지합니다.
>>>>>>> 84f8f2b (fix: resolve TypeScript build errors & update AdminModal)

import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import AiAssistant from './pages/AiAssistant';
import ErrorBoundary from './components/ErrorBoundary';
import { useAdmin } from './store/adminStore';

export type PageType = 'dashboard' | 'ai-assistant';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const fetchSupabaseData = useAdmin(state => state.fetchSupabaseData);

  // 앱 로딩 시 Supabase DB 최초 1회 Fetch
  useEffect(() => {
    fetchSupabaseData();
  }, [fetchSupabaseData]);

  return (
    <ErrorBoundary>
      {currentPage === 'dashboard' && (
        <Dashboard currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
      {currentPage === 'ai-assistant' && (
        <AiAssistant currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
    </ErrorBoundary>
  );
}

export default App;
