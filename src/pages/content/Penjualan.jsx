import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Package, 
  ImageIcon, 
  AlertCircle,
  Banknote,
  ChevronRight,
  Check,       
  X,           
  Printer      
} from 'lucide-react';

const Penjualan = () => {
  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cashReceived, setCashReceived] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // New State for Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState({
    total: 0,
    cash: 0,
    change: 0
  });

  // 2. Initialize Navigate Hook
  const navigate = useNavigate();

  // --- HELPERS ---
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  const getNumericCash = (formattedString) => {
    if (!formattedString) return 0;
    return parseInt(formattedString.replace(/\D/g, '')) || 0;
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
    if (product.stok <= 0) return;

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
  //eslint-disable-next-line no-unused-vars
  const changeAmount = getNumericCash(cashReceived) - grandTotal;

  // --- CHECKOUT ---
  const handleCheckout = async () => {
    const numericCash = getNumericCash(cashReceived);

    if (cart.length === 0) return alert("Keranjang kosong!");
    if (numericCash < grandTotal) return alert("Uang kurang!");

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        items: cart.map(item => ({ id: item.id, qty: item.qty })),
        uang_diberikan: numericCash
      };

      await axios.post('http://localhost:8000/api/transactions', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLastTransaction({
        total: grandTotal,
        cash: numericCash,
        change: numericCash - grandTotal
      });

      setShowSuccessModal(true);
      fetchProducts(); 

    } catch (error) {
      console.error("Checkout failed", error);
      alert(error.response?.data?.message || "Transaksi Gagal");
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCart([]);
    setCashReceived('');
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
      
      {/* ================= SUCCESS MODAL ================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="bg-emerald-50 p-6 flex flex-col items-center justify-center border-b border-emerald-100">
                 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <Check size={32} strokeWidth={3} />
                 </div>
                 <h2 className="text-xl font-bold text-slate-800">Transaksi Berhasil!</h2>
                 <p className="text-slate-500 text-sm">Pembayaran telah terverifikasi</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Total Tagihan</span>
                       <span className="font-semibold text-slate-800">{formatRupiah(lastTransaction.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-slate-500">Uang Diterima</span>
                       <span className="font-semibold text-slate-800">{formatRupiah(lastTransaction.cash)}</span>
                    </div>
                    <div className="border-t border-dashed border-slate-200 my-2"></div>
                    <div className="flex justify-between items-center">
                       <span className="text-slate-800 font-bold">Kembalian</span>
                       <span className="text-xl font-bold text-emerald-600">{formatRupiah(lastTransaction.change)}</span>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="grid grid-cols-1 gap-3 mt-6">
                    {/* 3. Updated Button to Navigate to Riwayat */}
                    <button 
                        onClick={() => navigate('/dashboard/riwayat')} 
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                    >
                       <Printer size={18} />
                       <span>Cetak Struk</span>
                    </button>

                    <button 
                       onClick={handleCloseModal}
                       className="w-full py-3 bg-[#307fe2] hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                       Transaksi Baru
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ================= LEFT COLUMN: PRODUCT CATALOG (65%) ================= */}
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

      {/* ================= RIGHT COLUMN: CART (35%) ================= */}
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
                 
                 <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                    Rp
                 </div>

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
    </div>
  );
};

export default Penjualan;