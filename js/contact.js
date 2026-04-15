/**
 * ══════════════════════════════════════════════
 *  Final Corners — Contact Module
 *  Handles form submission to Supabase messages table.
 *  Includes honeypot spam protection.
 * ══════════════════════════════════════════════
 */

(function ContactModule() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  const errEl   = document.getElementById('contact-error');
  const submitBtn = document.getElementById('contact-submit');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearMessages();

    // ── Honeypot check (hidden field must be empty) ──
    const honey = form.querySelector('[name="website"]');
    if (honey && honey.value.trim() !== '') {
      // silently succeed to fool bots
      showSuccess();
      return;
    }

    const name    = form.querySelector('[name="name"]').value.trim();
    const email   = form.querySelector('[name="email"]').value.trim();
    const subject = form.querySelector('[name="subject"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    // ── Client-side validation ──
    if (!name)    { showError('Nama tidak boleh kosong.'); return; }
    if (!email || !email.includes('@')) { showError('Email tidak valid.'); return; }
    if (!subject) { showError('Subjek tidak boleh kosong.'); return; }
    if (!message || message.length < 10) { showError('Pesan terlalu pendek (min. 10 karakter).'); return; }

    setLoading(true);

    try {
      await Services.submitMessage({ name, email, subject, message });
      form.reset();
      showSuccess();
    } catch (err) {
      console.error('Contact error:', err);
      showError('Pesan gagal terkirim. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  });

  function setLoading(on) {
    if (!submitBtn) return;
    submitBtn.disabled    = on;
    submitBtn.textContent = on ? 'Mengirim…' : 'Kirim Pesan';
  }

  function clearMessages() {
    if (success) success.style.display = 'none';
    if (errEl)   errEl.style.display   = 'none';
  }

  function showSuccess() {
    if (success) { success.style.display = 'block'; success.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
  }

  function showError(msg) {
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
  }
})();
