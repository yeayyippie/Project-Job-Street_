/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Bookmark, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

const JobCard = ({ job, onRemoveBookmark, isSavedPage }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const companyName = job.company?.company_name || job.company_name || 'Perusahaan';

  // Cek status bookmark jika bukan di halaman saved
  useEffect(() => {
    if (!isSavedPage) {
      const checkBookmarkStatus = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setIsBookmarked(false);
          setBookmarkId(null);
          return;
        }

        try {
          const res = await api.get('/api/bookmarks');
          const bookmarks = res.data.data || res.data;
          const currentBookmark = Array.isArray(bookmarks)
            ? bookmarks.find(bm => (bm.job_post_id || bm.job_id || bm.job_post?.id) === job.id)
            : null;
          setIsBookmarked(Boolean(currentBookmark));
          setBookmarkId(currentBookmark?.id || null);
        } catch (err) {
          console.error("Gagal mengambil status bookmark", err);
        }
      };
      checkBookmarkStatus();
    } else {
      // Di halaman saved, asumsikan sudah di-bookmark
      setIsBookmarked(true);
    }
  }, [job.id, isSavedPage]);

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    if (loadingBookmark) return;

    if (!localStorage.getItem('auth_token')) {
      Swal.fire({
        icon: 'warning',
        title: 'Login diperlukan',
        text: 'Silakan login sebagai jobseeker untuk menyimpan lowongan.',
        confirmButtonColor: '#5D688A',
      });
      return;
    }
    
    // Jika di halaman saved, panggil onRemoveBookmark jika ada
    if (isSavedPage && onRemoveBookmark) {
      return onRemoveBookmark();
    }

    // Mode normal (tambah bookmark)
    setLoadingBookmark(true);
    Swal.fire({
      title: isBookmarked ? 'Menghapus bookmark...' : 'Menyimpan bookmark...',
      text: 'Mohon tunggu sebentar.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      if (isBookmarked) {
        // Hapus bookmark
        if (bookmarkId) {
          await api.delete(`/api/bookmarks/${bookmarkId}`);
        } else {
          await api.delete('/api/bookmarks', { data: { job_post_id: job.id } });
        }
        setIsBookmarked(false);
        setBookmarkId(null);
        Swal.fire({
          icon: 'success',
          title: 'Bookmark dihapus',
          text: 'Lowongan berhasil dihapus dari daftar tersimpan.',
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        // Tambah bookmark
        const res = await api.post('/api/bookmarks', { job_post_id: job.id });
        setIsBookmarked(true);
        setBookmarkId(res.data?.data?.id || null);
        Swal.fire({
          icon: 'success',
          title: 'Tersimpan',
          text: 'Lowongan berhasil ditambahkan ke bookmark.',
          timer: 1600,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal mengubah bookmark.',
        confirmButtonColor: '#5D688A',
      });
    } finally {
      setLoadingBookmark(false);
    }
  };

  return (
    <div 
      className="bg-white/80 backdrop-blur-lg border border-white/70 shadow-glass rounded-3xl p-6 hover:-translate-y-1 hover:shadow-soft transition-all duration-300 group relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center text-brand-600 font-bold text-xl shadow-inner">
            {companyName?.charAt(0) || 'P'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-slate-500 font-medium">{companyName}</p>
          </div>
        </div>
        <button 
          onClick={handleBookmarkClick}
          disabled={loadingBookmark}
          className={`p-2 rounded-full transition-all ${
            isBookmarked || isSavedPage
              ? 'text-brand-500 hover:text-brand-600 bg-brand-50' 
              : 'text-slate-400 hover:text-brand-500 hover:bg-brand-50'
          }`}
        >
          <Bookmark size={22} fill={isBookmarked || isSavedPage ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 text-slate-600 rounded-lg text-sm font-medium">
          <MapPin size={16} /> {job.location}
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-sm font-medium">
          <Briefcase size={16} /> {job.job_type}
        </span>
        <span className="px-3 py-1 bg-accent-50 text-accent-600 rounded-lg text-sm font-medium">
          {job.category}
        </span>
      </div>

      <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed mb-6">
        {job.description}
      </p>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <span className="text-slate-700 font-semibold">{job.salary_range}</span>
        <Link 
          to={`/jobs/${job.id}`} 
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-900 transition-all font-medium shadow-soft"
        >
          Detail <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
