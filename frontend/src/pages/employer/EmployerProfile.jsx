import React, { useState, useEffect } from 'react';
import { Building, Save, MapPin, Globe, User, Edit2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext'; // Tambahkan ini!

const EmployerProfile = () => {
  const { updateUser } = useAuth(); // Ambil fungsi updateUser dari context
  
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

  const backendUrl = 'http://localhost:8000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/employer/profile');
        const data = res.data.data || res.data;
        if (data && data.company_name) {
          setFormData({
            company_name: data.company_name || '',
            industry: data.industry || '',
            location: data.location || '',
            description: data.description || '',
            website: data.website || '',
          });

          if (data.logo) {
            setLogoPreview(`${backendUrl}/storage/${data.logo}`);
          }

          setIsEditing(false);
        }
      } catch (err) {
        console.error("Gagal memuat profil employer", err);
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
      setPhotoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    if (photoFile) {
      submitData.append('photo', photoFile);
    }

    try {
      const res = await api.post('/api/employer/profile', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Profil Perusahaan berhasil disimpan!');
      setIsEditing(false);

      // Update context agar Navbar berubah otomatis tanpa refresh
      if (res.data.user) {
        updateUser(res.data.user);
      }

    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan profil.');
    } finally {
      setLoading(false);
    }
  };

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
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={!isEditing}
              className={`w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          {/* Form Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nama Perusahaan</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!isEditing ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
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
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!isEditing ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
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
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!isEditing ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!isEditing ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
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
              className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all ${!isEditing ? 'bg-slate-100 text-slate-500' : 'bg-white'}`}
              placeholder="Ceritakan tentang perusahaan Anda..."
            />
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            {isEditing ? (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70 shadow-lg shadow-brand-500/30"
              >
                <Save size={20} />
                {loading ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            ) : (
              <button
                type="button" // Pastikan type-nya button
                onClick={(e) => {
                  e.preventDefault(); // 🔥 TAMBAHKAN INI: Cegah form agar tidak ikut tersubmit
                  setIsEditing(true);
                }}
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