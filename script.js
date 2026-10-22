const RSVP_PHONE = '4917663465301';
document.documentElement.classList.add('js');
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
const mobile = matchMedia('(max-width: 767px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const emojiAnimations = new Set();
document.querySelectorAll('.emoji-bubble').forEach(button => {
  if (typeof button.animate !== 'function') return;
  button.disabled = false;
  let animation = null;
  function play(keyframes, duration, easing = 'ease-in-out') {
    animation = button.animate(keyframes, { duration, easing });
    const current = animation;
    emojiAnimations.add(current);
    const cleanup = () => {
      emojiAnimations.delete(current);
      if (animation === current) animation = null;
    };
    current.addEventListener('finish', cleanup, { once: true });
    current.addEventListener('cancel', cleanup, { once: true });
  }
  let observer = null;
  let pending = false;
  function reveal(animate = false) {
    if (!pending) return;
    pending = false;
    observer?.disconnect();
    button.classList.remove('emoji-pending');
    if (animate && !reducedMotion.matches) {
      play([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], 350, 'cubic-bezier(.22, 1, .36, 1)');
    }
  }
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    // Observe an unscaled slot so a zero-sized bubble can still enter the viewport.
    const slot = document.createElement('span');
    slot.className = 'emoji-slot';
    button.replaceWith(slot);
    slot.append(button);
    pending = true;
    button.classList.add('emoji-pending');
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) reveal(true);
    }, { threshold: .15 });
    observer.observe(slot);
  }
  button.addEventListener('focus', () => reveal());
  reducedMotion.addEventListener('change', event => { if (event.matches) reveal(); });
  window.addEventListener('pageshow', event => { if (event.persisted) reveal(); });
  button.addEventListener('click', () => {
    reveal();
    if (reducedMotion.matches || animation) return;
    play([
      { transform: 'scale(1)' },
      { transform: 'scale(1.15)', offset: .45 },
      { transform: 'scale(1)' }
    ], 400);
  });
});
reducedMotion.addEventListener('change', event => {
  if (event.matches) emojiAnimations.forEach(animation => animation.cancel());
});
menuButton.hidden = false;

if (document.documentElement.classList.contains('intro-pending')) {
  const controller = window.weddingIntro;
  const finishIntro = controller.finish;
  const intro = document.querySelector('.invitation-intro');
  const openButton = intro.querySelector('.intro-open');
  const scrollbarProbe = document.createElement('div');
  Object.assign(scrollbarProbe.style, { position: 'absolute', top: '-9999px', width: '100px', height: '100px', overflow: 'scroll' });
  scrollbarProbe.setAttribute('aria-hidden', 'true');
  document.body.append(scrollbarProbe);
  document.documentElement.style.setProperty('--intro-scrollbar', `${scrollbarProbe.offsetWidth - scrollbarProbe.clientWidth}px`);
  scrollbarProbe.remove();
  let opening = false;
  function openInvitation() {
    if (opening || !document.documentElement.classList.contains('intro-pending')) return;
    opening = true;
    controller.remember();
    controller.guard();
    const photo = intro.querySelector('.intro-photo');
    const heroImage = document.querySelector('.hero__image');
    const origin = photo.getBoundingClientRect();
    const target = heroImage.getBoundingClientRect();
    const flight = document.createElement('img');
    flight.className = 'intro-flight';
    flight.src = heroImage.currentSrc || heroImage.src;
    flight.alt = '';
    flight.setAttribute('aria-hidden', 'true');
    const from = {
      left: `${origin.left}px`, top: `${origin.top}px`,
      width: `${origin.width}px`, height: `${origin.height}px`,
      borderRadius: getComputedStyle(photo).borderRadius,
      objectPosition: getComputedStyle(photo.querySelector('img')).objectPosition,
    };
    const to = {
      left: `${target.left}px`, top: `${target.top}px`,
      width: `${target.width}px`, height: `${target.height}px`,
      borderRadius: '0px', objectPosition: getComputedStyle(heroImage).objectPosition,
    };
    Object.assign(flight.style, from);
    document.body.append(flight);
    document.documentElement.classList.add('intro-opening');
    if (typeof flight.animate === 'function') {
      flight.animate([
        { ...from, opacity: 1, offset: 0 },
        { ...to, opacity: 1, offset: .82 },
        { ...to, opacity: 0, offset: 1 },
      ], { duration: 900, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' })
        .finished.then(finishIntro).catch(finishIntro);
    } else {
      flight.remove();
      setTimeout(finishIntro, 900);
    }
  }
  openButton.addEventListener('click', openInvitation);
  intro.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      event.preventDefault();
      intro.classList.add('intro-keyboard');
      openButton.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.documentElement.classList.contains('intro-pending')) {
      controller.remember();
      finishIntro();
    }
  });
  addEventListener('hashchange', finishIntro);
  reducedMotion.addEventListener('change', event => { if (event.matches) finishIntro(); });
  document.querySelectorAll('.site-header, main, .footer').forEach(element => {
    element.inert = true;
    element.setAttribute('data-intro-inert', '');
  });
  openButton.focus({ preventScroll: true });
  controller.ready();
  intro.querySelectorAll('img').forEach(image => { image.decode().catch(finishIntro); });
}

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
let imageFrame = 0;
function updateMeadow() {
  imageFrame = 0;
  const box = meadow.getBoundingClientRect();
  const enabled = !mobile.matches && !reducedMotion.matches;
  const progress = (innerHeight / 2 - box.top - box.height / 2) / ((innerHeight + box.height) / 2);
  const shift = enabled ? Math.max(-16, Math.min(16, progress * 16)) : 0;
  meadow.style.setProperty('--image-shift', `${shift}px`);
}
function queueMeadow() { if (!imageFrame) imageFrame = requestAnimationFrame(updateMeadow); }
addEventListener('scroll', queueMeadow, { passive: true });
addEventListener('resize', queueMeadow);
reducedMotion.addEventListener('change', queueMeadow);
updateMeadow();

