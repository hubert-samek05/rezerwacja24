'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CustomerTermsPage() {
  const lastUpdated = '22 lutego 2025'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
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
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-gray-900">
              Regulamin dla <span className="text-teal-700">Klientów</span>
            </h1>
            <p className="text-gray-500 text-lg">
              Zasady korzystania z systemu rezerwacji online
            </p>
            <p className="text-gray-400 mt-2">
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
                
                {/* Wstęp */}
                <section className="border-2 border-gray-300 rounded-xl p-6 -mx-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">!</span>
                    Informacja wstępna
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700">
                      Niniejszy regulamin określa zasady korzystania z systemu rezerwacji online Rezerwacja24 przez osoby dokonujące rezerwacji usług u firm korzystających z naszego oprogramowania. 
                      <strong className="block mt-2">Rezerwacja24 jest wyłącznie dostawcą oprogramowania i nie jest stroną umów zawieranych między Tobą a firmą, u której dokonujesz rezerwacji.</strong>
                    </p>
                  </div>
                </section>

                {/* §1 Definicje */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§1</span>
                    Definicje
                  </h2>
                  <p>Użyte w niniejszym Regulaminie pojęcia oznaczają:</p>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li><strong>Rezerwacja24 / Operator</strong> – Akademia Rozwoju EDUCRAFT Hubert Samek z siedzibą w Krakowie, ul. Lipowa 3d, 30-702 Kraków, NIP: 5130303581, będący dostawcą oprogramowania do zarządzania rezerwacjami;</li>
                    <li><strong>System</strong> – oprogramowanie Rezerwacja24 umożliwiające dokonywanie rezerwacji online;</li>
                    <li><strong>Usługodawca</strong> – firma lub osoba prowadząca działalność gospodarczą, która korzysta z Systemu do przyjmowania rezerwacji od Klientów;</li>
                    <li><strong>Klient</strong> – osoba fizyczna dokonująca rezerwacji usługi u Usługodawcy za pośrednictwem Systemu;</li>
                    <li><strong>Rezerwacja</strong> – zamówienie usługi u Usługodawcy dokonane za pośrednictwem Systemu;</li>
                    <li><strong>Regulamin</strong> – niniejszy dokument.</li>
                  </ol>
                </section>

                {/* §2 Charakter Systemu */}
                <section className="border-2 border-gray-300 rounded-xl p-6 -mx-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§2</span>
                    Charakter Systemu Rezerwacja24
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li><strong>Rezerwacja24 jest wyłącznie dostawcą oprogramowania</strong> (Software as a Service) umożliwiającego Usługodawcom zarządzanie rezerwacjami. Rezerwacja24 nie świadczy usług oferowanych przez Usługodawców.</li>
                    <li><strong>Rezerwacja24 nie jest stroną umowy</strong> zawieranej między Klientem a Usługodawcą. Wszelkie zobowiązania wynikające z rezerwacji powstają wyłącznie między Klientem a Usługodawcą.</li>
                    <li><strong>Rezerwacja24 nie ponosi odpowiedzialności</strong> za:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>jakość, terminowość lub sposób wykonania usług przez Usługodawcę;</li>
                        <li>prawdziwość i aktualność informacji publikowanych przez Usługodawcę;</li>
                        <li>ceny usług ustalane przez Usługodawcę;</li>
                        <li>politykę anulowania rezerwacji stosowaną przez Usługodawcę;</li>
                        <li>wszelkie spory między Klientem a Usługodawcą.</li>
                      </ul>
                    </li>
                    <li><strong>Rezerwacja24 nie pobiera opłat od Klientów</strong> za korzystanie z Systemu rezerwacji. Ewentualne opłaty za usługi są pobierane bezpośrednio przez Usługodawcę.</li>
                  </ol>
                </section>

                {/* §3 Dokonywanie rezerwacji */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§3</span>
                    Dokonywanie rezerwacji
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>Dokonanie rezerwacji wymaga podania danych kontaktowych (imię, nazwisko, numer telefonu, adres e-mail) niezbędnych do realizacji rezerwacji.</li>
                    <li>Klient zobowiązuje się do podawania prawdziwych i aktualnych danych.</li>
                    <li>Dokonanie rezerwacji oznacza:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>akceptację niniejszego Regulaminu;</li>
                        <li>akceptację regulaminu i warunków świadczenia usług danego Usługodawcy;</li>
                        <li>zgodę na przetwarzanie danych osobowych przez Usługodawcę w celu realizacji rezerwacji.</li>
                      </ul>
                    </li>
                    <li>Po dokonaniu rezerwacji Klient otrzymuje potwierdzenie na podany adres e-mail i/lub numer telefonu (SMS).</li>
                    <li>Klient może otrzymywać przypomnienia o zbliżającym się terminie rezerwacji.</li>
                  </ol>
                </section>

                {/* §4 Anulowanie i zmiana rezerwacji */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§4</span>
                    Anulowanie i zmiana rezerwacji
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>Zasady anulowania i zmiany rezerwacji są ustalane indywidualnie przez każdego Usługodawcę.</li>
                    <li>Klient powinien zapoznać się z polityką anulowania rezerwacji danego Usługodawcy przed dokonaniem rezerwacji.</li>
                    <li>Anulowanie lub zmiana rezerwacji może być możliwa:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>poprzez link w wiadomości e-mail z potwierdzeniem rezerwacji;</li>
                        <li>poprzez bezpośredni kontakt z Usługodawcą;</li>
                        <li>poprzez panel klienta (jeśli jest dostępny).</li>
                      </ul>
                    </li>
                    <li>Usługodawca może stosować opłaty za późne anulowanie rezerwacji lub niestawienie się na wizytę. Rezerwacja24 nie ma wpływu na te opłaty.</li>
                  </ol>
                </section>

                {/* §5 Płatności */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§5</span>
                    Płatności
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>Płatności za usługi są dokonywane bezpośrednio na rzecz Usługodawcy, nie na rzecz Rezerwacja24.</li>
                    <li>Usługodawca może wymagać:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>płatności z góry (online) przy dokonywaniu rezerwacji;</li>
                        <li>wpłaty zaliczki;</li>
                        <li>płatności na miejscu po wykonaniu usługi.</li>
                      </ul>
                    </li>
                    <li>Płatności online są realizowane przez zewnętrznych operatorów płatności (np. Stripe, PayU). Rezerwacja24 nie przechowuje danych kart płatniczych.</li>
                    <li>Wszelkie reklamacje dotyczące płatności należy kierować bezpośrednio do Usługodawcy.</li>
                  </ol>
                </section>

                {/* §6 Reklamacje */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§6</span>
                    Reklamacje
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li><strong>Reklamacje dotyczące usług</strong> świadczonych przez Usługodawcę (jakość, terminowość, cena, itp.) należy kierować bezpośrednio do Usługodawcy. Rezerwacja24 nie rozpatruje takich reklamacji.</li>
                    <li><strong>Reklamacje dotyczące działania Systemu</strong> (błędy techniczne, problemy z dokonaniem rezerwacji) można zgłaszać na adres: <a href="mailto:kontakt@rezerwacja24.pl" className="text-teal-600 hover:underline font-medium">kontakt@rezerwacja24.pl</a>.</li>
                    <li>Reklamacja dotycząca Systemu powinna zawierać:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>opis problemu;</li>
                        <li>datę i godzinę wystąpienia problemu;</li>
                        <li>nazwę Usługodawcy, u którego dokonywano rezerwacji;</li>
                        <li>dane kontaktowe zgłaszającego.</li>
                      </ul>
                    </li>
                    <li>Reklamacje dotyczące Systemu są rozpatrywane w terminie 14 dni.</li>
                  </ol>
                </section>

                {/* §7 Ochrona danych osobowych */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§7</span>
                    Ochrona danych osobowych
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li><strong>Administratorem danych osobowych Klienta</strong> jest Usługodawca, u którego Klient dokonuje rezerwacji. To Usługodawca decyduje o celach i sposobach przetwarzania danych.</li>
                    <li><strong>Rezerwacja24 przetwarza dane Klienta</strong> wyłącznie jako podmiot przetwarzający (procesor) na zlecenie Usługodawcy, w zakresie niezbędnym do świadczenia usługi oprogramowania.</li>
                    <li>Dane osobowe Klienta są przetwarzane w celu:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>realizacji rezerwacji;</li>
                        <li>wysyłania potwierdzeń i przypomnień;</li>
                        <li>kontaktu w sprawie rezerwacji;</li>
                        <li>prowadzenia historii wizyt (przez Usługodawcę).</li>
                      </ul>
                    </li>
                    <li>Klient ma prawo do:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>dostępu do swoich danych;</li>
                        <li>sprostowania danych;</li>
                        <li>usunięcia danych;</li>
                        <li>ograniczenia przetwarzania;</li>
                        <li>przenoszenia danych;</li>
                        <li>wniesienia sprzeciwu.</li>
                      </ul>
                    </li>
                    <li>W celu realizacji praw dotyczących danych osobowych, Klient powinien kontaktować się bezpośrednio z Usługodawcą.</li>
                    <li>Szczegółowe informacje o przetwarzaniu danych przez Rezerwacja24 znajdują się w <Link href="/privacy" className="text-teal-600 hover:underline font-medium">Polityce Prywatności</Link>.</li>
                  </ol>
                </section>

                {/* §8 Obowiązki Klienta */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§8</span>
                    Obowiązki Klienta
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>Klient zobowiązuje się do:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>podawania prawdziwych danych kontaktowych;</li>
                        <li>stawiania się na umówione wizyty punktualnie;</li>
                        <li>informowania Usługodawcy o niemożności stawienia się z odpowiednim wyprzedzeniem;</li>
                        <li>przestrzegania regulaminu Usługodawcy;</li>
                        <li>korzystania z Systemu zgodnie z jego przeznaczeniem.</li>
                      </ul>
                    </li>
                    <li>Zabrania się:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>dokonywania fałszywych rezerwacji;</li>
                        <li>podawania nieprawdziwych danych;</li>
                        <li>podejmowania działań mogących zakłócić działanie Systemu;</li>
                        <li>wykorzystywania Systemu do celów niezgodnych z prawem.</li>
                      </ul>
                    </li>
                  </ol>
                </section>

                {/* §9 Odpowiedzialność */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§9</span>
                    Ograniczenie odpowiedzialności
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>Rezerwacja24 dokłada wszelkich starań, aby System działał prawidłowo i był dostępny nieprzerwanie.</li>
                    <li>Rezerwacja24 nie ponosi odpowiedzialności za:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>działania lub zaniechania Usługodawców;</li>
                        <li>jakość usług świadczonych przez Usługodawców;</li>
                        <li>szkody wynikające z niewykonania lub nienależytego wykonania usług przez Usługodawcę;</li>
                        <li>krótkotrwałe przerwy w dostępności Systemu;</li>
                        <li>skutki podania przez Klienta nieprawdziwych danych.</li>
                      </ul>
                    </li>
                    <li>Wszelkie roszczenia związane z usługami należy kierować bezpośrednio do Usługodawcy.</li>
                  </ol>
                </section>

                {/* §10 Postanowienia końcowe */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-sm font-bold">§10</span>
                    Postanowienia końcowe
                  </h2>
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>Regulamin wchodzi w życie z dniem publikacji.</li>
                    <li>Rezerwacja24 zastrzega sobie prawo do zmiany Regulaminu. Zmiany wchodzą w życie z chwilą publikacji.</li>
                    <li>W sprawach nieuregulowanych Regulaminem zastosowanie mają przepisy prawa polskiego.</li>
                    <li>Klient będący konsumentem może skorzystać z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, w tym z platformy ODR dostępnej pod adresem: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline font-medium">ec.europa.eu/consumers/odr</a>.</li>
                    <li>Kontakt z Rezerwacja24:
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>E-mail: <a href="mailto:kontakt@rezerwacja24.pl" className="text-teal-600 hover:underline font-medium">kontakt@rezerwacja24.pl</a></li>
                        <li>Adres: Akademia Rozwoju EDUCRAFT Hubert Samek, ul. Lipowa 3d, 30-702 Kraków</li>
                      </ul>
                    </li>
                  </ol>
                </section>

                {/* Link do regulaminu dla firm */}
                <section className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600 mb-3">Prowadzisz firmę i chcesz korzystać z systemu Rezerwacja24?</p>
                  <Link href="/terms" className="text-teal-600 hover:text-teal-700 font-semibold hover:underline">
                    Zobacz Regulamin dla Usługodawców →
                  </Link>
                </section>

              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
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
            <Link href="/terms" className="text-gray-600 hover:text-teal-700 transition-colors font-medium">Regulamin dla firm</Link>
            <Link href="/" className="text-gray-600 hover:text-teal-700 transition-colors font-medium">Strona główna</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
