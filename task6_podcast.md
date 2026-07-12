Podcast Player
Skills
vanilla JavaScript TypeScript Fetch API async/await debouncing routing HTML5 Audio API LocalStorage responsive design

Our Handbook
👉 Open Handbook 👈

This handbook is currently in a test phase. If you notice any issues or have suggestions, feel free to contact me on Discord: @OreskaG

Task Description
A podcast player is an app for playing podcasts - audio recordings that are typically part of a series focused on a specific topic. Popular podcast players include:

Apple Podcasts
Spotify
Pocket Casts
Build a simplified web version of a podcast player that covers these user stories:

The user can see a list of recommended podcasts.
The user can search podcasts via text search. If you use the Listen Notes test API, search results may not correspond to the entered query because the API returns predefined test data.
The user can open a podcast from the list and see a details page with its available episodes.
The user can select an episode and start listening to it.
The user can seek forward and back through the episode timeline.
The user can keep navigating the app (search podcasts, browse episodes) while an episode is playing in the player.
The user can add and remove episodes to/from a personal playlist.
The app remembers the current play position and the playlist content after the page is reloaded.
The task is split into four sections. Each section builds on the previous ones.

Requirements
API choice

You may use any podcast API that provides the data required to complete this task (podcast list, podcast details, search, and episode information).

The Listen Notes test API is the recommended option because it does not require registration or an API key and is sufficient to complete all required functionality.

Regardless of the API you choose, your application must satisfy all functional requirements and scoring criteria.

Section 1 - Landing page and search
Covers user stories 1, 2.

You may use any podcast API. The examples in this task use the Listen Notes test API. Refer to the official Listen Notes guide on testing the Podcast API without an API key for information about the test API, and use the Listen API v2 documentation while working with the endpoints.

Base URL:

https://listen-api-test.listennotes.com/api/v2
The test API does not require authentication. Requests can be sent without the X-ListenAPI-Key header.

class App {
  fetchPodcasts(): void {
    const url =
      "https://listen-api-test.listennotes.com/api/v2/best_podcasts?sort=recent_published_first&page=1";

    fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) => console.log(json));
  }
}
Build a landing page. Use your own layout or take inspiration from existing players:

Apple landing Apple Landing

Spotify landing Spotify Landing

Fetch podcasts using the Best Podcasts API endpoint (GET /best_podcasts, use sort=recent_published_first) and render them on the landing page. The test API returns predefined mock data, therefore pagination or infinite scroll is not required for this task.

Add a search input.

When the input is empty, show the podcasts loaded from GET /best_podcasts.
When the input has a value, send a request to the Search API (GET /search?q=<query>&type=podcast).
The test API returns predefined mock data, so the search results may not correspond to the entered query.
Search pagination is not required because the test API returns predefined mock data.
Search requests must not fire on every keystroke. Use debouncing or throttling to limit the number of API calls.
Section 2 - Podcast details page
Covers user story 3.

Clicking a tile on the landing/search page navigates to a page that lists episodes for that podcast. Layout is up to you - examples for reference:

Apple details Apple Details

Spotify details Spotify Details

To load episodes, use the podcast id from the landing/search result and request detailed data with the Podcast Details API (GET /podcasts/{id}). Render episodes from the episodes array in the response.

The user must be able to return to the landing page without using the browser's "Back" button (provide an in-app navigation control).

Section 3 - Podcast player
Covers user stories 4, 5, 6.

Build an audio player component with the following behavior:
Alternating Play / Pause button.
Progress bar with current time and total time (or remaining time).
The user can seek the audio by clicking the progress bar.
The player stays visible on screen at all times.
The player does not block navigation between pages.
The user can search podcasts (Section 1) and browse episodes (Section 2) while the current episode is playing.
Selecting another episode replaces the current stream with the new one.
Section 4 - Memory and playlist
Covers user stories 7, 8.

Add a playlist page that lists user-added episodes. Layout is up to you - match the style of the rest of the app.
Store the playlist state in localStorage.
The user can add and remove episodes to/from the playlist.
The behavior of the playlist when the user starts a new episode is up to you (e.g. auto-advance, manual selection).
Store the playback progress of each played episode in localStorage. When the user returns to a previously listened episode, the player resumes from roughly 10 seconds before the last position.
Technical requirements
Vanilla JavaScript or TypeScript only - no UI frameworks (React, Vue, Angular, etc.).
The app must be a Single Page Application - page transitions happen without full reloads.
No console errors during normal use.
The app must work in the latest version of Chrome.
Submission
Work in a public repository on your personal GitHub account (named podcast-player or similar).
From the main branch, create a podcast-player branch and place your project files there.
Complete the task.
Deploy your work to gh-pages.
Open a Pull Request from podcast-player into main. Name the PR after the task. Write the description following the PR description schema. Do not merge this PR.
Submit the deployment link in rs app → Cross-Check: Submit.
After the deadline, the cross-check begins (3 days). To get the score, you must review all assigned works and submit results in Cross-Check Review.
Note. This task uses the Listen Notes test API, which does not require an API key or authentication. The API returns predefined mock data intended for development and testing.

