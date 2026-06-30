// ============================================================
// REVEAL-SELEKTOREN
// ============================================================
const REVEAL_SELECTORS = [
  ".star-rating",
  ".total-rating",
  ".total-scale",
  ".reviewstar",
  ".reviewtext",
  ".corporate",
  ".ki-box",
  ".authorname",
  ".authorinformation",
  ".reviewdate",
  ".avatar",
  ".hilfreich",
  ".verifizierung",
  ".usercontent"
];

// ============================================================
// REVEAL-KONFIGURATION
// Single Source of Truth: Selektor, Blur-Klasse, Label und
// Overlay-Text je enthüllbarem Element
// ============================================================
const REVEAL_CONFIG = {
  stars:             { selector: ".star-rating",       blur: "blurred",    label: "Sternebewertung",            overlayText: "★★★★★" },
  reviewstar:        { selector: ".reviewstar",         blur: "blurredx5",  label: "Einzelne Sternebewertung",   overlayText: "★★★★★" },
  reviewtext:        { selector: ".reviewtext",         blur: "blurred",    label: "Einzelrezension Text",       overlayText: "Rezensionstext" },
  totalrating:       { selector: ".total-rating",       blur: "blurred",    label: "Gesamtbewertung",            overlayText: "Anzahl" },
  totalscale:        { selector: ".total-scale",        blur: "blurredx5",  label: "Bewertungsskala",            overlayText: "Bewertungsskala" },
  corporate:         { selector: ".corporate",          blur: "blurred",    label: "Unternehmenskommentar",      overlayText: "Unternehmenskommentar" },
  ki:                { selector: ".ki-box",             blur: "blurred",    label: "KI-Zusammenfassung",         overlayText: "KI-Zusammenfassung" },
  authorname:        { selector: ".authorname",         blur: "blurred",    label: "Rezensent:in Name",          overlayText: "Autor/in" },
  authorinformation: { selector: ".authorinformation",  blur: "blurred",    label: "Rezensent:in Informationen", overlayText: "Autor/in Informationen" },
  reviewdate:        { selector: ".reviewdate",         blur: "blurred",    label: "Rezension Datum",            overlayText: "Veröffentlichung" },
  hilfreich:         { selector: ".hilfreich",          blur: "blurred",    label: "Hilfreich",                  overlayText: "..." },
  avatar:            { selector: ".avatar",             blur: "blurredx5",  label: "Profilbild",                 overlayText: "Profilbild" },
  verifizierung:     { selector: ".verifizierung",      blur: "blurred",    label: "Rezensent:in Verifizierung", overlayText: "Verifizierung" },
  usercontent:       { selector: ".usercontent",        blur: "blurredx10", label: "Beitragsbilder",             overlayText: "Beitragsbilder" }
};

// ============================================================
// ZUSTANDSVARIABLEN
// ============================================================

// Enthüllungsstatus je Element — aus REVEAL_CONFIG abgeleitet,
// damit keine manuelle Synchronisation nötig ist
const revealedElements = Object.fromEntries(Object.keys(REVEAL_CONFIG).map(k => [k, false]));

let closeButtonClicked = false;

// ============================================================
// BLUR-LABELS
// Legt einen klickbaren Overlay-Text über geblurrte Felder
// ============================================================

// Prüft, ob ein Element eine der drei Blur-Klassen trägt
function isBlurredElement(el) {
  return el.classList.contains("blurred")
    || el.classList.contains("blurredx5")
    || el.classList.contains("blurredx10");
}

// Stellt sicher, dass das Element in einem .blur-label-wrapper liegt;
// legt diesen Wrapper bei Bedarf im DOM an
function ensureBlurLabelWrapper(el) {
  const parent = el.parentElement;
  if (parent && parent.classList.contains("blur-label-wrapper")) return parent;

  const wrapper = document.createElement("div");
  wrapper.className = "blur-label-wrapper";

  // Display des Wrappers an das Element anpassen, um das Layout nicht zu brechen
  const display = getComputedStyle(el).display;
  wrapper.style.display = ["inline", "inline-block", "inline-flex"].includes(display)
    ? "inline-block"
    : "block";
  if (wrapper.style.display === "block") wrapper.style.width = "100%";

  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
  return wrapper;
}

