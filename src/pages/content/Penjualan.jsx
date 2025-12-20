// src/pages/Penjualan.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, Package, ImageIcon, 
  AlertCircle, Banknote, ChevronRight, Check, Printer 
} from 'lucide-react';

// 1. IMPORT THE PRINT COMPONENT
import StrukPrint from '../../components/others/StrukPrint';

const Penjualan = () => {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cashReceived, setCashReceived] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Modal & Receipt State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null); // Stores data for the receipt

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', isExiting: false });

  //eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const componentRef = useRef(); // Ref for the hidden print component

  // --- HELPERS ---
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(number);
  };

  const getNumericCash = (formattedString) => {
    if (!formattedString) return 0;
    return parseInt(formattedString.replace(/\D/g, '')) || 0;
  };

  // --- TOAST LOGIC ---
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type, isExiting: false });
  };

  useEffect(() => {
    if (toast.show) {
      const exitTimer = setTimeout(() => setToast(prev => ({ ...prev, isExiting: true })), 2700);
      const removeTimer = setTimeout(() => setToast(prev => ({ ...prev, show: false, isExiting: false })), 3000);
      return () => { clearTimeout(exitTimer); clearTimeout(removeTimer); };
    }
  }, [toast.show]);

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
      triggerToast("Gagal memuat produk", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- CART LOGIC ---
  const addToCart = (product) => {
    if (product.stok <= 0) {
        return triggerToast(`Stok ${product.nama_produk} habis!`, 'error');
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if(existingItem.qty + 1 > product.stok) {
            triggerToast("Stok tidak mencukupi", 'error');
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
             triggerToast("Mencapai batas stok", 'error');
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

  const handleCashInput = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue === '') {
        setCashReceived('');
    } else {
        const formatted = new Intl.NumberFormat('id-ID').format(rawValue);
        setCashReceived(formatted);
    }
  };

  // --- CALCULATIONS ---
  const grandTotal = cart.reduce((sum, item) => sum + (item.harga_jual * item.qty), 0);

  // --- CHECKOUT & PRINT LOGIC ---
  const handleCheckout = async () => {
    const numericCash = getNumericCash(cashReceived);

    // 1. Validation
    if (cart.length === 0) return triggerToast("Keranjang belanja kosong!", "error");
    if (numericCash < grandTotal) return triggerToast("Uang pembayaran kurang!", "error");

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        items: cart.map(item => ({ id: item.id, qty: item.qty })),
        uang_diberikan: numericCash
      };

      // 2. Call API
      const response = await axios.post('http://localhost:8000/api/transactions', payload, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json' 
        }
      });

      // 3. PREPARE RECEIPT DATA *BEFORE* CLEARING CART
      const user = JSON.parse(localStorage.getItem('user'));
      
      const receiptData = {
          store_name: user?.store_name || "Mantra Store",
          store_address: user?.address || "Jl. Alamat Toko Belum Diisi",
          store_phone: user?.phone || "Telp: -",
          invoice: response.data.transaksi.kode_transaksi,
          cashier: user?.name,
          date: new Date(),
          items: cart.map(item => ({
              name: item.nama_produk,
              qty: item.qty,
              price: item.harga_jual
          })),
          total: grandTotal,
          cash: numericCash,
          change: numericCash - grandTotal
      };

      setLastTransaction(receiptData);
      setShowSuccessModal(true);
      fetchProducts(); // Refresh stock from server

    } catch (error) {
      console.error("Checkout failed", error);
      if (error.response?.data?.message) {
          triggerToast(error.response.data.message, "error");
      } else {
          triggerToast("Terjadi kesalahan transaksi", "error");
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCart([]);
    setCashReceived('');
    setLastTransaction(null);
  };

  const handlePrint = () => {
      window.print();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !processing && cart.length > 0) {
       const numericCash = getNumericCash(cashReceived);
       if (numericCash >= grandTotal) {
           handleCheckout();
       }
    }
  };

  const filteredProducts = products.filter(p => 
    p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 h-[calc(100vh-10px)] max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 relative">
      
      {/* 1. HIDDEN RECEIPT COMPONENT (Visible only during print) */}
      <StrukPrint ref={componentRef} data={lastTransaction} />

      {/* 2. CUSTOM TOAST */}
      {toast.show && (
        <div className="fixed top-6 left-0 w-full flex justify-center z-100 pointer-events-none">
           <div 
             className={`pointer-events-auto bg-white border shadow-xl rounded-full px-6 py-3 flex items-center gap-3 relative overflow-hidden ${
               toast.type === 'error' ? 'border-red-100 shadow-red-500/10' : 'border-slate-200 shadow-slate-200/50'
             } ${
               toast.isExiting 
                 ? 'animate-[slideUp_0.4s_ease-in_forwards]' 
                 : 'animate-[slideDown_0.4s_ease-out_forwards]'
             }`}
           >
              <div className={`p-1 rounded-full relative z-10 ${
                  toast.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
              }`}>
                 {toast.type === 'error' ? <AlertCircle size={14} strokeWidth={3} /> : <Check size={14} strokeWidth={3} />}
              </div>
              <span className="text-slate-700 font-medium text-sm relative z-10 pr-2">
                {toast.message}
              </span>
              <div className={`absolute bottom-0 left-0 h-[3px] w-full animate-[shrink_3s_linear_forwards] ${
                  toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
              }`} />
           </div>
        </div>
      )}

      {/* 3. REDESIGNED SUCCESS MODAL (Blue Theme) */}
      {showSuccessModal && lastTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Header: Brand Blue */}
              <div className="bg-[#307fe2] p-6 text-center text-white relative overflow-hidden">
                 <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20">
                        <Check size={32} strokeWidth={4} />
                    </div>
                    <h2 className="text-xl font-bold">Transaksi Berhasil</h2>
                    <p className="text-blue-100 text-sm mt-1">{lastTransaction.invoice}</p>
                 </div>
                 {/* Background Pattern */}
                 <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
              </div>

              {/* Body */}
              <div className="p-6 bg-slate-50">
                 <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Total Tagihan</span>
                       <span className="font-bold text-slate-800">{formatRupiah(lastTransaction.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Tunai</span>
                       <span className="font-medium text-slate-800">{formatRupiah(lastTransaction.cash)}</span>
                    </div>
                    <div className="border-t border-dashed border-slate-200 my-1"></div>
                    <div className="flex justify-between text-base">
                       <span className="text-slate-800 font-bold">Kembalian</span>
                       <span className="font-bold text-[#307fe2]">{formatRupiah(lastTransaction.change)}</span>
                    </div>
                 </div>

                 {/* Buttons */}
                 <div className="grid grid-cols-2 gap-3 mt-6">
                    <button 
                        onClick={handlePrint} 
                        className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 hover:border-[#307fe2] hover:text-[#307fe2] text-slate-600 rounded-xl font-bold transition-all"
                    >
                       <Printer size={18} /> Cetak
                    </button>

                    <button 
                       onClick={handleCloseModal}
                       className="py-3 bg-[#307fe2] hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all"
                    >
                      Selesai
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ================= LEFT COLUMN: PRODUCT CATALOG ================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kasir / POS</h1>
            <p className="text-slate-500 mt-1">Pilih produk untuk memulai transaksi baru.</p>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center w-full sm:w-72 group focus-within:border-[#ffad00] focus-within:ring-4 focus-within:ring-[#ffad00]/10 transition-all">
             <div className="p-2 text-slate-400 group-focus-within:text-[#ffad00] transition-colors">
                <Search size={20} />
             </div>
             <input 
               type="text" 
               placeholder="Cari produk..." 
               className="w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 h-full py-1"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-y-auto custom-scrollbar">
           {loading ? (
             <div className="flex h-full items-center justify-center text-slate-400 gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-[#307fe2] border-t-transparent rounded-full"></div>
                <span>Memuat Katalog...</span>
             </div>
           ) : filteredProducts.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                 <Package size={48} className="mb-2"/>
                 <p>Produk tidak ditemukan.</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
               {filteredProducts.map(product => (
                 <div 
                   key={product.id} 
                   onClick={() => addToCart(product)}
                   className="group relative bg-white rounded-xl border border-slate-200 p-3 hover:shadow-lg hover:border-[#307fe2]/50 transition-all duration-300 cursor-pointer overflow-hidden"
                 >
                    {/* Image */}
                    <div className="aspect-square bg-slate-50 rounded-lg mb-3 overflow-hidden relative flex items-center justify-center">
                        {product.foto ? (
                          <img src={`http://localhost:8000/storage/${product.foto}`} alt={product.nama_produk} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        ) : (
                          <ImageIcon className="text-slate-300 w-10 h-10" />
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center backdrop-blur-[1px]">
                           <div className="bg-[#ffad00] text-white p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                              <Plus size={20} strokeWidth={3}/>
                           </div>
                        </div>

                        {/* Stock Badge */}
                        {product.stok <= 5 && (
                          <div className="absolute top-2 right-2 bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                             <AlertCircle size={18} />
                          </div>
                        )}
                    </div>

                    {/* Content */}
                    <div>
                       <h3 className="font-semibold text-slate-800 text-sm truncate mb-1">{product.nama_produk}</h3>
                       <div className="flex justify-between items-center">
                          <span className="text-[#307fe2] font-bold text-sm">
                             {parseInt(product.harga_jual).toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                             Stok: {product.stok}
                          </span>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* ================= RIGHT COLUMN: CART ================= */}
      <div className="w-full lg:w-96 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 z-20">
        
        {/* Cart Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-[#307fe2]">
                 <ShoppingCart size={20} />
              </div>
              <div>
                 <h2 className="text-lg font-bold text-slate-900 leading-tight">Keranjang</h2>
                 <p className="text-xs text-slate-500">List belanja pelanggan</p>
              </div>
           </div>
           <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200">
              {cart.length} Item
           </span>
        </div>

        {/* Cart List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
           {cart.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 opacity-60">
                <ShoppingCart size={40} strokeWidth={1.5} />
                <p className="text-sm font-medium">Keranjang kosong</p>
             </div>
           ) : (
             cart.map(item => (
               <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 group animate-in slide-in-from-right-2 duration-300">
                  <div className="flex justify-between items-start">
                     <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{item.nama_produk}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                             @{parseInt(item.harga_jual).toLocaleString('id-ID')}
                           </span>
                        </div>
                     </div>
                     <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={16} />
                     </button>
                  </div>
                  
                  <div className="flex justify-between items-end pt-1">
                     <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                        <button 
                           onClick={() => updateQty(item.id, -1)} 
                           className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-[#ffad00] active:scale-90 transition-all"
                        >
                           <Minus size={12} strokeWidth={3}/>
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-700">{item.qty}</span>
                        <button 
                           onClick={() => updateQty(item.id, 1)} 
                           className="w-6 h-6 flex items-center justify-center bg-[#307fe2] text-white rounded shadow-sm hover:bg-blue-600 active:scale-90 transition-all"
                        >
                           <Plus size={12} strokeWidth={3}/>
                        </button>
                     </div>
                     <p className="font-semibold text-[#307fe2] text-sm">
                        {parseInt(item.harga_jual * item.qty).toLocaleString('id-ID')}
                     </p>
                  </div>
               </div>
             ))
           )}
        </div>

        {/* Footer Payment Section */}
        <div className="p-5 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] rounded-b-2xl relative">
           
           {/* Totals */}
           <div className="mb-5">
              <div className="flex justify-between items-center">
                 <span className="text-slate-800 font-bold">Total Tagihan</span>
                 <span className="text-[#307fe2] font-bold text-xl">{formatRupiah(grandTotal)}</span>
              </div>
           </div>

           {/* Cash Input */}
           <div className="space-y-3">
              <div className="relative group">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ffad00] transition-colors">
                    <Banknote size={18} />
                 </div>
                 <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">Rp</div>
                 <input 
                   type="text" 
                   inputMode="numeric"
                   placeholder="Masukkan nominal..." 
                   className="w-full pl-16 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all text-right text-slate-800 placeholder-slate-400 font-semibold"
                   value={cashReceived}
                   onChange={handleCashInput}
                   onKeyDown={handleKeyDown}
                 />
              </div>

              {/* Change Indicator */}
              {getNumericCash(cashReceived) - grandTotal >= 0 && (
                <div className="flex justify-between items-center px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-sm animate-in fade-in slide-in-from-top-1">
                   <span className="font-medium">Kembalian</span>
                   <span className="font-bold">{formatRupiah(getNumericCash(cashReceived) - grandTotal)}</span>
                </div>
              )}

              {/* Action Button */}
              <button 
                 onClick={handleCheckout}
                 disabled={cart.length === 0 || processing}
                 className={`w-full py-3 rounded-xl font-medium text-white shadow-lg transition-all flex items-center justify-center gap-2 group ${
                   cart.length === 0 || processing
                   ? 'bg-slate-300 shadow-none cursor-not-allowed'
                   : 'bg-[#307fe2] hover:bg-blue-700 shadow-blue-200'
                 }`}
              >
                 {processing ? (
                    <>
                       <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                       <span>Memproses...</span>
                    </>
                 ) : (
                    <>
                       <span>Bayar Sekarang</span>
                       <ChevronRight size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
                    </>
                 )}
              </button>
           </div>
        </div>
      </div>

      {/* Inline Animations */}
      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-150%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-150%); } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
};

export default Penjualan;