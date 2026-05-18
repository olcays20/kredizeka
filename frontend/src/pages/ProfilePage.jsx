/**
 * KrediZeka - Profil Sayfası
 * ============================
 * Giriş yapan kullanıcının verilerini API'den çeker; meslek, adres ve
 * profil fotoğrafı güncelleme imkânı sunar.
 *
 * Profil Fotoğrafı:
 *  - Kullanıcı bilgisayarından bir görsel seçer
 *  - FileReader ile Base64'e çevrilir
 *  - "Kaydet" butonu ile diğer alanlarla birlikte sunucuya gönderilir
 *  - Boyut limiti: 2 MB (frontend'de erken kontrol)
 *  - Format: image/* (jpeg, png, webp...)
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  User, Briefcase, MapPin, Phone, CreditCard,
  Save, Edit3, Camera, Trash2, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Frontend'de güvenli maksimum boyut (Base64 sonrası ~33% büyür)
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    occupation: '',
    address: '',
    profile_picture: null, // null = değişiklik yok, '' = sil, 'data:image/...' = yeni
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Gizli file input referansı (kamera butonundan tetikliyoruz)
  const fileInputRef = useRef(null);

  // ─── API'den profil bilgilerini çek ─────────────────────────────────────
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/api/profile/${user.tc_no}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setProfile(data);
      setEditForm({
        occupation: data.occupation || '',
        address: data.address || '',
        profile_picture: null, // başlangıçta değişiklik yok
      });
    } catch (err) {
      const msg = err instanceof TypeError
        ? 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'
        : (err.message || 'Beklenmeyen bir hata oluştu.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Dosya seçimi: Resmi Base64'e çevir ────────────────────────────────
  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Görsel formatı doğrulaması
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir görsel dosyası seçin (JPG, PNG, WebP).');
      e.target.value = '';
      return;
    }

    // Boyut doğrulaması
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('Görsel boyutu 2 MB\'tan büyük olamaz.');
      e.target.value = '';
      return;
    }

    // FileReader API ile Base64 dönüşümü
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditForm((p) => ({ ...p, profile_picture: event.target.result }));
      toast.success('Görsel yüklendi. Değişiklikleri kaydetmeyi unutmayın.');
    };
    reader.onerror = () => {
      toast.error('Görsel okunurken bir hata oluştu.');
    };
    reader.readAsDataURL(file);

    // Aynı dosyayı tekrar seçebilmek için input'u sıfırla
    e.target.value = '';
  };

  // ─── Mevcut fotoğrafı kaldır (boş string → sunucuda silinir) ───────────
  const handleRemovePicture = () => {
    setEditForm((p) => ({ ...p, profile_picture: '' }));
    toast.success('Fotoğraf kaldırıldı. Değişiklikleri kaydetmeyi unutmayın.');
  };

  // ─── Profil güncelleme ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      // profile_picture null ise alanı hiç göndermiyoruz → fotoğraf değişmez
      const payload = {
        tc_no: user.tc_no,
        occupation: editForm.occupation,
        address: editForm.address,
      };
      if (editForm.profile_picture !== null) {
        payload.profile_picture = editForm.profile_picture;
      }

      const res = await fetch(`${API}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      // Yerel state ve oturum bilgisini güncelle
      const updates = {
        occupation: editForm.occupation,
        address: editForm.address,
      };
      if (editForm.profile_picture !== null) {
        updates.profile_picture = editForm.profile_picture;
      }
      setProfile((p) => ({ ...p, ...updates }));
      updateUser(updates);

      // Edit state'i sıfırla
      setEditForm((p) => ({ ...p, profile_picture: null }));
      setEditing(false);
      toast.success('Profil bilgileriniz güncellendi.');
    } catch (err) {
      const msg = err instanceof TypeError
        ? 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'
        : (err.message || 'Beklenmeyen bir hata oluştu.');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── İptal: değişiklikleri geri al ──────────────────────────────────────
  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      occupation: profile.occupation || '',
      address: profile.address || '',
      profile_picture: null,
    });
  };

  if (!user) return null;

  // Şu an gösterilecek profil fotoğrafı (önizleme veya kaydedilmiş)
  // editForm.profile_picture: null = değişiklik yok → mevcut profile'ı göster
  //                          : '' = silinmiş → harf avatarı göster
  //                          : 'data:...' = yeni seçim → onu göster
  const currentPicture = editForm.profile_picture !== null
    ? editForm.profile_picture
    : (profile?.profile_picture || '');

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="animate-fade-in-up">

          {/* ─── Profil Başlık Kartı ─── */}
          <div className="card-static overflow-hidden mb-6">
            <div className="h-32 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500" />
            <div className="px-8 pb-8 -mt-12">

              {/* Avatar Alanı */}
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white overflow-hidden">
                  {currentPicture ? (
                    <img
                      src={currentPicture}
                      alt="Profil Fotoğrafı"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black gradient-text">
                      {(profile?.full_name || user.full_name)?.charAt(0)?.toUpperCase() || 'K'}
                    </span>
                  )}
                </div>

                {/* Düzenleme modunda: Kamera ve Sil butonları */}
                {editing && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1.5">
                    {/* Yükle Butonu */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-9 h-9 rounded-xl bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-500/40 transition-all hover:scale-110"
                      title="Fotoğraf yükle"
                      aria-label="Profil fotoğrafı yükle"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    {/* Sil Butonu (fotoğraf varsa) */}
                    {currentPicture && (
                      <button
                        type="button"
                        onClick={handleRemovePicture}
                        className="w-9 h-9 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/40 transition-all hover:scale-110"
                        title="Fotoğrafı kaldır"
                        aria-label="Profil fotoğrafını kaldır"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Gizli file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />

              <h1 className="text-2xl font-extrabold text-slate-900 mt-4">
                {profile?.full_name || user.full_name}
              </h1>
              <p className="text-sm text-slate-500">KrediZeka Üyesi</p>

              {/* Edit modunda fotoğraf bilgilendirmesi */}
              {editing && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                  <Camera className="w-3.5 h-3.5" />
                  Profil fotoğrafınızı değiştirmek için kamera ikonuna tıklayın
                </div>
              )}
            </div>
          </div>

          {/* ─── Bilgiler ─── */}
          {loading ? (
            <div className="card-static p-10 text-center">
              <svg className="animate-spin w-8 h-8 mx-auto text-primary-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
              <p className="text-slate-500 mt-3">Profil yükleniyor...</p>
            </div>
          ) : profile && (
            <div className="card-static p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">Kişisel Bilgiler</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-all"
                  >
                    <Edit3 className="w-4 h-4" /> Düzenle
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {/* Sabit Bilgiler */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                    <User className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ad Soyad</p>
                      <p className="text-sm font-semibold text-slate-800">{profile.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                    <CreditCard className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">T.C. Kimlik No</p>
                      <p className="text-sm font-semibold text-slate-800">{profile.tc_no}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                    <Phone className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Telefon</p>
                      <p className="text-sm font-semibold text-slate-800">{profile.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Düzenlenebilir Alanlar */}
                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Briefcase className="w-4 h-4 text-amber-500" /> Meslek
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={editForm.occupation}
                        onChange={(e) => setEditForm((p) => ({ ...p, occupation: e.target.value }))}
                        className="input-field"
                        placeholder="Mesleğinizi girin"
                        maxLength={200}
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-slate-50 text-sm text-slate-700">
                        {profile.occupation || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <MapPin className="w-4 h-4 text-red-500" /> Adres
                    </label>
                    {editing ? (
                      <textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                        className="input-field min-h-[100px] resize-none"
                        placeholder="Adresinizi girin"
                        maxLength={500}
                      />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-slate-50 text-sm text-slate-700">
                        {profile.address || 'Belirtilmemiş'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Kaydet / İptal Butonları */}
                {editing && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Kaydet
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> İptal
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
