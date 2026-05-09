import React from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Briefcase,
  ExternalLink,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  Target,
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const showInfo = (title, text) => {
    Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#5D688A',
    });
  };

  return (
    <footer className="bg-white/85 backdrop-blur-xl border-t border-brand-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-brand-600 text-white p-2 rounded-2xl shadow-soft">
                <Briefcase size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Ruang<span className="text-brand-600">Karier</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Temukan pekerjaan impian Anda dengan mudah. Kami menghubungkan talenta terbaik dengan perusahaan terkemuka di Indonesia.
            </p>

            <div className="flex gap-3 pt-2">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 bg-brand-50 hover:bg-[#1877f2] text-slate-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                <FaFacebookF size={15} />
              </a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X" className="w-9 h-9 bg-brand-50 hover:bg-slate-900 text-slate-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                <FaTwitter size={16} />
              </a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 bg-brand-50 hover:bg-[#0077b5] text-slate-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                <FaLinkedinIn size={16} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Layanan Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Target size={16} className="text-brand-600" />
                <Link to="/" className="text-slate-500 hover:text-brand-600 transition-colors text-sm">
                  Cari Lowongan Kerja
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Award size={16} className="text-brand-600" />
                <a href="https://ranking.fortuneidn.com/fortune-indonesia-100" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-brand-600 transition-colors text-sm inline-flex items-center gap-1">
                  Perusahaan Terkemuka
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Shield size={16} className="text-brand-600" />
                <a href="https://www.topkarir.com/article/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-brand-600 transition-colors text-sm inline-flex items-center gap-1">
                  Tips Karir
                  <ExternalLink size={12} className="opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-lg">Hubungi Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-500">
                <MapPin size={18} className="text-brand-600 flex-shrink-0" />
                <span className="text-sm">Bandung, Indonesia</span>
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <Mail size={18} className="text-brand-600 flex-shrink-0" />
                <a href="mailto:info@ruangkarier.local" className="text-sm hover:text-brand-600 transition-colors">
                  info@ruangkarier.local
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <Phone size={18} className="text-brand-600 flex-shrink-0" />
                <a href="tel:+6283141221444" className="text-sm hover:text-brand-600 transition-colors">
                  Nurul Hidayah: +62 831 4122 1444
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <Phone size={18} className="text-brand-600 flex-shrink-0" />
                <a href="tel:+6289876543210" className="text-sm hover:text-brand-600 transition-colors">
                  Naya: +62 898 7654 3210
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <FaInstagram size={18} className="text-brand-600 flex-shrink-0" />
                <a href="https://www.instagram.com/0731n.u/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-brand-600 transition-colors">
                  @0731n.u
                </a>
              </li>
              <li className="flex items-center gap-3 text-slate-500">
                <FaInstagram size={18} className="text-brand-600 flex-shrink-0" />
                <a href="https://www.instagram.com/akun_temen/" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-brand-600 transition-colors">
                  @akun_temen
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-50 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600">10K+</div>
              <div className="text-sm text-slate-500 mt-1">Lowongan Tersedia</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600">5K+</div>
              <div className="text-sm text-slate-500 mt-1">Perusahaan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600">50K+</div>
              <div className="text-sm text-slate-500 mt-1">Pencari Kerja</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-600">95%</div>
              <div className="text-sm text-slate-500 mt-1">Kepuasan</div>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-50 pt-8">
          <div className="flex flex-col justify-center items-center gap-4">
            <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
              Made with <Heart size={14} className="text-accent-600 fill-accent-600" /> for your career
            </p>
            <div className="flex gap-6 text-sm flex-wrap justify-center">
              <button type="button" onClick={() => showInfo('Kebijakan Privasi', 'Data pengguna digunakan hanya untuk kebutuhan akun, lamaran, dan komunikasi rekrutmen di RuangKarier.')} className="text-slate-500 hover:text-brand-600">
                Kebijakan Privasi
              </button>
              <button type="button" onClick={() => showInfo('Syarat & Ketentuan', 'Gunakan platform dengan data yang benar. Employer bertanggung jawab atas informasi lowongan dan proses rekrutmen yang dipublikasikan.')} className="text-slate-500 hover:text-brand-600">
                Syarat & Ketentuan
              </button>
              <button type="button" onClick={() => showInfo('Kebijakan Cookie', 'Aplikasi menggunakan penyimpanan browser untuk menjaga sesi login dan preferensi dasar pengguna.')} className="text-slate-500 hover:text-brand-600">
                Kebijakan Cookie
              </button>
            </div>
            <p className="text-sm text-slate-500">&copy; {currentYear} RuangKarier.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
