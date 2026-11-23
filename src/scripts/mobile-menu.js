import anime from 'animejs/lib/anime.es.js';

const menuPaths = [
  'M4 8 C7 8 11 8 15 8 C19 8 23 8 28 8 C28 8 28 8 28 8',
  'M4 16 C7 16 11 16 15 16 C19 16 23 16 28 16 C28 16 28 16 28 16',
  'M4 24 C7 24 11 24 15 24 C19 24 23 24 28 24 C28 24 28 24 28 24',
];

const heartPaths = [
  'M4 11 C4 6 8 3 12 3 C14 3 15 4 16 6 C16 6 16 6 16 6',
  'M16 6 C18 4 19 3 21 3 C26 3 29 7 28 11 C27 17 20 23 16 27',
  'M4 11 C4 17 10 23 16 27 C16 27 16 27 16 27 C16 27 16 27 16 27',
];

const heartColors = ['#c8102e', '#15803d', '#c8102e'];
const menuColor = '#1a1a1a';
let cleanupMenu = () => {};
let activeButton = null;

function initializeMobileMenu() {
  const button = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!button || !menu || button === activeButton) return;

  cleanupMenu();
  const controller = new AbortController();
  const paths = [...button.querySelectorAll('[data-menu-stroke]')];
  const openLabel = button.dataset.openLabel;
  const closeLabel = button.dataset.closeLabel;
  let isOpen = false;
  activeButton = button;

  paths.forEach((path, index) => {
    path.setAttribute('d', menuPaths[index]);
    path.setAttribute('stroke', menuColor);
  });

  function setMenuOpen(open) {
    if (isOpen === open) return;
    isOpen = open;
    menu.classList.toggle('active', open);
    menu.setAttribute('aria-hidden', String(!open));
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? closeLabel : openLabel);
    document.body.classList.toggle('mobile-menu-open', open);

    paths.forEach((path, index) => {
      anime.remove(path);
      anime({
        targets: path,
        d: open ? heartPaths[index] : menuPaths[index],
        stroke: open ? heartColors[index] : menuColor,
        duration: open ? 760 : 420,
        delay: open ? index * 45 : 0,
        easing: open ? 'easeOutElastic(1, .65)' : 'easeInOutQuad',
      });
    });
  }

  button.addEventListener('click', () => setMenuOpen(!isOpen), {
    signal: controller.signal,
  });
  menu.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) setMenuOpen(false);
  }, { signal: controller.signal });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) {
      setMenuOpen(false);
      button.focus();
    }
  }, { signal: controller.signal });

  cleanupMenu = () => {
    controller.abort();
    paths.forEach((path, index) => {
      anime.remove(path);
      path.setAttribute('d', menuPaths[index]);
      path.setAttribute('stroke', menuColor);
    });
    menu.classList.remove('active');
    menu.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', openLabel);
    document.body.classList.remove('mobile-menu-open');
    activeButton = null;
  };
}

document.addEventListener('astro:before-swap', () => cleanupMenu());
document.addEventListener('astro:page-load', initializeMobileMenu);
document.addEventListener('DOMContentLoaded', initializeMobileMenu, { once: true });

if (document.readyState !== 'loading') initializeMobileMenu();
