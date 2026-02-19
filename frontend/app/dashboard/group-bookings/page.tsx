'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Clock,
  Calendar,
  MapPin,
  X,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Repeat,
  Check,
  UserX,
  ListOrdered,
  BarChart3,
  DollarSign,
  ArrowUpFromLine,
  Eye,
  EyeOff,
  Search,
  UserCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation';

interface GroupBookingType {
  id: string;
  name: string;
  description: string | null;
  maxParticipants: number;
  minParticipants: number;
  pricePerPerson: number;
  duration: number;
  isActive: boolean;
}

interface Participant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  customer?: {
    firstName: string;
    lastName: string;
  };
}

interface GroupBooking {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  pricePerPerson: number;
  status: string;
  type: GroupBookingType;
  employeeId?: string | null;
  isPublic?: boolean;
  employee?: {
    id?: string;
    firstName: string;
    lastName: string;
  };
  participants: Participant[];
  _count?: {
    participants: number;
    waitlist: number;
  };
}

export default function GroupBookingsPage() {
  const { t, language } = useDashboardTranslation();
  const currency = language === 'pl' ? 'zł' : '€';
  const [types, setTypes] = useState<GroupBookingType[]>([]);
  const [bookings, setBookings] = useState<GroupBooking[]>([]);
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [editingType, setEditingType] = useState<GroupBookingType | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<GroupBooking | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'types' | 'stats'>('bookings');
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showEditBookingModal, setShowEditBookingModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [addMode, setAddMode] = useState<'customer' | 'external'>('customer');

  // Type form
  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    maxParticipants: 10,
    minParticipants: 1,
    pricePerPerson: 0,
    duration: 60,
  });

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    typeId: '',
    title: '',
    description: '',
    startTime: '',
    employeeId: '',
  });

  // Participant form
  const [participantForm, setParticipantForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Recurring form
  const [recurringForm, setRecurringForm] = useState({
    typeId: '',
    title: '',
    description: '',
    startTime: '',
    employeeId: '',
    recurrence: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly',
    occurrences: 4,
  });

  // Edit booking form
  const [editBookingForm, setEditBookingForm] = useState({
    title: '',
    description: '',
    startTime: '',
    employeeId: '',
    maxParticipants: 10,
  });

  useEffect(() => {
    fetchTypes();
    fetchBookings();
    fetchEmployees();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/group-bookings/types', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTypes(data);
      }
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/group-bookings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      toast.error('Błąd podczas pobierania rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Type handlers
  const openTypeModal = (type?: GroupBookingType) => {
    if (type) {
      setEditingType(type);
      setTypeForm({
        name: type.name,
        description: type.description || '',
        maxParticipants: type.maxParticipants,
        minParticipants: type.minParticipants,
        pricePerPerson: Number(type.pricePerPerson),
        duration: type.duration,
      });
    } else {
      setEditingType(null);
      setTypeForm({
        name: '',
        description: '',
        maxParticipants: 10,
        minParticipants: 1,
        pricePerPerson: 0,
        duration: 60,
      });
    }
    setShowTypeModal(true);
  };

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingType 
        ? `/api/group-bookings/types/${editingType.id}` 
        : '/api/group-bookings/types';
      const method = editingType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(typeForm),
      });

      if (response.ok) {
        toast.success(editingType ? 'Typ zaktualizowany' : 'Typ utworzony');
        fetchTypes();
        setShowTypeModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Wystąpił błąd');
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten typ zajęć?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Typ zajęć usunięty');
        fetchTypes();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Nie można usunąć typu z aktywnymi rezerwacjami');
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    }
  };

  // Booking handlers
  const openBookingModal = () => {
    setBookingForm({
      typeId: types[0]?.id || '',
      title: '',
      description: '',
      startTime: '',
      employeeId: '',
    });
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/group-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingForm),
      });

      if (response.ok) {
        toast.success('Rezerwacja grupowa utworzona');
        fetchBookings();
        setShowBookingModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Wystąpił błąd');
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Czy na pewno chcesz anulować tę rezerwację?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Rezerwacja anulowana');
        fetchBookings();
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    }
  };

  // Participant handlers
  const openParticipantModal = (booking: GroupBooking) => {
    setSelectedBooking(booking);
    setParticipantForm({ name: '', email: '', phone: '' });
    setShowParticipantModal(true);
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${selectedBooking.id}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(participantForm),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.addedToWaitlist) {
          toast.success(`Dodano do listy oczekujących (pozycja ${result.position})`);
        } else {
          toast.success('Uczestnik dodany');
        }
        fetchBookings();
        setShowParticipantModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Wystąpił błąd');
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveParticipant = async (bookingId: string, participantId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego uczestnika?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${bookingId}/participants/${participantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Uczestnik usunięty');
        fetchBookings();
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    }
  };

  // ==================== CYKLICZNE ZAJĘCIA ====================
  const openRecurringModal = () => {
    setRecurringForm({
      typeId: types[0]?.id || '',
      title: '',
      description: '',
      startTime: '',
      employeeId: '',
      recurrence: 'weekly',
      occurrences: 4,
    });
    setShowRecurringModal(true);
  };

  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/group-bookings/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(recurringForm),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Utworzono ${result.count} zajęć cyklicznych`);
        fetchBookings();
        setShowRecurringModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Wystąpił błąd');
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    } finally {
      setSaving(false);
    }
  };

  // ==================== EDYCJA REZERWACJI ====================
  const openEditBookingModal = (booking: GroupBooking) => {
    setSelectedBooking(booking);
    setEditBookingForm({
      title: booking.title,
      description: booking.description || '',
      startTime: new Date(booking.startTime).toISOString().slice(0, 16),
      employeeId: booking.employeeId || '',
      maxParticipants: booking.maxParticipants,
    });
    setShowEditBookingModal(true);
  };

  const handleEditBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${selectedBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editBookingForm),
      });

      if (response.ok) {
        toast.success('Rezerwacja zaktualizowana');
        fetchBookings();
        setShowEditBookingModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Wystąpił błąd');
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    } finally {
      setSaving(false);
    }
  };

  // ==================== CHECK-IN ====================
  const handleCheckIn = async (bookingId: string, participantId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${bookingId}/participants/${participantId}/check-in`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Check-in wykonany');
        fetchBookings();
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    }
  };

  const handleNoShow = async (bookingId: string, participantId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${bookingId}/participants/${participantId}/no-show`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Oznaczono jako nieobecny');
        fetchBookings();
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    }
  };

  const handleCheckInAll = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${bookingId}/check-in-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Check-in dla ${result.checkedIn} uczestników`);
        fetchBookings();
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    }
  };

  // ==================== WAITLISTA ====================
  const openWaitlistModal = async (booking: GroupBooking) => {
    setSelectedBooking(booking);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${booking.id}/waitlist`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWaitlist(data);
      }
    } catch (error) {
      console.error('Error fetching waitlist:', error);
    }
    setShowWaitlistModal(true);
  };

  const handlePromoteFromWaitlist = async (waitlistId?: string) => {
    if (!selectedBooking) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${selectedBooking.id}/waitlist/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ waitlistId }),
      });

      if (response.ok) {
        toast.success('Przeniesiono z listy oczekujących');
        fetchBookings();
        // Refresh waitlist
        openWaitlistModal(selectedBooking);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Wystąpił błąd');
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    }
  };

  // ==================== STATYSTYKI ====================
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/group-bookings/stats/summary', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // ==================== OZNACZ JAKO OPŁACONE ====================
  const handleMarkAsPaid = async (bookingId: string, participantIds: string[]) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${bookingId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ participantIds }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Oznaczono ${result.markedAsPaid} jako opłacone`);
        fetchBookings();
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    }
  };

  // ==================== TOGGLE VISIBILITY ====================
  const handleToggleVisibility = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/group-bookings/${bookingId}/toggle-visibility`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.isPublic ? 'Zajęcia są teraz publiczne' : 'Zajęcia są teraz prywatne');
        fetchBookings();
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">Otwarta</span>;
      case 'FULL':
        return <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">Pełna</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-full">Anulowana</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">Zakończona</span>;
      default:
        return null;
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Rezerwacje grupowe</h1>
          <p className="text-[var(--text-muted)] mt-1">
            Zarządzaj zajęciami grupowymi i warsztatami
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'bookings' && types.length > 0 && (
            <>
              <button
                onClick={openRecurringModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-full font-medium hover:bg-[var(--bg-card-hover)] transition-all duration-200"
              >
                <Repeat className="w-4 h-4" />
                Cykliczne
              </button>
              <button
                onClick={openBookingModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Nowa rezerwacja
              </button>
            </>
          )}
          {activeTab === 'types' && (
            <button
              onClick={() => openTypeModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nowy typ zajęć
            </button>
          )}
        </div>
      </div>

      {/* Tabs - Pill Style */}
      <div className="flex gap-2 mb-8 p-1.5 bg-[var(--bg-card)] rounded-2xl w-fit border border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'bookings'
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Rezerwacje
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'types'
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Typy zajęć
        </button>
        <button
          onClick={() => { setActiveTab('stats'); fetchStats(); }}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'stats'
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Statystyki
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <>
          {types.length === 0 ? (
            <div className="text-center py-12 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              <Users className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                Najpierw utwórz typ zajęć
              </h3>
              <p className="text-[var(--text-muted)] mb-4">
                Aby tworzyć rezerwacje grupowe, musisz najpierw zdefiniować typy zajęć
              </p>
              <button
                onClick={() => { setActiveTab('types'); openTypeModal(); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Utwórz typ zajęć
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              <Calendar className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                Brak rezerwacji grupowych
              </h3>
              <p className="text-[var(--text-muted)] mb-4">
                Utwórz pierwszą rezerwację grupową
              </p>
              <button
                onClick={openBookingModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Utwórz rezerwację
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">
                          {booking.title}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">{booking.type.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.status === 'OPEN' && (
                        <button
                          onClick={() => openParticipantModal(booking)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          Dodaj
                        </button>
                      )}
                      {booking._count && booking._count.waitlist > 0 && (
                        <button
                          onClick={() => openWaitlistModal(booking)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <ListOrdered className="w-4 h-4" />
                          {booking._count.waitlist}
                        </button>
                      )}
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <>
                          <button
                            onClick={() => handleToggleVisibility(booking.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              booking.isPublic !== false 
                                ? 'hover:bg-emerald-500/20 text-emerald-400' 
                                : 'hover:bg-orange-500/20 text-orange-400'
                            }`}
                            title={booking.isPublic !== false ? 'Publiczne - kliknij aby ukryć' : 'Prywatne - kliknij aby pokazać'}
                          >
                            {booking.isPublic !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEditBookingModal(booking)}
                            className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                            title="Edytuj"
                          >
                            <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Anuluj"
                          >
                            <XCircle className="w-5 h-5 text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-[var(--text-muted)]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(booking.startTime)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {booking.type.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {booking.currentParticipants}/{booking.maxParticipants} uczestników
                    </div>
                    <div className="text-emerald-500 font-medium">
                      {Number(booking.pricePerPerson).toFixed(2)} zł/os
                    </div>
                  </div>

                  {/* Participants */}
                  {booking.participants.length > 0 && (
                    <div className="border-t border-[var(--border-color)] pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-[var(--text-secondary)]">Uczestnicy:</p>
                        {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && booking.participants.length > 0 && (
                          <button
                            onClick={() => handleCheckInAll(booking.id)}
                            className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Check-in wszystkich
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {booking.participants.map((p) => (
                          <div
                            key={p.id}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                              p.status === 'CHECKED_IN' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                              p.status === 'NO_SHOW' ? 'bg-red-500/20 border border-red-500/30' :
                              'bg-[var(--bg-secondary)]'
                            }`}
                          >
                            <span className="text-[var(--text-primary)]">{p.name}</span>
                            {p.status === 'CHECKED_IN' && <Check className="w-3 h-3 text-emerald-400" />}
                            {p.status === 'NO_SHOW' && <UserX className="w-3 h-3 text-red-400" />}
                            {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && p.status === 'CONFIRMED' && (
                              <div className="flex items-center gap-1 ml-1">
                                <button
                                  onClick={() => handleCheckIn(booking.id, p.id)}
                                  className="text-emerald-400 hover:text-emerald-300"
                                  title="Check-in"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleNoShow(booking.id, p.id)}
                                  className="text-orange-400 hover:text-orange-300"
                                  title="Nieobecny"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveParticipant(booking.id, p.id)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Usuń"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Types Tab */}
      {activeTab === 'types' && (
        <>
          {types.length === 0 ? (
            <div className="text-center py-12 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              <Users className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                Brak typów zajęć
              </h3>
              <p className="text-[var(--text-muted)] mb-4">
                Utwórz pierwszy typ zajęć grupowych
              </p>
              <button
                onClick={() => openTypeModal()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Utwórz typ zajęć
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {types.map((type) => (
                <div
                  key={type.id}
                  className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-6 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {type.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openTypeModal(type)}
                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                      <button
                        onClick={() => handleDeleteType(type.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {type.description && (
                    <p className="text-sm text-[var(--text-muted)] mb-4">
                      {type.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mb-4 text-sm text-[var(--text-muted)]">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {type.minParticipants}-{type.maxParticipants} os.
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {type.duration} min
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-emerald-500">
                    {Number(type.pricePerPerson).toFixed(2)} zł/os
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-lg w-full border border-[var(--border-color)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {editingType ? 'Edytuj typ zajęć' : 'Nowy typ zajęć'}
              </h2>
              <button onClick={() => setShowTypeModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleTypeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Nazwa
                </label>
                <input
                  type="text"
                  value={typeForm.name}
                  onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  placeholder="np. Warsztaty makijażu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Opis
                </label>
                <textarea
                  value={typeForm.description}
                  onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Min. uczestników
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={typeForm.minParticipants}
                    onChange={(e) => setTypeForm({ ...typeForm, minParticipants: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Max. uczestników
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={typeForm.maxParticipants}
                    onChange={(e) => setTypeForm({ ...typeForm, maxParticipants: parseInt(e.target.value) || 10 })}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Czas trwania (min)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={typeForm.duration}
                    onChange={(e) => setTypeForm({ ...typeForm, duration: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Cena za osobę (zł)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={typeForm.pricePerPerson}
                    onChange={(e) => setTypeForm({ ...typeForm, pricePerPerson: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="px-6 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingType ? 'Zapisz' : 'Utwórz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-lg w-full border border-[var(--border-color)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Nowa rezerwacja grupowa
              </h2>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Typ zajęć
                </label>
                <select
                  value={bookingForm.typeId}
                  onChange={(e) => setBookingForm({ ...bookingForm, typeId: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  required
                >
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.duration} min, {Number(type.pricePerPerson).toFixed(2)} zł/os)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Tytuł
                </label>
                <input
                  type="text"
                  value={bookingForm.title}
                  onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  placeholder="np. Warsztaty makijażu wieczorowego"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Opis (opcjonalnie)
                </label>
                <textarea
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Data i godzina
                </label>
                <input
                  type="datetime-local"
                  value={bookingForm.startTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Prowadzący (opcjonalnie)
                </label>
                <select
                  value={bookingForm.employeeId}
                  onChange={(e) => setBookingForm({ ...bookingForm, employeeId: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Brak przypisanego prowadzącego</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-6 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Utwórz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participant Modal */}
      {showParticipantModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-lg w-full border border-[var(--border-color)] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] flex-shrink-0">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Dodaj uczestnika
              </h2>
              <button onClick={() => { setShowParticipantModal(false); setAddMode('customer'); setSelectedCustomerId(null); setCustomerSearchQuery(''); }} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (addMode === 'customer' && selectedCustomerId) {
                const customer = customers.find(c => c.id === selectedCustomerId);
                if (customer) {
                  setParticipantForm({
                    name: `${customer.firstName} ${customer.lastName}`,
                    email: customer.email || '',
                    phone: customer.phone || '',
                  });
                  // Trigger submit after setting form
                  setTimeout(() => handleAddParticipant(e), 0);
                }
              } else {
                handleAddParticipant(e);
              }
            }} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="bg-[var(--bg-secondary)] rounded-xl p-4 mb-4">
                <p className="text-sm text-[var(--text-muted)]">
                  {selectedBooking.title} • {selectedBooking.currentParticipants}/{selectedBooking.maxParticipants} uczestników
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 p-1.5 bg-[var(--bg-secondary)] rounded-xl">
                <button
                  type="button"
                  onClick={() => { setAddMode('customer'); setParticipantForm({ name: '', email: '', phone: '' }); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    addMode === 'customer'
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Istniejący klient
                </button>
                <button
                  type="button"
                  onClick={() => { setAddMode('external'); setSelectedCustomerId(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    addMode === 'external'
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <UserCircle className="w-4 h-4" />
                  Osoba z zewnątrz
                </button>
              </div>

              {/* Customer Selection Mode */}
              {addMode === 'customer' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Wybierz klienta
                  </label>
                  {/* Search input */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="Szukaj klienta..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  {/* Customer list */}
                  <div className="max-h-48 overflow-y-auto bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                    {customers
                      .filter(c => {
                        if (!customerSearchQuery) return true;
                        const query = customerSearchQuery.toLowerCase();
                        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
                        return fullName.includes(query) || c.phone?.includes(query) || c.email?.toLowerCase().includes(query);
                      })
                      .slice(0, 50)
                      .map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => setSelectedCustomerId(customer.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-b border-[var(--border-color)] last:border-b-0 ${
                            selectedCustomerId === customer.id
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold">{customer.firstName?.[0]}{customer.lastName?.[0]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{customer.firstName} {customer.lastName}</p>
                            <p className="text-xs text-[var(--text-muted)] truncate">{customer.phone}</p>
                          </div>
                          {selectedCustomerId === customer.id && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    {customers.filter(c => {
                      if (!customerSearchQuery) return true;
                      const query = customerSearchQuery.toLowerCase();
                      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
                      return fullName.includes(query) || c.phone?.includes(query) || c.email?.toLowerCase().includes(query);
                    }).length === 0 && (
                      <div className="px-4 py-6 text-center text-[var(--text-muted)]">
                        <p className="text-sm">Nie znaleziono klientów</p>
                      </div>
                    )}
                  </div>
                  {selectedCustomerId && (
                    <p className="text-xs text-emerald-500 mt-2">
                      Wybrany: {customers.find(c => c.id === selectedCustomerId)?.firstName} {customers.find(c => c.id === selectedCustomerId)?.lastName}
                    </p>
                  )}
                </div>
              )}

              {/* External Person Mode */}
              {addMode === 'external' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Imię i nazwisko
                    </label>
                    <input
                      type="text"
                      value={participantForm.name}
                      onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Email (opcjonalnie)
                    </label>
                    <input
                      type="email"
                      value={participantForm.email}
                      onChange={(e) => setParticipantForm({ ...participantForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Telefon (opcjonalnie)
                    </label>
                    <input
                      type="tel"
                      value={participantForm.phone}
                      onChange={(e) => setParticipantForm({ ...participantForm, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </>
              )}

              {selectedBooking.currentParticipants >= selectedBooking.maxParticipants && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm text-yellow-400">
                    Zajęcia są pełne. Uczestnik zostanie dodany do listy oczekujących.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => { setShowParticipantModal(false); setAddMode('customer'); setSelectedCustomerId(null); setCustomerSearchQuery(''); }}
                  className="px-6 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={saving || (addMode === 'customer' && !selectedCustomerId) || (addMode === 'external' && !participantForm.name)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Dodaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recurring Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-lg w-full border border-[var(--border-color)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Cykliczne zajęcia grupowe
              </h2>
              <button onClick={() => setShowRecurringModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleRecurringSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Typ zajęć</label>
                <select
                  value={recurringForm.typeId}
                  onChange={(e) => setRecurringForm({ ...recurringForm, typeId: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                  required
                >
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Tytuł</label>
                <input
                  type="text"
                  value={recurringForm.title}
                  onChange={(e) => setRecurringForm({ ...recurringForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Data i godzina pierwszych zajęć</label>
                <input
                  type="datetime-local"
                  value={recurringForm.startTime}
                  onChange={(e) => setRecurringForm({ ...recurringForm, startTime: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Powtarzaj</label>
                  <select
                    value={recurringForm.recurrence}
                    onChange={(e) => setRecurringForm({ ...recurringForm, recurrence: e.target.value as any })}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                  >
                    <option value="daily">Codziennie</option>
                    <option value="weekly">Co tydzień</option>
                    <option value="biweekly">Co 2 tygodnie</option>
                    <option value="monthly">Co miesiąc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Liczba powtórzeń</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={recurringForm.occurrences}
                    onChange={(e) => setRecurringForm({ ...recurringForm, occurrences: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Prowadzący (opcjonalnie)</label>
                <select
                  value={recurringForm.employeeId}
                  onChange={(e) => setRecurringForm({ ...recurringForm, employeeId: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value="">Brak</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border-color)]">
                <button type="button" onClick={() => setShowRecurringModal(false)} className="px-6 py-2 text-[var(--text-muted)]">
                  Anuluj
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Utwórz {recurringForm.occurrences} zajęć
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-lg w-full border border-[var(--border-color)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Lista oczekujących - {selectedBooking.title}
              </h2>
              <button onClick={() => setShowWaitlistModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="p-6">
              {waitlist.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] py-8">Brak osób na liście oczekujących</p>
              ) : (
                <div className="space-y-3">
                  {waitlist.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          #{entry.position} {entry.name}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">{entry.email} • {entry.phone}</p>
                      </div>
                      {selectedBooking.currentParticipants < selectedBooking.maxParticipants && (
                        <button
                          onClick={() => handlePromoteFromWaitlist(entry.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg"
                        >
                          <ArrowUpFromLine className="w-4 h-4" />
                          Przenieś
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-lg w-full border border-[var(--border-color)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Edytuj rezerwację
              </h2>
              <button onClick={() => setShowEditBookingModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleEditBookingSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Tytuł</label>
                <input
                  type="text"
                  value={editBookingForm.title}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Opis</label>
                <textarea
                  value={editBookingForm.description}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Data i godzina</label>
                <input
                  type="datetime-local"
                  value={editBookingForm.startTime}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, startTime: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Max uczestników (obecnie: {selectedBooking.currentParticipants})
                </label>
                <input
                  type="number"
                  min={selectedBooking.currentParticipants}
                  value={editBookingForm.maxParticipants}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, maxParticipants: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Prowadzący</label>
                <select
                  value={editBookingForm.employeeId}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, employeeId: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                >
                  <option value="">Brak</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border-color)]">
                <button type="button" onClick={() => setShowEditBookingModal(false)} className="px-6 py-2 text-[var(--text-muted)]">
                  Anuluj
                </button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Zapisz zmiany
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : stats ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                  <p className="text-sm text-[var(--text-muted)]">Wszystkie zajęcia</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.summary.totalBookings}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                  <p className="text-sm text-[var(--text-muted)]">Zakończone</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.summary.completedBookings}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                  <p className="text-sm text-[var(--text-muted)]">Anulowane</p>
                  <p className="text-2xl font-bold text-red-500">{stats.summary.cancelledBookings}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                  <p className="text-sm text-[var(--text-muted)]">Uczestnicy</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.summary.totalParticipants}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                  <p className="text-sm text-[var(--text-muted)]">Przychód</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.summary.totalRevenue.toFixed(0)} {currency}</p>
                </div>
                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-4">
                  <p className="text-sm text-[var(--text-muted)]">Śr. frekwencja</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.summary.avgOccupancy}%</p>
                </div>
              </div>

              {/* Popular Types */}
              {stats.popularTypes.length > 0 && (
                <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-6">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Najpopularniejsze typy zajęć</h3>
                  <div className="space-y-3">
                    {stats.popularTypes.map((type: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{type.name}</p>
                          <p className="text-sm text-[var(--text-muted)]">{type.count} zajęć • {type.participants} uczestników</p>
                        </div>
                        <p className="text-emerald-500 font-bold">{type.revenue.toFixed(0)} {currency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-[var(--text-muted)]">
              Brak danych statystycznych
            </div>
          )}
        </div>
      )}
    </div>
  );
}
