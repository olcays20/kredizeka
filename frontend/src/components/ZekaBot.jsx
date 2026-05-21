/**
 * KrediZeka - ZekaBot Sohbet Asistanı (ZekaBot.jsx)
 * ===================================================
 * Ekranın sağ altına sabitlenmiş, 7/24 hizmet veren kurgusal bir yapay
 * zeka finans asistanı. Kullanıcının yazdığı soruyu backend'deki
 * '/api/chat' uç noktasına gönderir ve gelen finansal tavsiyeyi gösterir.
 *
 * Mimari notlar:
 *   - Bileşen App.jsx içinde bir kez render edilir → tüm sayfalarda görünür.
 *   - 'fixed bottom-4 right-4' ile her zaman ekranın sağ altında kalır.
 *   - Açık/kapalı durumu (isOpen) yerel state ile yönetilir.
 *   - Karanlık tema (dark mode) tüm yüzeylerde desteklenir.
 *
 * Backend ile sözleşme (API kontratı):
 *   İstek : POST /api/chat   { "message": "..." }
 *   Yanıt : { "success": true, "reply": "...", "intent": "..." }
 */

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, User } from 'lucide-react';

// Backend adresi — üretimde ortam değişkeninden, geliştirmede localhost'tan
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Sohbet ilk açıldığında ZekaBot'un gösterdiği karşılama mesajı
const WELCOME_MESSAGE = {
  role: 'bot',
  text:
    'Merhaba! Ben ZekaBot 🤖 — KrediZeka finans asistanınız. ' +
    'Kredi notu, borç yönetimi, faiz, yatırım veya konut kredisi ' +
    'hakkında merak ettiklerinizi sorabilirsiniz.',
};

// Kullanıcıya kolaylık olsun diye sunulan hazır soru önerileri.
// Tıklandığında doğrudan ZekaBot'a gönderilir.
const QUICK_REPLIES = [
  'Kredi notumu nasıl yükseltirim?',
  'Borç/gelir oranı nedir?',
  'Yatırım için tavsiye ver',
];