// Fügt einem geblurrten Element ein klickbares Label hinzu;
// ein Klick darauf ruft reveal(key) auf
function addBlurLabel(el, text, key) {
  const wrapper = ensureBlurLabelWrapper(el);

  let label = wrapper.querySelector(":scope > .blur-label");
  if (!label) {
    label = document.createElement("div");
    label.className = "blur-label";
    label.innerHTML = `<span class="blur-label__text"></span>`;

    label.addEventListener("click", (e) => {
      e.stopPropagation();
      if (key && !revealedElements[key]) reveal(key);
    });

    wrapper.appendChild(label);
  }

  label.querySelector(".blur-label__text").textContent = text;
  label.style.display = isBlurredElement(el) ? "flex" : "none";

  // Linksbündige Ausrichtung für Autor-/Avatar-/Skalenelemente
  const leftAligned = el.closest(".authorinfo")
    || el.classList.contains("avatar")
    || el.classList.contains("total-scale");
  label.classList.toggle("blur-label--left-aligned", !!leftAligned);
}

// Entfernt das Blur-Label eines Elements nach dem Enthüllen
function removeBlurLabel(el) {
  const wrapper = el.parentElement;
  if (!wrapper || !wrapper.classList.contains("blur-label-wrapper")) return;
  wrapper.querySelector(":scope > .blur-label")?.remove();
}

// Initialisiert Blur-Labels für alle beim Laden bereits geblurrten Elemente
function initBlurLabels() {
  for (const [key, cfg] of Object.entries(REVEAL_CONFIG)) {
    document.querySelectorAll(cfg.selector).forEach((el) => {
      if (isBlurredElement(el)) addBlurLabel(el, cfg.overlayText || cfg.label, key);
    });
  }
}

// ============================================================
// REVEAL
// ============================================================

// Enthüllt alle DOM-Elemente des gegebenen Keys:
// Entfernt Blur-Klasse und Label, setzt revealedElements-Flag.
function reveal(key) {
  if (!key || revealedElements[key]) return;
  const config = REVEAL_CONFIG[key];
  if (!config) return;

  document.querySelectorAll(config.selector).forEach((el) => {
    el.classList.remove(config.blur);
    removeBlurLabel(el);
  });

  revealedElements[key] = true;
}

// ============================================================
// SHUFFLE-FUNKTIONEN
// ============================================================

// Fisher-Yates In-Place-Shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Mischt die Reihenfolge der Hotel-Karten im Grid
function shuffleHotels() {
  const container = document.querySelector(".row.g-4");
  if (!container) {
    console.warn("Container .row.g-4 nicht gefunden — Shuffle übersprungen");
    return;
  }
  shuffleArray([...container.children]).forEach(c => container.appendChild(c));
}

// Mischt die Reviews innerhalb jeder Scrollbar-Sektion
function shuffleReviews() {
  const scrollbars = document.querySelectorAll(".scrollbar");
  if (!scrollbars.length) {
    console.warn("Keine .scrollbar-Elemente gefunden — Review-Shuffle übersprungen");
    return;
  }
  scrollbars.forEach(sb => {
    const reviews = [...sb.querySelectorAll(":scope > .reviewall")];
    if (reviews.length > 1) shuffleArray(reviews).forEach(r => sb.appendChild(r));
  });
}

// ============================================================
// TEST-ABSCHLUSS
// ============================================================

