// ============================================================
//  AJAX faceting for the faceted PLP (/shop, /shop/category/[category]).
//  Progressive enhancement over the server-rendered <form id="facetForm">:
//  filter / sort / price changes, pagination, category links and clear-all
//  fetch the target URL, swap the form region in place, and sync history.
//  Without JS the same form/links work via full-page GET navigation.
// ============================================================
const FORM = '#facetForm';

let bound = false;
let inflight: AbortController | null = null;

function facetForm(): HTMLFormElement | null {
  return document.querySelector<HTMLFormElement>(FORM);
}

/** The GET URL a native submit of the facet form would produce, minus empties. */
function formUrl(f: HTMLFormElement): string {
  const sp = new URLSearchParams();
  for (const [k, v] of new FormData(f).entries()) {
    const val = String(v).trim();
    if (val !== '') sp.append(k, val);
  }
  const action = f.getAttribute('action') || location.pathname;
  const qs = sp.toString();
  return qs ? `${action}?${qs}` : action;
}

// ── Mobile filter drawer ──────────────────────────────────────────────────
// On ≤991px the sidebar inner wrapper is an off-canvas panel. State is tracked
// in a module flag so it survives AJAX region swaps (the panel lives inside the
// swapped <form>; the body lock class lives on the stable <body>).
let drawerOpen = false;

function isDrawerViewport(): boolean {
  return window.innerWidth <= 991;
}

function drawerEls() {
  return {
    panel: document.querySelector<HTMLElement>('#sidebarInner'),
    overlay: document.querySelector<HTMLElement>('#filterDrawerOverlay'),
    toggle: document.querySelector<HTMLElement>('#sidebarToggle'),
  };
}

// The panel doubles as the static desktop sidebar, so the dialog semantics
// (role/aria-modal) are applied only while it's actually acting as a drawer.
function markPanelOpen(panel: HTMLElement | null): void {
  panel?.classList.add('is-open');
  panel?.setAttribute('role', 'dialog');
  panel?.setAttribute('aria-modal', 'true');
}
function markPanelClosed(panel: HTMLElement | null): void {
  panel?.classList.remove('is-open');
  panel?.removeAttribute('role');
  panel?.removeAttribute('aria-modal');
}

function openDrawer(): void {
  drawerOpen = true;
  const { panel, overlay, toggle } = drawerEls();
  markPanelOpen(panel);
  overlay?.classList.add('is-open');
  toggle?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('filter-drawer-open');
  // Move focus into the drawer for keyboard/screen-reader users.
  panel?.querySelector<HTMLElement>('.filter-drawer-close')?.focus();
}

function closeDrawer(): void {
  drawerOpen = false;
  const { panel, overlay, toggle } = drawerEls();
  markPanelClosed(panel);
  overlay?.classList.remove('is-open');
  toggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('filter-drawer-open');
  if (toggle && isDrawerViewport()) toggle.focus();
}

/** Re-apply drawer state to freshly swapped-in nodes / on viewport change. */
function syncDrawer(): void {
  const { panel, overlay, toggle } = drawerEls();
  if (drawerOpen && isDrawerViewport()) {
    markPanelOpen(panel);
    overlay?.classList.add('is-open');
    toggle?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('filter-drawer-open');
  } else {
    // Closed, or resized to desktop — clear everything (and unlock the body).
    markPanelClosed(panel);
    overlay?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('filter-drawer-open');
    if (!isDrawerViewport()) drawerOpen = false;
  }
}