Cross-check
This task is reviewed via the cross-check process.

The reviewer goes through every scoring criterion and awards the listed points only if the feature works in the deployed app. Criteria that cannot be verified (e.g. the app fails to load or API requests fail) score 0 for that block.

Scoring Criteria
Maximum score: 140 points

Section 1 - Landing page and search (40 points)
The landing page loads and renders a list of podcasts fetched from the selected podcast API +10
Each podcast tile shows at least: cover image, title, author/feed name +5
A search input is present on the landing page +5
When the search input is empty, the default podcast list is shown +5
When the search input has a value, search results are displayed +5
Search requests are debounced or throttled (verified by observing network requests in DevTools while typing) +5
A loading indicator is shown while a request is in flight +5
Section 2 - Podcast details page (25 points)
Clicking a podcast tile navigates to a details page for that podcast +5
The details page lists episodes for the selected podcast +10
Each episode item shows at least: title, publication date, duration +5
An in-app control returns the user to the landing page without using the browser's "Back" button +5
Section 3 - Podcast player (45 points)
Selecting an episode starts playback in the player +5
The player has a working Play / Pause toggle button +5
The player shows current time and total time (or remaining time) +5
The player has a progress bar that updates as the audio plays +5
Clicking the progress bar seeks the audio to the clicked position +10
The player stays visible on screen during navigation between pages +5
The user can use search (Section 1) and browse episode lists (Section 2) while audio continues playing without interruption +5
Selecting a different episode replaces the current stream with the new one (no double-playback) +5
Section 4 - Memory and playlist (30 points)
A playlist page exists and is reachable from the app's navigation +5
The user can add an episode to the playlist from the details page or the player +5
The user can remove an episode from the playlist +5
The playlist contents persist across page reloads (stored in localStorage) +5
The playback position of the currently playing episode is stored in localStorage +5
When the user returns to a previously listened episode, playback resumes from roughly 10 seconds before the last saved position +5
Penalties
A UI framework (React, Vue, Angular, Svelte, etc.) is used -140
Page transitions cause full reloads (not an SPA) -20
Console errors during normal use -10
Layout is visibly broken on the latest Chrome at a 1280px viewport -10

---

# 📋 Szczegółowy Plan Implementacji w 5 Etapach

## Etap 1: Konfiguracja SPA i Architektury (Routing i Stan Globalny)

**Cel:** Przygotowanie fundamentu aplikacji Single Page Application z systemem routingu i zarządzaniem stanem globalnym.

**Czas:** 3-4 godziny

### Struktura plików:
```
src/
├── index.html
├── styles/
│   ├── global.css
│   ├── layout.css
│   └── components.css
├── js/ (lub ts/)
│   ├── app.js (główny plik aplikacji)
│   ├── router.js (system routingu)
│   ├── state.js (zarządzanie stanem globalnym)
│   ├── api/
│   │   └── podcastAPI.js (obsługa zapytań API)
│   ├── components/
│   │   ├── player.js (stały odtwarzacz)
│   │   ├── loader.js (wskaźnik ładowania)
│   │   └── navigation.js (nawigacja)
│   └── views/
│       ├── home.js (strona główna)
│       ├── podcastDetails.js (szczegóły podcastu)
│       └── playlist.js (playlista)
└── dist/ (output build'u)
```

### Zadania w Etapie 1:

- [ ] **Inicjalizacja Git i struktury projektu**
  - Utworzenie repozytorium `podcast-player`
  - Gałąź `podcast-player` z main
  - Konfiguracja `.gitignore`

- [ ] **Stworzenie Router'a SPA**
  ```javascript
  // Wykorzystanie History API lub window.location.hash
  // Metody: addRoute(path, component), navigate(path, param), handleRouting()
  // Wymaga: hashchange listener, kontener #app do renderowania
  ```

- [ ] **Globalny State (Store)**
  - Zmienna globalna do przechowywania: aktualnie odtwarzanego podcastu, aktualnie odtwarzanego odcinka, playlisty, pozycji playback'u
  - Metody: `getState()`, `setState(newState)`, `subscribe(callback)` dla obserwatorów

- [ ] **Obsługa błędów i loadera**
  - Komponent `Loader` - widoczny podczas fetchowania danych
  - Error boundary - obsługa błędów API

- [ ] **Struktura HTML**
  ```html
  <div id="app"><!-- Tutaj renderują się widoki --></div>
  <div id="player"><!-- Stały odtwarzacz --></div>
  ```

### Checklist końcowy Etapu 1:
- [ ] Router zawiera co najmniej ścieżki: `/`, `/podcast/:id`, `/playlist`
- [ ] Zmiana hasha w URL nie powoduje przeładowania strony
- [ ] Brak błędów w konsoli
- [ ] Plik `app.js` inicjalizuje aplikację

---

## Etap 2: Strona Główna i Wyszukiwarka (Sekcja 1)

**Cel:** Implementacja strony głównej z listą podcastów i funkcją wyszukiwania z debouncingiem.

**Czas:** 3-4 godziny

### API Endpoints:
```
GET https://listen-api-test.listennotes.com/api/v2/best_podcasts?sort=recent_published_first&page=1
GET https://listen-api-test.listennotes.com/api/v2/search?q=<query>&type=podcast
```

### Zadania w Etapie 2:

- [ ] **Implementacja `podcastAPI.js`**
  ```javascript
  // Metody:
  // fetchBestPodcasts() - pobiera listę podcastów
  // searchPodcasts(query) - wyszukiwanie z debouncingiem
  // Helper: debounce(fn, delay) - ograniczenie liczby zapytań
  ```

- [ ] **Renderowanie listy podcastów**
  ```javascript
  // Wyświetlanie: okładka (image), tytuł, autor, liczba odcinków
  // Event: click na podcast -> navigate do szczegółów
  // State: Loading, Success, Error
  ```

- [ ] **Wyszukiwarka**
  - Input field z event listener'em `input`
  - Funkcja debounce (min. 300ms delay)
  - Przy pustym input'e: powrót do domyślnej listy
  - Loader podczas wyszukiwania

- [ ] **Responsywny layout**
  - Grid/Flex layout dla kafelków
  - Minimum 2 kolumny na 1280px
  - Testowanie na 1280px i mniejszych szerokościach

### Komponenty na Etapie 2:

```javascript
// views/home.js
async function renderHome() {
  // 1. Pobranie podcastów (best_podcasts)
  // 2. Renderowanie listy z obsługą kliknięcia
  // 3. Zwrócenie HTML do renderowania w #app
}

// Funkcja debounce
function debounce(fn, delay) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

### Checklist końcowy Etapu 2:
- [ ] Lista podcastów ładuje się i wyświetla na stronie głównej
- [ ] Każdy podcast ma: okładkę, tytuł, autora
- [ ] Search input jest widoczny i funkcjonalny
- [ ] Wyszukiwanie jest debouncowane (max 1 zapytanie na 300ms)
- [ ] Loader pokazuje się podczas pobierania danych
- [ ] Layout responsywny na 1280px+
- [ ] Brak błędów w konsoli

---

## Etap 3: Strona Szczegółów Podcastu (Sekcja 2)

**Cel:** Przejście do widoku szczegółowego i wyświetlenie listy odcinków.

**Czas:** 2-3 godziny

### API Endpoint:
```
GET https://listen-api-test.listennotes.com/api/v2/podcasts/{id}
```

### Zadania w Etapie 3:

- [ ] **Nawigacja do szczegółów**
  - Klik na podcast zmienia hash: `#podcast/123456`
  - Router rozpoznaje parametr `id` i renderuje widok szczegółów

- [ ] **Pobieranie szczegółów podcastu**
  ```javascript
  // podcastAPI.js
  fetchPodcastDetails(id) {
    // GET /podcasts/{id}
    // Zwrócić dane z pola 'episodes' 
  }
  ```

- [ ] **Renderowanie odcinków**
  - Dla każdego odcinka wyświetlić: tytuł, datę publikacji, czas trwania
  - Event: click na odcinek -> play w player'ze

- [ ] **Przycisk powrotu**
  - Przycisk "← Wróć do podcastów" na górze
  - Event: click -> navigate do home (`#`)

- [ ] **Header Details Page**
  - Okładka podcastu, tytuł, autor, opis (opcjonalne)
  - Lista odcinków poniżej

