/**
 * KrediZeka - Ana Uygulama Bileşeni (App.jsx)
 * =============================================
 * React Router DOM ile çok sayfalı SPA mimarisi.
 * Tüm sayfalar Navbar ve Footer arasında render edilir.
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Performans Optimizasyonu: Code Splitting (Lazy Loading)
// Sayfalar sadece kullanıcı o sayfaya gittiğinde indirilir, ilk yükleme çok hızlı olur.
const RiskReportPage = lazy(() => import('./pages/RiskReportPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BireyselPage = lazy(() => import('./pages/BireyselPage'));
const TicariPage = lazy(() => import('./pages/TicariPage'));
const UrunlerPage = lazy(() => import('./pages/UrunlerPage'));

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
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<RiskReportPage />} />
                <Route path="/kayit" element={<RegisterPage />} />
                <Route path="/giris" element={<LoginPage />} />
                <Route path="/profil" element={<ProfilePage />} />
                <Route path="/bireysel" element={<BireyselPage />} />
                <Route path="/ticari" element={<TicariPage />} />
                <Route path="/urunler" element={<UrunlerPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