function scrollToList(): void {
  const section = document.querySelector('.product-archive-section');
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY - 100;
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

async function navigate(url: string, opts: { push?: boolean; scroll?: boolean } = {}): Promise<void> {
  const { push = true, scroll = false } = opts;
  const region = facetForm();
  if (!region) {
    location.href = url;
    return;
  }
  if (inflight) inflight.abort();
  inflight = new AbortController();
  region.classList.add('is-faceting');
  region.setAttribute('aria-busy', 'true');
  try {
    const res = await fetch(url, { signal: inflight.signal, headers: { 'X-Requested-With': 'fetch' } });
    if (!res.ok) throw new Error(String(res.status));
    const html = await res.text();
    const next = new DOMParser().parseFromString(html, 'text/html').querySelector(FORM);
    if (!next) {
      location.href = url;
      return;
    }
    const imported = document.importNode(next, true);
    // Load-time reveal observer won't see swapped-in nodes — show them now.
    imported.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    // Fade the new results in (one-shot) so the swap glides rather than pops.
    const entering = imported.querySelector<HTMLElement>('.product-archive-wrapper');
    entering?.classList.add('is-entering');
    region.replaceWith(imported);
    requestAnimationFrame(() => entering?.classList.remove('is-entering'));
    // Mark swapped-in wishlist hearts to match the stored state.
    (window as unknown as { __dojeenSyncWishlist?: () => void }).__dojeenSyncWishlist?.();
    syncDrawer();
    if (push) history.pushState({ facet: true, url }, '', url);
    if (scroll) scrollToList();
  } catch (err) {
    if ((err as { name?: string } | null)?.name === 'AbortError') return;
    location.href = url; // fall back to a real navigation on any failure
  } finally {
    inflight = null;
  }
}

const FACET_CONTROLS = [
  '#facetForm input[name="filter"]',
  '#facetForm select[name="sort"]',
  '#facetForm input[name="price_min"]',
  '#facetForm input[name="price_max"]',
].join(',');

const LINK_TARGETS = [
  '.plp-page-btn[href]',
  '.prodcut-sidebar-category-link[href]',
  '.facet-clear-link[href]',
  '.facet-chip[href]',
  '.empty-state a[href]',
].join(',');

export function initFacets(): void {
  if (bound) return;
  bound = true;

  // Filter / sort / price changes → rebuild URL from the form and fetch.
  document.addEventListener('change', (e) => {
    const t = e.target as HTMLElement;
    if (!t.matches?.(FACET_CONTROLS)) return;
    const f = facetForm();
    if (f) navigate(formUrl(f), { scroll: false });
  });

  // Enter inside a price field commits immediately.
  document.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (e.key !== 'Enter') return;
    if (!t.matches?.('#facetForm input[name="price_min"], #facetForm input[name="price_max"]')) return;
    e.preventDefault();
    const f = facetForm();
    if (f) navigate(formUrl(f), { scroll: false });
  });

  // No-JS-style submit (e.g. the <noscript> Apply button) → intercept.
  document.addEventListener('submit', (e) => {
    const t = e.target as HTMLElement;
    if (!t.matches?.(FORM)) return;
    e.preventDefault();
    navigate(formUrl(t as HTMLFormElement), { scroll: false });
  });

  // Pagination / category / clear links → fetch instead of full navigation.
  document.addEventListener('click', (e) => {
    const me = e as MouseEvent;
    if (me.defaultPrevented || me.button !== 0 || me.metaKey || me.ctrlKey || me.shiftKey || me.altKey) return;
    const a = (e.target as HTMLElement).closest?.<HTMLAnchorElement>(LINK_TARGETS);
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('/shop')) return; // both /shop and /shop/category/* qualify
    e.preventDefault();
    const isPage = a.classList.contains('plp-page-btn') || a.classList.contains('prodcut-sidebar-category-link');
    navigate(href, { scroll: isPage });
  });

  // Mobile filter drawer: trigger toggles, anything [data-filter-close] closes.
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest?.('#sidebarToggle')) {
      e.preventDefault();
      drawerOpen ? closeDrawer() : openDrawer();
      return;
    }
    if (target.closest?.('[data-filter-close]')) {
      e.preventDefault();
      closeDrawer();
    }
  });
  // Esc closes the open drawer.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawerOpen) closeDrawer();
  });
  window.addEventListener('resize', syncDrawer);

  // Back / forward → re-fetch the popped URL without pushing a new entry.
  window.addEventListener('popstate', () => {
    navigate(location.pathname + location.search, { push: false, scroll: false });
  });

  syncDrawer();
}
