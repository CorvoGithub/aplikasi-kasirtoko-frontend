// src/pages/Penjualan.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Package, 
  ImageIcon, 
  AlertCircle,
  Banknote
} from 'lucide-react';

const Penjualan = () => {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false); // For button loading state

  // --- HELPERS ---
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // --- DATA FETCHING ---
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

  // --- CART LOGIC ---
  const addToCart = (product) => {
    if (product.stok <= 0) return alert("Stok Habis!");

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if(existingItem.qty + 1 > product.stok) {
            alert("Stok tidak mencukupi");
            return prevCart;
        }
        return prevCart.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.qty + change;
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

  // --- CALCULATIONS ---
  const grandTotal = cart.reduce((sum, item) => sum + (item.harga_jual * item.qty), 0);
  const changeAmount = (parseFloat(cashReceived) || 0) - grandTotal;

  // --- CHECKOUT ---
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");
    if (parseFloat(cashReceived) < grandTotal) return alert("Uang kurang!");

    setProcessing(true);
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
      fetchProducts(); 
    } catch (error) {
      console.error("Checkout failed", error);
      alert(error.response?.data?.message || "Transaksi Gagal");
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 overflow-hidden">
      
      {/* ================= LEFT COLUMN: PRODUCT GRID (65% width) ================= */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
        
        {/* Header & Search */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Katalog Produk</h1>
            <p className="text-slate-500 mt-1">Pilih produk untuk ditambahkan ke keranjang.</p>
          </div>
          
          {/* Search Bar with Orange Focus */}
          <div className="relative w-full sm:w-72 group">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ffad00] transition-colors">
                <Search size={20} />
             </div>
             <input 
               type="text" 
               placeholder="Cari produk..." 
               className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <div className="animate-spin mr-2 h-5 w-5 border-2 border-[#307fe2] border-t-transparent rounded-full"></div>
                Memuat Produk...
            </div>
        ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Package size={48} className="mb-2 opacity-50"/>
                <p>Produk tidak ditemukan.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {filteredProducts.map(product => (
                <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="group bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-[#307fe2] hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
                >
                {/* Low Stock Indicator */}
                {product.stok <= 5 && (
                    <div className="absolute top-3 right-3 z-10">
                        <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffad00] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ffad00]"></span>
                        </span>
                    </div>
                )}

                {/* Image Area */}
                <div className="aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-slate-100">
                    {product.foto ? (
                    <img src={`http://localhost:8000/storage/${product.foto}`} alt={product.nama_produk} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                    <ImageIcon className="text-slate-300 w-12 h-12" />
                    )}
                </div>

                {/* Content */}
                <div>
                    <h3 className="font-bold text-slate-800 truncate mb-1" title={product.nama_produk}>{product.nama_produk}</h3>
                    <div className="flex justify-between items-end">
                        <span className="text-[#307fe2] font-bold text-lg">
                            {parseInt(product.harga_jual).toLocaleString('id-ID')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                            product.stok > 5 
                            ? 'bg-green-50 text-green-600 border-green-100' 
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                            Stok: {product.stok}
                        </span>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* ================= RIGHT COLUMN: CART (35% width) ================= */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col h-full shadow-xl z-20">
        
        {/* Cart Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg text-[#307fe2]">
                <ShoppingCart size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Keranjang</h2>
          </div>
          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-md">
            {cart.length} Item
          </span>
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="bg-slate-100 p-6 rounded-full">
                    <ShoppingCart size={40} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">Keranjang masih kosong</p>
                <p className="text-xs max-w-[200px] text-center opacity-70">Pilih produk di sebelah kiri untuk memulai transaksi.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex flex-col bg-white p-3 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-semibold text-slate-800 line-clamp-1">{item.nama_produk}</h4>
                   <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>
                
                <div className="flex justify-between items-end">
                    <p className="text-[#307fe2] font-medium text-sm">
                        {parseInt(item.harga_jual * item.qty).toLocaleString('id-ID')}
                    </p>
                    
                    <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1">
                      <button 
                        onClick={() => updateQty(item.id, -1)} 
                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:text-[#ffad00] transition-colors"
                      >
                        <Minus size={12} strokeWidth={3}/>
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-700">{item.qty}</span>
                      <button 
                        onClick={() => updateQty(item.id, 1)} 
                        className="w-6 h-6 flex items-center justify-center bg-[#307fe2] text-white rounded shadow-sm hover:bg-blue-600 transition-colors"
                      >
                        <Plus size={12} strokeWidth={3} />
                      </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment Area (Fixed) */}
        <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          
          {/* Totals */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-slate-500 text-sm">
                <span>Subtotal</span>
                <span>{formatRupiah(grandTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-slate-800 font-bold text-lg">Total Tagihan</span>
                <span className="text-[#307fe2] font-bold text-2xl">{formatRupiah(grandTotal)}</span>
            </div>
          </div>
          
          {/* Input Cash - Orange Focus */}
          <div className="mb-4 relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ffad00] transition-colors">
                <Banknote size={20} />
            </div>
            <input 
              type="number" 
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all font-mono text-lg font-medium text-right text-slate-800"
              placeholder="0"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
            />
            <span className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">IDR</span>
          </div>

          {/* Change Display */}
          <div className={`flex justify-between items-center p-3 rounded-xl mb-4 transition-colors ${
              changeAmount >= 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-slate-50 text-slate-400 border border-slate-100'
          }`}>
            <span className="font-medium text-sm">Kembalian</span>
            <span className="font-mono font-bold text-lg">
                {changeAmount >= 0 ? formatRupiah(changeAmount) : '-'}
            </span>
          </div>

          {/* Checkout Button */}
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
              cart.length === 0 || processing
                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-[#307fe2] to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200'
            }`}
          >
            {processing ? (
                <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                </>
            ) : (
                <>
                    Bayar Sekarang
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Penjualan;

//next benerin ini UI nya
//+ bikin responsive semua page.