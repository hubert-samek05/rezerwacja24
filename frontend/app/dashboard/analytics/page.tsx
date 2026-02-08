'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Clock,
  BarChart3,
  Target,
  Award,
  Download,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Printer,
  Mail,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import {
  getAnalyticsOverview,
  getRevenueData,
  getBookingsData,
  getPeakHoursData,
  getEmployeesData,
  getServicesData,
} from '@/lib/analytics-api'
import toast from 'react-hot-toast'
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const { t, language } = useDashboardTranslation()
  const currency = language === 'pl' ? 'zł' : '€'
  
  const STATUS_LABELS: { [key: string]: string } = {
    'PENDING': t.labels.pending,
    'CONFIRMED': t.labels.confirmed,
    'COMPLETED': t.labels.completed,
    'CANCELLED': t.labels.cancelled,
    'NO_SHOW': language === 'pl' ? 'Nieobecność' : language === 'de' ? 'Nicht erschienen' : 'No show'
  }
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [overview, setOverview] = useState<any>(null)
  const [revenue, setRevenue] = useState<any>(null)
  const [bookings, setBookings] = useState<any>(null)
  const [employees, setEmployees] = useState<any>(null)
  const [services, setServices] = useState<any>(null)
  const [peakHours, setPeakHours] = useState<any>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getDateRange = () => {
    const end = new Date()
    const start = new Date()
    
    if (period === 'week') start.setDate(end.getDate() - 7)
    else if (period === 'month') start.setDate(end.getDate() - 30)
    else if (period === 'quarter') start.setDate(end.getDate() - 90)
    else start.setDate(end.getDate() - 365)
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  }

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const { startDate, endDate } = getDateRange()
      
      const [overviewData, revenueData, bookingsData, employeesData, servicesData, peakHoursData] = await Promise.all([
        getAnalyticsOverview(startDate, endDate).catch(() => null),
        getRevenueData(startDate, endDate).catch(() => null),
        getBookingsData(startDate, endDate).catch(() => null),
        getEmployeesData(startDate, endDate).catch(() => null),
        getServicesData(startDate, endDate).catch(() => null),
        getPeakHoursData(startDate, endDate).catch(() => null)
      ])
      
      setOverview(overviewData)
      setRevenue(revenueData)
      setBookings(bookingsData)
      setEmployees(employeesData)
      setServices(servicesData)
      setPeakHours(peakHoursData)
    } catch (error) {
      console.error('Błąd ładowania analityki:', error)
      setError('Nie udało się załadować danych analitycznych')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const exportToCSV = (type: string) => {
    toast.success(t.analytics?.exportingCSV || `Exporting ${type} to CSV...`)
    setShowExportMenu(false)
  }

  const exportToPDF = () => {
    toast.success(t.analytics?.generatingPDF || 'Generating PDF report...')
    setShowExportMenu(false)
  }

  const sendReportByEmail = () => {
    toast.success(t.analytics?.sendingEmail || 'Sending report to email...')
    setShowExportMenu(false)
  }

  const printReport = () => {
    window.print()
    setShowExportMenu(false)
  }

  // Przygotuj dane do wykresów
  const prepareChartData = () => {
    // Dane przychodów
    const revenueChartData = revenue?.chartData || []
    
    // Dane statusów rezerwacji
    const bookingsStatusData = bookings?.byStatus?.map((item: any) => ({
      ...item,
      name: STATUS_LABELS[item.status] || item.status
    })) || []
    
    // Dane godzin szczytu - filtruj tylko godziny z rezerwacjami lub pokaż 8-20
    const peakHoursData = peakHours?.hourly?.filter((h: any) => {
      const hour = parseInt(h.hour)
      return hour >= 8 && hour <= 20
    }).map((h: any) => ({
      hour: h.hour,
      bookings: h.bookingsCount
    })) || []
    
    // Top usługi
    const topServicesData = services?.services?.slice(0, 5).map((s: any) => ({
      name: s.name,
      bookings: s.bookingsCount,
      revenue: s.totalRevenue
    })) || []
    
    // Top pracownicy
    const topEmployeesData = employees?.employees?.slice(0, 5).map((e: any) => ({
      name: e.name,
      bookings: e.bookingsCount,
      revenue: e.totalRevenue
    })) || []
    
    return { revenueChartData, bookingsStatusData, peakHoursData, topServicesData, topEmployeesData }
  }

  const { revenueChartData, bookingsStatusData, peakHoursData, topServicesData, topEmployeesData } = prepareChartData()

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Analityka</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Statystyki i raporty biznesowe</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period Selector */}
          <div className="flex bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  period === p 
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {p === 'week' ? '7 dni' : p === 'month' ? '30 dni' : p === 'quarter' ? '90 dni' : 'Rok'}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={loadAnalytics}
            className="p-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-[var(--text-muted)]" />
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" />
              <span>Eksportuj</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-2">
                  <p className="px-3 py-2 text-xs text-[var(--text-muted)] uppercase font-medium">Raporty</p>
                  <button onClick={exportToPDF} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg">
                    <FileText className="w-4 h-4 text-red-500" />
                    Raport PDF
                  </button>
                  <button onClick={() => exportToCSV('all')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg">
                    <FileSpreadsheet className="w-4 h-4 text-green-500" />
                    Eksport CSV
                  </button>
                </div>
                <div className="border-t border-[var(--border-color)] p-2">
                  <p className="px-3 py-2 text-xs text-[var(--text-muted)] uppercase font-medium">Dane szczegółowe</p>
                  <button onClick={() => exportToCSV('revenue')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg">
                    <DollarSign className="w-4 h-4" />
                    Przychody CSV
                  </button>
                  <button onClick={() => exportToCSV('bookings')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg">
                    <Calendar className="w-4 h-4" />
                    Rezerwacje CSV
                  </button>
                  <button onClick={() => exportToCSV('customers')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg">
                    <Users className="w-4 h-4" />
                    Klienci CSV
                  </button>
                </div>
                <div className="border-t border-[var(--border-color)] p-2">
                  <button onClick={sendReportByEmail} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg">
                    <Mail className="w-4 h-4" />
                    Wyślij na email
                  </button>
                  <button onClick={printReport} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg">
                    <Printer className="w-4 h-4" />
                    Drukuj raport
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">Przychód</span>
            {overview?.revenue?.growth !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${overview.revenue.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {overview.revenue.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(overview.revenue.growth)}%
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{(overview?.revenue?.total || 0).toLocaleString('pl-PL')} zł</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Śr. {overview?.revenue?.averageBookingValue || 0} zł/wizyta</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">Rezerwacje</span>
            {overview?.bookings?.growth !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${overview.bookings.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {overview.bookings.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(overview.bookings.growth)}%
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{overview?.bookings?.total || 0}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{overview?.bookings?.completed || 0} ukończonych</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">Klienci</span>
            <Users className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{overview?.customers?.total || 0}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{overview?.customers?.new || 0} nowych w okresie</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-[var(--text-muted)]">Wskaźnik ukończenia</span>
            <Target className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{overview?.bookings?.completionRate || 0}%</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{overview?.bookings?.cancellationRate || 0}% anulowań</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Przychody</h3>
            <span className="text-sm text-[var(--text-muted)]">{(revenue?.total || 0).toLocaleString('pl-PL')} zł łącznie</span>
          </div>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  formatter={(value: number) => [`${value} zł`, 'Przychód']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[var(--text-muted)]">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Brak danych o przychodach</p>
                <p className="text-xs">Dane pojawią się po dodaniu rezerwacji</p>
              </div>
            </div>
          )}
        </div>

        {/* Bookings by Status */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Status rezerwacji</h3>
          {bookingsStatusData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <RechartsPieChart>
                  <Pie data={bookingsStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="count">
                    {bookingsStatusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    formatter={(value: number, name: string, props: any) => [value, props.payload.name]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {bookingsStatusData.map((item: any, index: number) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-sm text-[var(--text-muted)]">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-[var(--text-muted)]">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Brak rezerwacji</p>
                <p className="text-xs">Dane pojawią się po dodaniu rezerwacji</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Services */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Najpopularniejsze usługi</h3>
          {topServicesData.length > 0 ? (
            <div className="space-y-3">
              {topServicesData.map((service: any, index: number) => (
                <div key={service.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center text-xs font-medium text-[var(--text-muted)]">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{service.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{service.bookings} rezerwacji</p>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{service.revenue} zł</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-[var(--text-muted)]">
              <div className="text-center">
                <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Brak danych</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Employees */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Najlepsi pracownicy</h3>
          {topEmployeesData.length > 0 ? (
            <div className="space-y-3">
              {topEmployeesData.map((emp: any, index: number) => (
                <div key={emp.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center text-xs font-medium text-[var(--text-primary)]">
                    {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{emp.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{emp.bookings} wizyt</p>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{emp.revenue} zł</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-[var(--text-muted)]">
              <div className="text-center">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Brak danych</p>
              </div>
            </div>
          )}
        </div>

        {/* Peak Hours */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Godziny szczytu</h3>
          {peakHoursData.length > 0 && peakHoursData.some((h: any) => h.bookings > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={10} />
                <YAxis stroke="var(--text-muted)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  formatter={(value: number) => [value, 'Rezerwacji']}
                />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-[var(--text-muted)]">
              <div className="text-center">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Brak danych</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Średni przychód/dzień</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">{revenue?.average || 0} zł</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Rezerwacji/dzień</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                {revenueChartData.length > 0 ? Math.round((overview?.bookings?.total || 0) / revenueChartData.length) : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Aktywni klienci</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">{overview?.customers?.activeRate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Top pracownik</p>
              <p className="text-lg font-semibold text-[var(--text-primary)] truncate max-w-[120px]">
                {employees?.topPerformer?.name || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
      )}
    </div>
  )
}
