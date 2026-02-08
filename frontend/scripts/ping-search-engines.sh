#!/bin/bash
# Skrypt do pingowania wyszukiwarek o aktualizacji strony
# Uruchom po każdej aktualizacji: bash scripts/ping-search-engines.sh

SITEMAP_URL="https://rezerwacja24.pl/sitemap.xml"
INDEXNOW_KEY="3f351138ecfd5e1edeb7541610f80775"
SITE_URL="https://rezerwacja24.pl"

echo "🔍 Pingowanie wyszukiwarek o aktualizacji strony..."

# 1. Google - ping sitemap
echo "📍 Pingowanie Google..."
curl -s "https://www.google.com/ping?sitemap=${SITEMAP_URL}" > /dev/null
echo "   ✅ Google pinged"

# 2. Bing - ping sitemap
echo "📍 Pingowanie Bing..."
curl -s "https://www.bing.com/ping?sitemap=${SITEMAP_URL}" > /dev/null
echo "   ✅ Bing pinged"

# 3. IndexNow - szybka indeksacja dla Bing, Yandex, Seznam
echo "📍 Wysyłanie IndexNow..."

# Lista URL-i do indeksacji
URLS=(
  "https://rezerwacja24.pl/"
  "https://rezerwacja24.pl/contact"
  "https://rezerwacja24.pl/help"
  "https://rezerwacja24.pl/privacy"
  "https://rezerwacja24.pl/terms"
)

# Przygotuj JSON payload
JSON_URLS=$(printf '"%s",' "${URLS[@]}" | sed 's/,$//')

curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{
    \"host\": \"rezerwacja24.pl\",
    \"key\": \"${INDEXNOW_KEY}\",
    \"keyLocation\": \"${SITE_URL}/${INDEXNOW_KEY}.txt\",
    \"urlList\": [${JSON_URLS}]
  }" > /dev/null

echo "   ✅ IndexNow sent to Bing, Yandex, Seznam"

# 4. Yandex - ping sitemap
echo "📍 Pingowanie Yandex..."
curl -s "https://webmaster.yandex.com/ping?sitemap=${SITEMAP_URL}" > /dev/null
echo "   ✅ Yandex pinged"

echo ""
echo "✨ Wszystkie wyszukiwarki zostały powiadomione!"
echo ""
echo "📋 Następne kroki dla lepszego SEO:"
echo "   1. Zaloguj się do Google Search Console: https://search.google.com/search-console"
echo "   2. Przejdź do 'Mapy witryn' i dodaj: ${SITEMAP_URL}"
echo "   3. Użyj 'Sprawdź URL' aby ręcznie poprosić o indeksację strony głównej"
echo "   4. Zaloguj się do Bing Webmaster Tools: https://www.bing.com/webmasters"
echo "   5. Dodaj stronę i zweryfikuj własność"
echo ""
