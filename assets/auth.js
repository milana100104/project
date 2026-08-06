/* Beacon — authentication via Supabase (real accounts + real confirmation emails).
 *
 * Requires (loaded before this file):
 *   assets/config.js      -> window.BEACON_SUPABASE = { url, key }
 *   @supabase/supabase-js -> window.supabase
 *
 * Admin (Milana) stays a fixed client-side login for the content panel; students
 * are real Supabase users. If Supabase can't load, auth calls fail gracefully
 * and the rest of the site still works.
 */
(function () {
  'use strict';

  var cfg = window.BEACON_SUPABASE || {};
  var sb = null;
  try { if (window.supabase && cfg.url && cfg.key) sb = window.supabase.createClient(cfg.url, cfg.key); }
  catch (e) { sb = null; }
  window.sb = sb;

  var ADMIN = { name: 'Milana', login: 'milana', pass: 'Milanaadmin' };
  var ADMIN_KEY = 'beacon:admin';

  function siteBase() { return location.origin + location.pathname.replace(/[^/]*$/, ''); }
  function readAdmin() { try { return JSON.parse(localStorage.getItem(ADMIN_KEY)); } catch (e) { return null; } }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var Auth = {
    /** async → {id,name,email,role} or null */
    getUser: function () {
      var a = readAdmin();
      if (a) return Promise.resolve(a);
      if (!sb) return Promise.resolve(null);
      return sb.auth.getSession().then(function (res) {
        var u = res && res.data && res.data.session && res.data.session.user;
        if (!u) return null;
        return { id: u.id, email: u.email, name: (u.user_metadata && u.user_metadata.name) || (u.email || '').split('@')[0], role: 'student' };
      }).catch(function () { return null; });
    },
    isAdmin: function () { var a = readAdmin(); return !!a && a.role === 'admin'; },

    register: function (name, email, pass, goals, nickname) {
      name = (name || '').trim(); email = (email || '').trim();
      if (!name || !email || !pass) return Promise.resolve({ ok: false, error: 'Please fill in every field.' });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Promise.resolve({ ok: false, error: 'That email doesn’t look right.' });
      if (pass.length < 6) return Promise.resolve({ ok: false, error: 'Use at least 6 characters for the password.' });
      if (!sb) return Promise.resolve({ ok: false, error: 'Sign-up service isn’t reachable right now.' });
      var meta = { name: name };
      if (goals && typeof goals === 'object' && Object.keys(goals).length) meta.goals = goals;
      if (nickname && String(nickname).trim()) meta.nickname = String(nickname).trim();
      return sb.auth.signUp({
        email: email, password: pass,
        options: { data: meta, emailRedirectTo: siteBase() + 'auth.html?view=login&confirmed=1' }
      }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true };
      });
    },

    /** Verify a sign-up with the 6-digit code from the email; logs the user in. */
    verifyCode: function (email, code) {
      email = (email || '').trim(); code = (code || '').trim().replace(/\s+/g, '');
      if (!email || !code) return Promise.resolve({ ok: false, error: 'Enter the email and the code.' });
      if (!sb) return Promise.resolve({ ok: false, error: 'Service isn’t reachable right now.' });
      return sb.auth.verifyOtp({ email: email, token: code, type: 'signup' }).then(function (res) {
        if (res.error) {
          var m = res.error.message || 'That code didn’t work.';
          if (/expired/i.test(m)) return { ok: false, error: 'That code has expired — request a new one.' };
          if (/invalid/i.test(m)) return { ok: false, error: 'Wrong code — check the email and try again.' };
          return { ok: false, error: m };
        }
        return { ok: true };
      });
    },
    /** Re-send the sign-up code to the email. */
    resendCode: function (email) {
      email = (email || '').trim();
      if (!sb) return Promise.resolve({ ok: false, error: 'Service isn’t reachable right now.' });
      return sb.auth.resend({ type: 'signup', email: email }).then(function (res) {
        return res.error ? { ok: false, error: res.error.message } : { ok: true };
      });
    },

    login: function (id, pass) {
      id = (id || '').trim();
      if (id.toLowerCase() === ADMIN.login && pass === ADMIN.pass) {
        localStorage.setItem(ADMIN_KEY, JSON.stringify({ name: ADMIN.name, email: 'admin@beacon', role: 'admin', pw: pass }));
        return Promise.resolve({ ok: true, admin: true });
      }
      if (!sb) return Promise.resolve({ ok: false, error: 'Login service isn’t reachable right now.' });
      return sb.auth.signInWithPassword({ email: id, password: pass }).then(function (res) {
        if (res.error) {
          var m = res.error.message || 'Wrong email or password.';
          if (/confirm/i.test(m)) return { ok: false, needVerify: true, error: 'Confirm your email first — check your inbox for the link.' };
          return { ok: false, error: m };
        }
        return { ok: true };
      });
    },

    /** Sign in / sign up with a social provider (e.g. 'google'). Redirects away. */
    oauth: function (provider) {
      if (!sb) return Promise.resolve({ ok: false, error: 'Sign-in service isn’t reachable right now.' });
      return sb.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: siteBase() + 'index.html' }
      }).then(function (res) { return res.error ? { ok: false, error: res.error.message } : { ok: true }; });
    },

    logout: function () {
      localStorage.removeItem(ADMIN_KEY);
      var p = sb ? sb.auth.signOut() : Promise.resolve();
      var done = function () { location.href = 'index.html'; };
      return p.then(done, done);
    },

    resetRequest: function (email) {
      email = (email || '').trim();
      if (!sb) return Promise.resolve({ ok: false, error: 'Service isn’t reachable right now.' });
      return sb.auth.resetPasswordForEmail(email, { redirectTo: siteBase() + 'auth.html?view=reset' })
        .then(function (res) { return res.error ? { ok: false, error: res.error.message } : { ok: true }; });
    },
    setNewPassword: function (pass) {
      if (!pass || pass.length < 6) return Promise.resolve({ ok: false, error: 'Use at least 6 characters.' });
      if (!sb) return Promise.resolve({ ok: false, error: 'Service isn’t reachable right now.' });
      return sb.auth.updateUser({ password: pass }).then(function (res) { return res.error ? { ok: false, error: res.error.message } : { ok: true }; });
    },

    /** async guard: redirects to login if signed out; resolves to the user otherwise */
    requireAuth: function () {
      return this.getUser().then(function (u) {
        if (!u) { location.href = 'auth.html?view=login&next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search); return null; }
        return u;
      });
    }
  };
  window.BeaconAuth = Auth;

  // ---- header state (async) ----
  function paintHeader() {
    var slots = document.querySelectorAll('.header-actions');
    if (!slots.length) return;
    Auth.getUser().then(function (u) {
      if (!u) return;
      slots.forEach(function (slot) {
        var admin = u.role === 'admin' ? '<a href="admin.html" class="link-quiet">Admin</a>' : '';
        var first = (u.name || 'You').split(' ')[0];
        slot.innerHTML = admin +
          '<a href="account.html" class="acct-chip">' + esc(first) + '</a>' +
          '<button type="button" class="link-quiet" data-logout>Log out</button>';
        var lo = slot.querySelector('[data-logout]');
        if (lo) lo.addEventListener('click', function () { Auth.logout(); });
      });
    });
  }

  // ---- hand-drawn "boiling line" filters + grain (visual, every page) ----
  function boilFilter(id, seed) {
    return '<filter id="' + id + '"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="' + seed + '" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.6"/></filter>';
  }
  function injectFilters() {
    if (document.getElementById('beacon-sketch-defs')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'beacon-sketch-defs'); svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    svg.innerHTML = '<defs>' + boilFilter('boilA', 1) + boilFilter('boilB', 5) + boilFilter('boilC', 11) + '</defs>';
    document.body.appendChild(svg);
  }
  function injectGrain() {
    if (document.querySelector('.grain') || document.getElementById('beacon-grain')) return;
    var g = document.createElement('div'); g.id = 'beacon-grain'; document.body.appendChild(g);
  }
  function startLineBoil() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var els = document.querySelectorAll('.line-boil');
    if (!els.length) return;
    var frames = ['url(#boilA)', 'url(#boilB)', 'url(#boilC)'], i = 0;
    els.forEach(function (e) { e.style.filter = frames[0]; });
    setInterval(function () { i = (i + 1) % frames.length; els.forEach(function (e) { e.style.filter = frames[i]; }); }, 150);
  }

  function boot() { paintHeader(); injectFilters(); injectGrain(); startLineBoil(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
