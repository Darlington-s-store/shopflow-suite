import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon, Grid, Box, ShoppingCart, Users, BarChart3, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminPage {
  id: number;
  key: string;
  title: string;
  path: string;
  icon: string;
  sort_order: number;
}

const iconMap: Record<string, LucideIcon> = {
  grid: Grid,
  box: Box,
  'shopping-cart': ShoppingCart,
  users: Users,
  'bar-chart': BarChart3,
  settings: Settings,
};

export function AdminSidebar() {
  const location = useLocation();
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminPages = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/admin/pages`);
        if (response.ok) {
          const data = await response.json();
          setPages(data.pages || []);
        }
      } catch (err) {
        console.error('Failed to fetch admin pages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminPages();
  }, []);

  if (isLoading) {
    return (
      <aside className="w-64 border-r bg-slate-50 p-4">
        <div className="space-y-2 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 rounded" />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-40"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-30 w-64 border-r bg-slate-50 p-4 transform transition-transform md:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="space-y-1">
          {pages.map((page) => {
            const Icon = iconMap[page.icon] || Grid;
            const isActive = location.pathname === page.path;

            return (
              <Link
                key={page.id}
                to={page.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-orange-600 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-200'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{page.title}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
