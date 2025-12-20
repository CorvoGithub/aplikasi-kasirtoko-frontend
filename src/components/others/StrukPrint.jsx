// src/components/StrukPrint.jsx
import React, { forwardRef } from 'react';

const StrukPrint = forwardRef(({ data }, ref) => {
  if (!data) return null;

  const formatMoney = (val) => new Intl.NumberFormat('id-ID').format(val);
  const dateObj = data.date ? new Date(data.date) : new Date();
  const dateStr = dateObj.toLocaleDateString('id-ID');
  const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' });

  return (
    <div className="hidden print:block" id="printable-struk" ref={ref}>
      <div className="p-2 font-mono text-[10px] leading-tight text-black max-w-[58mm] mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-2 pb-2 border-b border-black border-dashed">
          <h2 className="font-bold text-xs uppercase mb-1">{data.store_name}</h2>
          {/* Dynamic Address & Phone */}
          <p className="wrap-break-word">{data.store_address || "Alamat belum diatur"}</p>
          <p>{data.store_phone || "Telp: -"}</p>
        </div>

        {/* METADATA */}
        <div className="border-b border-black border-dashed pb-1 mb-1">
          <div className="flex justify-between">
            <span>{dateStr}</span>
            <span>{timeStr}</span>
          </div>
          <div className="flex justify-between">
            <span>No: {data.invoice}</span>
            <span>Kasir: {data.cashier}</span>
          </div>
        </div>

        {/* ITEMS */}
        <div className="mb-2">
          {data.items && data.items.map((item, index) => (
            <div key={index} className="mb-1">
              <div>{item.name}</div>
              <div className="flex justify-between">
                <span>{item.qty} x {formatMoney(item.price)}</span>
                <span>{formatMoney(item.qty * item.price)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* TOTALS */}
        <div className="border-t border-black border-dashed pt-1 mb-2">
          <div className="flex justify-between font-bold text-xs">
            <span>TOTAL</span>
            <span>Rp {formatMoney(data.total)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>TUNAI</span>
            <span>Rp {formatMoney(data.cash)}</span>
          </div>
          <div className="flex justify-between">
            <span>KEMBALI</span>
            <span>Rp {formatMoney(data.change)}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center border-t border-black border-dashed pt-2 mt-2">
          <p>Terima Kasih</p>
          <p>Atas Kepercayaannya Pada Toko Kami</p>
        </div>

      </div>
    </div>
  );
});

export default StrukPrint;