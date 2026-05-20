/**
 * COMEMOS — supabase-db.js
 *
 * Drop this file into your project alongside script.js.
 * It replaces the localStorage `db` object with real Supabase calls,
 * and adds the auth flow (sign up / sign in / sign out).
 *
 * Load order in index.html:
 *   <script src="config.js"></script>
 *   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *   <script src="supabase-db.js"></script>   ← before script.js
 *   <script src="script.js"></script>
 *
 * Because this file defines `db` and `supabase` as globals BEFORE
 * script.js loads, script.js's db object is simply overwritten.
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════════
   §A  SUPABASE CLIENT
   ═══════════════════════════════════════════════════════════════════ */

const supabase = window.supabase.createClient(
  COMEMOS_CONFIG.SUPABASE_URL,
  COMEMOS_CONFIG.SUPABASE_ANON_KEY
);

/* ═══════════════════════════════════════════════════════════════════
   §B  HELPER — safe current user
   ═══════════════════════════════════════════════════════════════════ */

async function currentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/* ═══════════════════════════════════════════════════════════════════
   §C  DB LAYER  (overwrites the localStorage shim in script.js)
   Each function mirrors the original signature so no call-sites change.
   ═══════════════════════════════════════════════════════════════════ */

const db = {

  // ── Profiles ──────────────────────────────────────────────────────
  async saveProfile(p) {
    const user = await currentUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const payload = {
      id:             user.id,
      name:           p.name,
      age:            p.age,
      weight_kg:      p.weight_kg,
      height_cm:      p.height_cm,
      sex:            p.sex,
      activity:       p.activity,
      goal:           p.goal,
      meals_per_day:  p.meals_per_day,
      prep_days:      p.prep_days,
      diet_tags:      p.diet_tags       || [],
      preferred_foods: p.preferred_foods || [],
      custom_foods:   p.custom_foods    || [],
      updated_at:     new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .single();

    return { data, error };
  },

  async loadProfile() {
    const user = await currentUser();
    if (!user) return { data: null };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { data, error };
  },

  // ── Meal Plans ────────────────────────────────────────────────────
  async savePlan(plan) {
    const user = await currentUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    // Delete previous plan and insert fresh (simpler than upsert on jsonb)
    await supabase.from('meal_plans').delete().eq('user_id', user.id);

    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        user_id:         user.id,
        days:            plan.days,
        grocery_list:    plan.grocery_list || [],
        calories_per_day: STATE?.targets?.calories   || null,
        protein_g:       STATE?.targets?.protein_g   || null,
        carbs_g:         STATE?.targets?.carbs_g     || null,
        fat_g:           STATE?.targets?.fat_g        || null,
      })
      .select()
      .single();

    return { data, error };
  },

  async loadPlan() {
    const user = await currentUser();
    if (!user) return { data: null };

    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();   // returns null (not error) if no rows

    return { data, error };
  },

  // ── Grocery Checks ────────────────────────────────────────────────
  async saveChecked(checkedMap) {
    const user = await currentUser();
    if (!user) return { data: null };

    const rows = Object.entries(checkedMap).map(([food_id, checked]) => ({
      user_id: user.id,
      food_id,
      checked,
    }));

    if (!rows.length) return { data: [] };

    const { data, error } = await supabase
      .from('grocery_checks')
      .upsert(rows, { onConflict: 'user_id,food_id' });

    return { data, error };
  },

  async loadChecked() {
    const user = await currentUser();
    if (!user) return {};

    const { data } = await supabase
      .from('grocery_checks')
      .select('food_id, checked')
      .eq('user_id', user.id);

    if (!data) return {};
    return Object.fromEntries(data.map(r => [r.food_id, r.checked]));
  },

  // ── Posts ─────────────────────────────────────────────────────────
  async loadPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles ( id, name, avatar_url )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) { console.error('loadPosts:', error); return null; }
    return data;
  },

  async savePosts(posts) {
    // Posts are saved individually via createPost(); this shim is a no-op.
    return { data: posts };
  },

  async createPost(post) {
    const user = await currentUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id:              user.id,
        type:                 post.type,
        content:              post.content,
        image_url:            post.image_url   || null,
        image_gradient:       post.image_gradient,
        tags:                 post.tags         || [],
        recipe_title:         post.recipe_title || null,
        recipe_ingredients:   post.recipe_ingredients || [],
        recipe_steps:         post.recipe_steps        || [],
        business_name:        post.business_name || null,
        business_desc:        post.business_desc || null,
        promo_code:           post.promo_code    || null,
      })
      .select()
      .single();

    return { data, error };
  },

  async toggleLike(postId, isLiked) {
    const user = await currentUser();
    if (!user) return;

    if (isLiked) {
      await supabase.from('post_likes')
        .insert({ user_id: user.id, post_id: postId })
        .maybeSingle();                                   // ignore duplicate
    } else {
      await supabase.from('post_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);
    }
    // likes_count is updated by the database trigger — no manual patch needed
  },

  async toggleSave(postId, isSaved) {
    const user = await currentUser();
    if (!user) return;

    if (isSaved) {
      await supabase.from('post_saves')
        .insert({ user_id: user.id, post_id: postId })
        .maybeSingle();
    } else {
      await supabase.from('post_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);
    }
  },

  // Which posts has the current user liked/saved? (call once on boot)
  async loadUserReactions() {
    const user = await currentUser();
    if (!user) return { likes: [], saves: [] };

    const [likesRes, savesRes] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', user.id),
      supabase.from('post_saves').select('post_id').eq('user_id', user.id),
    ]);

    return {
      likes: (likesRes.data || []).map(r => r.post_id),
      saves: (savesRes.data || []).map(r => r.post_id),
    };
  },

  async addComment(postId, content) {
    const user = await currentUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, content })
      .select()
      .single();

    return { data, error };
  },

  async loadComments(postId) {
    const { data } = await supabase
      .from('post_comments')
      .select(`*, profiles(name, avatar_url)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    return data || [];
  },

  // ── Wallet ────────────────────────────────────────────────────────
  async loadWallet() {
    const user = await currentUser();
    if (!user) return null;

    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return data;
  },

  async updateWallet(coins) {
    const user = await currentUser();
    if (!user) return;

    await supabase.from('wallets')
      .update({ coins, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
  },

  // ── Algo Prefs ────────────────────────────────────────────────────
  async saveAlgoPrefs(prefs) {
    const user = await currentUser();
    if (!user) return;

    await supabase.from('algo_prefs')
      .upsert({
        user_id:           user.id,
        muted_keywords:    prefs.mutedKeywords,
        preferred_types:   prefs.preferredTypes,
        show_ads:          prefs.showAds,
        transparency_mode: prefs.transparencyMode,
        updated_at:        new Date().toISOString(),
      });
  },

  async loadAlgoPrefs() {
    const user = await currentUser();
    if (!user) return null;

    const { data } = await supabase
      .from('algo_prefs')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return data;
  },

  // ── Subscriptions ─────────────────────────────────────────────────
  async loadSubscription() {
    const user = await currentUser();
    if (!user) return null;

    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return data;
  },

  async saveSubscription(tier) {
    const user = await currentUser();
    if (!user) return;

    await supabase.from('subscriptions')
      .upsert({ user_id: user.id, tier, started_at: new Date().toISOString() });
  },

};

/* ═══════════════════════════════════════════════════════════════════
   §D  AUTH FUNCTIONS
   Call these from the auth screen buttons.
   ═══════════════════════════════════════════════════════════════════ */

const auth = {

  async signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },  // passed to handle_new_user trigger
        emailRedirectTo: window.location.origin,
      },
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  },

  async signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Listen for auth state changes (sign in / sign out / token refresh)
  onAuthChange(callback) {
    supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },

};

/* ═══════════════════════════════════════════════════════════════════
   §E  AUTH SCREEN UI CONTROLLER
   Manages showing/hiding the auth modal and handling form submission.
   ═══════════════════════════════════════════════════════════════════ */

const AuthUI = {

  show(mode = 'signin') {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    this.switchMode(mode);
    modal.style.display = 'flex';
  },

  hide() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
  },

  switchMode(mode) {
    const signInForm  = document.getElementById('authSignIn');
    const signUpForm  = document.getElementById('authSignUp');
    const switchToUp  = document.getElementById('switchToSignUp');
    const switchToIn  = document.getElementById('switchToSignIn');
    const modalTitle  = document.getElementById('authModalTitle');

    if (!signInForm) return;

    if (mode === 'signin') {
      signInForm.style.display  = 'flex';
      signUpForm.style.display  = 'none';
      switchToUp.style.display  = 'block';
      switchToIn.style.display  = 'none';
      modalTitle.textContent    = 'Welcome back';
    } else {
      signInForm.style.display  = 'none';
      signUpForm.style.display  = 'flex';
      switchToUp.style.display  = 'none';
      switchToIn.style.display  = 'block';
      modalTitle.textContent    = 'Create your account';
    }
    this.clearErrors();
  },

  setError(msg) {
    const el = document.getElementById('authError');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  },

  clearErrors() {
    const el = document.getElementById('authError');
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  },

  setLoading(btn, isLoading) {
    btn.disabled     = isLoading;
    btn.textContent  = isLoading ? 'Please wait…' : btn.dataset.label;
  },

  async handleSignIn(e) {
    e.preventDefault();
    AuthUI.clearErrors();
    const email    = document.getElementById('siEmail').value.trim();
    const password = document.getElementById('siPassword').value;
    const btn      = document.getElementById('siSubmit');

    if (!email || !password) {
      AuthUI.setError('Please fill in all fields.');
      return;
    }

    AuthUI.setLoading(btn, true);
    const { error } = await auth.signIn(email, password);
    AuthUI.setLoading(btn, false);

    if (error) {
      AuthUI.setError(error.message || 'Sign in failed. Check your credentials.');
    }
    // On success, onAuthChange fires and calls AuthUI.hide() + app boot
  },

  async handleSignUp(e) {
    e.preventDefault();
    AuthUI.clearErrors();
    const name     = document.getElementById('suName').value.trim();
    const email    = document.getElementById('suEmail').value.trim();
    const password = document.getElementById('suPassword').value;
    const btn      = document.getElementById('suSubmit');

    if (!name || !email || !password) {
      AuthUI.setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      AuthUI.setError('Password must be at least 8 characters.');
      return;
    }

    AuthUI.setLoading(btn, true);
    const { error } = await auth.signUp(email, password, name);
    AuthUI.setLoading(btn, false);

    if (error) {
      AuthUI.setError(error.message || 'Sign up failed. Try again.');
    } else {
      AuthUI.setError('');
      // Show confirmation message if email confirmation is enabled
      const confirmMsg = document.getElementById('authConfirmMsg');
      if (confirmMsg) confirmMsg.style.display = 'block';
    }
  },

  init() {
    // Wire form submissions
    document.getElementById('authSignIn')
      ?.addEventListener('submit', this.handleSignIn);
    document.getElementById('authSignUp')
      ?.addEventListener('submit', this.handleSignUp);

    // Mode toggle links
    document.getElementById('switchToSignUp')
      ?.addEventListener('click', () => this.switchMode('signup'));
    document.getElementById('switchToSignIn')
      ?.addEventListener('click', () => this.switchMode('signin'));

    // Google OAuth button
    document.getElementById('googleSignInBtn')
      ?.addEventListener('click', () => auth.signInWithGoogle());

    // Sign out button (in sidebar)
    document.getElementById('signOutBtn')
      ?.addEventListener('click', () => auth.signOut());

    // Auth state listener — show/hide the modal based on session
    auth.onAuthChange(async (session) => {
      if (session) {
        // User is signed in — hide auth screen, boot the app
        this.hide();
        if (typeof comemos_boot === 'function') {
          await comemos_boot(session.user);
        }
      } else {
        // No session — show auth screen
        this.show('signin');
      }
    });
  },
};

/* ═══════════════════════════════════════════════════════════════════
   §F  REALTIME SUBSCRIPTIONS
   Live feed updates and DM delivery.
   Call enableRealtime() once the user is signed in.
   ═══════════════════════════════════════════════════════════════════ */

function enableRealtime() {
  // New posts appear in the feed live
  supabase
    .channel('public:posts')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'posts' },
      (payload) => {
        const newPost = payload.new;
        // Only add if it's not our own post (we already prepended it locally)
        currentUser().then(user => {
          if (newPost.user_id !== user?.id) {
            STATE.posts.unshift({ ...newPost, is_liked: false, is_saved: false, comments: [] });
            if (STATE.active_view === 'community') {
              renderFeed(STATE.feed_filter, STATE.feed_mode);
            }
            // Show unread badge on community nav
            const badge = document.getElementById('communityBadge');
            if (badge && STATE.active_view !== 'community') {
              badge.style.display = 'inline';
              badge.textContent = parseInt(badge.textContent || '0') + 1;
            }
          }
        });
      }
    )
    .subscribe();

  // New DMs arrive in real time
  supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        const msg = payload.new;
        // Push into the right conversation
        const conv = CONVERSATIONS.find(c => c.id === msg.conversation_id);
        if (conv) {
          conv.messages.push({
            id:         msg.id,
            sender_id:  msg.sender_id,
            content:    msg.content,
            type:       msg.type,
            post_id:    msg.post_id,
            ts:         'just now',
          });
          conv.last_msg = { sender_id: msg.sender_id, content: msg.content, ts: 'just now' };
          // If this is not our message, increment unread
          currentUser().then(user => {
            if (msg.sender_id !== user?.id) {
              conv.unread_count = (conv.unread_count || 0) + 1;
              if (STATE.active_view === 'messages' && activeConvId === conv.id) {
                renderMessages(conv);
              } else {
                renderConvList();
                // Update message badge
                const total = CONVERSATIONS.reduce((s, c) => s + (c.unread_count || 0), 0);
                const badge = document.getElementById('msgBadge');
                if (badge) { badge.textContent = total; badge.style.display = 'inline'; }
              }
            }
          });
        }
      }
    )
    .subscribe();
}
