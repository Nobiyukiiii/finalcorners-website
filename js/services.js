/**
 * ══════════════════════════════════════════════
 *  Final Corners — Data Services
 *  All Supabase queries live here.
 *  Import this after config.js.
 * ══════════════════════════════════════════════
 */

const Services = (() => {
  const db = () => getSupabase();

  // ── Settings ────────────────────────────────
  async function getSettings() {
    const { data, error } = await db()
      .from('settings')
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  // ── Songs ────────────────────────────────────
  async function getSongs() {
    const { data, error } = await db()
      .from('songs')
      .select('*')
      .order('release_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getSongBySlug(slug) {
    const { data, error } = await db()
      .from('songs')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  }

  // ── Members ──────────────────────────────────
  async function getMembers() {
    const { data, error } = await db()
      .from('members')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  // ── News ─────────────────────────────────────
async function getNews({ limit = 20, offset = 0 } = {}) {
  const { data, error } = await db()
    .from('news')
    .select('id, title, slug, meta_description, featured_image, published_at, status')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

  async function getArticleBySlug(slug) {
    const { data, error } = await db()
      .from('news')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  }

  // ── Gallery ──────────────────────────────────
  async function getGallery() {
    const { data, error } = await db()
      .from('gallery')
      .select('*')
      .order('uploaded_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // ── Contact ──────────────────────────────────
  async function submitMessage({ name, email, subject, message }) {
    const { error } = await db()
      .from('messages')
      .insert([{ name, email, subject, message }]);
    if (error) throw error;
    return true;
  }

  return {
    getSettings,
    getSongs,
    getSongBySlug,
    getMembers,
    getNews,
    getArticleBySlug,
    getGallery,
    submitMessage,
  };
})();
