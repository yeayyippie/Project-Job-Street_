import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';
import api from '../../services/api';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', category: '', job_type: '',
    location: '', salary_range: '', deadline: '', description: ''
  });
  const [requirements, setRequirements] = useState([]);
  const [requirementInput, setRequirementInput] = useState('');

  // 1. Ambil data lama saat halaman dimuat
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const res = await api.get(`/api/jobs/${id}`);
        const job = res.data;
        
        setFormData({
          title: job.title,
          category: job.category,
          job_type: job.job_type,
          location: job.location,
          salary_range: job.salary_range || '',
          deadline: job.deadline,
          description: job.description
        });
        setRequirements(Array.isArray(job.requirements) ? job.requirements : []);
      } catch (err) {
        console.error("Gagal mengambil data lowongan", err);
        alert("Lowongan tidak ditemukan.");
        navigate('/employer/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchJobData();
  }, [id, navigate]);

  const handleAddRequirement = () => {
    if (requirementInput.trim() !== '') {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // Mengirim data ke PUT /api/jobs/{id} sesuai dokumentasi backend 
      await api.put(`/api/jobs/${id}`, { ...formData, requirements });
      alert('Lowongan berhasil diperbarui!');
      navigate(`/jobs/${id}`); // Kembali ke halaman detail
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui lowongan.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="pt-24 text-center">Memuat data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Lowongan</h1>
            <p className="text-slate-500">Perbarui informasi lowongan kerja Anda.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Judul */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Judul Pekerjaan</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" required value={formData.title}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            {/* Dropdown Kategori */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Kategori</label>
              <select 
                value={formData.category}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="IT & Software">IT & Software</option>
                <option value="Marketing">Marketing</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            {/* Tipe Pekerjaan (Pastikan value lowercase agar sesuai backend) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Tipe Pekerjaan</label>
              <select 
                value={formData.job_type}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                onChange={(e) => setFormData({...formData, job_type: e.target.value})}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="remote">Remote</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Lokasi</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" required value={formData.location}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Range Gaji</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" value={formData.salary_range}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                  onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="date" required value={formData.deadline}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Deskripsi</label>
            <textarea 
              required rows="5" value={formData.description}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Persyaratan */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">Persyaratan</label>
            <div className="flex gap-2">
              <input 
                type="text" value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                placeholder="Tambah persyaratan baru..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button type="button" onClick={handleAddRequirement} className="bg-slate-900 text-white px-6 rounded-2xl font-bold">
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-2 rounded-xl border border-brand-100 text-sm">
                  {req}
                  <button type="button" onClick={() => handleRemoveRequirement(index)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={updating}
              className="flex items-center gap-2 px-10 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              <Save size={20} /> {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;