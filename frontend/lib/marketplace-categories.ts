// Definicja kategorii i podkategorii dla marketplace
// Każda kategoria ma ikonę, kolor i listę podkategorii

export interface Subcategory {
  id: string
  name: string
  nameEn: string
}

export interface Category {
  id: string
  name: string
  nameEn: string
  icon: string // nazwa ikony z Lucide
  color: string // gradient Tailwind
  bgColor: string // kolor tła
  subcategories: Subcategory[]
}

export const MARKETPLACE_CATEGORIES: Category[] = [
  {
    id: 'beauty',
    name: 'Uroda i pielęgnacja',
    nameEn: 'Beauty & Care',
    icon: 'Sparkles',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    subcategories: [
      { id: 'fryzjer', name: 'Fryzjer', nameEn: 'Hairdresser' },
      { id: 'barber', name: 'Barber Shop', nameEn: 'Barber Shop' },
      { id: 'kosmetyczka', name: 'Kosmetyczka', nameEn: 'Beautician' },
      { id: 'makijaz', name: 'Makijaż', nameEn: 'Makeup' },
      { id: 'paznokcie', name: 'Manicure & Pedicure', nameEn: 'Nails' },
      { id: 'rzesy', name: 'Rzęsy i brwi', nameEn: 'Lashes & Brows' },
      { id: 'depilacja', name: 'Depilacja', nameEn: 'Hair Removal' },
      { id: 'solarium', name: 'Solarium', nameEn: 'Tanning' },
    ],
  },
  {
    id: 'spa',
    name: 'SPA & Wellness',
    nameEn: 'SPA & Wellness',
    icon: 'Flower2',
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'bg-teal-50',
    subcategories: [
      { id: 'masaz', name: 'Masaż', nameEn: 'Massage' },
      { id: 'sauna', name: 'Sauna i łaźnia', nameEn: 'Sauna & Steam' },
      { id: 'spa-day', name: 'Pakiety SPA', nameEn: 'SPA Packages' },
      { id: 'aromaterapia', name: 'Aromaterapia', nameEn: 'Aromatherapy' },
      { id: 'refleksologia', name: 'Refleksologia', nameEn: 'Reflexology' },
    ],
  },
  {
    id: 'zdrowie',
    name: 'Zdrowie i medycyna',
    nameEn: 'Health & Medical',
    icon: 'Heart',
    color: 'from-red-500 to-rose-500',
    bgColor: 'bg-red-50',
    subcategories: [
      { id: 'stomatologia', name: 'Stomatologia', nameEn: 'Dentistry' },
      { id: 'fizjoterapia', name: 'Fizjoterapia', nameEn: 'Physiotherapy' },
      { id: 'psycholog', name: 'Psycholog / Terapeuta', nameEn: 'Psychology' },
      { id: 'dietetyk', name: 'Dietetyk', nameEn: 'Dietitian' },
      { id: 'ortopeda', name: 'Ortopeda', nameEn: 'Orthopedist' },
      { id: 'dermatolog', name: 'Dermatolog', nameEn: 'Dermatologist' },
      { id: 'okulista', name: 'Okulista', nameEn: 'Ophthalmologist' },
      { id: 'medycyna-estetyczna', name: 'Medycyna estetyczna', nameEn: 'Aesthetic Medicine' },
    ],
  },
  {
    id: 'sport',
    name: 'Sport i fitness',
    nameEn: 'Sports & Fitness',
    icon: 'Dumbbell',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
    subcategories: [
      { id: 'silownia', name: 'Siłownia', nameEn: 'Gym' },
      { id: 'trener', name: 'Trener personalny', nameEn: 'Personal Trainer' },
      { id: 'joga', name: 'Joga', nameEn: 'Yoga' },
      { id: 'pilates', name: 'Pilates', nameEn: 'Pilates' },
      { id: 'crossfit', name: 'CrossFit', nameEn: 'CrossFit' },
      { id: 'taniec', name: 'Taniec', nameEn: 'Dance' },
      { id: 'sztuki-walki', name: 'Sztuki walki', nameEn: 'Martial Arts' },
      { id: 'basen', name: 'Basen / Pływanie', nameEn: 'Swimming' },
    ],
  },
  {
    id: 'tatuaz',
    name: 'Tatuaż i piercing',
    nameEn: 'Tattoo & Piercing',
    icon: 'Pen',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50',
    subcategories: [
      { id: 'tatuaz-artystyczny', name: 'Tatuaż artystyczny', nameEn: 'Artistic Tattoo' },
      { id: 'tatuaz-kosmetyczny', name: 'Tatuaż kosmetyczny', nameEn: 'Cosmetic Tattoo' },
      { id: 'piercing', name: 'Piercing', nameEn: 'Piercing' },
      { id: 'usuwanie-tatuazu', name: 'Usuwanie tatuażu', nameEn: 'Tattoo Removal' },
    ],
  },
  {
    id: 'edukacja',
    name: 'Edukacja i rozwój',
    nameEn: 'Education',
    icon: 'GraduationCap',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
    subcategories: [
      { id: 'korepetycje', name: 'Korepetycje', nameEn: 'Tutoring' },
      { id: 'jezyki', name: 'Nauka języków', nameEn: 'Language Learning' },
      { id: 'muzyka', name: 'Lekcje muzyki', nameEn: 'Music Lessons' },
      { id: 'coaching', name: 'Coaching', nameEn: 'Coaching' },
      { id: 'szkolenia', name: 'Szkolenia', nameEn: 'Training' },
    ],
  },
  {
    id: 'zwierzeta',
    name: 'Usługi dla zwierząt',
    nameEn: 'Pet Services',
    icon: 'PawPrint',
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'bg-amber-50',
    subcategories: [
      { id: 'groomer', name: 'Groomer', nameEn: 'Pet Grooming' },
      { id: 'weterynarz', name: 'Weterynarz', nameEn: 'Veterinarian' },
      { id: 'trener-psow', name: 'Trener psów', nameEn: 'Dog Trainer' },
      { id: 'hotel-zwierzat', name: 'Hotel dla zwierząt', nameEn: 'Pet Hotel' },
      { id: 'behawiorista', name: 'Behawiorista', nameEn: 'Animal Behaviorist' },
    ],
  },
  {
    id: 'motoryzacja',
    name: 'Motoryzacja',
    nameEn: 'Automotive',
    icon: 'Car',
    color: 'from-slate-600 to-slate-700',
    bgColor: 'bg-slate-100',
    subcategories: [
      { id: 'warsztat', name: 'Warsztat samochodowy', nameEn: 'Auto Repair' },
      { id: 'myjnia', name: 'Myjnia', nameEn: 'Car Wash' },
      { id: 'detailing', name: 'Auto detailing', nameEn: 'Auto Detailing' },
      { id: 'wulkanizacja', name: 'Wulkanizacja', nameEn: 'Tire Service' },
      { id: 'przeglady', name: 'Przeglądy techniczne', nameEn: 'Vehicle Inspection' },
    ],
  },
  {
    id: 'dom',
    name: 'Dom i naprawa',
    nameEn: 'Home & Repair',
    icon: 'Home',
    color: 'from-emerald-500 to-green-500',
    bgColor: 'bg-emerald-50',
    subcategories: [
      { id: 'sprzatanie', name: 'Sprzątanie', nameEn: 'Cleaning' },
      { id: 'hydraulik', name: 'Hydraulik', nameEn: 'Plumber' },
      { id: 'elektryk', name: 'Elektryk', nameEn: 'Electrician' },
      { id: 'ogrodnik', name: 'Ogrodnik', nameEn: 'Gardener' },
      { id: 'zlota-raczka', name: 'Złota rączka', nameEn: 'Handyman' },
      { id: 'przeprowadzki', name: 'Przeprowadzki', nameEn: 'Moving' },
    ],
  },
  {
    id: 'fotografia',
    name: 'Fotografia i wideo',
    nameEn: 'Photo & Video',
    icon: 'Camera',
    color: 'from-cyan-500 to-sky-500',
    bgColor: 'bg-cyan-50',
    subcategories: [
      { id: 'fotograf-portretowy', name: 'Fotografia portretowa', nameEn: 'Portrait Photography' },
      { id: 'fotograf-slubny', name: 'Fotografia ślubna', nameEn: 'Wedding Photography' },
      { id: 'fotograf-produktowy', name: 'Fotografia produktowa', nameEn: 'Product Photography' },
      { id: 'wideo', name: 'Produkcja wideo', nameEn: 'Video Production' },
    ],
  },
  {
    id: 'eventy',
    name: 'Eventy i rozrywka',
    nameEn: 'Events & Entertainment',
    icon: 'PartyPopper',
    color: 'from-fuchsia-500 to-pink-500',
    bgColor: 'bg-fuchsia-50',
    subcategories: [
      { id: 'dj', name: 'DJ', nameEn: 'DJ' },
      { id: 'catering', name: 'Catering', nameEn: 'Catering' },
      { id: 'dekoracje', name: 'Dekoracje eventowe', nameEn: 'Event Decorations' },
      { id: 'animator', name: 'Animator dla dzieci', nameEn: 'Kids Animator' },
      { id: 'wynajem-sal', name: 'Wynajem sal', nameEn: 'Venue Rental' },
    ],
  },
  {
    id: 'prawo',
    name: 'Prawo i finanse',
    nameEn: 'Legal & Finance',
    icon: 'Scale',
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    subcategories: [
      { id: 'prawnik', name: 'Prawnik / Adwokat', nameEn: 'Lawyer' },
      { id: 'notariusz', name: 'Notariusz', nameEn: 'Notary' },
      { id: 'ksiegowosc', name: 'Księgowość', nameEn: 'Accounting' },
      { id: 'doradca-finansowy', name: 'Doradca finansowy', nameEn: 'Financial Advisor' },
    ],
  },
]

