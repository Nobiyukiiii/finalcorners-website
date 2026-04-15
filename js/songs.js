(async function SongsModule() {
  const track    = document.getElementById('releases-track');
  const btnPrev  = document.getElementById('btn-prev');
  const btnNext  = document.getElementById('btn-next');
  const counter  = document.getElementById('slider-counter');
  const dotsWrap = document.getElementById('slider-dots');
  if (!track) return;

  const GAP = 24;
  let current   = 0;
  let cards     = [];
  let allSongs  = [];
  let activeFilter = 'all';

  // ── Show loading skeletons ──
  track.innerHTML = Render.skeleton(3, '360px');
  counter.textContent = '— / —';

  try {
    allSongs = await Services.getSongs();
    track.innerHTML = '';

    if (!allSongs.length) {
      track.innerHTML = Render.empty('Belum ada single yang dirilis.');
      return;
    }

    // ── Mark latest released song as featured ──
    const latest = Render.getLatestReleasedSong(allSongs);
    if (latest) latest.featured = true;

    // ── Inject discography stats bar ──
    const sliderWrapper = track.closest('.slider-wrapper') || track.parentElement?.parentElement;
    const statsEl = document.createElement('div');
    statsEl.className = 'disco-stats';

    const singles = allSongs.filter(s => (s.type||'single').toLowerCase() === 'single').length;
    const eps     = allSongs.filter(s => (s.type||'').toLowerCase() === 'ep').length;
    const albums  = allSongs.filter(s => (s.type||'').toLowerCase() === 'album').length;
    const total   = allSongs.filter(s => s.status === 'released').length;

    statsEl.innerHTML = `
      <div class="disco-stat"><div class="disco-stat-value">${total}</div><div class="disco-stat-label">Releases</div></div>
      <div class="disco-stat"><div class="disco-stat-value">${singles}</div><div class="disco-stat-label">Singles</div></div>
      ${eps     ? `<div class="disco-stat"><div class="disco-stat-value">${eps}</div><div class="disco-stat-label">EPs</div></div>` : ''}
      ${albums  ? `<div class="disco-stat"><div class="disco-stat-value">${albums}</div><div class="disco-stat-label">Albums</div></div>` : ''}
    `;

    const sliderHeader = document.querySelector('.slider-header');
    if (sliderHeader) {
      sliderHeader.parentElement.insertBefore(statsEl, sliderHeader.nextSibling.nextSibling || sliderHeader.nextSibling);
    }

    // ── Inject filter tabs ──
    const filterTabs = document.createElement('div');
    filterTabs.className = 'release-filter-tabs';
    const types = ['All'];
    if (singles) types.push('Single');
    if (eps)     types.push('EP');
    if (albums)  types.push('Album');

    types.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'release-filter-tab' + (t === 'All' ? ' active' : '');
      btn.textContent = t;
      btn.dataset.filter = t.toLowerCase();
      btn.addEventListener('click', () => {
        document.querySelectorAll('.release-filter-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(t.toLowerCase());
      });
      filterTabs.appendChild(btn);
    });

    if (sliderHeader) {
      const nav = sliderHeader.querySelector('.slider-nav');
      if (nav) sliderHeader.insertBefore(filterTabs, nav);
    }

    // ── Render all songs ──
    allSongs.forEach(song => {
      track.insertAdjacentHTML('beforeend', Render.releaseCard(song));
    });

    // ── Filter function ──
    function applyFilter(type) {
      activeFilter = type;
      const allCards = Array.from(track.querySelectorAll('.release-card'));
      allCards.forEach(c => {
        const cardType = c.dataset.type || 'single';
        const show = type === 'all' || cardType === type;
        c.style.display = show ? '' : 'none';
        c.style.opacity = show ? '' : '0';
      });
      rebuildSlider();
    }

    // ── Init / rebuild slider ──
    function rebuildSlider() {
      cards = Array.from(track.querySelectorAll('.release-card')).filter(c => c.style.display !== 'none');
      const total = cards.length;
      current = 0;
      track.style.transform = 'translateX(0)';

      dotsWrap.innerHTML = '';
      cards.forEach((card, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Ke release ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });

      counter.textContent = total ? '1 / ' + total : '— / —';
      if (btnPrev) btnPrev.disabled = true;
      if (btnNext) btnNext.disabled = total <= 1;
    }

    function getCardWidth() {
      const visible = cards.find(c => c.style.display !== 'none');
      if (!visible) return 0;
      // Calculate offset accounting for hidden cards before it
      return visible.getBoundingClientRect().width + GAP;
    }

    function goTo(index) {
      if (!cards.length) return;
      current = Math.max(0, Math.min(index, cards.length - 1));
      // Offset: sum widths of all cards before current (including hidden ones)
      const allTrackCards = Array.from(track.querySelectorAll('.release-card'));
      const targetCard = cards[current];
      let offset = 0;
      for (const c of allTrackCards) {
        if (c === targetCard) break;
        if (c.style.display !== 'none') offset += c.getBoundingClientRect().width + GAP;
      }
      track.style.transform = `translateX(-${offset}px)`;
      counter.textContent = (current + 1) + ' / ' + cards.length;
      if (btnPrev) btnPrev.disabled = current === 0;
      if (btnNext) btnNext.disabled = current === cards.length - 1;
      dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    if (btnPrev) btnPrev.addEventListener('click', () => goTo(current - 1));
    if (btnNext) btnNext.addEventListener('click', () => goTo(current + 1));

    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });

    document.addEventListener('keydown', e => {
      const rect = document.getElementById('music')?.getBoundingClientRect();
      if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowLeft')  goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
      }
    });

    rebuildSlider();

    // ── Countdown ──
    function initCountdowns() {
      document.querySelectorAll('.release-coming-soon').forEach(el => {
        const releaseDate = new Date(el.dataset.release).getTime();
        const spotifyUrl  = el.dataset.spotify;
        if (!releaseDate) return;
        const timer = setInterval(() => {
          const now = new Date().getTime();
          const distance = releaseDate - now;
          if (distance <= 0) {
            clearInterval(timer);
            if (spotifyUrl) {
              el.innerHTML = `<a href="${spotifyUrl}" target="_blank" class="release-presave-btn">Listen on Spotify</a>`;
            } else {
              el.innerHTML = `<span class="release-coming-soon-badge">Now Available</span>`;
            }
            return;
          }
          const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          const dEl = el.querySelector('.cd-days');
          const hEl = el.querySelector('.cd-hours');
          const mEl = el.querySelector('.cd-minutes');
          const sEl = el.querySelector('.cd-seconds');
          if (dEl) dEl.textContent = String(days).padStart(2,'0');
          if (hEl) hEl.textContent = String(hours).padStart(2,'0');
          if (mEl) mEl.textContent = String(minutes).padStart(2,'0');
          if (sEl) sEl.textContent = String(seconds).padStart(2,'0');
        }, 1000);
      });
    }
    initCountdowns();

    // ── Video modal ──
    document.querySelectorAll('.release-play-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const modal = document.getElementById('video-modal');
        if (!modal) return;
        document.getElementById('video-modal-title').textContent = btn.dataset.title;
        document.getElementById('video-modal-meta').textContent  = btn.dataset.meta;
        document.getElementById('video-iframe').src =
          `https://www.youtube.com/embed/${btn.dataset.videoId}?autoplay=1&rel=0&modestbranding=1`;
        document.getElementById('video-yt-link').href =
          `https://www.youtube.com/watch?v=${btn.dataset.videoId}`;
        const spotLink = document.getElementById('video-spotify-link');
        if (spotLink) spotLink.href = btn.dataset.spotify || '#';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    // ── Hero CTA ──
    if (latest) {
      const pill  = document.getElementById('hero-cta-pill');
      const img   = document.getElementById('hero-cta-img');
      const type  = document.getElementById('hero-cta-type');
      const ttl   = document.getElementById('hero-cta-title');
      const bSpot = document.getElementById('hero-btn-spotify');
      const bYt   = document.getElementById('hero-btn-youtube');
      const yr    = latest.release_date ? new Date(latest.release_date).getFullYear() : '';
      const typeLabel = (latest.type || 'single').charAt(0).toUpperCase() + (latest.type || 'single').slice(1);

      if (pill && latest.spotify_url) {
        pill.href = latest.spotify_url;
        pill.setAttribute('aria-label', 'Dengarkan ' + latest.title + ' di Spotify');
      }
      if (img && latest.cover_url) { img.src = latest.cover_url; img.alt = latest.title + ' cover'; }
      if (type) type.textContent = typeLabel + ' · ' + yr;
      if (ttl)  ttl.textContent  = latest.title;
      if (bSpot) { bSpot.href = latest.spotify_url || '#'; bSpot.style.display = latest.spotify_url ? '' : 'none'; }
      if (bYt)   { bYt.href  = latest.youtube_url  || '#'; bYt.style.display  = latest.youtube_url  ? '' : 'none'; }
    } else {
      const cta = document.getElementById('hero-cta');
      if (cta) cta.style.display = 'none';
    }

  } catch (err) {
    console.error('Songs error:', err);
    track.innerHTML = Render.error('Tidak dapat memuat data lagu.');
    counter.textContent = '— / —';
  }
})();
