'use client';

import { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Clock,
  Users,
  Calendar,
  X,
  ShoppingCart,
  BarChart3,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation';

interface PassType {
  id: string;
  name: string;
  description: string | null;
  passKind: 'VISITS' | 'TIME';
  visitsCount: number | null;
  validityDays: number;
  price: number;
  isActive: boolean;
}

interface CustomerPass {
  id: string;
  customerId: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  passType: PassType;
  purchaseDate: string;
  expiresAt: string;
  visitsUsed: number;
  visitsTotal: number | null;
  status: string;
}

interface Stats {
  active: number;
  expired: number;
  usedUp: number;
  totalSold: number;
}

export default function PassesPage() {
  const { t, language } = useDashboardTranslation();
  const currency = language === 'pl' ? 'zł' : '€';
  const [passTypes, setPassTypes] = useState<PassType[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [editingType, setEditingType] = useState<PassType | null>(null);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedPassType, setSelectedPassType] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [soldPasses, setSoldPasses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'types' | 'sold'>('types');
  const [filterStatus, setFilterStatus] = useState('all');
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    passKind: 'VISITS' as 'VISITS' | 'TIME',
    visitsCount: 10,
    validityDays: 30,
    price: 0,
    serviceIds: [] as string[],
  });

  useEffect(() => {
    fetchPassTypes();
    fetchStats();
    fetchCustomers();
    fetchSoldPasses();
    fetchServices();
  }, []);

  const fetchPassTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/passes/types', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPassTypes(data);
      }
    } catch (error) {
      toast.error(t.passes?.loadError || 'Failed to load passes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/passes/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchSoldPasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/passes/sold?status=${filterStatus}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSoldPasses(data);
      }
    } catch (error) {
      console.error('Error fetching sold passes:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/services', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Odśwież sprzedane karnety przy zmianie filtra
  useEffect(() => {
    fetchSoldPasses();
  }, [filterStatus]);

  const openModal = (type?: PassType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description || '',
        passKind: type.passKind,
        visitsCount: type.visitsCount || 10,
        validityDays: type.validityDays,
        price: Number(type.price),
        serviceIds: (type as any).serviceIds || [],
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        description: '',
        passKind: 'VISITS',
        visitsCount: 10,
        validityDays: 30,
        price: 0,
        serviceIds: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingType 
        ? `/api/passes/types/${editingType.id}` 
        : '/api/passes/types';
      const method = editingType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingType ? (t.passes?.updated || 'Pass updated') : (t.passes?.created || 'Pass created'));
        fetchPassTypes();
        closeModal();
      } else {
        const error = await response.json();
        toast.error(error.message || t.common?.error || 'An error occurred');
      }
    } catch (error) {
      toast.error(t.common?.error || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten typ karnetu?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/passes/types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success(t.passes?.deleted || 'Pass deleted');
        fetchPassTypes();
      }
    } catch (error) {
      toast.error(t.common?.error || 'An error occurred');
    }
  };

  const handleSellPass = async () => {
    if (!selectedPassType || !selectedCustomer) {
      toast.error(t.passes?.selectPassAndCustomer || 'Select pass and customer');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/passes/sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          passTypeId: selectedPassType,
          customerId: selectedCustomer,
        }),
      });

      if (response.ok) {
        toast.success(t.passes?.sold || 'Pass sold!');
        setShowSellModal(false);
        setSelectedPassType('');
        setSelectedCustomer('');
        fetchStats();
      } else {
        const error = await response.json();
        toast.error(error.message || t.common?.error || 'An error occurred');
      }
    } catch (error) {
      toast.error(t.common?.error || 'An error occurred');
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Karnety</h1>
          <p className="text-[var(--text-muted)] mt-1">
            Zarządzaj karnetami wizytowymi i czasowymi
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSellModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-full font-medium hover:bg-[var(--bg-card-hover)] transition-all duration-200"
          >
            <ShoppingCart className="w-4 h-4" />
            Sprzedaj karnet
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nowy typ karnetu
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.active}</p>
            <p className="text-xs text-[var(--text-muted)]">Aktywne</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.expired}</p>
            <p className="text-xs text-[var(--text-muted)]">Wygasłe</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.usedUp}</p>
            <p className="text-xs text-[var(--text-muted)]">Wykorzystane</p>
          </div>
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-5 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalSold}</p>
            <p className="text-xs text-[var(--text-muted)]">Sprzedanych</p>
          </div>
        </div>
      )}

      {/* Tabs - Pill Style */}
      <div className="flex gap-2 mb-8 p-1.5 bg-[var(--bg-card)] rounded-2xl w-fit border border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('types')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'types'
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Typy karnetów
        </button>
        <button
          onClick={() => setActiveTab('sold')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            activeTab === 'sold'
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Sprzedane karnety ({soldPasses.length})
        </button>
      </div>

      {/* Pass Types Grid */}
      {activeTab === 'types' && (passTypes.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Brak typów karnetów
          </h3>
          <p className="text-[var(--text-muted)] mb-6">
            Utwórz pierwszy typ karnetu, aby móc sprzedawać karnety klientom
          </p>
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            Utwórz typ karnetu
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passTypes.map((type) => (
            <div
              key={type.id}
              className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  type.passKind === 'VISITS' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {type.passKind === 'VISITS' ? 'Wizytowy' : 'Czasowy'}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(type)}
                    className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                {type.name}
              </h3>

              {type.description && (
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  {type.description}
                </p>
              )}

              <div className="flex items-center gap-4 mb-4 text-sm text-[var(--text-muted)]">
                {type.passKind === 'VISITS' && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {type.visitsCount} wizyt
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {type.validityDays} dni ważności
                </div>
              </div>

              <div className="text-2xl font-bold text-emerald-500">
                {Number(type.price).toFixed(2)} zł
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Sold Passes List */}
      {activeTab === 'sold' && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
          {/* Search and Filter */}
          <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Szukaj po nazwisku, telefonie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            {/* Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm"
              >
                <option value="all">Wszystkie</option>
                <option value="ACTIVE">Aktywne</option>
                <option value="EXPIRED">Wygasłe</option>
                <option value="USED_UP">Wykorzystane</option>
                <option value="CANCELLED">Anulowane</option>
              </select>
            </div>
          </div>

          {(() => {
            // Filtruj sprzedane karnety po wyszukiwaniu
            const filteredPasses = soldPasses.filter((pass: any) => {
              if (!searchQuery) return true;
              const query = searchQuery.toLowerCase();
              const customerName = `${pass.customer?.firstName || ''} ${pass.customer?.lastName || ''}`.toLowerCase();
              const phone = (pass.customer?.phone || '').toLowerCase();
              const passName = (pass.passType?.name || '').toLowerCase();
              return customerName.includes(query) || phone.includes(query) || passName.includes(query);
            });

            return filteredPasses.length === 0 ? (
            <div className="p-8 text-center">
              <Ticket className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-4" />
              <p className="text-[var(--text-muted)]">Brak sprzedanych karnetów</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Klient</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Karnet</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Wykorzystane</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Wygasa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-muted)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPasses.map((pass: any) => {
                    const isExpired = new Date(pass.expiresAt) < new Date()
                    const isUsedUp = pass.passType?.passKind === 'VISITS' && pass.visitsUsed >= (pass.visitsTotal || 0)
                    const isActive = pass.status === 'ACTIVE' && !isExpired && !isUsedUp
                    
                    return (
                      <tr key={pass.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">
                              {pass.customer?.firstName} {pass.customer?.lastName}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">{pass.customer?.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[var(--text-primary)]">{pass.passType?.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {pass.passType?.passKind === 'VISITS' ? 'Wizytowy' : 'Czasowy'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {pass.passType?.passKind === 'VISITS' ? (
                            <span className="text-[var(--text-primary)]">
                              {pass.visitsUsed || 0} / {pass.visitsTotal || 0}
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                          {new Date(pass.expiresAt).toLocaleDateString('pl-PL')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            isActive 
                              ? 'bg-green-500/20 text-green-400' 
                              : isExpired 
                              ? 'bg-red-500/20 text-red-400'
                              : isUsedUp
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {isActive ? 'Aktywny' : isExpired ? 'Wygasły' : isUsedUp ? 'Wykorzystany' : pass.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          );
          })()}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-[var(--border-color)]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] flex-shrink-0">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {editingType ? 'Edytuj typ karnetu' : 'Nowy typ karnetu'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Nazwa karnetu
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  placeholder="np. Karnet 10 wizyt"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Opis (opcjonalnie)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Typ karnetu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, passKind: 'VISITS' })}
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      formData.passKind === 'VISITS'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-[var(--border-color)] hover:border-emerald-500/50'
                    }`}
                  >
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Wizytowy</span>
                    <p className="text-xs text-[var(--text-muted)]">Określona liczba wizyt</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, passKind: 'TIME' })}
                    className={`p-4 rounded-lg border text-center transition-colors ${
                      formData.passKind === 'TIME'
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-[var(--border-color)] hover:border-emerald-500/50'
                    }`}
                  >
                    <Clock className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">Czasowy</span>
                    <p className="text-xs text-[var(--text-muted)]">Nielimitowane wizyty</p>
                  </button>
                </div>
              </div>

              {formData.passKind === 'VISITS' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Liczba wizyt
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.visitsCount}
                    onChange={(e) => setFormData({ ...formData, visitsCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Ważność (dni)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 30 })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Cena (zł)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Wybór usług */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Usługi objęte karnetem (opcjonalnie)
                </label>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Zostaw puste, aby karnet obejmował wszystkie usługi
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2 bg-[var(--bg-secondary)] rounded-lg p-3 border border-[var(--border-color)]">
                  {services.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">Brak usług</p>
                  ) : (
                    services.map((service: any) => (
                      <label key={service.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.serviceIds.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, serviceIds: [...formData.serviceIds, service.id] });
                            } else {
                              setFormData({ ...formData, serviceIds: formData.serviceIds.filter(id => id !== service.id) });
                            }
                          }}
                          className="w-4 h-4 rounded border-[var(--border-color)] text-emerald-500"
                        />
                        <div className="flex-1">
                          <span className="text-[var(--text-primary)]">{service.name}</span>
                          <span className="text-xs text-[var(--text-muted)] ml-2">
                            ({service.duration} min, {Number(service.basePrice || service.price || 0).toFixed(0)} zł)
                          </span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {formData.serviceIds.length > 0 && (
                  <p className="text-xs text-emerald-500 mt-2">
                    Wybrano {formData.serviceIds.length} usług
                  </p>
                )}
              </div>

            </form>
            
            {/* Footer z przyciskami - zawsze widoczny */}
            <div className="flex justify-end gap-4 p-5 border-t border-[var(--border-color)] flex-shrink-0 bg-[var(--bg-card)]">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                }}
                disabled={saving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingType ? 'Zapisz zmiany' : 'Utwórz karnet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-lg w-full border border-[var(--border-color)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Sprzedaj karnet
              </h2>
              <button onClick={() => setShowSellModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Wybierz karnet
                </label>
                <select
                  value={selectedPassType}
                  onChange={(e) => setSelectedPassType(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Wybierz...</option>
                  {passTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {Number(type.price).toFixed(2)} zł
                    </option>
                  ))}
                </select>
              </div>

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
                        onClick={() => setSelectedCustomer(customer.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-b border-[var(--border-color)] last:border-b-0 ${
                          selectedCustomer === customer.id
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
                        {selectedCustomer === customer.id && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
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
                {selectedCustomer && (
                  <p className="text-xs text-emerald-500 mt-2">
                    Wybrany: {customers.find(c => c.id === selectedCustomer)?.firstName} {customers.find(c => c.id === selectedCustomer)?.lastName}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setShowSellModal(false)}
                  className="px-6 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSellPass}
                  disabled={saving || !selectedPassType || !selectedCustomer}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Sprzedaj karnet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
