import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/context';

export default function Sidebar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside 
      id="sidebar" 
      className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-5 flex items-center border-b border-gray-700">
          <Link href="/">
            <a className="text-2xl font-bold text-white cursor-pointer">DashMetrics</a>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul>
            <li className="mb-1">
              <Link href="/">
                <a className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location === '/' ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700'
                }`}>
                  <span className="material-icons mr-3">dashboard</span>
                  <span>Dashboard</span>
                </a>
              </Link>
            </li>
            <li className="mb-1">
              <Link href="/api-setup">
                <a className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location === '/api-setup' ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700'
                }`}>
                  <span className="material-icons mr-3">api</span>
                  <span>API Setup</span>
                </a>
              </Link>
            </li>
            <li className="mb-1">
              <Link href="/analytics">
                <a className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location === '/analytics' ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700'
                }`}>
                  <span className="material-icons mr-3">analytics</span>
                  <span>Analytics</span>
                </a>
              </Link>
            </li>
            <li className="mb-1">
              <Link href="/subscription">
                <a className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location === '/subscription' ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700'
                }`}>
                  <span className="material-icons mr-3">card_membership</span>
                  <span>Subscription</span>
                </a>
              </Link>
            </li>
            <li className="mb-1">
              <Link href="/settings">
                <a className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location === '/settings' ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-700'
                }`}>
                  <span className="material-icons mr-3">settings</span>
                  <span>Settings</span>
                </a>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User section */}
        {user && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-x-4">
              <div className="relative">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=random`} 
                  alt="User profile" 
                  className="w-10 h-10 rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.displayName || 'User'}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <button 
                className="ml-auto text-gray-400 hover:text-white"
                onClick={signOut}
              >
                <span className="material-icons">logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
