// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Store, ArrowRight, TrendingUp, Package, CreditCard, FileBox, FolderClock} from 'lucide-react';
import { toast } from 'sonner';

// Slider content - Kept simple
const loginSlides = [
  {
    id: 1,
    title: "Kelola Toko Anda dengan Mudah",
    description: "Sistem Kasir Toko yang membantu mencatat barang, transaksi penjualan, dan riwayat penjualan secara cepat dan akurat.",
    icon: Store,
  },
  {
    id: 2,
    title: "Manajemen Barang & Penjualan Terintegrasi",
    description: "Tambahkan barang, atur harga jual, dan lakukan transaksi penjualan dengan perhitungan otomatis dalam satu sistem.",
    icon: FileBox,
  },
  {
    id: 3,
    title: "Pantau Riwayat Penjualan",
    description: "Lihat detail transaksi, waktu penjualan, dan jumlah barang terjual kapan saja.",
    icon: FolderClock,
  }
];

const Login = () => {
  // --- STATE MANAGEMENT ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // --- LOGIC: SLIDER ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % loginSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // --- LOGIC: AUTHENTICATION ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Data tidak lengkap', { description: 'Mohon isi email dan password.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Selamat datang, ${data.user.name}`);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        toast.error('Login Gagal', { description: data.message || 'Cek kembali kredensial anda.' });
      }
      //eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error('Koneksi Error', { description: 'Gagal menghubungi server.' });
    } finally {
      setLoading(false);
    }
  };

  // --- UI RENDER ---
  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800">
      
      {/* LEFT SIDE (30% Color Rule - Brand Blue) */}
      {/* Principle: Hierarchy & Consistency */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#307fe2] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Pattern Overlay for texture */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <img
              src="/images/m_white.png"
              alt="Mantra"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="text-xl font-bold tracking-wide">Mantra</span>
        </div>

        {/* Slider */}
        <div className="relative z-10 mt-auto mb-20">
          {loginSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`transition-all duration-700 absolute bottom-0 left-0 right-0 ${
                index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
              }`}
            >
              <div className="mb-6 inline-block p-3 bg-white/10 rounded-2xl text-white">
                <slide.icon className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-4 leading-tight">
                {slide.title}
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed opacity-90">
                {slide.description}
              </p>
            </div>
          ))}
          {/* Spacer to hold height */}
          <div className="opacity-0 pointer-events-none">
             <h2 className="text-3xl font-bold mb-4">Placeholder</h2>
             <p className="text-lg">Placeholder content for height</p>
          </div>
        </div>

        {/* Indicators */}
        <div className="relative z-10 flex gap-2">
          {loginSlides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-[#ffad00]' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* RIGHT SIDE (60% Color Rule - White/Neutral) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden flex items-center gap-2 mb-8 text-[#307fe2]">
            <Store className="w-8 h-8" />
            <span className="text-2xl font-bold">Mantra</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Selamat Datang</h1>
            <p className="text-slate-500">Masuk untuk mengelola toko Anda.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#307fe2] focus:ring-1 focus:ring-[#307fe2] transition-all"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="text-sm font-medium text-[#307fe2] hover:text-[#ffad00] transition-colors">
                  Lupa password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#307fe2] focus:ring-1 focus:ring-[#307fe2] transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Primary Button (30% Color usage) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#307fe2] hover:bg-[#2563b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#307fe2] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Masuk <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Atau</span>
            </div>
          </div>

          {/* Secondary Action - Uses the Accent Color (10%) for emphasis without overwhelming */}
          <div className="text-center">
            <p className="text-slate-600 text-sm mb-3">Belum memiliki akun toko?</p>
            <Link 
              to="/register" 
              className="inline-flex w-full justify-center items-center px-4 py-3 border-2 border-[#ffad00] text-slate-800 font-semibold rounded-lg hover:bg-[#ffad00]/10 transition-colors duration-200"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;