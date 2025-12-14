// src/pages/KelolaBarang.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

const KelolaBarang = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // 1. Fetch Products
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

  // 2. Handle Form Submit (Create & Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Must use FormData for File Uploads
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
      if (isEditMode) {
        // Laravel method spoofing for PUT with files
        data.append('_method', 'PUT'); 
        await axios.post(`http://localhost:8000/api/products/${currentId}`, data, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
      } else {
        await axios.post('http://localhost:8000/api/products', data, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
      }
      
      closeModal();
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error("Error saving product", error);
      alert("Gagal menyimpan produk. Cek console.");
    }
  };

  // 3. Handle Delete
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

  // Helper Functions
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
      foto: null // We don't preload the file object, only new uploads
    });
    setCurrentId(product.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Filter Search
  const filteredProducts = products.filter(p => 
    p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Barang</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Tambah Barang
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Cari nama barang..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Foto</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Nama Barang</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Harga Modal</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Harga Jual</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Stok</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
               <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
            ) : filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {product.foto ? (
                    <img 
                        src={`http://localhost:8000/storage/${product.foto}`} 
                        alt="Product" 
                        className="h-12 w-12 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">No Img</div>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{product.nama_produk}</td>
                <td className="px-6 py-4 text-gray-600">Rp {parseInt(product.harga_modal).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4 text-green-600 font-medium">Rp {parseInt(product.harga_jual).toLocaleString('id-ID')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${product.stok > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stok} pcs
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{isEditMode ? 'Edit Barang' : 'Tambah Barang'}</h2>
              <button onClick={closeModal}><X size={24} className="text-gray-500" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg p-2"
                  value={formData.nama_produk}
                  onChange={e => setFormData({...formData, nama_produk: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Modal</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2"
                    value={formData.harga_modal}
                    onChange={e => setFormData({...formData, harga_modal: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-lg p-2"
                    value={formData.harga_jual}
                    onChange={e => setFormData({...formData, harga_jual: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                <input 
                  type="number" 
                  className="w-full border rounded-lg p-2"
                  value={formData.stok}
                  onChange={e => setFormData({...formData, stok: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto Produk</label>
                <input 
                  type="file" 
                  className="w-full border rounded-lg p-2"
                  onChange={e => setFormData({...formData, foto: e.target.files[0]})}
                />
                <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah foto (saat edit).</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaBarang;