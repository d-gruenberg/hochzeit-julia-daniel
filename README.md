# Hochzeit Julia & Daniel

Statische One-Page-Hochzeitswebsite für GitHub Pages, Netlify oder jeden anderen statischen Hoster.

## Dateien

- `index.html` - Inhalt und Struktur der Website
- `styles.css` - Gestaltung und responsive Layout
- `script.js` - WhatsApp-Rückmeldung
- `assets/hero-kuss.jpg` - Hero-Bild
- `assets/wiese.jpg` - visuelle Zäsur weiter unten
- `assets/hochzeit-julia-daniel.ics` - Kalendereintrag zum Herunterladen
- `assets/aquarell-referenz.jpeg` - nur als lokale Referenz abgelegt, nicht sichtbar eingebunden

## Veröffentlichung

Live: https://d-gruenberg.github.io/hochzeit-julia-daniel/

GitHub Pages liefert den Hauptordner von `main` aus. HTML, CSS, JavaScript und benötigte Dateien aus `assets/` gemeinsam aktualisieren. `tools/`, `.qa/`, `sources/` und das Aquarell gehören nicht zum öffentlichen Website-Paket.

Schriften (Inter und Newsreader), Lucide-Symbole und responsive WebP-Bilder werden lokal ausgeliefert. Die zugehörigen Lizenzen liegen in `assets/`.

## Rückmeldung

Die RSVP-WhatsApp-Nummer ist in `script.js` hinterlegt, ohne `+`, Leerzeichen oder Bindestriche.

```js
const RSVP_PHONE = '4917663465301';
```

Gäste geben je Person Vor- und Nachname, Zu- oder Absage sowie bei Zusage Essen und optional Allergien an. Zimmerwünsche werden gemeinsam erfasst. Die Nachricht wird nur vorbereitet und erst durch die Gäste in WhatsApp abgesendet. Alternativ kann sie kopiert werden.

Die Seite verwendet keine Cookies, kein Tracking, keine Datenbank und keine Speicherung von Formulareingaben.

## Lokale Prüfung

`node tools/serve.cjs` stellt eine Vorschau unter http://127.0.0.1:4175/ bereit. Der automatisierte Browser-Test in `tools/check.cjs` benötigt Playwright und einen startbaren Edge-Browser. Die Hilfsseiten in `tools/` dienen ausschließlich lokalen Tests.


## Wenn eine Veröffentlichung hängen bleibt

Unter **Actions** den neuesten Lauf „pages build and deployment“ prüfen. Steht er auf **Failed**, oben rechts **Re-run jobs** > **Re-run failed jobs** wählen. Bei **Queued** zunächst den [GitHub-Status](https://www.githubstatus.com/) prüfen und keinen zweiten Neustart desselben Laufs versuchen. Nach einer GitHub-Störung kann ein neuer Commit einen frischen Veröffentlichungsversuch auslösen; anschließend die Live-Seite kontrollieren.
