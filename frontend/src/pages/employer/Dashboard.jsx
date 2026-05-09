/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Plus, Users, Briefcase, Eye, FileText, X, Clock, MessageCircle, ClipboardCheck, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const STATUS_FLOW = [
  { value: 'pending_review', label: 'Menunggu Review', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'interview', label: 'Wawancara', icon: MessageCircle, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'psychotest', label: 'Psikotes', icon: ClipboardCheck, className: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'accepted', label: 'Diterima', icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'rejected', label: 'Ditolak', icon: XCircle, className: 'bg-rose-50 text-rose-700 border-rose-200' },
];

const getStatusMeta = (status) => STATUS_FLOW.find(item => item.value === status) || STATUS_FLOW[0];
const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const StatusBadge = ({ status, note, onClick }) => {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;
  const className = `inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-bold ${meta.className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} hover:brightness-95 transition-all`}>
        <Icon size={14} /> {meta.label}{note ? ' • Detail' : ''}
      </button>
    );
  }

  return <span className={className}><Icon size={14} /> {meta.label}</span>;
};

const showSavingStatus = (title) => {
  Swal.fire({
    title,
    text: 'Mohon tunggu sebentar.',
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

const EmployerDashboard = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchEmployerData = async () => {
    try {
      const res = await api.get('/api/employer/jobs');
      const jobData = res.data.data || res.data;
      setMyJobs(Array.isArray(jobData) ? jobData : []);
    } catch (err) {
      console.error('Gagal mengambil data dashboard', err);
      setMyJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const handleDelete = async (jobId) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus lowongan?',
      text: 'Semua data pelamar pada lowongan ini juga akan ikut terhapus.',
      showCancelButton: true,
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#5D688A',
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/jobs/${jobId}`);
      setMyJobs(myJobs.filter((job) => job.id !== jobId));
      Swal.fire({ icon: 'success', title: 'Lowongan berhasil dihapus', timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error('Gagal menghapus lowongan', err);
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan saat menghapus lowongan.' });
    }
  };

  const syncUpdatedApplication = (updatedApp) => {
    const updatedApplications = selectedJob.applications.map(app =>
      app.id === updatedApp.id ? { ...app, ...updatedApp } : app
    );
    const updatedSelectedJob = { ...selectedJob, applications: updatedApplications };
    setSelectedJob(updatedSelectedJob);
    setMyJobs(myJobs.map(job => job.id === selectedJob.id ? updatedSelectedJob : job));
  };

  const showStatusDetail = async (app) => {
    const meta = getStatusMeta(app.status);
    const result = await Swal.fire({
      icon: 'info',
      title: `Detail ${meta.label}`,
      html: `
        <div style="text-align:left">
          <p><strong>Pelamar:</strong> ${escapeHtml(app.user?.name || 'Nama Pelamar')}</p>
          <p style="margin-top:8px;color:#64748b">Tambahkan alasan, jadwal, instruksi, atau catatan agar pelamar memahami status ini.</p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Detail untuk pelamar',
      inputValue: app.status_note || '',
      inputPlaceholder: meta.value === 'interview'
        ? 'Contoh: Kandidat sesuai kebutuhan posisi. Wawancara online Jumat pukul 10.00 WIB via Google Meet.'
        : 'Tuliskan detail singkat untuk pelamar.',
      inputAttributes: {
        maxlength: 1000,
      },
      showCancelButton: true,
      confirmButtonText: 'Simpan Detail',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#5D688A',
    });

    if (!result.isConfirmed) return;

    setUpdatingStatus(app.id);
    showSavingStatus('Menyimpan detail status...');
    try {
      const res = await api.put(`/api/applications/${app.id}/status`, {
        status: app.status || 'pending_review',
        status_note: result.value || '',
      });

      syncUpdatedApplication(res.data.data);

      Swal.fire({
        icon: 'success',
        title: 'Detail tersimpan',
        text: res.data.notification_sent
          ? 'Catatan sudah diperbarui dan notifikasi dikirim ke pelamar.'
          : 'Catatan sudah diperbarui. Notifikasi email belum terkirim, periksa konfigurasi mail server.',
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal menyimpan detail status.',
        confirmButtonColor: '#5D688A',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleUpdateStatus = async (app, newStatus) => {
    const meta = getStatusMeta(newStatus);
    const result = await Swal.fire({
      icon: 'question',
      title: `Ubah status ke ${meta.label}?`,
      input: 'textarea',
      inputLabel: 'Detail untuk pelamar',
      inputPlaceholder: newStatus === 'interview'
        ? 'Contoh: Wawancara online Jumat, 10 Mei 2026 pukul 10.00 WIB via Google Meet.'
        : 'Tuliskan catatan singkat, jadwal, instruksi, atau alasan status ini.',
      inputValue: app.status_note || '',
      inputAttributes: {
        maxlength: 1000,
      },
      inputValidator: (value) => {
        if (['interview', 'psychotest', 'accepted', 'rejected'].includes(newStatus) && !value.trim()) {
          return 'Detail wajib diisi agar pelamar memahami langkah berikutnya.';
        }
        return null;
      },
      text: 'Detail ini akan tampil saat pelamar mengklik badge status dan ikut dikirim melalui email.',
      showCancelButton: true,
      confirmButtonText: 'Ubah Status',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#5D688A',
    });

    if (!result.isConfirmed) return;

    const applicationId = app.id;
    setUpdatingStatus(applicationId);
    showSavingStatus('Mengubah status pelamar...');
    try {
      const res = await api.put(`/api/applications/${applicationId}/status`, {
        status: newStatus,
        status_note: result.value || '',
      });
      syncUpdatedApplication(res.data.data);

      Swal.fire({
        icon: 'success',
        title: 'Status diperbarui',
        text: res.data.notification_sent
          ? 'Notifikasi sudah dikirim ke email pelamar.'
          : 'Status tersimpan, tetapi notifikasi email belum terkirim. Periksa konfigurasi mail server.',
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Gagal mengubah status pelamar.' });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openApplicantsModal = (job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
  };

  if (loading) return <div className="pt-24 text-center">Memuat Dashboard...</div>;

  const totalApplicants = myJobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0);
  const inProgressApplicants = myJobs.reduce((acc, job) => (
    acc + (job.applications?.filter(app => ['interview', 'psychotest'].includes(app.status)).length || 0)
  ), 0);

  return (
    <div className="pt-24 pb-12 px-4 md:px-10 min-h-screen pastel-blob">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Employer Dashboard</h1>
            <p className="text-slate-500">Kelola lowongan dan pantau proses rekrutmen pelamar.</p>
          </div>
          <Link
            to="/employer/jobs/create"
            className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-900 transition-all shadow-soft"
          >
            <Plus size={20} /> Tambah Lowongan
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="soft-surface p-6 rounded-3xl">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={24} />
            </div>
            <h3 className="text-slate-500 font-medium">Total Lowongan</h3>
            <p className="text-3xl font-bold text-slate-900">{myJobs.length}</p>
          </div>
          <div className="soft-surface p-6 rounded-3xl">
            <div className="w-12 h-12 bg-accent-50 text-accent-600 rounded-2xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-slate-500 font-medium">Total Pelamar</h3>
            <p className="text-3xl font-bold text-slate-900">{totalApplicants}</p>
          </div>
          <div className="soft-surface p-6 rounded-3xl">
            <div className="w-12 h-12 bg-brand-100 text-brand-900 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardCheck size={24} />
            </div>
            <h3 className="text-slate-500 font-medium">Dalam Proses</h3>
            <p className="text-3xl font-bold text-slate-900">{inProgressApplicants}</p>
          </div>
        </div>

        <div className="soft-surface rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead className="bg-brand-50/70 border-b border-brand-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Posisi Lowongan</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Pelamar</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600">Tahap Terbanyak</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {myJobs.map((job) => {
                  const mainStatus = job.applications?.[0]?.status || 'pending_review';

                  return (
                    <tr key={job.id} className="hover:bg-white/70 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800">{job.title}</div>
                        <div className="text-xs text-slate-400">{job.category} - {job.job_type}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800">{job.applications?.length || 0}</div>
                        <div className="text-xs text-slate-400">pelamar</div>
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={mainStatus} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button onClick={() => openApplicantsModal(job)} title="Lihat Pelamar" className="p-2 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded-xl transition-all">
                            <Users size={18} />
                          </button>
                          <Link to={`/jobs/${job.id}`} title="Lihat Detail" className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                            <Eye size={18} />
                          </Link>
                          <button onClick={() => handleDelete(job.id)} title="Hapus Lowongan" className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {myJobs.length === 0 && (
            <div className="py-20 text-center text-slate-400">Belum ada lowongan yang diposting.</div>
          )}
        </div>
      </div>

      {showApplicantsModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/45 backdrop-blur-sm px-4">
          <div className="soft-surface rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-brand-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pelamar: {selectedJob.title}</h2>
                <p className="text-sm text-slate-500">{selectedJob.applications?.length || 0} pelamar</p>
              </div>
              <button onClick={() => setShowApplicantsModal(false)} className="p-2 hover:bg-brand-50 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 max-h-[calc(85vh-88px)]">
              {selectedJob.applications?.length > 0 ? (
                selectedJob.applications.map((app) => {
                  const backendStorageUrl = 'http://localhost:8000/storage';
                  const cvPath = app.cv_file || app.job_seeker?.cv_file;
                  const currentStatus = app.status || 'pending_review';

                  return (
                    <div key={app.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-brand-50 rounded-2xl bg-white/80 gap-4 hover:-translate-y-0.5 hover:shadow-soft transition-all">
                      <div>
                        <h4 className="font-bold text-slate-800">{app.user?.name || 'Nama Pelamar'}</h4>
                        <p className="text-sm text-slate-500 mt-1">
                          Dilamar: {new Date(app.created_at).toLocaleDateString('id-ID')}
                        </p>
                        <div className="mt-2">
                          <StatusBadge
                            status={currentStatus}
                            note={app.status_note}
                            onClick={updatingStatus === app.id ? undefined : () => showStatusDetail(app)}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {cvPath ? (
                          <a href={`${backendStorageUrl}/${cvPath}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-50 text-brand-700 font-bold rounded-xl hover:bg-brand-100 transition-colors text-sm">
                            <FileText size={16} /> Lihat CV
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400 italic">CV tidak dilampirkan</span>
                        )}

                        <select
                          value={currentStatus}
                          disabled={updatingStatus === app.id}
                          onChange={(e) => handleUpdateStatus(app, e.target.value)}
                          className="px-4 py-2 bg-white border border-brand-50 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                        >
                          {STATUS_FLOW.map(status => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400">Belum ada pelamar untuk lowongan ini.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
