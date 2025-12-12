import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Shirt, Layers, Archive, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const leftTabs = [
  { path: '/', label: 'My Closet', icon: Shirt },
  { path: '/outfit-builder', label: 'Outfit Builder', icon: Layers },
  { path: '/my-outfits', label: 'My Outfits', icon: Archive },
];

const rightTabs = [
  { path: '/stats', label: 'Stats', icon: BarChart3 },
  { path: '/wrapped', label: 'Wrapped', icon: Sparkles, special: true },
];

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  const location = useLocation();

  const renderTab = (tab: typeof leftTabs[0] & { special?: boolean }) => {
    const isActive = location.pathname === tab.path;
    const isSpecial = tab.special;
    return (
      <NavLink
        key={tab.path}
        to={tab.path}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2',
          isActive
            ? isSpecial 
              ? 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30'
              : 'border-primary text-primary bg-background'
            : isSpecial
              ? 'border-transparent text-amber-600/70 hover:text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
        )}
      >
        <tab.icon className={cn("w-4 h-4", isSpecial && "text-amber-500")} />
        <span className="hidden sm:inline">{tab.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Top bar with title and actions */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shirt className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">ThreadCount</h1>
                <p className="text-sm text-muted-foreground">Wear it or waste it</p>
              </div>
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>

          {/* Tab navigation - split left and right */}
          <nav className="flex justify-between -mb-px">
            <div className="flex gap-1">
              {leftTabs.map(renderTab)}
            </div>
            <div className="flex gap-1">
              {rightTabs.map(renderTab)}
            </div>
          </nav>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
