import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tent,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  School,
  Menu,
  X,
  Database,
  DollarSign,
  Settings,
  UserCog,
  ChevronDown,
  ChevronRight,
  Shield,
  LogOut,
  Percent,
  TrendingUp,
  Wallet,
  Store,
  ShoppingBag,
  Building2,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface NavGroup {
  name: string;
  items: NavItem[];
  roles?: string[];
}

const navGroups: NavGroup[] = [
  {
    name: 'Main',
    items: [
      {
        name: 'Dashboard',
        path: '/admin/dashboard',
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
    ],
  },
  {
    name: 'Seller Operations',
    items: [
      {
        name: 'Camps',
        path: '/admin/dashboard/camps',
        icon: <Tent className="w-5 h-5" />,
      },
      {
        name: 'Organisations',
        path: '/admin/dashboard/schools',
        icon: <Building2 className="w-5 h-5" />,
        roles: ['super_admin', 'school_admin'],
      },
      {
        name: 'Camp Organizers',
        path: '/admin/camp-organizers',
        icon: <UserCog className="w-5 h-5" />,
        roles: ['super_admin'],
      },
    ],
  },
  {
    name: 'Buyer Operations',
    items: [
      {
        name: 'Bookings',
        path: '/admin/dashboard/bookings',
        icon: <ShoppingBag className="w-5 h-5" />,
      },
      {
        name: 'Customers',
        path: '/admin/dashboard/customers',
        icon: <Users className="w-5 h-5" />,
      },
      {
        name: 'Enquiries',
        path: '/admin/dashboard/enquiries',
        icon: <MessageSquare className="w-5 h-5" />,
      },
    ],
  },
  {
    name: 'Financial',
    items: [
      {
        name: 'Revenue Analytics',
        path: '/admin/dashboard/analytics',
        icon: <BarChart3 className="w-5 h-5" />,
      },
      {
        name: 'Payment Analytics',
        path: '/admin/dashboard/payment-analytics',
        icon: <TrendingUp className="w-5 h-5" />,
        roles: ['super_admin', 'school_admin', 'operations'],
      },
      {
        name: 'Commissions',
        path: '/admin/dashboard/commissions',
        icon: <DollarSign className="w-5 h-5" />,
        roles: ['super_admin', 'school_admin', 'operations'],
      },
      {
        name: 'Commission Rates',
        path: '/admin/dashboard/commission-rates',
        icon: <Percent className="w-5 h-5" />,
        roles: ['super_admin'],
      },
      {
        name: 'Payouts',
        path: '/admin/dashboard/payouts',
        icon: <Wallet className="w-5 h-5" />,
        roles: ['super_admin', 'school_admin', 'operations'],
      },
    ],
  },
  {
    name: 'Platform Admin',
    items: [
      {
        name: 'User Roles',
        path: '/admin/user-roles',
        icon: <Shield className="w-5 h-5" />,
        roles: ['super_admin'],
      },
    ],
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { profile } = useAuth();

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleGroup = (groupName: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedGroups(newCollapsed);
  };

  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => {
      if (!item.roles) return true;
      return profile && item.roles.includes(profile.role);
    });
  };

  const filteredGroups = navGroups
    .map(group => ({
      ...group,
      items: filterNavItems(group.items)
    }))
    .filter(group => {
      // Filter out groups with no items
      if (group.items.length === 0) return false;
      // Filter by group roles if specified
      if (group.roles && profile) {
        return group.roles.includes(profile.role);
      }
      return true;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className={`flex items-center border-b border-gray-200 ${sidebarCollapsed ? 'justify-center px-3 py-4' : 'justify-between px-6 py-4'}`}>
              {!sidebarCollapsed ? (
                <>
                  <Link to="/admin/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">FE</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">FutureEdge</span>
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <Link to="/admin/dashboard" className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">FE</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
              {filteredGroups.map((group) => {
                const isCollapsed = collapsedGroups.has(group.name);
                const hasActiveItem = group.items.some(item => location.pathname === item.path);

                return (
                  <div key={group.name}>
                    {/* Group Header */}
                    {group.name !== 'Main' && !sidebarCollapsed && (
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
                              className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                                sidebarCollapsed
                                  ? 'justify-center px-3 py-2.5'
                                  : 'px-3 py-2.5'
                              } ${
                                isActive
                                  ? 'bg-green-50 text-green-700'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                              title={sidebarCollapsed ? item.name : ''}
                            >
                              {item.icon}
                              {!sidebarCollapsed && <span>{item.name}</span>}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Sidebar Footer - Settings */}
            <div className="px-3 py-4 border-t border-gray-200 space-y-1">
              {profile?.role === 'super_admin' && (
                <>
                  <Link
                    to="/admin/roles"
                    className={`flex items-center gap-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                      sidebarCollapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2.5'
                    }`}
                    title={sidebarCollapsed ? 'Role Management' : ''}
                  >
                    <Settings className="w-5 h-5" />
                    {!sidebarCollapsed && <span>Role Management</span>}
                  </Link>
                  <Link
                    to="/admin/data-management"
                    className={`flex items-center gap-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                      sidebarCollapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2.5'
                    }`}
                    title={sidebarCollapsed ? 'Data Management' : ''}
                  >
                    <Database className="w-5 h-5" />
                    {!sidebarCollapsed && <span>Data Management</span>}
                  </Link>
                </>
              )}
            </div>

            {/* Sidebar Footer - User Profile & Sign Out */}
            <div className="px-3 py-4 border-t border-gray-200 space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-2 mb-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                    {profile?.role?.replace('_', ' ')}
                  </p>
                </div>
              )}

              <Link
                to="/"
                className={`flex items-center gap-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${
                  sidebarCollapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2.5'
                }`}
                title={sidebarCollapsed ? 'Exit Admin' : ''}
              >
                <LogOut className="w-5 h-5" />
                {!sidebarCollapsed && <span>Exit Admin</span>}
              </Link>

              {/* Collapse/Expand Toggle Button */}
              <button
                onClick={toggleSidebar}
                className={`hidden lg:flex items-center gap-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full ${
                  sidebarCollapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2.5'
                }`}
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <>
                    <ChevronLeft className="w-5 h-5" />
                    <span>Collapse Sidebar</span>
                  </>
                )}
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
                <div className="flex items-center gap-4">
                  {/* Mobile menu button */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <Menu className="w-6 h-6" />
                  </button>

                  {/* Desktop expand button (when sidebar is collapsed) */}
                  {sidebarCollapsed && (
                    <button
                      onClick={toggleSidebar}
                      className="hidden lg:block text-gray-500 hover:text-gray-700"
                      title="Expand Sidebar"
                    >
                      <Menu className="w-6 h-6" />
                    </button>
                  )}
                </div>

                <div className="flex-1 lg:block hidden">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {/* Page title will be shown here */}
                  </h1>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
