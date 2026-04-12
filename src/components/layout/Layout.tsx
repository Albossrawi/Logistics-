import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppStore } from '../../store/appStore';

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="flex h-screen w-screen bg-surface-950 text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-surface-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
