// src/pages/Penjualan.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

const Penjualan = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Fetch Products for the Grid
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Cart Logic
  const addToCart = (product) => {
    if (product.stok <= 0) return alert("Stok Habis!");

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // If item exists, increase qty
        if(existingItem.qty + 1 > product.stok) {
            alert("Stok tidak mencukupi");
            return prevCart;
        }
        return prevCart.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      // If new, add to cart
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.qty + change;
          // Validate Stock and Minimum Qty
          if (newQty < 1) return item; 
          if (newQty > item.stok) {
             alert("Mencapai batas stok");
             return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // 3. Calculation Logic
  const grandTotal = cart.reduce((sum, item) => sum + (item.harga_jual * item.qty), 0);
  const changeAmount = (parseFloat(cashReceived) || 0) - grandTotal;

  // 4. Submit Transaction
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (parseFloat(cashReceived) < grandTotal) return alert("Uang kurang!");

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        items: cart.map(item => ({ id: item.id, qty: item.qty })),
        uang_diberikan: parseFloat(cashReceived)
      };

      await axios.post('http://localhost:8000/api/transactions', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Transaksi Berhasil!");
      setCart([]);
      setCashReceived('');
      fetchProducts(); // Refresh stock in the grid
    } catch (error) {
      console.error("Checkout failed", error);
      alert(error.response?.data?.message || "Transaksi Gagal");
    } finally {
      setLoading(false);
    }
  };

  // Filter Products
  const filteredProducts = products.filter(p => 
    p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* LEFT COLUMN: Product Grid */}
      <div className="w-2/3 p-6 overflow-y-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Katalog Produk</h1>
          <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input 
               type="text" 
               placeholder="Cari produk..." 
               className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-blue-500"
            >
              <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {product.foto ? (
                   <img src={`http://localhost:8000/storage/${product.foto}`} alt={product.nama_produk} className="w-full h-full object-cover"/>
                ) : (
                   <span className="text-gray-400 text-sm">No Image</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-800 truncate">{product.nama_produk}</h3>
              <div className="flex justify-between items-center mt-2">
                 <span className="text-blue-600 font-bold">Rp {parseInt(product.harga_jual).toLocaleString('id-ID')}</span>
                 <span className={`text-xs px-2 py-1 rounded ${product.stok > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Stok: {product.stok}
                 </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Cart / Checkout */}
      <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col h-full">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart /> Keranjang
          </h2>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">Keranjang masih kosong</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div>
                   <h4 className="font-medium text-gray-800">{item.nama_produk}</h4>
                   <p className="text-blue-600 text-sm">Rp {parseInt(item.harga_jual * item.qty).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center bg-white border rounded-lg">
                      <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 hover:bg-gray-100">-</button>
                      <span className="px-2 font-medium">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 hover:bg-gray-100">+</button>
                   </div>
                   <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Section (Fixed at bottom) */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between mb-2 text-lg font-semibold">
            <span>Total Tagihan</span>
            <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">Uang Diterima</label>
            <input 
              type="number" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-right font-mono text-lg"
              placeholder="0"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
            />
          </div>

          <div className={`flex justify-between mb-6 p-3 rounded-lg ${changeAmount >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <span className="font-medium">Kembalian</span>
            <span className="font-bold">Rp {changeAmount >= 0 ? changeAmount.toLocaleString('id-ID') : '0'}</span>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
              cart.length === 0 || loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Penjualan;