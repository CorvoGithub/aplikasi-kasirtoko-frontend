// src/components/StrukPrint.jsx
import React, { forwardRef } from "react";

const StrukPrint = forwardRef(({ data }, ref) => {
  if (!data) return null;

  // 1. Helpers
  const formatMoney = (val) => new Intl.NumberFormat("id-ID").format(val);
  const dateObj = data.date ? new Date(data.date) : new Date();
  const dateStr = dateObj.toLocaleDateString("id-ID");
  const timeStr = dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 2. Logic to get Store Avatar
  const user = JSON.parse(localStorage.getItem("user"));
  const avatarUrl =
    data.store_logo ||
    (user?.avatar ? `http://localhost:8000/storage/${user.avatar}` : null);

  return (
    <div className="hidden print:block" id="printable-struk" ref={ref}>
      <div className="p-2 font-mono text-[10px] leading-tight text-black max-w-[58mm] mx-auto">
        {/* --- STORE HEADER --- */}
        <div className="text-center mb-2 pb-2 border-b border-black border-dashed flex flex-col items-center">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Store Logo"
              className="w-12 h-12 rounded-full object-cover mb-1 grayscale contrast-125"
            />
          )}
          <h2 className="font-bold text-xs mb-1">{data.store_name}</h2>
          <p className="wrap-break-word w-full px-2">{data.store_address}</p>
          <p className="mt-0.5">{data.store_phone}</p>
        </div>

        {/* --- METADATA --- */}
        <div className="border-b border-black border-dashed pb-1 mb-1">
          <div className="flex justify-between">
            <span>{dateStr}</span>
            <span>{timeStr}</span>
          </div>

          <div className="flex justify-between">
            <span>No:</span>
            <span>{data.invoice}</span>
          </div>

          <div className="flex justify-between items-start">
            <span className="shrink-0 mr-2">Kasir:</span>
            <span className="text-right break-all">{data.cashier}</span>
          </div>
        </div>

        {/* --- ITEMS --- */}
        <div className="mb-2">
          {data.items &&
            data.items.map((item, index) => (
              <div key={index} className="mb-1">
                <div className="line-clamp-2">{item.name}</div>
                <div className="flex justify-between pl-2">
                  <span>
                    {item.qty} x {formatMoney(item.price)}
                  </span>
                  <span>{formatMoney(item.qty * item.price)}</span>
                </div>
              </div>
            ))}
        </div>

        {/* --- TOTALS (FIXED ALIGNMENT) --- */}
        <div className="border-t border-black border-dashed pt-1 mb-2">
          {/* Using Grid: Col 1 (Label), Col 2 (Rp), Col 3 (Value) */}
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-1">
            {/* Total Row */}
            <div className="font-bold text-xs">Total</div>
            <div className="font-bold text-xs text-right">Rp</div>
            <div className="font-bold text-xs text-right min-w-10">
              {formatMoney(data.total)}
            </div>

            {/* Spacer (half break) */}
            <div className="col-span-3 h-1.5"></div>

            {/* Tunai Row */}
            <div>Tunai</div>
            <div className="text-right">Rp</div>
            <div className="text-right">{formatMoney(data.cash)}</div>

            {/* Kembalian Row */}
            <div>Kembalian</div>
            <div className="text-right">Rp</div>
            <div className="text-right">{formatMoney(data.change)}</div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="text-center border-t border-black border-dashed pt-2 mt-2 space-y-0.5">
          <p>Terima Kasih</p>
          <p>Atas Kepercayaannya Pada Toko Kami</p>

          {/* MANTRA BRANDING SECTION */}
          <div className="flex flex-col items-center justify-center pt-4 mt-2 opacity-80">
            <p className="text-[8px] mb-0.5">Powered by</p>
            <div className="flex items-center gap-1 border border-black/20 rounded px-2 py-0.5">
              <img
                src="/images/m_white.png"
                alt="Mantra"
                className="w-3 h-3 object-contain invert"
              />
              <span className="font-semibold text-[10px] tracking-widest ">
                Mantra™
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default StrukPrint;
