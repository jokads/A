import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Header() {
  const { items } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Buscar role e perfil do utilizador
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserRole(null);
        setUserProfile(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, full_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar dados do utilizador:', error);
          return;
        }

        if (data) {
          setUserRole(data.role);
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do utilizador:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isAdmin = userRole && ['superadmin', 'admin', 'manager', 'editor', 'financial', 'support'].includes(userRole);

  return (
    <header className={`sticky top-0 z-50 ${darkMode ? 'bg-[#0b0011]' : 'bg-white'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors`}>
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-lg flex items-center justify-center">
              <i className="ri-store-3-line text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#b62bff] to-[#ff6a00] bg-clip-text text-transparent">
              JokaTech
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors whitespace-nowrap`}
            >
              Início
            </Link>
            <Link 
              to="/category" 
              className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors whitespace-nowrap`}
            >
              Produtos
            </Link>
            <Link 
              to="/services" 
              className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors whitespace-nowrap`}
            >
              Serviços
            </Link>
            <Link 
              to="/about" 
              className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors whitespace-nowrap`}
            >
              Sobre Nós
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors whitespace-nowrap`}
            >
              Contacto
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors cursor-pointer`}
            >
              <i className={`${darkMode ? 'ri-sun-line' : 'ri-moon-line'} text-xl ${
                darkMode ? 'text-yellow-400' : 'text-gray-700'
              }`}></i>
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative w-10 h-10 rounded-lg ${
                darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
              } flex items-center justify-center transition-colors cursor-pointer`}
            >
              <i className={`ri-shopping-cart-line text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`w-10 h-10 rounded-lg ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  } flex items-center justify-center transition-colors cursor-pointer`}
                >
                  {userProfile?.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <i className={`ri-user-line text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}></i>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl ${
                      darkMode ? 'bg-[#170018] border-gray-800' : 'bg-white border-gray-200'
                    } border overflow-hidden z-50`}>
                      {/* User Info */}
                      <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#b62bff] to-[#ff6a00] rounded-full flex items-center justify-center">
                            {userProfile?.avatar_url ? (
                              <img 
                                src={userProfile.avatar_url} 
                                alt="Avatar" 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <i className="ri-user-line text-white text-xl"></i>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {userProfile?.full_name || user?.email?.split('@')[0]}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                            darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                          } transition-colors cursor-pointer`}
                        >
                          <i className="ri-user-settings-line text-lg"></i>
                          <span>Meu Perfil</span>
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              navigate('/admin');
                              setShowUserMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                              darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                            } transition-colors cursor-pointer`}
                          >
                            <i className="ri-dashboard-line text-lg"></i>
                            <span>Dashboard Admin</span>
                          </button>
                        )}

                        <button
                          onClick={handleLogout}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                            darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'
                          } transition-colors cursor-pointer`}
                        >
                          <i className="ri-logout-box-line text-lg"></i>
                          <span>Terminar Sessão</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-gradient-to-r from-[#b62bff] to-[#ff6a00] text-white font-medium rounded-lg hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
