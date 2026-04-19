import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building2, Mail, Lock, UserCircle } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'jobseeker' 
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/register', formData);
      alert('Registrasi Berhasil! Silahkan Login.');
      navigate('/login');
    } catch (err) {
      alert('Gagal registrasi: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center bg-gradient-to-br from-brand-50 to-accent-50 px-4">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-glass border border-white w-full max-w-md">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">Buat Akun</h2>
        <p className="text-slate-500 text-center mb-8">Pilih peranmu dan mulai perjalananmu</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection UI - Elegant Radio Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'jobseeker'})}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                formData.role === 'jobseeker' ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-slate-100 bg-white text-slate-400'
              }`}
            >
              <User size={24} />
              <span className="text-sm font-bold">Jobseeker</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, role: 'employer'})}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                formData.role === 'employer' ? 'border-accent-500 bg-accent-50 text-accent-600' : 'border-slate-100 bg-white text-slate-400'
              }`}
            >
              <Building2 size={24} />
              <span className="text-sm font-bold">Employer</span>
            </button>
          </div>

          <div className="relative">
            <UserCircle className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" placeholder="Nama Lengkap" required
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="email" placeholder="Email" required
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="password" placeholder="Password" required
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg hover:shadow-brand-500/25">
            Daftar Sekarang
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Sudah punya akun? <Link to="/login" className="text-brand-600 font-bold hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;