// Blendet wie im echten Experiment den weißen Abschlussscreen ein,
// übergibt aber keine Werte an SoSci oder einen Parent-Frame.
function endTestFlow() {
  if (closeButtonClicked) return;
  closeButtonClicked = true;

  // Close-Button ausblenden
  document.getElementById("closeTrackingButton")?.style.setProperty("display", "none");

  // Weißen Abschlussscreen einblenden
  const screen = document.createElement("div");
  screen.id = "endWhiteScreen";
  screen.style.cssText = `
    position:fixed;inset:0;background:#fff;z-index:999999;
    display:flex;align-items:center;justify-content:center;
    flex-direction:column;font-family:system-ui,sans-serif;
    transition:opacity 0.6s ease;opacity:0;
  `;
  screen.innerHTML = `<h2 style="font-size:28px;margin-bottom:16px;color:#333">Sie können nun mit "weiter" fortfahren.</h2>`;
  document.body.appendChild(screen);

  // Fade-In via zwei aufeinanderfolgenden rAF-Calls
  requestAnimationFrame(() => requestAnimationFrame(() => (screen.style.opacity = "1")));
}

// ============================================================
// CSS-INJECTION
// ============================================================
const style = document.createElement("style");
style.textContent = `
  /* Blur-Label-Wrapper: umschließt das geblurrte Element */
  .blur-label-wrapper { position: relative; }

  .blur-label {
    position: absolute; inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    pointer-events: auto; /* klickbar zum Enthüllen */
    cursor: pointer;
    z-index: 3;
  }

  /* Linksbündige Variante für Autor, Avatar und Bewertungsskala */
  .blur-label--left-aligned {
    justify-content: flex-start;
    text-align: left;
    padding-left: 8px;
  }

  .blur-label__text {
    color: rgba(50, 50, 50, 0.95);
    font-size: 9px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.85);
    box-shadow: 0 3px 9px rgba(0, 0, 0, 0.35);
    border-radius: 6px;
    padding: 1px 3px;
    margin: 2px;
    background-color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
  }

  .blur-label--left-aligned .blur-label__text { margin: 0; }

  /* Hover-Feedback: Label hebt sich stärker hervor */
  .blur-label:hover .blur-label__text {
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
  }
`;
document.head.appendChild(style);

// ============================================================
// INITIALISIERUNG
// ============================================================
document.addEventListener("DOMContentLoaded", () => {

  // Hotels und Reviews zufällig anordnen (vor Label-Init, damit DOM-Reihenfolge stimmt)
  shuffleHotels();
  shuffleReviews();

  // Blur-Labels auf alle bereits geblurrten Elemente legen
  initBlurLabels();

  // "Fenster schließen"-Button erzeugen (zunächst versteckt, wird nach Start-Klick sichtbar)
  const closeBtn = document.createElement("button");
  closeBtn.id = "closeTrackingButton";
  closeBtn.textContent = "Fenster schließen";
  closeBtn.style.cssText = `
    position:fixed;bottom:10px;left:50%;transform:translateX(-50%);
    z-index:99999;padding:8px 18px;background:#dc3545;color:#fff;
    border:none;border-radius:12px;cursor:pointer;font-size:14px;
    font-weight:bold;box-shadow:0 6px 20px rgba(0,0,0,0.3);display:none;
  `;
  closeBtn.addEventListener("click", endTestFlow);
  document.body.appendChild(closeBtn);

  // Mapping Selektor -> Key für den delegierten Klick-Handler
  const selectorToKey = Object.fromEntries(
    Object.entries(REVEAL_CONFIG).map(([k, v]) => [v.selector, k])
  );

  // Delegierter Klick-Handler: enthüllt beim Klick auf enthüllbare Elemente;
  // Klicks auf .blur-label werden ignoriert (haben eigenen Handler)
  document.body.addEventListener("click", (e) => {
    if (e.target.closest(".blur-label")) return;
    for (const sel of REVEAL_SELECTORS) {
      if (e.target.closest(sel)) {
        const key = selectorToKey[sel];
        if (key && !revealedElements[key]) reveal(key);
        break;
      }
    }
  });

  // Start-Button: blendet Overlay aus und zeigt Close-Button
  const startBtn     = document.getElementById("startButton");
  const startOverlay = document.getElementById("startOverlay");

  startBtn?.addEventListener("click", () => {
    if (startOverlay) startOverlay.style.display = "none";
    closeBtn.style.display = "block";
  });
});