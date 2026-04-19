import React, { useState, useEffect } from 'react';
import { Plus, Users, Briefcase, CheckCircle, XCircle, Eye, FileText, X, Clock } from 'lucide-react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const EmployerDashboard = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fungsi hapus lowongan
  const handleDelete = async (jobId) => {
    const isConfirm = window.confirm("Apakah Anda yakin ingin menghapus lowongan ini? Semua data pelamar di lowongan ini mungkin akan ikut terhapus.");
    if (isConfirm) {
      try {
        await api.delete(`/api/jobs/${jobId}`);
        setMyJobs(myJobs.filter((job) => job.id !== jobId));
        alert("Lowongan berhasil dihapus!");
      } catch (err) {
        console.error("Gagal menghapus lowongan", err);
        alert("Terjadi kesalahan saat menghapus lowongan.");
      }
    }
  };

  // Fungsi mengubah status pelamar
  const handleUpdateStatus = async (applicationId, newStatus) => {
    const confirmMessage = newStatus === 'accepted' 
      ? 'Yakin ingin MENERIMA pelamar ini?' 
      : 'Yakin ingin MENOLAK pelamar ini?';
    if (!window.confirm(confirmMessage)) return;

    setUpdatingStatus(true);
    try {
      // Pastikan endpoint ini sesuai dengan route di backend Anda (PUT /api/applications/{id}/status)
      await api.put(`/api/applications/${applicationId}/status`, { status: newStatus });
      alert(`Berhasil! Status pelamar diubah menjadi: ${newStatus === 'accepted' ? 'Diterima' : 'Ditolak'}`);
      
      // Update state lokal di selectedJob
      const updatedApplications = selectedJob.applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      const updatedSelectedJob = { ...selectedJob, applications: updatedApplications };
      setSelectedJob(updatedSelectedJob);
      
      // Update juga myJobs agar sinkron
      const updatedJobs = myJobs.map(job => 
        job.id === selectedJob.id ? updatedSelectedJob : job
      );
      setMyJobs(updatedJobs);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal mengubah status pelamar.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Ambil data lowongan milik employer
  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        const res = await api.get('/api/employer/jobs');
        const jobData = res.data.data || res.data;
        if (Array.isArray(jobData)) {
          setMyJobs(jobData);
        } else {
          setMyJobs([]);
          console.warn("Format data bukan array:", res.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data dashboard", err);
        setMyJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployerData();
  }, []);

  const openApplicantsModal = (job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
  };

  if (loading) return <div className="pt-24 text-center">Memuat Dashboard...</div>;

  return (
    <div className="pt-24 pb-12 px-4 md:px-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header & Stats */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Employer Dashboard</h1>
            <p className="text-slate-500">Kelola lowongan dan pantau pelamar Anda.</p>
          </div>
          <Link 
            to="/employer/jobs/create" 
            className="flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
          >
            <Plus size={20} /> Tambah Lowongan
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={24} />
            </div>
            <h3 className="text-slate-500 font-medium">Total Lowongan</h3>
            <p className="text-3xl font-bold text-slate-900">{myJobs.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-accent-50 text-accent-600 rounded-2xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-slate-500 font-medium">Total Pelamar</h3>
            <p className="text-3xl font-bold text-slate-900">
              {myJobs.reduce((acc, job) => acc + (job.applications?.length || 0), 0)}
            </p>
          </div>
        </div>

        {/* Jobs & Applicants Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-glass overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">Posisi Lowongan</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">Pelamar</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-800">{job.title}</div>
                    <div className="text-xs text-slate-400">{job.category} • {job.job_type}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex -space-x-2">
                      {job.applications?.slice(0, 3).map((app, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-brand-100 flex items-center justify-center text-[10px] font-bold">
                          {app.user?.name?.charAt(0)}
                        </div>
                      ))}
                      {job.applications?.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                          +{job.applications.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => openApplicantsModal(job)}
                        title="Lihat Pelamar"
                        className="p-2 text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all"
                      >
                        <Users size={18} />
                      </button>
                      <Link 
                        to={`/jobs/${job.id}`} 
                        title="Lihat Detail"
                        className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(job.id)}
                        title="Hapus Lowongan"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {myJobs.length === 0 && (
            <div className="py-20 text-center text-slate-400">Belum ada lowongan yang diposting.</div>
          )}
        </div>
      </div>

      {/* Modal Daftar Pelamar */}
      {showApplicantsModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Pelamar: {selectedJob.title}</h2>
                <p className="text-sm text-slate-500">{selectedJob.applications?.length || 0} pelamar</p>
              </div>
              <button onClick={() => setShowApplicantsModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4 max-h-[calc(80vh-80px)]">
              {selectedJob.applications?.length > 0 ? (
                selectedJob.applications.map((app) => {
                  const backendStorageUrl = 'http://localhost:8000/storage';
                  const cvPath = app.cv_file || app.job_seeker?.cv_file;
                  const currentStatus = app.status?.toLowerCase() || 'pending';
                  const isAccepted = currentStatus === 'accepted';
                  const isRejected = currentStatus === 'rejected';
                  const isPending = !isAccepted && !isRejected;

                  return (
                    <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl bg-white gap-4">
                      {/* Info Kiri */}
                      <div>
                        <h4 className="font-bold text-slate-800">{app.user?.name || 'Nama Pelamar'}</h4>
                        <p className="text-sm text-slate-500 mt-1">
                          Dilamar: {new Date(app.created_at).toLocaleDateString('id-ID')}
                        </p>
                        <p className="text-sm mt-1">
                          Status: 
                          <span className={`font-bold ml-1 ${
                            isAccepted ? 'text-green-600' : 
                            isRejected ? 'text-red-600' : 
                            'text-orange-500'
                          }`}>
                            {isAccepted ? 'DITERIMA' : isRejected ? 'DITOLAK' : 'PENDING'}
                          </span>
                        </p>
                      </div>

                      {/* Tombol Aksi Kanan */}
                      <div className="flex flex-wrap items-center gap-2">
                        {cvPath ? (
                          <a 
                            href={`${backendStorageUrl}/${cvPath}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors text-sm"
                          >
                            <FileText size={16} /> Lihat CV
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400 italic">CV tidak dilampirkan</span>
                        )}

                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'accepted')}
                          disabled={isAccepted || updatingStatus}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle size={16} /> Terima
                        </button>

                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'rejected')}
                          disabled={isRejected || updatingStatus}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle size={16} /> Tolak
                        </button>
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