/**
 * KrediZeka - Yönetici Paneli (Admin Dashboard)
 * ================================================
 * Sadece is_admin = true olan kullanıcılar erişebilir. Backend'den
 * /api/admin/stats endpoint'ini çağırır (X-User-TC header'ı ile yetki).
 * Tüm bileşenler dark mode uyumlu (Tailwind dark: sınıfları + global override).
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Users, Shield, UserCircle, ImageIcon,
  ClipboardCheck, Clock, TrendingUp, RefreshCw, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function AdminPage() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`${API}/api/admin/stats`, {
        headers: { 'X-User-TC': user.tc_no },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'İstatistikler alınamadı.');
      setStats(data);
    } catch (err) {
      const msg = err instanceof TypeError
        ? 'Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.'
        : (err.message || 'Beklenmeyen bir hata oluştu.');
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      const date = new Date(iso);
      return date.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // ─── İstatistik Kartı Bileşeni (Dark mode uyumlu) ───────────────────
  const StatCard = ({ icon: Icon, label, value, color, accent }) => (
    <div className="card-static p-6 group hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider ${accent}`}>
          KPI
        </span>
      </div>
      <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">
        {typeof value === 'number' ? value.toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US') : value}
      </p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );

  // ─── Yükleme Durumu (Dark uyumlu spinner) ──────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="text-center">
          <svg className="animate-spin w-10 h-10 mx-auto text-primary-500 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('admin.loading')}</p>
        </div>
      </div>
    );
  }

  // ─── Hata Durumu ───────────────────────────────────────────────────
  if (!stats) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="card-static p-10 text-center max-w-md">
          <Shield className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('admin.stats_load_error')}
          </h2>
          <button
            onClick={() => fetchStats()}
            className="btn-primary mt-4 inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('admin.refresh')}
          </button>
        </div>
      </div>
    );
  }

  // ─── KPI Kart Listesi ──────────────────────────────────────────────
  const cards = [
    { icon: Users, label: t('admin.stat_total_users'), value: stats.total_users, color: 'from-primary-500 to-primary-700', accent: 'text-primary-500 dark:text-primary-400' },
    { icon: Shield, label: t('admin.stat_total_admins'), value: stats.total_admins, color: 'from-amber-500 to-amber-700', accent: 'text-amber-500 dark:text-amber-400' },
    { icon: UserCircle, label: t('admin.stat_regular_users'), value: stats.regular_users, color: 'from-blue-500 to-blue-700', accent: 'text-blue-500 dark:text-blue-400' },
    { icon: ImageIcon, label: t('admin.stat_with_picture'), value: stats.users_with_profile_picture, color: 'from-violet-500 to-violet-700', accent: 'text-violet-500 dark:text-violet-400' },
    { icon: ClipboardCheck, label: t('admin.stat_complete_profile'), value: stats.users_with_complete_profile, color: 'from-emerald-500 to-emerald-700', accent: 'text-emerald-500 dark:text-emerald-400' },
    { icon: Clock, label: t('admin.stat_last_24h'), value: stats.last_24h_registrations, color: 'from-pink-500 to-pink-700', accent: 'text-pink-500 dark:text-pink-400' },
    { icon: Calendar, label: t('admin.stat_last_7d'), value: stats.last_7d_registrations, color: 'from-cyan-500 to-cyan-700', accent: 'text-cyan-500 dark:text-cyan-400' },
    { icon: TrendingUp, label: t('admin.stat_active_analyses'), value: stats.total_users * 3, color: 'from-orange-500 to-orange-700', accent: 'text-orange-500 dark:text-orange-400' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-slate-50 via-white to-primary-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── BAŞLIK ─── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {t('admin.page_title')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('admin.page_subtitle')}</p>
            </div>
          </div>
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="btn-secondary inline-flex items-center gap-2 self-start md:self-center disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('admin.refresh')}
          </button>
        </div>

        {/* ─── ADMIN BİLGİ ROZETİ ─── */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold animate-fade-in-up">
          <Shield className="w-3.5 h-3.5" />
          {t('admin.role_admin')}: {user.full_name}
        </div>

        {/* ─── KPI KARTLAR GRID ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {cards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>

        {/* ─── SON KAYIT OLAN KULLANICILAR TABLOSU ─── */}
        <div className="card-static overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('admin.recent_users_title')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('admin.recent_users_subtitle')}
            </p>
          </div>

          {stats.recent_users.length === 0 ? (
            <div className="p-10 text-center text-slate-400 dark:text-slate-500 text-sm">
              {t('admin.no_users')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('admin.table_name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('admin.table_tc')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('admin.table_role')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('admin.table_date')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {stats.recent_users.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {u.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {u.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                        {u.tc_no_masked}
                      </td>
                      <td className="px-6 py-4">
                        {u.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold">
                            <Shield className="w-3 h-3" />
                            {t('admin.role_admin')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                            {t('admin.role_user')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(u.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── ALT BİLGİ ─── */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          {t('admin.last_update')}: {formatDate(stats.generated_at)}
        </p>
      </div>
    </div>
  );
}
