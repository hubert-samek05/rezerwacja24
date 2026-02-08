'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, Users, X, Download, AlertCircle, Info } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getApiUrl } from '@/lib/api-url'
import { getTenantConfig } from '@/lib/tenant'

interface ParsedCustomer {
  firstName: string
  lastName: string
  phone: string
  email?: string
  isValid: boolean
  error?: string
  isDuplicate?: boolean
}

interface ImportResult {
  added: number
  skipped: number
  errors: string[]
}

export default function ImportDataTab() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedCustomer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [existingPhones, setExistingPhones] = useState<Set<string>>(new Set())
  const [existingEmails, setExistingEmails] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const API_URL = getApiUrl()

  // Pobierz istniejących klientów żeby sprawdzić duplikaty
  const fetchExistingCustomers = async () => {
    try {
      const config = getTenantConfig()
      const response = await axios.get(`${API_URL}/api/customers`, config)
      const customers = response.data || []
      
      const phones = new Set<string>()
      const emails = new Set<string>()
      
      customers.forEach((c: any) => {
        if (c.phone) phones.add(normalizePhone(c.phone))
        if (c.email) emails.add(c.email.toLowerCase())
      })
      
      setExistingPhones(phones)
      setExistingEmails(emails)
      return { phones, emails }
    } catch (error) {
      console.error('Error fetching customers:', error)
      return { phones: new Set<string>(), emails: new Set<string>() }
    }
  }

  // Normalizuj numer telefonu (usuń spacje, myślniki itp.)
  const normalizePhone = (phone: string): string => {
    return phone.replace(/[\s\-\(\)\.]/g, '').replace(/^\+48/, '')
  }

  // Parsuj plik CSV
  const parseCSV = (content: string, phones: Set<string>, emails: Set<string>): ParsedCustomer[] => {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    // Znajdź nagłówki
    const headers = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase())
    
    // Mapowanie kolumn (obsługa różnych nazw)
    const findColumn = (names: string[]): number => {
      for (const name of names) {
        const idx = headers.findIndex(h => h.includes(name))
        if (idx !== -1) return idx
      }
      return -1
    }

    const firstNameCol = findColumn(['imię', 'imie', 'first', 'firstname', 'first_name'])
    const lastNameCol = findColumn(['nazwisko', 'last', 'lastname', 'last_name', 'surname'])
    const nameCol = findColumn(['name', 'nazwa', 'klient', 'client']) // Pełne imię i nazwisko
    const phoneCol = findColumn(['telefon', 'phone', 'tel', 'mobile', 'numer'])
    const emailCol = findColumn(['email', 'e-mail', 'mail'])

    const customers: ParsedCustomer[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(/[,;]/).map(v => v.trim().replace(/^["']|["']$/g, ''))
      
      let firstName = ''
      let lastName = ''
      let phone = ''
      let email = ''

      // Pobierz imię i nazwisko
      if (firstNameCol !== -1 && lastNameCol !== -1) {
        firstName = values[firstNameCol] || ''
        lastName = values[lastNameCol] || ''
      } else if (nameCol !== -1) {
        const fullName = values[nameCol] || ''
        const parts = fullName.split(' ')
        firstName = parts[0] || ''
        lastName = parts.slice(1).join(' ') || ''
      }

      // Pobierz telefon i email
      if (phoneCol !== -1) phone = values[phoneCol] || ''
      if (emailCol !== -1) email = values[emailCol] || ''

      // Walidacja
      let isValid = true
      let error = ''

      if (!firstName && !lastName) {
        isValid = false
        error = 'Brak imienia i nazwiska'
      } else if (!phone) {
        isValid = false
        error = 'Brak numeru telefonu'
      }

      // Sprawdź duplikaty
      const normalizedPhone = normalizePhone(phone)
      const normalizedEmail = email.toLowerCase()
      let isDuplicate = false

      if (normalizedPhone && phones.has(normalizedPhone)) {
        isDuplicate = true
        error = 'Klient już istnieje (telefon)'
      } else if (normalizedEmail && emails.has(normalizedEmail)) {
        isDuplicate = true
        error = 'Klient już istnieje (email)'
      }

      customers.push({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        isValid: isValid && !isDuplicate,
        error,
        isDuplicate
      })
    }

    return customers
  }

  // Obsługa wyboru pliku
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Proszę wybrać plik CSV')
      return
    }

    setFile(selectedFile)
    setIsLoading(true)
    setImportResult(null)

    try {
      // Pobierz istniejących klientów
      const { phones, emails } = await fetchExistingCustomers()

      // Odczytaj plik
      const content = await selectedFile.text()
      const parsed = parseCSV(content, phones, emails)
      
      if (parsed.length === 0) {
        toast.error('Nie znaleziono danych w pliku')
        setFile(null)
      } else {
        setParsedData(parsed)
        toast.success(`Znaleziono ${parsed.length} rekordów`)
      }
    } catch (error) {
      console.error('Error parsing file:', error)
      toast.error('Błąd podczas odczytu pliku')
      setFile(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Import klientów
  const handleImport = async () => {
    const validCustomers = parsedData.filter(c => c.isValid)
    if (validCustomers.length === 0) {
      toast.error('Brak poprawnych rekordów do importu')
      return
    }

    setIsImporting(true)
    const config = getTenantConfig()
    let added = 0
    let skipped = 0
    const errors: string[] = []

    for (const customer of validCustomers) {
      try {
        await axios.post(`${API_URL}/api/customers`, {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          email: customer.email || null
        }, config)
        added++
      } catch (error: any) {
        skipped++
        const msg = error.response?.data?.message || 'Nieznany błąd'
        if (!errors.includes(msg)) {
          errors.push(`${customer.firstName} ${customer.lastName}: ${msg}`)
        }
      }
    }

    setImportResult({ added, skipped, errors })
    setIsImporting(false)

    if (added > 0) {
      toast.success(`Zaimportowano ${added} klientów`)
    }
    if (skipped > 0) {
      toast.error(`Pominięto ${skipped} rekordów`)
    }
  }

  // Reset
  const handleReset = () => {
    setFile(null)
    setParsedData([])
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Pobierz przykładowy plik CSV
  const downloadSampleCSV = () => {
    const sample = `Imię,Nazwisko,Telefon,Email
Anna,Kowalska,500123456,anna@example.com
Jan,Nowak,600789012,jan@example.com
Maria,Wiśniewska,700345678,`
    
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'przyklad_import_klientow.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const validCount = parsedData.filter(c => c.isValid).length
  const duplicateCount = parsedData.filter(c => c.isDuplicate).length
  const invalidCount = parsedData.filter(c => !c.isValid && !c.isDuplicate).length

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="pb-4 border-b border-[var(--border-color)]">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Import z Booksy</h2>
        <p className="text-[var(--text-muted)] mt-2">
          Przenieś bazę klientów z Booksy do Rezerwacja24 w kilku prostych krokach
        </p>
      </div>

      {/* Info box */}
      <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-teal-500" />
          </div>
          <div>
            <p className="font-medium text-[var(--text-primary)] mb-2">Bezpieczny import</p>
            <ul className="text-sm text-[var(--text-muted)] space-y-1">
              <li>• Tylko <strong>dodaje</strong> nowych klientów - nie usuwa istniejących</li>
              <li>• Automatycznie pomija duplikaty (ten sam telefon lub email)</li>
              <li>• Wymagane: imię, nazwisko, telefon</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Wynik importu */}
      {importResult && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Import zakończony</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-500">{importResult.added}</p>
              <p className="text-sm text-[var(--text-muted)]">Dodanych klientów</p>
            </div>
            <div className="bg-amber-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{importResult.skipped}</p>
              <p className="text-sm text-[var(--text-muted)]">Pominiętych</p>
            </div>
          </div>
          {importResult.errors.length > 0 && (
            <div className="text-sm text-[var(--text-muted)]">
              <p className="font-medium mb-2">Błędy:</p>
              <ul className="space-y-1">
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
                {importResult.errors.length > 5 && (
                  <li>• ... i {importResult.errors.length - 5} więcej</li>
                )}
              </ul>
            </div>
          )}
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg font-medium hover:opacity-90"
          >
            Importuj kolejny plik
          </button>
        </div>
      )}

      {/* Upload pliku */}
      {!importResult && (
        <>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">1</div>
              <h3 className="font-bold text-[var(--text-primary)]">Wybierz plik CSV</h3>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />

            {!file ? (
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-xl p-10 cursor-pointer hover:border-teal-500 hover:bg-teal-500/5 transition-all"
              >
                <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-teal-500" />
                </div>
                <p className="text-[var(--text-primary)] font-semibold text-lg">Kliknij aby wybrać plik</p>
                <p className="text-sm text-[var(--text-muted)] mt-2">lub przeciągnij i upuść plik CSV</p>
                <p className="text-xs text-[var(--text-muted)] mt-4 px-4 py-2 bg-[var(--bg-primary)] rounded-lg">
                  Obsługiwane formaty: .csv
                </p>
              </label>
            ) : (
              <div className="flex items-center justify-between bg-teal-500/10 border border-teal-500/20 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{file.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {(file.size / 1024).toFixed(1)} KB • Gotowy do importu
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-colors"
                  title="Usuń plik"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>
            )}
          </div>

          {/* Podgląd danych */}
          {parsedData.length > 0 && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">2</div>
                <h3 className="font-bold text-[var(--text-primary)]">Podgląd danych</h3>
              </div>
              
              {/* Statystyki */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">{validCount}</p>
                  <p className="text-sm text-[var(--text-muted)]">Gotowych</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-500">{duplicateCount}</p>
                  <p className="text-sm text-[var(--text-muted)]">Duplikatów</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-500">{invalidCount}</p>
                  <p className="text-sm text-[var(--text-muted)]">Błędnych</p>
                </div>
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[var(--bg-card)]">
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="px-3 py-2 text-left text-[var(--text-muted)]">Status</th>
                      <th className="px-3 py-2 text-left text-[var(--text-muted)]">Imię</th>
                      <th className="px-3 py-2 text-left text-[var(--text-muted)]">Nazwisko</th>
                      <th className="px-3 py-2 text-left text-[var(--text-muted)]">Telefon</th>
                      <th className="px-3 py-2 text-left text-[var(--text-muted)]">Email</th>
                      <th className="px-3 py-2 text-left text-[var(--text-muted)]">Uwagi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 50).map((customer, i) => (
                      <tr key={i} className={`border-b border-[var(--border-color)] ${
                        !customer.isValid ? 'opacity-50' : ''
                      }`}>
                        <td className="px-3 py-2">
                          {customer.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : customer.isDuplicate ? (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                        </td>
                        <td className="px-3 py-2 text-[var(--text-primary)]">{customer.firstName}</td>
                        <td className="px-3 py-2 text-[var(--text-primary)]">{customer.lastName}</td>
                        <td className="px-3 py-2 text-[var(--text-muted)]">{customer.phone}</td>
                        <td className="px-3 py-2 text-[var(--text-muted)]">{customer.email || '-'}</td>
                        <td className="px-3 py-2 text-xs text-[var(--text-muted)]">{customer.error || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 50 && (
                  <p className="text-center text-sm text-[var(--text-muted)] py-2">
                    ... i {parsedData.length - 50} więcej rekordów
                  </p>
                )}
              </div>

              {/* Przycisk importu */}
              <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[var(--text-muted)]">
                  {validCount > 0 ? (
                    <>Gotowych do importu: <strong className="text-[var(--text-primary)]">{validCount} klientów</strong></>
                  ) : (
                    'Brak poprawnych rekordów do importu'
                  )}
                </p>
                <button
                  onClick={handleImport}
                  disabled={validCount === 0 || isImporting}
                  className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Importowanie...
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      Importuj klientów
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Instrukcja eksportu z Booksy */}
      <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-6 lg:p-8">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Jak wyeksportować klientów z Booksy?</h3>
        
        <div className="grid sm:grid-cols-5 gap-4">
          {[
            { step: '1', text: 'Zaloguj się do panelu Booksy' },
            { step: '2', text: 'Przejdź do zakładki Klienci' },
            { step: '3', text: 'Kliknij Eksportuj (ikona pobierania)' },
            { step: '4', text: 'Wybierz format CSV' },
            { step: '5', text: 'Wgraj plik tutaj' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold mb-3">
                {item.step}
              </div>
              <p className="text-sm text-[var(--text-muted)]">{item.text}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Potrzebujesz pomocy? Napisz do nas na support@rezerwacja24.pl
          </p>
          <button
            onClick={downloadSampleCSV}
            className="text-sm text-teal-500 hover:text-teal-400 flex items-center gap-2 font-medium"
          >
            <Download className="w-4 h-4" />
            Pobierz przykładowy plik
          </button>
        </div>
      </div>
    </div>
  )
}
