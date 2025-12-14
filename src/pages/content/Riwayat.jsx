// src/pages/Riwayat.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Calendar, DollarSign, X, FileText } from 'lucide-react';

const Riwayat = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch History
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 2. Open Detail Modal
  const openDetail = (trx) => {
    setSelectedTransaction(trx);
    setIsModalOpen(true);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-gray-900">Riwayat Penjualan</h1>
           <p className="text-gray-600">Daftar semua transaksi yang telah selesai.</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Kode Transaksi</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Waktu</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Total Belanja</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Uang / Kembalian</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
                <tr><td colSpan="5" className="text-center py-6 text-gray-500">Memuat data...</td></tr>
            ) : transactions.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-6 text-gray-500">Belum ada transaksi.</td></tr>
            ) : (
                transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-blue-600 font-medium">
                            {trx.kode_transaksi}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                {formatDate(trx.created_at)}
                            </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                            Rp {parseInt(trx.total_harga).toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                            <div>In: Rp {parseInt(trx.uang_diberikan).toLocaleString('id-ID')}</div>
                            <div className="text-green-600">Out: Rp {parseInt(trx.kembalian).toLocaleString('id-ID')}</div>
                        </td>
                        <td className="px-6 py-4">
                            <button 
                                onClick={() => openDetail(trx)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Eye size={16} /> Detail
                            </button>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Modal Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Detail Transaksi</h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">{selectedTransaction.kode_transaksi}</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body: Item List */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-4">
                        {selectedTransaction.transaksi_details.map((item, index) => (
                            <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {item.produk ? item.produk.nama_produk : <span className="text-red-500 italic">Produk Dihapus</span>}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {item.qty} x Rp {parseInt(item.harga_satuan).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <p className="font-semibold text-gray-900">
                                    Rp {parseInt(item.subtotal).toLocaleString('id-ID')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal Footer: Totals */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Total Qty</span>
                        <span>{selectedTransaction.transaksi_details.reduce((sum, item) => sum + item.qty, 0)} Items</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Grand Total</span>
                        <span>Rp {parseInt(selectedTransaction.total_harga).toLocaleString('id-ID')}</span>
                    </div>
                </div>

            </div>
        </div>
      )}
    </div>
  );
};

export default Riwayat;