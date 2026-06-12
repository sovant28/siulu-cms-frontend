"use client";
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../supabase';
import { Database, ChevronLeft, Save, Map, Hotel, Utensils, Calendar, UploadCloud, ShieldAlert } from 'lucide-react';

export default function EditKnowledgeBase({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Type Selection
  const [entityType, setEntityType] = useState('destinasi'); // destinasi, hotel, restoran, event

  // Common Form State
  const [destId, setDestId] = useState('');
  const [destName, setDestName] = useState('');
  const [destRegion, setDestRegion] = useState('');
  const [destDescription, setDestDescription] = useState('');
  const [destContact, setDestContact] = useState('');
  const [destFacilities, setDestFacilities] = useState('');
  const [destGps, setDestGps] = useState('');
  const [destImageUrl, setDestImageUrl] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('cms-media')
        .upload(fileName, file);

      if (error) {
        alert("Gagal mengunggah gambar. Pastikan bucket 'cms-media' sudah dibuat dan public di Supabase.\n" + error.message);
        console.error(error);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('cms-media')
        .getPublicUrl(fileName);

      if (publicUrlData && publicUrlData.publicUrl) {
        setDestImageUrl(publicUrlData.publicUrl);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat mengunggah gambar.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Destinasi Specific
  const [destCategory, setDestCategory] = useState('alam');
  const [destHours, setDestHours] = useState('');
  const [destTicketPrice, setDestTicketPrice] = useState('');
  const [destTips, setDestTips] = useState('');
  const [destSubCategory, setDestSubCategory] = useState('alam');
  const [destCategorySelection, setDestCategorySelection] = useState('alam');

  const handleCategorySelectionChange = (val) => {
    setDestCategorySelection(val);
    if (val === 'alam') {
      setDestCategory('alam');
      setDestSubCategory('alam');
    } else if (val === 'kuburan_sejarah') {
      setDestCategory('budaya_religi');
      setDestSubCategory('kuburan_sejarah');
    } else if (val === 'rumah_adat') {
      setDestCategory('budaya_religi');
      setDestSubCategory('rumah_adat');
    } else if (val === 'religi') {
      setDestCategory('budaya_religi');
      setDestSubCategory('religi');
    } else if (val === 'agrowisata') {
      setDestCategory('alam');
      setDestSubCategory('agrowisata');
    } else if (val === 'budaya_sejarah_umum') {
      setDestCategory('budaya_religi');
      setDestSubCategory('lainnya');
    } else if (val === 'transportasi') {
      setDestCategory('transportasi');
      setDestSubCategory('lainnya');
    } else if (val === 'darurat') {
      setDestCategory('darurat');
      setDestSubCategory('lainnya');
    }
  };

  // Hotel Specific
  const [hotelStars, setHotelStars] = useState('3');
  const [hotelPrice, setHotelPrice] = useState('');
  const [hotelCheckIn, setHotelCheckIn] = useState('14:00');
  const [hotelCheckOut, setHotelCheckOut] = useState('12:00');

  // Restoran Specific
  const [restoHours, setRestoHours] = useState('');
  const [restoHalal, setRestoHalal] = useState('halal');
  const [restoPriceRange, setRestoPriceRange] = useState('');

  // Event Specific
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventTicket, setEventTicket] = useState('');
  const [eventOrganizer, setEventOrganizer] = useState('');
  const [eventIsFeatured, setEventIsFeatured] = useState(false);
  const [eventSubCategory, setEventSubCategory] = useState('lainnya');


  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const initPage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let currentToken = null;
        if (session) {
          setToken(session.access_token);
          currentToken = session.access_token;
          
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          setRole(roleData?.role);
          
          if (roleData?.role !== 'super_admin' && roleData?.role !== 'admin_konten') {
            alert("Akses ditolak: Peran Anda tidak diizinkan mengelola pengetahuan RAG!");
            router.push('/dashboard/knowledge');
            return;
          }
        }
        
        // Fetch existing data
        if (unwrappedParams.id && currentToken) {
          const res = await fetch(`${API_URL}/knowledge/destinasi`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            const dest = data.find(d => d.id === unwrappedParams.id);
            if (dest) {
              setDestId(dest.id);
              setDestName(dest.nama_tempat);
              setDestRegion(dest.lokasi_wilayah);
              setDestDescription(dest.deskripsi_lengkap);
              setDestContact(dest.kontak_info || '');
              
              if (dest.koordinat_gps && Array.isArray(dest.koordinat_gps)) {
                setDestGps(`${dest.koordinat_gps[0]}, ${dest.koordinat_gps[1]}`);
              }
              if (dest.fitur_fasilitas && Array.isArray(dest.fitur_fasilitas)) {
                setDestFacilities(dest.fitur_fasilitas.join(', '));
              }

              const biayaInfo = typeof dest.informasi_biaya === 'object' ? dest.informasi_biaya : {};
              const jamOp = dest.jam_operasional || '';
              
              setDestImageUrl(biayaInfo.image_url || '');

              // Auto-detect entity type based on kategori
              if (dest.kategori === 'akomodasi') {
                setEntityType('hotel');
                setHotelPrice(biayaInfo.harga_per_malam || '');
                setHotelStars(biayaInfo.rating_bintang || '3');
                
                // Parse check-in check-out from jamOp e.g. "Check-in: 14:00, Check-out: 12:00"
                if (jamOp.includes('Check-in:')) {
                  const parts = jamOp.split(',');
                  if (parts[0]) setHotelCheckIn(parts[0].replace('Check-in:', '').trim());
                  if (parts[1]) setHotelCheckOut(parts[1].replace('Check-out:', '').trim());
                }
              } else if (dest.kategori === 'kuliner') {
                setEntityType('restoran');
                setRestoHours(jamOp);
                setRestoHalal(biayaInfo.status_halal || 'halal');
                setRestoPriceRange(biayaInfo.range_harga || '');
              } else if (dest.kategori === 'event') {
                setEntityType('event');
                setEventTicket(biayaInfo.harga_tiket || '');
                setEventOrganizer(biayaInfo.penyelenggara || '');
                setEventIsFeatured(dest.is_featured || false);
                setEventSubCategory(biayaInfo.sub_kategori || 'lainnya');
                
                if (jamOp.includes('Mulai:')) {
                  const parts = jamOp.split(',');
                  if (parts[0]) setEventStartDate(parts[0].replace('Mulai:', '').trim());
                  if (parts[1]) setEventEndDate(parts[1].replace('Selesai:', '').trim());
                }
              } else if (dest.kategori === 'darurat') {
                setEntityType('darurat');
              } else {
                setEntityType('destinasi');
                setDestCategory(dest.kategori);
                setDestHours(jamOp);
                setDestTicketPrice(biayaInfo.harga_tiket || '');
                setDestTips(dest.aturan_tips || '');
                setDestSubCategory(biayaInfo.sub_kategori || 'alam');
                
                const subCat = biayaInfo.sub_kategori || 'lainnya';
                if (dest.kategori === 'budaya_religi') {
                  if (subCat === 'kuburan_sejarah') setDestCategorySelection('kuburan_sejarah');
                  else if (subCat === 'rumah_adat') setDestCategorySelection('rumah_adat');
                  else if (subCat === 'religi') setDestCategorySelection('religi');
                  else setDestCategorySelection('budaya_sejarah_umum');
                } else if (dest.kategori === 'alam') {
                  if (subCat === 'agrowisata') setDestCategorySelection('agrowisata');
                  else setDestCategorySelection('alam');
                } else if (dest.kategori === 'transportasi') {
                  setDestCategorySelection('transportasi');
                } else if (dest.kategori === 'darurat') {
                  setDestCategorySelection('darurat');
                } else {
                  setDestCategorySelection('alam');
                }
              }

            } else {
              alert("Data tidak ditemukan.");
              router.push('/dashboard/knowledge');
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [unwrappedParams.id, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    let gpsCoords = null;
    if (destGps.trim()) {
      const parts = destGps.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lon = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lon)) gpsCoords = [lat, lon];
      }
    }

    const facilitiesList = destFacilities.split(',').map(f => f.trim()).filter(f => f.length > 0);

    // Dynamic mapping based on entityType
    let finalCategory = 'alam';
    let finalHours = null;
    let finalBiaya = { image_url: destImageUrl };
    let finalTips = null;

    if (entityType === 'destinasi') {
      finalCategory = destCategory;
      finalHours = destHours;
      finalBiaya = { 
        ...finalBiaya, 
        "harga_tiket": destTicketPrice,
        "sub_kategori": destSubCategory
      };
      finalTips = destTips;
    } else if (entityType === 'hotel') {
      finalCategory = 'akomodasi';
      finalHours = `Check-in: ${hotelCheckIn}, Check-out: ${hotelCheckOut}`;
      finalBiaya = { 
        ...finalBiaya,
        "harga_per_malam": hotelPrice,
        "rating_bintang": hotelStars
      };
    } else if (entityType === 'restoran') {
      finalCategory = 'kuliner';
      finalHours = restoHours;
      finalBiaya = {
        ...finalBiaya,
        "status_halal": restoHalal,
        "range_harga": restoPriceRange
      };
    } else if (entityType === 'event') {
      finalCategory = 'event';
      finalHours = `Mulai: ${eventStartDate}, Selesai: ${eventEndDate}`;
      finalBiaya = {
        ...finalBiaya,
        "harga_tiket": eventTicket,
        "penyelenggara": eventOrganizer,
        "sub_kategori": eventSubCategory
      };
    } else if (entityType === 'darurat') {
      finalCategory = 'darurat';
      finalHours = null;
      finalBiaya = { ...finalBiaya };
      finalTips = null;
    }

    const payload = {
      id: destId.trim(),
      nama_tempat: destName,
      kategori: finalCategory,
      lokasi_wilayah: destRegion,
      koordinat_gps: gpsCoords,
      deskripsi_lengkap: destDescription,
      jam_operasional: finalHours,
      informasi_biaya: finalBiaya,
      fitur_fasilitas: facilitiesList,
      aturan_tips: finalTips,
      kontak_info: destContact || null,
      is_featured: entityType === 'event' ? eventIsFeatured : false
    };


    try {
      const res = await fetch(`${API_URL}/knowledge/destinasi/${unwrappedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Pembaruan dokumen dan re-embedding RAG berhasil!");
        router.push('/dashboard/knowledge');
      } else {
        const errData = await res.json();
        alert(`Gagal menyimpan: ${errData.detail || 'Error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Kesalahan koneksi saat menghubungi server AI.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col w-full font-sans pb-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/dashboard/knowledge')}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-500 hover:text-slate-800 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col space-y-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit Entitas Pengetahuan</h2>
            <p className="text-xs font-medium text-slate-500">Perbarui spesifikasi detail data ini untuk RAG.</p>
          </div>
        </div>
      </div>

      {/* Entity Selector (Read-Only to visualize current entity type) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl opacity-75">
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${entityType === 'destinasi' ? 'bg-orange-50 border-[#F35A05] text-[#F35A05] shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <Map className="w-6 h-6" />
          <span className="text-xs font-bold text-center">Tempat Wisata</span>
        </div>
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${entityType === 'hotel' ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <Hotel className="w-6 h-6" />
          <span className="text-xs font-bold text-center">Akomodasi / Hotel</span>
        </div>
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${entityType === 'restoran' ? 'bg-amber-50 border-amber-600 text-amber-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <Utensils className="w-6 h-6" />
          <span className="text-xs font-bold text-center">Restoran / Kuliner</span>
        </div>
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${entityType === 'event' ? 'bg-purple-50 border-purple-600 text-purple-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <Calendar className="w-6 h-6" />
          <span className="text-xs font-bold text-center">Event & Festival</span>
        </div>
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${entityType === 'darurat' ? 'bg-red-50 border-red-600 text-red-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <ShieldAlert className="w-6 h-6" />
          <span className="text-xs font-bold text-center">Info Darurat & Umum</span>
        </div>
      </div>

      <section className="bg-white border border-slate-200 rounded-xl p-8 max-w-4xl shadow-sm">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">ID Dokumen (Unik) *</label>
              <input type="text" required disabled value={destId} className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-500 font-bold focus:outline-none cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Nama {entityType === 'hotel' ? 'Hotel/Akomodasi' : entityType === 'restoran' ? 'Restoran' : entityType === 'event' ? 'Event' : entityType === 'darurat' ? 'Info / Kontak Darurat' : 'Tempat Wisata'} *</label>
              <input type="text" required value={destName} onChange={(e) => setDestName(e.target.value)} placeholder={`Contoh: ${entityType === 'hotel' ? 'Misiliana Hotel' : entityType === 'restoran' ? 'Cafe Aras' : 'event' ? 'Toraja Highland Festival' : entityType === 'darurat' ? 'Polres Tana Toraja' : 'Makam Londa'}`} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Wilayah / Lokasi *</label>
              <input type="text" required value={destRegion} onChange={(e) => setDestRegion(e.target.value)} placeholder="Contoh: Rantepao, Toraja Utara" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
            </div>
            {entityType === 'destinasi' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Kategori Destinasi (Khas Toraja) *</label>
                <select 
                  value={destCategorySelection} 
                  onChange={(e) => handleCategorySelectionChange(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition"
                >
                  <option value="alam">Wisata Alam & Pegunungan</option>
                  <option value="kuburan_sejarah">Situs Makam & Kuburan Tebing</option>
                  <option value="rumah_adat">Rumah Adat & Desa Tradisional</option>
                  <option value="religi">Wisata Religi</option>
                  <option value="agrowisata">Agrowisata & Kopi</option>
                  <option value="budaya_sejarah_umum">Budaya & Sejarah Umum</option>
                  <option value="transportasi">Transportasi Lokal</option>
                  <option value="darurat">Darurat & Informasi Umum</option>
                </select>
              </div>
            )}
            {entityType !== 'destinasi' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Kontak Info / Telepon</label>
                <input type="text" value={destContact} onChange={(e) => setDestContact(e.target.value)} placeholder="0812-3456-7890 / @instagram" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
              </div>
            )}
          </div>

          {/* DYNAMIC FORM FIELDS */}
          
          {/* Form Destinasi */}
          {entityType === 'destinasi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Jam Operasional</label>
                <input type="text" value={destHours} onChange={(e) => setDestHours(e.target.value)} placeholder="Setiap hari 08:00 - 17:00" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Informasi Biaya / Tiket Masuk</label>
                <input type="text" value={destTicketPrice} onChange={(e) => setDestTicketPrice(e.target.value)} placeholder="Rp 15.000 / orang" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs" />
              </div>
            </div>
          )}

          {/* Form Hotel */}
          {entityType === 'hotel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Rating Bintang</label>
                <select value={hotelStars} onChange={(e) => setHotelStars(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition">
                  <option value="Boutique/Villa">Boutique / Villa</option>
                  <option value="1">1 Bintang</option>
                  <option value="2">2 Bintang</option>
                  <option value="3">3 Bintang</option>
                  <option value="4">4 Bintang</option>
                  <option value="5">5 Bintang</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Harga Per Malam</label>
                <input type="text" value={hotelPrice} onChange={(e) => setHotelPrice(e.target.value)} placeholder="Mulai dari Rp 450.000" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Check-In</label>
                <input type="time" value={hotelCheckIn} onChange={(e) => setHotelCheckIn(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Check-Out</label>
                <input type="time" value={hotelCheckOut} onChange={(e) => setHotelCheckOut(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
              </div>
            </div>
          )}

          {/* Form Restoran */}
          {entityType === 'restoran' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Jam Buka</label>
                <input type="text" value={restoHours} onChange={(e) => setRestoHours(e.target.value)} placeholder="10:00 - 22:00" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Status Kehalalan</label>
                <select value={restoHalal} onChange={(e) => setRestoHalal(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs">
                  <option value="Halal Certified">Tersertifikasi Halal</option>
                  <option value="Halal Friendly">Halal Friendly (No Pork/Lard)</option>
                  <option value="Non-Halal">Menyediakan Menu Non-Halal</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Range Harga (Per Pax)</label>
                <input type="text" value={restoPriceRange} onChange={(e) => setRestoPriceRange(e.target.value)} placeholder="Rp 25.000 - Rp 100.000" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs" />
              </div>
            </div>
          )}

          {/* Form Event */}
          {entityType === 'event' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Tanggal Mulai</label>
                <input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 transition" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Tanggal Selesai</label>
                <input type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 transition" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Harga Tiket</label>
                <input type="text" value={eventTicket} onChange={(e) => setEventTicket(e.target.value)} placeholder="Gratis / Rp 50.000" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 transition" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Penyelenggara</label>
                <input type="text" value={eventOrganizer} onChange={(e) => setEventOrganizer(e.target.value)} placeholder="Dinas Pariwisata / Swasta" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 transition" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Sub Kategori Event</label>
                <select value={eventSubCategory} onChange={(e) => setEventSubCategory(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 transition">
                  <option value="budaya">Upacara Adat</option>
                  <option value="religi">Event Religi</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </div>
          )}


          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Deskripsi Lengkap (Materi Utama AI) *</label>
            <textarea 
              required rows={6} value={destDescription} onChange={(e) => setDestDescription(e.target.value)}
              placeholder="Jelaskan secara detail mengenai profil entitas ini agar bot AI dapat memahaminya dan menjawab pertanyaan pengunjung dengan akurat..."
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05] transition resize-y min-h-[120px]"
            />
          </div>

          {entityType !== 'darurat' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Fasilitas Tambahan (Pisahkan Koma)</label>
                <input type="text" value={destFacilities} onChange={(e) => setDestFacilities(e.target.value)} placeholder="Parkir, Wifi, Kolam Renang" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05]" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Koordinat GPS [Lat, Lng]</label>
                <input type="text" value={destGps} onChange={(e) => setDestGps(e.target.value)} placeholder="-3.1234, 119.8765" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05]" />
              </div>
            </div>
          )}

          {entityType !== 'darurat' && (
            <div className="space-y-2">
              <label className="flex text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 items-center justify-between">
                <span>URL Gambar / Banner (Opsional)</span>
                <label className="cursor-pointer text-[#F35A05] hover:text-[#d94200] flex items-center space-x-1 transition">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </label>
              <input type="text" value={destImageUrl} onChange={(e) => setDestImageUrl(e.target.value)} placeholder="https://example.com/banner.jpg" className={`w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05] transition ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={uploadingImage} />
              {uploadingImage && <p className="text-[10px] text-[#F35A05] font-bold pl-1 animate-pulse">Mengunggah gambar...</p>}
              <p className="text-[10px] text-slate-400 pl-1">URL gambar ini akan digunakan sebagai cover di aplikasi Siulu App.</p>
            </div>
          )}

          {entityType === 'destinasi' && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Aturan & Tips Berkunjung</label>
              <input type="text" value={destTips} onChange={(e) => setDestTips(e.target.value)} placeholder="Berpakaian sopan, bawa uang tunai..." className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05]" />
            </div>
          )}

          {entityType === 'event' && (
            <div className="flex items-center pb-4 pl-1">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={eventIsFeatured} 
                  onChange={(e) => setEventIsFeatured(e.target.checked)} 
                  className="w-4 h-4 text-[#F35A05] border-slate-300 rounded focus:ring-[#F35A05] cursor-pointer" 
                />
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Tandai sebagai Featured Event (Tampilkan di halaman utama PWA)</span>
              </label>
            </div>
          )}

          <div className="pt-6 border-t border-slate-200">
            <button 
              type="submit" disabled={formLoading}
              className="px-8 py-3.5 bg-[#F35A05] hover:bg-[#d94200] disabled:opacity-50 text-white font-black rounded-lg text-xs tracking-widest uppercase transition flex items-center justify-center space-x-2"
            >
              {formLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  <span>Menyimpan & Memproses Embedding...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
