/**
 * KrediZeka - Ürünler Sayfası
 * ==============================
 * Tüm finansal ürünlerin listelendiği kurumsal tanıtım sayfası.
 *
 * NOT: KrediZeka yalnızca web tabanlı bir platformdur. Bu sayfada mobil
 * uygulama veya app store yönlendirmesi bulunmaz.
 */

import { Package, CreditCard, PiggyBank, TrendingUp, Shield, Globe, Wallet, BadgePercent, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UrunlerPage() {
  const products = [
    {
      icon: CreditCard, title: 'Kredi Kartları', color: 'from-violet-500 to-violet-600',
      features: ['Yıllık aidat yok', 'Tüm harcamalara taksit', 'Mil ve puan kazanımı', 'Temassız ödeme'],
    },
    {
      icon: PiggyBank, title: 'Mevduat Hesapları', color: 'from-emerald-500 to-emerald-600',
      features: ['Yüksek faiz oranları', 'Esnek vade seçenekleri', 'Otomatik yenileme', 'Online yönetim'],
    },
    {
      icon: TrendingUp, title: 'Yatırım Ürünleri', color: 'from-blue-500 to-blue-600',
      features: ['Hisse senedi', 'Yatırım fonları', 'Altın hesabı', 'Döviz işlemleri'],
    },
    {
      icon: Shield, title: 'Sigorta Ürünleri', color: 'from-amber-500 to-amber-600',
      features: ['Hayat sigortası', 'Sağlık sigortası', 'Kasko & trafik', 'Konut sigortası'],
    },
    {
      icon: Globe, title: 'Online Bankacılık', color: 'from-pink-500 to-pink-600',
      features: ['Tarayıcı üzerinden erişim', 'Anlık bildirimler', 'Hızlı transfer', '7/24 erişim'],
    },
    {
      icon: BadgePercent, title: 'Kampanyalar', color: 'from-teal-500 to-teal-600',
      features: ['Hoş geldin bonusu', 'Cashback fırsatları', 'Özel faiz oranları', 'Partner indirimleri'],
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-pink-50" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100/80 text-violet-700 text-sm font-semibold mb-6">
            <Package className="w-4 h-4" /> Ürün & Hizmetler
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Finansal <span className="gradient-text">Ürünlerimiz</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            İhtiyacınıza uygun ürünü keşfedin, online bankacılığın avantajlarından yararlanın.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(({ icon: Icon, title, color, features }, i) => (
            <div key={i} className="card p-8 group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 md:p-14 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-center rounded-3xl">
          <Wallet className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl md:text-3xl font-extrabold mb-3">Size Uygun Ürünü Bulalım</h3>
          <p className="text-white/80 max-w-lg mx-auto mb-6">Finansal profilinizi analiz edelim ve size en uygun ürünleri önerelim.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 font-bold hover:bg-primary-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xl">
            Analiz Başlat <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
