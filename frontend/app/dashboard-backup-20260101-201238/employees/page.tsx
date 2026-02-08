'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  UserCog,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  X,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { employeesApi, Employee } from '@/lib/api/employees'
import toast from 'react-hot-toast'
import TimeOffModal from '@/components/employees/TimeOffModal'
import AvailabilityModal from '@/components/employees/AvailabilityModal'

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; employee: Employee | null }>({ show: false, employee: null })
  const [showInactive, setShowInactive] = useState(false)
  const [timeOffModal, setTimeOffModal] = useState<{ show: boolean; employeeId: string; employeeName: string }>({ show: false, employeeId: '', employeeName: '' })
  const [availabilityModal, setAvailabilityModal] = useState<{ show: boolean; employeeId: string; employeeName: string }>({ show: false, employeeId: '', employeeName: '' })

  useEffect(() => {
    loadData()
  }, [showInactive])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await employeesApi.getAll({ isActive: showInactive ? undefined : true })
      setEmployees(data)
    } catch (error) {
      console.error('Błąd ładowania danych:', error)
      toast.error('Nie udało się załadować pracowników')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (employee: Employee) => {
    setDeleteModal({ show: true, employee })
  }

  const confirmDelete = async () => {
    if (!deleteModal.employee) return

    try {
      await employeesApi.delete(deleteModal.employee.id)
      toast.success('Pracownik został usunięty')
      setDeleteModal({ show: false, employee: null })
      loadData()
    } catch (error: any) {
      console.error('Błąd usuwania:', error)
      toast.error(error.response?.data?.message || 'Nie udało się usunąć pracownika')
    }
  }

  const toggleActive = async (employee: Employee) => {
    try {
      await employeesApi.update(employee.id, { isActive: !employee.isActive })
      toast.success(`Pracownik ${employee.isActive ? 'dezaktywowany' : 'aktywowany'}`)
      loadData()
    } catch (error: any) {
      console.error('Błąd zmiany statusu:', error)
      toast.error('Nie udało się zmienić statusu pracownika')
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                         employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-1">Pracownicy</h1>
            <p className="text-sm sm:text-base text-neutral-gray/70">Zarządzaj zespołem</p>
          </div>
          
          <Link href="/dashboard/employees/new" className="btn-neon flex items-center gap-1.5 text-sm sm:text-base px-3 py-2 sm:px-4 w-fit">
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Dodaj pracownika</span>
            <span className="xs:hidden">Dodaj</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="glass-card p-3 sm:p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-gray/50" />
              <input
                type="text"
                placeholder="Szukaj pracownika..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-gray/50 focus:outline-none focus:border-accent-neon"
              />
            </div>

            {/* Show Inactive Toggle */}
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm flex-shrink-0 ${
                showInactive ? 'bg-accent-neon/20 text-accent-neon' : 'bg-white/5 text-neutral-gray'
              }`}
            >
              {showInactive ? <ToggleRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ToggleLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
              <span className="hidden xs:inline">Pokaż nieaktywnych</span>
              <span className="xs:hidden">Nieaktywni</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-neon"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEmployees.length === 0 && (
          <div className="glass-card p-12 text-center">
            <UserCog className="w-16 h-16 text-neutral-gray/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Brak pracowników</h3>
            <p className="text-neutral-gray/70 mb-6">
              {searchQuery 
                ? 'Nie znaleziono pracowników spełniających kryteria'
                : 'Dodaj pierwszego pracownika do swojego zespołu'}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/employees/new" className="btn-neon inline-flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Dodaj pracownika</span>
              </Link>
            )}
          </div>
        )}

        {/* Employees Grid */}
        {!loading && filteredEmployees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card-hover p-6 ${!employee.isActive ? 'opacity-60' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: employee.color }}
                    >
                      {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      {employee.title && (
                        <p className="text-sm text-neutral-gray/70">{employee.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setAvailabilityModal({ 
                        show: true, 
                        employeeId: employee.id, 
                        employeeName: `${employee.firstName} ${employee.lastName}` 
                      })}
                      className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Dostępność (dni i godziny pracy)"
                    >
                      <Clock className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => setTimeOffModal({ 
                        show: true, 
                        employeeId: employee.id, 
                        employeeName: `${employee.firstName} ${employee.lastName}` 
                      })}
                      className="p-2 hover:bg-accent-neon/10 rounded-lg transition-colors"
                      title="Urlopy i nieobecności"
                    >
                      <Calendar className="w-4 h-4 text-accent-neon" />
                    </button>
                    <Link 
                      href={`/dashboard/employees/${employee.id}`}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-neutral-gray" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(employee)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-accent-neon" />
                    <span className="text-neutral-gray/70 truncate">{employee.email}</span>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-accent-neon" />
                      <span className="text-neutral-gray/70">{employee.phone}</span>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {employee.specialties && employee.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {employee.specialties.slice(0, 3).map((specialty, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-primary-green/20 text-accent-neon text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {employee.specialties.length > 3 && (
                        <span className="px-2 py-1 bg-white/5 text-neutral-gray text-xs rounded-full">
                          +{employee.specialties.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-gray/70">Przypisane usługi</span>
                    <span className="text-white font-semibold">{employee._count?.services || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-gray/70">Rezerwacje</span>
                    <span className="text-accent-neon font-semibold">{employee._count?.bookings || 0}</span>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => toggleActive(employee)}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      employee.isActive 
                        ? 'bg-accent-neon/20 text-accent-neon hover:bg-accent-neon/30' 
                        : 'bg-white/5 text-neutral-gray hover:bg-white/10'
                    }`}
                  >
                    {employee.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {employee.isActive ? 'Aktywny' : 'Nieaktywny'}
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteModal.show && deleteModal.employee && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setDeleteModal({ show: false, employee: null })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Usuń pracownika</h3>
                    <p className="text-neutral-gray/70 mb-4">
                      Czy na pewno chcesz usunąć pracownika <strong className="text-white">{deleteModal.employee.firstName} {deleteModal.employee.lastName}</strong>?
                      {deleteModal.employee._count && deleteModal.employee._count.bookings > 0 && (
                        <span className="block mt-2 text-red-400">
                          Ten pracownik ma {deleteModal.employee._count.bookings} rezerwacji i nie może zostać usunięty.
                        </span>
                      )}
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setDeleteModal({ show: false, employee: null })}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                      >
                        Anuluj
                      </button>
                      <button
                        onClick={confirmDelete}
                        disabled={deleteModal.employee._count && deleteModal.employee._count.bookings > 0}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteModal({ show: false, employee: null })}
                    className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-gray" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Availability Modal */}
        <AvailabilityModal
          employeeId={availabilityModal.employeeId}
          employeeName={availabilityModal.employeeName}
          isOpen={availabilityModal.show}
          onClose={() => setAvailabilityModal({ show: false, employeeId: '', employeeName: '' })}
        />

        {/* Time Off Modal */}
        <TimeOffModal
          employeeId={timeOffModal.employeeId}
          employeeName={timeOffModal.employeeName}
          isOpen={timeOffModal.show}
          onClose={() => setTimeOffModal({ show: false, employeeId: '', employeeName: '' })}
        />
      </div>
    </div>
  )
}
