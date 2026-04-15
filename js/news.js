/**
 * ══════════════════════════════════════════════
 *  Final Corners — News Module  (v2.1 FIXED STORAGE)
 * ══════════════════════════════════════════════
 */

(async function NewsModule() {
  'use strict';

  const featuredEl = document.getElementById('news-featured');
  const gridEl     = document.getElementById('news-grid');
  const countEl    = document.getElementById('news-count');
  if (!gridEl) return;

  const hasFeaturedSlot = !!featuredEl;

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────

  function esc(s) {
    return String(s || '')
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // 🔥 FIX UTAMA: ambil URL gambar dari storage
  function getImageUrl(article) {

    // Legacy: sudah full URL
    if (article.featured_image && article.featured_image.startsWith('http')) {
      return article.featured_image;
    }

    // New system: pakai featured_image_path
    if (article.featured_image_path) {
      const { data } = supabase.storage
        .from(CONFIG.STORAGE_BUCKET)
        .getPublicUrl(article.featured_image_path);

      return data?.publicUrl || null;
    }

    return null;
  }

  function thumbHTML(img, title, cls) {
    return img
      ? `<div class="${cls}">
           <img src="${esc(img)}" alt="${esc(title)}" loading="lazy" itemprop="image">
         </div>`
      : `<div class="${cls} ${cls}--ph" aria-hidden="true">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
             <rect x="3" y="3" width="18" height="18" rx="2"/>
             <circle cx="8.5" cy="8.5" r="1.5"/>
             <polyline points="21 15 16 10 5 21"/>
           </svg>
         </div>`;
  }

  function schemaMeta(a) {
    const canon = `https://finalcorners.my.id/news/article.html?slug=${encodeURIComponent(a.slug)}`;
    return `<meta itemprop="url"           content="${canon}">
            <meta itemprop="datePublished" content="${a.published_at || ''}">
            <meta itemprop="dateModified"  content="${a.updated_at || a.published_at || ''}">
            <meta itemprop="author"        content="Final Corners">`;
  }

  // ─────────────────────────────────────────────
  // Featured
  // ─────────────────────────────────────────────

  function buildFeatured(a) {
    const href  = `/news/article.html?slug=${encodeURIComponent(a.slug)}`;
    const img   = getImageUrl(a);

    return `
      <article itemscope itemtype="https://schema.org/Article">
        ${schemaMeta(a)}
        <a href="${href}" class="news-featured-card" aria-label="${esc(a.title)}">
          ${thumbHTML(img, a.title, 'news-featured-thumb')}
          <div class="news-featured-body">
            <span class="news-featured-date">${formatDate(a.published_at)}</span>
            <h2 class="news-featured-title" itemprop="headline">${esc(a.title)}</h2>
            ${a.meta_description
              ? `<p class="news-featured-desc" itemprop="description">${esc(a.meta_description)}</p>`
              : ''}
            <span class="news-featured-cta">
              Baca Selengkapnya
              <span class="news-featured-cta-arrow"></span>
            </span>
          </div>
        </a>
      </article>`;
  }

  // ─────────────────────────────────────────────
  // Grid
  // ─────────────────────────────────────────────

  function buildCard(a, index) {
    const href = `/news/article.html?slug=${encodeURIComponent(a.slug)}`;
    const num  = String(index + 1).padStart(2, '0');
    const img  = getImageUrl(a);

    return `
      <article itemscope itemtype="https://schema.org/Article">
        ${schemaMeta(a)}
        <a href="${href}" class="news-card" aria-label="${esc(a.title)}">
          ${thumbHTML(img, a.title, 'news-card-thumb')}
          <div class="news-card-body">
            <span class="news-card-date">${formatDate(a.published_at)}</span>
            <h2 class="news-card-title" itemprop="headline">${esc(a.title)}</h2>
            ${a.meta_description
              ? `<p class="news-card-desc" itemprop="description">${esc(a.meta_description)}</p>`
              : ''}
            <div class="news-card-foot">
              <span class="news-card-cta">Baca →</span>
              <span class="news-card-num">${num}</span>
            </div>
          </div>
        </a>
      </article>`;
  }

  function buildFallbackCard(a, index) {
    if (typeof Render !== 'undefined' && Render.newsCard) {
      return Render.newsCard(a);
    }
    return buildCard(a, index);
  }

  // ─────────────────────────────────────────────
  // Fetch & Render
  // ─────────────────────────────────────────────

  try {
    const all      = await Services.getNews({ limit: 30 });
    const articles = all.filter(a => a.status === 'published');

    if (featuredEl) featuredEl.innerHTML = '';
    gridEl.innerHTML = '';

    if (!articles.length) {
      if (featuredEl) {
        featuredEl.style.display = 'none';
        const featuredSection = document.getElementById('news-featured-section');
        if (featuredSection) featuredSection.style.display = 'none';
      }

      gridEl.innerHTML = `<div class="fc-empty" style="grid-column:1/-1">
        Belum ada artikel yang diterbitkan.
      </div>`;
      return;
    }

    if (hasFeaturedSlot) {
      featuredEl.innerHTML = buildFeatured(articles[0]);

      const rest = articles.slice(1);

      if (!rest.length) {
        gridEl.innerHTML = `<div class="fc-empty" style="grid-column:1/-1">
          Tidak ada artikel lain saat ini.
        </div>`;
      } else {
        rest.forEach((a, i) =>
          gridEl.insertAdjacentHTML('beforeend', buildCard(a, i))
        );
        if (countEl) countEl.textContent = rest.length + ' artikel';
      }

    } else {
      articles.forEach((a, i) => {
        gridEl.insertAdjacentHTML('beforeend', buildFallbackCard(a, i));
      });
    }

  } catch (err) {
    console.error('[News] Error:', err);
    if (featuredEl) featuredEl.innerHTML = '';
    gridEl.innerHTML = `<div class="fc-error" style="grid-column:1/-1">
      Tidak dapat memuat artikel. Coba lagi nanti.
    </div>`;
  }

})();
