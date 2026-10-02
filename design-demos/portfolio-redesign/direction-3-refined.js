/* Prototype-only view routing; no calls to application APIs. */
const views = [...document.querySelectorAll('[data-view]')];
const nav = document.querySelector('.site-nav');
const navToggle = document.querySelector('.nav-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const dialog = document.querySelector('.image-dialog');
let activeView;
let imageTrigger;

function closeMenu() {
  nav.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Mở điều hướng');
}

function route() {
  const [requested, section] = location.hash.slice(1).split('/');
  if (requested === 'main' && activeView) return;
  const view = views.some(item => item.dataset.view === requested) ? requested : 'home';
  views.forEach(item => { item.hidden = item.dataset.view !== view; });
  const title = { home: 'Đặng Văn Tiến — Human × Sidekick', me: 'Me — Đặng Văn Tiến', discord: 'ChatDVT — Discord Bot' };
  document.title = `${title[view]} · Bản duyệt`;
  document.querySelectorAll('[data-preview]').forEach(link => {
    if (link.dataset.preview === view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-nav]').forEach(link => {
    const isCurrent = link.dataset.nav === (section || view);
    if (isCurrent) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  closeMenu();
  const sectionTarget = section && document.querySelector(`[data-view="${view}"]`)?.querySelector(`#${CSS.escape(section)}`);
  if (sectionTarget) {
    window.scrollTo({ top: sectionTarget.getBoundingClientRect().top + window.scrollY - 110, behavior: 'instant' });
  } else {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  if (activeView && activeView !== view) {
    const heading = document.querySelector(`[data-view="${view}"] h1`);
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  activeView = view;
}

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Đóng điều hướng' : 'Mở điều hướng');
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
  const link = event.target.closest('a[href^="#"]');
  if (link && link.getAttribute('href') === location.hash && location.hash !== '#main') {
    event.preventDefault();
    route();
  }
});
themeToggle.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối');
});
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
  imageTrigger = button;
  const image = dialog.querySelector('img');
  image.src = button.dataset.image;
  image.alt = button.dataset.caption;
  document.querySelector('#image-caption').textContent = button.dataset.caption;
  dialog.showModal();
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => imageTrigger?.focus({ preventScroll: true }));
window.addEventListener('hashchange', route);
route();
