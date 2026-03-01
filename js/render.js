/**
 * ══════════════════════════════════════════════
 *  Final Corners — UI Render Helpers (clean)
 * ══════════════════════════════════════════════
 */

const Render = (() => {

  // ── Loading skeleton ─────────────────────────
  function skeleton(count = 3, height = '120px') {
    return Array.from({ length: count }, () =>
      `<div style="background:var(--surface2);height:${height};border:1px solid var(--border);animation:fc-shimmer 1.4s ease-in-out infinite;"></div>`
    ).join('');
  }

  // ── Empty state ──────────────────────────────
  function empty(msg = 'Belum ada konten.') {
    return `<div class="fc-empty"><p>${msg}</p></div>`;
  }

  // ── Error state ──────────────────────────────
  function error(msg = 'Terjadi kesalahan. Coba lagi nanti.') {
    return `<div class="fc-error"><p>${msg}</p></div>`;
  }

  // ── Format date (Indonesian) ─────────────────
  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  // ── Build member row ─────────────────────────
  function memberRow(member, index) {
    const isEven = index % 2 === 1;
    const num    = String(index + 1).padStart(2, '0');
    const parity = isEven ? 'even' : 'odd';
    const photo  = member.photo_url || '';

    return `
      <div class="member-row member-row--${parity}" itemscope itemtype="https://schema.org/Person">
        <div class="member-row-photo">
          ${photo
            ? `<img src="${photo}" alt="${member.name} — ${member.role} Final Corners"
                itemprop="image" loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : ''}
          <div class="member-row-photo-placeholder" style="display:${photo ? 'none' : 'flex'};" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
        </div>
        <div class="member-row-info">
          <span class="member-row-number" aria-hidden="true">${num}</span>
          <p class="member-row-role" itemprop="jobTitle">
            <span class="typing-role" data-text="${member.role}">${member.role}</span>
            <span class="typing-cursor"></span>
          </p>
          <h3 class="member-row-name" itemprop="name">
            <span class="typing-name" data-text="${member.name}">${member.name}</span>
            <span class="typing-cursor"></span>
          </h3>
          <div class="member-row-divider"></div>
          <p class="member-row-desc">${member.bio || ''}</p>
        </div>
      </div>`;
  }

  // ── Build release card ────────────────────────
  function releaseCard(r) {
    const hasVideo   = !!(r.youtube_url && r.youtube_url.trim());
    const youtubeId  = hasVideo ? (r.youtube_url.match(/[?&]v=([^&]+)/)?.[1] || '') : '';
    const hasSpotify = !!(r.spotify_url && r.spotify_url.trim());
    const hasLinks   = hasSpotify || hasVideo;
    const year       = r.release_date ? new Date(r.release_date).getFullYear() : '';

    return `
      <article class="release-card${!hasLinks ? ' release-card--soon' : ''}" 
        aria-label="${r.title} — ${r.type || 'Single'} Final Corners" 
        id="track-${r.id}">

        <div class="release-cover-wrap">
          ${r.cover_url
            ? `<img src="${r.cover_url}" alt="Final Corners — ${r.title} cover art"
                class="release-cover" width="600" height="600"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : ''}

          <div class="release-cover-placeholder" style="display:${r.cover_url ? 'none' : 'flex'};" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <span>Cover Image</span>
          </div>

          ${!hasLinks
            ? `<div class="release-coming-soon" aria-hidden="true">
                 <span class="release-coming-soon-badge">Coming Soon</span>
               </div>`
            : youtubeId
              ? `<button class="release-play-btn"
                  data-video-id="${youtubeId}"
                  data-title="${r.title}"
                  data-meta="Final Corners · ${r.type || 'Single'} · ${year}"
                  data-spotify="${r.spotify_url || ''}"
                  aria-label="Tonton video ${r.title}">
                  <div class="release-play-icon">
                    <svg viewBox="0 0 24 24">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  </div>
                  <span class="release-play-label">Tonton Video</span>
                </button>`
              : ''}
        </div>

        <div class="release-body">
          <p class="release-meta">
            ${r.type || 'Single'} · ${year || '—'}${r.isrc ? ' · ISRC: ' + r.isrc : ''}
          </p>
          <h3 class="release-title">${r.title}</h3>
          ${r.description ? `<p class="release-desc">${r.description}</p>` : ''}

          <div class="release-links">
            ${hasLinks
              ? `${hasSpotify ? `<a href="${r.spotify_url}" target="_blank" rel="noopener" class="btn">Spotify</a>` : ''}
                 ${hasVideo   ? `<a href="${r.youtube_url}" target="_blank" rel="noopener" class="btn">YouTube</a>` : ''}`
              : `<span class="btn release-btn-soon">Segera Hadir</span>`}
          </div>
        </div>

      </article>`;
  }

  // ── Build news card ────────────────────────────
  function newsCard(article) {
    const date = formatDate(article.published_at);
    return `
      <a href="/news/article.html?slug=${article.slug}" class="news-card">
        ${article.featured_image
          ? `<div class="news-card-img">
               <img src="${article.featured_image}" alt="${article.title}" loading="lazy">
             </div>`
          : `<div class="news-card-img news-card-img--placeholder"></div>`}
        <div class="news-card-body">
          <span class="news-card-date">${date}</span>
          <h2 class="news-card-title">${article.title}</h2>
          ${article.meta_description ? `<p class="news-card-desc">${article.meta_description}</p>` : ''}
          <span class="news-card-cta">Baca Selengkapnya →</span>
        </div>
      </a>`;
  }

  function galleryItem(photo, sizeClass) {
    return `
      <div class="gallery-item ${sizeClass}" data-caption="${photo.caption || 'Final Corners'}">
        ${photo.image_url
          ? `<img src="${photo.image_url}" alt="${photo.caption || 'Final Corners'}" loading="lazy">`
          : `<div class="gallery-placeholder"><span>Coming Soon</span></div>`}
        <div class="gallery-item-overlay">
          <span class="gallery-item-tag">${photo.tag || ''}</span>
        </div>
      </div>`;
  }

  function getLatestReleasedSong(songs) {
    return songs
      .filter(s => s.status === 'released')
      .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))[0] || null;
  }

  return {
    skeleton,
    empty,
    error,
    formatDate,
    memberRow,
    releaseCard,
    newsCard,
    galleryItem,
    getLatestReleasedSong,
  };

})();

const _shimmerStyle = document.createElement('style');
_shimmerStyle.textContent = `
  @keyframes fc-shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.7} }

  .release-card--soon {
    opacity: 0.72;
    pointer-events: none;
  }

  .release-coming-soon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(14,12,11,0.55);
  }

  .release-btn-soon {
    cursor: default;
    opacity: 0.45;
    pointer-events: none;
  }
`;
document.head.appendChild(_shimmerStyle);
