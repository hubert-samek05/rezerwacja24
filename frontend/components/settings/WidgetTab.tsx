'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Code, ExternalLink, Eye, Smartphone, Monitor, RefreshCw, Palette } from 'lucide-react'
import { getTenantId } from '@/lib/storage'

export default function WidgetTab() {
  const [copied, setCopied] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [tenantId, setTenantId] = useState('')
  const [widgetColor, setWidgetColor] = useState('#000000')
  const [widgetPosition, setWidgetPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right')

  useEffect(() => {
    const id = getTenantId()
    if (id) setTenantId(id)
  }, [])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.rezerwacja24.pl'
  const widgetUrl = `${apiUrl}/widget/${tenantId}`
  
  // Kod przycisku - prosty link
  const buttonCode = `<!-- Przycisk Rezerwacji - Rezerwacja24 -->
<a href="${apiUrl}/booking/${tenantId}" 
   target="_blank"
   rel="noopener"
   style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:${widgetColor};color:#fff;border-radius:10px;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;font-weight:600;font-size:15px;box-shadow:0 4px 14px rgba(0,0,0,0.15);transition:transform 0.2s,box-shadow 0.2s;"
   onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'"
   onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 14px rgba(0,0,0,0.15)'">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
  Zarezerwuj wizytę
</a>`

  // Kod pływającego widgetu
  const floatingWidgetCode = `<!-- Pływający Widget Rezerwacji - Rezerwacja24 -->
<script>
(function() {
  var btn = document.createElement('div');
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  btn.style.cssText = 'position:fixed;${widgetPosition === 'bottom-right' ? 'right:24px' : 'left:24px'};bottom:24px;width:60px;height:60px;background:${widgetColor};border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.25);z-index:9999;color:#fff;transition:transform 0.3s;';
  btn.onmouseover = function() { this.style.transform = 'scale(1.1)'; };
  btn.onmouseout = function() { this.style.transform = 'scale(1)'; };
  btn.onclick = function() { window.open('${apiUrl}/booking/${tenantId}', '_blank'); };
  document.body.appendChild(btn);
})();
</script>`

  // Kod iframe - osadzony formularz
  const iframeCode = `<!-- Osadzony Formularz Rezerwacji - Rezerwacja24 -->
<div style="max-width:600px;margin:0 auto;">
  <iframe 
    src="${apiUrl}/embed/${tenantId}" 
    width="100%" 
    height="700" 
    frameborder="0"
    style="border:none;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
  </iframe>
</div>`

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Widget rezerwacji</h2>
        <p className="text-[var(--text-muted)] mt-1">Osadź formularz rezerwacji na dowolnej stronie internetowej</p>
      </div>

      {/* Konfiguracja widgetu */}
      <div className="mb-8 p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[var(--text-muted)]" />
          <h3 className="font-semibold text-[var(--text-primary)]">Personalizacja</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Kolor przycisku</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={widgetColor}
                onChange={(e) => setWidgetColor(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-[var(--border-color)]"
              />
              <input
                type="text"
                value={widgetColor}
                onChange={(e) => setWidgetColor(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Pozycja widgetu pływającego</label>
            <div className="flex gap-2">
              <button
                onClick={() => setWidgetPosition('bottom-right')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${widgetPosition === 'bottom-right' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'}`}
              >
                Prawy dolny
              </button>
              <button
                onClick={() => setWidgetPosition('bottom-left')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors ${widgetPosition === 'bottom-left' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'}`}
              >
                Lewy dolny
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Kody do osadzenia */}
        <div className="space-y-6">
          {/* Przycisk */}
          <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Przycisk rezerwacji</h3>
                <p className="text-sm text-[var(--text-muted)]">Prosty przycisk do umieszczenia w dowolnym miejscu</p>
              </div>
              <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                Zalecane
              </span>
            </div>
            <div className="relative">
              <pre className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-mono text-[var(--text-muted)] overflow-x-auto max-h-36 whitespace-pre-wrap">
                {buttonCode}
              </pre>
              <button
                onClick={() => handleCopy(buttonCode, 'button')}
                className="absolute top-3 right-3 p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                {copied === 'button' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
              </button>
            </div>
            {/* Podgląd przycisku */}
            <div className="mt-4 p-4 bg-[var(--bg-card)] rounded-xl">
              <p className="text-xs text-[var(--text-muted)] mb-3">Podgląd:</p>
              <button 
                style={{ background: widgetColor }}
                className="inline-flex items-center gap-2 px-7 py-3.5 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Zarezerwuj wizytę
              </button>
            </div>
          </div>

          {/* Pływający widget */}
          <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Pływający widget</h3>
                <p className="text-sm text-[var(--text-muted)]">Przycisk w rogu strony, zawsze widoczny</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full">
                Popularne
              </span>
            </div>
            <div className="relative">
              <pre className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-mono text-[var(--text-muted)] overflow-x-auto max-h-36 whitespace-pre-wrap">
                {floatingWidgetCode}
              </pre>
              <button
                onClick={() => handleCopy(floatingWidgetCode, 'floating')}
                className="absolute top-3 right-3 p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                {copied === 'floating' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
              </button>
            </div>
            {/* Podgląd pływającego */}
            <div className="mt-4 p-4 bg-[var(--bg-card)] rounded-xl relative h-24">
              <p className="text-xs text-[var(--text-muted)] mb-3">Podgląd:</p>
              <div 
                style={{ background: widgetColor, [widgetPosition === 'bottom-right' ? 'right' : 'left']: '16px' }}
                className="absolute bottom-4 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer hover:scale-110 transition-transform"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>
          </div>

          {/* iframe */}
          <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Osadzony formularz</h3>
                <p className="text-sm text-[var(--text-muted)]">Pełny formularz bezpośrednio na stronie</p>
              </div>
            </div>
            <div className="relative">
              <pre className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl text-xs font-mono text-[var(--text-muted)] overflow-x-auto max-h-36 whitespace-pre-wrap">
                {iframeCode}
              </pre>
              <button
                onClick={() => handleCopy(iframeCode, 'iframe')}
                className="absolute top-3 right-3 p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                {copied === 'iframe' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--text-muted)]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Instrukcje */}
        <div className="space-y-6">
          <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Jak osadzić widget?</h3>
            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Skopiuj kod</p>
                  <p className="text-[var(--text-muted)]">Wybierz typ widgetu i kliknij przycisk kopiowania</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Wklej na swojej stronie</p>
                  <p className="text-[var(--text-muted)]">Dodaj kod do HTML swojej strony (przed &lt;/body&gt;)</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">Gotowe!</p>
                  <p className="text-[var(--text-muted)]">Klienci mogą teraz rezerwować bezpośrednio z Twojej strony</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Kompatybilność</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
              Widget działa na każdej stronie internetowej:
            </p>
            <div className="flex flex-wrap gap-2">
              {['WordPress', 'Wix', 'Squarespace', 'Shopify', 'HTML', 'React', 'Vue'].map(platform => (
                <span key={platform} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                  {platform}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Wskazówka</h4>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Pływający widget jest najlepszy dla stron, gdzie chcesz mieć przycisk rezerwacji zawsze widoczny. Przycisk statyczny sprawdzi się w sekcji kontakt lub na stronie głównej.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
