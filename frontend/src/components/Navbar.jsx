/**
 * KrediZeka - Kurumsal Navigasyon Çubuğu (Navbar)
 * ==================================================
 * Üst kısımda sabit duran, oturum durumuna göre menü öğeleri değişen
 * kurumsal bir navigasyon çubuğu bileşeni.
 * 
 * Özellikler:
 * - Sayfa kaydırıldığında arka plan değişir (scroll efekti)
 * - Mobil hamburger menü desteği
 * - Oturum açıksa: Profil ve Çıkış Yap butonları
 * - Oturum kapalıysa: Giriş Yap ve Kayıt Ol butonları
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Shield,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  BarChart3,
  Building2,
  Package
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sayfa scroll durumu (navbar arka plan değişimi için)
  const [scrolled, setScrolled] = useState(false);
  // Mobil menü açık/kapalı durumu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sayfa kaydırma olayını dinle
  // Kullanıcı 20px'den fazla kaydırdığında navbar arka planı değişir
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    // Temizlik (cleanup): Bileşen kaldırıldığında event listener'ı temizle
    // Bu, bellek sızıntısını (memory leak) önler
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sayfa değiştiğinde mobil menüyü kapat
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /**
   * Çıkış yapma işlemi
   * Context'teki logout fonksiyonunu çağırır ve ana sayfaya yönlendirir
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /**
   * Aktif sayfa kontrolü
   * Mevcut URL path'i ile karşılaştırır, eşleşen bağlantıyı vurgular
   */
  const isActive = (path) => location.pathname === path;

  // Navigasyon bağlantıları listesi
  const navLinks = [
    { path: '/', label: 'Risk Analizi', icon: BarChart3 },
    { path: '/bireysel', label: 'Bireysel', icon: User },
    { path: '/ticari', label: 'Ticari', icon: Building2 },
    { path: '/urunler', label: 'Ürünler', icon: Package },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* ─── Logo ve Marka ─── */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
              scrolled
                ? 'bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-500/30'
                : 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/40'
            }`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-extrabold tracking-tight transition-colors duration-300 ${
                scrolled ? 'text-slate-900' : 'text-slate-900'
              }`}>
                Kredi<span className="gradient-text">Zeka</span>
              </h1>
              <p className={`text-[10px] font-medium tracking-widest uppercase transition-colors duration-300 ${
                scrolled ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Finansal Asistan
              </p>
            </div>
          </Link>

          {/* ─── Desktop Navigasyon ─── */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(path)
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* ─── Sağ Taraf: Oturum Butonları ─── */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {/* Oturum açıksa: Profil ve Çıkış butonları */}
                <Link
                  to="/profil"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive('/profil')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.full_name?.charAt(0)?.toUpperCase() || 'K'}
                    </span>
                  </div>
                  <span className="max-w-[120px] truncate">{user.full_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                {/* Oturum kapalıysa: Giriş ve Kayıt butonları */}
                <Link
                  to="/giris"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* ─── Mobil Menü Butonu ─── */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ─── Mobil Menü (Açılır Panel) ─── */}
      <div
        className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl px-4 py-4 space-y-1">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive(path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
          
          <div className="border-t border-slate-100 pt-3 mt-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/profil"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  Profilim
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-300 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/giris"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all duration-300"
                >
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 transition-all duration-300"
                >
                  <UserPlus className="w-5 h-5" />
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
