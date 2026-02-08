'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Zap,
  Download,
  RefreshCw
} from 'lucide-react'
import StatCard from '@/components/analytics/StatCard'
import ChartCard from '@/components/analytics/ChartCard'
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
  getConversionData,
  getPeakHoursData,
  getEmployeesData,
  getServicesData,
  getCustomersData,
  getRetentionData,
  getForecastData
} from '@/lib/analytics-api'

const COLORS = ['#41FFBC', '#0F6048', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [overview, setOverview] = useState<any>(null)
  const [revenue, setRevenue] = useState<any>(null)
  const [bookings, setBookings] = useState<any>(null)
  const [customers, setCustomers] = useState<any>(null)
  const [employees, setEmployees] = useState<any>(null)
  const [services, setServices] = useState<any>(null)
  const [peakHours, setPeakHours] = useState<any>(null)
  const [retention, setRetention] = useState<any>(null)
  const [conversion, setConversion] = useState<any>(null)
  const [forecast, setForecast] = useState<any>(null)

  const getDateRange = () => {
    const end = new Date()
    const start = new Date()
    
    if (period === 'week') {
      start.setDate(end.getDate() - 7)
    } else if (period === 'month') {
      start.setDate(end.getDate() - 30)
    } else {
      start.setDate(end.getDate() - 90)
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  }

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const { startDate, endDate } = getDateRange()

      // Pobierz dane z API
      const [
        overviewData,
        revenueData,
        bookingsData,
        customersData,
        employeesData,
        servicesData,
        peakHoursData,
        retentionData,
        conversionData,
        forecastData
      ] = await Promise.all([
        getAnalyticsOverview(startDate, endDate),
        getRevenueData(startDate, endDate),
        getBookingsData(startDate, endDate),
        getCustomersData(startDate, endDate),
        getEmployeesData(startDate, endDate),
        getServicesData(startDate, endDate),
        getPeakHoursData(startDate, endDate),
        getRetentionData(),
        getConversionData(startDate, endDate),
        getForecastData()
      ])

      setOverview(overviewData)
      setRevenue(revenueData)
      setBookings(bookingsData)
      setCustomers(customersData)
      setEmployees(employeesData)
      setServices(servicesData)
      setPeakHours(peakHoursData)
      setRetention(retentionData)
      setConversion(conversionData)
      setForecast(forecastData)
    } catch (error) {
      console.error('Błąd ładowania analityki:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
    
    // Auto-refresh co 5 minut
    const interval = setInterval(() => {
      console.log('Auto-refreshing analytics...')
      loadAnalytics()
    }, 5 * 60 * 1000) // 5 minut
    
    return () => clearInterval(interval)
  }, [period])

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <RefreshCw className="w-8 h-8 text-accent-neon animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analityka</h1>
            <p className="text-neutral-gray/70">Szczegółowe statystyki i raporty biznesowe</p>
          </div>
          <button
            onClick={loadAnalytics}
            className="btn-outline-neon flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Odśwież</span>
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'week' ? 'bg-primary-green text-white' : 'text-neutral-gray hover:bg-white/5'
            }`}
          >
            Tydzień
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'month' ? 'bg-primary-green text-white' : 'text-neutral-gray hover:bg-white/5'
            }`}
          >
            Miesiąc
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'quarter' ? 'bg-primary-green text-white' : 'text-neutral-gray hover:bg-white/5'
            }`}
          >
            Kwartał
          </button>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Rezerwacje"
              value={overview.bookings.total}
              change={overview.bookings.growth}
              icon={Calendar}
              trend={overview.bookings.growth >= 0 ? 'up' : 'down'}
              subtitle={`${overview.bookings.completed} ukończonych`}
            />
            <StatCard
              title="Przychód"
              value={`${overview.revenue.total.toLocaleString('pl-PL')} zł`}
              change={overview.revenue.growth}
              icon={DollarSign}
              delay={0.1}
              trend={overview.revenue.growth >= 0 ? 'up' : 'down'}
              subtitle={`Średnio ${overview.revenue.averageBookingValue} zł/wizyta`}
            />
            <StatCard
              title="Klienci"
              value={overview.customers.total}
              icon={Users}
              delay={0.2}
              subtitle={`${overview.customers.active} aktywnych (${overview.customers.activeRate}%)`}
            />
            <StatCard
              title="Wskaźnik ukończenia"
              value={`${overview.bookings.completionRate}%`}
              icon={Target}
              delay={0.3}
              subtitle={`${overview.bookings.cancellationRate}% anulowań`}
            />
          </div>
        )}

        {/* Revenue Chart */}
        {revenue && (
          <ChartCard title="Przychody w czasie" delay={0.4}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenue.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#41FFBC" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#41FFBC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#41FFBC"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Bookings & Conversion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {bookings && (
            <ChartCard title="Status rezerwacji" delay={0.5}>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={bookings.byStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentage }) => `${status}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {bookings.byStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {conversion && (
            <ChartCard title="Wskaźniki konwersji" delay={0.6}>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-gray">Potwierdzenia</span>
                    <span className="text-white font-bold">{conversion.confirmationRate}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${conversion.confirmationRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-gray">Ukończenia</span>
                    <span className="text-white font-bold">{conversion.completionRate}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-accent-neon h-2 rounded-full"
                      style={{ width: `${conversion.completionRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-gray">Anulowania</span>
                    <span className="text-white font-bold">{conversion.cancellationRate}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${conversion.cancellationRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-gray">No-show</span>
                    <span className="text-white font-bold">{conversion.noShowRate}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${conversion.noShowRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </ChartCard>
          )}
        </div>

        {/* Peak Hours */}
        {peakHours && (
          <ChartCard title="Godziny szczytu" delay={0.7}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHours.hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="hour" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="bookingsCount" fill="#41FFBC" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-neutral-gray mb-2">Szczyt aktywności:</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">Godzina: {peakHours.peak.hour.hour}:00</p>
                  <p className="text-sm text-neutral-gray">{peakHours.peak.hour.bookingsCount} rezerwacji</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">Dzień: {peakHours.peak.day.day}</p>
                  <p className="text-sm text-neutral-gray">{peakHours.peak.day.bookingsCount} rezerwacji</p>
                </div>
              </div>
            </div>
          </ChartCard>
        )}

        {/* Employees & Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {employees && employees.employees.length > 0 && (
            <ChartCard title="Top pracownicy" delay={0.8}>
              <div className="space-y-3">
                {employees.employees.slice(0, 5).map((employee: any, index: number) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-carbon-black">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{employee.name}</p>
                        <p className="text-xs text-neutral-gray">{employee.bookingsCount} rezerwacji</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-accent-neon font-bold">{employee.totalRevenue.toLocaleString('pl-PL')} zł</p>
                      <p className="text-xs text-neutral-gray">{employee.cancellationRate}% anulowań</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}

          {services && services.services.length > 0 && (
            <ChartCard title="Najpopularniejsze usługi" delay={0.9}>
              <div className="space-y-3">
                {services.services.slice(0, 5).map((service: any, index: number) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-carbon-black">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{service.name}</p>
                        <p className="text-xs text-neutral-gray">{service.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-accent-neon font-bold">{service.bookingsCount} rezerwacji</p>
                      <p className="text-xs text-neutral-gray">{service.totalRevenue.toLocaleString('pl-PL')} zł</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </div>

        {/* Customers Analytics */}
        {customers && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Segmentacja klientów" delay={1.0}>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={customers.segmentation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {customers.segmentation.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top klienci" delay={1.1}>
              <div className="space-y-3">
                {customers.topCustomers.slice(0, 5).map((customer: any, index: number) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-carbon-black">{customer.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{customer.name}</p>
                        <p className="text-xs text-neutral-gray">{customer.bookingsCount} wizyt</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-accent-neon font-bold">{customer.totalSpent.toLocaleString('pl-PL')} zł</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        )}

        {/* Retention & Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {retention && (
            <ChartCard title="Retention Rate" delay={1.2}>
              <div className="space-y-6">
                <div className="text-center p-6 bg-white/5 rounded-lg">
                  <p className="text-4xl font-bold text-accent-neon mb-2">{retention.retentionRate}%</p>
                  <p className="text-neutral-gray">Wskaźnik powracających klientów</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-white mb-1">{retention.returningCustomers}</p>
                    <p className="text-sm text-neutral-gray">Powracający</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-white mb-1">{retention.oneTimeCustomers}</p>
                    <p className="text-sm text-neutral-gray">Jednorazowi</p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-neutral-gray mb-1">Średni czas między wizytami</p>
                  <p className="text-xl font-bold text-white">{retention.averageTimeBetweenBookings} dni</p>
                </div>
              </div>
            </ChartCard>
          )}

          {forecast && forecast.forecast.length > 0 && (
            <ChartCard title="Prognoza przychodów" delay={1.3}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[...forecast.historical.slice(-4), ...forecast.forecast]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="week" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#41FFBC"
                    strokeWidth={2}
                    name="Historyczne"
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedRevenue"
                    stroke="#FFD700"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Prognoza"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-gray">Trend</p>
                    <p className="text-lg font-bold text-white capitalize">
                      {forecast.trend === 'growing' && <span className="text-green-400">Rosnący ↗</span>}
                      {forecast.trend === 'declining' && <span className="text-red-400">Spadający ↘</span>}
                      {forecast.trend === 'stable' && <span className="text-yellow-400">Stabilny →</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-gray">Tempo wzrostu</p>
                    <p className="text-lg font-bold text-white">{forecast.growthRate}%</p>
                  </div>
                </div>
              </div>
            </ChartCard>
          )}
        </div>

        {/* Revenue by Category */}
        {revenue && revenue.byDayOfWeek && (
          <ChartCard title="Przychody według dni tygodnia" delay={1.4}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenue.byDayOfWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="revenue" fill="#0F6048" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  )
}
