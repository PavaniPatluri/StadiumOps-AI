import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export default function Layout() {
  const { sidebarOpen } = useStore();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className={cn(
        'flex flex-col flex-1 min-w-0 transition-all duration-300',
        sidebarOpen ? 'ml-64' : 'ml-16'
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
