import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tent,
  Calendar,
  MessageSquare,
  DollarSign,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  name: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    name: 'Main',
    items: [
      {
        name: 'Dashboard',
        path: '/organizer-dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
    ],
  },
  {
    name: 'Camp Management',
    items: [
      {
        name: 'Bookings',
        path: '/organizer-dashboard/bookings',
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: 'Registrations',
        path: '/organizer-dashboard/registrations',
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        name: 'Enquiries',
        path: '/organizer-dashboard/enquiries',
        icon: <MessageSquare className="w-5 h-5" />,
      },
    ],
  },
  {
    name: 'Financial',
    items: [
      {
        name: 'Commissions',
        path: '/organizer-dashboard/commissions',
        icon: <DollarSign className="w-5 h-5" />,
      },
    ],
  },
];

export function OrganizerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const toggleGroup = (groupName: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedGroups(newCollapsed);
  };

  // Get organisation name from profile (assuming it's loaded via organisation_id)
  const organisationName = profile?.organisation_id ? 'My Organisation' : 'Camp Organiser';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex flex-col px-6 py-4 border-b border-gray-200">
              <Link to="/organizer-dashboard" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FE</span>
                </div>
                <span className="text-lg font-bold text-gray-900">FutureEdge</span>
              </Link>

              {/* Organisation Badge */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-0.5">
                  Organisation
                </p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {organisationName}
                </p>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
              {navGroups.map((group) => {
                const isCollapsed = collapsedGroups.has(group.name);
                const hasActiveItem = group.items.some(item => location.pathname === item.path);

                return (
                  <div key={group.name}>
                    {/* Group Header */}
                    {group.name !== 'Main' && (
                      <button
                        onClick={() => toggleGroup(group.name)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                      >
                        <span>{group.name}</span>
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    {/* Group Items */}
                    {!isCollapsed && (
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const isActive = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {item.icon}
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Sidebar Footer - User & Sign Out */}
            <div className="px-3 py-4 border-t border-gray-200 space-y-1">
              <div className="px-3 py-2 mb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Signed in as
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {profile?.email}
                </p>
              </div>

              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Exit to Public Site
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <Menu className="w-6 h-6" />
                </button>

                <div className="flex-1 lg:flex items-center gap-3 hidden">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Tent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      Camp Organiser Dashboard
                    </h1>
                    <p className="text-xs text-gray-500">
                      {organisationName}
                    </p>
                  </div>
                </div>

                {/* User Menu - Mobile */}
                <div className="flex items-center gap-3 lg:hidden">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.first_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Camp Organiser
                    </p>
                  </div>
                </div>

                {/* Desktop Actions - Removed */}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
              <p>© 2025 FutureEdge. Camp Organiser Portal.</p>
              <div className="flex items-center gap-4">
                <Link to="/help" className="hover:text-gray-700 transition-colors">
                  Help & Support
                </Link>
                <Link to="/terms" className="hover:text-gray-700 transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
