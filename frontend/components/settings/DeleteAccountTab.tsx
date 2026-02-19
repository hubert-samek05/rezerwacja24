'use client'

import { useState } from 'react'
import { AlertTriangle, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getApiUrl } from '@/lib/api-url'
import { getTenantConfig } from '@/lib/tenant'

interface DeleteAccountTabProps {
  language?: 'pl' | 'en'
}

export default function DeleteAccountTab({ language = 'pl' }: DeleteAccountTabProps) {
  const [step, setStep] = useState<'info' | 'confirm' | 'password' | 'deleting' | 'deleted'>('info')
  const [password, setPassword] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [deletionInfo, setDeletionInfo] = useState<any>(null)

  const isEnglish = language === 'en'

  const t = {
    title: isEnglish ? 'Delete Account' : 'Usuń konto',
    subtitle: isEnglish 
      ? 'Permanently delete your account and all associated data' 
      : 'Trwale usuń swoje konto i wszystkie powiązane dane',
    warning: isEnglish
      ? 'This action cannot be undone. All your data will be permanently deleted.'
      : 'Ta operacja jest nieodwracalna. Wszystkie Twoje dane zostaną trwale usunięte.',
    dataDeleted: isEnglish ? 'Data that will be deleted:' : 'Dane które zostaną usunięte:',
    dataList: isEnglish ? [
      'Your user account',
      'All bookings and appointments',
      'Customer data',
      'Services and categories',
      'Employees and their accounts',
      'Payment history',
      'Subscription',
      'Company settings',
    ] : [
      'Twoje konto użytkownika',
      'Wszystkie rezerwacje i wizyty',
      'Dane klientów',
      'Usługi i kategorie',
      'Pracownicy i ich konta',
      'Historia płatności',
      'Subskrypcja',
      'Ustawienia firmy',
    ],
    confirmTitle: isEnglish ? 'Are you sure?' : 'Czy na pewno?',
    confirmText: isEnglish 
      ? 'Type "DELETE" to confirm account deletion'
      : 'Wpisz "USUŃ" aby potwierdzić usunięcie konta',
    confirmPlaceholder: isEnglish ? 'Type DELETE' : 'Wpisz USUŃ',
    confirmWord: isEnglish ? 'DELETE' : 'USUŃ',
    passwordTitle: isEnglish ? 'Enter your password' : 'Wprowadź hasło',
    passwordPlaceholder: isEnglish ? 'Your password' : 'Twoje hasło',
    passwordOptional: isEnglish 
      ? '(Optional - required only for password-protected accounts)'
      : '(Opcjonalne - wymagane tylko dla kont z hasłem)',
    deleteButton: isEnglish ? 'Delete My Account' : 'Usuń moje konto',
    cancelButton: isEnglish ? 'Cancel' : 'Anuluj',
    backButton: isEnglish ? 'Back' : 'Wróć',
    continueButton: isEnglish ? 'Continue' : 'Kontynuuj',
    deleting: isEnglish ? 'Deleting account...' : 'Usuwanie konta...',
    deleted: isEnglish ? 'Account deleted' : 'Konto usunięte',
    deletedMessage: isEnglish 
      ? 'Your account has been permanently deleted. You will be logged out.'
      : 'Twoje konto zostało trwale usunięte. Zostaniesz wylogowany.',
    error: isEnglish ? 'Failed to delete account' : 'Nie udało się usunąć konta',
  }

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const config = getTenantConfig()
    const token = localStorage.getItem('token')
    
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  }

  const loadDeletionInfo = async () => {
    try {
      const apiUrl = getApiUrl()
      const response = await fetchWithAuth(`${apiUrl}/api/auth/delete-account/info`)
      if (response.ok) {
        const data = await response.json()
        setDeletionInfo(data)
      }
    } catch (e) {
      console.error('Failed to load deletion info:', e)
    }
  }

  const handleStartDeletion = async () => {
    await loadDeletionInfo()
    setStep('confirm')
  }

  const handleConfirm = () => {
    if (confirmText.toUpperCase() === t.confirmWord) {
      setStep('password')
    } else {
      toast.error(isEnglish ? `Please type "${t.confirmWord}" to confirm` : `Proszę wpisać "${t.confirmWord}" aby potwierdzić`)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    setStep('deleting')

    try {
      const apiUrl = getApiUrl()
      const response = await fetchWithAuth(`${apiUrl}/api/auth/delete-account`, {
        method: 'POST',
        body: JSON.stringify({
          password: password || undefined,
          confirmDelete: true,
        }),
      })

      if (response.ok) {
        setStep('deleted')
        
        // Wyloguj użytkownika po 3 sekundach
        setTimeout(() => {
          localStorage.clear()
          sessionStorage.clear()
          window.location.href = '/login?account_deleted=true'
        }, 3000)
      } else {
        const error = await response.json()
        toast.error(error.message || t.error)
        setStep('password')
      }
    } catch (e) {
      toast.error(t.error)
      setStep('password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setStep('info')
    setPassword('')
    setConfirmText('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-red-200 pb-4">
        <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {t.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* Step: Info */}
      {step === 'info' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">{t.warning}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">{t.dataDeleted}</p>
            <ul className="space-y-2">
              {t.dataList.map((item, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleStartDeletion}
            className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t.deleteButton}
          </button>
        </div>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">{t.confirmTitle}</h4>
            <p className="text-sm text-red-700">{t.confirmText}</p>
          </div>

          <div>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t.confirmPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t.cancelButton}
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmText.toUpperCase() !== t.confirmWord}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.continueButton}
            </button>
          </div>
        </div>
      )}

      {/* Step: Password */}
      {step === 'password' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.passwordTitle}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{t.passwordOptional}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('confirm')}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t.backButton}
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.deleting}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {t.deleteButton}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step: Deleting */}
      {step === 'deleting' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">{t.deleting}</p>
        </div>
      )}

      {/* Step: Deleted */}
      {step === 'deleted' && (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">{t.deleted}</h4>
          <p className="text-gray-600">{t.deletedMessage}</p>
        </div>
      )}
    </div>
  )
}
