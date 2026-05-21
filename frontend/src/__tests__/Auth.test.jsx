/**
 * KrediZeka - Kimlik Doğrulama / Auth Guard Birim Testleri
 * ==========================================================
 * Koruyucu Rota (Protected Route) mekanizmasının, yetkisiz erişimi
 * doğru şekilde engellediğini kanıtlayan testler.
 *
 * Test edilen davranışlar:
 *   1. ProtectedRoute — Giriş yapmamış kullanıcı korumalı bir sayfaya
 *      erişmeye çalıştığında /giris sayfasına yönlendirilir.
 *   2. ProtectedRoute — Giriş yapmış kullanıcı korumalı sayfaya erişebilir.
 *   3. AdminRoute — Admin olmayan kullanıcı /admin'den ana sayfaya yönlenir.
 *   4. AdminRoute — Admin kullanıcı yönetici paneline erişebilir.
 *
 * Test Stratejisi:
 *   MemoryRouter kullanılarak başlangıç rotası (initialEntries) kontrol
 *   edilir. Böylece kullanıcının doğrudan korumalı bir URL'e gitmesi
 *   senaryosu güvenli biçimde simüle edilir. Yönlendirme gerçekleşince
 *   hedef sayfanın içeriği DOM'da aranır.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute, AdminRoute } from '../App';

// localStorage'da oturum bilgisinin saklandığı anahtar
const AUTH_KEY = 'kredizeka_user';

/**
 * Korumalı bir rota yapısını MemoryRouter ile render eder.
 *
 * @param {string} initialPath - Tarayıcının başlangıçta gideceği yol
 * @param {React.Component} Guard - ProtectedRoute veya AdminRoute
 */
function renderWithGuard(initialPath, Guard) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          {/* Korumalı sayfa — yalnızca yetkili kullanıcı görebilmeli */}
          <Route
            path="/profil"
            element={
              <Guard>
                <div>KORUMALI PROFİL İÇERİĞİ</div>
              </Guard>
            }
          />
          <Route
            path="/admin"
            element={
              <Guard>
                <div>YÖNETİCİ PANELİ İÇERİĞİ</div>
              </Guard>
            }
          />
          {/* Yönlendirme hedefleri — guard devreye girince bunlar görünür */}
          <Route path="/giris" element={<div>GİRİŞ SAYFASI</div>} />
          <Route path="/" element={<div>ANA SAYFA</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

/** localStorage'a normal (admin olmayan) bir kullanıcı yerleştirir. */
function setNormalUser() {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    tc_no: '12345678901',
    full_name: 'Normal Kullanıcı',
    phone: '05551234567',
    is_admin: false,
  }));
}

/** localStorage'a yönetici (admin) bir kullanıcı yerleştirir. */
function setAdminUser() {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    tc_no: '11111111111',
    full_name: 'Yönetici',
    phone: '05550000000',
    is_admin: true,
  }));
}


describe('Auth Guard — ProtectedRoute (Korumalı Rota)', () => {

  // Her test öncesi localStorage temizlenir → temiz oturum durumu
  beforeEach(() => {
    localStorage.clear();
  });

  it('giriş YAPMAMIŞ kullanıcı korumalı sayfadan /giris e yönlendirilmeli', () => {
    // localStorage boş → kullanıcı giriş yapmamış
    renderWithGuard('/profil', ProtectedRoute);

    // Auth guard devreye girer → kullanıcı /giris sayfasına yönlenir
    expect(screen.getByText('GİRİŞ SAYFASI')).toBeInTheDocument();

    // Korumalı içerik KESİNLİKLE ekrana gelmemeli (güvenlik ihlali olurdu)
    expect(screen.queryByText('KORUMALI PROFİL İÇERİĞİ')).not.toBeInTheDocument();
  });

  it('giriş YAPMIŞ kullanıcı korumalı sayfaya erişebilmeli', () => {
    // Önce geçerli bir oturum kur
    setNormalUser();
    renderWithGuard('/profil', ProtectedRoute);

    // Kullanıcı yetkili → korumalı içerik görünmeli
    expect(screen.getByText('KORUMALI PROFİL İÇERİĞİ')).toBeInTheDocument();

    // Yönlendirme OLMAMALI → giriş sayfası görünmemeli
    expect(screen.queryByText('GİRİŞ SAYFASI')).not.toBeInTheDocument();
  });
});


describe('Auth Guard — AdminRoute (Yönetici Rotası / RBAC)', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it('giriş YAPMAMIŞ kullanıcı /admin den /giris e yönlendirilmeli', () => {
    // Oturum yok → admin paneline erişim engellenmeli
    renderWithGuard('/admin', AdminRoute);
    expect(screen.getByText('GİRİŞ SAYFASI')).toBeInTheDocument();
    expect(screen.queryByText('YÖNETİCİ PANELİ İÇERİĞİ')).not.toBeInTheDocument();
  });

  it('NORMAL kullanıcı /admin den ana sayfaya yönlendirilmeli', () => {
    // Kullanıcı giriş yapmış ama is_admin = false
    setNormalUser();
    renderWithGuard('/admin', AdminRoute);

    // Yetki yetersiz → ana sayfaya yönlenir
    expect(screen.getByText('ANA SAYFA')).toBeInTheDocument();

    // Yönetici paneli içeriği GÖRÜNMEMELİ
    expect(screen.queryByText('YÖNETİCİ PANELİ İÇERİĞİ')).not.toBeInTheDocument();
  });

  it('ADMIN kullanıcı yönetici paneline erişebilmeli', () => {
    // Kullanıcı hem giriş yapmış hem is_admin = true
    setAdminUser();
    renderWithGuard('/admin', AdminRoute);

    // Tam yetkili → yönetici paneli içeriği görünmeli
    expect(screen.getByText('YÖNETİCİ PANELİ İÇERİĞİ')).toBeInTheDocument();
  });
});
