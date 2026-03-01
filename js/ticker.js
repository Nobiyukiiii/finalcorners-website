/**
 * ══════════════════════════════════════════════
 *  Final Corners — Ticker Module
 *  js/ticker.js
 *
 *  Reads coming_soon songs + published news from
 *  Supabase via Services, renders into #ticker-track,
 *  hides #top-ticker if there is nothing to show.
 *
 *  Load order in index.html (classic <script>, no type="module"):
 *    js/config.js   → getSupabase()
 *    js/services.js → Services
 *    js/render.js   → Render
 *    js/ticker.js   ← this file
 *    js/songs.js
 * ══════════════════════════════════════════════
 */

(async function TickerModule() {

  const bar   = document.getElementById('top-ticker');
  const track = document.getElementById('ticker-track');
  if (!bar || !track) return; // guard: not on a page with the ticker

  // ── 1. Fetch songs + news in parallel ─────────────────────
  let songs = [];
  let news  = [];

  try {
    [songs, news] = await Promise.all([
      Services.getSongs(),
      Services.getNews({ limit: 50 }),
    ]);
  } catch (err) {
    // Non-fatal — ticker failure must never break the page
    console.warn('[Ticker] Data fetch failed:', err);
    bar.style.display = 'none';
    return;
  }

  // ── 2. Filter by status ────────────────────────────────────
  const comingSoon    = songs.filter(s => s.status === 'coming_soon');
  const publishedNews = news.filter(a => a.status  === 'published');

  // ── 3. Nothing to show → hide bar ─────────────────────────
  if (comingSoon.length === 0 && publishedNews.length === 0) {
    bar.style.display = 'none';
    document.body.classList.remove('ticker-visible');
    return;
  }

  // ── 4. Build unified list, sort by date descending ─────────
  const items = [
    ...comingSoon.map(s => ({
      type : 'song',
      label: 'Segera Hadir',
      title: s.title,
      date : s.release_date || '',
      href : null, // coming_soon → no clickable link
    })),
    ...publishedNews.map(a => ({
      type : 'news',
      label: 'News',
      title: a.title,
      date : a.published_at || '',
      href : a.slug ? `/news/article.html?slug=${a.slug}` : null,
    })),
  ].sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

  // ── 5. Build item HTML ─────────────────────────────────────
  //  Items are duplicated once — CSS animates translateX(-50%)
  //  for a seamless infinite loop with zero JS timers.
  function buildItems() {
    return items.map(item => {
      const inner =
        `<span class="ticker-item__badge ticker-item__badge--${item.type}">${item.label}</span>` +
        `<span class="ticker-item__title">${item.title}</span>` +
        `<span class="ticker-item__sep" aria-hidden="true">·</span>`;

      return item.href
        ? `<a   class="ticker-item" href="${item.href}"
               aria-label="${item.label}: ${item.title}">${inner}</a>`
        : `<div class="ticker-item"
               aria-label="${item.label}: ${item.title}">${inner}</div>`;
    }).join('');
  }

  track.innerHTML = buildItems() + buildItems(); // duplicate for seamless loop

  // ── 6. Speed: ~5 s per item, min 10 s ─────────────────────
  const durationSec = Math.max(10, items.length * 5);
  track.style.animationDuration = `${durationSec}s`;

  // ── 7. Reveal bar + let CSS shift the layout ───────────────
  bar.style.display = 'flex';
  document.body.classList.add('ticker-visible');

})();
