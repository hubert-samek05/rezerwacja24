'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function TermsPage() {
  const lastUpdated = '22 lutego 2025'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation - spójne z główną stroną */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png"
                alt="Rezerwacja24" 
                width={200} 
                height={60} 
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </Link>
            
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-teal-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Powrót do strony głównej</span>
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
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-gray-900">
              Regulamin <span className="text-teal-700">Serwisu</span>
            </h1>
            <p className="text-gray-500 text-lg">
              Ostatnia aktualizacja: {lastUpdated}
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-xl">
              <div className="prose max-w-none space-y-8 text-gray-700">
                
                {/* §1 Definicje */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§1</span>
                    Definicje
                  </h2>
                  <p>Użyte w niniejszym Regulaminie pojęcia oznaczają:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li><strong>Usługodawca / Administrator</strong> – Akademia Rozwoju EDUCRAFT Hubert Samek (marka Rezerwacja24.pl) z siedzibą w Krakowie, ul. Lipowa 3d, 30-702 Kraków, NIP: 5130303581, REGON: 542003444;</li>
                    <li><strong>Serwis</strong> – serwis internetowy dostępny pod adresem rezerwacja24.pl oraz app.rezerwacja24.pl, umożliwiający korzystanie z Usług;</li>
                    <li><strong>Usługi</strong> – usługi świadczone drogą elektroniczną przez Usługodawcę na rzecz Użytkowników, polegające wyłącznie na udostępnianiu oprogramowania w modelu SaaS (Software as a Service) do zarządzania rezerwacjami online;</li>
                    <li><strong>Użytkownik</strong> – osoba fizyczna prowadząca działalność gospodarczą, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, która korzysta z Usług;</li>
                    <li><strong>Klient Końcowy</strong> – osoba fizyczna dokonująca rezerwacji u Użytkownika za pośrednictwem systemu Rezerwacja24;</li>
                    <li><strong>Konto</strong> – indywidualne konto Użytkownika w Serwisie, chronione loginem i hasłem;</li>
                    <li><strong>Umowa</strong> – umowa o świadczenie Usług zawarta pomiędzy Usługodawcą a Użytkownikiem;</li>
                    <li><strong>Okres Próbny</strong> – bezpłatny okres korzystania z Usług wynoszący 7 dni od daty rejestracji;</li>
                    <li><strong>Abonament</strong> – opłata za korzystanie z Usług w określonym okresie rozliczeniowym;</li>
                    <li><strong>Oprogramowanie SaaS</strong> – oprogramowanie udostępniane przez Usługodawcę w modelu Software as a Service, dostępne przez przeglądarkę internetową bez konieczności instalacji;</li>
                    <li><strong>Regulamin</strong> – niniejszy dokument określający zasady korzystania z Serwisu.</li>
                  </ol>
                </section>

              {/* §2 Postanowienia ogólne */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§2</span>
                  Postanowienia ogólne
                </h2>
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

              {/* §3 Charakter Platformy i Wyłączenie Odpowiedzialności */}
              <section className="border-2 border-gray-300 rounded-xl p-6 -mx-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§3</span>
                  Charakter Platformy i Wyłączenie Odpowiedzialności
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <p className="font-semibold text-gray-800 mb-2">WAŻNE OŚWIADCZENIE:</p>
                  <p className="text-gray-700">Usługodawca świadczy wyłącznie usługę udostępniania oprogramowania (SaaS) i nie jest stroną jakichkolwiek transakcji zawieranych między Użytkownikami a ich Klientami Końcowymi.</p>
                </div>
                <ol className="list-decimal pl-6 space-y-3">
                  <li><strong>Usługodawca świadczy wyłącznie usługę udostępniania oprogramowania</strong> w modelu SaaS (Software as a Service), umożliwiającego Użytkownikom samodzielne zarządzanie rezerwacjami w ramach prowadzonej przez nich działalności gospodarczej.</li>
                  <li><strong>Usługodawca nie jest stroną transakcji</strong> zawieranych między Użytkownikami a Klientami Końcowymi. Wszelkie umowy o świadczenie usług, sprzedaż towarów lub inne zobowiązania powstające w wyniku rezerwacji dokonanych za pośrednictwem Serwisu są zawierane wyłącznie między Użytkownikiem a Klientem Końcowym.</li>
                  <li><strong>Usługodawca nie pośredniczy w transakcjach</strong> między Użytkownikami a Klientami Końcowymi i nie uczestniczy w żadnym etapie realizacji usług świadczonych przez Użytkowników.</li>
                  <li><strong>Usługodawca nie pobiera prowizji</strong> od transakcji zawieranych między Użytkownikami a Klientami Końcowymi. Jedynym wynagrodzeniem Usługodawcy jest Abonament za korzystanie z Oprogramowania SaaS.</li>
                  <li><strong>Usługodawca nie kontroluje i nie weryfikuje</strong> jakości, legalności, bezpieczeństwa ani zgodności z opisem usług świadczonych przez Użytkowników na rzecz Klientów Końcowych.</li>
                  <li><strong>Użytkownik ponosi wyłączną odpowiedzialność</strong> za:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>treść i prawidłowość informacji publikowanych w systemie rezerwacyjnym;</li>
                      <li>realizację rezerwacji i świadczenie usług na rzecz Klientów Końcowych;</li>
                      <li>rozliczenia finansowe z Klientami Końcowymi;</li>
                      <li>rozpatrywanie reklamacji Klientów Końcowych;</li>
                      <li>zgodność prowadzonej działalności z obowiązującymi przepisami prawa;</li>
                      <li>posiadanie wymaganych zezwoleń, licencji i ubezpieczeń.</li>
                    </ul>
                  </li>
                  <li><strong>Serwis stanowi wyłącznie narzędzie techniczne</strong> ułatwiające Użytkownikom organizację pracy i zarządzanie rezerwacjami, nie zaś platformę pośrednictwa w świadczeniu usług.</li>
                </ol>
              </section>

              {/* §4 Wyłączenie z zakresu Dyrektywy DAC7 */}
              <section className="border-2 border-gray-300 rounded-xl p-6 -mx-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§4</span>
                  Wyłączenie z zakresu Dyrektywy DAC7
                </h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Usługodawca oświadcza, że Serwis <strong>nie stanowi platformy</strong> w rozumieniu Dyrektywy Rady (UE) 2021/514 z dnia 22 marca 2021 r. (DAC7) oraz implementujących ją przepisów krajowych.</li>
                  <li>Usługodawca <strong>nie jest operatorem platformy</strong> w rozumieniu przepisów DAC7, ponieważ:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>nie umożliwia sprzedawcom nawiązywania kontaktu z innymi użytkownikami w celu wykonywania czynności istotnych;</li>
                      <li>nie pobiera prowizji ani wynagrodzenia od transakcji zawieranych między Użytkownikami a Klientami Końcowymi;</li>
                      <li>nie pośredniczy w płatnościach między Użytkownikami a Klientami Końcowymi;</li>
                      <li>świadczy wyłącznie usługę licencji na oprogramowanie SaaS.</li>
                    </ul>
                  </li>
                  <li>Serwis służy wyłącznie jako <strong>narzędzie do zarządzania własną działalnością</strong> Użytkownika (kalendarz, CRM, powiadomienia), a nie jako platforma łącząca sprzedawców z kupującymi.</li>
                  <li>W związku z powyższym, Usługodawca <strong>nie jest zobowiązany</strong> do:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>gromadzenia i raportowania informacji o Użytkownikach do organów podatkowych w ramach DAC7;</li>
                      <li>weryfikacji tożsamości Użytkowników w zakresie wymaganym przez DAC7;</li>
                      <li>przekazywania danych o transakcjach do Szefa Krajowej Administracji Skarbowej.</li>
                    </ul>
                  </li>
                  <li>Użytkownik przyjmuje do wiadomości, że <strong>samodzielnie odpowiada</strong> za wypełnianie swoich obowiązków podatkowych i sprawozdawczych wynikających z prowadzonej działalności gospodarczej.</li>
                </ol>
              </section>

              {/* §5 Rejestracja i Konto */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§5</span>
                  Rejestracja i Konto
                </h2>
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

              {/* §6 Zakres Usług */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§6</span>
                  Zakres Usług
                </h2>
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

              {/* §7 Okres Próbny */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§7</span>
                  Okres Próbny
                </h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Każdy nowy Użytkownik ma prawo do bezpłatnego Okresu Próbnego wynoszącego 7 dni od daty rejestracji.</li>
                  <li>W Okresie Próbnym Użytkownik ma dostęp do pełnej funkcjonalności Serwisu.</li>
                  <li>Po zakończeniu Okresu Próbnego, w celu dalszego korzystania z Usług, Użytkownik zobowiązany jest do wykupienia Abonamentu.</li>
                  <li>Brak wykupienia Abonamentu po zakończeniu Okresu Próbnego skutkuje ograniczeniem dostępu do Konta. Dane Użytkownika są przechowywane przez okres 30 dni, po czym mogą zostać usunięte.</li>
                  <li>Okres Próbny przysługuje jednokrotnie. Usługodawca zastrzega sobie prawo do odmowy przyznania Okresu Próbnego w przypadku podejrzenia nadużyć.</li>
                </ol>
              </section>

              {/* §8 Płatności */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§8</span>
                  Płatności i Abonament
                </h2>
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

              {/* §9 Zwroty */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§9</span>
                  Zwroty i reklamacje
                </h2>
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

              {/* §10 Obowiązki Użytkownika */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§10</span>
                  Obowiązki i odpowiedzialność Użytkownika
                </h2>
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

              {/* §11 Odpowiedzialność Usługodawcy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§11</span>
                  Odpowiedzialność Usługodawcy
                </h2>
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

              {/* §12 Własność intelektualna */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§12</span>
                  Własność intelektualna
                </h2>
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

              {/* §13 Powierzenie przetwarzania danych */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§13</span>
                  Powierzenie przetwarzania danych osobowych
                </h2>
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

              {/* §14 Rozwiązanie umowy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§14</span>
                  Rozwiązanie Umowy
                </h2>
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

              {/* §15 Zmiany Regulaminu */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§15</span>
                  Zmiany Regulaminu
                </h2>
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

              {/* §16 Postanowienia końcowe */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§16</span>
                  Postanowienia końcowe
                </h2>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>Regulamin wchodzi w życie z dniem publikacji w Serwisie.</li>
                  <li>W sprawach nieuregulowanych Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy o świadczeniu usług drogą elektroniczną.</li>
                  <li>Wszelkie spory wynikające z Umowy będą rozstrzygane przez sąd właściwy dla siedziby Usługodawcy.</li>
                  <li>Jeżeli którekolwiek z postanowień Regulaminu zostanie uznane za nieważne lub niewykonalne, pozostałe postanowienia pozostają w mocy.</li>
                  <li>Brak egzekwowania przez Usługodawcę któregokolwiek z postanowień Regulaminu nie stanowi zrzeczenia się prawa do jego egzekwowania w przyszłości.</li>
                  <li>Regulamin jest dostępny w Serwisie w formie umożliwiającej jego pobranie, utrwalenie i wydrukowanie.</li>
                  <li>Kontakt z Usługodawcą:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>E-mail: <a href="mailto:kontakt@rezerwacja24.pl" className="text-teal-600 hover:underline font-medium">kontakt@rezerwacja24.pl</a></li>
                      <li>Adres: Akademia Rozwoju EDUCRAFT Hubert Samek, ul. Lipowa 3d, 30-702 Kraków</li>
                    </ul>
                  </li>
                </ol>
              </section>

                {/* Link do regulaminu dla klientów */}
                <section className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600 mb-3">Jesteś klientem i chcesz poznać zasady rezerwacji?</p>
                  <Link href="/terms/customer" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                    Zobacz Regulamin dla Klientów →
                  </Link>
                </section>

              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer - spójny z główną stroną */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Image 
            src="/logo.png"
            alt="Rezerwacja24" 
            width={150} 
            height={45} 
            className="h-8 w-auto mx-auto mb-4"
          />
          <p className="text-sm text-gray-500 mb-4">&copy; 2025 Rezerwacja24. Wszystkie prawa zastrzeżone.</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/contact" className="text-gray-600 hover:text-teal-700 transition-colors font-medium">Kontakt</Link>
            <Link href="/privacy" className="text-gray-600 hover:text-teal-700 transition-colors font-medium">Polityka prywatności</Link>
            <Link href="/terms/customer" className="text-gray-600 hover:text-teal-700 transition-colors font-medium">Regulamin dla klientów</Link>
            <Link href="/" className="text-gray-600 hover:text-teal-700 transition-colors font-medium">Strona główna</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