const revealTargets = [...document.querySelectorAll('.section__heading, .intro h2, .intro__copy > p:first-child, #uebernachten .content-stack > p:first-child, .timeline li')];
let revealObserver;
function revealAll() {
  revealObserver?.disconnect();
  revealTargets.forEach(element => element.classList.remove('reveal-pending', 'reveal-ready'));
}
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('reveal-pending');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
  const pendingReveals = [];
  revealTargets.forEach(element => {
    const box = element.getBoundingClientRect();
    if (box.top < innerHeight && box.bottom > 0) return;
    if (element.matches('.timeline li')) {
      element.style.setProperty('--reveal-delay', `${[...element.parentElement.children].indexOf(element) * 60}ms`);
    } else if (element.matches('p')) {
      element.style.setProperty('--reveal-delay', '90ms');
    }
    element.classList.add('reveal-pending');
    pendingReveals.push(element);
  });
  // Commit starting positions once before enabling the entrance transitions.
  if (pendingReveals.length) pendingReveals[0].getBoundingClientRect();
  pendingReveals.forEach(element => {
    element.classList.add('reveal-ready');
    revealObserver.observe(element);
  });
}
reducedMotion.addEventListener('change', event => { if (event.matches) revealAll(); });
addEventListener('pageshow', event => { if (event.persisted) revealAll(); });

const brand = document.querySelector('.brand');
let leafFrame = 0;
let leafCleanup = 0;
let leafBurst;
function cancelLeaves() {
  cancelAnimationFrame(leafFrame);
  leafFrame = 0;
  clearTimeout(leafCleanup);
  leafBurst?.remove();
  leafBurst = null;
}
function showLeaves() {
  if (reducedMotion.matches || leafBurst) return;
  const box = brand.getBoundingClientRect();
  leafBurst = document.createElement('div');
  leafBurst.className = 'leaf-burst';
  leafBurst.setAttribute('aria-hidden', 'true');
  leafBurst.style.left = `${box.left + box.width / 2}px`;
  leafBurst.style.top = `${header.getBoundingClientRect().bottom + 8}px`;
  for (let index = 0; index < 6; index++) {
    const leaf = document.createElement('img');
    leaf.src = 'assets/watercolor-leaf.webp';
    leaf.alt = '';
    leaf.style.setProperty('--leaf-x', `${index * 15 - 18}px`);
    leaf.style.setProperty('--leaf-y', `${38 + (index % 3) * 14}px`);
    leaf.style.setProperty('--leaf-angle', `${index * 41 - 65}deg`);
    leafBurst.append(leaf);
  }
  document.body.append(leafBurst);
  leafCleanup = setTimeout(cancelLeaves, 900);
}
brand.addEventListener('click', event => {
  if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || reducedMotion.matches) return;
  setMenu(false);
  if (leafFrame || leafBurst) return;
  const start = performance.now();
  function awaitTop() {
    leafFrame = 0;
    if (scrollY <= 2) { showLeaves(); return; }
    if (performance.now() - start < 2000) leafFrame = requestAnimationFrame(awaitTop);
  }
  leafFrame = requestAnimationFrame(awaitTop);
});
addEventListener('wheel', cancelLeaves, { passive: true });
addEventListener('touchstart', cancelLeaves, { passive: true });
document.addEventListener('keydown', event => {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'End', 'Home', ' '].includes(event.key)) cancelLeaves();
});
reducedMotion.addEventListener('change', event => { if (event.matches) cancelLeaves(); });

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
