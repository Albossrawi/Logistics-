import { ScanLine } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full bg-surface-950 text-white overflow-hidden">
      {/* Brand bar */}
      <header className="h-16 flex items-center gap-2.5 px-4 md:px-6 bg-surface-900 border-b border-surface-800 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center flex-shrink-0">
          <ScanLine className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold text-white truncate">Delivery Label Extractor</span>
      </header>

      <main className="flex-1 overflow-y-auto bg-surface-950 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
