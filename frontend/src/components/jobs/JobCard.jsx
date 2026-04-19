import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Bookmark, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const JobCard = ({ job, matchScore, onRemoveBookmark, isSavedPage }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);

  // Cek status bookmark jika bukan di halaman saved
  useEffect(() => {
    if (!isSavedPage) {
      const checkBookmarkStatus = async () => {
        try {
          const res = await api.get('/api/bookmarks');
          const bookmarkedIds = res.data.map(bm => bm.job_post_id || bm.job_id);
          setIsBookmarked(bookmarkedIds.includes(job.id));
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
    
    // Jika di halaman saved, panggil onRemoveBookmark jika ada
    if (isSavedPage && onRemoveBookmark) {
      return onRemoveBookmark();
    }

    // Mode normal (tambah bookmark)
    setLoadingBookmark(true);
    try {
      if (isBookmarked) {
        // Hapus bookmark
        await api.delete('/api/bookmarks', { data: { job_post_id: job.id } });
        setIsBookmarked(false);
        alert('Dihapus dari bookmark');
      } else {
        // Tambah bookmark
        await api.post('/api/bookmarks', { job_post_id: job.id });
        setIsBookmarked(true);
        alert('Tersimpan di bookmark!');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal mengubah bookmark.');
    } finally {
      setLoadingBookmark(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-lg border border-white/40 shadow-glass rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center text-brand-600 font-bold text-xl shadow-inner">
            {job.company_name?.charAt(0) || 'C'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
              {job.title}
            </h3>
            <p className="text-slate-500 font-medium">{job.company_name || 'Tech Company Inc.'}</p>
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

      {matchScore && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-semibold text-slate-700">Skill Match</span>
            <span className="font-bold text-brand-600">{matchScore}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${matchScore}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full"
            />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <span className="text-slate-700 font-semibold">{job.salary_range}</span>
        <Link 
          to={`/jobs/${job.id}`} 
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-brand-600 transition-all font-medium shadow-md hover:shadow-brand-500/30"
        >
          View Details <ChevronRight size={18} />
        </Link>
      </div>
    </motion.div>
  );
};

export default JobCard;