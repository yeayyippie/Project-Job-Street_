import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetForm, setResetForm] = useState({
    email: '',
    otp: '',
    password: '',
    password_confirmation: '',
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const userRes = JSON.parse(localStorage.getItem('user_data'));
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: `Selamat datang kembali, ${userRes?.name || 'User'}`,
        timer: 1500,
        showConfirmButton: false,
        willClose: () => {
          if (userRes?.role === 'employer') {
            navigate('/employer/dashboard');
          } else {
            navigate('/');
          }
        }
      });
    } catch {
      setLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Email atau password salah. Silakan coba lagi.',
        confirmButtonColor: '#5D688A',
      });
    }
  };

  const resetMessages = {
    email: 'Masukkan email akun Anda untuk menerima OTP.',
    otp: 'Masukkan kode OTP 6 digit yang dikirim ke email Anda.',
    password: 'Buat password baru yang aman untuk akun Anda.',
  };

  const handleResetChange = (field, value) => {
    setResetForm(prev => ({ ...prev, [field]: value }));
  };

  const openResetModal = () => {
    setResetOpen(true);
    setResetStep('email');
    setResetForm(prev => ({ ...prev, email }));
  };

  const closeResetModal = () => {
    setResetOpen(false);
    setResetStep('email');
    setResetLoading(false);
    setResetForm({ email: '', otp: '', password: '', password_confirmation: '' });
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      if (resetStep === 'email') {
        await api.post('/api/forgot-password', { email: resetForm.email });
        setResetStep('otp');
        Swal.fire({
          icon: 'success',
          title: 'OTP terkirim',
          text: 'Cek email Anda. Kode berlaku selama 10 menit.',
          timer: 1800,
          showConfirmButton: false,
        });
      } else if (resetStep === 'otp') {
        await api.post('/api/verify-reset-otp', {
          email: resetForm.email,
          otp: resetForm.otp,
        });
        setResetStep('password');
      } else {
        await api.post('/api/reset-password', resetForm);
        await Swal.fire({
          icon: 'success',
          title: 'Password diperbarui',
          text: 'Silakan login dengan password baru Anda.',
          confirmButtonColor: '#5D688A',
        });
        closeResetModal();
        setPassword('');
      }
    } catch (err) {
      const firstError = Object.values(err.response?.data?.errors || {})?.[0]?.[0];
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || firstError || 'Terjadi kesalahan. Silakan coba lagi.',
        confirmButtonColor: '#5D688A',
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pastel-blob">
      <div className="soft-surface p-6 sm:p-10 rounded-3xl w-full max-w-md relative z-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang Kembali</h2>
        <p className="text-slate-500 mb-10">Masuk untuk mengelola karir atau bisnis Anda.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-brand-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-brand-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={openResetModal}
                className="text-sm font-bold text-brand-600 hover:text-brand-900"
              >
                Lupa Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-900 transition-all shadow-soft flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Masuk <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-brand-50 text-center text-slate-500 text-sm">
          Belum punya akun? <Link to="/register" className="text-brand-600 font-bold hover:underline">Daftar Sekarang</Link>
        </div>
      </div>

      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/40 backdrop-blur-sm px-4">
          <div className="soft-surface rounded-3xl w-full max-w-md p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Reset Password</h3>
                <p className="text-sm text-slate-500 mt-1">{resetMessages[resetStep]}</p>
              </div>
              <button onClick={closeResetModal} className="text-slate-400 hover:text-slate-700 text-2xl leading-none" type="button">
                &times;
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {['email', 'otp', 'password'].map((step, index) => (
                <div
                  key={step}
                  className={`h-2 rounded-full ${['email', 'otp', 'password'].indexOf(resetStep) >= index ? 'bg-brand-600' : 'bg-brand-50'}`}
                />
              ))}
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  disabled={resetStep !== 'email' || resetLoading}
                  value={resetForm.email}
                  onChange={(e) => handleResetChange('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-brand-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-70"
                  placeholder="email@domain.com"
                />
              </div>

              {(resetStep === 'otp' || resetStep === 'password') && (
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-3.5 text-slate-400" size={20} />
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={6}
                    disabled={resetStep === 'password' || resetLoading}
                    value={resetForm.otp}
                    onChange={(e) => handleResetChange('otp', e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-brand-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-70"
                    placeholder="6 digit OTP"
                  />
                </div>
              )}

              {resetStep === 'password' && (
                <>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      disabled={resetLoading}
                      value={resetForm.password}
                      onChange={(e) => handleResetChange('password', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-brand-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                      placeholder="Password baru"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      disabled={resetLoading}
                      value={resetForm.password_confirmation}
                      onChange={(e) => handleResetChange('password_confirmation', e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/80 border border-brand-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-500/20"
                      placeholder="Konfirmasi password baru"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3.5 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-900 transition-all shadow-soft flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {resetLoading && <Loader2 size={18} className="animate-spin" />}
                {resetStep === 'email' ? 'Kirim OTP' : resetStep === 'otp' ? 'Verifikasi OTP' : 'Simpan Password Baru'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
