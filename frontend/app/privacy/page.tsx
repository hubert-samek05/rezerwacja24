'use client'

import { motion } from 'framer-motion'
import { Calendar, ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPage() {
  const lastUpdated = '21 grudnia 2024'

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[var(--bg-card)] border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
              <span className="text-lg sm:text-2xl font-bold text-gradient">Rezerwacja24</span>
            </Link>
            
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-[var(--text-secondary)] hover:text-emerald-500 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Powrót</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[var(--text-primary)]">
              Polityka <span className="text-emerald-500">Prywatności</span>
            </h1>
            <p className="text-[var(--text-muted)]">
              Ostatnia aktualizacja: {lastUpdated}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-10 shadow-lg">
              <div className="prose max-w-none space-y-8 text-[var(--text-secondary)]">
              
              {/* 1. Informacje ogólne */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">1. Informacje ogólne</h2>
                <p>
                  Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych 
                  przekazanych przez Użytkowników w związku z korzystaniem z serwisu internetowego 
                  Rezerwacja24 dostępnego pod adresem rezerwacja24.pl (dalej: „Serwis").
                </p>
                <p>
                  Administratorem danych osobowych jest Akademia Rozwoju EDUCRAFT Hubert Samek 
                  (marka Rezerwacja24.pl) z siedzibą w Krakowie, ul. Lipowa 3d, 30-702 Kraków, 
                  NIP: 5130303581, REGON: 542003444 (dalej: „Administrator”).
                </p>
                <p>
                  Administrator dokłada szczególnej staranności w celu ochrony interesów osób, 
                  których dane dotyczą, a w szczególności zapewnia, że zbierane przez niego dane są:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>przetwarzane zgodnie z prawem, rzetelnie i w sposób przejrzysty dla osoby, której dane dotyczą;</li>
                  <li>zbierane w konkretnych, wyraźnych i prawnie uzasadnionych celach i nieprzetwarzane dalej w sposób niezgodny z tymi celami;</li>
                  <li>adekwatne, stosowne oraz ograniczone do tego, co niezbędne do celów, w których są przetwarzane;</li>
                  <li>prawidłowe i w razie potrzeby uaktualniane;</li>
                  <li>przechowywane w formie umożliwiającej identyfikację osoby, której dane dotyczą, przez okres nie dłuższy, niż jest to niezbędne do celów, w których dane te są przetwarzane;</li>
                  <li>przetwarzane w sposób zapewniający odpowiednie bezpieczeństwo danych osobowych.</li>
                </ul>
              </section>

              {/* 2. Podstawa prawna */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">2. Podstawa prawna przetwarzania danych</h2>
                <p>Dane osobowe są przetwarzane zgodnie z:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO);</li>
                  <li>Ustawą z dnia 10 maja 2018 r. o ochronie danych osobowych;</li>
                  <li>Ustawą z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną;</li>
                  <li>Ustawą z dnia 16 lipca 2004 r. Prawo telekomunikacyjne.</li>
                </ul>
              </section>

              {/* 3. Cel i zakres zbierania danych */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">3. Cel i zakres zbierania danych</h2>
                <p>Administrator zbiera i przetwarza dane osobowe w następujących celach:</p>
                
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">3.1. Świadczenie usług (art. 6 ust. 1 lit. b RODO)</h3>
                <p>Dane niezbędne do realizacji umowy o świadczenie usług drogą elektroniczną:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>imię i nazwisko – w celu identyfikacji użytkownika;</li>
                  <li>adres e-mail – w celu komunikacji, wysyłania potwierdzeń, powiadomień systemowych;</li>
                  <li>numer telefonu – w celu kontaktu, wysyłania przypomnień SMS o rezerwacjach;</li>
                  <li>dane firmy (nazwa, NIP, adres) – w celu wystawienia faktury i realizacji usług dla przedsiębiorców;</li>
                  <li>dane dotyczące płatności – w celu realizacji transakcji (przetwarzane przez zewnętrznego operatora płatności).</li>
                </ul>

                <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">3.2. Marketing bezpośredni (art. 6 ust. 1 lit. a RODO)</h3>
                <p>
                  Za wyraźną zgodą Użytkownika, dane mogą być przetwarzane w celu przesyłania informacji 
                  handlowych, newslettera, informacji o promocjach i nowościach. Zgoda może być w każdej 
                  chwili wycofana bez wpływu na zgodność z prawem przetwarzania dokonanego przed jej wycofaniem.
                </p>

                <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">3.3. Realizacja obowiązków prawnych (art. 6 ust. 1 lit. c RODO)</h3>
                <p>
                  Dane są przetwarzane w celu wypełnienia obowiązków prawnych ciążących na Administratorze, 
                  w szczególności obowiązków podatkowych i rachunkowych (przechowywanie faktur przez okres 
                  wymagany przepisami prawa).
                </p>

                <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">3.4. Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO)</h3>
                <p>Dane mogą być przetwarzane w celu:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>dochodzenia lub obrony przed roszczeniami;</li>
                  <li>prowadzenia analiz statystycznych i poprawy jakości usług;</li>
                  <li>zapewnienia bezpieczeństwa systemu informatycznego;</li>
                  <li>przeciwdziałania nadużyciom i oszustwom.</li>
                </ul>
              </section>

              {/* 4. Odbiorcy danych */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">4. Odbiorcy danych osobowych</h2>
                <p>Dane osobowe mogą być przekazywane następującym kategoriom odbiorców:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Operatorzy płatności</strong> – w celu realizacji transakcji płatniczych (np. Stripe, PayU);</li>
                  <li><strong>Dostawcy usług hostingowych</strong> – w celu przechowywania danych na serwerach;</li>
                  <li><strong>Dostawcy usług e-mail</strong> – w celu wysyłania wiadomości e-mail;</li>
                  <li><strong>Dostawcy usług SMS</strong> – w celu wysyłania powiadomień SMS;</li>
                  <li><strong>Dostawcy usług analitycznych</strong> – w celu analizy ruchu na stronie;</li>
                  <li><strong>Organy państwowe</strong> – na podstawie przepisów prawa, na żądanie uprawnionych organów;</li>
                  <li><strong>Klienci Serwisu (przedsiębiorcy)</strong> – w zakresie danych ich klientów końcowych, którzy dokonują rezerwacji.</li>
                </ul>
                <p className="mt-4">
                  Administrator nie przekazuje danych osobowych do państw trzecich (poza Europejski Obszar Gospodarczy), 
                  chyba że jest to niezbędne do realizacji usługi i odbywa się na podstawie odpowiednich zabezpieczeń 
                  prawnych (np. standardowe klauzule umowne zatwierdzone przez Komisję Europejską).
                </p>
              </section>

              {/* 5. Okres przechowywania */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">5. Okres przechowywania danych</h2>
                <p>Dane osobowe są przechowywane przez okres:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Dane konta użytkownika</strong> – przez okres korzystania z usługi oraz przez 3 lata od jej zakończenia (w celu obrony przed ewentualnymi roszczeniami);</li>
                  <li><strong>Dane rozliczeniowe i faktury</strong> – przez okres 5 lat od końca roku podatkowego, w którym powstał obowiązek podatkowy;</li>
                  <li><strong>Dane marketingowe</strong> – do czasu wycofania zgody lub wniesienia sprzeciwu;</li>
                  <li><strong>Dane z formularza kontaktowego</strong> – przez okres niezbędny do udzielenia odpowiedzi i ewentualnego dochodzenia roszczeń;</li>
                  <li><strong>Logi systemowe</strong> – przez okres 12 miesięcy w celach bezpieczeństwa.</li>
                </ul>
              </section>

              {/* 6. Prawa użytkowników */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">6. Prawa osób, których dane dotyczą</h2>
                <p>Każda osoba, której dane dotyczą, ma prawo do:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Dostępu do danych</strong> (art. 15 RODO) – uzyskania informacji o przetwarzanych danych oraz kopii danych;</li>
                  <li><strong>Sprostowania danych</strong> (art. 16 RODO) – żądania poprawienia nieprawidłowych lub uzupełnienia niekompletnych danych;</li>
                  <li><strong>Usunięcia danych</strong> (art. 17 RODO) – żądania usunięcia danych („prawo do bycia zapomnianym"), gdy dane nie są już niezbędne, zgoda została wycofana, wniesiono sprzeciw lub dane były przetwarzane niezgodnie z prawem;</li>
                  <li><strong>Ograniczenia przetwarzania</strong> (art. 18 RODO) – żądania ograniczenia przetwarzania danych w określonych przypadkach;</li>
                  <li><strong>Przenoszenia danych</strong> (art. 20 RODO) – otrzymania danych w ustrukturyzowanym formacie i przekazania ich innemu administratorowi;</li>
                  <li><strong>Sprzeciwu</strong> (art. 21 RODO) – wniesienia sprzeciwu wobec przetwarzania danych na podstawie prawnie uzasadnionego interesu, w tym marketingu bezpośredniego;</li>
                  <li><strong>Wycofania zgody</strong> – w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania dokonanego przed wycofaniem;</li>
                  <li><strong>Skargi do organu nadzorczego</strong> – wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).</li>
                </ul>
                <p className="mt-4">
                  W celu realizacji powyższych praw należy skontaktować się z Administratorem pod adresem: 
                  <a href="mailto:kontakt@rezerwacja24.pl" className="text-emerald-500 hover:underline ml-1">
                    kontakt@rezerwacja24.pl
                  </a>
                </p>
              </section>

              {/* 7. Pliki cookies */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">7. Pliki cookies i technologie śledzące</h2>
                
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">7.1. Czym są pliki cookies?</h3>
                <p>
                  Pliki cookies (ciasteczka) to małe pliki tekstowe zapisywane na urządzeniu Użytkownika 
                  podczas korzystania z Serwisu. Służą one do zapewnienia prawidłowego funkcjonowania 
                  Serwisu, personalizacji treści oraz analizy ruchu.
                </p>

                <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">7.2. Rodzaje wykorzystywanych cookies</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Cookies niezbędne</strong> – konieczne do prawidłowego funkcjonowania Serwisu (np. sesja logowania, koszyk);</li>
                  <li><strong>Cookies funkcjonalne</strong> – zapamiętują preferencje Użytkownika (np. język, region);</li>
                  <li><strong>Cookies analityczne</strong> – zbierają anonimowe informacje o sposobie korzystania z Serwisu;</li>
                  <li><strong>Cookies marketingowe</strong> – służą do wyświetlania spersonalizowanych reklam.</li>
                </ul>

                <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">7.3. Zarządzanie cookies</h3>
                <p>
                  Użytkownik może w każdej chwili zmienić ustawienia dotyczące cookies w swojej przeglądarce 
                  internetowej. Ograniczenie stosowania cookies może wpłynąć na niektóre funkcjonalności Serwisu.
                </p>
              </section>

              {/* 8. Bezpieczeństwo */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">8. Bezpieczeństwo danych</h2>
                <p>Administrator stosuje odpowiednie środki techniczne i organizacyjne zapewniające ochronę danych osobowych, w tym:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>szyfrowanie transmisji danych (SSL/TLS);</li>
                  <li>szyfrowanie danych w spoczynku;</li>
                  <li>regularne kopie zapasowe;</li>
                  <li>kontrolę dostępu do systemów;</li>
                  <li>monitoring bezpieczeństwa;</li>
                  <li>szkolenia pracowników z zakresu ochrony danych;</li>
                  <li>procedury reagowania na incydenty bezpieczeństwa.</li>
                </ul>
              </section>

              {/* 9. Przetwarzanie danych klientów końcowych */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">9. Przetwarzanie danych klientów końcowych</h2>
                <p>
                  W przypadku przedsiębiorców korzystających z Serwisu w celu zarządzania rezerwacjami swoich klientów:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Przedsiębiorca jest administratorem danych osobowych swoich klientów końcowych;</li>
                  <li>Rezerwacja24 pełni rolę podmiotu przetwarzającego (procesora) w rozumieniu art. 28 RODO;</li>
                  <li>Zasady przetwarzania danych określa Umowa Powierzenia Przetwarzania Danych Osobowych, stanowiąca część Regulaminu;</li>
                  <li>Przedsiębiorca jest odpowiedzialny za uzyskanie odpowiednich zgód od swoich klientów oraz informowanie ich o przetwarzaniu danych.</li>
                </ul>
              </section>

              {/* 10. Zmiany polityki */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">10. Zmiany Polityki Prywatności</h2>
                <p>
                  Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. 
                  O istotnych zmianach Użytkownicy zostaną poinformowani drogą elektroniczną lub poprzez 
                  komunikat w Serwisie. Dalsze korzystanie z Serwisu po wprowadzeniu zmian oznacza ich akceptację.
                </p>
              </section>

              {/* 11. Kontakt */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">11. Kontakt w sprawach ochrony danych</h2>
                <p>W sprawach związanych z ochroną danych osobowych można kontaktować się:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>E-mail: <a href="mailto:kontakt@rezerwacja24.pl" className="text-emerald-500 hover:underline">kontakt@rezerwacja24.pl</a></li>
                  <li>Adres korespondencyjny: Akademia Rozwoju EDUCRAFT Hubert Samek, ul. Lipowa 3d, 30-702 Kraków</li>
                </ul>
              </section>

              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-sm text-[var(--text-muted)]">
          <p>&copy; 2024 Rezerwacja24. Wszystkie prawa zastrzeżone.</p>
          <div className="mt-4 space-x-4">
            <Link href="/contact" className="hover:text-emerald-500 transition-colors">Kontakt</Link>
            <Link href="/terms" className="hover:text-emerald-500 transition-colors">Regulamin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
