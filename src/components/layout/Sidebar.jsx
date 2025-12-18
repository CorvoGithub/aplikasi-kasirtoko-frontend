// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  PackageSearch, 
  History,
  X,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  const menuItems = [
    { to: "/dashboard/main", label: "Dashboard", icon: <Home size={22} /> },
    { to: "/dashboard/penjualan", label: "Penjualan", icon: <ShoppingCart size={22} /> },
    { to: "/dashboard/kelola", label: "Kelola Barang", icon: <PackageSearch size={22} /> },
    { to: "/dashboard/riwayat", label: "Riwayat Transaksi", icon: <History size={22} /> },
  ];

  const sidebarClasses = `
    w-72 bg-white border-r border-slate-200 flex flex-col h-screen 
    fixed top-0 left-0 z-40 transition-transform duration-300 ease-out 
    lg:relative lg:translate-x-0 lg:z-auto
    ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"}
  `;

  return (
    <div className={sidebarClasses}>
      {/* 1. Header Area (Brand Identity) */}
      <div className="h-20 flex items-center justify-between px-6 bg-[#307fe2] text-white">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
            <img 
              src="/images/m_white.png" 
              alt="Mantra Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Mantra</h1>
            <p className="text-[12px] text-blue-100 tracking-wider font-semibold opacity-80">
              {user?.role || 'Administration'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-blue-100 hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. Navigation Menu */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Menu Utama
        </p>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                isActive
                  ? 'bg-blue-50 text-[#307fe2]' // Active State
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' // Inactive State
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Strip */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#ffad00] rounded-r-full" />
                )}
                
                <span className={`transition-colors ${isActive ? 'text-[#307fe2]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. Footer (User Profile) */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-[#307fe2] flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.store_name || 'Mantra Store'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;