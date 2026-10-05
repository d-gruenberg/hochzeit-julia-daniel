const RSVP_PHONE = '4917663465301';
document.documentElement.classList.add('js');
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
const mobile = matchMedia('(max-width: 767px)');
menuButton.hidden = false;

function setMenu(open, restoreFocus = false) {
  header.classList.toggle('menu-is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
document.addEventListener('click', (event) => { if (!header.contains(event.target)) setMenu(false); });
header.addEventListener('focusout', () => {
  requestAnimationFrame(() => { if (!header.contains(document.activeElement)) setMenu(false); });
});
nav.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  setMenu(false);
  const section = document.querySelector(link.getAttribute('href'));
  section.tabIndex = -1;
  section.focus({ preventScroll: true });
});
mobile.addEventListener('change', () => setMenu(false));
const hero = document.querySelector('.hero');
function updateHeader() { header.classList.toggle('is-solid', hero.getBoundingClientRect().bottom <= header.offsetHeight); }
addEventListener('scroll', updateHeader, { passive: true });
addEventListener('resize', updateHeader);
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  updateHeader();
}).observe(header);
updateHeader();

const meadow = document.querySelector('.image-break');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let imageFrame = 0;
function updateMeadow() {
  imageFrame = 0;
  const box = meadow.getBoundingClientRect();
  const enabled = !mobile.matches && !reducedMotion.matches;
  const progress = (innerHeight / 2 - box.top - box.height / 2) / ((innerHeight + box.height) / 2);
  const shift = enabled ? Math.max(-32, Math.min(32, progress * 32)) : 0;
  meadow.style.setProperty('--image-shift', `${shift}px`);
}
function queueMeadow() { if (!imageFrame) imageFrame = requestAnimationFrame(updateMeadow); }
addEventListener('scroll', queueMeadow, { passive: true });
addEventListener('resize', queueMeadow);
reducedMotion.addEventListener('change', queueMeadow);
updateMeadow();

const countdown = document.querySelector('#countdown');
const deadlineCurrent = document.querySelector('#rsvpDeadlineCurrent');
const deadlinePast = document.querySelector('#rsvpDeadlinePast');
function updateCountdown() {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const days = Math.round((Date.parse('2027-05-01T00:00:00Z') - Date.parse(`${today}T00:00:00Z`)) / 86400000);
  countdown.hidden = days < 0;
  if (days >= 0) countdown.textContent = days === 0 ? 'Heute feiern wir!' : `Noch ${days} ${days === 1 ? 'Tag' : 'Tage'} bis zu unserer Hochzeit`;
  deadlineCurrent.hidden = today > '2027-01-31';
  deadlinePast.hidden = !deadlineCurrent.hidden;
}
updateCountdown();
setInterval(updateCountdown, 60000);

const form = document.querySelector('#rsvpForm');
const people = document.querySelector('#people');
const template = document.querySelector('#personTemplate');
const roomFields = document.querySelector('#roomFields');
const roomDetails = document.querySelector('#roomDetails');
const room = document.querySelector('#room');
const status = document.querySelector('#formStatus');
const fallback = document.querySelector('#messageFallback');
const preview = document.querySelector('#messagePreview');
let personId = 0;
function personData() {
  return [...people.querySelectorAll('.person')].map((person) => ({
    name: person.querySelector('.person-name').value.trim(),
    attending: person.querySelector('input[type="radio"]:checked')?.value === 'yes',
    food: person.querySelector('.person-food').value,
    allergies: person.querySelector('.person-allergies').value.trim(),
  }));
}
function updateForm() {
  const persons = [...people.querySelectorAll('.person')];
  persons.forEach((person, index) => {
    person.querySelector('legend').textContent = `Person ${index + 1}`;
    person.querySelector('.person-title').textContent = `Person ${index + 1}`;
    const remove = person.querySelector('.remove-person');
    remove.hidden = persons.length === 1;
    remove.setAttribute('aria-label', `Person ${index + 1} entfernen`);
    const meal = person.querySelector('.meal-fields');
    meal.hidden = meal.disabled = person.querySelector('input[type="radio"]:checked')?.value !== 'yes';
  });
  const attending = personData().some((person) => person.attending);
  roomFields.hidden = roomFields.disabled = !attending;
  roomDetails.hidden = roomDetails.disabled = !attending || !room.value || room.value === 'Kein Zimmer benötigt';
  status.textContent = '';
  fallback.hidden = true;
  preview.value = '';
}
function addPerson(focus = true) {
  const fragment = template.content.cloneNode(true);
  const person = fragment.querySelector('.person');
  const id = ++personId;
  person.querySelectorAll('input[type="radio"]').forEach((input) => { input.name = `attendance-${id}`; });
  person.querySelector('.remove-person').addEventListener('click', () => {
    const target = person.previousElementSibling || person.nextElementSibling;
    person.remove();
    updateForm();
    target?.querySelector('.person-name').focus();
  });
  people.append(fragment);
  updateForm();
  if (focus) person.querySelector('.person-name').focus();
}
document.querySelector('#addPerson').addEventListener('click', () => addPerson());
form.addEventListener('input', updateForm);
form.addEventListener('change', updateForm);
addPerson(false);
form.hidden = false;

function buildMessage() {
  const persons = personData();
  const attending = persons.some((person) => person.attending);
  const lines = ['Liebe Julia, lieber Daniel,', '', 'unsere Rückmeldung zu eurer Hochzeit am 1. Mai 2027:', ''];
  for (const person of persons) {
    lines.push(`${person.name}: ${person.attending ? 'Zusage' : 'Absage'}`);
    if (person.attending) lines.push(`Essen: ${person.food}`, `Allergien/Unverträglichkeiten: ${person.allergies || 'nicht angegeben'}`);
    lines.push('');
  }
  if (attending) {
    lines.push(`Zimmerwunsch: ${room.value}`);
    if (room.value !== 'Kein Zimmer benötigt') {
      lines.push(`Anzahl Zimmer: ${form.elements.roomCount.value}`);
      lines.push(`Belegung / weitere Zimmerwünsche: ${form.elements.occupancy.value.trim() || 'noch offen'}`);
    }
    lines.push('', 'Wir freuen uns auf euch!');
  } else lines.push('Leider können wir nicht dabei sein. Wir wünschen euch einen wunderschönen Tag!');
  return lines.join('\n');
}
function validMessage() {
  people.querySelectorAll('.person-name').forEach((input) => { input.value = input.value.trim(); });
  if (!form.reportValidity()) return null;
  return buildMessage();
}
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = validMessage();
  if (!message) return;
  preview.value = message;
  fallback.hidden = false;
  const link = document.createElement('a');
  link.href = `https://wa.me/${RSVP_PHONE}?text=${encodeURIComponent(message)}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
  status.textContent = 'Deine Nachricht ist vorbereitet. In WhatsApp kannst du sie prüfen und absenden.';
});
document.querySelector('#copyMessage').addEventListener('click', async () => {
  const message = validMessage();
  if (!message) return;
  preview.value = message;
  fallback.hidden = false;
  try {
    await navigator.clipboard.writeText(message);
    status.textContent = 'Nachricht kopiert.';
  } catch {
    preview.focus();
    preview.select();
    status.textContent = 'Bitte kopiere die markierte Nachricht.';
  }
});
