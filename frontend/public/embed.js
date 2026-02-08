(function() {
  'use strict';
  
  // Pobierz konfigurację z atrybutów data-*
  const script = document.currentScript;
  const subdomain = script.dataset.subdomain || '';
  const primaryColor = script.dataset.primaryColor || '#0F6048';
  const accentColor = script.dataset.accentColor || '#10B981';
  
  // Utwórz kontener widgetu
  const container = document.getElementById('rezerwacja24-widget');
  if (!container) {
    console.error('Rezerwacja24: Nie znaleziono elementu #rezerwacja24-widget');
    return;
  }
  
  // Utwórz iframe z formularzem rezerwacji
  const iframe = document.createElement('iframe');
  iframe.src = `https://${subdomain}.rezerwacja24.pl?embed=true&primaryColor=${encodeURIComponent(primaryColor)}&accentColor=${encodeURIComponent(accentColor)}`;
  iframe.style.width = '100%';
  iframe.style.height = '600px';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '12px';
  iframe.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  iframe.setAttribute('allowtransparency', 'true');
  
  // Dodaj iframe do kontenera
  container.appendChild(iframe);
  
  // Obsługa komunikacji z iframe (opcjonalnie)
  window.addEventListener('message', function(event) {
    // Sprawdź origin dla bezpieczeństwa
    if (event.origin !== `https://${subdomain}.rezerwacja24.pl`) {
      return;
    }
    
    // Obsługa różnych typów wiadomości
    if (event.data.type === 'resize') {
      iframe.style.height = event.data.height + 'px';
    } else if (event.data.type === 'bookingComplete') {
      // Możesz dodać własną logikę po zakończeniu rezerwacji
      console.log('Rezerwacja zakończona:', event.data.bookingId);
    }
  });
})();
