import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, Briefcase } from 'lucide-react';
import JobCard from '../components/jobs/JobCard';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk filter
  const [filters, setFilters] = useState({
    keyword: '',
    location: '',
    job_type: '',
    category: ''
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      // Mengirimkan query parameter ke endpoint GET /api/jobs
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/api/jobs?${params}`);
      
      // Asumsi backend mereturn struktur: { data: [...] }
      setJobs(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch saat komponen dimount
    fetchJobs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Temukan Pekerjaan <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">Impian Anda</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Sistem cerdas kami akan mencocokkan keahlian Anda dengan peluang terbaik di perusahaan terkemuka.
          </p>
        </div>

        {/* Search & Filter Bar (Glassmorphism) */}
        <form onSubmit={handleSearch} className="bg-white/80 backdrop-blur-xl border border-white p-3 rounded-3xl shadow-glass mb-12 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
            <Search className="text-slate-400 mr-3" size={20} />
            <input 
              type="text" 
              placeholder="Job title, keyword, or company..." 
              className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400"
              value={filters.keyword}
              onChange={(e) => setFilters({...filters, keyword: e.target.value})}
            />
          </div>
          <div className="md:w-1/3 flex items-center bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
            <MapPin className="text-slate-400 mr-3" size={20} />
            <input 
              type="text" 
              placeholder="City, state, or remote..." 
              className="bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-brand-600 transition-colors shadow-lg hover:shadow-brand-500/30 flex items-center justify-center gap-2"
          >
            <Filter size={18} /> Search
          </button>
        </form>

        {/* Job Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            // Skeleton Loading State
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200/50 animate-pulse rounded-2xl"></div>
            ))
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                // Simulasi memanggil match score logic dari backend
                matchScore={job.match_score || Math.floor(Math.random() * (95 - 60 + 1) + 60)} 
              />
            ))
          ) : (
            // Empty State
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-100">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
                <Briefcase size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak ada lowongan ditemukan</h3>
              <p className="text-slate-500">Coba ubah filter atau kata kunci pencarian Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;