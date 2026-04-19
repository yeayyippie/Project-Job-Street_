import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, XCircle, User } from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const backendUrl = 'http://localhost:8000'; // Sesuaikan dengan URL backend Anda

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="bg-brand-600 text-white p-2 rounded-xl">
                <Briefcase size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Job<span className="text-brand-600">Portal</span>
              </span>
            </NavLink>

            <div className="flex gap-6 items-center">
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
                      {/* Garis vertikal di antara menu */}
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
                      {/* Garis vertikal */}
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
                      {/* Garis vertikal */}
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

                  {/* Area user info dengan foto profil */}
                  <div className="flex items-center gap-4 border-l pl-6 border-slate-200 ml-6">
                    {/* Foto Profil / Avatar */}
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

                    {/* Info Nama & Role */}
                    <div className="text-right hidden sm:block">
                      <div className="font-bold text-slate-900 text-sm">{user?.name || 'User'}</div>
                      <div className="text-xs text-slate-500 capitalize">{user?.role || 'Jobseeker'}</div>
                    </div>

                    {/* Tombol Logout */}
                    <button
                      onClick={logout}
                      className="flex items-center gap-1.5 px-4 py-2 border rounded-xl font-bold text-slate-600 hover:text-red-500 hover:border-red-200 transition-colors"
                    >
                      <XCircle size={18} /> Logout
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
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-all shadow-lg"
                  >
                    Get Started
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;