import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Calendar, ChevronLeft, Send, Bookmark, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [cvFile, setCvFile] = useState(null); // State untuk file CV

  useEffect(() => {
    const fetchJobDetail = async () => {
      try {
        const res = await api.get(`/api/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error("Gagal memuat detail lowongan", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetail();
  }, [id]);

  // Fungsi melamar pekerjaan dengan CV
  const handleApply = async () => {
    if (!user) return alert("Silakan login terlebih dahulu!");
    if (user.role !== 'jobseeker') return alert("Hanya pelamar yang bisa melamar pekerjaan!");
    
    // Validasi CV wajib diunggah
    if (!cvFile) return alert("Mohon unggah CV Anda terlebih dahulu sebelum melamar!");

    const confirmApply = window.confirm("Yakin ingin mengirim lamaran beserta CV ini?");
    if (!confirmApply) return;

    setApplying(true);
    const formData = new FormData();
    formData.append('job_post_id', id);
    formData.append('cv_file', cvFile); // Lampirkan file CV

    try {
      await api.post('/api/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Yeay! Berhasil melamar pekerjaan ini.");
      navigate('/my-applications');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal melamar. Mungkin Anda sudah melamar pekerjaan ini?");
    } finally {
      setApplying(false);
    }
  };

  // Fungsi simpan ke favorit
  const handleBookmark = async () => {
    if (!user) return alert("Silakan login terlebih dahulu!");

    setBookmarking(true);
    try {
      await api.post('/api/bookmarks', { job_post_id: id });
      alert("Berhasil disimpan ke Favorit!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Gagal menyimpan. Mungkin lowongan ini sudah ada di Favorit Anda?");
    } finally {
      setBookmarking(false);
    }
  };

  if (loading) return <div className="pt-24 text-center">Memuat detail pekerjaan...</div>;
  if (!job) return <div className="pt-24 text-center text-red-500">Lowongan tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-600 mb-6 transition-colors font-medium"
        >
          <ChevronLeft size={20} /> Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kolom Kiri: Detail Utama */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                    {job.category}
                  </span>
                  <h1 className="text-3xl font-bold text-slate-900">{job.title}</h1>
                  <p className="text-slate-500 font-medium mt-1">{job.company?.company_name || 'Nama Perusahaan'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-50">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1"><MapPin size={14}/> Lokasi</span>
                  <span className="font-bold text-slate-700 text-sm">{job.location}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1"><Briefcase size={14}/> Tipe</span>
                  <span className="font-bold text-slate-700 text-sm capitalize">{job.job_type}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1"><DollarSign size={14}/> Gaji</span>
                  <span className="font-bold text-slate-700 text-sm">{job.salary_range || 'Negosiasi'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 text-xs flex items-center gap-1"><Calendar size={14}/> Batas</span>
                  <span className="font-bold text-slate-700 text-sm">{new Date(job.deadline).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Deskripsi Pekerjaan</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Persyaratan</h3>
                <ul className="space-y-3">
                  {Array.isArray(job.requirements) ? job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-600">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></div>
                      {req}
                    </li>
                  )) : <li className="text-slate-600">{job.requirements}</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Aksi (Sticky Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
              {user?.role === 'jobseeker' ? (
                <div className="space-y-4">
                  {/* Input file CV */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <label className="text-sm font-bold text-slate-700 block mb-2">
                      Lampirkan CV (Wajib)
                    </label>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCvFile(e.target.files[0])}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                    />
                  </div>

                  <button 
                    onClick={handleApply}
                    disabled={applying || !cvFile}
                    className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-4 rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
                  >
                    <Send size={18} /> 
                    {applying ? 'Mengirim Lamaran...' : 'Lamar Sekarang'}
                  </button>
                  <button 
                    onClick={handleBookmark}
                    disabled={bookmarking}
                    className="w-full py-4 rounded-2xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Bookmark size={18} /> 
                    {bookmarking ? 'Menyimpan...' : 'Simpan ke Favorit'}
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    Dengan melamar, Anda setuju untuk membagikan profil dan CV Anda kepada perusahaan.
                  </p>
                </div>
              ) : user?.role === 'employer' && user.id === job.company?.user_id ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-sm font-bold text-blue-700 mb-1 flex items-center gap-2">
                      <CheckCircle size={16} /> Info Lowongan Anda
                    </p>
                    <p className="text-xs text-blue-600">Lowongan ini aktif dan sedang menerima pelamar.</p>
                  </div>
                  <Link 
                    to={`/employer/jobs/edit/${job.id}`}
                    className="w-full block text-center py-4 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Edit Lowongan
                  </Link>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-slate-500 text-sm mb-4">Silakan login sebagai Pencari Kerja untuk melamar.</p>
                  <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold"
                  >
                    Login Sekarang
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;