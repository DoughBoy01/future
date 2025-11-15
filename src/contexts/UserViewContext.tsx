import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type UserView = 'parent' | 'camp_organiser';

interface UserViewContextType {
  currentView: UserView;
  setView: (view: UserView) => void;
  canSwitchView: boolean;
}

const UserViewContext = createContext<UserViewContextType | undefined>(undefined);

export function UserViewProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [currentView, setCurrentView] = useState<UserView>('parent');

  // Determine if user can switch between views
  // Users with admin roles (school_admin, super_admin) can also act as parents
  const canSwitchView = !!user && !!profile &&
    ['school_admin', 'super_admin'].includes(profile.role || '');

  // Load saved view preference from localStorage
  useEffect(() => {
    if (user && canSwitchView) {
      const savedView = localStorage.getItem(`userView_${user.id}`) as UserView;
      if (savedView && (savedView === 'parent' || savedView === 'camp_organiser')) {
        setCurrentView(savedView);
      } else if (profile?.role === 'school_admin' || profile?.role === 'super_admin') {
        // Default to camp_organiser for admin users
        setCurrentView('camp_organiser');
      }
    } else if (profile?.role === 'parent') {
      setCurrentView('parent');
    }
  }, [user, profile, canSwitchView]);

  const setView = (view: UserView) => {
    setCurrentView(view);
    if (user) {
      localStorage.setItem(`userView_${user.id}`, view);
    }
  };

  const value = {
    currentView,
    setView,
    canSwitchView,
  };

  return <UserViewContext.Provider value={value}>{children}</UserViewContext.Provider>;
}

export function useUserView() {
  const context = useContext(UserViewContext);
  if (context === undefined) {
    throw new Error('useUserView must be used within a UserViewProvider');
  }
  return context;
}
