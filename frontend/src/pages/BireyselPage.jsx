/**
 * KrediZeka - Bireysel Bankacılık Sayfası
 * =========================================
 * Kurumsal hissi destekleyen, ikonlu statik tanıtım sayfası.
 */

import { User, CreditCard, Home, Car, GraduationCap, Umbrella, PiggyBank, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BireyselPage() {
  const services = [
    { icon: CreditCard, title: 'İhtiyaç Kredisi', desc: 'Uygun faiz oranları ile hayallerinizi gerçeğe dönüştürün. 60 aya varan vade seçenekleri.', color: 'from-blue-500 to-blue-600' },
    { icon: Home, title: 'Konut Kredisi', desc: 'Hayalinizdeki eve kavuşmanız için en uygun konut kredisi çözümleri.', color: 'from-emerald-500 to-emerald-600' },
    { icon: Car, title: 'Taşıt Kredisi', desc: 'Sıfır ve ikinci el araç alımlarınız için avantajlı taşıt kredileri.', color: 'from-violet-500 to-violet-600' },
    { icon: GraduationCap, title: 'Eğitim Kredisi', desc: 'Kendinize ve ailenize yatırım yapın. Düşük faizli eğitim kredileri.', color: 'from-amber-500 to-amber-600' },
    { icon: PiggyBank, title: 'Mevduat Hesabı', desc: 'Birikimlerinizi değerlendirin. Yüksek faizli vadeli mevduat seçenekleri.', color: 'from-pink-500 to-pink-600' },
    { icon: Umbrella, title: 'Bireysel Sigorta', desc: 'Sağlık, hayat ve kasko sigortaları ile kendinizi güvence altına alın.', color: 'from-teal-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-primary-50" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/80 text-blue-700 text-sm font-semibold mb-6">
            <User className="w-4 h-4" /> Bireysel Bankacılık
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Bireysel <span className="gradient-text">Finansal Çözümler</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            İhtiyaçlarınıza özel kredi seçenekleri, yatırım fırsatları ve sigorta ürünleri ile yanınızdayız.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Risk Analizi Yap <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Hizmetler */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-4">Bireysel <span className="gradient-text">Hizmetlerimiz</span></h2>
        <p className="text-slate-500 text-center max-w-xl mx-auto mb-12">Finansal ihtiyaçlarınıza uygun geniş ürün yelpazemizle hizmetinizdeyiz.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={i} className="card p-8 group" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="card-static p-10 md:p-14 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-center rounded-3xl">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-2xl md:text-3xl font-extrabold mb-3">Kredi Uygunluğunuzu Öğrenin</h3>
          <p className="text-primary-100 max-w-lg mx-auto mb-6">Yapay zeka destekli risk analiz sistemimiz ile kredi onaylanma olasılığınızı saniyeler içinde hesaplayın.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 font-bold hover:bg-primary-50 transition-all duration-300 hover:-translate-y-0.5 shadow-xl">
            Hemen Başla <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
