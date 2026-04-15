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
  const youtubeId  = hasVideo
    ? (r.youtube_url.match(/[?&]v=([^&]+)/)?.[1]
       || r.youtube_url.match(/youtu\.be\/([^?]+)/)?.[1]
       || '') : '';
  const hasSpotify = !!(r.spotify_url && r.spotify_url.trim());
  const year       = r.release_date ? new Date(r.release_date).getFullYear() : '';

  // ── Type detection ──────────────────────────
  const typeRaw   = (r.type || 'single').toLowerCase();
  const isAlbum   = typeRaw === 'album';
  const isEP      = typeRaw === 'ep';
  const typeLabel = isAlbum ? 'Album' : isEP ? 'EP' : 'Single';

  // ── Track count / tracklist ─────────────────
  const trackCount = r.track_count || (r.tracks ? r.tracks.length : null);
  let tracklistHtml = '';
  if ((isEP || isAlbum) && r.tracks && r.tracks.length) {
    const items = r.tracks.slice(0, 6).map((t, i) => {
      const name = typeof t === 'string' ? t : (t.title || t.name || '');
      const dur  = typeof t === 'object' ? (t.duration || '') : '';
      return `<li class="rtl-item"><span class="rtl-num">${String(i+1).padStart(2,'0')}</span><span class="rtl-name">${name}</span>${dur ? `<span class="rtl-dur">${dur}</span>` : ''}</li>`;
    }).join('');
    const more = r.tracks.length > 6 ? `<li class="rtl-item rtl-more">+${r.tracks.length - 6} lagu lainnya</li>` : '';
    tracklistHtml = `
      <div class="release-tracklist">
        <button class="rtl-toggle" aria-expanded="false" onclick="(function(btn){const list=btn.nextElementSibling;const open=list.hidden;list.hidden=!open;btn.setAttribute('aria-expanded',open);btn.classList.toggle('rtl-open',open);})(this)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <span>Tracklist</span>
          <svg class="rtl-chevron" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <ol class="rtl-list" hidden>${items}${more}</ol>
      </div>`;
  }

  // ── Genre tags ──────────────────────────────
  let tagsHtml = '';
  const rawTags = r.genre_tags || r.genres || '';
  if (rawTags) {
    const tags = rawTags.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length) tagsHtml = `<div class="release-tags">${tags.map(t=>`<span class="release-tag">${t}</span>`).join('')}</div>`;
  }

  // ── Card class ──────────────────────────────
  const cardClass = ['release-card',
    `release-card--${typeRaw}`,
    r.status === 'upcoming' ? 'release-card--soon' : '',
    r.featured ? 'release-card--featured' : '',
  ].filter(Boolean).join(' ');

  return `
    <article class="${cardClass}"
      aria-label="${r.title} — ${typeLabel} Final Corners"
      id="track-${r.id}"
      data-type="${typeRaw}">

      <div class="release-cover-wrap">
        ${r.cover_url
          ? `<img src="${r.cover_url}" alt="Final Corners — ${r.title} cover art"
              class="release-cover" width="600" height="600"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
          : ''}

        <div class="release-cover-placeholder" style="display:${r.cover_url ? 'none' : 'flex'};" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Cover Image</span>
        </div>

        <div class="release-type-badge release-type--${typeRaw}">
          ${typeLabel}${trackCount ? `<span class="release-type-tracks">${trackCount} lagu</span>` : ''}
        </div>

        ${r.featured ? `<div class="release-featured-badge">Latest</div>` : ''}

        ${r.status === 'upcoming'
          ? `<div class="release-coming-soon"
                data-release="${r.release_date}"
                data-spotify="${r.spotify_url || ''}"
                data-presave="${r.presave_url || ''}">
                <span class="release-coming-soon-badge">Coming Soon</span>
                <div class="release-countdown">
                  <div class="cd-unit"><span class="cd-days">00</span><span class="cd-unit-label">DAYS</span></div>
                  <div class="cd-unit"><span class="cd-hours">00</span><span class="cd-unit-label">HRS</span></div>
                  <div class="cd-unit"><span class="cd-minutes">00</span><span class="cd-unit-label">MIN</span></div>
                  <div class="cd-unit"><span class="cd-seconds">00</span><span class="cd-unit-label">SEC</span></div>
                </div>
                ${r.presave_url ? `<a href="${r.presave_url}" target="_blank" class="release-presave-btn">Pre-Save Now</a>` : ''}
             </div>`
          : youtubeId
            ? `<button class="release-play-btn"
                data-video-id="${youtubeId}"
                data-title="${r.title}"
                data-meta="Final Corners · ${typeLabel} · ${year}"
                data-spotify="${r.spotify_url || ''}"
                aria-label="Tonton video ${r.title}">
                <div class="release-play-icon">
                  <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                </div>
                <span class="release-play-label">Tonton Video</span>
              </button>`
            : ''}
      </div>

      <div class="release-body">
        <div class="release-meta-row">
          <span class="release-meta">${typeLabel} · ${year || '—'}${r.isrc ? ' · ISRC: ' + r.isrc : ''}</span>
          ${r.duration ? `<span class="release-duration">${r.duration}</span>` : ''}
        </div>
        <h3 class="release-title">${r.title}</h3>
        ${tagsHtml}
        ${r.description ? `<p class="release-desc">${r.description}</p>` : ''}
        ${tracklistHtml}
        <div class="release-links">
          ${r.status !== 'upcoming'
            ? `${hasSpotify
                ? `<a href="${r.spotify_url}" target="_blank" rel="noopener" class="btn btn-spotify">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                    Spotify</a>` : ''}
               ${hasVideo
                ? `<a href="${r.youtube_url}" target="_blank" rel="noopener" class="btn btn-youtube">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.25 3.5-6.25 3.5z"/></svg>
                    YouTube</a>` : ''}`
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

  /* ── Type badges ── */
  .release-type-badge {
    position: absolute; top: 10px; left: 10px; z-index: 3;
    font-size: 0.46rem; letter-spacing: 0.26em; text-transform: uppercase;
    font-weight: 700; padding: 0.28rem 0.6rem;
    display: inline-flex; align-items: center; gap: 0.5rem;
    backdrop-filter: blur(8px); border: 1px solid transparent;
  }
  .release-type--single {
    background: rgba(201,75,75,0.22); color: #e07070;
    border-color: rgba(201,75,75,0.35);
  }
  .release-type--ep {
    background: rgba(210,140,40,0.22); color: #e0a850;
    border-color: rgba(210,140,40,0.35);
  }
  .release-type--album {
    background: rgba(80,140,200,0.20); color: #78b0e0;
    border-color: rgba(80,140,200,0.35);
  }
  .release-type-tracks {
    display: inline-block; padding: 0.1rem 0.35rem;
    background: rgba(255,255,255,0.10); border-radius: 2px;
    font-size: 0.42rem; letter-spacing: 0.18em; color: inherit; opacity: 0.85;
  }

  /* ── Featured badge ── */
  .release-featured-badge {
    position: absolute; top: 10px; right: 10px; z-index: 3;
    font-size: 0.42rem; letter-spacing: 0.28em; text-transform: uppercase;
    font-weight: 700; padding: 0.24rem 0.55rem;
    background: rgba(201,75,75,0.85); color: #fff;
    border: 1px solid rgba(201,75,75,0.6);
    backdrop-filter: blur(8px);
    animation: fc-featured-pulse 3s ease-in-out infinite;
  }
  @keyframes fc-featured-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,75,75,0)} 50%{box-shadow:0 0 12px 2px rgba(201,75,75,0.4)} }

  /* ── EP/Album card variant ── */
  .release-card--ep, .release-card--album {
    flex: 0 0 320px; width: 320px;
    border-color: rgba(210,140,40,0.25);
  }
  .release-card--album {
    flex: 0 0 340px; width: 340px;
    border-color: rgba(80,140,200,0.25);
  }
  .release-card--ep:hover { border-color: #e0a850; box-shadow: 0 4px 24px rgba(210,140,40,0.12); }
  .release-card--album:hover { border-color: #78b0e0; box-shadow: 0 4px 24px rgba(80,140,200,0.12); }
  .release-card--ep::after { background: linear-gradient(90deg, #e0a850, rgba(224,168,80,0.4), transparent); }
  .release-card--album::after { background: linear-gradient(90deg, #78b0e0, rgba(120,176,224,0.4), transparent); }

  /* ── Coming soon / countdown ── */
  .release-card--soon { opacity: 0.9; }
  .release-coming-soon {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
    background: rgba(14,12,11,0.72); text-align: center;
    backdrop-filter: blur(3px);
  }
  .release-countdown {
    display: flex; gap: 10px; align-items: center; justify-content: center;
  }
  .cd-unit {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    min-width: 34px; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.10); padding: 6px 4px;
  }
  .cd-unit span:first-child {
    font-family: 'Lilita One', Impact, sans-serif;
    font-size: 18px; color: #fff; line-height: 1;
  }
  .cd-unit-label {
    font-size: 0.38rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(255,255,255,0.35); font-weight: 500;
  }
  .release-presave-btn {
    padding: 7px 18px; border: 1px solid rgba(255,255,255,0.5);
    font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase;
    text-decoration: none; color: white; font-weight: 600;
    transition: 0.2s; background: rgba(255,255,255,0.08);
  }
  .release-presave-btn:hover { background: white; color: black; }
  .release-btn-soon { cursor: default; opacity: 0.45; pointer-events: none; }

  /* ── Meta row ── */
  .release-meta-row {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 0.4rem; gap: 0.5rem;
  }
  .release-duration {
    font-size: 0.56rem; letter-spacing: 0.12em; color: var(--text-faint);
    font-weight: 500; flex-shrink: 0;
  }

  /* ── Genre tags ── */
  .release-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.75rem; }
  .release-tag {
    font-size: 0.44rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--text-faint); border: 1px solid var(--border);
    padding: 0.18rem 0.45rem; font-weight: 500;
    transition: color 0.2s, border-color 0.2s;
  }
  .release-card:hover .release-tag { color: var(--text-muted); border-color: var(--border-light); }

  /* ── Tracklist ── */
  .release-tracklist { margin-bottom: 1rem; border-top: 1px solid var(--border); padding-top: 0.8rem; }
  .rtl-toggle {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.52rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--text-muted); background: none; border: none; cursor: pointer;
    padding: 0; font-family: inherit; font-weight: 500;
    transition: color 0.2s; width: 100%;
  }
  .rtl-toggle:hover { color: var(--accent); }
  .rtl-chevron { margin-left: auto; transition: transform 0.25s; }
  .rtl-toggle.rtl-open .rtl-chevron { transform: rotate(180deg); }
  .rtl-list {
    margin-top: 0.65rem; padding: 0; list-style: none;
    border: 1px solid var(--border); background: rgba(10,8,7,0.5);
  }
  .rtl-item {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.45rem 0.7rem; border-bottom: 1px solid rgba(45,39,35,0.6);
    transition: background 0.15s;
  }
  .rtl-item:last-child { border-bottom: none; }
  .rtl-item:hover { background: rgba(201,75,75,0.05); }
  .rtl-num { font-size: 0.46rem; color: var(--text-faint); min-width: 18px; font-weight: 500; letter-spacing: 0.08em; }
  .rtl-name { font-size: 0.72rem; color: var(--text); flex: 1; line-height: 1.3; }
  .rtl-dur { font-size: 0.52rem; color: var(--text-faint); font-weight: 500; }
  .rtl-more { font-size: 0.52rem; color: var(--text-faint); font-style: italic; justify-content: center; }

  /* ── Spotify / YouTube btn variants ── */
  .btn-spotify:hover { border-color: #1DB954; color: #1DB954; box-shadow: 0 0 10px rgba(29,185,84,0.15); }
  .btn-spotify:hover::before { background: rgba(29,185,84,0.08); }
  .btn-youtube:hover { border-color: #FF0000; color: #FF0000; box-shadow: 0 0 10px rgba(255,0,0,0.12); }
  .btn-youtube:hover::before { background: rgba(255,0,0,0.06); }

  /* ── Filter tabs ── */
  .release-filter-tabs {
    display: flex; gap: 0; border: 1px solid var(--border);
    background: var(--surface); overflow: hidden; flex-shrink: 0;
  }
  .release-filter-tab {
    font-size: 0.54rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--text-faint); background: none; border: none;
    padding: 0.5rem 0.9rem; cursor: pointer; font-family: inherit;
    font-weight: 500; transition: color 0.2s, background 0.2s;
    border-right: 1px solid var(--border); position: relative;
  }
  .release-filter-tab:last-child { border-right: none; }
  .release-filter-tab:hover { color: var(--text-muted); background: var(--surface2); }
  .release-filter-tab.active {
    color: var(--accent); background: var(--accent-deep);
  }
  .release-filter-tab.active::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: var(--accent);
  }

  /* ── Discography stats bar ── */
  .disco-stats {
    display: flex; gap: 0; border: 1px solid var(--border);
    margin-bottom: 2.5rem; overflow: hidden;
  }
  .disco-stat {
    flex: 1; padding: 1rem 1.25rem; border-right: 1px solid var(--border);
    text-align: center; background: var(--surface); position: relative;
  }
  .disco-stat:last-child { border-right: none; }
  .disco-stat::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;opacity:0;transition:opacity 0.3s;background:var(--accent); }
  .disco-stat:hover::before { opacity:1; }
  .disco-stat:hover { background: var(--surface2); }
  .disco-stat-value {
    font-family: 'Lilita One', Impact, sans-serif;
    font-size: 1.6rem; color: var(--white); line-height: 1; margin-bottom: 0.25rem;
  }
  .disco-stat-label {
    font-size: 0.5rem; letter-spacing: 0.28em; text-transform: uppercase;
    color: var(--text-faint); font-weight: 500;
  }
`;
document.head.appendChild(_shimmerStyle);