// Helper do znajdowania kategorii po ID
export function getCategoryById(id: string): Category | undefined {
  return MARKETPLACE_CATEGORIES.find((cat) => cat.id === id)
}

// Helper do znajdowania podkategorii
export function getSubcategoryById(categoryId: string, subcategoryId: string): Subcategory | undefined {
  const category = getCategoryById(categoryId)
  return category?.subcategories.find((sub) => sub.id === subcategoryId)
}

// Helper do płaskiej listy wszystkich podkategorii
export function getAllSubcategories(): Array<Subcategory & { categoryId: string; categoryName: string }> {
  return MARKETPLACE_CATEGORIES.flatMap((cat) =>
    cat.subcategories.map((sub) => ({
      ...sub,
      categoryId: cat.id,
      categoryName: cat.name,
    }))
  )
}

// Mapowanie ikon Lucide
export const CATEGORY_ICONS: Record<string, string> = {
  Sparkles: 'Sparkles',
  Flower2: 'Flower2',
  Heart: 'Heart',
  Dumbbell: 'Dumbbell',
  Pen: 'Pen',
  GraduationCap: 'GraduationCap',
  PawPrint: 'PawPrint',
  Car: 'Car',
  Home: 'Home',
  Camera: 'Camera',
  PartyPopper: 'PartyPopper',
  Scale: 'Scale',
}
