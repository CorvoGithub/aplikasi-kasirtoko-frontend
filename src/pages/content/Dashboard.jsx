// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure you have axios installed
import { 
  TrendingUp, 
  Package, // Changed from Users to Package for Products
  ShoppingCart, 
  DollarSign,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    total_revenue: 0,
    total_products: 0,
    total_transactions: 0,
    today_revenue: 0,
    recent_activity: []
  });

  // Fetch Data on Component Mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Assuming you store your token in localStorage after login
        const token = localStorage.getItem('token'); 
        
        const response = await axios.get('http://localhost:8000/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: 'Total Revenue',
      value: `Rp ${parseInt(data.total_revenue).toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'bg-green-500',
      description: 'Total earnings'
    },
    {
      title: 'Total Products', // Changed from Customers
      value: data.total_products,
      icon: Package,
      color: 'bg-blue-500',
      description: 'Items in inventory'
    },
    {
      title: 'Total Transactions', // Changed from Orders
      value: data.total_transactions,
      icon: ShoppingCart,
      color: 'bg-yellow-500',
      description: ' receipts generated'
    },
    {
      title: "Today's Revenue", // Changed from Growth
      value: `Rp ${parseInt(data.today_revenue).toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      description: 'Earned today'
    }
  ];

  if (loading) {
    return <div className="p-6">Loading Dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your store performance.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2 text-gray-500">
                    <span className="text-sm">{stat.description}</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-xl shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section - Using only what we have in DB */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {data.recent_activity.length > 0 ? (
              data.recent_activity.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Payment Received</p>
                    <p className="text-xs text-gray-500">Invoice: {item.invoice}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      +Rp {parseInt(item.amount).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No transactions found yet.</p>
            )}
          </div>
        </div>

        {/* Quick Actions (Since we don't have server load/task data) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-4">
             <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-700">
                <span className="font-medium">Create New Transaction</span>
                <ShoppingCart className="h-5 w-5" />
             </button>
             <button className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-indigo-700">
                <span className="font-medium">Add New Product</span>
                <Package className="h-5 w-5" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;