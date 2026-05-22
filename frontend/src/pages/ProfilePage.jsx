/**
 * KrediZeka - Profil Sayfası
 * ============================
 * Giriş yapan kullanıcının verilerini API'den çeker; meslek, adres ve
 * profil fotoğrafı güncelleme imkânı sunar. Tüm metinler i18n çevirisinden okunur.
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import {
  User, Briefcase, MapPin, Phone, CreditCard, Mail, Lock, KeyRound,
  Save, Edit3, Camera, Trash2, X, ShieldCheck, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import PasswordChecklist, { isStrongPassword } from '../components/PasswordChecklist';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    occupation: '',
    address: '',
    profile_picture: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // E-posta değişikliği durumu
  const [emailEditing, setEmailEditing] = useState(false);
  const [emailForm, setEmailForm] = useState({ new_email: '', current_password: '' });
  const [emailSaving, setEmailSaving] = useState(false);

  // Şifre değişikliği durumu
  const [pwEditing, setPwEditing] = useState(false);
  const [pwForm, setPwForm] = useState({
    current_password: '', new_password: '', confirm_password: '',
  });
  const [pwSaving, setPwSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/api/profile/${user.tc_no}`, {
        headers: { 'X-User-TC': user.tc_no },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setProfile(data);
      setEditForm({
        occupation: data.occupation || '',
        address: data.address || '',
        profile_picture: null,
      });
    } catch (err) {
      const msg = err instanceof TypeError
        ? t('common.server_unreachable')
        : (err.message || t('common.unexpected_error'));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.photo_invalid_type'));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(t('profile.photo_too_large'));
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditForm((p) => ({ ...p, profile_picture: event.target.result }));
      toast.success(t('profile.photo_uploaded'));
    };
    reader.onerror = () => toast.error(t('profile.photo_read_error'));
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePicture = () => {
    setEditForm((p) => ({ ...p, profile_picture: '' }));
    toast.success(t('profile.photo_removed'));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
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
        headers: {
          'Content-Type': 'application/json',
          'X-User-TC': user.tc_no,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      const updates = {
        occupation: editForm.occupation,
        address: editForm.address,
      };
      if (editForm.profile_picture !== null) {
        updates.profile_picture = editForm.profile_picture;
      }
      setProfile((p) => ({ ...p, ...updates }));
      updateUser(updates);
      setEditForm((p) => ({ ...p, profile_picture: null }));
      setEditing(false);
      toast.success(t('profile.save_success'));
    } catch (err) {
      const msg = err instanceof TypeError
        ? t('common.server_unreachable')
        : (err.message || t('common.unexpected_error'));
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      occupation: profile.occupation || '',
      address: profile.address || '',
      profile_picture: null,
    });
  };

  const handleChangeEmail = async () => {
    if (!EMAIL_REGEX.test(emailForm.new_email.trim())) {
      return toast.error(t('profile.email_invalid'));
    }
    if (!emailForm.current_password) {
      return toast.error(t('profile.password_required'));
    }
    setEmailSaving(true);
    try {
      const res = await fetch(`${API}/api/change-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-TC': user.tc_no,
        },
        body: JSON.stringify({
          tc_no: user.tc_no,
          current_password: emailForm.current_password,
          new_email: emailForm.new_email.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setProfile((p) => ({
        ...p,
        email: data.user.email,
        email_verified: data.user.email_verified,
      }));
      updateUser({
        email: data.user.email,
        email_verified: data.user.email_verified,
      });
      setEmailForm({ new_email: '', current_password: '' });
      setEmailEditing(false);
      toast.success(data.message);
    } catch (err) {
      const msg = err instanceof TypeError
        ? t('common.server_unreachable')
        : (err.message || t('common.unexpected_error'));
      toast.error(msg);
    } finally {
      setEmailSaving(false);
    }
  };

  const handleCancelEmail = () => {
    setEmailEditing(false);
    setEmailForm({ new_email: '', current_password: '' });
  };

  const handleChangePassword = async () => {
    if (!pwForm.current_password) {
      return toast.error(t('profile.password_required'));
    }
    if (!isStrongPassword(pwForm.new_password)) {
      return toast.error(t('password_rules.weak_error'));
    }
    if (pwForm.new_password !== pwForm.confirm_password) {
      return toast.error(t('profile.password_mismatch'));
    }
    setPwSaving(true);
    try {
      const res = await fetch(`${API}/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-TC': user.tc_no,
        },
        body: JSON.stringify({
          tc_no: user.tc_no,
          current_password: pwForm.current_password,
          new_password: pwForm.new_password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);

      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
      setPwEditing(false);
      toast.success(data.message);
    } catch (err) {
      const msg = err instanceof TypeError
        ? t('common.server_unreachable')
        : (err.message || t('common.unexpected_error'));
      toast.error(msg);
    } finally {
      setPwSaving(false);
    }
  };

  const handleCancelPassword = () => {
    setPwEditing(false);
    setPwForm({ current_password: '', new_password: '', confirm_password: '' });
  };

  if (!user) return null;

  const currentPicture = editForm.profile_picture !== null
    ? editForm.profile_picture
    : (profile?.profile_picture || '');

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="animate-fade-in-up">
          <div className="card-static overflow-hidden mb-6">
            <div className="h-32 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500" />
            <div className="px-8 pb-8 -mt-12">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white overflow-hidden">
                  {currentPicture ? (
                    <img src={currentPicture} alt={t('profile.full_name')} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black gradient-text">
                      {(profile?.full_name || user.full_name)?.charAt(0)?.toUpperCase() || 'K'}
                    </span>
                  )}
                </div>
                {editing && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1.5">
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-9 h-9 rounded-xl bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-500/40 transition-all hover:scale-110"
                      title={t('profile.upload_photo')} aria-label={t('profile.upload_photo')}>
                      <Camera className="w-4 h-4" />
                    </button>
                    {currentPicture && (
                      <button type="button" onClick={handleRemovePicture}
                        className="w-9 h-9 rounded-xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/40 transition-all hover:scale-110"
                        title={t('profile.remove_photo')} aria-label={t('profile.remove_photo')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePictureChange} className="hidden" />

              <h1 className="text-2xl font-extrabold text-slate-900 mt-4">
                {profile?.full_name || user.full_name}
              </h1>
              <p className="text-sm text-slate-500">{t('profile.member_badge')}</p>

              {editing && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                  <Camera className="w-3.5 h-3.5" />
                  {t('profile.photo_hint')}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="card-static p-10 text-center">
              <svg className="animate-spin w-8 h-8 mx-auto text-primary-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
              <p className="text-slate-500 mt-3">{t('profile.loading')}</p>
            </div>
          ) : profile && (
            <div className="card-static p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900">{t('profile.personal_info')}</h2>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-all">
                    <Edit3 className="w-4 h-4" /> {t('profile.edit')}
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                    <User className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('profile.full_name')}</p>
                      <p className="text-sm font-semibold text-slate-800">{profile.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                    <CreditCard className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('profile.tc_no')}</p>
                      <p className="text-sm font-semibold text-slate-800">{profile.tc_no}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                    <Phone className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('profile.phone')}</p>
                      <p className="text-sm font-semibold text-slate-800">{profile.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                    <Mail className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('profile.email_label')}</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{profile.email || t('profile.not_specified')}</p>
                      {profile.email && (
                        profile.email_verified ? (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-emerald-600">
                            <ShieldCheck className="w-3.5 h-3.5" /> {t('profile.email_verified')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-amber-600">
                            <ShieldAlert className="w-3.5 h-3.5" /> {t('profile.email_unverified')}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Briefcase className="w-4 h-4 text-amber-500" /> {t('profile.occupation_label')}
                    </label>
                    {editing ? (
                      <input type="text" value={editForm.occupation} onChange={(e) => setEditForm((p) => ({ ...p, occupation: e.target.value }))} className="input-field" placeholder={t('profile.occupation_placeholder')} maxLength={200} />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-slate-50 text-sm text-slate-700">{profile.occupation || t('profile.not_specified')}</p>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <MapPin className="w-4 h-4 text-red-500" /> {t('profile.address_label')}
                    </label>
                    {editing ? (
                      <textarea value={editForm.address} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))} className="input-field min-h-[100px] resize-none" placeholder={t('profile.address_placeholder')} maxLength={500} />
                    ) : (
                      <p className="px-4 py-3 rounded-xl bg-slate-50 text-sm text-slate-700">{profile.address || t('profile.not_specified')}</p>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                      {saving ? (
                        <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> {t('profile.saving')}</>
                      ) : (
                        <><Save className="w-4 h-4" /> {t('profile.save')}</>
                      )}
                    </button>
                    <button onClick={handleCancel} disabled={saving} className="btn-secondary flex items-center gap-2">
                      <X className="w-4 h-4" /> {t('profile.cancel')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {profile && (
            <div className="card-static p-8 mt-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-500" /> {t('profile.change_email_title')}
                </h2>
                {!emailEditing && (
                  <button onClick={() => setEmailEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-all">
                    <Edit3 className="w-4 h-4" /> {t('profile.edit')}
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-5">{t('profile.change_email_desc')}</p>

              {emailEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Mail className="w-4 h-4 text-primary-500" /> {t('profile.new_email_label')}
                    </label>
                    <input type="email" value={emailForm.new_email}
                      onChange={(e) => setEmailForm((p) => ({ ...p, new_email: e.target.value }))}
                      className="input-field" placeholder={t('profile.new_email_placeholder')} maxLength={255} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Lock className="w-4 h-4 text-primary-500" /> {t('profile.current_password_label')}
                    </label>
                    <input type="password" value={emailForm.current_password}
                      onChange={(e) => setEmailForm((p) => ({ ...p, current_password: e.target.value }))}
                      className="input-field" placeholder={t('profile.current_password_placeholder')} />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={handleChangeEmail} disabled={emailSaving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                      {emailSaving ? (
                        <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> {t('profile.saving')}</>
                      ) : (
                        <><Save className="w-4 h-4" /> {t('profile.change_email_submit')}</>
                      )}
                    </button>
                    <button onClick={handleCancelEmail} disabled={emailSaving} className="btn-secondary flex items-center gap-2">
                      <X className="w-4 h-4" /> {t('profile.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="px-4 py-3 rounded-xl bg-slate-50 text-sm text-slate-700">
                  {profile.email || t('profile.not_specified')}
                </p>
              )}
            </div>
          )}

          {profile && (
            <div className="card-static p-8 mt-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary-500" /> {t('profile.change_password_title')}
                </h2>
                {!pwEditing && (
                  <button onClick={() => setPwEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-all">
                    <Edit3 className="w-4 h-4" /> {t('profile.edit')}
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-5">{t('profile.change_password_desc')}</p>

              {pwEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Lock className="w-4 h-4 text-primary-500" /> {t('profile.current_password_label')}
                    </label>
                    <input type="password" value={pwForm.current_password}
                      onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))}
                      className="input-field" placeholder={t('profile.current_password_placeholder')} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <KeyRound className="w-4 h-4 text-primary-500" /> {t('profile.new_password_label')}
                    </label>
                    <input type="password" value={pwForm.new_password}
                      onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
                      className="input-field" placeholder={t('profile.new_password_placeholder')} />
                    <PasswordChecklist password={pwForm.new_password} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <KeyRound className="w-4 h-4 text-primary-500" /> {t('profile.confirm_password_label')}
                    </label>
                    <input type="password" value={pwForm.confirm_password}
                      onChange={(e) => setPwForm((p) => ({ ...p, confirm_password: e.target.value }))}
                      className="input-field" placeholder={t('profile.confirm_password_placeholder')} />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button onClick={handleChangePassword} disabled={pwSaving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                      {pwSaving ? (
                        <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> {t('profile.saving')}</>
                      ) : (
                        <><Save className="w-4 h-4" /> {t('profile.change_password_submit')}</>
                      )}
                    </button>
                    <button onClick={handleCancelPassword} disabled={pwSaving} className="btn-secondary flex items-center gap-2">
                      <X className="w-4 h-4" /> {t('profile.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="px-4 py-3 rounded-xl bg-slate-50 text-sm text-slate-700 font-mono tracking-widest">
                  ••••••••••
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