export default function ZekaBot() {
  // Sohbet penceresi açık mı?
  const [isOpen, setIsOpen] = useState(false);
  // Sohbet geçmişi — her öğe: { role: 'bot' | 'user', text: '...' }
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  // Giriş kutusundaki metin
  const [input, setInput] = useState('');
  // ZekaBot yanıt üretiyor mu? (yazıyor... animasyonu için)
  const [loading, setLoading] = useState(false);

  // Mesaj listesinin en altına otomatik kaydırmak için referans
  const messagesEndRef = useRef(null);

  // Yeni mesaj eklendiğinde veya "yazıyor" durumu değiştiğinde en alta kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /**
   * Bir mesajı ZekaBot'a gönderir.
   *
   * Akış:
   *   1. Kullanıcı mesajı geçmişe eklenir, giriş kutusu temizlenir.
   *   2. 'loading' true yapılır → "yazıyor..." animasyonu görünür.
   *   3. POST /api/chat isteği atılır.
   *   4. Gelen yanıt (reply) bot mesajı olarak geçmişe eklenir.
   *   5. Hata olursa kullanıcıya nazik bir hata mesajı gösterilir.
   *
   * @param {string} rawText - Gönderilecek ham metin
   */
  const sendMessage = async (rawText) => {
    const text = rawText.trim();
    // Boş mesaj gönderme veya halihazırda yanıt beklenirken tekrar gönderme
    if (!text || loading) return;

    // 1) Kullanıcı mesajını ekrana yansıt
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      // 3) Backend'deki ZekaBot uç noktasına isteği gönder
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'ZekaBot şu an yanıt veremiyor.');
      }

      // 4) ZekaBot yanıtını sohbet geçmişine ekle
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      // 5) Sunucuya ulaşılamazsa veya hata olursa kullanıcıyı bilgilendir
      const message =
        err instanceof TypeError
          ? 'Sunucuya ulaşılamadı. Lütfen internet bağlantınızı kontrol edin.'
          : err.message;
      setMessages((prev) => [...prev, { role: 'bot', text: `⚠️ ${message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Form gönderimi (Enter tuşu veya gönder butonu)
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* ═══════════ KAPALI DURUM — Yüzen Sohbet Balonu Butonu ═══════════ */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="ZekaBot sohbet asistanını aç"
          className="fixed bottom-4 right-4 z-50 w-16 h-16 rounded-full
                     bg-gradient-to-br from-primary-600 to-accent-600
                     text-white shadow-2xl shadow-primary-500/40
                     flex items-center justify-center
                     transition-all duration-300 hover:scale-110 hover:-translate-y-1
                     focus:outline-none focus:ring-4 focus:ring-primary-500/30
                     animate-pulse-glow"
        >
          <MessageCircle className="w-7 h-7" />
          {/* Çevrimiçi göstergesi — sağ üst köşede yeşil nokta */}
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-400
                           rounded-full border-2 border-white" />
        </button>
      )}

      {/* ═══════════ AÇIK DURUM — Sohbet Penceresi ═══════════ */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 z-50
                     w-[370px] max-w-[calc(100vw-2rem)]
                     h-[540px] max-h-[calc(100vh-7rem)]
                     flex flex-col overflow-hidden
                     rounded-2xl shadow-2xl
                     bg-white dark:bg-slate-800
                     border border-slate-200 dark:border-slate-700
                     animate-fade-in-up"
        >
          {/* ─── Başlık (Header) ─────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3
                          bg-gradient-to-r from-primary-600 to-accent-600 text-white">
            <div className="flex items-center gap-3">
              {/* Bot avatarı */}
              <div className="relative w-10 h-10 rounded-full bg-white/20
                              flex items-center justify-center">
                <Bot className="w-6 h-6" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400
                                 rounded-full border-2 border-primary-600" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">ZekaBot</p>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Yapay Zeka Asistanı
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Sohbeti kapat"
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         transition-colors hover:bg-white/20
                         focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ─── Mesaj Listesi ───────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3
                          bg-slate-50 dark:bg-slate-900">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar — bot ve kullanıcı için farklı renk/ikon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center
                              justify-center ${
                    msg.role === 'user'
                      ? 'bg-slate-300 dark:bg-slate-600'
                      : 'bg-gradient-to-br from-primary-500 to-accent-500'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-slate-700 dark:text-slate-100" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Mesaj balonu */}
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed
                              whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-2xl rounded-br-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 ' +
                        'rounded-2xl rounded-bl-md border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* "ZekaBot yazıyor..." animasyonu (yanıt beklenirken) */}
            {loading && (
              <div className="flex items-end gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full
                                bg-gradient-to-br from-primary-500 to-accent-500
                                flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200
                                dark:border-slate-700 rounded-2xl rounded-bl-md
                                px-4 py-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Hazır soru önerileri — yalnızca sohbetin başında gösterilir */}
            {messages.length === 1 && !loading && (
              <div className="pt-2 space-y-2">
                <p className="text-xs text-slate-400 dark:text-slate-500 px-1">
                  Hızlı sorular:
                </p>
                {QUICK_REPLIES.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    className="block w-full text-left text-sm px-3 py-2
                               rounded-xl border border-primary-200 dark:border-slate-700
                               bg-white dark:bg-slate-800
                               text-primary-700 dark:text-primary-300
                               transition-colors hover:bg-primary-50 dark:hover:bg-slate-700"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {/* Otomatik kaydırma için görünmez bitiş işaretçisi */}
            <div ref={messagesEndRef} />
          </div>

          {/* ─── Giriş Alanı (Mesaj Yazma) ───────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-3 border-t
                       border-slate-200 dark:border-slate-700
                       bg-white dark:bg-slate-800"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir soru yazın..."
              maxLength={500}
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl
                         bg-slate-100 dark:bg-slate-900
                         text-slate-800 dark:text-slate-100
                         placeholder:text-slate-400
                         border border-transparent
                         focus:outline-none focus:border-primary-500
                         focus:ring-2 focus:ring-primary-500/20
                         transition-all"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Mesajı gönder"
              className="flex-shrink-0 w-11 h-11 rounded-xl
                         bg-gradient-to-br from-primary-600 to-accent-600 text-white
                         flex items-center justify-center
                         transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
                         disabled:opacity-40 disabled:cursor-not-allowed
                         disabled:hover:translate-y-0 disabled:hover:shadow-none
                         focus:outline-none focus:ring-4 focus:ring-primary-500/30"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
