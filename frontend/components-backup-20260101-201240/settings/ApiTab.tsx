'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  ExternalLink,
  Code,
} from 'lucide-react';
import { getTenantId } from '@/lib/storage';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export default function ApiTab() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const tenantId = getTenantId();
      
      console.log('📥 Loading API keys for tenant:', tenantId);
      
      if (!tenantId) {
        console.error('❌ No tenant ID found');
        setApiKeys([]);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/api-keys', {
        headers: {
          'x-tenant-id': tenantId,
        },
      });
      
      console.log('📡 Load response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API keys loaded:', data);
        // Upewnij się że data jest tablicą
        setApiKeys(Array.isArray(data) ? data : []);
      } else {
        console.error('❌ Failed to load API keys:', response.status);
        setApiKeys([]);
      }
    } catch (error) {
      console.error('❌ Error loading API keys:', error);
      setApiKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopied(keyId);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleGenerateKey = async () => {
    try {
      const tenantId = getTenantId();
      
      console.log('🔑 Generating API key...', {
        tenantId,
        name: newKeyName || 'New API Key'
      });
      
      if (!tenantId) {
        alert('Błąd: Nie można zidentyfikować firmy');
        return;
      }
      
      const response = await fetch('/api/api-keys/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({ name: newKeyName || 'New API Key' }),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API key generated:', data);
        await loadApiKeys();
        setNewKeyName('');
        setShowNewKeyModal(false);
      } else {
        const error = await response.json();
        console.error('❌ Error response:', error);
        alert(`Błąd: ${error.error || 'Nie udało się wygenerować klucza'}`);
      }
    } catch (error) {
      console.error('❌ Error generating API key:', error);
      alert('Błąd podczas generowania klucza API');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten klucz API? Ta akcja jest nieodwracalna.')) {
      try {
        const tenantId = getTenantId();
        
        if (!tenantId) {
          alert('Błąd: Nie można zidentyfikować firmy');
          return;
        }
        
        const response = await fetch(`/api/api-keys/${keyId}`, {
          method: 'DELETE',
          headers: {
            'x-tenant-id': tenantId,
          },
        });
        
        if (response.ok) {
          await loadApiKeys();
        }
      } catch (error) {
        console.error('Error deleting API key:', error);
      }
    }
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '••••••••••••••••' + key.substring(key.length - 4);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Klucze API</h2>
          <p className="text-sm sm:text-base text-neutral-gray">Zarządzaj dostępem do API Rezerwacja24</p>
        </div>
        <button
          onClick={() => setShowNewKeyModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-dark-bg font-semibold rounded-lg transition-all text-sm sm:text-base w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          Generuj nowy klucz
        </button>
      </div>

      {/* API Documentation Link */}
      <div className="glass-card p-4 sm:p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg flex-shrink-0 w-fit">
            <Code className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Dokumentacja API</h3>
            <p className="text-sm sm:text-base text-gray-300 mb-4">
              Poznaj wszystkie endpointy, parametry i przykłady użycia naszego API
            </p>
            <a
              href="https://api.rezerwacja24.pl/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm sm:text-base"
            >
              Przejdź do dokumentacji
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Key className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Brak kluczy API</h3>
            <p className="text-gray-400 mb-4">Wygeneruj pierwszy klucz aby rozpocząć integrację</p>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-dark-bg font-semibold rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Generuj klucz
            </button>
          </div>
        ) : (
          apiKeys.map((apiKey) => (
            <motion.div
              key={apiKey.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1 truncate">{apiKey.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Utworzono: {new Date(apiKey.createdAt).toLocaleDateString('pl-PL')}
                    {apiKey.lastUsed && (
                      <span className="hidden sm:inline"> • Ostatnie użycie: {new Date(apiKey.lastUsed).toLocaleDateString('pl-PL')}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteKey(apiKey.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 self-end sm:self-start"
                  title="Usuń klucz"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 p-2 sm:p-3 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                <code className="flex-1 text-xs sm:text-sm text-white font-mono truncate">
                  {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                </code>
                <button
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  title={showKeys[apiKey.id] ? 'Ukryj' : 'Pokaż'}
                >
                  {showKeys[apiKey.id] ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleCopy(apiKey.key, apiKey.id)}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  title="Kopiuj"
                >
                  {copied === apiKey.id ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Security Notice */}
      <div className="glass-card p-3 sm:p-4 bg-yellow-500/10 border-yellow-500/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-yellow-400 font-medium mb-1 text-sm sm:text-base">Ważne informacje bezpieczeństwa</p>
            <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
              <li>• Nie udostępniaj kluczy API publicznie</li>
              <li>• Przechowuj klucze w bezpiecznym miejscu</li>
              <li>• Regularnie rotuj klucze API</li>
              <li>• Usuń nieużywane klucze</li>
            </ul>
          </div>
        </div>
      </div>

      {/* New Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Generuj nowy klucz API</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2">
                Nazwa klucza
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="np. Production API Key"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-neon"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={handleGenerateKey}
                className="flex-1 px-4 py-2 bg-accent-neon hover:bg-accent-neon/90 text-dark-bg font-semibold rounded-lg transition-all"
              >
                Generuj
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
