// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  PackageSearch, 
  History,
  X,
  IdCardLanyard,
  Store // Added Store icon for fallback
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  // Construct Avatar URL safely
  const avatarUrl = user?.avatar ? `http://localhost:8000/storage/${user.avatar}` : null;

  const menuItems = [
    { to: "/dashboard/main", label: "Dashboard", icon: <Home size={22} /> },
    { to: "/dashboard/penjualan", label: "Penjualan", icon: <ShoppingCart size={22} /> },
    { to: "/dashboard/kelola", label: "Kelola Barang", icon: <PackageSearch size={22} /> },
    { to: "/dashboard/riwayat", label: "Riwayat Transaksi", icon: <History size={22} /> },
    { to: "/dashboard/profile", label: "Profil Toko", icon: <IdCardLanyard size={22} /> },
  ];

  const activeIndex = menuItems.findIndex(item => 
    location.pathname.startsWith(item.to)
  );

  const sidebarClasses = `
    w-72 bg-white border-r border-slate-200 flex flex-col h-screen 
    fixed top-0 left-0 z-40 transition-transform duration-300 ease-out 
    lg:relative lg:translate-x-0 lg:z-auto
    ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"}
  `;

  const ITEM_HEIGHT = 48; 
  const ITEM_GAP = 8;

  return (
    <div className={sidebarClasses}>
      {/* 1. Header Area */}
      <div className="h-20 flex items-center justify-between px-6 bg-[#307fe2] text-white">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10">
            <img src="/images/m_white.png" alt="Mantra Logo" className="w-8 h-8 object-contain"/>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Mantra</h1>
            <p className="text-[12px] text-blue-100 tracking-wider font-semibold opacity-80">
              {user?.role || 'Point Of Sale'}
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
      <nav className="flex-1 px-4 py-8 overflow-y-auto relative custom-scrollbar">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Menu Utama
        </p>

        {/* SLIDING INDICATOR */}
        <div 
            className={`absolute left-4 right-4 bg-blue-50 rounded-xl z-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${activeIndex === -1 ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            style={{
                height: `${ITEM_HEIGHT}px`,
                transform: `translateY(${activeIndex * (ITEM_HEIGHT + ITEM_GAP)}px)`
            }}
        >
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#ffad00] rounded-r-full" />
        </div>

        {/* MENU ITEMS */}
        <div className="flex flex-col gap-2 relative z-10">
            {menuItems.map((item) => (
            <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                `flex items-center gap-3 px-4 h-12 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    isActive
                    ? 'text-[#307fe2]' 
                    : 'text-slate-600 hover:text-slate-900' 
                }`
                }
            >
                {({ isActive }) => (
                <>
                    <span className={`transition-colors ${isActive ? 'text-[#307fe2]' : 'text-slate-400'}`}>
                        {item.icon}
                    </span>
                    <span>{item.label}</span>
                </>
                )}
            </NavLink>
            ))}
        </div>
      </nav>

      {/* 3. REDESIGNED ACCOUNT BANNER */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          
          {/* Avatar Section */}
          <div className="shrink-0">
            {avatarUrl ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 shadow-sm">
                    <img 
                        src={avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#307fe2] to-[#2563b0] flex items-center justify-center text-white font-bold text-sm shadow-sm border border-blue-600/10">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
            )}
          </div>

          {/* Text Section */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate leading-tight">
              {user?.name || 'User'}
            </p>
            <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                <Store size={10} />
                <p className="text-[11px] font-medium truncate">
                    {user?.store_name || 'Mantra Store'}
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Sidebar;