// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Store, Mail, Lock, ArrowRight, Zap, Clock, Headphones, Award } from 'lucide-react';
import { toast } from 'sonner';

// Register slider content
const registerSlides = [
  {
    id: 1,
    title: "Mulai Bisnis",
    description: "Setup toko Anda dalam 5 menit dan mulai berjualan segera.",
    icon: Zap,
    gradient: "from-[#ffad00] via-[#ffad00] to-[#e69c00]"
  },
  {
    id: 2,
    title: "Gratis Uji Coba",
    description: "Nikmati semua fitur premium tanpa biaya selama 30 hari.",
    icon: Clock,
    gradient: "from-[#ffad00] via-[#ffb31a] to-[#ff9900]"
  },
  {
    id: 3,
    title: "Dukungan 24/7",
    description: "Tim ahli siap membantu Anda kapan saja dibutuhkan.",
    icon: Headphones,
    gradient: "from-[#ffcc00] via-[#ffad00] to-[#ffb31a]"
  }
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    store_name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
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
      setCurrentSlide((prev) => (prev + 1) % registerSlides.length);
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

    if (!formData.name) {
      newErrors.name = 'Nama lengkap harus diisi';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Nama minimal 2 karakter';
    }

    if (!formData.store_name) {
      newErrors.store_name = 'Nama toko harus diisi';
    } else if (formData.store_name.length < 2) {
      newErrors.store_name = 'Nama toko minimal 2 karakter';
    }

    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Password tidak cocok';
    }

    setErrors(newErrors);

    // Show toast for the first error found
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error('Form belum lengkap', {
        description: firstError,
        duration: 4000,
      });
    }

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
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Registrasi berhasil!', {
          description: `Selamat datang ${data.user.name}, toko "${data.user.store_name}" berhasil dibuat`,
          duration: 4000,
        });
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast.error('Registrasi gagal', {
          description: data.message || 'Terjadi kesalahan saat membuat akun',
          duration: 5000,
        });
      }
    } catch (err) {
      toast.error('Koneksi error', {
        description: 'Pastikan server backend sedang berjalan',
        duration: 5000,
      });
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    clearError(name);
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-gray-50 to-gray-100">
      {/* Left Side - Yellow themed slider */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden transition-all duration-700">
        {/* Animated background gradient */}
        <div className={`absolute inset-0 transition-all duration-700 ${registerSlides[currentSlide].gradient}`}>
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#307fe2]/5 rounded-full -translate-y-64 translate-x-64 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#307fe2]/5 rounded-full translate-y-48 -translate-x-48 animate-pulse-slow delay-1000"></div>
          
          {/* Floating shapes with yellow theme */}
          <div className="absolute top-1/3 right-1/4 w-28 h-28 border-2 border-white/20 rounded-full animate-float"></div>
          <div className="absolute bottom-1/3 left-1/4 w-20 h-20 border border-white/15 rounded-full animate-float-delayed"></div>
          
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 animate-shimmer"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 xl:px-24 w-full">
          <div className="max-w-md">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3 mb-8 animate-fade-in">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-yellow-500/30">
                <Store className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Mantra</h1>
            </div>
            
            {/* Slider content */}
            <div className="relative h-64 overflow-hidden mb-8">
              {registerSlides.map((slide, index) => {
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
                      <span className="text-[#307fe2]">Hari Ini</span>
                    </h2>
                    <p className="text-lg text-yellow-100">
                      {slide.description}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Feature list */}
            <div className="space-y-3">
              {["Setup toko dalam 5 menit", "Gratis uji coba 30 hari", "Dukungan 24/7 dari tim ahli"].map((feature, i) => (
                <div 
                  key={i} 
                  className="flex items-center space-x-3 text-white/90 animate-fade-in-up"
                  style={{ animationDelay: `${i * 200}ms` }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#307fe2] flex items-center justify-center transform hover:scale-125 transition-transform duration-300">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {registerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 transform hover:scale-150 ${
                index === currentSlide 
                  ? 'bg-[#307fe2] w-8 shadow-lg shadow-[#307fe2]/50' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#ffad00]/50 via-transparent to-transparent"></div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 lg:flex-none">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-slide-in-left">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-[#ffad00] to-[#e69c00] rounded-lg flex items-center justify-center shadow-md transform hover:scale-110 transition-transform duration-300">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mantra</h1>
                <p className="text-xs text-gray-500">Sistem Kasir Terpadu</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:border-yellow-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Buat Akun Baru
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Lengkapi data berikut untuk melanjutkan.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#ffad00] transition-colors duration-300" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                        errors.name 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#ffad00]/20 focus:border-[#ffad00] hover:border-yellow-300'
                      }`}
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                      <svg className="w-4 h-4 mr-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Store Name Field */}
                <div>
                  <label htmlFor="store_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Toko
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Store className="h-5 w-5 text-gray-400 group-focus-within:text-[#ffad00] transition-colors duration-300" />
                    </div>
                    <input
                      id="store_name"
                      name="store_name"
                      type="text"
                      autoComplete="organization"
                      required
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                        errors.store_name 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-2 focus:ring-[#ffad00]/20 focus:border-[#ffad00] hover:border-yellow-300'
                      }`}
                      placeholder="Masukkan nama toko"
                      value={formData.store_name}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.store_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                      <svg className="w-4 h-4 mr-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      {errors.store_name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#ffad00] transition-colors duration-300" />
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
                          : 'border-gray-300 focus:ring-2 focus:ring-[#ffad00]/20 focus:border-[#ffad00] hover:border-yellow-300'
                      }`}
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleChange}
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

                {/* Password Fields in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#ffad00] transition-colors duration-300" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        className={`block w-full pl-10 pr-10 py-3 border rounded-xl placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                          errors.password 
                            ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50' 
                            : 'border-gray-300 focus:ring-2 focus:ring-[#ffad00]/20 focus:border-[#ffad00] hover:border-yellow-300'
                        }`}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#ffad00] transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-[#ffad00] transition-colors" />
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

                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#ffad00] transition-colors duration-300" />
                      </div>
                      <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-400 focus:outline-none transition-all duration-200 ${
                          errors.password_confirmation 
                            ? 'border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50' 
                            : 'border-gray-300 focus:ring-2 focus:ring-[#ffad00]/20 focus:border-[#ffad00] hover:border-yellow-300'
                        }`}
                        placeholder="Ulangi Password"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.password_confirmation && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                        <svg className="w-4 h-4 mr-1 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        {errors.password_confirmation}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-linear-to-r from-[#ffad00] to-[#e69c00] hover:from-[#ffb31a] hover:to-[#ff9900] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ffad00] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Membuat Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
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
                  <span className="px-4 bg-white text-gray-500">Sudah punya akun?</span>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center justify-center w-full py-3 px-4 border-2 border-[#307fe2] rounded-xl text-sm font-semibold text-gray-900 bg-white hover:bg-[#307fe2]/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#307fe2]/50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Masuk ke Akun
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;