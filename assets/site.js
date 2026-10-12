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
// Coming from another page (e.g. index.html#about): jump to the section once the page has loaded
window.addEventListener('load', () => {
  const target = location.hash && document.querySelector(location.hash);
  if (target) target.scrollIntoView({ behavior: 'instant' });
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

// Hero slider: autoplay, arrows, dots, swipe
const slider = document.querySelector('.slider');
if (slider) {
  const slides = [...slider.querySelectorAll('.slide')];
  const dots = [...slider.querySelectorAll('.slider-dots button')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => (i === current ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { if (!reduceMotion) { stop(); timer = setInterval(() => show(current + 1), 5000); } };

  slider.querySelector('.prev').addEventListener('click', () => { show(current - 1); start(); });
  slider.querySelector('.next').addEventListener('click', () => { show(current + 1); start(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);

  let touchX = null;
  slider.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { show(current + (dx < 0 ? 1 : -1)); start(); }
    touchX = null;
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}

// Gallery lightbox
const figures = [...document.querySelectorAll('.masonry figure')];
if (figures.length) {
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photo viewer');
  box.innerHTML = '<img alt=""/><figcaption></figcaption>' +
    '<button class="lb-close" type="button" aria-label="Close"><span class="icon">close</span></button>' +
    '<button class="lb-prev" type="button" aria-label="Previous photo"><span class="icon">chevron_left</span></button>' +
    '<button class="lb-next" type="button" aria-label="Next photo"><span class="icon">chevron_right</span></button>';
  document.body.appendChild(box);
  const boxImg = box.querySelector('img');
  const boxCap = box.querySelector('figcaption');
  let index = 0;

  const open = (i) => {
    index = (i + figures.length) % figures.length;
    const img = figures[index].querySelector('img');
    boxImg.src = img.src.replace(/w=\d+(&h=\d+)?/, 'w=1600');
    boxImg.alt = img.alt;
    boxCap.textContent = img.alt;
    box.classList.add('open');
  };
  const close = () => box.classList.remove('open');

  figures.forEach((fig, i) => fig.addEventListener('click', () => open(i)));
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', () => open(index - 1));
  box.querySelector('.lb-next').addEventListener('click', () => open(index + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') open(index - 1);
    if (e.key === 'ArrowRight') open(index + 1);
  });
}
