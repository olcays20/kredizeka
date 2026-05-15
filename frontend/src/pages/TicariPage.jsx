/**
 * KrediZeka - Ticari Bankacılık Sayfası
 * =======================================
 * İşletme ve kurumsal müşterilere yönelik statik tanıtım sayfası.
 */

import { Building2, Landmark, BarChart3, Globe, Truck, FileText, ArrowRight, Shield, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TicariPage() {
  const services = [
    { icon: Landmark, title: 'İşletme Kredisi', desc: 'İşletmenizin büyümesi için uygun faizli kredi çözümleri. Esnek geri ödeme planları.', color: 'from-indigo-500 to-indigo-600' },
    { icon: Globe, title: 'Dış Ticaret Finansmanı', desc: 'İthalat ve ihracat işlemleriniz için akreditif, vesaik ve teminat mektupları.', color: 'from-cyan-500 to-cyan-600' },
    { icon: BarChart3, title: 'Yatırım Danışmanlığı', desc: 'Kurumsal yatırım portföyünüz için uzman danışmanlık hizmetleri.', color: 'from-emerald-500 to-emerald-600' },
    { icon: Truck, title: 'Filo Finansmanı', desc: 'Araç filonuzu genişletin. Özel koşullu filo kiralama ve kredi çözümleri.', color: 'from-orange-500 to-orange-600' },
    { icon: FileText, title: 'Faktoring', desc: 'Alacaklarınızı hemen nakde çevirin. Yurtiçi ve yurtdışı faktoring hizmetleri.', color: 'from-rose-500 to-rose-600' },
    { icon: Shield, title: 'Ticari Sigorta', desc: 'İşletmenizi risklere karşı koruyun. Kapsamlı ticari sigorta paketleri.', color: 'from-violet-500 to-violet-600' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 text-indigo-700 text-sm font-semibold mb-6">
            <Building2 className="w-4 h-4" /> Ticari Bankacılık
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Ticari <span className="gradient-text">Büyüme Ortağınız</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            KOBİ'lerden büyük işletmelere kadar, işinizi büyütecek finansal çözümler sunuyoruz.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Risk Analizi Yap <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-4">Ticari <span className="gradient-text">Hizmetlerimiz</span></h2>
        <p className="text-slate-500 text-center max-w-xl mx-auto mb-12">İşletmenizin ihtiyaçlarına özel çözümler.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={i} className="card p-8 group">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* İstatistikler */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: '15K+', label: 'Kurumsal Müşteri' },
              { val: '₺2.5M+', label: 'Kullandırılan Kredi' },
              { val: '%98', label: 'Müşteri Memnuniyeti' },
              { val: '24/7', label: 'Destek Hattı' },
            ].map(({ val, label }, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">{val}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
