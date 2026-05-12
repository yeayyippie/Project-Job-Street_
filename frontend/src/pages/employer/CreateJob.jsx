import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Briefcase, MapPin, DollarSign, Calendar, Loader2 } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State form dasar
  const [formData, setFormData] = useState({
    title: '', category: 'IT & Software', job_type: 'full-time',
    location: '', salary_range: '', deadline: '', description: ''
  });

  // State khusus untuk array Requirements
  const [requirementInput, setRequirementInput] = useState('');
  const [requirements, setRequirements] = useState([]);

  const handleAddRequirement = () => {
    if (requirementInput.trim() !== '') {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const payload = { ...formData, requirements };
      
      await api.post('/api/jobs', payload);
      
      // Notifikasi sukses dengan SweetAlert2
      await Swal.fire({
        title: 'Berhasil!',
        text: 'Lowongan pekerjaan berhasil dipublikasikan.',
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Lihat Dashboard',
        showCancelButton: true,
        cancelButtonText: 'Tambah Lagi',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/employer/dashboard');
        } else {
          // Reset form untuk tambah lowongan lagi
          resetForm();
        }
      });
      
    } catch (err) {
      console.error(err);
      
      // Notifikasi error dengan detail
      const errorMessage = err.response?.status === 401
        ? 'Sesi login Anda sudah berakhir. Silakan login kembali.'
        : err.response?.data?.message || 'Terjadi kesalahan saat mempublikasikan lowongan.';
      const errorDetail = err.response?.data?.errors;
      
      let errorHtml = `<p>${errorMessage}</p>`;
      if (errorDetail) {
        errorHtml += '<ul class="text-left mt-2">';
        Object.keys(errorDetail).forEach(key => {
          errorHtml += `<li>• ${errorDetail[key].join(', ')}</li>`;
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

  const resetForm = () => {
    setFormData({
      title: '', category: 'IT & Software', job_type: 'full-time',
      location: '', salary_range: '', deadline: '', description: ''
    });
    setRequirements([]);
    setRequirementInput('');
    
    Swal.fire({
      title: 'Form Reset',
      text: 'Form telah direset. Anda dapat membuat lowongan baru.',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Validasi requirements
    if (requirements.length === 0) {
      Swal.fire({
        title: 'Perhatian!',
        text: 'Mohon tambahkan setidaknya satu requirement/persyaratan untuk lowongan ini.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // Validasi field wajib
    if (!formData.title || !formData.location || !formData.deadline || !formData.description) {
      Swal.fire({
        title: 'Form Tidak Lengkap!',
        text: 'Mohon isi semua field yang wajib diisi (Judul Pekerjaan, Lokasi, Deadline, Deskripsi Pekerjaan).',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    // Konfirmasi sebelum publish
    Swal.fire({
      title: 'Konfirmasi Publikasi',
      text: `Apakah Anda yakin ingin mempublikasikan lowongan "${formData.title}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Publikasikan!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        handleSubmit();
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/employer/dashboard" className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Buat Lowongan Baru</h1>
            <p className="text-slate-500">Temukan talenta terbaik untuk perusahaan Anda.</p>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleFormSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-glass p-8 space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Judul Pekerjaan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" required placeholder="Contoh: Senior Frontend Developer"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Kategori</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="IT & Software">IT & Software</option>
                <option value="Marketing">Marketing</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Tipe Pekerjaan</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none"
                value={formData.job_type}
                onChange={(e) => setFormData({...formData, job_type: e.target.value})}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="remote">Remote</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" required placeholder="Contoh: Jakarta Pusat / Remote"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Range Gaji (Opsional)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="text" placeholder="Contoh: Rp 8.000.000 - Rp 15.000.000"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                  value={formData.salary_range}
                  onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                Batas Akhir Lamaran (Deadline) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="date" required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-600"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Details */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Deskripsi Pekerjaan <span className="text-red-500">*</span>
            </label>
            <textarea 
              required rows="4" placeholder="Jelaskan peran, tanggung jawab, dan kultur perusahaan..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Dynamic Array untuk Requirements */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Persyaratan (Requirements / Skills) <span className="text-red-500">*</span>
            </label>
            
            <div className="flex gap-2">
              <input 
                type="text" placeholder="Contoh: Minimal 2 tahun pengalaman dengan React JS"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button 
                type="button" onClick={handleAddRequirement}
                className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-600 transition-colors flex items-center gap-2"
              >
                <Plus size={18} /> Tambah
              </button>
            </div>

            {/* List Requirements yang ditambahkan */}
            {requirements.length > 0 && (
              <ul className="mt-4 space-y-2">
                {requirements.map((req, index) => (
                  <li key={index} className="flex justify-between items-center bg-brand-50/50 px-4 py-3 rounded-xl border border-brand-100/50">
                    <span className="text-slate-700 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                      {req}
                    </span>
                    <button 
                      type="button" onClick={() => handleRemoveRequirement(index)}
                      className="text-red-400 hover:text-red-600 p-1 bg-white rounded-md shadow-sm transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            {requirements.length === 0 && (
              <p className="text-xs text-red-500 mt-1">* Minimal 1 persyaratan diperlukan</p>
            )}
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button 
              type="button"
              onClick={() => {
                Swal.fire({
                  title: 'Batal Membuat Lowongan?',
                  text: 'Perubahan yang belum disimpan akan hilang.',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#6b7280',
                  cancelButtonColor: '#10b981',
                  confirmButtonText: 'Ya, Batal',
                  cancelButtonText: 'Kembali'
                }).then((result) => {
                  if (result.isConfirmed) {
                    navigate('/employer/dashboard');
                  }
                });
              }}
              className="px-8 py-4 bg-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-300 transition-all"
            >
              Batal
            </button>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/30 flex items-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                'Publikasikan Lowongan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;
