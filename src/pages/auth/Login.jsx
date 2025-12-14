// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Store, ArrowRight, CheckCircle, TrendingUp, Package, CreditCard } from 'lucide-react';
import { toast } from 'sonner';


// things to do : 
// fix color on loginb and register page
// edit the ui on other pages to be more consistent with the login and register page

// Login slider content
const loginSlides = [
  {
    id: 1,
    title: "Kelola Transaksi",
    description: "Sistem kasir intuitif untuk proses transaksi yang cepat dan akurat.",
    icon: CreditCard,
    gradient: "from-[#307fe2] via-[#307fe2] to-[#1a5fb0]"
  },
  {
    id: 2,
    title: "Analisis Real-Time",
    description: "Pantau performa bisnis Anda dengan dashboard dan laporan real-time.",
    icon: TrendingUp,
    gradient: "from-[#307fe2] via-[#2b72d1] to-[#1a5fb0]"
  },
  {
    id: 3,
    title: "Stok Terkontrol",
    description: "Otomatiskan manajemen stok dengan sistem notifikasi cerdas.",
    icon: Package,
    gradient: "from-[#307fe2] via-[#307fe2] to-[#2b72d1]"
  }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  const nextSlide = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % loginSlides.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 300);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email harus diisi';
      toast.error('Email diperlukan', {
        description: 'Harap masukkan alamat email Anda',
        duration: 4000,
      });
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid';
      toast.warning('Format email tidak valid', {
        description: 'Pastikan email mengandung @ dan domain yang valid',
        duration: 5000,
      });
    }

    if (!password) {
      newErrors.password = 'Password harus diisi';
      if (!newErrors.email) {
        toast.error('Password diperlukan', {
          description: 'Harap masukkan password Anda',
          duration: 4000,
        });
      }
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
      if (!newErrors.email) {
        toast.info('Password terlalu pendek', {
          description: 'Password harus minimal 6 karakter untuk keamanan',
          duration: 4000,
        });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Login berhasil!', {
          description: `Selamat datang kembali, ${data.user.name}`,
          duration: 3000,
        });
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error('Login gagal', {
          description: data.message || 'Email atau password salah',
          duration: 5000,
        });
      }
    } catch (err) {
      toast.error('Koneksi error', {
        description: 'Pastikan server backend sedang berjalan',
        duration: 5000,
      });
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-gray-50 to-gray-100">
      {/* Left Side - Blue themed slider */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden transition-all duration-700">
        {/* Animated background gradient */}
        <div className={`absolute inset-0 transition-all duration-700 ${loginSlides[currentSlide].gradient}`}>
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffad00]/5 rounded-full -translate-y-64 translate-x-64 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ffad00]/5 rounded-full translate-y-48 -translate-x-48 animate-pulse-slow delay-1000"></div>
          
          {/* Floating shapes with blue theme */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-white/20 rounded-full animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-white/15 rounded-full animate-float-delayed"></div>
          
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 animate-shimmer"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 xl:px-24 w-full">
          <div className="max-w-md">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3 mb-8 animate-fade-in">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30">
                <Store className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Mantra</h1>
            </div>
            
            {/* Slider content */}
            <div className="relative h-64 overflow-hidden mb-8">
              {loginSlides.map((slide, index) => {
                const Icon = slide.icon;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 transform ${
                      index === currentSlide
                        ? 'translate-x-0 opacity-100'
                        : index < currentSlide
                        ? '-translate-x-full opacity-0'
                        : 'translate-x-full opacity-0'
                    } ${isTransitioning ? 'scale-95' : 'scale-100'}`}
                  >
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 transform transition-transform hover:scale-110">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                      {slide.title}{' '}
                      <span className="text-[#ffad00]">Lebih Mudah</span>
                    </h2>
                    <p className="text-lg text-blue-100">
                      {slide.description}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Feature list */}
            <div className="space-y-3">
              {["Transaksi cepat & aman", "Laporan real-time", "Manajemen stok otomatis"].map((feature, i) => (
                <div 
                  key={i} 
                  className="flex items-center space-x-3 text-white/90 animate-fade-in-up"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#ffad00] flex items-center justify-center transform hover:scale-125 transition-transform duration-300">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {loginSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 transform hover:scale-150 ${
                index === currentSlide 
                  ? 'bg-[#ffad00] w-8 shadow-lg shadow-[#ffad00]/50' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#307fe2]/50 via-transparent to-transparent"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 lg:flex-none">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-slide-in-right">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-[#307fe2] to-[#1a5fb0] rounded-lg flex items-center justify-center shadow-md transform hover:scale-110 transition-transform duration-300">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mantra</h1>
                <p className="text-xs text-gray-500">Sistem Kasir Terpadu</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:border-blue-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Selamat Datang
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Masuk ke akun Anda untuk mengelola toko
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#307fe2] transition-colors duration-300" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                        errors.email 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#307fe2]/20 focus:border-[#307fe2] hover:border-blue-300'
                      }`}
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError('email');
                      }}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                      <svg className="w-4 h-4 mr-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-xs font-medium text-[#307fe2] hover:text-[#1a5fb0] transition-colors duration-200 group">
                      <span className="group-hover:underline">Lupa password?</span>
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#307fe2] transition-colors duration-300" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className={`block w-full pl-10 pr-10 py-3 border rounded-xl placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                        errors.password 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#307fe2]/20 focus:border-[#307fe2] hover:border-blue-300'
                      }`}
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError('password');
                      }}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#307fe2] transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-[#307fe2] transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                      <svg className="w-4 h-4 mr-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-linear-to-r from-[#307fe2] to-[#1a5fb0] hover:from-[#2b72d1] hover:to-[#1954a0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#307fe2] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Belum punya akun?</span>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  to="/register" 
                  className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-[#ffad00] rounded-xl text-sm font-semibold text-gray-900 bg-white hover:bg-[#ffad00]/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffad00]/50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Daftar Akun Baru
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;