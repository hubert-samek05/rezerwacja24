'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Users,
  Check,
  ChevronRight,
  Facebook,
  Instagram,
  Globe
} from 'lucide-react'
import Image from 'next/image'

export default function TenantPublicPage({ params }: { params: { subdomain: string } }) {
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  return (
    <div className="min-h-screen bg-carbon-black">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://source.unsplash.com/random/1920x400/?salon,beauty"
            alt="Salon"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-carbon-black/50 to-carbon-black"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-20 bg-gradient-accent rounded-full"></div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Elegance Hair Studio
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-neutral-gray/70">(127 opinii)</span>
                </div>
              </div>
            </div>
            
            <p className="text-xl text-neutral-gray/80 mb-6">
              Profesjonalny salon fryzjerski z wieloletnim doświadczeniem. 
              Oferujemy kompleksowe usługi fryzjerskie i kosmetyczne.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#booking" className="btn-neon flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Zarezerwuj wizytę</span>
              </a>
              <a href="#services" className="btn-outline-neon flex items-center justify-center space-x-2">
                <span>Zobacz usługi</span>
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="border-y border-white/10 bg-primary-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-accent-neon" />
              <div>
                <p className="text-sm text-neutral-gray/70">Adres</p>
                <p className="text-white font-medium">ul. Przykładowa 123, Warszawa</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-accent-neon" />
              <div>
                <p className="text-sm text-neutral-gray/70">Telefon</p>
                <p className="text-white font-medium">+48 123 456 789</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-accent-neon" />
              <div>
                <p className="text-sm text-neutral-gray/70">Godziny otwarcia</p>
                <p className="text-white font-medium">Pn-Pt: 9:00-20:00</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-accent-neon" />
              <div>
                <p className="text-sm text-neutral-gray/70">Email</p>
                <p className="text-white font-medium">kontakt@elegance.pl</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Nasze usługi</h2>
            <p className="text-xl text-neutral-gray/70">Wybierz usługę i umów się na wizytę</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card-hover p-6 cursor-pointer"
                onClick={() => setSelectedService(service.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-carbon-black" />
                  </div>
                  <span className="px-3 py-1 bg-primary-green/20 text-accent-neon text-xs font-semibold rounded-full">
                    {service.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                <p className="text-neutral-gray/70 text-sm mb-4">{service.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-accent-neon" />
                    <span className="text-sm text-neutral-gray/70">{service.duration} min</span>
                  </div>
                  <span className="text-xl font-bold text-accent-neon">{service.price} zł</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-dark/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Nasz zespół</h2>
            <p className="text-xl text-neutral-gray/70">Poznaj naszych specjalistów</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 text-center"
              >
                <div className="w-24 h-24 bg-gradient-accent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                <p className="text-sm text-accent-neon mb-3">{member.role}</p>
                <p className="text-xs text-neutral-gray/70">{member.experience}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Umów się na wizytę</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Wybierz usługę
                </label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon">
                  <option value="">Wybierz usługę...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name} - {service.price} zł</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Data
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Godzina
                  </label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon">
                    <option value="">Wybierz godzinę...</option>
                    <option value="9:00">9:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Wybierz specjalistę (opcjonalnie)
                </label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-accent-neon">
                  <option value="">Bez preferencji</option>
                  {team.map((member, index) => (
                    <option key={index} value={index}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    placeholder="Jan Kowalski"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-gray mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    placeholder="+48 123 456 789"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="jan.kowalski@example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-gray mb-2">
                  Uwagi (opcjonalnie)
                </label>
                <textarea
                  rows={3}
                  placeholder="Dodatkowe informacje..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
                />
              </div>

              <button className="btn-neon w-full flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Potwierdź rezerwację</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-dark/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Opinie klientów</h2>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-xl text-neutral-gray/70">5.0 (127 opinii)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6"
              >
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-gray/80 mb-4">{review.text}</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-accent rounded-full"></div>
                  <div>
                    <p className="text-white font-medium">{review.author}</p>
                    <p className="text-xs text-neutral-gray/70">{review.date}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-neutral-gray/70 text-sm">
                &copy; 2024 Elegance Hair Studio. Wszystkie prawa zastrzeżone.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="#" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Facebook className="w-5 h-5 text-neutral-gray" />
              </a>
              <a href="#" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Instagram className="w-5 h-5 text-neutral-gray" />
              </a>
              <a href="#" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <Globe className="w-5 h-5 text-neutral-gray" />
              </a>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-neutral-gray/50">
              Powered by <span className="text-accent-neon">Rezerwacja24</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Mock data
const services = [
  {
    id: 1,
    name: 'Strzyżenie damskie',
    description: 'Profesjonalne strzyżenie z modelowaniem i stylizacją',
    category: 'Fryzjerstwo',
    price: 120,
    duration: 60,
    icon: Users
  },
  {
    id: 2,
    name: 'Koloryzacja',
    description: 'Pełna koloryzacja włosów z profesjonalnymi produktami',
    category: 'Fryzjerstwo',
    price: 250,
    duration: 120,
    icon: Users
  },
  {
    id: 3,
    name: 'Strzyżenie męskie',
    description: 'Strzyżenie męskie z modelowaniem brody',
    category: 'Fryzjerstwo',
    price: 60,
    duration: 30,
    icon: Users
  }
]

const team = [
  { name: 'Anna Kowalska', role: 'Stylistka Senior', experience: '12 lat doświadczenia' },
  { name: 'Jan Nowak', role: 'Barber', experience: '8 lat doświadczenia' },
  { name: 'Maria Wiśniewska', role: 'Kolorystka', experience: '10 lat doświadczenia' },
  { name: 'Piotr Zieliński', role: 'Stylista', experience: '6 lat doświadczenia' }
]

const reviews = [
  {
    author: 'Katarzyna L.',
    date: '2 dni temu',
    text: 'Wspaniały salon! Profesjonalna obsługa i świetny efekt. Polecam!'
  },
  {
    author: 'Michał K.',
    date: '1 tydzień temu',
    text: 'Najlepszy fryzjer w mieście. Zawsze wychodzę zadowolony.'
  },
  {
    author: 'Agnieszka W.',
    date: '2 tygodnie temu',
    text: 'Rewelacyjna koloryzacja! Dokładnie taki efekt jakiego oczekiwałam.'
  }
]
