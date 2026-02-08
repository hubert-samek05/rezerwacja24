'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  TrendingUp, 
  Wallet, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Building2,
  Mail,
  Phone,
  User,
  Lock,
  FileText,
  Gift,
  Sparkles,
  BarChart3,
  Shield,
  Clock,
  Zap,
  Star,
  ChevronDown
} from 'lucide-react';

export default function PartnerzyPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
    taxId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/partners/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Błąd rejestracji');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-500/10 p-10 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Dziękujemy!
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Twoja aplikacja partnerska została przesłana. Nasz zespół zweryfikuje Twoje dane 
              i skontaktuje się w ciągu <span className="font-semibold text-emerald-600">24-48 godzin</span>.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all"
            >
              Wróć na stronę główną
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Rezerwacja24</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/partner/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Zaloguj się
            </Link>
            <a 
              href="#formularz"
              className="hidden sm:inline-flex bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
            >
              Dołącz teraz
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-slate-50 via-white to-emerald-50 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Gift className="w-4 h-4" />
              Program Partnerski 2024
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Zarabiaj z
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent"> Rezerwacja24</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Polecaj nasz system rezerwacji salonom beauty i zarabiaj prowizje. 
              Prosta współpraca, przejrzyste warunki, regularne wypłaty.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#formularz"
                className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/20"
              >
                Zostań partnerem
                <ArrowRight className="w-5 h-5" />
              </a>
              <a 
                href="#jak-to-dziala"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all border border-gray-200"
              >
                Dowiedz się więcej
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '50 zł', label: 'za każdego klienta', icon: Wallet },
              { value: '10%', label: 'prowizji recurring', icon: TrendingUp },
              { value: '12 mies.', label: 'okres prowizji', icon: Clock },
              { value: '100 zł', label: 'min. wypłata', icon: BarChart3 },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Dlaczego warto?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Przejrzyste warunki i realne korzyści dla Ciebie i Twoich poleconych
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Wallet,
                title: '50 zł jednorazowo',
                description: 'Za każdą firmę, która opłaci pierwszą subskrypcję po Twoim poleceniu',
                color: 'from-emerald-500 to-teal-500',
              },
              {
                icon: TrendingUp,
                title: '10% recurring',
                description: 'Przez 12 miesięcy od każdej płatności Twojego poleconego klienta',
                color: 'from-blue-500 to-indigo-500',
              },
              {
                icon: Gift,
                title: '20% rabatu dla klientów',
                description: 'Twoi poleceni dostają zniżkę przez pierwsze 3 miesiące',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Zap,
                title: 'Szybkie wypłaty',
                description: 'Przelewy realizujemy w ciągu 7 dni roboczych od zlecenia',
                color: 'from-orange-500 to-amber-500',
              },
              {
                icon: BarChart3,
                title: 'Panel partnera',
                description: 'Śledź statystyki, konwersje i zarobki w czasie rzeczywistym',
                color: 'from-cyan-500 to-blue-500',
              },
              {
                icon: Shield,
                title: 'Wsparcie dedykowane',
                description: 'Materiały marketingowe i pomoc na każdym etapie współpracy',
                color: 'from-rose-500 to-red-500',
              },
            ].map((benefit, index) => (
              <div 
                key={index}
                className="group bg-gray-50 hover:bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 border border-transparent hover:border-gray-100"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="jak-to-dziala" className="py-24 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Jak to działa?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Cztery proste kroki do rozpoczęcia zarabiania
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '01', title: 'Zarejestruj się', description: 'Wypełnij formularz aplikacyjny', icon: User },
              { number: '02', title: 'Otrzymaj link', description: 'Dostaniesz unikalny kod polecający', icon: Gift },
              { number: '03', title: 'Promuj', description: 'Udostępniaj link swoim kontaktom', icon: Users },
              { number: '04', title: 'Zarabiaj', description: 'Otrzymuj prowizje automatycznie', icon: Wallet },
            ].map((step, index) => (
              <div key={index} className="relative">
                {index < 3 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-500 to-transparent -translate-x-4"></div>
                )}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-emerald-400 font-mono text-sm mb-2">{step.number}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-500 rounded-3xl p-10 md:p-14 text-white shadow-2xl shadow-emerald-500/30">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ile możesz zarobić?</h2>
              <p className="text-emerald-100 text-lg">
                Przykład: Polecasz 10 firm płacących średnio 79,99 zł/mies
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
                <div className="text-5xl font-bold mb-2">500 zł</div>
                <div className="text-emerald-100">Jednorazowo</div>
                <div className="text-sm text-emerald-200 mt-2">10 × 50 zł</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/20">
                <div className="text-5xl font-bold mb-2">80 zł</div>
                <div className="text-emerald-100">Miesięcznie</div>
                <div className="text-sm text-emerald-200 mt-2">10% × 799,90 zł</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 text-center border border-white/30 ring-2 ring-white/30">
                <div className="text-5xl font-bold mb-2">1 460 zł</div>
                <div className="text-white font-medium">Rocznie łącznie</div>
                <div className="text-sm text-emerald-200 mt-2">500 + (80 × 12)</div>
              </div>
            </div>
            
            <p className="text-center text-emerald-100 mt-8 text-sm">
              * Rzeczywiste zarobki zależą od liczby poleconych i wybranych przez nich planów
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-50 to-gray-100" id="formularz">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - info */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Dołącz do grona partnerów
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Wypełnij formularz, a nasz zespół skontaktuje się z Tobą w ciągu 24-48 godzin.
              </p>
              
              <div className="space-y-4">
                {[
                  'Bez ukrytych opłat i zobowiązań',
                  'Przejrzyste warunki współpracy',
                  'Dedykowane wsparcie partnera',
                  'Materiały marketingowe gratis',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - form */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nazwa firmy *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Nazwa firmy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imię i nazwisko *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Jan Kowalski"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="email@firma.pl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="+48 123 456 789"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hasło *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="Min. 8 znaków"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIP (opcjonalnie)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.taxId}
                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      Złóż aplikację
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Składając aplikację, akceptujesz{' '}
                  <Link href="/terms" className="text-emerald-600 hover:underline">
                    regulamin programu partnerskiego
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Często zadawane pytania
            </h2>
            <p className="text-xl text-gray-600">
              Wszystko co musisz wiedzieć o programie partnerskim
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: 'Kto może zostać partnerem?',
                a: 'Każda firma lub osoba, która ma kontakt z salonami beauty, fryzjerami, kosmetyczkami. Szczególnie zapraszamy hurtownie kosmetyczne, szkoły zawodowe, influencerów i blogerów z branży beauty.',
              },
              {
                q: 'Kiedy otrzymam wypłatę?',
                a: 'Prowizje są naliczane automatycznie po każdej płatności klienta. Możesz zlecić wypłatę gdy zgromadzisz minimum 100 zł. Przelewy realizujemy w ciągu 7 dni roboczych.',
              },
              {
                q: 'Jak długo ważny jest mój link polecający?',
                a: 'Cookie z Twoim kodem jest ważne 30 dni. Jeśli klient zarejestruje się w tym czasie, zostanie przypisany do Ciebie i będziesz otrzymywać prowizje przez 12 miesięcy.',
              },
              {
                q: 'Czy muszę płacić podatek od prowizji?',
                a: 'Tak, prowizje są przychodem i podlegają opodatkowaniu. Wystawiamy wszystkie niezbędne dokumenty do rozliczenia z urzędem skarbowym.',
              },
              {
                q: 'Jakie materiały marketingowe otrzymam?',
                a: 'Dostaniesz dostęp do banerów, grafik do social media, szablonów e-maili i gotowych tekstów promocyjnych. Wszystko w panelu partnera.',
              },
            ].map((faq, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4"
                >
                  <h3 className="font-semibold text-gray-900 text-lg">{faq.q}</h3>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Gotowy, żeby zacząć zarabiać?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Dołącz do programu partnerskiego i zacznij budować pasywny dochód
          </p>
          <a 
            href="#formularz"
            className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/30"
          >
            Zostań partnerem teraz
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Rezerwacja24</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">Regulamin</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Prywatność</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Kontakt</Link>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 Rezerwacja24
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
