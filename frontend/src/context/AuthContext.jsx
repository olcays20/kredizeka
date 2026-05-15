/**
 * KrediZeka - Kimlik Doğrulama Bağlamı (Auth Context)
 * ====================================================
 * React Context API kullanarak uygulama genelinde kullanıcı oturum
 * durumunu yönetir. localStorage ile oturum kalıcılığı sağlar.
 * 
 * Kullanım:
 *   - useAuth() hook'u ile herhangi bir bileşenden erişilebilir
 *   - login(): Kullanıcı bilgilerini saklar
 *   - logout(): Oturumu sonlandırır
 *   - user: Mevcut oturum açmış kullanıcı bilgileri
 */

import { createContext, useContext, useState } from 'react';

// Context nesnesi oluştur
// Bu nesne, tüm alt bileşenlere veri sağlayacak "kanal" görevi görür
export const AuthContext = createContext(null);

/**
 * AuthProvider bileşeni - Uygulama genelinde oturum yönetimi sağlar.
 * 
 * Bu bileşen, App.jsx'te tüm uygulamayı saran bir "kapsayıcı" (wrapper) olarak kullanılır.
 * İçerdiği state ve fonksiyonlar, alt bileşenler tarafından useAuth() ile erişilir.
 */
export function AuthProvider({ children }) {
  // Kullanıcı bilgisini state olarak tut
  // Başlangıçta localStorage'dan oku (sayfa yenilendiğinde oturum korunması için)
  const [user, setUser] = useState(() => {
    try {
      // localStorage'da kayıtlı kullanıcı bilgisi varsa JSON olarak parse et
      const savedUser = localStorage.getItem('kredizeka_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      // JSON parse hatası olursa null döndür (bozuk veri durumu)
      return null;
    }
  });

  /**
   * Giriş yapma fonksiyonu
   * Kullanıcı bilgilerini hem state'e hem localStorage'a kaydeder.
   * 
   * @param {Object} userData - API'den dönen kullanıcı bilgileri
   *   { tc_no, full_name, phone, occupation, address }
   */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('kredizeka_user', JSON.stringify(userData));
  };

  /**
   * Çıkış yapma fonksiyonu
   * State'i ve localStorage'ı temizler.
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('kredizeka_user');
  };

  /**
   * Kullanıcı bilgilerini güncelleme fonksiyonu
   * Profil güncellendiğinde çağrılır (meslek, adres değişikliği vb.)
   * 
   * @param {Object} updatedData - Güncellenmiş kullanıcı verileri
   */
  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('kredizeka_user', JSON.stringify(newUser));
  };

  // Context değerlerini sağla
  // value içindeki her şey, useAuth() kullanan tüm bileşenlerden erişilebilir
  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

