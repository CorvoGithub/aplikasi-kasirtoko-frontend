// src/components/Header.jsx
import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Menu, Bell, AlertCircle, X, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  //eslint-disable-next-line no-unused-vars
  const user = JSON.parse(localStorage.getItem('user'));
  
  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // Searchable Menu Items
  const menuItems = [
    { label: 'Dashboard Utama', path: '/dashboard/main', category: 'Menu' },
    { label: 'Halaman Penjualan', path: '/dashboard/penjualan', category: 'Transaksi' },
    { label: 'Kelola Barang', path: '/dashboard/kelola', category: 'Inventory' },
    { label: 'Tambah Produk', path: '/dashboard/kelola', category: 'Action' }, // Shortcut to same page
    { label: 'Riwayat Transaksi', path: '/dashboard/riwayat', category: 'Laporan' },
  ];

  // 1. Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(response.data);
        if (response.data.length > 0) setHasUnread(true);
        //eslint-disable-next-line no-unused-vars
      } catch (error) {
        console.error("Failed to fetch notifications");
      }
    };
    fetchNotifications();
  }, []);

  // 2. Handle Search Logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
    }
    
    const results = menuItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(results);
    setShowSearch(true);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
      navigate(path);
      setShowSearch(false);
      setSearchQuery('');
  };

  // 3. Logout Logic
  const handleLogout = async () => {
    try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:8000/api/logout', {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        //eslint-disable-next-line no-unused-vars
    } catch (error) {
        console.error("Logout failed");
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-20">
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          
          {/* LEFT: Toggle & Functional Search */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* SEARCH BAR */}
            <div className="hidden md:block relative w-full max-w-md" ref={searchRef}>
                <div className="flex items-center text-slate-400 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 focus-within:border-[#307fe2] focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
                    <Search size={18} className="mr-3 text-slate-400" />
                    <input 
                        type="text"
                        className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder-slate-400"
                        placeholder="Cari menu (ex: Penjualan)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => { if(searchQuery) setShowSearch(true) }}
                    />
                </div>

                {/* Search Results Dropdown */}
                {showSearch && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="py-2">
                            <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hasil Pencarian</p>
                            {searchResults.map((result, index) => (
                                <button 
                                    key={index}
                                    onClick={() => handleNavigate(result.path)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-lg text-[#307fe2]">
                                            <Search size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{result.label}</p>
                                            <p className="text-xs text-slate-400">{result.category}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-[#307fe2] group-hover:translate-x-1 transition-all"/>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotif(!showNotif)}
                className={`p-2.5 rounded-full transition-all duration-200 ${
                    showNotif ? 'bg-blue-50 text-[#307fe2]' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
              >
                <Bell className="h-5 w-5" />
                {hasUnread && (
                  <span className="absolute top-2 right-2.5 block h-2.5 w-2.5 rounded-full bg-[#ffad00] ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notif Dropdown */}
              {showNotif && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-800">Notifikasi</h3>
                        </div>
                        <button onClick={() => setShowNotif(false)}><X size={16} className="text-slate-400 hover:text-slate-600"/></button>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((item) => (
                                <div key={item.id} className="px-5 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex gap-4 transition-colors">
                                    <div className="bg-red-50 p-2.5 rounded-full h-fit">
                                        <AlertCircle size={20} className="text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 mb-0.5">Stok Menipis!</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            Stok <span className="font-bold text-slate-900">{item.nama_produk}</span> tersisa <span className="text-red-600 font-bold">{item.stok} pcs</span>.
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-8 text-center text-slate-500 text-sm">
                                Tidak ada notifikasi baru.
                            </div>
                        )}
                    </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
                <LogOut size={18} />
                <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;