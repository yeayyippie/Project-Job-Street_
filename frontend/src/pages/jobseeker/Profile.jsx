import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, GraduationCap, Briefcase, Cpu, Save, Camera } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const JobseekerProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State mencakup semua field di database
  const [profile, setProfile] = useState({ 
    name: '', email: '', full_name: '', phone: '', location: '', education: '', experience: '' 
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  // 🔥 PERUBAHAN: useEffect mengambil data dari API /api/profile
  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        setLoading(true);
        // Panggil API untuk mengambil data profil lengkap dari backend
        const res = await api.get('/api/profile');
        const fullUser = res.data.user; // Sesuaikan dengan struktur response backend

        if (fullUser) {
          // Isi form state dengan data lengkap
          setProfile({
            name: fullUser.name || '',
            email: fullUser.email || '',
            full_name: fullUser.job_seeker_profile?.full_name || '',
            phone: fullUser.job_seeker_profile?.phone || '',
            location: fullUser.job_seeker_profile?.location || '',
            education: fullUser.job_seeker_profile?.education || '',
            experience: fullUser.job_seeker_profile?.experience || '',
          });
          setPhotoPreview(fullUser.photo || '');

          // Parse skills
          if (fullUser.job_seeker_profile?.skills) {
            try {
              const parsed = JSON.parse(fullUser.job_seeker_profile.skills);
              setSkills(Array.isArray(parsed) ? parsed : []);
            } catch {
              setSkills(fullUser.job_seeker_profile.skills.split(','));
            }
          }
        }
      } catch (err) {
        console.error("Gagal mengambil profil lengkap", err);
        // Fallback: Gunakan info user dasar dari context jika API gagal
        if (user) {
          setProfile((prev) => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
          }));
          setPhotoPreview(user.photo || '');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFullProfile();
  }, [user]); // Ketergantungan pada 'user' agar fetch ulang saat context berubah (login ulang)

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('email', profile.email);
    formData.append('full_name', profile.full_name);
    formData.append('phone', profile.phone);
    formData.append('location', profile.location);
    formData.append('education', profile.education);
    formData.append('experience', profile.experience);
    formData.append('skills', JSON.stringify(skills)); 
    
    if (photoFile) formData.append('photo', photoFile);
    formData.append('_method', 'PUT');

    try {
      const res = await api.post('/api/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Profil berhasil diperbarui!');
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
      window.location.reload(); 
    } catch (err) {
      alert('Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput('');
    }
  };

  if (loading) return <div className="pt-24 text-center">Memuat profil...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Profil Pencari Kerja</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* FOTO PROFIL */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 flex flex-col items-center">
            <div className="relative mb-4 group cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-slate-50 shadow-sm">
                {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" /> : <User size={64} className="text-slate-300 w-full h-full p-4" />}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer">
                <Camera size={24} />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>
            <p className="text-sm text-slate-500">Ubah Foto Profil</p>
          </div>

          {/* INFO AKUN & KONTAK */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><User className="text-brand-500"/> Informasi Kontak</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="text-sm font-bold text-slate-700">Username</label><input type="text" value={profile.name} onChange={e=>setProfile({...profile, name: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 rounded-xl" required/></div>
              <div><label className="text-sm font-bold text-slate-700">Email</label><input type="email" value={profile.email} onChange={e=>setProfile({...profile, email: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 rounded-xl" required/></div>
              <div><label className="text-sm font-bold text-slate-700">Nama Lengkap (Sesuai KTP/CV)</label><input type="text" value={profile.full_name} onChange={e=>setProfile({...profile, full_name: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 rounded-xl"/></div>
              <div><label className="text-sm font-bold text-slate-700">No. Telepon</label><input type="text" value={profile.phone} onChange={e=>setProfile({...profile, phone: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 rounded-xl"/></div>
              <div className="md:col-span-2"><label className="text-sm font-bold text-slate-700">Alamat / Domisili</label><input type="text" value={profile.location} onChange={e=>setProfile({...profile, location: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 rounded-xl"/></div>
            </div>
          </div>

          {/* RIWAYAT PENDIDIKAN & PENGALAMAN */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Briefcase className="text-brand-500"/> Riwayat</h2>
            <div className="space-y-6">
              <div><label className="text-sm font-bold text-slate-700">Pendidikan Terakhir</label><textarea rows="3" value={profile.education} onChange={e=>setProfile({...profile, education: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 rounded-xl resize-none" placeholder="Contoh: S1 Teknik Informatika..."/></div>
              <div><label className="text-sm font-bold text-slate-700">Pengalaman Kerja</label><textarea rows="3" value={profile.experience} onChange={e=>setProfile({...profile, experience: e.target.value})} className="w-full mt-2 p-3 bg-slate-50 rounded-xl resize-none" placeholder="Contoh: Frontend Developer di PT. ABC..."/></div>
            </div>
          </div>

          {/* SKILLS */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Cpu className="text-brand-500"/> Keahlian (Skills)</h2>
            <div className="flex gap-2 mb-4">
              <input type="text" value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyPress={e=>e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Ketik skill lalu tekan Tambah" className="flex-1 p-3 bg-slate-50 rounded-xl"/>
              <button type="button" onClick={addSkill} className="px-6 bg-slate-900 text-white rounded-xl font-bold">Tambah</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-brand-50 text-brand-700 rounded-xl text-sm flex items-center gap-2">{skill} <button type="button" onClick={()=>setSkills(skills.filter(s=>s!==skill))} className="text-brand-400 hover:text-red-500">×</button></span>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all flex items-center gap-2">
              <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Profil Lengkap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobseekerProfile;