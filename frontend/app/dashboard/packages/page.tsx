'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Clock,
  DollarSign,
  Percent,
  X,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation';

interface Service {
  id: string;
  name: string;
  basePrice: number;
  duration: number;
}

interface PackageItem {
  id: string;
  serviceId: string;
  service: Service;
  order: number;
}

interface ServicePackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number;
  duration: number;
  isActive: boolean;
  items: PackageItem[];
}

export default function PackagesPage() {
  const { t, language } = useDashboardTranslation();
  const currency = language === 'pl' ? 'zł' : '€';
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    serviceIds: [] as string[],
  });

  useEffect(() => {
    fetchPackages();
    fetchServices();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/packages', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      toast.error('Błąd podczas pobierania pakietów');
    } finally {
      setLoading(false);
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
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const openModal = (pkg?: ServicePackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description || '',
        price: Number(pkg.price),
        serviceIds: pkg.items.map(i => i.serviceId),
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        serviceIds: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPackage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.serviceIds.length < 2) {
      toast.error('Pakiet musi zawierać co najmniej 2 usługi');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingPackage 
        ? `/api/packages/${editingPackage.id}` 
        : '/api/packages';
      const method = editingPackage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingPackage ? 'Pakiet zaktualizowany' : 'Pakiet utworzony');
        fetchPackages();
        closeModal();
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

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten pakiet?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success('Pakiet usunięty');
        fetchPackages();
      }
    } catch (error) {
      toast.error('Wystąpił błąd');
    }
  };

  const toggleService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const calculateOriginalPrice = () => {
    return formData.serviceIds.reduce((sum, id) => {
      const service = services.find(s => s.id === id);
      return sum + (service ? Number(service.basePrice) : 0);
    }, 0);
  };

  const calculateDuration = () => {
    return formData.serviceIds.reduce((sum, id) => {
      const service = services.find(s => s.id === id);
      return sum + (service ? service.duration : 0);
    }, 0);
  };

  const calculateSavings = () => {
    const original = calculateOriginalPrice();
    if (original === 0) return 0;
    return Math.round(((original - formData.price) / original) * 100);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Pakiety usług</h1>
          <p className="text-[var(--text-muted)] mt-1">
            Twórz pakiety łączące kilka usług w atrakcyjnej cenie
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nowy pakiet
        </button>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Brak pakietów
          </h3>
          <p className="text-[var(--text-muted)] mb-6">
            Utwórz pierwszy pakiet usług, aby oferować klientom atrakcyjne zestawy
          </p>
          <button
            onClick={() => openModal()}
            className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-medium hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            Utwórz pakiet
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const savings = pkg.originalPrice > 0 
              ? Math.round(((Number(pkg.originalPrice) - Number(pkg.price)) / Number(pkg.originalPrice)) * 100)
              : 0;

            return (
              <div
                key={pkg.id}
                className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-all duration-200"
              >
                {savings > 0 && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full mb-3">
                    <Percent className="w-3 h-3" />
                    Oszczędzasz {savings}%
                  </div>
                )}

                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  {pkg.name}
                </h3>

                {pkg.description && (
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    {pkg.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {pkg.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {item.service.name}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-[var(--text-muted)]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {pkg.duration} min
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="line-through">{Number(pkg.originalPrice).toFixed(2)} zł</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-emerald-500">
                    {Number(pkg.price).toFixed(2)} zł
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(pkg)}
                      className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border-color)]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {editingPackage ? 'Edytuj pakiet' : 'Nowy pakiet'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Nazwa pakietu
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  placeholder="np. Pakiet Pana Młodego"
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
                  rows={3}
                  placeholder="Krótki opis pakietu..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Wybierz usługi (min. 2)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        formData.serviceIds.includes(service.id)
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-[var(--border-color)] hover:border-emerald-500/50'
                      }`}
                    >
                      <span className="text-sm text-[var(--text-primary)]">{service.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {Number(service.basePrice).toFixed(0)} zł
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.serviceIds.length >= 2 && (
                <div className="bg-[var(--bg-secondary)] rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Suma usług:</span>
                    <span className="text-[var(--text-primary)]">{calculateOriginalPrice().toFixed(2)} zł</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Łączny czas:</span>
                    <span className="text-[var(--text-primary)]">{calculateDuration()} min</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Cena pakietu (zł)
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
                {formData.price > 0 && formData.price < calculateOriginalPrice() && (
                  <p className="text-sm text-emerald-400 mt-2">
                    Klient oszczędza {calculateSavings()}% ({(calculateOriginalPrice() - formData.price).toFixed(2)} zł)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={saving || formData.serviceIds.length < 2}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingPackage ? 'Zapisz zmiany' : 'Utwórz pakiet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
