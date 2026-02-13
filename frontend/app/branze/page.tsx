'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Scissors, Stethoscope, Car, Dumbbell, GraduationCap, PawPrint, Home, MessageCircle, PartyPopper, UtensilsCrossed, Scale, MoreHorizontal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const categories = [
  { id: 'beauty', title: 'Beauty & SPA', desc: 'Fryzjerzy, kosmetyczki, SPA', icon: Scissors, color: 'bg-pink-500' },
  { id: 'zdrowie', title: 'Zdrowie', desc: 'Lekarze, fizjoterapeuci, psycholodzy', icon: Stethoscope, color: 'bg-red-500' },
  { id: 'motoryzacja', title: 'Motoryzacja', desc: 'Warsztaty, serwisy, detailing', icon: Car, color: 'bg-slate-600' },
  { id: 'sport', title: 'Sport i fitness', desc: 'Trenerzy, joga, siłownie', icon: Dumbbell, color: 'bg-orange-500' },
  { id: 'edukacja', title: 'Edukacja', desc: 'Korepetycje, kursy, szkoły', icon: GraduationCap, color: 'bg-blue-500' },
  { id: 'zwierzeta', title: 'Zwierzęta', desc: 'Groomerzy, weterynarze, petsitterzy', icon: PawPrint, color: 'bg-amber-500' },
  { id: 'dom', title: 'Dom i naprawa', desc: 'Hydraulicy, elektrycy, sprzątanie', icon: Home, color: 'bg-emerald-500' },
  { id: 'konsultacje', title: 'Konsultacje', desc: 'Coachowie, mentorzy, doradcy', icon: MessageCircle, color: 'bg-violet-500' },
  { id: 'rozrywka', title: 'Rozrywka', desc: 'Fotografowie, DJ-e, eventy', icon: PartyPopper, color: 'bg-fuchsia-500' },
  { id: 'gastronomia', title: 'Gastronomia', desc: 'Restauracje, kawiarnie, catering', icon: UtensilsCrossed, color: 'bg-red-500' },
  { id: 'prawne', title: 'Usługi prawne', desc: 'Adwokaci, notariusze, radcowie', icon: Scale, color: 'bg-indigo-500' },
  { id: 'inne', title: 'Inne', desc: 'Każda inna branża usługowa', icon: MoreHorizontal, color: 'bg-gray-500' },
]

export default function BranzePage() {
  const [appUrl, setAppUrl] = useState('https://app.rezerwacja24.pl')
  
  useEffect(() => {
    const hostname = window.location.hostname
    setAppUrl(hostname.includes('bookings24.eu') ? 'https://app.bookings24.eu' : 'https://app.rezerwacja24.pl')
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/"><Image src="/logo.png" alt="Rezerwacja24" width={180} height={54} className="h-9 w-auto" priority /></Link>
            <a href={`${appUrl}/register`} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-sm">
              Załóż konto
            </a>
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Dla kogo jest Rezerwacja24?
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dla każdego, kto przyjmuje klientów na wizyty. Wybierz swoją branżę.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link 
                  key={cat.id}
                  href={`/${cat.id}`}
                  className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-700">{cat.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{cat.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-teal-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Nie widzisz swojej branży?</h2>
          <p className="text-teal-100 mb-8">
            Nasz system jest uniwersalny. Jeśli przyjmujesz klientów na wizyty - jest dla Ciebie.
          </p>
          <a href={`${appUrl}/register`} className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-teal-50 text-teal-600 font-medium rounded-lg text-lg">
            Wypróbuj za darmo <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      <footer className="py-12 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/"><Image src="/logo.png" alt="Rezerwacja24" width={120} height={36} className="h-7 w-auto" /></Link>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700">Prywatność</Link>
              <Link href="/terms" className="hover:text-gray-700">Regulamin</Link>
              <Link href="/contact" className="hover:text-gray-700">Kontakt</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
