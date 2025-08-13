import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isWhiteboardPage = location.pathname.startsWith('/room/');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Get user data from localStorage
  const userInitial = useMemo(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return '?';
    
    const user = JSON.parse(userData);
    return user.name ? user.name.charAt(0).toUpperCase() : '?';
  }, []);

  const handleProfileClick = () => {
    setUserMenuOpen(false); // Close menu before navigation
    navigate('/profile');
  };

  const handleLogout = () => {
    setUserMenuOpen(false); // Close menu before navigation
    // Clear auth token/user data from storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <button 
                onClick={() => navigate('/')}
                className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                CollabSphere
              </button>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-medium">{userInitial}</span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={handleProfileClick}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Your Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isWhiteboardPage ? (
        <main className='px-4'>

          <Outlet />
        </main>
      ) 
      :(<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>)}
    </div>
  );
};

export default Layout;