import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tent,
  Users,
  Calendar,
  Mail,
  Settings,
  BarChart3,
  Tag,
  School,
  Menu,
  X,
  FileText,
  AlertCircle,
  Database,
  MessageSquare,
  DollarSign,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    name: 'Overview',
    path: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: 'Camps',
    path: '/admin/dashboard/camps',
    icon: <Tent className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'marketing', 'operations'],
  },
  {
    name: 'Enquiries',
    path: '/admin/dashboard/enquiries',
    icon: <MessageSquare className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'marketing', 'operations'],
  },
  {
    name: 'Customers',
    path: '/admin/dashboard/customers',
    icon: <Users className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'operations'],
  },
  {
    name: 'Registrations',
    path: '/admin/dashboard/registrations',
    icon: <Calendar className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'operations'],
  },
  {
    name: 'Communications',
    path: '/admin/dashboard/communications',
    icon: <Mail className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'marketing'],
  },
  {
    name: 'Analytics',
    path: '/admin/dashboard/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'marketing', 'operations'],
  },
  {
    name: 'Discount Codes',
    path: '/admin/dashboard/discounts',
    icon: <Tag className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'marketing'],
  },
  {
    name: 'Schools',
    path: '/admin/dashboard/schools',
    icon: <School className="w-5 h-5" />,
    roles: ['super_admin'],
  },
  {
    name: 'Commissions',
    path: '/admin/dashboard/commissions',
    icon: <DollarSign className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'operations'],
  },
  {
    name: 'Incidents',
    path: '/admin/dashboard/incidents',
    icon: <AlertCircle className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'operations', 'risk'],
  },
  {
    name: 'Reports',
    path: '/admin/dashboard/reports',
    icon: <FileText className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'operations'],
  },
  {
    name: 'Data Management',
    path: '/admin/data-management',
    icon: <Database className="w-5 h-5" />,
    roles: ['super_admin', 'school_admin', 'operations'],
  },
  {
    name: 'System Diagnostics',
    path: '/admin/diagnostics',
    icon: <Activity className="w-5 h-5" />,
    roles: ['super_admin'],
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { profile } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return profile && item.roles.includes(profile.role);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 py-4 border-t border-gray-200 space-y-1">
              <Link
                to="/admin/roles"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Role Management
              </Link>
              {profile?.role === 'super_admin' && (
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  Site Settings
                </Link>
              )}
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex-1 lg:ml-0 ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {filteredNavItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  {profile && (
                    <div className="hidden sm:flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {profile.first_name} {profile.last_name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{profile.role.replace('_', ' ')}</p>
                      </div>
                      {profile.role === 'super_admin' && (
                        <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          Super Admin
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
