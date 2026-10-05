const RSVP_PHONE = "4917663465301";

const form = document.querySelector("#rsvpForm");

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const guests = cleanValue(formData.get("guests"));
  const food = cleanValue(formData.get("food"));
  const allergies = cleanValue(formData.get("allergies"));
  const room = cleanValue(formData.get("room"));

  const message = [
    "Liebe Julia, lieber Daniel,",
    "",
    "wir melden uns zu eurer Hochzeit am 1. Mai 2027 zurück:",
    "",
    `Wer kommt: ${guests || "[bitte ergänzen]"}`,
    `Essen je Person: ${food || "[bitte ergänzen]"}`,
    `Allergien/Unverträglichkeiten: ${allergies || "keine"}`,
    `Zimmerwunsch: ${room || "Kein Zimmer benötigt"}`,
    "",
    "Wir freuen uns auf euch!",
  ].join("\n");

  window.open(`https://wa.me/${RSVP_PHONE}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

function cleanValue(value) {
  return String(value || "").trim();
}
