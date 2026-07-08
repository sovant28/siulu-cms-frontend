"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../supabase';
import { compressImage } from '../../../utils/imageCompressor';
import { Database, ChevronLeft, Save, Map, Hotel, Utensils, Calendar, UploadCloud, ShieldAlert } from 'lucide-react';

function AddKnowledgeBaseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Type Selection
  const [entityType, setEntityType] = useState('destinasi'); // destinasi, hotel, restoran, event

  const typeParam = searchParams.get('type');
  const hasTypeParam = !!typeParam;

  const getBackPath = () => {
    if (typeParam === 'hotel') return '/dashboard/hotel';
    if (typeParam === 'restoran') return '/dashboard/resto';
    if (typeParam === 'kuliner') return '/dashboard/kuliner';
    if (typeParam === 'event') return '/dashboard/event';
    if (typeParam === 'darurat') return '/dashboard/info';
    return '/dashboard/destinasi';
  };

  const getCategoryDetails = () => {
    if (typeParam === 'hotel') {
      return { label: 'Akomodasi / Hotel', bg: 'bg-blue-50 text-blue-700 border-blue-200/80' };
    }
    if (typeParam === 'restoran') {
      return { label: 'Restoran & Cafe', bg: 'bg-amber-50 text-amber-700 border-amber-200/80' };
    }
    if (typeParam === 'kuliner') {
      return { label: 'Kuliner Tradisional', bg: 'bg-orange-50 text-orange-700 border-orange-200/80' };
    }
    if (typeParam === 'event') {
      return { label: 'Event & Festival', bg: 'bg-purple-50 text-purple-700 border-purple-200/80' };
    }
    if (typeParam === 'darurat') {
      return { label: 'Info Darurat & Umum', bg: 'bg-red-50 text-red-700 border-red-200/80' };
    }
    return { label: 'Tempat Wisata', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80' };
  };

  useEffect(() => {
    if (typeParam) {
      if (typeParam === 'kuliner') {
        setEntityType('restoran');
      } else if (['destinasi', 'hotel', 'restoran', 'event', 'darurat'].includes(typeParam)) {
        setEntityType(typeParam);
      }
    }
  }, [typeParam]);

  // Common Form State
  const [destId, setDestId] = useState('');
  const [isIdManuallyEdited, setIsIdManuallyEdited] = useState(false);
  const [destName, setDestName] = useState('');
  const [destRegion, setDestRegion] = useState('');
  const [destDescription, setDestDescription] = useState('');
  const [destContact, setDestContact] = useState('');
  const [destFacilities, setDestFacilities] = useState('');
  const [destGps, setDestGps] = useState('');
  const [destImageUrl, setDestImageUrl] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const isFood = entityType === 'restoran' && (destId.trim().startsWith('FOOD-') || searchParams.get('type') === 'kuliner');

  const processAndUploadImage = async (file) => {
    setUploadingImage(true);
    try {
      // Compress the image before uploading
      const compressedFile = await compressImage(file);
      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('cms-media')
        .upload(fileName, compressedFile);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await processAndUploadImage(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        await processAndUploadImage(file);
      } else {
        alert("Mohon unggah file gambar saja.");
      }
    }
  };

  // Destinasi Specific
  const [destCategory, setDestCategory] = useState('alam'); // alam, budaya_religi
  const [destHours, setDestHours] = useState('');
  const [destTicketPrice, setDestTicketPrice] = useState('');
  const [destTips, setDestTips] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
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

  const getDescriptionPlaceholder = () => {
    if (isFood) {
      return "Tuliskan penjelasan lengkap kuliner khas: sejarah asal-usul, arti nama masakan, penyajian dalam upacara adat, serta keunikan rasanya agar AI dapat menjelaskannya dengan lengkap dan akurat...";
    }
    switch (entityType) {
      case 'hotel':
        return "Tuliskan penjelasan lengkap akomodasi: tipe kamar yang tersedia, fasilitas utama (kolam renang, wifi, sarapan), kapasitas, range tarif kamar, akses jalan, dan info reservasi agar AI dapat merekomendasikannya dengan tepat...";
      case 'restoran':
        return "Tuliskan penjelasan lengkap tempat makan: menu andalan (halal/non-halal), range harga makanan, suasana restoran, fasilitas, dan rute lokasi agar AI dapat mengarahkan wisatawan dengan tepat...";
      case 'event':
        return "Tuliskan penjelasan lengkap event: makna adat/ritual yang diselenggarakan, jadwal pelaksanaan, lokasi detail venue, harga tiket masuk, dan tata tertib pengunjung agar AI dapat menjelaskannya dengan lengkap...";
      case 'darurat':
        return "Tuliskan penjelasan lengkap layanan darurat: jenis layanan/bantuan, nomor telepon aktif, alamat fisik, dan prosedur saat keadaan darurat agar AI dapat memberikan info cepat...";
      default:
        return "Tuliskan penjelasan lengkap destinasi: sejarah asal-usul, nilai adat/kebudayaan, keunikan arsitektur Tongkonan, rute jalan, dan informasi penting lainnya agar AI dapat menjelaskan secara detail dan akurat...";
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

  // Kuliner Tradisional Specific
  const [culinaryRecipe, setCulinaryRecipe] = useState('');
  const [culinarySteps, setCulinarySteps] = useState('');

  // Event Specific
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventTicket, setEventTicket] = useState('');
  const [eventOrganizer, setEventOrganizer] = useState('');
  const [eventIsFeatured, setEventIsFeatured] = useState(false);
  const [eventSubCategory, setEventSubCategory] = useState('lainnya');

  const generateAutoId = async (selectedType, selectedCategory) => {
    let prefix = 'DST';
    if (selectedType === 'hotel') {
      prefix = 'HTL';
    } else if (selectedType === 'restoran') {
      const typeParamVal = searchParams.get('type');
      prefix = typeParamVal === 'kuliner' ? 'FOOD' : 'CUL';
    } else if (selectedType === 'event') {
      prefix = 'EVT';
    } else if (selectedType === 'darurat') {
      prefix = 'EMG';
    } else if (selectedType === 'destinasi') {
      if (selectedCategory === 'alam') {
        prefix = 'NAT';
      } else if (selectedCategory === 'budaya_religi') {
        prefix = 'REL';
      } else if (selectedCategory === 'transportasi') {
        prefix = 'TRN';
      } else if (selectedCategory === 'darurat') {
        prefix = 'EMG';
      } else {
        prefix = 'DST';
      }
    }

    try {
      const { data, error } = await supabase
        .from('destinasi_wisata')
        .select('id')
        .like('id', `${prefix}-%`);

      if (error) throw error;

      let maxNum = 0;
      if (data && data.length > 0) {
        data.forEach(item => {
          const parts = item.id.split('-');
          if (parts.length === 2) {
            const num = parseInt(parts[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        });
      }

      const nextNum = maxNum + 1;
      const nextId = `${prefix}-${String(nextNum).padStart(3, '0')}`;
      setDestId(nextId);
    } catch (err) {
      console.error("Error generating ID:", err);
      const rand = Math.floor(100 + Math.random() * 900);
      setDestId(`${prefix}-${rand}`);
    }
  };

  useEffect(() => {
    if (!isIdManuallyEdited) {
      generateAutoId(entityType, destCategory);
    }
  }, [entityType, destCategory, isIdManuallyEdited]);


  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const initPage = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setToken(session.access_token);
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          setRole(roleData?.role);
          
          if (roleData?.role !== 'super_admin' && roleData?.role !== 'admin_konten') {
            alert("Akses ditolak!");
            router.push('/dashboard/knowledge');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    initPage();
  }, [router]);

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
      const isFood = destId.trim().startsWith('FOOD-');
      finalHours = isFood ? null : restoHours;
      finalBiaya = {
        ...finalBiaya,
        "jenis": isFood ? 'makanan_khas' : 'tempat_makan',
        "status_halal": restoHalal,
        "range_harga": restoPriceRange,
        ...(isFood && {
          "resep": culinaryRecipe,
          "cara_pembuatan": culinarySteps
        })
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
      youtube_url: entityType === 'destinasi' && youtubeUrl ? youtubeUrl.trim() : null,
      instagram_url: entityType === 'destinasi' && instagramUrl ? instagramUrl.trim() : null,
      is_featured: entityType === 'event' ? eventIsFeatured : false
    };


    try {
      const res = await fetch(`${API_URL}/knowledge/destinasi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        let redirectPath = '/dashboard/destinasi';
        if (entityType === 'hotel') redirectPath = '/dashboard/hotel';
        else if (entityType === 'restoran') {
          redirectPath = destId.trim().startsWith('FOOD-') ? '/dashboard/kuliner' : '/dashboard/resto';
        }
        else if (entityType === 'event') redirectPath = '/dashboard/event';
        else if (entityType === 'darurat') redirectPath = '/dashboard/info';

        alert("Dokumen pengetahuan RAG berhasil disimpan dan diproses AI!");
        router.push(redirectPath);
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
      <div className="flex items-center space-x-4">
        <button 
          type="button"
          onClick={() => router.push(getBackPath())}
          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-500 hover:text-slate-800 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tambah Pengetahuan AI</h2>
            {hasTypeParam && (
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${getCategoryDetails().bg} ${getCategoryDetails().border}`}>
                {getCategoryDetails().label}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500">
            {hasTypeParam 
              ? `Lengkapi detail data untuk kategori ${getCategoryDetails().label.toLowerCase()}.`
              : 'Pilih jenis entitas dan lengkapi datanya.'
            }
          </p>
        </div>
      </div>

      {/* Entity Selector (Only render if there is no type parameter in query) */}
      {!hasTypeParam && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl">
          <button type="button" onClick={() => setEntityType('destinasi')} className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${entityType === 'destinasi' ? 'bg-orange-50 border-[#F35A05] text-[#F35A05]' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <Map className="w-6 h-6" />
            <span className="text-xs font-bold text-center">Tempat Wisata</span>
          </button>
          <button type="button" onClick={() => setEntityType('hotel')} className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${entityType === 'hotel' ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <Hotel className="w-6 h-6" />
            <span className="text-xs font-bold text-center">Akomodasi / Hotel</span>
          </button>
          <button type="button" onClick={() => setEntityType('restoran')} className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${entityType === 'restoran' ? 'bg-amber-50 border-amber-600 text-amber-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <Utensils className="w-6 h-6" />
            <span className="text-xs font-bold text-center">Restoran / Kuliner</span>
          </button>
          <button type="button" onClick={() => setEntityType('event')} className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${entityType === 'event' ? 'bg-purple-50 border-purple-600 text-purple-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-bold text-center">Event & Festival</span>
          </button>
          <button type="button" onClick={() => setEntityType('darurat')} className={`p-4 rounded-xl border flex flex-col items-center justify-center space-y-2 transition ${entityType === 'darurat' ? 'bg-red-50 border-red-600 text-red-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
            <ShieldAlert className="w-6 h-6" />
            <span className="text-xs font-bold text-center">Info Darurat & Umum</span>
          </button>
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-xl p-8 max-w-4xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider">ID Dokumen (Unik) *</label>
                <button
                  type="button"
                  onClick={() => generateAutoId(entityType, destCategory)}
                  className="text-[10px] font-bold text-[#F35A05] hover:text-[#d94200] transition cursor-pointer select-none"
                >
                  Buat Otomatis
                </button>
              </div>
              <input
                type="text"
                required
                value={destId}
                onChange={(e) => {
                  setDestId(e.target.value);
                  setIsIdManuallyEdited(true);
                }}
                placeholder="Contoh: NAT-001 (Alam), REL-001 (Budaya)"
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">
                {isFood ? 'Nama Kuliner / Makanan Tradisional *' : entityType === 'hotel' ? 'Nama Hotel / Akomodasi *' : entityType === 'restoran' ? 'Nama Restoran / Rumah Makan *' : entityType === 'event' ? 'Nama Event / Acara *' : entityType === 'darurat' ? 'Nama Info / Kontak Darurat *' : 'Nama Tempat Wisata *'}
              </label>
              <input type="text" required value={destName} onChange={(e) => setDestName(e.target.value)} placeholder={`Contoh: ${isFood ? 'Pa\'piong Ayam / Pantollo Pamarrasan / Kopi Arabika Toraja' : entityType === 'hotel' ? 'Hotel Pantan Makale' : entityType === 'restoran' ? 'Depot Idaman Makale' : entityType === 'event' ? 'Festival Seni Budaya Ma\'nene\' Gandasil' : entityType === 'darurat' ? 'Polres Tana Toraja' : 'Objek Wisata Buntu Burake / Situs Makam Pahat Lemo\''}`} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={isFood ? "md:col-span-2 space-y-2" : "space-y-2"}>
              <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">{isFood ? 'Sentra Asal / Wilayah Tana Toraja *' : 'Wilayah / Lokasi *'}</label>
              <input type="text" required value={destRegion} onChange={(e) => setDestRegion(e.target.value)} placeholder={isFood ? "Contoh: Sangalla, Tana Toraja (Wilayah Asal/Sentra)" : "Contoh: Makale, Tana Toraja / Sangalla, Tana Toraja"} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
            </div>
            {entityType === 'destinasi' && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Kategori Destinasi (Khas Toraja) *</label>
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
            {entityType !== 'destinasi' && !isFood && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Kontak Info / Telepon</label>
                <input type="text" value={destContact} onChange={(e) => setDestContact(e.target.value)} placeholder="0812-3456-7890 / @instagram" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
              </div>
            )}
          </div>

          {/* DYNAMIC FORM FIELDS */}
          
          {/* Form Destinasi */}
          {entityType === 'destinasi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Jam Operasional</label>
                <input type="text" value={destHours} onChange={(e) => setDestHours(e.target.value)} placeholder="Contoh: Setiap Hari, 08:00 - 18:00 WITA" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Informasi Biaya / Tiket Masuk</label>
                <input type="text" value={destTicketPrice} onChange={(e) => setDestTicketPrice(e.target.value)} placeholder="Contoh: Rp 15.000 (Domestik), Rp 30.000 (Mancanegara)" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs" />
              </div>
            </div>
          )}

          {/* Form Hotel */}
          {entityType === 'hotel' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Rating Bintang</label>
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
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Harga Per Malam</label>
                <input type="text" value={hotelPrice} onChange={(e) => setHotelPrice(e.target.value)} placeholder="Contoh: Rp 350.000 - Rp 950.000 / malam" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Check-In</label>
                <input type="time" value={hotelCheckIn} onChange={(e) => setHotelCheckIn(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Check-Out</label>
                <input type="time" value={hotelCheckOut} onChange={(e) => setHotelCheckOut(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition" />
              </div>
            </div>
          )}

          {/* Form Restoran / Kuliner */}
          {entityType === 'restoran' && (
            <div className="space-y-6">
              {isFood ? (
                <div className="space-y-6 p-6 bg-orange-50/20 rounded-xl border border-orange-100/70">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Status Kehalalan Hidangan</label>
                    <select value={restoHalal} onChange={(e) => setRestoHalal(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#F35A05] transition">
                      <option value="Halal Certified">Tersertifikasi Halal</option>
                      <option value="Halal Friendly">Halal Friendly (Bebas Babi/Minyak Babi)</option>
                      <option value="Non-Halal">Hidangan Non-Halal (Mengandung Babi/Lainnya)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Kisaran Harga Hidangan</label>
                    <input type="text" value={restoPriceRange} onChange={(e) => setRestoPriceRange(e.target.value)} placeholder="Contoh: Rp 35.000 - Rp 50.000 / porsi" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05] transition" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Bahan Utama & Resep</label>
                    <textarea rows={4} value={culinaryRecipe} onChange={(e) => setCulinaryRecipe(e.target.value)} placeholder="Contoh: Daging ayam/babi, jahe, bawang merah, bawang putih, daun serai, kelapa parut, batang pisang muda (A'ri)..." className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05] transition resize-y min-h-[100px]" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Cara Pembuatan (Singkat)</label>
                    <textarea rows={4} value={culinarySteps} onChange={(e) => setCulinarySteps(e.target.value)} placeholder="Contoh: Langkah 1: Potong daging kecil-kecil. Langkah 2: Campurkan dengan bumbu kuning. Langkah 3: Masukkan ke bambu dan bakar..." className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05] transition resize-y min-h-[100px]" />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Tempat Memperoleh / Penjual (ID Restoran, Pisahkan Koma)</label>
                    <input type="text" value={destFacilities} onChange={(e) => setDestFacilities(e.target.value)} placeholder="Contoh: CUL-001, CUL-002 (Ketikkan ID kedai/warung yang terdaftar)" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05] transition" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Jam Buka</label>
                    <input type="text" value={restoHours} onChange={(e) => setRestoHours(e.target.value)} placeholder="Contoh: 10:00 - 22:00 WITA" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Status Kehalalan</label>
                    <select value={restoHalal} onChange={(e) => setRestoHalal(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs">
                      <option value="Halal Certified">Tersertifikasi Halal</option>
                      <option value="Halal Friendly">Halal Friendly (No Pork/Lard)</option>
                      <option value="Non-Halal">Menyediakan Menu Non-Halal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Range Harga (Per Pax)</label>
                    <input type="text" value={restoPriceRange} onChange={(e) => setRestoPriceRange(e.target.value)} placeholder="Contoh: Rp 25.000 - Rp 100.000" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-xs" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Event */}
          {entityType === 'event' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Tanggal Mulai</label>
                <input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 transition" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Tanggal Selesai</label>
                <input type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 transition" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Harga Tiket</label>
                <input type="text" value={eventTicket} onChange={(e) => setEventTicket(e.target.value)} placeholder="Gratis / Rp 50.000" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 transition" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Penyelenggara</label>
                <input type="text" value={eventOrganizer} onChange={(e) => setEventOrganizer(e.target.value)} placeholder="Dinas Pariwisata / Swasta" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 transition" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Sub Kategori Event</label>
                <select value={eventSubCategory} onChange={(e) => setEventSubCategory(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-purple-600 transition">
                  <option value="budaya">Upacara Adat</option>
                  <option value="religi">Event Religi</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>
            </div>
          )}


          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Deskripsi Lengkap (Materi Utama AI) *</label>
            <textarea 
              required rows={6} value={destDescription} onChange={(e) => setDestDescription(e.target.value)}
              placeholder={getDescriptionPlaceholder()}
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05] transition resize-y min-h-[120px]"
            />
          </div>

          {entityType !== 'darurat' && (
            <div>
              {isFood ? (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Koordinat GPS [Lat, Lng]</label>
                  <input type="text" value={destGps} onChange={(e) => setDestGps(e.target.value)} placeholder="Contoh: -2.9734, 119.8972" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">
                      {entityType === 'restoran' ? 'ID Kedai/Restoran Penyedia (Pisahkan Koma)' : 'Fasilitas Tambahan (Pisahkan Koma)'}
                    </label>
                    <input 
                      type="text" 
                      value={destFacilities} 
                      onChange={(e) => setDestFacilities(e.target.value)} 
                      placeholder={entityType === 'restoran' ? 'Contoh: CUL-001, CUL-002' : 'Parkir, Wifi, Toilet Umum, Pemandu Lokal'} 
                      className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Koordinat GPS [Lat, Lng]</label>
                    <input type="text" value={destGps} onChange={(e) => setDestGps(e.target.value)} placeholder="Contoh: -2.9734, 119.8972" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05]" />
                  </div>
                </div>
              )}
            </div>
          )}

          {entityType !== 'darurat' && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Foto Sampul / Banner Destinasi (Drag & Drop atau Klik)</label>
              
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition ${
                  dragActive 
                    ? 'border-[#F35A05] bg-orange-50/10' 
                    : 'border-slate-300 hover:border-[#F35A05] bg-slate-50/50 hover:bg-orange-50/5'
                }`}
              >
                <input 
                  type="file"
                  id="image-drop-input"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                
                {destImageUrl ? (
                  <div className="w-full flex flex-col items-center space-y-3">
                    <div className="relative w-full max-w-md aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200/80">
                      <img 
                        src={destImageUrl} 
                        alt="Preview upload" 
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <label 
                        htmlFor="image-drop-input"
                        className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 rounded-lg text-[10px] font-black text-slate-600 transition active:scale-95 cursor-pointer select-none"
                      >
                        Ganti Gambar
                      </label>
                      <button 
                        type="button"
                        onClick={() => setDestImageUrl('')}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 hover:border-red-200 rounded-lg text-[10px] font-black transition active:scale-95 select-none"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="image-drop-input" className="flex flex-col items-center justify-center space-y-2 cursor-pointer w-full text-center">
                    <UploadCloud className={`w-8 h-8 ${uploadingImage ? 'text-[#F35A05] animate-pulse' : 'text-slate-400'}`} />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">
                        {uploadingImage ? 'Sedang mengunggah...' : 'Tarik & Letakkan gambar di sini, atau klik untuk memilih'}
                      </p>
                      <p className="text-[10px] text-slate-400">Mendukung format PNG, JPG, JPEG (Maks. 5MB). Gambar akan otomatis dikompresi.</p>
                    </div>
                  </label>
                )}
              </div>
              <p className="text-[10px] text-slate-400 pl-1">Gambar ini akan digunakan sebagai cover utama kartu informasi di aplikasi PWA Siulu'.</p>
            </div>
          )}

          {entityType === 'destinasi' && (
            <>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Aturan & Tips Berkunjung</label>
                <input type="text" value={destTips} onChange={(e) => setDestTips(e.target.value)} placeholder="Berpakaian sopan, bawa uang tunai..." className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Link Embed YouTube (Opsional)</label>
                  <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05]" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 tracking-wider pl-1">Link Embed Instagram (Opsional)</label>
                  <input type="text" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://www.instagram.com/p/.../embed/" className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F35A05]" />
                </div>
              </div>
            </>
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
                <span className="text-xs font-black text-slate-700 tracking-wider">Tandai sebagai Featured Event (Tampilkan di Halaman Utama PWA)</span>
              </label>
            </div>
          )}

          <div className="pt-6 border-t border-slate-200">
            <button 
              type="submit" disabled={formLoading}
              className="px-8 py-3.5 bg-[#F35A05] hover:bg-[#d94200] disabled:opacity-50 text-white font-black rounded-lg text-xs tracking-widest transition flex items-center justify-center space-x-2"
            >
              {formLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  <span>Menyimpan & Memproses Embedding...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Entitas {isFood ? 'kuliner' : entityType}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function AddKnowledgeBase() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#F35A05] border-t-transparent"></div>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Memuat Form...</p>
        </div>
      </div>
    }>
      <AddKnowledgeBaseForm />
    </Suspense>
  );
}
