'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  FileText, 
  Search, 
  Building2,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Upload,
  X,
  Mail,
  User,
  Calendar,
  AlertCircle,
  Plus,
  Eye,
  Link as LinkIcon
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Invoice {
  id: string
  tenantId: string
  stripeInvoiceId: string | null
  amount: number
  currency: string
  status: string
  description: string | null
  invoiceUrl: string | null
  invoicePdf: string | null
  paidAt: string | null
  createdAt: string
  tenant_name?: string
  tenant_email?: string
}

type TabType = 'paid' | 'unpaid'

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('paid')
  const [selectedMonth, setSelectedMonth] = useState('all') // domyślnie wszystkie
  
  // Modal dodawania PDF
  const [showAddPdfModal, setShowAddPdfModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [uploadMode, setUploadMode] = useState<'link' | 'file'>('link')
  const [saving, setSaving] = useState(false)
  
  // Modal szczegółów klienta
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [clientDetails, setClientDetails] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token')
      const isProduction = window.location.hostname.includes('rezerwacja24.pl')
      const apiUrl = isProduction ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/admin/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        // API zwraca { data: [...], pagination: {...} }
        const invoicesList = data.data || data || []
        setInvoices(Array.isArray(invoicesList) ? invoicesList : [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClientDetails = async (tenantId: string) => {
    setLoadingDetails(true)
    try {
      const token = localStorage.getItem('token')
      const isProduction = window.location.hostname.includes('rezerwacja24.pl')
      const apiUrl = isProduction ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      
      const response = await fetch(`${apiUrl}/api/admin/tenants/${tenantId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setClientDetails(data)
        setShowDetailsModal(true)
      }
    } catch (error) {
      console.error('Error fetching client details:', error)
      toast.error('Błąd pobierania danych klienta')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleAddPdf = async () => {
    if (!selectedInvoice) return

    // Walidacja
    if (uploadMode === 'link' && !pdfUrl.trim()) {
      toast.error('Podaj link do PDF faktury')
      return
    }
    if (uploadMode === 'file' && !pdfFile) {
      toast.error('Wybierz plik PDF')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const isProduction = window.location.hostname.includes('rezerwacja24.pl')
      const apiUrl = isProduction ? 'https://api.rezerwacja24.pl' : 'http://localhost:3001'
      
      let response: Response

      if (uploadMode === 'file' && pdfFile) {
        // Upload pliku
        const formData = new FormData()
        formData.append('pdf', pdfFile)
        
        response = await fetch(`${apiUrl}/api/admin/invoices/${selectedInvoice.id}/upload-pdf`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        })
      } else {
        // Link do PDF
        response = await fetch(`${apiUrl}/api/admin/invoices/${selectedInvoice.id}/update`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ invoicePdf: pdfUrl }),
        })
      }

      if (response.ok) {
        toast.success('Faktura PDF dodana')
        closeAddPdfModal()
        fetchInvoices()
      } else {
        toast.error('Błąd dodawania faktury')
      }
    } catch (error) {
      console.error('Error adding PDF:', error)
      toast.error('Błąd połączenia z serwerem')
    } finally {
      setSaving(false)
    }
  }

  const closeAddPdfModal = () => {
    setShowAddPdfModal(false)
    setPdfUrl('')
    setPdfFile(null)
    setUploadMode('link')
    setSelectedInvoice(null)
  }

  // Filtrowanie po miesiącu
  const filteredByMonth = selectedMonth === 'all' 
    ? invoices 
    : invoices.filter(inv => {
        const date = new Date(inv.createdAt)
        const invMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return invMonth === selectedMonth
      })

  // Filtrowanie po zakładce
  const paidInvoices = filteredByMonth.filter(i => i.status === 'paid')
  const unpaidInvoices = filteredByMonth.filter(i => i.status !== 'paid')
  const displayedInvoices = activeTab === 'paid' ? paidInvoices : unpaidInvoices

  // Statystyki
  const paidWithInvoice = paidInvoices.filter(i => i.invoicePdf).length
  const paidWithoutInvoice = paidInvoices.filter(i => !i.invoicePdf).length
  const totalPaidAmount = paidInvoices.reduce((sum, i) => sum + Number(i.amount), 0)
  const totalUnpaidAmount = unpaidInvoices.reduce((sum, i) => sum + Number(i.amount), 0)

  // Generuj listę miesięcy
  const getMonthOptions = () => {
    const months: { value: string; label: string }[] = [
      { value: 'all', label: 'Wszystkie' }
    ]
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })
      months.push({ value, label })
    }
    return months
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Płatności i faktury</h1>
          <p className="text-gray-400">Zarządzaj płatnościami i dodawaj faktury PDF</p>
        </div>
        
        {/* Wybór miesiąca */}
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#41FFBC]"
          >
            {getMonthOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{totalPaidAmount.toFixed(2)} zł</div>
          <div className="text-gray-400 text-sm">Opłacone ({paidInvoices.length})</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">{totalUnpaidAmount.toFixed(2)} zł</div>
          <div className="text-gray-400 text-sm">Nieopłacone ({unpaidInvoices.length})</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-[#41FFBC]">{paidWithInvoice}</div>
          <div className="text-gray-400 text-sm">Z fakturą PDF</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-red-500/50">
          <div className="text-2xl font-bold text-red-400">{paidWithoutInvoice}</div>
          <div className="text-gray-400 text-sm">Brak faktury!</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('paid')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'paid'
              ? 'bg-green-500/20 text-green-400 border border-green-500/50'
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Opłacone ({paidInvoices.length})
        </button>
        <button
          onClick={() => setActiveTab('unpaid')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'unpaid'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
              : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
          }`}
        >
          <Clock className="w-4 h-4" />
          Nieopłacone ({unpaidInvoices.length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {displayedInvoices.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Brak płatności w tym miesiącu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Klient</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kwota</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Faktura PDF</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {displayedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{invoice.tenant_name || 'Nieznany'}</div>
                          <div className="text-gray-400 text-sm">{invoice.tenant_email || invoice.tenantId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-bold">{Number(invoice.amount).toFixed(2)} {invoice.currency}</div>
                      {invoice.description && (
                        <div className="text-gray-500 text-xs">{invoice.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(invoice.createdAt).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.invoicePdf ? (
                        <span className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Dodana
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          Brak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Szczegóły klienta */}
                        <button
                          onClick={() => fetchClientDetails(invoice.tenantId)}
                          className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                          title="Szczegóły klienta"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        
                        {/* Dodaj/edytuj PDF */}
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setPdfUrl(invoice.invoicePdf || '')
                            setShowAddPdfModal(true)
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            invoice.invoicePdf 
                              ? 'hover:bg-gray-600' 
                              : 'bg-red-500/20 hover:bg-red-500/30'
                          }`}
                          title={invoice.invoicePdf ? 'Edytuj fakturę' : 'Dodaj fakturę'}
                        >
                          {invoice.invoicePdf ? (
                            <LinkIcon className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Plus className="w-4 h-4 text-red-400" />
                          )}
                        </button>
                        
                        {/* Pobierz PDF */}
                        {invoice.invoicePdf && (
                          <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                            title="Pobierz PDF"
                          >
                            <Download className="w-4 h-4 text-[#41FFBC]" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal dodawania PDF faktury */}
      {showAddPdfModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#41FFBC]/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#41FFBC]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedInvoice.invoicePdf ? 'Edytuj fakturę' : 'Dodaj fakturę PDF'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {selectedInvoice.tenant_name} - {Number(selectedInvoice.amount).toFixed(2)} {selectedInvoice.currency}
                  </p>
                </div>
              </div>
              <button
                onClick={closeAddPdfModal}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Wybór trybu: Link lub Plik */}
              <div className="flex gap-2 p-1 bg-gray-900 rounded-lg">
                <button
                  onClick={() => setUploadMode('link')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    uploadMode === 'link'
                      ? 'bg-[#41FFBC] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Link do PDF
                </button>
                <button
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    uploadMode === 'file'
                      ? 'bg-[#41FFBC] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Upload pliku
                </button>
              </div>

              {uploadMode === 'link' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link do PDF faktury *
                  </label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://example.com/faktura.pdf"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#41FFBC]"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Wklej link do pliku PDF faktury (np. z Google Drive, Dropbox)
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plik PDF faktury *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className={`flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      pdfFile
                        ? 'border-[#41FFBC] bg-[#41FFBC]/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-900'
                    }`}
                  >
                    {pdfFile ? (
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-[#41FFBC]" />
                        <div>
                          <p className="text-white font-medium">{pdfFile.name}</p>
                          <p className="text-gray-400 text-sm">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setPdfFile(null)
                          }}
                          className="p-1 hover:bg-gray-700 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-500 mb-2" />
                        <p className="text-gray-400">Kliknij aby wybrać plik PDF</p>
                        <p className="text-gray-500 text-xs mt-1">Maksymalnie 10 MB</p>
                      </>
                    )}
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeAddPdfModal}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleAddPdf}
                  disabled={saving || (uploadMode === 'link' ? !pdfUrl.trim() : !pdfFile)}
                  className="flex-1 px-4 py-3 bg-[#41FFBC] text-black font-semibold rounded-lg hover:bg-[#3ee6aa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      {uploadMode === 'file' ? 'Wysyłanie...' : 'Zapisywanie...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {uploadMode === 'file' ? 'Wyślij plik' : 'Zapisz'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal szczegółów klienta */}
      {showDetailsModal && clientDetails && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Szczegóły klienta</h2>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setClientDetails(null)
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs uppercase">Nazwa firmy</label>
                  <p className="text-white font-medium">{clientDetails.name || '-'}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase">Email</label>
                  <p className="text-white">{clientDetails.email || '-'}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase">NIP</label>
                  <p className="text-white">{clientDetails.nip || '-'}</p>
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase">Typ</label>
                  <p className="text-white">{clientDetails.billing_type === 'company' ? 'Firma' : 'Osoba prywatna'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-gray-500 text-xs uppercase">Adres</label>
                  <p className="text-white">
                    {clientDetails.billing_address || '-'}<br/>
                    {clientDetails.billing_postal_code} {clientDetails.billing_city}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-gray-500 text-xs uppercase">Email do faktur</label>
                  <p className="text-white">{clientDetails.billing_email || clientDetails.email || '-'}</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setClientDetails(null)
                  }}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
