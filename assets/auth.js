/* Beacon — client-side auth (demo, no backend).
 *
 * IMPORTANT: this is a front-end-only stand-in so the flows work on a static
 * site. "Passwords" are lightly obscured, not hashed securely, and the email
 * verification code is shown on screen instead of emailed. Swap for a real
 * backend before anything ships. Roles: guest, student, admin.
 * Admin account is fixed: login "Admin" / password "Adminspeaknest".
 */
(function () {
  'use strict';

  var USERS_KEY = 'beacon:users';
  var AUTH_KEY = 'beacon:auth';
  var ADMIN = { name: 'Admin', login: 'admin', pass: 'Adminspeaknest' };

  function read(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  // Deliberately weak obfuscation — a placeholder, not real security.
  function obscure(s) { try { return btoa(unescape(encodeURIComponent('bcn:' + s))); } catch (e) { return s; } }
  function code6() { return String(Math.floor(100000 + Math.random() * 900000)); }

  var Auth = {
    current: function () { return read(AUTH_KEY, null); },
    isLoggedIn: function () { return !!this.current(); },
    isAdmin: function () { var u = this.current(); return !!u && u.role === 'admin'; },

    /** Register a pending (unverified) student. Returns {ok, code} or {ok:false, error}. */
    register: function (name, email, pass) {
      name = (name || '').trim(); email = (email || '').trim().toLowerCase();
      if (!name || !email || !pass) return { ok: false, error: 'Please fill in every field.' };
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: 'That email doesn’t look right.' };
      if (pass.length < 6) return { ok: false, error: 'Use at least 6 characters for the password.' };
      var users = read(USERS_KEY, {});
      if (users[email] && users[email].verified) return { ok: false, error: 'That email is already registered.' };
      var code = code6();
      users[email] = { name: name, email: email, pass: obscure(pass), verified: false, code: code, role: 'student' };
      write(USERS_KEY, users);
      return { ok: true, code: code };
    },

    /** Verify an email with its code. Logs the user in on success. */
    verify: function (email, code) {
      email = (email || '').trim().toLowerCase();
      var users = read(USERS_KEY, {});
      var u = users[email];
      if (!u) return { ok: false, error: 'No pending registration for that email.' };
      if (String(code).trim() !== String(u.code)) return { ok: false, error: 'That code doesn’t match. Check and try again.' };
      u.verified = true; delete u.code; write(USERS_KEY, users);
      write(AUTH_KEY, { name: u.name, email: u.email, role: u.role });
      return { ok: true };
    },

    resend: function (email) {
      email = (email || '').trim().toLowerCase();
      var users = read(USERS_KEY, {}); var u = users[email];
      if (!u) return { ok: false, error: 'No pending registration for that email.' };
      u.code = code6(); write(USERS_KEY, users);
      return { ok: true, code: u.code };
    },

    /** Log in with email/pass (or the admin login). */
    login: function (id, pass) {
      id = (id || '').trim();
      // admin path
      if (id.toLowerCase() === ADMIN.login && pass === ADMIN.pass) {
        write(AUTH_KEY, { name: ADMIN.name, email: 'admin@beacon.local', role: 'admin' });
        return { ok: true, admin: true };
      }
      var email = id.toLowerCase();
      var users = read(USERS_KEY, {}); var u = users[email];
      if (!u || u.pass !== obscure(pass)) return { ok: false, error: 'Wrong email or password.' };
      if (!u.verified) return { ok: false, error: 'Verify your email before logging in.', needVerify: true };
      write(AUTH_KEY, { name: u.name, email: u.email, role: u.role });
      return { ok: true };
    },

    /** Password reset (demo): re-issues a code, then lets caller set a new pass. */
    startReset: function (email) {
      email = (email || '').trim().toLowerCase();
      var users = read(USERS_KEY, {}); var u = users[email];
      if (!u || !u.verified) return { ok: false, error: 'No verified account for that email.' };
      u.code = code6(); write(USERS_KEY, users);
      return { ok: true, code: u.code };
    },
    finishReset: function (email, code, pass) {
      email = (email || '').trim().toLowerCase();
      var users = read(USERS_KEY, {}); var u = users[email];
      if (!u) return { ok: false, error: 'No account for that email.' };
      if (String(code).trim() !== String(u.code)) return { ok: false, error: 'That code doesn’t match.' };
      if (!pass || pass.length < 6) return { ok: false, error: 'Use at least 6 characters.' };
      u.pass = obscure(pass); delete u.code; write(USERS_KEY, users);
      return { ok: true };
    },

    logout: function () { localStorage.removeItem(AUTH_KEY); location.href = 'index.html'; },

    /** Redirect to login if not authenticated. Returns the user or null. */
    requireAuth: function () {
      var u = this.current();
      if (!u) { location.href = 'auth.html?view=login&next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search); }
      return u;
    }
  };

  // ---- header injection: reflect auth state in .header-actions on every page ----
  function paintHeader() {
    var slots = document.querySelectorAll('.header-actions');
    if (!slots.length) return;
    var u = Auth.current();
    slots.forEach(function (slot) {
      if (!u) return; // leave the default "Log in / Start free" markup for guests
      var admin = u.role === 'admin'
        ? '<a href="admin.html" class="link-quiet">Admin</a>' : '';
      var first = (u.name || 'You').split(' ')[0];
      slot.innerHTML =
        admin +
        '<a href="account.html" class="acct-chip">' + escapeHtml(first) + '</a>' +
        '<button type="button" class="link-quiet" data-logout>Log out</button>';
      var lo = slot.querySelector('[data-logout]');
      if (lo) lo.addEventListener('click', function () { Auth.logout(); });
    });
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---- hand-drawn "inky chart" filters: displace borders so card frames look
  //      drawn by hand rather than machine-perfect. Referenced from CSS as
  //      filter:url(#bwobble). Injected once, on every page. ----
  function boilFilter(id, seed) {
    return '<filter id="' + id + '"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="' + seed + '" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.6"/></filter>';
  }
  function injectFilters() {
    if (document.getElementById('beacon-sketch-defs')) return;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'beacon-sketch-defs');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    svg.innerHTML = '<defs>' + boilFilter('boilA', 1) + boilFilter('boilB', 5) + boilFilter('boilC', 11) + '</defs>';
    document.body.appendChild(svg);
  }

  // Grain overlay for pages that don't already have a .grain element.
  function injectGrain() {
    if (document.querySelector('.grain') || document.getElementById('beacon-grain')) return;
    var g = document.createElement('div');
    g.id = 'beacon-grain';
    document.body.appendChild(g);
  }

  // Frame-by-frame "boiling line": swap the displacement filter a few times a
  // second so hand-drawn strokes shimmer the way a person's animated line does.
  function startLineBoil() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var els = document.querySelectorAll('.line-boil');
    if (!els.length) return;
    var frames = ['url(#boilA)', 'url(#boilB)', 'url(#boilC)'], i = 0;
    els.forEach(function (e) { e.style.filter = frames[0]; });
    setInterval(function () {
      i = (i + 1) % frames.length;
      els.forEach(function (e) { e.style.filter = frames[i]; });
    }, 150);
  }

  function boot() { paintHeader(); injectFilters(); injectGrain(); startLineBoil(); }
  window.BeaconAuth = Auth;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
