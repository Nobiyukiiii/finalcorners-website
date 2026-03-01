/**
 * ══════════════════════════════════════════════
 *  Final Corners — Supabase Configuration
 *  ONLY public anon key lives here.
 *  NEVER put service_role key here.
 * ══════════════════════════════════════════════
 */

const SUPABASE_URL  = 'https://xeeryfynexnfyzrkgohn.supabase.co'; // e.g. https://xxxxxxxxxxx.supabase.co
const SUPABASE_ANON = 'sb_publishable_SqiBNMHPQKg8eRGdbhWBmg_taL-gWEr';    // starts with "eyJ..."

// Supabase JS v2 loaded from CDN in each HTML page
// window.supabase is available after the CDN script tag
function getSupabase() {
  if (!window._supabaseClient) {
    window._supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  return window._supabaseClient;
}
