// src/pages/ProfilToko.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import {
  User,
  Store,
  Phone,
  MapPin,
  Save,
  Lock,
  AlertCircle,
  Check,
  ShieldCheck,
  Camera,
  HelpCircle,
  X,
  ZoomIn,
} from "lucide-react";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
};

const ProfilToko = () => {
  const [user, setUser] = useState({
    name: "",
    store_name: "",
    phone: "",
    address: "",
    avatar: null,
  });

  // Image & Cropper State
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isFileProcessing, setIsFileProcessing] = useState(false);

  const fileInputRef = useRef(null);

  // Password State
  const [passData, setPassData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
    isExiting: false,
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
    isProcessing: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser({
        name: storedUser.name || "",
        store_name: storedUser.store_name || "",
        phone: storedUser.phone || "",
        address: storedUser.address || "",
        avatar: storedUser.avatar || null,
      });
    }
  }, []);

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type, isExiting: false });
  };

  useEffect(() => {
    if (toast.show) {
      const t1 = setTimeout(
        () => setToast((prev) => ({ ...prev, isExiting: true })),
        2700
      );
      const t2 = setTimeout(
        () => setToast((prev) => ({ ...prev, show: false, isExiting: false })),
        3000
      );
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [toast.show]);

  // Image Handlers
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsFileProcessing(true);
      const file = e.target.files[0];
      try {
        const imageDataUrl = await readFile(file);
        setCropImageSrc(imageDataUrl);
        setIsCropping(true);
        //eslint-disable-next-line no-unused-vars
      } catch (error) {
        triggerToast("Gagal membaca file gambar", "error");
      } finally {
        setIsFileProcessing(false);
        e.target.value = null;
      }
    }
  };

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.readAsDataURL(file);
    });
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "avatar_cropped.jpg", {
        type: "image/jpeg",
      });

      setAvatarFile(croppedFile);
      setPreviewUrl(URL.createObjectURL(croppedFile));
      setIsCropping(false);
      setZoom(1);
    } catch (e) {
      console.error(e);
      triggerToast("Gagal memotong gambar", "error");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // API Actions
  const executeProfileUpdate = async () => {
    setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("store_name", user.store_name);
      formData.append("phone", user.phone || "");
      formData.append("address", user.address || "");
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      formData.append("_method", "PUT");

      const response = await axios.post(
        "http://localhost:8000/api/profile/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const updatedUser = {
          ...JSON.parse(localStorage.getItem("user")),
          ...response.data.user,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setUser((prev) => ({ ...prev, avatar: response.data.user.avatar }));
        setAvatarFile(null);

        setConfirmModal({
          ...confirmModal,
          isOpen: false,
          isProcessing: false,
        });
        triggerToast("Profil berhasil diperbarui!", "success");
      }
    } catch (error) {
      setConfirmModal((prev) => ({
        ...prev,
        isOpen: false,
        isProcessing: false,
      }));
      if (error.response && error.response.data.errors) {
        const firstError = Object.values(error.response.data.errors).flat()[0];
        triggerToast(firstError, "error");
      } else {
        triggerToast("Gagal memperbarui profil.", "error");
      }
    }
  };

  const executePasswordUpdate = async () => {
    setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:8000/api/profile/password",
        passData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data.success) {
        setConfirmModal({
          ...confirmModal,
          isOpen: false,
          isProcessing: false,
        });
        triggerToast("Password berhasil. Silahkan login ulang.", "success");
        setPassData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      setConfirmModal((prev) => ({
        ...prev,
        isOpen: false,
        isProcessing: false,
      }));
      const msg = error.response?.data?.message || "Gagal mengubah password.";
      triggerToast(msg, "error");
    }
  };

  const initiateSaveProfile = (e) => {
    e.preventDefault();
    setConfirmModal({
      isOpen: true,
      title: "Simpan Perubahan Profil?",
      message: "Pastikan data nama toko, kontak, dan foto sudah sesuai.",
      action: executeProfileUpdate,
      isProcessing: false,
    });
  };

  const initiateSavePassword = (e) => {
    e.preventDefault();
    if (passData.password !== passData.password_confirmation) {
      return triggerToast("Konfirmasi password tidak cocok.", "error");
    }
    setConfirmModal({
      isOpen: true,
      title: "Ubah Password?",
      message:
        "Anda akan otomatis logout dan harus login ulang setelah mengubah password.",
      action: executePasswordUpdate,
      isProcessing: false,
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto relative min-h-screen">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 left-0 w-full flex justify-center z-150 pointer-events-none">
          <div
            className={`pointer-events-auto bg-white border shadow-xl rounded-full px-6 py-3 flex items-center gap-3 relative overflow-hidden ${
              toast.type === "error"
                ? "border-red-100 shadow-red-500/10"
                : "border-slate-200 shadow-slate-200/50"
            } ${
              toast.isExiting
                ? "animate-[slideUp_0.4s_ease-in_forwards]"
                : "animate-[slideDown_0.4s_ease-out_forwards]"
            }`}
          >
            <div
              className={`p-1 rounded-full ${
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

      {/* Cropper Modal */}
      {isCropping && (
        <div className="fixed inset-0 h-screen w-screen z-150 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[500px]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Sesuaikan Foto</h3>
              <button
                onClick={() => setIsCropping(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="relative flex-1 bg-slate-900">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>

            <div className="p-4 bg-white border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-3 px-2">
                <ZoomIn size={18} className="text-slate-400" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full accent-[#307fe2] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCropping(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={showCroppedImage}
                  className="flex-1 py-2.5 bg-[#307fe2] hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 h-screen w-screen z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#307fe2] p-6 text-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20">
                  <HelpCircle size={32} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-bold">{confirmModal.title}</h2>
              </div>
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                  backgroundSize: "12px 12px",
                }}
              ></div>
            </div>
            <div className="p-6 bg-slate-50 text-center">
              <p className="text-slate-600 text-sm mb-6">
                {confirmModal.message}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    setConfirmModal({ ...confirmModal, isOpen: false })
                  }
                  disabled={confirmModal.isProcessing}
                  className="py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={confirmModal.action}
                  disabled={confirmModal.isProcessing}
                  className="py-2.5 bg-[#307fe2] hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {confirmModal.isProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    </>
                  ) : (
                    "Ya, Simpan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative">
        <div className="h-64 rounded-3xl bg-linear-to-br from-[#307fe2] to-[#2563b0] relative overflow-hidden shadow-xl shadow-blue-200/50 flex flex-col items-center justify-center text-white">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)",
              backgroundSize: "24px 24px",
            }}
          ></div>
          <div className="relative z-10 flex flex-col items-center">
            {/* Avatar */}
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-white/30 bg-white text-[#307fe2] flex items-center justify-center text-4xl font-bold shadow-2xl overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : user.avatar ? (
                  <img
                    src={`http://localhost:8000/storage/${user.avatar}`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
              />

              <button
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-white text-[#307fe2] p-2 rounded-full shadow-lg hover:bg-slate-100 transition-colors"
                title="Ubah Foto"
                disabled={isFileProcessing}
              >
                {isFileProcessing ? (
                  <div className="animate-spin h-4 w-4 border-2 border-[#307fe2] border-t-transparent rounded-full"></div>
                ) : (
                  <Camera size={16} />
                )}
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
              {user.store_name || "Nama Toko"}
            </h1>
            <p className="text-blue-100 font-medium text-lg bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm">
              {user.name || "Nama Pemilik"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
        {/* Left: Profile Details */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6 pb-2">
              <div className="w-1.5 h-10 bg-[#307fe2] rounded-full shadow-sm"></div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Detail Toko
                </h2>
                <p className="text-xs text-slate-500">
                  Informasi dasar toko Anda
                </p>
              </div>
            </div>
            <form
              onSubmit={initiateSaveProfile}
              className="space-y-6 flex-1 flex flex-col"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Pemilik
                  </label>
                  <div className="relative group">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#307fe2] transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#307fe2] focus:ring-4 focus:ring-[#307fe2]/10 transition-all text-sm font-medium"
                      value={user.name}
                      onChange={(e) =>
                        setUser({ ...user, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Toko
                  </label>
                  <div className="relative group">
                    <Store
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#307fe2] transition-colors"
                      size={18}
                    />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#307fe2] focus:ring-4 focus:ring-[#307fe2]/10 transition-all text-sm font-medium"
                      value={user.store_name}
                      onChange={(e) =>
                        setUser({ ...user, store_name: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kontak / WhatsApp{" "}
                  <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative group">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#307fe2] transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#307fe2] focus:ring-4 focus:ring-[#307fe2]/10 transition-all text-sm font-medium"
                    placeholder="0812..."
                    value={user.phone}
                    onChange={(e) =>
                      setUser({ ...user, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Alamat Lengkap{" "}
                  <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <div className="relative group">
                  <MapPin
                    className="absolute left-3 top-4 text-slate-400 group-focus-within:text-[#307fe2] transition-colors"
                    size={18}
                  />
                  <textarea
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#307fe2] focus:ring-4 focus:ring-[#307fe2]/10 transition-all text-sm font-medium min-h-[100px]"
                    placeholder="Jl. Raya No. 123, Kecamatan..."
                    value={user.address}
                    onChange={(e) =>
                      setUser({ ...user, address: e.target.value })
                    }
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-right">
                  Foto profil/logo, alamat, dan kontak ini akan dicetak pada
                  struk belanja.
                </p>
              </div>
              <div className="mt-auto pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#307fe2] hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Save size={18} /> Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: Security */}
        <div className="flex flex-col h-full">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="p-6 pb-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-1.5 h-10 bg-orange-500 rounded-full shadow-sm"></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Keamanan</h2>
                  <p className="text-xs text-slate-500">Update password akun</p>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start gap-3">
                <ShieldCheck
                  className="text-orange-500 mt-0.5 shrink-0"
                  size={20}
                />
                <p className="text-xs text-orange-700 leading-relaxed">
                  Gunakan password yang kuat untuk menjaga keamanan data
                  transaksi dan stok toko Anda.
                </p>
              </div>
            </div>
            <form
              onSubmit={initiateSavePassword}
              className="p-6 space-y-5 flex-1 flex flex-col"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password Lama
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium"
                    value={passData.current_password}
                    onChange={(e) =>
                      setPassData({
                        ...passData,
                        current_password: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="border-t border-slate-100"></div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password Baru
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium"
                    value={passData.password}
                    onChange={(e) =>
                      setPassData({ ...passData, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Konfirmasi
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium"
                    value={passData.password_confirmation}
                    onChange={(e) =>
                      setPassData({
                        ...passData,
                        password_confirmation: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="mt-auto pt-4">
                <button
                  type="submit"
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Ubah Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-150%); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-150%); } }
        @keyframes shrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
};

export default ProfilToko;
