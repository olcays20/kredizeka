/**
 * KrediZeka - RiskReportPage Birim Testleri
 * ===========================================
 * Ana risk analizi sayfasının (RiskReportPage) doğru render edildiğini
 * ve form validasyonlarının çalıştığını kanıtlayan testler.
 *
 * Test edilen davranışlar:
 *   1. Sayfanın çökmeden render edilmesi
 *   2. Giriş yapmamış kullanıcıya "Üyelere Özel" çağrı kartının gösterilmesi
 *   3. Giriş yapmamış kullanıcıya finansal formun GÖSTERİLMEMESİ
 *   4. Giriş yapmış kullanıcıya adımlı (stepper) formun gösterilmesi
 *   5. Sayısal form alanlarının Regex validasyonu — harf girişinin engellenmesi
 *
 * Test Stratejisi:
 *   RiskReportPage; AuthContext, ThemeContext, Router ve i18n'e bağımlıdır.
 *   Bu yüzden gerçek sağlayıcılarla (provider) sarmalanarak render edilir —
 *   böylece testler, kullanıcının gördüğü gerçek davranışı doğrular.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// i18n yapılandırmasını import etmek, çeviri sistemini başlatır (t() gerçek
// metinleri döndürür). i18n nesnesi, test dilini sabitlemek için kullanılır.
import i18n from '../i18n/config';

import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import RiskReportPage from '../pages/RiskReportPage';

// localStorage'da oturum bilgisinin saklandığı anahtar
const AUTH_KEY = 'kredizeka_user';

/**
 * RiskReportPage'i, ihtiyaç duyduğu tüm sağlayıcılarla (provider)
 * sarmalayarak render eden yardımcı fonksiyon.
 */
function renderRiskPage() {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <RiskReportPage />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

/**
 * localStorage'a sahte (mock) bir giriş yapmış kullanıcı yerleştirir.
 * AuthProvider, ilk render'da bu anahtarı okuyarak oturumu kurar.
 */
function setLoggedInUser() {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    tc_no: '12345678901',
    full_name: 'Test Kullanıcı',
    phone: '05551234567',
    is_admin: false,
  }));
}


describe('RiskReportPage — Render Testleri', () => {

  // Her testten önce localStorage'ı temizle ve test dilini Türkçe'ye sabitle.
  // (Test ortamında tarayıcı dili İngilizce olabilir; testler TR metin arar.)
  beforeEach(() => {
    localStorage.clear();
    i18n.changeLanguage('tr');
  });

  it('sayfa çökmeden başarıyla render edilmeli', () => {
    // Sayfanın render edilmesi sırasında hata fırlatılmamalı
    renderRiskPage();
    // Ana başlık (h1 / level 1 heading) ekranda görünmeli — "Kredi Risk Analizi"
    expect(
      screen.getByRole('heading', { level: 1, name: /Risk/i })
    ).toBeInTheDocument();
  });

  it('giriş yapmamış kullanıcıya "Üyelere Özel" çağrı kartı gösterilmeli', () => {
    // localStorage boş → kullanıcı giriş yapmamış kabul edilir
    renderRiskPage();
    // Auth guard devrede: "Üyelere Özel" metni görünmeli
    expect(screen.getByText(/Üyelere Özel/i)).toBeInTheDocument();
  });

  it('giriş yapmamış kullanıcıya Giriş ve Kayıt çağrıları gösterilmeli', () => {
    renderRiskPage();
    // CTA kartında hem giriş hem kayıt yönlendirme LİNKLERİ bulunmalı.
    // 'link' rolüyle aranır — "giriş yapın" gibi düz metinlerle karışmasın.
    expect(screen.getByRole('link', { name: /Giriş Yap/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ücretsiz Kayıt Ol/i })).toBeInTheDocument();
  });

  it('giriş yapmamış kullanıcıya finansal analiz formu GÖSTERİLMEMELİ', () => {
    renderRiskPage();
    // "Aylık Net Gelir" form etiketi, yalnızca giriş yapmış kullanıcıda
    // (stepper'ın 2. adımında) görünür — guard aktifken bulunmamalı
    expect(screen.queryByText(/Aylık Net Gelir/i)).not.toBeInTheDocument();
  });

  it('giriş yapmış kullanıcıya adımlı (stepper) form gösterilmeli', () => {
    // Önce sahte bir oturum kur, sonra render et
    setLoggedInUser();
    renderRiskPage();
    // Stepper'ın 1. adımı "Kişisel Durum" — başlığı görünmeli
    expect(screen.getAllByText(/Kişisel Durum/i).length).toBeGreaterThan(0);
    // Auth guard'ın "Üyelere Özel" kartı artık GÖRÜNMEMELİ
    expect(screen.queryByText(/Üyelere Özel/i)).not.toBeInTheDocument();
  });
});


describe('RiskReportPage — Form Regex Validasyon Testleri', () => {

  beforeEach(() => {
    localStorage.clear();
    i18n.changeLanguage('tr');
    // Form alanlarını test etmek için giriş yapmış kullanıcı gerekir
    setLoggedInUser();
  });

  it('sayısal alana HARF girildiğinde regex bunu temizlemeli', () => {
    renderRiskPage();

    // Stepper 1. adım: "Yaş" alanı (placeholder: "Örn: 35")
    const yasInput = screen.getByPlaceholderText('Örn: 35');

    // Kullanıcı harf + rakam karışık girince...
    fireEvent.input(yasInput, { target: { value: 'abc35xyz' } });

    // ...React handler'ı (handleNumber) yalnızca rakamları bırakmalı
    expect(yasInput.value).toBe('35');
  });

  it('sayısal alana özel karakter girildiğinde regex temizlemeli', () => {
    renderRiskPage();
    const yasInput = screen.getByPlaceholderText('Örn: 35');

    // Özel karakterler ve harfler girilince yalnızca rakam kalmalı
    fireEvent.input(yasInput, { target: { value: '!4@2#' } });
    expect(yasInput.value).toBe('42');
  });

  it('geçerli sayısal değer regex tarafından korunmalı', () => {
    renderRiskPage();
    const yasInput = screen.getByPlaceholderText('Örn: 35');

    // Tamamen geçerli bir sayı girilince değer aynen kalmalı
    fireEvent.input(yasInput, { target: { value: '28' } });
    expect(yasInput.value).toBe('28');
  });

  it('birikim/ondalıklı alanda yalnızca tek nokta kabul edilmeli', () => {
    renderRiskPage();
    // "Birikim Bakiyesi" alanı ondalık (decimal) kabul eder — placeholder "Örn: 25000"
    const birikimInput = screen.getByPlaceholderText('Örn: 25000');

    // Birden fazla nokta içeren girdi → tek noktaya indirgenmeli
    fireEvent.input(birikimInput, { target: { value: '12.34.56' } });
    // Regex: ilk nokta korunur, sonrakiler kaldırılır
    expect(birikimInput.value).toBe('12.3456');
  });
});
