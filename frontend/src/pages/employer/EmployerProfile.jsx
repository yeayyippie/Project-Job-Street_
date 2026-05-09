/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Building, Save, MapPin, Globe, User, Edit2, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const EmployerProfile = () => {
  const { updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    location: '',
    description: '',
    website: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [initialData, setInitialData] = useState({}); // Untuk tracking perubahan

  const backendUrl = 'http://localhost:8000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/employer/profile');
        const data = res.data.data || res.data;
        if (data && data.company_name) {
          const profileData = {
            company_name: data.company_name || '',
            industry: data.industry || '',
            location: data.location || '',
            description: data.description || '',
            website: data.website || '',
          };
          setFormData(profileData);
          setInitialData(profileData);

          if (data.logo) {
            setLogoPreview(`${backendUrl}/storage/${data.logo}`);
          }

          setIsEditing(false);
        }
      } catch (err) {
        console.error("Gagal memuat profil employer", err);
        Swal.fire({
          title: 'Error!',
          text: 'Gagal memuat data profil perusahaan.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK'
        });
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: 'Format File Tidak Didukung!',
          text: 'Harap upload file gambar (JPG, PNG, GIF, atau WEBP)',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      // Validasi ukuran file (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          title: 'Ukuran File Terlalu Besar!',
          text: 'Maksimal ukuran file adalah 2MB',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
        return;
      }
      
      setPhotoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      
      // Notifikasi preview
      Swal.fire({
        title: 'Foto Diupload',
        text: 'Logo perusahaan akan diperbarui saat menyimpan profil.',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  // Cek apakah ada perubahan data
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialData) || photoFile !== null;
  };

  const handleCancelEdit = async () => {
    if (hasChanges()) {
      const result = await Swal.fire({
        title: 'Batalkan Perubahan?',
        text: 'Perubahan yang belum disimpan akan hilang.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6b7280',
        cancelButtonColor: '#10b981',
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Kembali Edit'
      });
      
      if (result.isConfirmed) {
        // Reset ke data awal
        setFormData(initialData);
        setPhotoFile(null);
        // Reset preview ke logo awal
        if (initialData.logo) {
          setLogoPreview(`${backendUrl}/storage/${initialData.logo}`);
        } else {
          setLogoPreview('');
        }
        setIsEditing(false);
        
        Swal.fire({
          title: 'Perubahan Dibatalkan',
          text: 'Profil kembali ke data sebelumnya.',
          icon: 'info',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi nama perusahaan tidak kosong
    if (!formData.company_name.trim()) {
      Swal.fire({
        title: 'Validasi Gagal',
        text: 'Nama perusahaan wajib diisi.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setLoading(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    if (photoFile) {
      submitData.append('photo', photoFile);
    }

    try {
      const res = await api.post('/api/employer/profile', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Notifikasi sukses
      await Swal.fire({
        title: 'Berhasil!',
        text: 'Profil Perusahaan berhasil disimpan.',
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK',
        timer: 2000,
        showConfirmButton: true
      });
      
      setIsEditing(false);
      
      // Update initial data setelah save
      setInitialData({ ...formData });
      
      // Hapus photoFile dari state karena sudah tersimpan
      setPhotoFile(null);

      // Update context agar Navbar berubah otomatis tanpa refresh
      if (res.data.user) {
        updateUser(res.data.user);
      }

    } catch (err) {
      console.error(err);
      
      // Notifikasi error dengan detail
      const errorMessage = err.response?.data?.message || 'Gagal menyimpan profil perusahaan.';
      const errors = err.response?.data?.errors;
      
      let errorHtml = `<p>${errorMessage}</p>`;
      if (errors) {
        errorHtml += '<ul class="text-left mt-2">';
        Object.keys(errors).forEach(key => {
          errorHtml += `<li>• ${errors[key].join(', ')}</li>`;
        });
        errorHtml += '</ul>';
      }
      
      await Swal.fire({
        title: 'Gagal!',
        html: errorHtml,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Coba Lagi'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    Swal.fire({
      title: 'Edit Profil',
      text: 'Anda akan mengedit profil perusahaan. Pastikan data yang diisi sudah benar.',
      icon: 'info',
      confirmButtonColor: '#f59e0b',
      confirmButtonText: 'Lanjutkan Edit',
      showCancelButton: true,
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsEditing(true);
      }
    });
  };

  // Konfirmasi sebelum meninggalkan halaman jika ada perubahan
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditing && hasChanges()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEditing, formData, photoFile]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-10">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Building className="text-brand-600" /> Profil Perusahaan
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Logo / Foto dengan Preview */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Logo Perusahaan</label>
            <div className="relative group mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building size={48} className="text-slate-300" />
                )}
              </div>
              {isEditing && (
                <div className="absolute bottom-0 right-0 bg-brand-600 rounded-full p-1.5 shadow-lg">
                  <Edit2 size={12} className="text-white" />
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={!isEditing}
              className={`w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {isEditing && (
              <p className="text-xs text-slate-400 mt-1">Max size: 2MB. Format: JPG, PNG, GIF, WEBP</p>
            )}
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Nama Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Industri / Bidang</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi Perusahaan</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Perusahaan</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="4"
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
              placeholder="Ceritakan tentang perusahaan Anda..."
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70 shadow-lg shadow-brand-500/30"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Simpan Profil
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEditClick}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/30"
              >
                <Edit2 size={20} />
                Edit Profil
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployerProfile;