### Komponenty na Etapie 3:

```javascript
// views/podcastDetails.js
async function renderPodcastDetails(podcastId) {
  // 1. Pobranie szczegółów podcasu (fetchPodcastDetails)
  // 2. Renderowanie nagłówka
  // 3. Renderowanie listy odcinków
  // 4. Obsługa click na odcinek -> odtwarzanie
  // 5. Przycisk powrotu
}
```

### Checklist końcowy Etapu 3:
- [ ] Klik na podcast z home redirectuje do szczegółów
- [ ] URL zmienia się na `#podcast/{id}`
- [ ] Szczegóły podcastu ładują się z API
- [ ] Odcinki wyświetlają się z tytułem, datą i czasem
- [ ] Przycisk powrotu przenosi do home
- [ ] Brak błędów w konsoli

---

## Etap 4: Globalny Odtwarzacz Audio (Sekcja 3)

**Cel:** Stworzenie odtwarzacza, który działa nieprzerwanie podczas nawigacji po aplikacji.

**Czas:** 4-5 godzin

### Zadania w Etapie 4:

- [ ] **HTML5 Audio Element**
  ```html
  <div id="player">
    <audio id="audioPlayer"></audio>
    <!-- Kontrolki playback'u -->
  </div>
  ```

- [ ] **Komponent Player**
  ```javascript
  // components/player.js
  class Player {
    constructor() {
      this.audio = document.getElementById('audioPlayer');
      this.currentEpisode = null;
    }
    
    play(episode) {
      this.audio.src = episode.audio;
      this.audio.play();
      this.currentEpisode = episode;
    }
    
    pause() {
      this.audio.pause();
    }
    
    resume() {
      this.audio.play();
    }
    
    seek(timeInSeconds) {
      this.audio.currentTime = timeInSeconds;
    }
  }
  ```

- [ ] **Kontrolki odtwarzacza**
  - Play / Pause button (toggle)
  - Progress bar (pokazuje aktualny czas / czas całkowity)
  - Seek: click na progress bar = zmiana pozycji
  - Volume (opcjonalne)

- [ ] **Event listener'y**
  - `timeupdate` - aktualizacja progress bar'a
  - `play` / `pause` - zmiana ikony przycisku
  - `loadedmetadata` - pobranie całkowitego czasu
  - `ended` - powiadomienie o końcu odcinka

- [ ] **Persist player na każdej stronie**
  - Player pozostaje poza kontenerem `#app`
  - Nawigacja między stronami nie niszczy audio'u

### Komponenty na Etapie 4:

```javascript
// components/player.js (pełna implementacja)
class Player {
  constructor() {
    this.audio = document.getElementById('audioPlayer');
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.audio.addEventListener('timeupdate', () => this.updateProgressBar());
    this.audio.addEventListener('play', () => this.updatePlayButton());
    this.audio.addEventListener('pause', () => this.updatePlayButton());
  }
  
  loadAndPlay(episode) {
    this.audio.src = episode.audio;
    this.audio.play();
    this.currentEpisode = episode;
    // Zapisz do state
  }
  
  togglePlayPause() {
    this.audio.paused ? this.audio.play() : this.audio.pause();
  }
  
  updateProgressBar() {
    const progressPercent = (this.audio.currentTime / this.audio.duration) * 100;
    // Update DOM
  }
}
```

### Checklist końcowy Etapu 4:
- [ ] Play/Pause button działa poprawnie
- [ ] Progress bar pokazuje aktualny czas i całkowity czas
- [ ] Klik na progress bar zmienia pozycję odtwarzania
- [ ] Player jest widoczny zawsze na ekranie
- [ ] Zmiana stron nie zatrzymuje muzyki
- [ ] Wybranie nowego odcinka przerywa bieżące odtwarzanie
- [ ] Brak błędów w konsoli

---

## Etap 5: Playlista i Pamięć (LocalStorage)

**Cel:** Dodanie obsługi playlisty i zapamiętywanie stanu aplikacji.

**Czas:** 3-4 godziny

### LocalStorage Keys:
```javascript
localStorage.playlist // Array[Episode] - odcinki w playlist'cie
localStorage.playbackPosition // Object { episodeId: currentTime, ... }
```

### Zadania w Etapie 5:

- [ ] **Przycisk "Dodaj do playlisty"**
  - Na stronie szczegółów podcastu (obok każdego odcinka)
  - Na playerze (dla aktualnie odtwarzanego odcinka)
  - Event: click -> dodanie do playlist -> zapisanie w localStorage

