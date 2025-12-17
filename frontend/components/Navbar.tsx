
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User as UserIcon, LogOut, Globe, Bell, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../constants';

const Navbar: React.FC = () => {
  const { user, logout, language, setLanguage, t } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    // Click outside to close notifications
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
    if (selected) setLanguage(selected);
  };

  const notifications = user?.notifications || [
    { id: '1', title: 'Welcome to Rozgar AI!', message: 'Complete your voice profile to get better jobs.', isRead: false, type: 'info', timestamp: new Date().toISOString() },
    { id: '2', title: 'New Driver Jobs', message: '3 new driver jobs posted near Andheri.', isRead: false, type: 'success', timestamp: new Date(Date.now() - 3600000).toISOString() }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      {!isOnline && (
        <div className="bg-red-500 text-white text-xs text-center py-1 font-bold flex items-center justify-center gap-2">
          <WifiOff className="w-3 h-3" /> Offline Mode - Viewing Saved Data
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="font-bold text-xl text-brand-900 hidden sm:block">Rozgar AI</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
              <Globe className="w-4 h-4 text-gray-500 ml-1 mr-1 flex-shrink-0" />
              <select 
                value={language.code}
                onChange={handleLanguageChange}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer w-16 sm:w-auto max-w-[80px]"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.nativeName}</option>
                ))}
              </select>
            </div>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-gray-500 hover:text-brand-600 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-slide-up origin-top-right z-50">
                       <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase">
                          Notifications
                       </div>
                       <div className="max-h-64 overflow-y-auto">
                          {notifications.map((n: any) => (
                             <div key={n.id} className="p-3 border-b border-gray-50 hover:bg-gray-50">
                                <p className="text-sm font-bold text-gray-800">{n.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>

                <span className="text-sm font-medium hidden md:block text-gray-700 truncate max-w-[100px]">
                  {t.welcome}, {user.name.split(' ')[0]}
                </span>
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  title={t.logout}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-brand-600 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm whitespace-nowrap"
              >
                {t.login_title}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
