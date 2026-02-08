'use client'

import { motion } from 'framer-motion'
import { Calendar, ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
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
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-[var(--text-primary)]">
              Regulamin <span className="text-emerald-500">Serwisu</span>
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
                
                {/* §1 Definicje */}
                <section>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§1. Definicje</h2>
                  <p>Użyte w niniejszym Regulaminie pojęcia oznaczają:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li><strong>Usługodawca / Administrator</strong> – Akademia Rozwoju EDUCRAFT Hubert Samek (marka Rezerwacja24.pl) z siedzibą w Krakowie, ul. Lipowa 3d, 30-702 Kraków, NIP: 5130303581, REGON: 542003444;</li>
                    <li><strong>Serwis</strong> – serwis internetowy dostępny pod adresem rezerwacja24.pl oraz app.rezerwacja24.pl, umożliwiający korzystanie z Usług;</li>
                    <li><strong>Usługi</strong> – usługi świadczone drogą elektroniczną przez Usługodawcę na rzecz Użytkowników, obejmujące w szczególności system zarządzania rezerwacjami online;</li>
                    <li><strong>Użytkownik</strong> – osoba fizyczna prowadząca działalność gospodarczą, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, która korzysta z Usług;</li>
                    <li><strong>Klient Końcowy</strong> – osoba fizyczna dokonująca rezerwacji u Użytkownika za pośrednictwem systemu Rezerwacja24;</li>
                    <li><strong>Konto</strong> – indywidualne konto Użytkownika w Serwisie, chronione loginem i hasłem;</li>
                    <li><strong>Umowa</strong> – umowa o świadczenie Usług zawarta pomiędzy Usługodawcą a Użytkownikiem;</li>
                    <li><strong>Okres Próbny</strong> – bezpłatny okres korzystania z Usług wynoszący 7 dni od daty rejestracji;</li>
                    <li><strong>Abonament</strong> – opłata za korzystanie z Usług w określonym okresie rozliczeniowym;</li>
                    <li><strong>Regulamin</strong> – niniejszy dokument określający zasady korzystania z Serwisu.</li>
                  </ol>
                </section>

              {/* §2 Postanowienia ogólne */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§2. Postanowienia ogólne</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Niniejszy Regulamin określa zasady świadczenia Usług drogą elektroniczną przez Usługodawcę.</li>
                  <li>Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu oraz Polityki Prywatności.</li>
                  <li>Usługi przeznaczone są wyłącznie dla przedsiębiorców w rozumieniu art. 43¹ Kodeksu cywilnego. Użytkownik oświadcza, że korzysta z Usług w związku z prowadzoną działalnością gospodarczą lub zawodową.</li>
                  <li>Usługodawca świadczy Usługi zgodnie z Regulaminem oraz obowiązującymi przepisami prawa.</li>
                  <li>Wymagania techniczne niezbędne do korzystania z Serwisu:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>urządzenie z dostępem do Internetu;</li>
                      <li>aktualna przeglądarka internetowa (Chrome, Firefox, Safari, Edge);</li>
                      <li>aktywne konto e-mail;</li>
                      <li>włączona obsługa JavaScript i cookies.</li>
                    </ul>
                  </li>
                </ol>
              </section>

              {/* §3 Rejestracja i Konto */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§3. Rejestracja i Konto</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Korzystanie z pełnej funkcjonalności Serwisu wymaga utworzenia Konta.</li>
                  <li>Rejestracja wymaga podania prawdziwych i aktualnych danych, w tym:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>imienia i nazwiska lub nazwy firmy;</li>
                      <li>adresu e-mail;</li>
                      <li>numeru telefonu;</li>
                      <li>danych do faktury (NIP, adres) – w przypadku przedsiębiorców.</li>
                    </ul>
                  </li>
                  <li>Użytkownik zobowiązuje się do:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>podawania prawdziwych i aktualnych danych;</li>
                      <li>niezwłocznego aktualizowania danych w przypadku ich zmiany;</li>
                      <li>zachowania poufności hasła do Konta;</li>
                      <li>nieudostępniania Konta osobom trzecim;</li>
                      <li>niezwłocznego informowania Usługodawcy o nieautoryzowanym dostępie do Konta.</li>
                    </ul>
                  </li>
                  <li>Użytkownik ponosi pełną odpowiedzialność za działania podejmowane z wykorzystaniem jego Konta.</li>
                  <li>Usługodawca zastrzega sobie prawo do odmowy rejestracji lub usunięcia Konta w przypadku naruszenia Regulaminu.</li>
                </ol>
              </section>

              {/* §4 Zakres Usług */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§4. Zakres Usług</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Usługodawca udostępnia Użytkownikom system do zarządzania rezerwacjami online, obejmujący w szczególności:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>kalendarz rezerwacji;</li>
                      <li>zarządzanie usługami i cennikiem;</li>
                      <li>zarządzanie pracownikami i ich grafikami;</li>
                      <li>bazę klientów;</li>
                      <li>powiadomienia e-mail i SMS;</li>
                      <li>widget rezerwacyjny do osadzenia na stronie Użytkownika;</li>
                      <li>stronę rezerwacyjną pod subdomeną;</li>
                      <li>raporty i statystyki;</li>
                      <li>integracje z zewnętrznymi systemami.</li>
                    </ul>
                  </li>
                  <li>Szczegółowy zakres funkcjonalności zależy od wybranego planu abonamentowego.</li>
                  <li>Usługodawca zastrzega sobie prawo do modyfikacji zakresu Usług, w tym dodawania nowych funkcjonalności lub modyfikacji istniejących, o czym Użytkownicy zostaną poinformowani.</li>
                  <li>Usługodawca nie gwarantuje nieprzerwanej dostępności Serwisu. Planowane przerwy techniczne będą komunikowane z wyprzedzeniem.</li>
                </ol>
              </section>

              {/* §5 Okres Próbny */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§5. Okres Próbny</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Każdy nowy Użytkownik ma prawo do bezpłatnego Okresu Próbnego wynoszącego 7 dni od daty rejestracji.</li>
                  <li>W Okresie Próbnym Użytkownik ma dostęp do pełnej funkcjonalności Serwisu.</li>
                  <li>Po zakończeniu Okresu Próbnego, w celu dalszego korzystania z Usług, Użytkownik zobowiązany jest do wykupienia Abonamentu.</li>
                  <li>Brak wykupienia Abonamentu po zakończeniu Okresu Próbnego skutkuje ograniczeniem dostępu do Konta. Dane Użytkownika są przechowywane przez okres 30 dni, po czym mogą zostać usunięte.</li>
                  <li>Okres Próbny przysługuje jednokrotnie. Usługodawca zastrzega sobie prawo do odmowy przyznania Okresu Próbnego w przypadku podejrzenia nadużyć.</li>
                </ol>
              </section>

              {/* §6 Płatności */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§6. Płatności i Abonament</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Korzystanie z Usług po zakończeniu Okresu Próbnego wymaga opłacenia Abonamentu.</li>
                  <li>Aktualne ceny Abonamentów dostępne są na stronie Serwisu w zakładce Cennik.</li>
                  <li>Ceny podane są w złotych polskich (PLN) i są cenami brutto. Usługodawca korzysta ze zwolnienia z podatku VAT na podstawie art. 113 ust. 1 ustawy o VAT.</li>
                  <li>Płatności realizowane są za pośrednictwem zewnętrznego operatora płatności. Usługodawca nie przechowuje danych kart płatniczych.</li>
                  <li>Abonament jest płatny z góry za wybrany okres rozliczeniowy (miesięczny lub roczny).</li>
                  <li>W przypadku płatności cyklicznych, Użytkownik wyraża zgodę na automatyczne pobieranie opłat za kolejne okresy rozliczeniowe.</li>
                  <li>Użytkownik może zrezygnować z automatycznego odnawiania Abonamentu w dowolnym momencie. Rezygnacja wchodzi w życie po zakończeniu bieżącego okresu rozliczeniowego.</li>
                  <li>Usługodawca wystawia faktury VAT w formie elektronicznej. Użytkownik wyraża zgodę na otrzymywanie faktur drogą elektroniczną.</li>
                  <li>W przypadku braku płatności w terminie, Usługodawca zastrzega sobie prawo do ograniczenia lub zawieszenia dostępu do Usług.</li>
                </ol>
              </section>

              {/* §7 Zwroty */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§7. Zwroty i reklamacje</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Z uwagi na charakter Usług świadczonych drogą elektroniczną oraz fakt, że Użytkownikami są przedsiębiorcy, prawo odstąpienia od umowy przysługujące konsumentom nie ma zastosowania.</li>
                  <li>Użytkownik może złożyć reklamację dotyczącą Usług drogą elektroniczną na adres: kontakt@rezerwacja24.pl lub pisemnie na adres siedziby Usługodawcy.</li>
                  <li>Reklamacja powinna zawierać:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>dane Użytkownika (imię, nazwisko/nazwa firmy, adres e-mail);</li>
                      <li>opis problemu;</li>
                      <li>oczekiwany sposób rozwiązania.</li>
                    </ul>
                  </li>
                  <li>Usługodawca rozpatruje reklamacje w terminie 14 dni roboczych od daty otrzymania.</li>
                  <li>W uzasadnionych przypadkach (np. awaria Serwisu z winy Usługodawcy trwająca dłużej niż 24 godziny) Usługodawca może przyznać proporcjonalne przedłużenie okresu Abonamentu.</li>
                </ol>
              </section>

              {/* §8 Obowiązki Użytkownika */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§8. Obowiązki i odpowiedzialność Użytkownika</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z jego przeznaczeniem, Regulaminem oraz obowiązującymi przepisami prawa.</li>
                  <li>Użytkownik zobowiązuje się nie:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>podejmować działań mogących zakłócić funkcjonowanie Serwisu;</li>
                      <li>wykorzystywać Serwisu do celów niezgodnych z prawem;</li>
                      <li>przesyłać treści bezprawnych, obraźliwych lub naruszających prawa osób trzecich;</li>
                      <li>podejmować prób nieautoryzowanego dostępu do systemów Usługodawcy;</li>
                      <li>wykorzystywać Serwisu do rozsyłania niezamówionej korespondencji handlowej (spam);</li>
                      <li>odsprzedawać lub udostępniać Usług osobom trzecim bez zgody Usługodawcy.</li>
                    </ul>
                  </li>
                  <li>Użytkownik ponosi pełną odpowiedzialność za:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>treści publikowane w ramach swojego Konta;</li>
                      <li>zgodność prowadzonej działalności z przepisami prawa;</li>
                      <li>uzyskanie odpowiednich zgód od Klientów Końcowych na przetwarzanie ich danych osobowych;</li>
                      <li>informowanie Klientów Końcowych o zasadach przetwarzania ich danych;</li>
                      <li>szkody wyrządzone Usługodawcy lub osobom trzecim w wyniku naruszenia Regulaminu.</li>
                    </ul>
                  </li>
                  <li>Użytkownik jest administratorem danych osobowych swoich Klientów Końcowych w rozumieniu RODO i ponosi z tego tytułu pełną odpowiedzialność.</li>
                </ol>
              </section>

              {/* §9 Odpowiedzialność Usługodawcy */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§9. Odpowiedzialność Usługodawcy</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Usługodawca dokłada wszelkich starań, aby Serwis działał prawidłowo i był dostępny nieprzerwanie.</li>
                  <li>Usługodawca nie ponosi odpowiedzialności za:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>przerwy w dostępie do Serwisu wynikające z przyczyn niezależnych od Usługodawcy (awarie infrastruktury, siła wyższa, działania osób trzecich);</li>
                      <li>szkody wynikające z nieprawidłowego korzystania z Serwisu przez Użytkownika;</li>
                      <li>szkody wynikające z udostępnienia przez Użytkownika danych dostępowych osobom trzecim;</li>
                      <li>treści publikowane przez Użytkowników;</li>
                      <li>działania lub zaniechania Użytkowników wobec ich Klientów Końcowych;</li>
                      <li>utratę danych wynikającą z działań Użytkownika lub osób trzecich;</li>
                      <li>szkody pośrednie, utracone korzyści, utratę przychodów lub zysków;</li>
                      <li>działanie lub niedziałanie zewnętrznych usług i integracji.</li>
                    </ul>
                  </li>
                  <li>Całkowita odpowiedzialność Usługodawcy wobec Użytkownika z tytułu niewykonania lub nienależytego wykonania Umowy jest ograniczona do wysokości opłat uiszczonych przez Użytkownika w okresie ostatnich 12 miesięcy.</li>
                  <li>Ograniczenia odpowiedzialności nie mają zastosowania w przypadku szkód wyrządzonych umyślnie.</li>
                </ol>
              </section>

              {/* §10 Własność intelektualna */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§10. Własność intelektualna</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Serwis, jego struktura, kod źródłowy, grafika, logo, teksty i inne elementy są własnością Usługodawcy i są chronione prawem autorskim oraz innymi przepisami dotyczącymi własności intelektualnej.</li>
                  <li>Użytkownik nie nabywa żadnych praw własności intelektualnej do Serwisu. Uzyskuje jedynie ograniczoną, niewyłączną, niezbywalną licencję na korzystanie z Serwisu zgodnie z jego przeznaczeniem.</li>
                  <li>Zabrania się:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>kopiowania, modyfikowania lub rozpowszechniania elementów Serwisu;</li>
                      <li>dekompilacji, reverse engineeringu lub prób uzyskania kodu źródłowego;</li>
                      <li>wykorzystywania znaków towarowych Usługodawcy bez zgody;</li>
                      <li>tworzenia dzieł pochodnych na podstawie Serwisu.</li>
                    </ul>
                  </li>
                  <li>Użytkownik zachowuje prawa do treści wprowadzanych do Serwisu, udzielając jednocześnie Usługodawcy niewyłącznej licencji na ich przetwarzanie w zakresie niezbędnym do świadczenia Usług.</li>
                </ol>
              </section>

              {/* §11 Powierzenie przetwarzania danych */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§11. Powierzenie przetwarzania danych osobowych</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>W zakresie, w jakim Użytkownik wprowadza do Serwisu dane osobowe swoich Klientów Końcowych, Usługodawca pełni rolę podmiotu przetwarzającego (procesora) w rozumieniu art. 28 RODO.</li>
                  <li>Użytkownik, jako administrator danych Klientów Końcowych, powierza Usługodawcy przetwarzanie tych danych w celu realizacji Usług.</li>
                  <li>Usługodawca zobowiązuje się do:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>przetwarzania danych wyłącznie na udokumentowane polecenie Użytkownika;</li>
                      <li>zapewnienia, że osoby upoważnione do przetwarzania danych zobowiązały się do zachowania poufności;</li>
                      <li>stosowania odpowiednich środków technicznych i organizacyjnych zapewniających bezpieczeństwo danych;</li>
                      <li>wspierania Użytkownika w realizacji obowiązków wynikających z RODO;</li>
                      <li>usunięcia lub zwrotu danych po zakończeniu świadczenia Usług;</li>
                      <li>udostępniania Użytkownikowi informacji niezbędnych do wykazania spełnienia obowiązków.</li>
                    </ul>
                  </li>
                  <li>Usługodawca może korzystać z podwykonawców (sub-procesorów) w zakresie przetwarzania danych. Lista sub-procesorów dostępna jest na żądanie.</li>
                  <li>Użytkownik wyraża ogólną zgodę na korzystanie przez Usługodawcę z sub-procesorów. O zmianach w tym zakresie Użytkownik zostanie poinformowany.</li>
                </ol>
              </section>

              {/* §12 Rozwiązanie umowy */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§12. Rozwiązanie Umowy</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Użytkownik może rozwiązać Umowę w dowolnym momencie poprzez:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>anulowanie subskrypcji w panelu Konta;</li>
                      <li>wysłanie oświadczenia o rozwiązaniu na adres: kontakt@rezerwacja24.pl.</li>
                    </ul>
                  </li>
                  <li>Rozwiązanie Umowy wchodzi w życie z końcem bieżącego okresu rozliczeniowego. Opłacony Abonament nie podlega zwrotowi.</li>
                  <li>Usługodawca może rozwiązać Umowę ze skutkiem natychmiastowym w przypadku:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>rażącego naruszenia Regulaminu przez Użytkownika;</li>
                      <li>wykorzystywania Serwisu do celów niezgodnych z prawem;</li>
                      <li>działań na szkodę Usługodawcy lub innych Użytkowników;</li>
                      <li>braku płatności przez okres dłuższy niż 30 dni.</li>
                    </ul>
                  </li>
                  <li>Po rozwiązaniu Umowy Użytkownik ma możliwość eksportu swoich danych przez okres 30 dni. Po tym okresie dane mogą zostać usunięte.</li>
                  <li>Usługodawca zastrzega sobie prawo do zaprzestania świadczenia Usług z zachowaniem 3-miesięcznego okresu wypowiedzenia. W takim przypadku Użytkownikom przysługuje proporcjonalny zwrot niewykorzystanego Abonamentu.</li>
                </ol>
              </section>

              {/* §13 Zmiany Regulaminu */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§13. Zmiany Regulaminu</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Usługodawca zastrzega sobie prawo do zmiany Regulaminu z ważnych przyczyn, w szczególności:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>zmiany przepisów prawa;</li>
                      <li>zmiany zakresu lub sposobu świadczenia Usług;</li>
                      <li>zmiany warunków technicznych;</li>
                      <li>konieczności dostosowania do orzeczeń sądów lub decyzji organów.</li>
                    </ul>
                  </li>
                  <li>O zmianach Regulaminu Użytkownicy zostaną poinformowani drogą elektroniczną z co najmniej 14-dniowym wyprzedzeniem.</li>
                  <li>Użytkownik, który nie akceptuje zmian Regulaminu, może rozwiązać Umowę przed wejściem zmian w życie.</li>
                  <li>Dalsze korzystanie z Serwisu po wejściu zmian w życie oznacza akceptację nowego Regulaminu.</li>
                </ol>
              </section>

              {/* §14 Postanowienia końcowe */}
              <section>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">§14. Postanowienia końcowe</h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Regulamin wchodzi w życie z dniem publikacji w Serwisie.</li>
                  <li>W sprawach nieuregulowanych Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy o świadczeniu usług drogą elektroniczną.</li>
                  <li>Wszelkie spory wynikające z Umowy będą rozstrzygane przez sąd właściwy dla siedziby Usługodawcy.</li>
                  <li>Jeżeli którekolwiek z postanowień Regulaminu zostanie uznane za nieważne lub niewykonalne, pozostałe postanowienia pozostają w mocy.</li>
                  <li>Brak egzekwowania przez Usługodawcę któregokolwiek z postanowień Regulaminu nie stanowi zrzeczenia się prawa do jego egzekwowania w przyszłości.</li>
                  <li>Regulamin jest dostępny w Serwisie w formie umożliwiającej jego pobranie, utrwalenie i wydrukowanie.</li>
                  <li>Kontakt z Usługodawcą:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>E-mail: <a href="mailto:kontakt@rezerwacja24.pl" className="text-emerald-500 hover:underline">kontakt@rezerwacja24.pl</a></li>
                      <li>Adres: Akademia Rozwoju EDUCRAFT Hubert Samek, ul. Lipowa 3d, 30-702 Kraków</li>
                    </ul>
                  </li>
                </ol>
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
            <Link href="/privacy" className="hover:text-emerald-500 transition-colors">Polityka prywatności</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
