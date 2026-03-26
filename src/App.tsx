// === 앱 루트 ===
// AdminProvider로 전체 앱을 감싸서 관리자 상태를 모든 컴포넌트에서 접근 가능하게 합니다.

import { useState } from 'react';
import { AdminProvider } from './store/adminStore';
import Dashboard from './pages/Dashboard';
import AiAssistant from './pages/AiAssistant';

export type PageType = 'dashboard' | 'ai-assistant';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  return (
    <AdminProvider>
      {currentPage === 'dashboard' && (
        <Dashboard currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
      {currentPage === 'ai-assistant' && (
        <AiAssistant currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
    </AdminProvider>
  );
}

export default App;
