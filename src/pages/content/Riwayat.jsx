// src/pages/Riwayat.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  Eye, Calendar, Clock, Printer, Download, CheckCircle2, Receipt, FileSpreadsheet, FileText, ChevronDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Filter, RotateCcw, X, Search
} from 'lucide-react';

// IMPORT THE PRINT COMPONENT
import StrukPrint from '../../components/others/StrukPrint';

const Riwayat = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter State
  const [filterDate, setFilterDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endHour, setEndHour] = useState('');

  // Modal & Dropdown State
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Refs
  const exportMenuRef = useRef(null);
  const componentRef = useRef(); // Ref for the hidden receipt component

  // Helper: Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Generate Hour Options (00 - 23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const params = {};
      if (filterDate) params.date = filterDate;
      if (startHour) params.start_hour = startHour;
      if (endHour) params.end_hour = endHour;

      const response = await axios.get('http://localhost:8000/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
        params: params
      });
      setTransactions(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching history", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
            setShowExportMenu(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResetFilter = () => {
    setFilterDate('');
    setStartHour('');
    setEndHour('');
    const token = localStorage.getItem('token');
    setLoading(true);
    axios.get('http://localhost:8000/api/transactions', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
            setTransactions(res.data);
            setCurrentPage(1);
        })
        .finally(() => setLoading(false));
  };

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- EXPORT LOGIC ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(48, 127, 226);
    doc.text("Mantra - Laporan Penjualan", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 30);

    const tableColumn = ["ID Transaksi", "Waktu", "Total Belanja", "Uang Diterima", "Kembalian"];
    const tableRows = transactions.map(trx => [
        trx.kode_transaksi,
        new Date(trx.created_at).toLocaleString('id-ID'),
        formatRupiah(trx.total_harga),
        formatRupiah(trx.uang_diberikan),
        formatRupiah(trx.kembalian),
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [48, 127, 226], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`Laporan_Mantra_${new Date().getTime()}.pdf`);
    setShowExportMenu(false);
  };

  const exportToExcel = () => {
    const worksheetData = transactions.map(trx => ({
        "ID Transaksi": trx.kode_transaksi,
        "Waktu Transaksi": new Date(trx.created_at).toLocaleString('id-ID'),
        "Total Belanja": parseInt(trx.total_harga),
        "Uang Diterima": parseInt(trx.uang_diberikan),
        "Kembalian": parseInt(trx.kembalian),
        "Jumlah Item": trx.transaksi_details ? trx.transaksi_details.length : 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penjualan");
    XLSX.writeFile(workbook, `Laporan_Mantra_${new Date().getTime()}.xlsx`);
    setShowExportMenu(false);
  };

  // --- PRINTING LOGIC ---
  const user = JSON.parse(localStorage.getItem('user'));

  // Transform the selected transaction into receipt-friendly format
  const receiptData = selectedTransaction ? {
      store_name: user?.store_name || "Mantra Store",
      store_address: user?.address || "Jl. Alamat Toko Belum Diisi",
      store_phone: user?.phone || "Telp: -",
      invoice: selectedTransaction.kode_transaksi,
      cashier: user?.name,
      date: selectedTransaction.created_at,
      items: selectedTransaction.transaksi_details.map(detail => ({
          name: detail.produk ? detail.produk.nama_produk : "Produk Dihapus",
          qty: detail.qty,
          price: detail.harga_satuan
      })),
      total: selectedTransaction.total_harga,
      cash: selectedTransaction.uang_diberikan,
      change: selectedTransaction.kembalian
  } : null;

  const handlePrint = () => {
      window.print();
  };

  // --- RENDER ---
  const openDetail = (trx) => {
    setSelectedTransaction(trx);
    setIsModalOpen(true);
  };

  const getDatePart = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const getTimePart = (dateString) => new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto relative">
      
      {/* 1. HIDDEN RECEIPT COMPONENT (Visible only on Print) */}
      <StrukPrint ref={componentRef} data={receiptData} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Riwayat Transaksi</h1>
           <p className="text-slate-500 mt-1">Laporan penjualan yang telah berhasil diproses.</p>
        </div>
        
        <div className="relative" ref={exportMenuRef}>
            <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:text-[#ffad00] hover:border-[#ffad00] px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm group"
            >
                <Download size={18} className="text-slate-500 group-hover:text-[#ffad00] transition-colors" /> 
                <span>Export Laporan</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>
            {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={exportToPDF} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ffad00] flex items-center gap-3 transition-colors">
                        <FileText size={16} /> Export PDF
                    </button>
                    <button onClick={exportToExcel} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#ffad00] flex items-center gap-3 transition-colors">
                        <FileSpreadsheet size={16} /> Export Excel
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-4">
         <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm w-full md:w-auto">
            <Filter size={18} className="text-[#ffad00]" />
            Filter Data:
         </div>
         
         <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
             {/* Date Picker */}
             <div className="relative group">
                <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all cursor-pointer"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    onKeyDown={(e) => e.preventDefault()} 
                />
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#ffad00] transition-colors" />
             </div>

             {/* Start Hour */}
             <div className="relative group">
                <select 
                    className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all appearance-none cursor-pointer"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                >
                    <option value="">Jam Mulai</option>
                    {hourOptions.map(hour => (
                        <option key={`start-${hour}`} value={hour}>{hour}:00</option>
                    ))}
                </select>
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#ffad00] transition-colors" />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             </div>

             {/* End Hour */}
             <div className="relative group">
                <select 
                    className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-[#ffad00] focus:ring-4 focus:ring-[#ffad00]/10 transition-all appearance-none cursor-pointer"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                >
                    <option value="">Jam Selesai</option>
                    {hourOptions.map(hour => (
                        <option key={`end-${hour}`} value={hour}>{hour}:00</option>
                    ))}
                </select>
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#ffad00] transition-colors" />
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             </div>

             {/* Action Buttons */}
             <div className="flex gap-2">
                 <button 
                    onClick={fetchHistory}
                    className="flex-1 bg-[#307fe2] hover:bg-blue-700 text-white rounded-xl py-2 px-3 text-sm font-semibold transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2 active:scale-95"
                 >
                    <Search size={16} /> Cari
                 </button>
                 <button 
                    onClick={handleResetFilter}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl py-2 px-3 transition-all flex items-center justify-center active:scale-95"
                    title="Reset Filter"
                 >
                    <RotateCcw size={16} />
                 </button>
             </div>
         </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Transaksi</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Belanja</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-[#307fe2] border-t-transparent rounded-full"></div>
                        <span>Memuat Data...</span>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                   <tr>
                       <td colSpan="5" className="text-center py-12 text-slate-400">
                           <div className="flex flex-col items-center gap-2">
                               <Receipt size={32} className="opacity-50"/>
                               <p>Belum ada transaksi {filterDate ? 'pada tanggal ini' : 'tercatat'}.</p>
                           </div>
                       </td>
                   </tr>
                ) : (
                    currentItems.map((trx) => (
                        <tr key={trx.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded w-fit">{trx.kode_transaksi}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-900 flex items-center gap-1.5"><Calendar size={14} className="text-[#307fe2]"/> {getDatePart(trx.created_at)}</span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><Clock size={14}/> {getTimePart(trx.created_at)} WIB</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="font-bold text-[#307fe2] text-sm">{formatRupiah(trx.total_harga)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100"><CheckCircle2 size={12} /> Sukses</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button onClick={() => openDetail(trx)} className="p-2 text-slate-400 hover:text-[#ffad00] hover:bg-orange-50 rounded-lg transition-all" title="Lihat Detail"><Eye size={18} /></button>
                            </td>
                        </tr>
                    ))
                )}
              </tbody>
            </table>
        </div>

        {/* PAGINATION FOOTER */}
        {!loading && transactions.length > 0 && (
          <div className="bg-white px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
             {/* Text Info */}
             <div className="text-sm text-slate-500">
                Menampilkan <span className="font-semibold text-slate-800">{indexOfFirstItem + 1}</span> - <span className="font-semibold text-slate-800">{Math.min(indexOfLastItem, transactions.length)}</span> dari <span className="font-semibold text-slate-800">{transactions.length}</span> transaksi
             </div>

             {/* Controls */}
             <div className="flex items-center gap-1">
                <button 
                   onClick={() => paginate(1)} 
                   disabled={currentPage === 1}
                   className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#307fe2] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
                >
                   <ChevronsLeft size={18} />
                </button>
                <button 
                   onClick={() => paginate(currentPage - 1)} 
                   disabled={currentPage === 1}
                   className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#307fe2] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
                >
                   <ChevronLeft size={18} />
                </button>
                <div className="px-4 py-2 bg-[#307fe2]/10 text-[#307fe2] font-bold text-sm rounded-lg">
                   {currentPage}
                </div>
                <button 
                   onClick={() => paginate(currentPage + 1)} 
                   disabled={currentPage === totalPages}
                   className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#307fe2] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
                >
                   <ChevronRight size={18} />
                </button>
                <button 
                   onClick={() => paginate(totalPages)} 
                   disabled={currentPage === totalPages}
                   className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#307fe2] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
                >
                   <ChevronsRight size={18} />
                </button>
             </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="bg-[#307fe2] px-6 py-5 text-white text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md"><CheckCircle2 size={24} className="text-white" /></div>
                        <h3 className="text-lg font-bold">Detail Transaksi</h3>
                        <p className="text-blue-100 text-sm opacity-90">{selectedTransaction.kode_transaksi}</p>
                    </div>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-50">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="space-y-4 mb-6">
                            {selectedTransaction.transaksi_details.map((item, index) => (
                                <div key={index} className="flex justify-between items-start border-b border-dashed border-slate-100 pb-3 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{item.produk ? item.produk.nama_produk : <span className="text-red-500 italic">Produk Dihapus</span>}</p>
                                        <p className="text-xs text-slate-500 mt-1">{item.qty} x {formatRupiah(item.harga_satuan)}</p>
                                    </div>
                                    <p className="font-medium text-slate-800 text-sm">{formatRupiah(item.subtotal)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 pt-4 border-t-2 border-slate-100">
                            <div className="flex justify-between text-sm"><span className="text-slate-500">Total Item</span><span className="font-medium text-slate-700">{selectedTransaction.transaksi_details.reduce((sum, item) => sum + item.qty, 0)} Pcs</span></div>
                            <div className="flex justify-between text-base font-bold text-slate-900 pt-2"><span>Total Tagihan</span><span className="text-[#307fe2]">{formatRupiah(selectedTransaction.total_harga)}</span></div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 mt-4 text-sm space-y-1">
                            <div className="flex justify-between"><span className="text-slate-500">Tunai</span><span className="font-medium text-slate-700">{formatRupiah(selectedTransaction.uang_diberikan)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Kembali</span><span className="font-medium text-emerald-600">{formatRupiah(selectedTransaction.kembalian)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-200 flex gap-3">
                    <button 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all hover:text-[#307fe2] hover:border-[#307fe2]" 
                        onClick={handlePrint}
                    >
                        <Printer size={18} /> Cetak Struk
                    </button>
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-[#307fe2] text-white font-semibold rounded-xl hover:bg-blue-700 transition-all">Tutup</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Riwayat;