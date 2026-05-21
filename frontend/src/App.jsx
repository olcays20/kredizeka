/**
 * KrediZeka - Ana Uygulama Bileşeni (App.jsx)
 * =============================================
 * React Router DOM ile çok sayfalı SPA mimarisi.
 * Tüm sayfalar Navbar ve Footer arasında render edilir.
 *
 * Eklenenler:
 *   - i18n yapılandırması (TR/EN otomatik yüklenir)
 *   - AdminRoute: Sadece is_admin = true olan kullanıcılara açık rota
 *   - /admin rotası
 */

// i18n yapılandırmasını uygulama başlangıcında import et
// (import edildiği anda i18next initialize olur — tek seferlik)
import './i18n/config';

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ZekaBot from './components/ZekaBot';

// Performans Optimizasyonu: Code Splitting (Lazy Loading)
// Sayfalar sadece kullanıcı o sayfaya gittiğinde indirilir, ilk yükleme çok hızlı olur.
const RiskReportPage = lazy(() => import('./pages/RiskReportPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BireyselPage = lazy(() => import('./pages/BireyselPage'));
const TicariPage = lazy(() => import('./pages/TicariPage'));
const UrunlerPage = lazy(() => import('./pages/UrunlerPage'));
const HakkimizdaPage = lazy(() => import('./pages/HakkimizdaPage'));
const KariyerPage = lazy(() => import('./pages/KariyerPage'));
const BasinOdasiPage = lazy(() => import('./pages/BasinOdasiPage'));
const HaberlerPage = lazy(() => import('./pages/HaberlerPage'));
const IsBasvurusuPage = lazy(() => import('./pages/IsBasvurusuPage'));
const GizlilikPolitikasiPage = lazy(() => import('./pages/GizlilikPolitikasiPage'));
const KullanimKosullariPage = lazy(() => import('./pages/KullanimKosullariPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Her route değişiminde sayfayı en üste kaydırır
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Giriş yapmamış kullanıcıları /giris sayfasına yönlendirir
// (export edilmiştir — birim testlerinde izole olarak test edilir)
export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/giris" replace />;
  return children;
}

// Admin yetkisi olmayan kullanıcıları ana sayfaya yönlendirir
// is_admin = false ise erişimi engeller
// (export edilmiştir — birim testlerinde izole olarak test edilir)
export function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/giris" replace />;
  if (!user.is_admin) return <Navigate to="/" replace />;
  return children;
}

// Lazy load olurken gösterilecek şık yükleniyor bileşeni
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <svg className="animate-spin w-10 h-10 text-primary-500" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className="text-sm font-medium text-slate-500 animate-pulse">Sayfa yükleniyor...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="top-right" />
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={<RiskReportPage />} />
                <Route path="/kayit" element={<RegisterPage />} />
                <Route path="/giris" element={<LoginPage />} />
                <Route path="/profil" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/bireysel" element={<BireyselPage />} />
                <Route path="/ticari" element={<TicariPage />} />
                <Route path="/urunler" element={<UrunlerPage />} />
                <Route path="/hakkimizda" element={<HakkimizdaPage />} />
                <Route path="/kariyer" element={<KariyerPage />} />
                <Route path="/is-basvurusu" element={<IsBasvurusuPage />} />
                <Route path="/basin-odasi" element={<BasinOdasiPage />} />
                <Route path="/haberler" element={<HaberlerPage />} />
                <Route path="/gizlilik-politikasi" element={<GizlilikPolitikasiPage />} />
                <Route path="/kullanim-kosullari" element={<KullanimKosullariPage />} />
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPage />
                  </AdminRoute>
                } />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            {/* ZekaBot — tüm sayfalarda sağ altta görünen yapay zeka asistanı */}
            <ZekaBot />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
