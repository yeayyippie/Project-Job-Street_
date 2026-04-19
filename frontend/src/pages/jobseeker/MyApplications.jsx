import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Clock, CheckCircle, XCircle, Building2 } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/api/my-applications');
        // Menyesuaikan struktur response dari backend (biasanya res.data atau res.data.data)
        const appsData = res.data.data || res.data;
        if (Array.isArray(appsData)) {
          setApplications(appsData);
        }
      } catch (err) {
        console.error("Gagal memuat lamaran", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // Fungsi untuk memberi warna dan icon berdasarkan status lamaran
  const getStatusBadge = (status) => {
    const statusText = status?.toLowerCase() || 'pending';
    
    if (statusText === 'accepted' || statusText === 'diterima') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-bold">
          <CheckCircle size={16} /> Diterima
        </span>
      );
    }
    if (statusText === 'rejected' || statusText === 'ditolak') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-bold">
          <XCircle size={16} /> Ditolak
        </span>
      );
    }
    
    // Default: Pending / Menunggu
    return (
      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-sm font-bold">
        <Clock size={16} /> Menunggu Review
      </span>
    );
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center text-slate-500">Memuat riwayat lamaran...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Lamaran Saya</h1>
          <p className="text-slate-500 mt-2">Pantau status lamaran kerja yang telah Anda kirimkan.</p>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Info Lowongan */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-bold uppercase">
                      {app.job_post?.category || 'Kategori'}
                    </span>
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Calendar size={14} /> Dilamar pada: {new Date(app.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  
                  <Link to={`/jobs/${app.job_post_id}`} className="text-xl font-bold text-slate-900 hover:text-brand-600 transition-colors block mb-1">
                    {app.job_post?.title || 'Posisi Pekerjaan'}
                  </Link>
                  
                  <div className="text-slate-500 font-medium flex items-center gap-2">
                    <Building2 size={16} /> {app.job_post?.company?.company_name || 'Nama Perusahaan'}
                  </div>
                </div>

                {/* Status & Aksi */}
                <div className="flex flex-col items-start md:items-end gap-3 md:min-w-[150px]">
                  {getStatusBadge(app.status)}
                  <Link 
                    to={`/jobs/${app.job_post_id}`}
                    className="text-sm font-bold text-brand-600 hover:text-brand-700"
                  >
                    Lihat Detail Lowongan &rarr;
                  </Link>
                </div>
                
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <Briefcase size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada lamaran</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              Anda belum mengirimkan lamaran pekerjaan apa pun. Mulai cari dan lamar pekerjaan impian Anda sekarang!
            </p>
            <Link to="/" className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
              Cari Lowongan
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;