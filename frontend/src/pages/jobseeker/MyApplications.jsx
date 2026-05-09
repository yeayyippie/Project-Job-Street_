import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, Clock, CheckCircle, XCircle, Building2, MessageCircle, ClipboardCheck } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

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
  const getStatusMeta = (status) => {
    const statusText = status?.toLowerCase() || 'pending_review';
    const statuses = {
      pending_review: {
        label: 'Menunggu Review',
        icon: Clock,
        className: 'bg-amber-50 text-amber-700 border-amber-200',
      },
      applied: {
        label: 'Menunggu Review',
        icon: Clock,
        className: 'bg-amber-50 text-amber-700 border-amber-200',
      },
      interview: {
        label: 'Wawancara',
        icon: MessageCircle,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      },
      psychotest: {
        label: 'Psikotes',
        icon: ClipboardCheck,
        className: 'bg-purple-50 text-purple-700 border-purple-200',
      },
      accepted: {
        label: 'Diterima',
        icon: CheckCircle,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
      diterima: {
        label: 'Diterima',
        icon: CheckCircle,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
      rejected: {
        label: 'Ditolak',
        icon: XCircle,
        className: 'bg-rose-50 text-rose-700 border-rose-200',
      },
      ditolak: {
        label: 'Ditolak',
        icon: XCircle,
        className: 'bg-rose-50 text-rose-700 border-rose-200',
      },
    };
    return statuses[statusText] || statuses.pending_review;
  };

  const getStatusBadge = (app) => {
    const meta = getStatusMeta(app.status);
    const Icon = meta.icon;
    
    return (
      <button
        type="button"
        onClick={() => showStatusDetail(app)}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-sm font-bold hover:brightness-95 transition-all ${meta.className}`}
      >
        <Icon size={16} /> {meta.label}
      </button>
    );
  };

  const showStatusDetail = (app) => {
    const meta = getStatusMeta(app.status);

    Swal.fire({
      icon: 'info',
      title: `Status: ${meta.label}`,
      html: `
        <div style="text-align:left">
          <p><strong>Lowongan:</strong> ${escapeHtml(app.job_post?.title || 'Posisi Pekerjaan')}</p>
          <p><strong>Perusahaan:</strong> ${escapeHtml(app.job_post?.company?.company_name || 'Nama Perusahaan')}</p>
          <p style="margin-top:12px"><strong>Detail dari employer:</strong></p>
          <p style="white-space:pre-wrap;margin-top:6px">${escapeHtml(app.status_note || 'Belum ada detail tambahan untuk status ini.')}</p>
        </div>
      `,
      confirmButtonColor: '#5D688A',
    });
  };

  if (loading) {
    return <div className="min-h-screen pt-32 text-center text-slate-500">Memuat riwayat lamaran...</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-10 pastel-blob">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Lamaran Saya</h1>
          <p className="text-slate-500 mt-2">Pantau status lamaran kerja yang telah Anda kirimkan.</p>
        </div>

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="soft-surface rounded-3xl p-6 hover:-translate-y-0.5 hover:shadow-soft transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                
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
                  {getStatusBadge(app)}
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
          <div className="soft-surface rounded-3xl p-12 text-center flex flex-col items-center">
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
