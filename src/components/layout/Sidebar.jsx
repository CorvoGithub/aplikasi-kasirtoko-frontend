// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  User, 
  X, 
  BarChart3,
  ShoppingCart,
  Users,
  Package,
  PackageSearch,
  History,
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  const menuItems = [
    { to: "/dashboard/main", label: "Dashboard", icon: <Home size={20} /> },
    { to: "/dashboard/penjualan", label: "Penjualan", icon: <ShoppingCart size={20} /> },
    { to: "/dashboard/kelola", label: "Kelola Barang", icon: <PackageSearch size={20} /> },
    { to: "/dashboard/riwayat", label: "Riwayat Transaksi", icon: <History size={20} /> },

  ];

  const sidebarClasses = `
    w-64 bg-white border-r border-gray-200 flex flex-col h-screen 
    fixed top-0 left-0 z-30 transition-transform duration-300 ease-in-out 
    lg:relative lg:translate-x-0 lg:z-auto
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    shadow-lg lg:shadow-none
  `;

  return (
    <div className={sidebarClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">MyApp</h1>
            <p className="text-xs text-gray-500 capitalize">{user?.role || 'User'}</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-400 group-hover:text-gray-600'
                }>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-linear-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;