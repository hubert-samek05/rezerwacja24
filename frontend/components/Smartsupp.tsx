'use client'

import { useEffect, useState } from 'react'

interface SmartsuppProps {
  userRole?: string | null
}

export default function Smartsupp({ userRole }: SmartsuppProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Sprawdź czy skrypt już istnieje
    if (typeof window === 'undefined') return;
    
    const hostname = window.location.hostname;
    console.log('[Smartsupp] Init check - hostname:', hostname, 'userRole:', userRole, 'loaded:', loaded);
    
    // Poczekaj aż userRole się załaduje (może być null na początku)
    // Ale jeśli już załadowaliśmy skrypt, nie sprawdzaj ponownie
    if (loaded) {
      console.log('[Smartsupp] Already loaded, skipping');
      return;
    }
    
    // NIE pokazuj dla super_admin
    if (userRole === 'super_admin') {
      console.log('[Smartsupp] Hidden for super_admin');
      return;
    }
    
    // NIE ładuj Smartsupp na subdomenach (stronach biznesowych klientów)
    // ALE pokazuj na app.rezerwacja24.pl (dashboard)
    const isSubdomain = hostname.endsWith('.rezerwacja24.pl') && 
                        hostname !== 'rezerwacja24.pl' && 
                        hostname !== 'www.rezerwacja24.pl' &&
                        hostname !== 'api.rezerwacja24.pl' &&
                        hostname !== 'app.rezerwacja24.pl';
    if (isSubdomain) {
      console.log('[Smartsupp] Hidden on subdomain:', hostname);
      return;
    }
    
    // Jeśli skrypt już załadowany, nie dodawaj ponownie
    if (document.getElementById('smartsupp-script')) {
      console.log('[Smartsupp] Script already exists in DOM');
      setLoaded(true);
      return;
    }
    
    // Jeśli był błąd, nie próbuj ponownie
    if (error) {
      console.log('[Smartsupp] Previous error, skipping');
      return;
    }

    console.log('[Smartsupp] Loading chat widget...');
    try {
      // Konfiguracja Smartsupp - musi być przed skryptem
      (window as any)._smartsupp = (window as any)._smartsupp || {};
      (window as any)._smartsupp.key = 'c0aac5bd47ae2e5fb2e68caa1e9dc0bd65f60e6d';
      
      // Przesuń widget wyżej na mobile aby nie zasłaniał bottom nav
      (window as any)._smartsupp.offsetY = 80;
      
      // Opcje - wyłącz niektóre funkcje które mogą powodować błędy
      (window as any)._smartsupp.cookieDomain = '.rezerwacja24.pl';
      
      // Inicjalizacja funkcji smartsupp przed załadowaniem skryptu
      (window as any).smartsupp || (function(d) {
        var s, c;
        const o: any = (window as any).smartsupp = function() {
          o._.push(arguments);
        };
        o._ = [];
        s = d.getElementsByTagName('script')[0];
        c = d.createElement('script');
        c.id = 'smartsupp-script';
        c.type = 'text/javascript';
        c.charset = 'utf-8';
        c.async = true;
        c.src = 'https://www.smartsuppchat.com/loader.js?';
        
        // Obsługa błędów ładowania
        c.onerror = () => {
          console.warn('Smartsupp: Failed to load chat widget');
          setError(true);
        };
        
        s?.parentNode?.insertBefore(c, s);
        setLoaded(true);
      })(document);
    } catch (err) {
      console.warn('Smartsupp initialization error:', err);
      setError(true);
    }
  }, [error, userRole, loaded])

  return null
}
