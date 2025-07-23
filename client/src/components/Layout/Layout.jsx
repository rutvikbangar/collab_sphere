import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isWhiteboardPage = location.pathname.startsWith('/room/');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    // Clear auth token/user data from storage
    localStorage.removeItem('accessToken');
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
              <h1 className="text-xl font-bold text-indigo-600">CollabSphere</h1>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate('/projects')}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Projects
                </button>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none"
              >
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://via.placeholder.com/32"
                  alt="User avatar"
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                  <button
                    onClick={() => navigate('/profile')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Your Profile
                  </button>
                  <button
                    onClick={() => navigate('/settings')}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Settings
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