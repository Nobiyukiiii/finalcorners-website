/**
 * ══════════════════════════════════════════════
 *  Final Corners — Songs Module
 *  Loads songs from Supabase and drives the slider.
 *  Replace the static releases.json fetch in index.html.
 * ══════════════════════════════════════════════
 */

(async function SongsModule() {
  const track    = document.getElementById('releases-track');
  const btnPrev  = document.getElementById('btn-prev');
  const btnNext  = document.getElementById('btn-next');
  const counter  = document.getElementById('slider-counter');
  const dotsWrap = document.getElementById('slider-dots');
  if (!track) return; // not on a page with the slider

  const GAP = 24;
  let current = 0;
  let cards   = [];

  // ── Show loading skeletons ──
  track.innerHTML = Render.skeleton(3, '360px');
  counter.textContent = '— / —';

  try {
    const songs = await Services.getSongs();
    track.innerHTML = '';

    if (!songs.length) {
      track.innerHTML = Render.empty('Belum ada single yang dirilis.');
      return;
    }

    songs.forEach(song => {
      track.insertAdjacentHTML('beforeend', Render.releaseCard(song));
    });

    // ── Init slider ──
    cards = Array.from(track.querySelectorAll('.release-card'));
    const total = cards.length;

    dotsWrap.innerHTML = '';
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Ke single ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    counter.textContent = '1 / ' + total;

    function getCardWidth() {
      return cards[0] ? cards[0].getBoundingClientRect().width + GAP : 0;
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, total - 1));
      track.style.transform = `translateX(-${current * getCardWidth()}px)`;
      counter.textContent   = (current + 1) + ' / ' + total;
      btnPrev.disabled = current === 0;
      btnNext.disabled = current === total - 1;
      dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    btnPrev.addEventListener('click', () => goTo(current - 1));
    btnNext.addEventListener('click', () => goTo(current + 1));

    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
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

    goTo(0);

    // ─────────────────────────────
// Countdown + Auto Switch
// ─────────────────────────────
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
          el.innerHTML = `
            <a href="${spotifyUrl}" target="_blank"
               class="release-presave-btn">
              Listen on Spotify
            </a>
          `;
        } else {
          el.innerHTML = `
            <span class="release-coming-soon-badge">
              Now Available
            </span>
          `;
        }

        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      el.querySelector('.cd-days').textContent = days;
      el.querySelector('.cd-hours').textContent = hours;
      el.querySelector('.cd-minutes').textContent = minutes;
      el.querySelector('.cd-seconds').textContent = seconds;

    }, 1000);

  });
}

initCountdowns();

    // ── Attach video modal listeners ──
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

    // ── Update hero CTA with latest song ──
const latest = Render.getLatestReleasedSong(songs);

if (latest) {

  const pill  = document.getElementById('hero-cta-pill');
  const img   = document.getElementById('hero-cta-img');
  const type  = document.getElementById('hero-cta-type');
  const ttl   = document.getElementById('hero-cta-title');
  const bSpot = document.getElementById('hero-btn-spotify');
  const bYt   = document.getElementById('hero-btn-youtube');

  const yr = latest.release_date
    ? new Date(latest.release_date).getFullYear()
    : '';

  if (pill && latest.spotify_url) {
    pill.href = latest.spotify_url;
    pill.setAttribute('aria-label', 'Dengarkan ' + latest.title + ' di Spotify');
  }

  if (img && latest.cover_url) {
    img.src = latest.cover_url;
    img.alt = latest.title + ' cover';
  }

  if (type) type.textContent = 'Single · ' + yr;
  if (ttl)  ttl.textContent  = latest.title;

  if (bSpot) {
    bSpot.href = latest.spotify_url || '#';
    bSpot.style.display = latest.spotify_url ? '' : 'none';
  }

  if (bYt) {
    bYt.href = latest.youtube_url || '#';
    bYt.style.display = latest.youtube_url ? '' : 'none';
  }

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