- [ ] **Widok playlisty**
  ```javascript
  // views/playlist.js
  async function renderPlaylist() {
    // 1. Wczytaj playlistę z localStorage
    // 2. Wyświetl listę odcinków
    // 3. Możliwość usunięcia
    // 4. Klik na odcinek -> play
  }
  ```

- [ ] **Usuwanie z playlisty**
  - Przycisk X / Delete na każdym odcinku w playlist'cie
  - Event: click -> usunięcie z localStorage

- [ ] **Zapamiętywanie pozycji odtwarzania**
  ```javascript
  // listener na audio#timeupdate
  // Co ~5-10 sekund zapisuj: localStorage.playbackPosition
  // { episodeId: currentTime }
  ```

- [ ] **Wznowienie odtwarzania**
  ```javascript
  // Gdy user wróci do podcastu po przeładowaniu:
  // 1. Sprawdzić localStorage.playbackPosition[episodeId]
  // 2. Jeśli istnieje: ustaw audio.currentTime = saved_position - 10s
  // 3. Zapamiętaj w state i renderuj na UI
  ```

- [ ] **Nawigacja do playlist'y**
  - Link w menu/header: "Moja playlista"
  - URL: `#playlist`
  - Router przekierowuje do widoku playlisty

### Komponenty na Etapie 5:

```javascript
// Funkcje pomocnicze do LocalStorage
function savePlaylist(playlist) {
  localStorage.setItem('playlist', JSON.stringify(playlist));
}

function getPlaylist() {
  return JSON.parse(localStorage.getItem('playlist') || '[]');
}

function addToPlaylist(episode) {
  const playlist = getPlaylist();
  const exists = playlist.some(ep => ep.id === episode.id);
  if (!exists) {
    playlist.push(episode);
    savePlaylist(playlist);
  }
}

function removeFromPlaylist(episodeId) {
  const playlist = getPlaylist();
  savePlaylist(playlist.filter(ep => ep.id !== episodeId));
}

// Zapisywanie pozycji playback'u
function savePlaybackPosition(episodeId, currentTime) {
  const positions = JSON.parse(localStorage.getItem('playbackPosition') || '{}');
  positions[episodeId] = currentTime;
  localStorage.setItem('playbackPosition', JSON.stringify(positions));
}

function getPlaybackPosition(episodeId) {
  const positions = JSON.parse(localStorage.getItem('playbackPosition') || '{}');
  return positions[episodeId] || 0;
}
```

### Checklist końcowy Etapu 5:
- [ ] Przycisk "Dodaj do playlisty" widoczny na szczegółach podcastu
- [ ] Kliknięcie dodaje odcinek do playlisty
- [ ] Playlista persystuje po przeładowaniu strony
- [ ] Przycisk do usunięcia z playlisty działa
- [ ] Widok playlisty wyświetla dodane odcinki
- [ ] Pozycja playback'u zapisuje się w localStorage
- [ ] Po powrocie do odcinka, muzyka wznawia się z -10s od ostatniej pozycji
- [ ] Brak błędów w konsoli
- [ ] Layout responsywny na wszystkich ścieżkach

---

## 🎯 Finalna Weryfikacja Przed Deployem

Przed wrzuceniem na gh-pages sprawdź:

### Testy Funkcjonalne:
- [ ] Landing page ładuje się bez błędów
- [ ] Wyszukiwanie debouncuje (max 1 zapytanie na 300ms)
- [ ] Nawigacja między stronami nie przeładowuje aplikacji
- [ ] Player nie zatrzymuje się podczas nawigacji
- [ ] Playlista zapisuje się i wczytuje z localStorage
- [ ] Pozycja playback'u wznawia się poprawnie

### Kryteria Techniczne:
- [ ] Brak błędów w konsoli DevTools
- [ ] Brak użycia UI frameworków (React, Vue, Angular)
- [ ] Layout nie rozjechany na 1280px
- [ ] Wszystkie elementy responsywne
- [ ] Kod czysty i skomentowany

### Deployment:
- [ ] Push do gałęzi `podcast-player`
- [ ] Build / dist folder na gh-pages
- [ ] Pull Request z main do podcast-player
- [ ] Link submission w RS app

### Struktura Commit'ów (sugerowana):
```
1. Initial project setup with routing
2. Landing page with podcast list and search
3. Podcast details page with episodes
4. Audio player implementation
5. Playlist and localStorage functionality
6. Responsive design and polish
```

---

**Szacunkowy czas całej implementacji: 15-20 godzin**