import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, XCircle, User, Loader2, Home } from 'lucide-react';
import Swal from 'sweetalert2';
import Footer from '../components/Footer';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const backendUrl = 'http://localhost:8000';

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Anda akan keluar dari akun ini.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, logout',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setIsLoggingOut(true);
    try {
      await logout();
      await Swal.fire({
        title: 'Berhasil logout!',
        text: 'Anda telah keluar dari aplikasi.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      Swal.fire({
        title: 'Gagal logout',
        text: 'Terjadi kesalahan, silakan coba lagi.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-xl border-b border-white/70 shadow-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between min-h-16 items-center gap-3 py-3">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <NavLink to="/" className="flex items-center gap-2">
                <div className="bg-brand-600 text-white p-2 rounded-2xl shadow-soft">
                  <Briefcase size={20} />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  Ruang<span className="text-brand-600">Karier</span>
                </span>
              </NavLink>

              {/* Tombol Home */}
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-brand-600'
                  }`
                }
              >
                <Home size={18} />
                <span className="hidden sm:inline">Home</span>
              </NavLink>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-5 items-center justify-end">
              {user ? (
                <>
                  {user.role === 'employer' ? (
                    <>
                      <NavLink
                        to="/employer/dashboard"
                        className={({ isActive }) =>
                          `text-sm font-bold transition-colors ${
                            isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
                          }`
                        }
                      >
                        Dashboard Employer
                      </NavLink>
                      <div className="hidden sm:block h-6 w-px bg-slate-200"></div>
                      <NavLink
                        to="/employer/profile"
                        className={({ isActive }) =>
                          `text-sm font-bold transition-colors ${
                            isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
                          }`
                        }
                      >
                        Profil Perusahaan
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/jobseeker/profile"
                        className={({ isActive }) =>
                          `text-sm font-bold transition-colors ${
                            isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
                          }`
                        }
                      >
                        Profil Saya
                      </NavLink>
                      <div className="hidden sm:block h-6 w-px bg-slate-200"></div>
                      <NavLink
                        to="/my-applications"
                        className={({ isActive }) =>
                          `text-sm font-bold transition-colors ${
                            isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
                          }`
                        }
                      >
                        Lamaran Saya
                      </NavLink>
                      <div className="hidden sm:block h-6 w-px bg-slate-200"></div>
                      <NavLink
                        to="/bookmarks"
                        className={({ isActive }) =>
                          `text-sm font-bold transition-colors ${
                            isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
                          }`
                        }
                      >
                        Saved
                      </NavLink>
                    </>
                  )}

                  <div className="flex items-center gap-3 sm:gap-4 border-l pl-3 sm:pl-6 border-brand-50 sm:ml-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner flex items-center justify-center">
                      {user?.photo ? (
                        <img
                          src={
                            user.photo.startsWith('http')
                              ? user.photo
                              : `${backendUrl}/storage/${user.photo}`
                          }
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-slate-400" />
                      )}
                    </div>

                    <div className="text-right hidden sm:block">
                      <div className="font-bold text-slate-900 text-sm">{user?.name || 'User'}</div>
                      <div className="text-xs text-slate-500 capitalize">{user?.role || 'Jobseeker'}</div>
                    </div>

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border rounded-xl font-bold text-slate-600 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Logging out...</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={18} />
                          <span>Logout</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `text-sm font-bold transition-colors ${
                        isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
                      }`
                    }
                  >
                    Sign In
                  </NavLink>
                  <div className="hidden sm:block h-6 w-px bg-slate-200"></div>
                  <NavLink
                    to="/register"
                    className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-900 transition-all shadow-soft"
                  >
                    Get Started
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - dengan padding-top agar tidak tertutup navbar fixed */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default MainLayout;
