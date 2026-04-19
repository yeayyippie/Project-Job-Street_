import React, { useState, useEffect } from 'react';
import { BookmarkMinus } from 'lucide-react';
import JobCard from '../../components/jobs/JobCard';
import api from '../../services/api';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await api.get('/api/bookmarks');
        const bookmarkData = res.data.data || res.data;
        if (Array.isArray(bookmarkData)) {
          setBookmarks(bookmarkData);
        }
      } catch (err) {
        console.error("Gagal memuat bookmarks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  // FUNGSI BARU: Untuk menghapus bookmark berdasarkan ID Bookmark-nya
  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await api.delete(`/api/bookmarks/${bookmarkId}`);
      // Hapus langsung dari UI tanpa perlu refresh halaman
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId)); 
      alert('Bookmark berhasil dihapus!');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus bookmark.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Lowongan Tersimpan</h1>
          <p className="text-slate-500">Daftar pekerjaan yang telah Anda tandai (Bookmark).</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Memuat data...</div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map((item) => (
              <JobCard 
                key={item.id} 
                job={item.job_post || item} 
                matchScore={null}
                // TAMBAHAN BARU: Kirim fungsi hapus ke JobCard
                onRemoveBookmark={() => handleRemoveBookmark(item.id)} 
                isSavedPage={true} // Penanda bahwa ini ada di halaman Bookmark
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <BookmarkMinus size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Belum ada lowongan tersimpan</h3>
            <p className="text-slate-500">Anda dapat menyimpan lowongan dari halaman utama untuk dilihat nanti.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;