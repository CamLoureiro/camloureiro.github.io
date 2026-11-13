/* =========================================================
   PORTFOLIO · JavaScript principal
   1. Idioma (ES / EN)
   2. Menú hamburguesa
   3. Animaciones al hacer scroll
   4. Formulario de contacto
   5. Año automático en el footer
   ========================================================= */

const root = document.documentElement;


/* ---------- 1. IDIOMA ----------
   El idioma inicial ya se eligió en el <head> (script corto) para
   evitar un "parpadeo". Acá solo manejamos los botones ES / EN. */
function setLanguage(lang) {
  root.lang = lang;
  try { localStorage.setItem('lang', lang); } catch (e) { /* modo privado: no pasa nada */ }

  document.querySelectorAll('[data-set-lang]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.setLang === lang));
  });

  // Textos que viven en atributos (no se pueden duplicar como los demás)
  document.querySelectorAll('[data-aria-en]').forEach((el) => {
    el.setAttribute('aria-label', lang === 'es' ? el.dataset.ariaEs : el.dataset.ariaEn);
  });

  // Título de la pestaña del navegador
  const title = lang === 'es' ? root.dataset.titleEs : root.dataset.titleEn;
  if (title) document.title = title;
}

document.querySelectorAll('[data-set-lang]').forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.setLang));
});
setLanguage(root.lang === 'es' ? 'es' : 'en');


/* ---------- 2. MENÚ ---------- */
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
const backdrop = document.querySelector('.menu-backdrop');

function openMenu() {
  document.body.classList.add('menu-open');
  menuBtn.setAttribute('aria-expanded', 'true');
  menu.removeAttribute('inert');
  // Llevamos el foco al primer link, para quien navega con teclado
  setTimeout(() => menu.querySelector('a')?.focus(), 300);
}

function closeMenu({ returnFocus = true } = {}) {
  document.body.classList.remove('menu-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  menu.setAttribute('inert', '');
  if (returnFocus) menuBtn.focus();
}

if (menuBtn && menu) {
  menu.setAttribute('inert', ''); // cerrado al inicio: no se puede tabular adentro

  menuBtn.addEventListener('click', () => {
    menuBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });
  backdrop?.addEventListener('click', () => closeMenu());

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) closeMenu();
  });

  // Cerrar al elegir un link (útil para links a #anclas en la misma página)
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => closeMenu({ returnFocus: false }));
  });
}


/* ---------- 3. ANIMACIONES ----------
   IntersectionObserver avisa cuando un elemento entra en pantalla
   y le agregamos la clase .is-visible (el CSS hace el resto). */
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // se anima una sola vez
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => {
    // Lo que ya se ve al cargar la página aparece de inmediato
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
    else observer.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}


/* ---------- 4. FORMULARIO ----------
   Usa Formspree (gratis). Cuando crees tu formulario en formspree.io,
   reemplazá TU_ID_DE_FORMSPREE en contacto.html por tu ID real. */
const form = document.getElementById('contact-form');

if (form) {
  const statusBox = document.getElementById('form-status');

  function showStatus(type) {
    statusBox.hidden = false;
    statusBox.querySelectorAll('[data-status]').forEach((el) => {
      el.hidden = el.dataset.status !== type;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const endpoint = form.dataset.endpoint || '';

    if (!form.checkValidity()) { form.reportValidity(); return; }

    // Mientras no esté conectado a Formspree, mostramos un aviso
    if (endpoint.includes('TU_ID_DE_FORMSPREE')) { showStatus('not-connected'); return; }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Error ' + res.status);
      form.reset();
      showStatus('success');
    } catch (err) {
      showStatus('error');
    } finally {
      button.disabled = false;
    }
  });
}


/* ---------- 5. AÑO DEL FOOTER ---------- */
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
