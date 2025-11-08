import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from './RoleBasedRoute';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { isAdmin } = usePermissions();
  const location = useLocation();


  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Projects', href: '/projects' },
    {
      name: 'Boards',
      href: '/boards',
      dropdown: [
        { name: 'Issues', href: '/issues' },
      ],
    },
    { name: 'Reports', href: '/reports' },
  ];

  // Add Admin link for admins only
  if (isAdmin()) {
    navigation.push({ name: 'Admin', href: '/admin' });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo & Main Nav */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="flex items-center">
                  <img 
                    src="/logo.png" 
                    alt="GodJira Logo" 
                    className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8 items-center">
                {navigation.map((item) => (
                  !item.dropdown ? (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium ${
                        isActive(item.href)
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <div key={item.name} className="relative group flex items-center">
                      <Link
                        to={item.href}
                        className={`inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium focus:outline-none ${
                          isActive(item.href)
                            ? 'border-primary-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                        tabIndex={0}
                      >
                        {item.name}
                        <svg className="ml-1 w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l3 3 3-3" />
                        </svg>
                      </Link>
                      <div className="absolute left-0 top-full min-w-[120px] bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto transition-opacity z-10">
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* User Avatar & Name */}
              <Link
                to="/profile"
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/profile')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span className="hidden sm:block">{user?.name}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};
