'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { 
  Search,
  Calendar,
  Users,
  CreditCard,
  Bell,
  Shield,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react'

// Dane kategorii i artykułów
const categoriesData: Record<string, {
  title: string
  description: string
  icon: any
  color: string
  articles: Array<{
    id: string
    title: string
    description: string
    readTime: string
    content: string
  }>
}> = {
  'pierwsze-kroki': {
    title: 'Pierwsze kroki',
    description: 'Rozpocznij korzystanie z Rezerwacja24',
    icon: BookOpen,
    color: 'from-teal-500 to-emerald-500',
    articles: [
      {
        id: 'rejestracja-konta',
        title: 'Jak założyć konto klienta',
        description: 'Krok po kroku przez proces rejestracji',
        readTime: '2 min',
        content: `
## Jak założyć konto w Rezerwacja24

### Krok 1: Przejdź do strony rejestracji
Wejdź na stronę rezerwacja24.pl i kliknij przycisk "Panel klienta", a następnie "Zarejestruj się".

### Krok 2: Wypełnij formularz
Podaj następujące dane:
- **Imię i nazwisko** - Twoje dane osobowe
- **Adres e-mail** - będzie służył jako login
- **Hasło** - minimum 8 znaków
- **Numer telefonu** - do powiadomień SMS

### Krok 3: Potwierdź adres e-mail
Na podany adres e-mail otrzymasz link aktywacyjny. Kliknij go, aby aktywować konto.

### Krok 4: Zaloguj się
Po aktywacji możesz się zalogować i zacząć rezerwować wizyty!

### Wskazówki
- Użyj silnego hasła z cyframi i znakami specjalnymi
- Podaj aktualny numer telefonu, aby otrzymywać przypomnienia SMS
- Możesz też zarejestrować się przez Google lub Apple
        `
      },
      {
        id: 'pierwsza-rezerwacja',
        title: 'Jak dokonać pierwszej rezerwacji',
        description: 'Znajdź firmę i zarezerwuj wizytę',
        readTime: '3 min',
        content: `
## Jak dokonać pierwszej rezerwacji

### Krok 1: Znajdź firmę
Na stronie głównej rezerwacja24.pl:
- Wpisz nazwę usługi lub firmy w wyszukiwarce
- Wybierz kategorię (np. Fryzjer, Kosmetyczka)
- Przeglądaj firmy w Twojej okolicy

### Krok 2: Wybierz usługę
Po wejściu na profil firmy:
- Przejrzyj listę dostępnych usług
- Sprawdź ceny i czas trwania
- Kliknij "Zarezerwuj" przy wybranej usłudze

### Krok 3: Wybierz termin
- Wybierz preferowanego pracownika (lub "Dowolny")
- Wybierz datę z kalendarza
- Wybierz dostępną godzinę

### Krok 4: Potwierdź rezerwację
- Sprawdź szczegóły wizyty
- Podaj swoje dane (jeśli nie jesteś zalogowany)
- Kliknij "Potwierdź rezerwację"

### Po rezerwacji
- Otrzymasz SMS i e-mail z potwierdzeniem
- Rezerwacja pojawi się w Twoim panelu klienta
- Dzień przed wizytą otrzymasz przypomnienie
        `
      },
      {
        id: 'panel-klienta',
        title: 'Przegląd panelu klienta',
        description: 'Poznaj funkcje swojego konta',
        readTime: '2 min',
        content: `
## Panel klienta - przegląd

### Logowanie
Zaloguj się na rezerwacja24.pl/logowanie używając:
- E-mail i hasło
- Konto Google
- Konto Apple

### Sekcje panelu

**Moje rezerwacje**
- Lista nadchodzących wizyt
- Historia przeszłych rezerwacji
- Możliwość anulowania lub zmiany terminu

**Ulubione firmy**
- Zapisane firmy dla szybkiego dostępu
- Powiadomienia o promocjach

**Ustawienia konta**
- Edycja danych osobowych
- Zmiana hasła
- Preferencje powiadomień

**Historia płatności**
- Lista transakcji
- Faktury do pobrania
        `
      }
    ]
  },
  'rezerwacje': {
    title: 'Rezerwacje',
    description: 'Tworzenie, edycja i anulowanie wizyt',
    icon: Calendar,
    color: 'from-blue-500 to-indigo-500',
    articles: [
      {
        id: 'jak-zarezerwowac',
        title: 'Jak zarezerwować wizytę',
        description: 'Pełny przewodnik po procesie rezerwacji',
        readTime: '3 min',
        content: `
## Jak zarezerwować wizytę

### Metoda 1: Przez wyszukiwarkę
1. Wejdź na rezerwacja24.pl
2. Wpisz nazwę usługi lub firmy
3. Wybierz firmę z wyników
4. Wybierz usługę, termin i potwierdź

### Metoda 2: Przez katalog
1. Przejdź do "Katalog firm"
2. Wybierz kategorię (np. Fryzjerzy)
3. Przeglądaj firmy i wybierz
4. Zarezerwuj wizytę

### Metoda 3: Przez link firmy
Jeśli firma udostępniła Ci link do rezerwacji:
1. Kliknij w link
2. Wybierz usługę i termin
3. Potwierdź rezerwację

### Wskazówki
- Zaloguj się przed rezerwacją, aby dane wypełniły się automatycznie
- Sprawdź godziny otwarcia firmy
- Przeczytaj opis usługi przed rezerwacją
        `
      },
      {
        id: 'zmiana-terminu',
        title: 'Zmiana terminu rezerwacji',
        description: 'Jak przełożyć wizytę na inny termin',
        readTime: '2 min',
        content: `
## Zmiana terminu rezerwacji

### Przez panel klienta
1. Zaloguj się na swoje konto
2. Przejdź do "Moje rezerwacje"
3. Znajdź rezerwację do zmiany
4. Kliknij "Zmień termin"
5. Wybierz nową datę i godzinę
6. Potwierdź zmianę

### Przez link w SMS/e-mail
1. Kliknij link "Zarządzaj rezerwacją" w wiadomości
2. Wybierz "Zmień termin"
3. Wybierz nowy termin
4. Potwierdź

### Ważne informacje
- Zmiana terminu może być niedostępna na krótko przed wizytą
- Niektóre firmy wymagają kontaktu telefonicznego
- Po zmianie otrzymasz nowe potwierdzenie
        `
      },
      {
        id: 'anulowanie',
        title: 'Anulowanie rezerwacji',
        description: 'Jak odwołać zaplanowaną wizytę',
        readTime: '2 min',
        content: `
## Anulowanie rezerwacji

### Przez panel klienta
1. Zaloguj się na swoje konto
2. Przejdź do "Moje rezerwacje"
3. Znajdź rezerwację do anulowania
4. Kliknij "Anuluj rezerwację"
5. Podaj powód (opcjonalnie)
6. Potwierdź anulowanie

### Przez link w SMS/e-mail
1. Kliknij link "Zarządzaj rezerwacją"
2. Wybierz "Anuluj rezerwację"
3. Potwierdź

### Polityka anulacji
- Bezpłatne anulowanie zwykle do 24h przed wizytą
- Późniejsze anulowanie może wiązać się z opłatą
- Sprawdź politykę konkretnej firmy

### Zwrot płatności
- Jeśli zapłaciłeś z góry, zwrot nastąpi automatycznie
- Czas zwrotu: 3-5 dni roboczych
        `
      }
    ]
  },
  'konto-i-profil': {
    title: 'Konto i profil',
    description: 'Zarządzanie danymi osobowymi',
    icon: Users,
    color: 'from-violet-500 to-purple-500',
    articles: [
      {
        id: 'edycja-profilu',
        title: 'Edycja danych profilu',
        description: 'Jak zmienić swoje dane osobowe',
        readTime: '2 min',
        content: `
## Edycja danych profilu

### Jak edytować profil
1. Zaloguj się na swoje konto
2. Kliknij na swoje imię w prawym górnym rogu
3. Wybierz "Ustawienia"
4. Edytuj potrzebne dane
5. Kliknij "Zapisz zmiany"

### Dane do edycji
- **Imię i nazwisko**
- **Numer telefonu** - ważny dla powiadomień SMS
- **Adres e-mail** - wymaga potwierdzenia
- **Zdjęcie profilowe**

### Zmiana e-maila
1. Wpisz nowy adres e-mail
2. Kliknij "Zapisz"
3. Potwierdź zmianę klikając link w e-mailu
4. Nowy e-mail będzie Twoim loginem
        `
      },
      {
        id: 'zmiana-hasla',
        title: 'Zmiana hasła',
        description: 'Jak zmienić lub zresetować hasło',
        readTime: '2 min',
        content: `
## Zmiana hasła

### Zmiana hasła (gdy jesteś zalogowany)
1. Przejdź do "Ustawienia"
2. Kliknij "Zmień hasło"
3. Wpisz obecne hasło
4. Wpisz nowe hasło (2 razy)
5. Kliknij "Zapisz"

### Reset hasła (gdy nie pamiętasz)
1. Na stronie logowania kliknij "Zapomniałem hasła"
2. Wpisz swój adres e-mail
3. Sprawdź skrzynkę e-mail
4. Kliknij link resetujący
5. Ustaw nowe hasło

### Wymagania hasła
- Minimum 8 znaków
- Przynajmniej jedna wielka litera
- Przynajmniej jedna cyfra
- Zalecany znak specjalny
        `
      },
      {
        id: 'usuwanie-konta',
        title: 'Usuwanie konta',
        description: 'Jak trwale usunąć swoje konto',
        readTime: '2 min',
        content: `
## Usuwanie konta

### Przed usunięciem
- Anuluj wszystkie nadchodzące rezerwacje
- Pobierz historię wizyt (jeśli potrzebujesz)
- Pamiętaj, że operacja jest nieodwracalna

### Jak usunąć konto
1. Zaloguj się na swoje konto
2. Przejdź do "Ustawienia"
3. Przewiń na dół strony
4. Kliknij "Usuń konto"
5. Wpisz hasło dla potwierdzenia
6. Potwierdź usunięcie

### Co się stanie
- Wszystkie Twoje dane zostaną usunięte
- Historia rezerwacji zostanie zanonimizowana
- Nie będziesz mógł się zalogować
- Proces jest nieodwracalny
        `
      }
    ]
  },
  'płatności': {
    title: 'Płatności',
    description: 'Metody płatności i rozliczenia',
    icon: CreditCard,
    color: 'from-amber-500 to-orange-500',
    articles: [
      {
        id: 'metody-platnosci',
        title: 'Dostępne metody płatności',
        description: 'Jak zapłacić za rezerwację',
        readTime: '2 min',
        content: `
## Metody płatności

### Płatność online
Dostępne metody:
- **Karta płatnicza** - Visa, Mastercard
- **BLIK** - szybka płatność kodem
- **Przelewy24** - przelew z banku
- **Google Pay / Apple Pay**

### Płatność na miejscu
Niektóre firmy pozwalają płacić po wizycie:
- Gotówka
- Karta płatnicza
- BLIK

### Depozyty
Niektóre firmy wymagają depozytu:
- Płatny przy rezerwacji
- Odliczany od końcowej ceny
- Zwracany przy anulowaniu (zgodnie z polityką)

### Bezpieczeństwo
- Płatności obsługuje Stripe
- Dane karty są szyfrowane
- Nie przechowujemy pełnych numerów kart
        `
      },
      {
        id: 'faktury',
        title: 'Faktury i paragony',
        description: 'Jak pobrać dokumenty płatności',
        readTime: '2 min',
        content: `
## Faktury i paragony

### Gdzie znaleźć faktury
1. Zaloguj się na swoje konto
2. Przejdź do "Historia płatności"
3. Znajdź transakcję
4. Kliknij "Pobierz fakturę"

### Dane do faktury
Aby otrzymać fakturę z danymi firmy:
1. Przejdź do "Ustawienia"
2. Dodaj dane do faktury (NIP, nazwa firmy)
3. Przy kolejnych płatnościach faktura będzie automatyczna

### Paragon
- Paragon jest wystawiany automatycznie
- Dostępny w historii płatności
- Można pobrać jako PDF
        `
      },
      {
        id: 'zwroty',
        title: 'Zwroty płatności',
        description: 'Kiedy i jak otrzymasz zwrot',
        readTime: '2 min',
        content: `
## Zwroty płatności

### Kiedy przysługuje zwrot
- Anulowanie rezerwacji zgodnie z polityką firmy
- Odwołanie wizyty przez firmę
- Reklamacja zaakceptowana przez firmę

### Czas zwrotu
- Karta płatnicza: 3-5 dni roboczych
- BLIK: 1-2 dni robocze
- Przelew: 2-3 dni robocze

### Status zwrotu
1. Przejdź do "Historia płatności"
2. Znajdź transakcję
3. Sprawdź status zwrotu

### Problemy ze zwrotem
Jeśli zwrot nie dotarł:
1. Sprawdź czy minął wymagany czas
2. Skontaktuj się z firmą
3. Napisz do nas: pomoc@rezerwacja24.pl
        `
      }
    ]
  },
  'powiadomienia': {
    title: 'Powiadomienia',
    description: 'Ustawienia przypomnień',
    icon: Bell,
    color: 'from-pink-500 to-rose-500',
    articles: [
      {
        id: 'typy-powiadomien',
        title: 'Rodzaje powiadomień',
        description: 'Jakie powiadomienia otrzymujesz',
        readTime: '2 min',
        content: `
## Rodzaje powiadomień

### Powiadomienia SMS
- **Potwierdzenie rezerwacji** - zaraz po rezerwacji
- **Przypomnienie 24h** - dzień przed wizytą
- **Przypomnienie 2h** - 2 godziny przed wizytą
- **Zmiana terminu** - gdy firma zmieni termin
- **Anulowanie** - gdy rezerwacja zostanie anulowana

### Powiadomienia e-mail
- Potwierdzenie rezerwacji ze szczegółami
- Przypomnienie przed wizytą
- Podziękowanie po wizycie
- Promocje i nowości (opcjonalnie)

### Powiadomienia push
- Dostępne w aplikacji mobilnej
- Przypomnienia o wizytach
- Wiadomości od firm
        `
      },
      {
        id: 'ustawienia-powiadomien',
        title: 'Ustawienia powiadomień',
        description: 'Jak dostosować powiadomienia',
        readTime: '2 min',
        content: `
## Ustawienia powiadomień

### Jak zmienić ustawienia
1. Zaloguj się na swoje konto
2. Przejdź do "Ustawienia"
3. Wybierz "Powiadomienia"
4. Dostosuj preferencje
5. Zapisz zmiany

### Dostępne opcje
- **SMS** - włącz/wyłącz przypomnienia SMS
- **E-mail** - włącz/wyłącz powiadomienia e-mail
- **Marketing** - zgoda na promocje i nowości
- **Przypomnienia** - wybierz kiedy chcesz przypomnienie

### Wypisanie z newslettera
1. Kliknij "Wypisz się" w stopce e-maila
2. Lub wyłącz w ustawieniach konta
        `
      }
    ]
  },
  'bezpieczeństwo': {
    title: 'Bezpieczeństwo',
    description: 'Prywatność i ochrona danych',
    icon: Shield,
    color: 'from-slate-500 to-gray-600',
    articles: [
      {
        id: 'ochrona-danych',
        title: 'Ochrona Twoich danych',
        description: 'Jak chronimy Twoje informacje',
        readTime: '3 min',
        content: `
## Ochrona danych

### Jak chronimy Twoje dane
- **Szyfrowanie SSL** - wszystkie połączenia są szyfrowane
- **Bezpieczne hasła** - hasła są hashowane
- **RODO** - działamy zgodnie z przepisami UE
- **Certyfikaty** - posiadamy certyfikaty bezpieczeństwa

### Twoje prawa (RODO)
- Prawo dostępu do danych
- Prawo do sprostowania
- Prawo do usunięcia
- Prawo do przenoszenia danych

### Eksport danych
1. Przejdź do "Ustawienia"
2. Kliknij "Eksportuj moje dane"
3. Pobierz plik z wszystkimi danymi
        `
      },
      {
        id: 'bezpieczne-logowanie',
        title: 'Bezpieczne logowanie',
        description: 'Wskazówki dotyczące bezpieczeństwa',
        readTime: '2 min',
        content: `
## Bezpieczne logowanie

### Wskazówki
- Używaj silnego, unikalnego hasła
- Nie udostępniaj hasła nikomu
- Wylogowuj się na publicznych komputerach
- Sprawdzaj czy strona ma https://

### Podejrzana aktywność
Jeśli zauważysz podejrzaną aktywność:
1. Natychmiast zmień hasło
2. Sprawdź historię logowań
3. Skontaktuj się z nami

### Logowanie przez Google/Apple
- Bezpieczna metoda logowania
- Nie przechowujemy hasła
- Łatwe i szybkie logowanie
        `
      }
    ]
  }
}

