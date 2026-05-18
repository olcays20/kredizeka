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
 * - Admin kullanıcı için "Yönetici Paneli" linki
 * - TR / EN dil değiştirici (react-i18next)
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
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
  Package,
  Globe,
  LayoutDashboard,
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // i18n hook'u: t() çeviri fonksiyonu, i18n nesnesi dil değiştirme için
  const { t, i18n } = useTranslation();
  // Tema hook'u: dark/light arası geçiş için
  const { theme, toggleTheme } = useTheme();

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
   * Dil değiştirme fonksiyonu (TR ↔ EN toggle).
   * i18n.changeLanguage çağrısı dahili olarak:
   *  1. State'i günceller → tüm bileşenler yeniden render olur
   *  2. localStorage'a kaydeder → sayfa yenilenince seçim hatırlanır
   */
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'tr' ? 'en' : 'tr';
    i18n.changeLanguage(nextLang);
  };

  /**
   * Aktif sayfa kontrolü
   */
  const isActive = (path) => location.pathname === path;

  // Navigasyon bağlantıları listesi (çeviriden çekilir)
  const navLinks = [
    { path: '/', label: t('navbar.risk_analysis'), icon: BarChart3 },
    { path: '/bireysel', label: t('navbar.individual'), icon: User },
    { path: '/ticari', label: t('navbar.commercial'), icon: Building2 },
    { path: '/urunler', label: t('navbar.products'), icon: Package },
  ];

  // Mevcut dilin kısa kodu (TR / EN — UI'da gösterilir)
  const currentLangCode = (i18n.language || 'tr').toUpperCase().slice(0, 2);
  const nextLangCode = currentLangCode === 'TR' ? 'EN' : 'TR';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-black/30 border-b border-slate-100 dark:border-slate-800'
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
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 transition-colors duration-300">
                Kredi<span className="gradient-text">Zeka</span>
              </h1>
              <p className={`text-[10px] font-medium tracking-widest uppercase transition-colors duration-300 ${
                scrolled ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {t('navbar.brand_tagline')}
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
                    ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            {/* Admin kullanıcı için ekstra link */}
            {user?.is_admin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive('/admin')
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('navbar.admin_panel')}
              </Link>
            )}
          </div>

          {/* ─── Sağ Taraf: Tema + Dil + Oturum Butonları ─── */}
          <div className="hidden lg:flex items-center gap-2">

            {/* Tema Değiştirici (Sun/Moon) — Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              aria-label={`Theme: ${theme === 'dark' ? 'light' : 'dark'}`}
              className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 transition-all duration-300"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Dil Değiştirici (TR/EN) */}
            <button
              onClick={toggleLanguage}
              title={t('navbar.language')}
              aria-label={`${t('navbar.language')}: ${nextLangCode}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 transition-all duration-300"
            >
              <Globe className="w-4 h-4" />
              <span>{currentLangCode}</span>
            </button>

            {user ? (
              <>
                {/* Oturum açıksa: Profil ve Çıkış butonları */}
                <Link
                  to="/profil"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive('/profil')
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center overflow-hidden">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-xs font-bold">
                        {user.full_name?.charAt(0)?.toUpperCase() || 'K'}
                      </span>
                    )}
                  </div>
                  <span className="max-w-[120px] truncate">{user.full_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                {/* Oturum kapalıysa: Giriş ve Kayıt butonları */}
                <Link
                  to="/giris"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/kayit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <UserPlus className="w-4 h-4" />
                  {t('navbar.register')}
                </Link>
              </>
            )}
          </div>

          {/* ─── Mobil Sağ Köşe: Tema + Dil + Hamburger ─── */}
          <div className="lg:hidden flex items-center gap-1">
            {/* Mobilde tema değiştirici */}
            <button
              onClick={toggleTheme}
              aria-label={`Theme: ${theme === 'dark' ? 'light' : 'dark'}`}
              className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {/* Mobilde dil değiştirici */}
            <button
              onClick={toggleLanguage}
              aria-label={`${t('navbar.language')}: ${nextLangCode}`}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              <Globe className="w-4 h-4" />
              <span>{currentLangCode}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobil Menü (Açılır Panel) ─── */}
      <div
        className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 shadow-xl px-4 py-4 space-y-1">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActive(path)
                  ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}

          {/* Mobil: Admin Linki */}
          {user?.is_admin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                isActive('/admin')
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              {t('navbar.admin_panel')}
            </Link>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/profil"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  {t('navbar.profile')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-300 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/giris"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all duration-300"
                >
                  <LogIn className="w-5 h-5" />
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/kayit"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 transition-all duration-300"
                >
                  <UserPlus className="w-5 h-5" />
                  {t('navbar.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
