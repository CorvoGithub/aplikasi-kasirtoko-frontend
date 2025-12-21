// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Store,
  ArrowRight,
  FileBox,
  FolderClock,
  Check,
  AlertCircle,
} from "lucide-react";

const loginSlides = [
  {
    id: 1,
    title: "Kelola Toko Anda dengan Mudah",
    description:
      "Sistem Kasir Toko yang membantu mencatat barang, transaksi penjualan, dan riwayat penjualan secara cepat dan akurat.",
    icon: Store,
  },
  {
    id: 2,
    title: "Manajemen Barang & Penjualan",
    description:
      "Tambahkan barang, atur harga jual, dan lakukan transaksi penjualan dengan perhitungan otomatis dalam satu sistem.",
    icon: FileBox,
  },
  {
    id: 3,
    title: "Pantau Riwayat Penjualan",
    description:
      "Lihat detail transaksi, waktu penjualan, dan jumlah barang terjual kapan saja.",
    icon: FolderClock,
  },
];

const Login = () => {
  // --- STATE ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(-1);

  // Toast State
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
    isExiting: false,
  });

  const navigate = useNavigate();

  // --- SLIDER LOGIC ---
  useEffect(() => {
    const interval = setInterval(() => {
      setPrevSlide(currentSlide);
      setCurrentSlide((prev) => (prev + 1) % loginSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  // --- TOAST LOGIC ---
  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type, isExiting: false });
  };

  useEffect(() => {
    if (toast.show) {
      const exitTimer = setTimeout(
        () => setToast((prev) => ({ ...prev, isExiting: true })),
        2700
      );
      const removeTimer = setTimeout(
        () => setToast((prev) => ({ ...prev, show: false, isExiting: false })),
        3000
      );
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [toast.show]);

  // --- AUTH LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      triggerToast("Mohon isi email dan password.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        triggerToast(`Selamat datang, ${data.user.name}`, "success");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => navigate("/dashboard/main"), 800);
      } else {
        if (response.status === 422 || response.status === 401) {
          triggerToast("Email atau password tidak sesuai.", "error");
        } else {
          triggerToast(data.message || "Terjadi kesalahan.", "error");
        }
        setPassword("");
      }
    } catch (err) {
      console.error("Login Error:", err);
      triggerToast("Gagal menghubungi server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-800 relative">
      {/* Custom Toast */}
      {toast.show && (
        <div className="fixed top-6 left-0 w-full flex justify-center z-100 pointer-events-none">
          <div
            className={`pointer-events-auto bg-white border shadow-xl rounded-full px-6 py-3 flex items-center gap-3 relative overflow-hidden ${
              toast.type === "error"
                ? "border-red-100 shadow-red-500/10"
                : "border-slate-200 shadow-slate-200/50"
            } ${
              toast.isExiting
                ? "animate-[slideUp_0.5s_ease-in_forwards]"
                : "animate-[slideDown_0.5s_ease-out_forwards]"
            }`}
          >
            <div
              className={`p-1 rounded-full relative z-10 ${
                toast.type === "error"
                  ? "bg-red-100 text-red-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {toast.type === "error" ? (
                <AlertCircle size={14} strokeWidth={3} />
              ) : (
                <Check size={14} strokeWidth={3} />
              )}
            </div>
            <span className="text-slate-700 font-medium text-sm relative z-10 pr-2">
              {toast.message}
            </span>
            <div
              className={`absolute bottom-0 left-0 h-[3px] w-full animate-[shrink_3s_linear_forwards] ${
                toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
              }`}
            />
          </div>
        </div>
      )}

      {/* Left Side (Desktop Only) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#307fe2] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            <img
              src="/images/m_white.png"
              alt="Mantra"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="text-xl font-semibold tracking-wide">Mantra</span>
        </div>

        {/* Slider Container */}
        <div className="relative z-10 mt-auto mb-20 h-48 w-full animate-[entryUp_1s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          {loginSlides.map((slide, index) => {
            let positionClass =
              "translate-x-full opacity-0 pointer-events-none";
            if (index === currentSlide) {
              positionClass = "translate-x-0 opacity-100";
            } else if (index === prevSlide) {
              positionClass = "-translate-x-full opacity-0 pointer-events-none";
            }

            return (
              <div
                key={slide.id}
                className={`absolute top-0 left-0 right-0 transition-all duration-700 ease-in-out ${positionClass}`}
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
            );
          })}
        </div>

        {/* Indicators */}
        <div className="relative z-10 flex gap-2 animate-[entryUp_1s_cubic-bezier(0.16,1,0.3,1)_0.1s_forwards] opacity-0">
          {loginSlides.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? "w-8 bg-[#ffad00]" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Side (Content) */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Branding */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 bg-[#307fe2]"
              style={{
                maskImage: "url(/images/m_white.png)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskImage: "url(/images/m_white.png)",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
              }}
            />
            <span className="text-2xl font-bold text-[#307fe2]">Mantra</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-slate-500">Masuk untuk mengelola toko Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-2">
              <label
                className="text-sm font-semibold text-slate-700"
                htmlFor="email"
              >
                Email
              </label>
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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="text-sm font-semibold text-slate-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#307fe2] hover:text-[#ffad00] transition-colors"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#307fe2] transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
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
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#307fe2] hover:bg-[#2563b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#307fe2] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Masuk <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Atau</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-600 text-sm mb-3">
              Belum memiliki akun toko?
            </p>
            <Link
              to="/register"
              className="inline-flex w-full justify-center items-center px-4 py-3 border-2 border-[#ffad00] text-slate-800 font-semibold rounded-lg hover:bg-[#ffad00]/10 transition-colors duration-200"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-150%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-150%); } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
        @keyframes entryUp { from { opacity: 0; transform: translateY(150%); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Login;
