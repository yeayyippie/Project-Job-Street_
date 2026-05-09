/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Filter, Briefcase, X, Loader2 } from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce'; // Akan kita buat hook-nya
import Swal from 'sweetalert2';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    perPage: 10
  });

  // State untuk filter
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    job_type: '',
    category: ''
  });

  // Debounce keyword search untuk mengurangi API calls
  const debouncedKeyword = useDebounce(filters.keyword, 500);
  const debouncedLocation = useDebounce(filters.location, 500);

  const hasActiveFilters = useCallback(() => (
    filters.keyword.trim() || filters.location.trim() || filters.job_type || filters.category
  ), [filters]);

  const fetchJobs = useCallback(async (page = 1, showFeedback = false) => {
    setIsSearching(true);
    setError(null);
    
    try {
      // Filter out empty values
      const activeFilters = {};
      if (filters.keyword.trim()) activeFilters.search = filters.keyword.trim();
      if (filters.location.trim()) activeFilters.location = filters.location.trim();
      if (filters.job_type) activeFilters.job_type = filters.job_type;
      if (filters.category) activeFilters.category = filters.category;
      
      // Tambahkan pagination
      const params = new URLSearchParams({
        ...activeFilters,
        page: page,
        per_page: pagination.perPage
      }).toString();
      
      const response = await api.get(`/api/jobs?${params}`);
      
      // Handle response sesuai struktur backend Anda
      const responseData = response.data;
      
      if (responseData.data) {
        setJobs(responseData.data);
        setPagination({
          currentPage: responseData.current_page || page,
          totalPages: responseData.last_page || 1,
          totalJobs: responseData.total || 0,
          perPage: responseData.per_page || pagination.perPage
        });
        if (showFeedback) {
          Swal.fire({
            icon: responseData.total > 0 ? 'success' : 'info',
            title: responseData.total > 0 ? 'Pencarian berhasil' : 'Lowongan tidak ditemukan',
            text: responseData.total > 0
              ? `${responseData.total} lowongan sesuai pencarian Anda.`
              : 'Coba gunakan kata kunci, lokasi, atau kategori lain.',
            timer: 1800,
            showConfirmButton: false,
          });
        }
      } else {
        setJobs(Array.isArray(responseData) ? responseData : []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs', error);
      setError('Gagal memuat data lowongan. Silakan coba lagi.');
      setJobs([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [filters, pagination.perPage]);

  // Auto-search ketika debounced keyword/location berubah
  useEffect(() => {
    if (!isLoading) {
      fetchJobs(1); // Reset ke halaman 1 saat search
    }
  }, [debouncedKeyword, debouncedLocation, filters.job_type, filters.category]);

  // Initial fetch
  useEffect(() => {
    fetchJobs(1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!hasActiveFilters()) {
      Swal.fire({
        icon: 'warning',
        title: 'Input pencarian masih kosong',
        text: 'Masukkan nama pekerjaan, perusahaan, lokasi, atau kategori terlebih dahulu.',
        confirmButtonColor: '#5D688A',
      });
      return;
    }
    fetchJobs(1, true); // Manual search reset ke halaman 1
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      job_type: '',
      category: ''
    });
    // Fetch akan otomatis trigger karena useEffect
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchJobs(newPage);
      // Scroll ke atas setelah ganti halaman
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Opsi untuk filter tambahan (jika ada dari backend)
  const jobTypes = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
  const categories = ['IT & Software', 'Marketing', 'Sales', 'Finance', 'Design', 'Customer Service'];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans pastel-blob">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Temukan Pekerjaan <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">Impian Anda</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Peluang yang tepat bisa membuka langkah besar—temukan pekerjaan yang sesuai dengan keahlian Anda dan mulai dari sini.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearch} className="soft-surface p-3 rounded-3xl mb-6 flex flex-col md:flex-row gap-3 relative z-10">
          <div className="flex-1 flex items-center bg-white/75 rounded-2xl px-4 py-3 border border-brand-50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
            <Search className="text-slate-400 mr-3 flex-shrink-0" size={20} />
            <input 
              type="text" 
              placeholder="Nama pekerjaan, perusahaan, kategori..." 
              className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
            />
            {filters.keyword && (
              <button
                type="button"
                onClick={() => handleFilterChange('keyword', '')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="md:w-1/3 flex items-center bg-white/75 rounded-2xl px-4 py-3 border border-brand-50 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
            <MapPin className="text-slate-400 mr-3 flex-shrink-0" size={20} />
            <input 
              type="text" 
              placeholder="Lokasi kerja..." 
              className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
            {filters.location && (
              <button
                type="button"
                onClick={() => handleFilterChange('location', '')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            type="submit" 
            disabled={isSearching}
            className="bg-brand-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-brand-900 transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Filter size={18} />
            )}
            Search
          </button>
        </form>

        {/* Filter Tambahan (Job Type & Category) */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={filters.job_type}
            onChange={(e) => handleFilterChange('job_type', e.target.value)}
            className="px-4 py-2 bg-white/90 border border-brand-50 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Job Types</option>
            {jobTypes.map(type => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 bg-white/90 border border-brand-50 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {(filters.job_type || filters.category || filters.keyword || filters.location) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <X size={16} /> Reset Filters
            </button>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-slate-500">
            {!isLoading && !isSearching && (
              <>Menampilkan {jobs.length} dari {pagination.totalJobs} lowongan</>
            )}
          </p>
        </div>

        {/* Job Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading || isSearching ? (
            // Skeleton Loading State yang lebih baik
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                    <div className="h-10 bg-slate-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error State
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-400 mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Error Memuat Data</h3>
              <p className="text-slate-500 mb-4">{error}</p>
              <button
                onClick={() => fetchJobs(1)}
                className="px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
              />
            ))
          ) : (
            // Empty State dengan saran
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak ada lowongan ditemukan</h3>
              <p className="text-slate-500 mb-4">
                Coba ubah filter atau kata kunci pencarian Anda.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 text-brand-600 font-medium hover:text-brand-700"
              >
                Reset semua filter
              </button>
            </div>
          )}
        </div>

        {/* Pagination Component */}
        {!isLoading && !isSearching && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl transition-colors ${
                      pagination.currentPage === pageNum
                        ? 'bg-brand-600 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
