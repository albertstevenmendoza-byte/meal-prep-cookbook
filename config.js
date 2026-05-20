/**
 * COMEMOS — config.js
 *
 * HOW TO FILL THIS IN:
 * 1. Go to your Supabase project dashboard
 * 2. Settings → API
 * 3. Copy "Project URL" → SUPABASE_URL
 * 4. Copy "anon / public" key → SUPABASE_ANON_KEY
 *
 * NEVER commit your service_role key here.
 * The anon key is safe to ship in front-end code.
 */

const COMEMOS_CONFIG = {

  // ── Supabase ─────────────────────────────────────────────────────
  SUPABASE_URL:      'https://zjonybedanmdussrrtmw.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqb255YmVkYW5tZHVzc3JydG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyOTk0OTQsImV4cCI6MjA5NDg3NTQ5NH0.vqyP0G68jDiL9MBHNaEwagffoD1bd8txcC0NbCKPnm8',

  // ── Feature flags (toggle for beta testing) ───────────────────────
  FEATURES: {
    social_commerce:  true,   // shop / marketplace
    live_streams:     false,  // gated behind creator tier for beta
    native_ads:       true,
    gifting:          true,
    messaging:        true,
    creator_studio:   true,
  },

  // ── Beta settings ─────────────────────────────────────────────────
  BETA: {
    // Show a subtle "Beta" badge in the header during testing
    show_badge:       true,
    // Feedback button links to a Tally / Typeform / Google Form
    feedback_url:     'https://tally.so/r/YOUR_FORM_ID',
    // Max users before you want to pause signups
    user_cap:         200,
  },

};

// Freeze to prevent accidental mutation
Object.freeze(COMEMOS_CONFIG);
Object.freeze(COMEMOS_CONFIG.FEATURES);
Object.freeze(COMEMOS_CONFIG.BETA);
