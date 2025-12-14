// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { LogOut, Menu, Bell, User, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // 1. Fetch Low Stock Notifications on Mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setNotifications(response.data);
        if (response.data.length > 0) {
          setHasUnread(true);
        }
        //eslint-disable-next-line no-unused-vars
      } catch (error) {
        console.error("Failed to fetch notifications");
      }
    };

    fetchNotifications();
    // Optional: Set interval to check every minute
    // const interval = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(interval);
  }, []);

  // 2. Secure Logout
  const handleLogout = async () => {
    try {
        const token = localStorage.getItem('token');
        // Tell server to kill the token
        await axios.post('http://localhost:8000/api/logout', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error("Logout failed on server", error);
    } finally {
        // Clear local storage regardless of server response
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left side: Branding & Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                Mantra
              </h1>
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotif(!showNotif)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative"
              >
                <Bell className="h-5 w-5" />
                {hasUnread && (
                  <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown Content */}
              {showNotif && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                        <span className="font-semibold text-gray-800">Notifikasi</span>
                        <button onClick={() => setShowNotif(false)}><X size={16} className="text-gray-400"/></button>
                    </div>
                    
                    {notifications.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.map((item) => (
                                <div key={item.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 flex gap-3 items-start">
                                    <div className="bg-red-100 p-2 rounded-full mt-0.5">
                                        <AlertCircle size={16} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">Stok Menipis!</p>
                                        <p className="text-xs text-gray-500">
                                            Stok <span className="font-bold">{item.nama_produk}</span> tersisa {item.stok} pcs. Segera restock.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            Tidak ada notifikasi baru.
                        </div>
                    )}
                </div>
              )}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 mt-1">{user?.store_name || 'Kasir'}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;