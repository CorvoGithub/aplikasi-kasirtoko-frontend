// src/pages/KelolaBarang.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  Package, 
  ImageIcon, 
  AlertCircle 
} from 'lucide-react';

const KelolaBarang = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nama_produk: '',
    harga_modal: '',
    harga_jual: '',
    stok: '',
    deskripsi: '',
    foto: null
  });

  // Helper: Format Currency
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const data = new FormData();
    data.append('nama_produk', formData.nama_produk);
    data.append('harga_modal', formData.harga_modal);
    data.append('harga_jual', formData.harga_jual);
    data.append('stok', formData.stok);
    data.append('deskripsi', formData.deskripsi || '');
    if (formData.foto instanceof File) {
      data.append('foto', formData.foto);
    }

    try {
      const config = {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      };

      if (isEditMode) {
        data.append('_method', 'PUT'); 
        await axios.post(`http://localhost:8000/api/products/${currentId}`, data, config);
      } else {
        await axios.post('http://localhost:8000/api/products', data, config);
      }
      
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product", error);
      alert("Gagal menyimpan produk.");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Yakin ingin menghapus barang ini?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  const openAddModal = () => {
    setFormData({ nama_produk: '', harga_modal: '', harga_jual: '', stok: '', deskripsi: '', foto: null });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setFormData({
      nama_produk: product.nama_produk,
      harga_modal: product.harga_modal,
      harga_jual: product.harga_jual,
      stok: product.stok,
      deskripsi: product.deskripsi,
      foto: null 
    });
    setCurrentId(product.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const filteredProducts = products.filter(p => 
    p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Kelola Inventaris</h1>
           <p className="text-slate-500 mt-1">Tambahkan, edit, atau hapus produk toko Anda.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#307fe2] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5"
        >
          {/* Accent usage: White icon, Blue Button */}
          <Plus size={20} /> 
          <span>Tambah Barang</span>
        </button>
      </div>

      {/* 2. Search Bar - Accent on Focus */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center max-w-md group focus-within:border-[#ffad00] focus-within:ring-4 focus-within:ring-[#ffad00]/10 transition-all">
        <div className="p-2 text-slate-400 group-focus-within:text-[#ffad00] transition-colors">
            <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Cari berdasarkan nama barang..." 
          className="w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 h-full py-2"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 3. Product Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Produk</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Harga Modal</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Harga Jual</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stok</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   <tr><td colSpan="5" className="text-center py-12 text-slate-400">Loading...</td></tr>
                ) : filteredProducts.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                                <div className="bg-slate-50 p-4 rounded-full mb-3">
                                    <Package size={32} />
                                </div>
                                <p>Tidak ada barang ditemukan.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                        
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                    {product.foto ? (
                                        <img 
                                            src={`http://localhost:8000/storage/${product.foto}`} 
                                            alt={product.nama_produk} 
                                            className="h-full w-full object-cover"
                                            onError={(e) => {e.target.onerror = null; e.target.src = ''}}
                                        />
                                    ) : (
                                        <ImageIcon size={20} className="text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{product.nama_produk}</p>
                                    <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{product.deskripsi || '-'}</p>
                                </div>
                            </div>
                        </td>

                        <td className="px-6 py-4 text-right text-slate-600 font-medium">
                            {formatRupiah(product.harga_modal)}
                        </td>

                        <td className="px-6 py-4 text-right text-[#307fe2] font-bold">
                            {formatRupiah(product.harga_jual)}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              product.stok > 10 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-red-50 text-red-600 border border-red-200' // Changed to Red/Orange feel
                          }`}>
                            {product.stok <= 5 && <AlertCircle size={12} className="mr-1 text-[#ffad00]" />}
                            {product.stok} pcs
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              {/* ACCENT USAGE: Edit button is now Orange to differentiate */}
                              <button 
                                onClick={() => openEditModal(product)} 
                                className="p-2 text-[#ffad00] hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-[#ffad00]/20"
                                title="Edit"
                              >
                                  <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(product.id)} 
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                title="Hapus"
                              >
                                  <Trash2 size={18} />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
        </div>
      </div>

      {/* 4. Modal Form - Inputs now have Orange Focus */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-900">
                  {isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Barang</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all"
                            value={formData.nama_produk}
                            onChange={e => setFormData({...formData, nama_produk: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Harga Modal</label>
                            <input 
                                type="number" 
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all"
                                value={formData.harga_modal}
                                onChange={e => setFormData({...formData, harga_modal: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Harga Jual</label>
                            <input 
                                type="number" 
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all"
                                value={formData.harga_jual}
                                onChange={e => setFormData({...formData, harga_jual: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Stok Awal</label>
                        <input 
                            type="number" 
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all"
                            value={formData.stok}
                            onChange={e => setFormData({...formData, stok: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
                        <textarea 
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all resize-none"
                            rows="2"
                            value={formData.deskripsi || ''}
                            onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                        />
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
                        <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={e => setFormData({...formData, foto: e.target.files[0]})}
                        accept="image/*"
                        />
                        <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-[#ffad00] transition-colors">
                            <ImageIcon size={24} className="mb-2" />
                            <p className="text-sm font-medium">{formData.foto instanceof File ? formData.foto.name : "Klik untuk upload foto produk"}</p>
                        </div>
                    </div>

                </form>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-white transition-all">
                    Batal
                </button>
                {/* Save button remains Blue as it's the primary action, but maybe a slight orange glow? Sticking to Blue for 'Safe' Save */}
                <button type="submit" form="productForm" className="flex-1 px-4 py-2.5 bg-[#307fe2] text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
                    Simpan Produk
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaBarang;