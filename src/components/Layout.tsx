import { Outlet } from 'react-router-dom';
import Header from './feature/Header';
import Footer from './feature/Footer';
import ErrorBoundary from './ErrorBoundary';
import DebugPanel from './DebugPanel';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
  const { darkMode } = useTheme();

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#0b0011] text-[#ffdfe8]' : 'bg-white text-[#1f1530]'}`}>
        <Header />
        <main className="flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
        <DebugPanel darkMode={darkMode} />
      </div>
    </ErrorBoundary>
  );
}