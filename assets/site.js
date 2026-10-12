// Sunset Pawna — shared scripts
const WHATSAPP_NUMBER = '919373328374';

function openWhatsApp(message) {
  window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
}

function formatDate(value) {
  if (!value) return 'Not decided yet';
  return new Date(value + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.querySelector('.icon').textContent = open ? 'close' : 'menu';
  });
}

// Dates can't be in the past
const today = new Date();
const todayISO = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
document.querySelectorAll('input[type="date"]').forEach((input) => { input.min = todayISO; });

// Check-out must be after check-in
document.querySelectorAll('[data-checkin]').forEach((checkin) => {
  const form = checkin.closest('form');
  const checkout = form && form.querySelector('[data-checkout]');
  if (!checkout) return;
  checkin.addEventListener('change', () => {
    if (!checkin.value) return;
    const next = new Date(checkin.value + 'T00:00:00');
    next.setDate(next.getDate() + 1);
    const nextISO = next.getFullYear() + '-' + String(next.getMonth() + 1).padStart(2, '0') + '-' + String(next.getDate()).padStart(2, '0');
    checkout.min = nextISO;
    if (!checkout.value || checkout.value <= checkin.value) checkout.value = nextISO;
  });
});

// Booking search bar -> WhatsApp
document.querySelectorAll('form[data-booking]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    openWhatsApp(
      "Hi Sunset Pawna, I'd like to check availability.\n" +
      'Stay: ' + data.get('stay') + '\n' +
      'Check-in: ' + formatDate(data.get('checkin')) + '\n' +
      'Check-out: ' + formatDate(data.get('checkout')) + '\n' +
      'Guests: ' + data.get('guests')
    );
  });
});

// Contact form -> WhatsApp
document.querySelectorAll('form[data-enquiry]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    openWhatsApp(
      'Hi Sunset Pawna, I have an enquiry.\n' +
      'Name: ' + data.get('name') + '\n' +
      'Phone: ' + data.get('phone') + '\n' +
      'Stay: ' + data.get('stay') + '\n' +
      'Date: ' + formatDate(data.get('date')) + '\n' +
      'Guests: ' + data.get('guests') + '\n' +
      'Message: ' + (data.get('message') || '-')
    );
  });
});

// Footer year
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

// Single page: close the mobile menu after a tap, highlight the section in view
document.querySelectorAll('.nav a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (!nav || !nav.classList.contains('open')) return;
    // Hiding the menu cancels the browser's jump, so close it first and scroll ourselves
    event.preventDefault();
    toggle.click();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      history.pushState(null, '', link.getAttribute('href'));
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const tracked = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window && tracked.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  tracked.forEach((section) => observer.observe(section));
}
