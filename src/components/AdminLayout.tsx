import { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0b0011] text-[#ffdfe8]' : 'bg-gray-50 text-[#1f1530]'}`}>
      {children}
    </div>
  );
}