// Mapowanie URL do kluczy
const categoryMapping: Record<string, string> = {
  'pierwsze-kroki': 'pierwsze-kroki',
  'rezerwacje': 'rezerwacje',
  'konto-i-profil': 'konto-i-profil',
  'konto': 'konto-i-profil',
  'platnosci': 'płatności',
  'płatności': 'płatności',
  'powiadomienia': 'powiadomienia',
  'bezpieczenstwo': 'bezpieczeństwo',
  'bezpieczeństwo': 'bezpieczeństwo',
  'rezerwacja': 'rezerwacje'
}

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.category as string
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)
  
  // Znajdź kategorię
  const categoryKey = categoryMapping[categorySlug] || categorySlug
  const category = categoriesData[categoryKey]
  
  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategoria nie znaleziona</h1>
          <Link href="/support" className="text-teal-600 hover:text-teal-700">
            ← Wróć do centrum pomocy
          </Link>
        </div>
      </div>
    )
  }

  const IconComponent = category.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/support" className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Centrum pomocy</span>
              </Link>
              <div className="h-6 w-px bg-gray-200" />
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.png"
                  alt="Rezerwacja24" 
                  width={140} 
                  height={40} 
                  className="h-8 w-auto"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={`bg-gradient-to-br ${category.color} py-12`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{category.title}</h1>
              <p className="text-white/80 mt-1">{category.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {category.articles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{article.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{article.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedArticle === article.id ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              <AnimatePresence>
                {expandedArticle === article.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                      <div 
                        className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900"
                        dangerouslySetInnerHTML={{ 
                          __html: article.content
                            .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-6 mb-4 text-gray-900">$1</h2>')
                            .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                            .replace(/^- (.*$)/gm, '<li class="ml-4 text-gray-600">• $1</li>')
                            .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 text-gray-600">$1</li>')
                            .replace(/\n\n/g, '</p><p class="my-3 text-gray-600">')
                        }}
                      />
                      
                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-400">Czy ten artykuł był pomocny?</span>
                        <div className="flex items-center gap-2">
                          <button className="px-4 py-2 text-sm bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Tak
                          </button>
                          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                            Nie
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 p-8 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 text-center">
          <HelpCircle className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nie znalazłeś odpowiedzi?</h3>
          <p className="text-gray-600 mb-6">Skontaktuj się z naszym zespołem wsparcia</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:pomoc@rezerwacja24.pl" className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium">
              Napisz do nas
            </a>
            <a href="tel:+48506785959" className="px-6 py-3 bg-white text-teal-600 rounded-xl hover:bg-teal-50 transition-colors font-medium border border-teal-200">
              Zadzwoń: +48 506 785 959
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.png"
                alt="Rezerwacja24" 
                width={120} 
                height={35} 
                className="h-7 w-auto"
              />
              <span className="text-gray-400 text-sm">© 2024</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/support" className="hover:text-teal-600 transition-colors">Centrum pomocy</Link>
              <Link href="/privacy" className="hover:text-teal-600 transition-colors">Prywatność</Link>
              <Link href="/terms" className="hover:text-teal-600 transition-colors">Regulamin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
