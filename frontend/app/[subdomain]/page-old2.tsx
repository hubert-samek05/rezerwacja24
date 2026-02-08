'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Check,
  Facebook,
  Instagram,
  Globe as GlobeIcon,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { getCompanyBySubdomain, type CompanyData } from '@/lib/company'

export default function TenantPublicPage({ params }: { params: { subdomain: string } }) {
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState<string | null>(null)

  useEffect(() => {
    // Pobierz dane firmy z API
    const loadCompanyData = async () => {
      try {
        const companyData = await getCompanyBySubdomain(params.subdomain)
        console.log('Loaded company for subdomain:', params.subdomain, companyData)
        setCompany(companyData)
      } catch (error) {
        console.error('Error loading company:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCompanyData()
  }, [params.subdomain])

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent-neon animate-spin" />
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-carbon-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Strona nie znaleziona</h1>
          <p className="text-neutral-gray mb-8">
            Subdomena <span className="text-accent-neon">{params.subdomain}</span> nie istnieje
          </p>
          <a href="https://rezerwacja24.pl" className="btn-neon inline-block">
            Wróć do strony głównej
          </a>
        </div>
      </div>
    )
  }

  const dayNames: { [key: string]: string } = {
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
    saturday: 'Sobota',
    sunday: 'Niedziela'
  }

  return (
    <div className="min-h-screen bg-carbon-black">
      {/* Hero Section */}
      <section className="relative min-h-[600px] overflow-hidden">
        {/* Banner Background */}
        {company.banner ? (
          <div className="absolute inset-0">
            <img
              src={company.banner}
              alt="Banner"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-carbon-black/50 via-carbon-black/70 to-carbon-black"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-primary opacity-20"></div>
        )}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            {company.logo && (
              <div className="flex justify-center mb-8">
                <img
                  src={company.logo}
                  alt={company.businessName}
                  className="h-32 w-auto"
                />
              </div>
            )}

            {/* Business Name */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {company.businessName}
            </h1>

            {/* Description */}
            {company.description && (
              <p className="text-xl text-neutral-gray max-w-3xl mx-auto mb-8">
                {company.description}
              </p>
            )}

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-neon text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <Calendar className="w-6 h-6" />
              <span>Umów wizytę online</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            {/* Contact Info */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-neutral-gray">
              {company.phone && (
                <a href={`tel:${company.phone}`} className="flex items-center space-x-2 hover:text-accent-neon transition-colors">
                  <Phone className="w-5 h-5" />
                  <span>{company.phone}</span>
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center space-x-2 hover:text-accent-neon transition-colors">
                  <Mail className="w-5 h-5" />
                  <span>{company.email}</span>
                </a>
              )}
              {company.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>{company.address}, {company.city}</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-b from-carbon-black to-carbon-black/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nasze usługi
            </h2>
            <p className="text-xl text-neutral-gray">
              Profesjonalna obsługa na najwyższym poziomie
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder services - w prawdziwej aplikacji pobrane z API */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 hover:border-accent-neon/50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-neon transition-colors">
                      Usługa {i}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-neutral-gray">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>60 min</span>
                      </div>
                      <div className="text-accent-neon font-semibold">
                        150 zł
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-neutral-gray text-sm mb-4">
                  Profesjonalna usługa wykonana przez doświadczonych specjalistów
                </p>
                <button className="w-full py-2 px-4 bg-primary-green/20 text-accent-neon rounded-lg hover:bg-primary-green/30 transition-colors flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Zarezerwuj</span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Opening Hours Section */}
      {company.openingHours && (
        <section className="py-20 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Godziny otwarcia
              </h2>
            </motion.div>

            <div className="max-w-2xl mx-auto glass-card p-8">
              <div className="space-y-4">
                {Object.entries(company.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                    <span className="text-white font-medium">{dayNames[day]}</span>
                    {hours.closed ? (
                      <span className="text-red-400">Zamknięte</span>
                    ) : (
                      <span className="text-accent-neon">{hours.open} - {hours.close}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Dlaczego my?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Star,
                title: 'Najwyższa jakość',
                description: 'Gwarantujemy profesjonalną obsługę i najlepsze produkty'
              },
              {
                icon: Clock,
                title: 'Wygodne rezerwacje',
                description: 'Rezerwuj online 24/7 w dogodnym dla Ciebie terminie'
              },
              {
                icon: Check,
                title: 'Doświadczenie',
                description: 'Nasz zespół to wykwalifikowani specjaliści z pasją'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-10 h-10 text-carbon-black" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-neutral-gray">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Social Section */}
      <section className="py-20 bg-gradient-to-b from-carbon-black to-primary-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Skontaktuj się z nami
            </h2>

            {/* Social Media */}
            {company.socialMedia && (
              <div className="flex justify-center space-x-6 mb-12">
                {company.socialMedia.facebook && (
                  <a
                    href={company.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-white/10 hover:bg-accent-neon/20 rounded-full flex items-center justify-center transition-colors group"
                  >
                    <Facebook className="w-6 h-6 text-neutral-gray group-hover:text-accent-neon transition-colors" />
                  </a>
                )}
                {company.socialMedia.instagram && (
                  <a
                    href={company.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-white/10 hover:bg-accent-neon/20 rounded-full flex items-center justify-center transition-colors group"
                  >
                    <Instagram className="w-6 h-6 text-neutral-gray group-hover:text-accent-neon transition-colors" />
                  </a>
                )}
                {company.socialMedia.website && (
                  <a
                    href={company.socialMedia.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-white/10 hover:bg-accent-neon/20 rounded-full flex items-center justify-center transition-colors group"
                  >
                    <GlobeIcon className="w-6 h-6 text-neutral-gray group-hover:text-accent-neon transition-colors" />
                  </a>
                )}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-neon text-lg px-8 py-4 inline-flex items-center space-x-2"
            >
              <Calendar className="w-6 h-6" />
              <span>Zarezerwuj wizytę teraz</span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-neutral-gray text-sm">
            <p>© 2024 {company.businessName}. Wszystkie prawa zastrzeżone.</p>
            <p className="mt-2">
              Powered by{' '}
              <a href="https://rezerwacja24.pl" className="text-accent-neon hover:underline">
                Rezerwacja24
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
