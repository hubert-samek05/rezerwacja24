# 📱 Instrukcja budowania aplikacji Android - Rezerwacja24

## Krok 1: Rozpakuj ZIP

Po pobraniu pliku ZIP, rozpakuj go:
```bash
cd ~/Downloads
unzip rezerwacja24-android.zip -d ~/rezerwacja24-android
cd ~/rezerwacja24-android
```

## Krok 2: Otwórz projekt w Android Studio

1. Uruchom Android Studio
2. Kliknij **"Open"** (nie "New Project"!)
3. Wybierz folder: `~/rezerwacja24-android/android`
4. Kliknij **"OK"**
5. Poczekaj aż Android Studio zsynchronizuje projekt (może potrwać 5-10 minut przy pierwszym uruchomieniu)

## Krok 3: Poczekaj na synchronizację

- Na dole zobaczysz pasek postępu "Gradle sync"
- Poczekaj aż zniknie
- Jeśli pojawi się komunikat o aktualizacji Gradle - kliknij "Update"

## Krok 4: Zbuduj aplikację (APK do testów)

1. W menu górnym: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Poczekaj aż się zbuduje
3. Kliknij "locate" w powiadomieniu na dole
4. Plik APK będzie w: `android/app/build/outputs/apk/debug/app-debug.apk`

## Krok 5: Przetestuj na telefonie

1. Prześlij plik `app-debug.apk` na swój telefon Android
2. Zainstaluj (może wymagać włączenia "Nieznane źródła" w ustawieniach)
3. Otwórz aplikację i sprawdź czy działa

## Krok 6: Zbuduj wersję produkcyjną (AAB do Google Play)

### 6a. Stwórz klucz podpisywania (tylko raz!)

W terminalu:
```bash
keytool -genkey -v -keystore ~/rezerwacja24-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias rezerwacja24
```

Zapamiętaj hasło które wpiszesz! Będzie potrzebne.

### 6b. Skonfiguruj podpisywanie

Edytuj plik `android/app/build.gradle` i dodaj przed sekcją `android {`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

W sekcji `android {` dodaj:
```gradle
signingConfigs {
    release {
        keyAlias 'rezerwacja24'
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 6c. Stwórz plik keystore.properties

W folderze `android/` stwórz plik `keystore.properties`:
```
storeFile=/home/TWOJA_NAZWA_UZYTKOWNIKA/rezerwacja24-release-key.jks
storePassword=TWOJE_HASLO
keyAlias=rezerwacja24
keyPassword=TWOJE_HASLO
```

### 6d. Zbuduj AAB

W Android Studio: **Build → Build Bundle(s) / APK(s) → Build Bundle(s)**

Plik AAB będzie w: `android/app/build/outputs/bundle/release/app-release.aab`

## Krok 7: Publikacja w Google Play

1. Wejdź na: https://play.google.com/console
2. Wybierz swoją aplikację (lub stwórz nową)
3. Idź do: **Production → Create new release**
4. Wgraj plik `app-release.aab`
5. Wypełnij opis aplikacji
6. Wyślij do review

## ❓ Problemy?

### "SDK location not found"
Otwórz Android Studio → Tools → SDK Manager → zanotuj ścieżkę SDK

### "Gradle sync failed"
Kliknij "Try Again" lub File → Sync Project with Gradle Files

### Inne błędy
Skopiuj treść błędu i wklej w czat - pomogę!
