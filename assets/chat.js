/* Beacon - community chat (bottom-right), real-time via Supabase.
 *
 * Needs (already loaded on the page):
 *   assets/config.js, @supabase/supabase-js, assets/auth.js  →  window.sb
 *
 * Features:
 *   - a public "Room" every signed-in student can post to, live-updating
 *   - direct messages: click a nickname to start a 1:1 thread
 *   - each account has a unique nickname (picked at sign-up, editable in profile)
 *
 * The client-side admin (Milana) has no Supabase session, so the chat only
 * shows for real logged-in students. Requires the chat tables + realtime from
 * supabase-setup.sql.
 */
(function () {
  'use strict';
  if (window.__beaconChat) return; window.__beaconChat = true;

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  ready(boot);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function escAmp(s) { return esc(s).replace(/&amp;/g, '<span class="amp">&amp;</span>'); }
  function timeStr(iso) { try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }

  var sb, me = null, myNick = '', myAvatar = '';
  // illustrated animal avatars, bundled in assets/avatars/<id>.svg
  var AVATARS = ['fox','panda','cat','bear','penguin','rabbit','frog','koala','tiger','pig','owl','dog'];
  var AV_BASE = 'assets/avatars/';
  function avatarHtml(av, cls) {
    cls = cls || 'bc-av';
    if (av && AVATARS.indexOf(av) >= 0) return '<img class="' + cls + '" src="' + AV_BASE + av + '.svg" alt="">';
    if (av && !/^[a-z_]+$/i.test(av)) return '<span class="' + cls + ' bc-av-emoji">' + esc(av) + '</span>'; // legacy emoji
    return '<img class="' + cls + '" src="' + AV_BASE + '_default.svg" alt="">';
  }
  // current nickname + avatar per author (user_id → {nickname, avatar}), so every
  // message shows the author's up-to-date picture & name - even for logged-out guests
  var profCache = {};
  function ensureProfiles(ids) {
    var need = [];
    (ids || []).forEach(function (id) { if (id && !(id in profCache) && need.indexOf(id) < 0) need.push(id); });
    if (!need.length) return Promise.resolve();
    return sb.from('profiles').select('user_id, nickname, avatar').in('user_id', need).then(function (r) {
      (r.data || []).forEach(function (p) { profCache[p.user_id] = { nickname: p.nickname, avatar: p.avatar }; });
      need.forEach(function (id) { if (!(id in profCache)) profCache[id] = {}; });  // remember misses so we don't refetch
    }).catch(function () { need.forEach(function (id) { if (!(id in profCache)) profCache[id] = {}; }); });
  }
  // push my current avatar into the top-right account chip(s) - used after onboarding/first load
  function paintChipAvatar() {
    if (!myAvatar) return;
    try { document.querySelectorAll('.acct-av').forEach(function (img) { img.src = AV_BASE + myAvatar + '.svg'; }); } catch (e) {}
  }
  var roomChan = null, dmChan = null;
  var view = 'room';          // 'room' | 'dms' | 'thread'
  var thread = null;          // { id, nick } of the other person in an open DM

  function boot() {
    sb = window.sb;
    if (!sb) return;
    sb.auth.getSession().then(function (res) {
      var u = res && res.data && res.data.session && res.data.session.user;
      injectStyles();
      if (u) {                 // signed-in student: full chat
        me = u;
        var fallbackNick = (u.user_metadata && (u.user_metadata.nickname || u.user_metadata.name)) || (u.email || 'you').split('@')[0];
        setupProfile(u).then(function (p) {
          myNick = (p && p.nick) || fallbackNick;   // still show the chat even if the profile call hiccups
          myAvatar = (p && p.avatar) || '';
          paintChipAvatar();   // refresh the top-right account chip now (its own fetch ran before onboarding saved)
          buildWidget();
          subscribeDM();
        });
        return;
      }
      me = null; myNick = '';   // guest: read-only chat (can read the room, can't post)
      buildWidget();
    }).catch(function () {});
  }

  /* ---- nickname / profile ---- */
  // Decide whether the signed-in user still needs to set up a nickname + avatar.
  // Everyone (including Google sign-ups) must have BOTH before using the site.
  function setupProfile(u) {
    var adminList = (window.BEACON_ADMIN_EMAILS || []).slice();
    if (window.BEACON_ADMIN_EMAIL) adminList.push(window.BEACON_ADMIN_EMAIL);
    var isAdmin = adminList.map(function (e) { return String(e).toLowerCase(); }).indexOf(String(u.email || '').toLowerCase()) >= 0;
    return sb.from('profiles').select('nickname, avatar').eq('user_id', u.id).maybeSingle().then(function (r) {
      var nick = r && r.data && r.data.nickname;
      var av = r && r.data && r.data.avatar;
      if (nick && av) return { nick: nick, avatar: av };          // already complete → straight in
      if (isAdmin) {                                              // never gate the admin account
        if (!nick) { var mn = (u.user_metadata && u.user_metadata.nickname) || 'Milana'; return claimNick(u, cleanNick(mn), 0).then(function (n) { return { nick: n, avatar: av || '' }; }); }
        return { nick: nick, avatar: av || '' };
      }
      var presetNick = nick || (u.user_metadata && u.user_metadata.nickname) || '';
      var dismissed = false; try { dismissed = sessionStorage.getItem('beacon:onboClosed') === '1'; } catch (e) {}
      if (dismissed) {                                           // they closed it earlier this session - don't nag/redirect
        var fb = cleanNick(presetNick || (u.email || 'you').split('@')[0]);
        return { nick: nick || fb, avatar: av || '' };
      }
      return runOnboarding(u, presetNick, av || '');             // otherwise show the setup screen
    }).catch(function () {
      // fail open - a query hiccup must never lock someone out of the whole site
      var fb = (u.user_metadata && (u.user_metadata.nickname || u.user_metadata.name)) || (u.email || 'you').split('@')[0];
      return { nick: fb, avatar: '' };
    });
  }

  // Blocking welcome screen: a unique nickname AND an avatar are required to continue.
  function runOnboarding(u, presetNick, presetAv) {
    // the setup window belongs on the home page - if we're anywhere else, go there and show it
    var file = location.pathname.split('/').pop() || '';
    if (file !== '' && file !== 'index.html') { location.href = 'index.html'; return new Promise(function () {}); }
    return new Promise(function (resolve) {
      var selected = presetAv || '';
      var overlay = document.createElement('div'); overlay.id = 'bc-onbo';
      overlay.innerHTML =
        '<div class="bc-onbo-card">' +
          '<button id="bc-onbo-x" class="bc-onbo-x" aria-label="Close" title="Close">✕</button>' +
          '<h2>Welcome to Beacon 👋</h2>' +
          '<p>Pick a nickname and a picture to finish setting up - they appear next to your messages in the community chat.</p>' +
          '<label class="bc-onbo-lbl">Nickname</label>' +
          '<input id="bc-onbo-nick" maxlength="20" placeholder="e.g. star_reader" autocomplete="off" value="' + esc(presetNick) + '">' +
          '<div id="bc-onbo-msg" class="bc-onbo-msg"></div>' +
          '<label class="bc-onbo-lbl">Choose an avatar</label>' +
          '<div id="bc-onbo-grid" class="bc-onbo-grid"></div>' +
          '<button id="bc-onbo-go" class="bc-onbo-go" disabled>Get started</button>' +
        '</div>';
      document.body.appendChild(overlay);
      var nickI = document.getElementById('bc-onbo-nick');
      var grid = document.getElementById('bc-onbo-grid');
      var go = document.getElementById('bc-onbo-go');
      var msg = document.getElementById('bc-onbo-msg');
      function setMsg(t, ok) { msg.textContent = t || ''; msg.style.color = ok ? '#4bcf94' : '#ef7d7d'; }
      function refresh() { go.disabled = !(cleanNick(nickI.value).length >= 3 && selected); }
      function paint() {
        grid.innerHTML = AVATARS.map(function (a) {
          return '<button type="button" data-av="' + a + '" class="bc-onbo-av' + (a === selected ? ' on' : '') + '"><img src="' + AV_BASE + a + '.svg" alt=""></button>';
        }).join('');
        grid.querySelectorAll('button').forEach(function (b) { b.onclick = function () { selected = b.getAttribute('data-av'); setMsg('', true); paint(); refresh(); }; });
      }
      paint(); refresh();
      var xBtn = document.getElementById('bc-onbo-x');
      if (xBtn) xBtn.onclick = function () {
        try { sessionStorage.setItem('beacon:onboClosed', '1'); } catch (e) {}   // don't nag again this session
        overlay.remove();
        var fb = cleanNick(nickI.value);
        if (fb.length < 3) fb = cleanNick(presetNick || (u.email || 'you').split('@')[0]);
        resolve({ nick: fb, avatar: selected || presetAv || '' });
      };
      nickI.addEventListener('input', function () { setMsg('', true); refresh(); });
      go.onclick = function () {
        var v = cleanNick(nickI.value);
        if (v.length < 3) { setMsg('Nickname needs at least 3 characters.', false); return; }
        if (!selected) { setMsg('Pick an avatar too.', false); return; }
        go.disabled = true; setMsg('Saving…', true);
        sb.from('profiles').select('user_id').eq('nickname', v).maybeSingle().then(function (chk) {
          if (chk && chk.data && chk.data.user_id && chk.data.user_id !== u.id) { setMsg('“' + v + '” is already taken - pick another.', false); refresh(); return; }
          return sb.from('profiles').upsert({ user_id: u.id, nickname: v, avatar: selected }, { onConflict: 'user_id' }).then(function (r) {
            if (r.error) { setMsg(/duplicate|unique/i.test(r.error.message || '') ? 'That nickname is taken - pick another.' : r.error.message, false); refresh(); return; }
            overlay.remove();
            resolve({ nick: v, avatar: selected });
          });
        }).catch(function () { setMsg('Something went wrong - please try again.', false); refresh(); });
      };
      setTimeout(function () { try { nickI.focus(); } catch (e) {} }, 60);
    });
  }
  function cleanNick(s) { s = String(s || 'user').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\.\-]/g, ''); return (s || 'user').slice(0, 20); }
  function claimNick(u, base, tries) {
    var nick = tries === 0 ? base : (base + (Math.floor(Math.random() * 900) + 100));
    // upsert on user_id so an existing (nickname-less) row for us doesn't look like a clash
    return sb.from('profiles').upsert({ user_id: u.id, nickname: nick }, { onConflict: 'user_id' }).then(function (r) {
      if (!r.error) return nick;
      if (tries < 5) return claimNick(u, base, tries + 1); // real nickname clash → try a suffix
      return nick;
    });
  }

  /* expose a tiny API for the profile page to rename */
  window.BeaconChat = {
    getNick: function () { return myNick; },
    checkNick: function (nick) { return sb.from('profiles').select('user_id').eq('nickname', nick).maybeSingle().then(function (r) { return !(r && r.data); }); },
    setNick: function (nick) {
      nick = cleanNick(nick);
      if (!me) return Promise.resolve({ ok: false, error: 'Sign in first.' });
      if (nick.length < 3) return Promise.resolve({ ok: false, error: 'Nickname needs at least 3 characters.' });
      return sb.from('profiles').upsert({ user_id: me.id, nickname: nick }, { onConflict: 'user_id' }).then(function (r) {
        if (r.error) return { ok: false, error: /duplicate|unique/i.test(r.error.message) ? 'That nickname is taken.' : r.error.message };
        myNick = nick; var b = document.getElementById('bc-me'); if (b) b.textContent = '@' + myNick; return { ok: true };
      });
    },
    getAvatar: function () { return myAvatar; },
    avatars: function () { return AVATARS.slice(); },
    setAvatar: function (av) {
      if (!me) return Promise.resolve({ ok: false, error: 'Sign in first.' });
      var row = { user_id: me.id, avatar: av };
      if (myNick) row.nickname = myNick;   // keep NOT NULL nickname satisfied if this inserts a new row
      return sb.from('profiles').upsert(row, { onConflict: 'user_id' }).then(function (r) {
        if (r.error) return { ok: false, error: r.error.message };
        myAvatar = av; return { ok: true };
      });
    }
  };

  /* ---- widget shell ---- */
  function buildWidget() {
    var meChip = me ? ('@' + esc(myNick)) : '<a href="auth.html?view=login" style="color:#e7c257;text-decoration:none">Log in</a>';
    // logged-in students get the two tabs; guests only see the read-only Chat
    var tabs = me
      ? '<div id="bc-tabs"><button data-tab="room" class="on">Chat</button><button data-tab="dms">Direct messages</button></div>'
      : '';
    var footer = me
      ? '<form id="bc-form"><input id="bc-input" autocomplete="off" placeholder="Write a message…" maxlength="1000"><button type="submit">Send</button></form>'
      : '<div id="bc-guest"><a href="auth.html?view=login">Log in</a> or <a href="auth.html?view=register">sign up</a> to write in the chat</div>';

    var w = document.createElement('div'); w.id = 'bc-root';
    w.innerHTML =
      '<button id="bc-launch" aria-label="Open chat">💬</button>' +
      '<div id="bc-panel">' +
        '<div id="bc-head">' +
          '<button class="bc-back" id="bc-back" hidden>←</button>' +
          '<span id="bc-title">Community</span>' +
          '<span id="bc-me" title="your nickname">' + meChip + '</span>' +
          '<button class="bc-x" id="bc-close" aria-label="Close">✕</button>' +
        '</div>' +
        tabs +
        '<div id="bc-body"></div>' +
        footer +
      '</div>';
    document.body.appendChild(w);

    document.getElementById('bc-launch').onclick = function () { if (panelOpen()) closePanel(); else openPanel(); };
    document.getElementById('bc-close').onclick = closePanel;
    document.getElementById('bc-back').onclick = function () { if (view === 'thread') openTab('dms'); else openTab('room'); };
    var tabBtns = document.querySelectorAll('#bc-tabs button');
    for (var i = 0; i < tabBtns.length; i++) { (function (b) { b.onclick = function () { openTab(b.getAttribute('data-tab')); }; })(tabBtns[i]); }
    var form = document.getElementById('bc-form'); if (form) form.onsubmit = onSend;

    // open with the messages showing by default (skip on the exam page); remember if collapsed
    var isExam = /practice\.html/i.test(location.pathname);
    var savedClosed = false; try { savedClosed = localStorage.getItem('beacon:chatClosed') === '1'; } catch (e) {}
    if (!isExam && !savedClosed) openPanel();
  }

  function setLaunch(ch) { var l = document.getElementById('bc-launch'); if (l && l.childNodes[0]) l.childNodes[0].nodeValue = ch; }
  function panelOpen() { var p = document.getElementById('bc-panel'); return p && p.classList.contains('open'); }
  function closePanel() { var p = document.getElementById('bc-panel'); if (p) p.classList.remove('open'); setLaunch('💬'); try { localStorage.setItem('beacon:chatClosed', '1'); } catch (e) {} }
  function openPanel() {
    var p = document.getElementById('bc-panel'); if (p) p.classList.add('open');
    setLaunch('✕');
    try { localStorage.setItem('beacon:chatClosed', '0'); } catch (e) {}
    openTab(view === 'thread' ? 'dms' : view);
  }

  function openTab(tab) {
    view = tab; thread = null;
    var back = document.getElementById('bc-back');
    var tabsBar = document.getElementById('bc-tabs');
    var form = document.getElementById('bc-form');
    if (back) back.hidden = true;
    document.getElementById('bc-title').textContent = 'Community';
    if (tabsBar) {
      tabsBar.hidden = false;
      var bs = tabsBar.querySelectorAll('button');
      for (var i = 0; i < bs.length; i++) { bs[i].classList.toggle('on', bs[i].getAttribute('data-tab') === tab); }
    }
    if (tab === 'room') {
      if (form) { form.hidden = false; document.getElementById('bc-input').placeholder = 'Write a message…'; }
      loadRoom();
    } else { // dms list
      if (form) form.hidden = true;
      loadThreads();
    }
  }

  /* ---- ROOM ---- */
  function loadRoom() {
    var body = document.getElementById('bc-body');
    body.innerHTML = '<div class="bc-empty">Loading…</div>';
    sb.from('messages').select('*').order('created_at', { ascending: false }).limit(60).then(function (r) {
      var rows = (r.data || []).reverse();
      ensureProfiles(rows.map(function (m) { return m.user_id; })).then(function () {
        body.innerHTML = rows.length ? '' : '<div class="bc-empty">No messages yet - say hi 👋</div>';
        rows.forEach(function (m) { body.appendChild(msgEl(m)); });
        scrollDown();
      });
    });
    if (!roomChan) {
      roomChan = sb.channel('bc-room').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, function (p) {
        ensureProfiles([p.new.user_id]).then(function () {
          if (view === 'room' && panelOpen()) {
            var body2 = document.getElementById('bc-body');
            var em = body2.querySelector('.bc-empty'); if (em) em.remove();
            body2.appendChild(msgEl(p.new)); scrollDown();
          }
        });
      }).subscribe();
    }
  }
  function msgEl(m) {
    var mine = me && m.user_id === me.id;
    var p = profCache[m.user_id] || {};
    // prefer the author's current profile (works for guests too), fall back to what the message stored
    var nick = mine ? myNick : (p.nickname || m.nickname || 'someone');
    var av = mine ? (myAvatar || p.avatar || m.avatar) : (p.avatar || m.avatar);
    var d = document.createElement('div'); d.className = 'bc-msg' + (mine ? ' mine' : '');
    var dmBtn = (me && !mine && m.user_id) ? '<button class="bc-dm-one" title="Message @' + esc(nick) + '">✉</button>' : '';
    d.innerHTML =
      '<div class="bc-meta">' + avatarHtml(av) +
      '<b class="bc-nick">' + (mine ? 'You' : esc(nick)) + '</b>' +
      '<span class="bc-time">' + timeStr(m.created_at) + '</span>' + dmBtn + '</div>' +
      '<div class="bc-text">' + escAmp(m.body) + '</div>';
    if (me && !mine && m.user_id) {   // click name or ✉ to open a DM
      var open = function () { openThread({ id: m.user_id, nick: nick }); };
      var nk = d.querySelector('.bc-nick'); nk.style.cursor = 'pointer'; nk.onclick = open;
      var b = d.querySelector('.bc-dm-one'); if (b) b.onclick = open;
    }
    return d;
  }

  /* ---- DMs ---- */
  function loadThreads() {
    var body = document.getElementById('bc-body');
    body.innerHTML = '<div class="bc-empty">Loading…</div>';
    sb.from('dms').select('*').or('from_user.eq.' + me.id + ',to_user.eq.' + me.id).order('created_at', { ascending: false }).limit(200).then(function (r) {
      var seen = {}, list = [];
      (r.data || []).forEach(function (m) {
        var other = m.from_user === me.id ? { id: m.to_user, nick: m.to_nick } : { id: m.from_user, nick: m.from_nick };
        if (!other.id || seen[other.id]) return; seen[other.id] = 1;
        list.push({ other: other, last: m });
      });
      if (!list.length) { body.innerHTML = '<div class="bc-empty">No messages yet. Tap a name in the Room to start one.</div>'; return; }
      body.innerHTML = '';
      list.forEach(function (it) {
        var row = document.createElement('button'); row.className = 'bc-thread';
        row.innerHTML = '<b>@' + esc(it.other.nick) + '</b><span>' + esc((it.last.from_user === me.id ? 'You: ' : '') + it.last.body).slice(0, 60) + '</span>';
        row.onclick = function () { openThread(it.other); };
        body.appendChild(row);
      });
    });
  }

  function openThread(other) {
    view = 'thread'; thread = other;
    var tabsBar = document.getElementById('bc-tabs'); if (tabsBar) tabsBar.hidden = true;
    document.getElementById('bc-back').hidden = false;
    document.getElementById('bc-title').textContent = '@' + other.nick;
    var form = document.getElementById('bc-form'); form.hidden = false;
    document.getElementById('bc-input').placeholder = 'Message @' + other.nick + '…';
    document.getElementById('bc-panel').classList.add('open'); setLaunch('✕');
    var body = document.getElementById('bc-body'); body.innerHTML = '<div class="bc-empty">Loading…</div>';
    sb.from('dms').select('*')
      .or('and(from_user.eq.' + me.id + ',to_user.eq.' + other.id + '),and(from_user.eq.' + other.id + ',to_user.eq.' + me.id + ')')
      .order('created_at', { ascending: true }).limit(200).then(function (r) {
        body.innerHTML = (r.data && r.data.length) ? '' : '<div class="bc-empty">Say hello 👋</div>';
        (r.data || []).forEach(function (m) { body.appendChild(dmEl(m)); });
        scrollDown();
      });
  }
  function dmEl(m) {
    var mine = m.from_user === me.id;
    var av = mine ? myAvatar : m.avatar;
    var d = document.createElement('div'); d.className = 'bc-msg' + (mine ? ' mine' : '');
    d.innerHTML = '<div class="bc-meta">' + avatarHtml(av) + '<b>' + (mine ? 'You' : esc(m.from_nick)) + '</b><span class="bc-time">' + timeStr(m.created_at) + '</span></div>' +
      '<div class="bc-text">' + escAmp(m.body) + '</div>';
    return d;
  }

  function subscribeDM() {
    dmChan = sb.channel('bc-dm-' + me.id).on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'dms', filter: 'to_user=eq.' + me.id }, function (p) {
        var m = p.new;
        if (view === 'thread' && thread && thread.id === m.from_user && panelOpen()) {
          var body = document.getElementById('bc-body'); var em = body.querySelector('.bc-empty'); if (em) em.remove();
          body.appendChild(dmEl(m)); scrollDown();
        }
      }).subscribe();
  }

  /* ---- send ---- */
  function onSend(e) {
    e.preventDefault();
    if (!me) { location.href = 'auth.html?view=login'; return; }
    var inp = document.getElementById('bc-input'); var body = inp.value.trim();
    if (!body) return; inp.value = '';
    if (view === 'thread' && thread) {
      var row = { from_user: me.id, to_user: thread.id, from_nick: myNick, to_nick: thread.nick, avatar: myAvatar || null, body: body };
      insertRow('dms', row).then(function (r) {
        if (r.error) { inp.value = body; return; }
        var b = document.getElementById('bc-body'); var em = b.querySelector('.bc-empty'); if (em) em.remove();
        b.appendChild(dmEl({ from_user: me.id, from_nick: myNick, avatar: myAvatar, body: body, created_at: new Date().toISOString() })); scrollDown();
      });
    } else {
      insertRow('messages', { user_id: me.id, nickname: myNick, avatar: myAvatar || null, body: body }).then(function (r) {
        if (r.error) inp.value = body; // realtime will render it for everyone (incl. me)
      });
    }
  }
  // insert a chat row; if the `avatar` column isn't in the schema yet, retry without it
  function insertRow(table, row) {
    return sb.from(table).insert(row).then(function (r) {
      if (r.error && /avatar/i.test(r.error.message || '') && ('avatar' in row)) {
        var r2 = {}; for (var k in row) if (k !== 'avatar') r2[k] = row[k];
        return sb.from(table).insert(r2);
      }
      return r;
    });
  }

  function scrollDown() { var b = document.getElementById('bc-body'); if (b) b.scrollTop = b.scrollHeight; }

  /* ---- styles (self-contained, theme-aware enough) ---- */
  function injectStyles() {
    if (document.getElementById('bc-style')) return;
    var s = document.createElement('style'); s.id = 'bc-style';
    s.textContent =
      '@keyframes bc-pop{from{opacity:0;transform:scale(.5) translateY(10px);}to{opacity:1;transform:none;}}' +
      '#bc-root{position:fixed!important;right:20px!important;left:auto!important;bottom:20px!important;top:auto!important;z-index:9000;font-family:"Hanken Grotesk",system-ui,sans-serif;}' +
      '#bc-launch{width:56px;height:56px;border-radius:50%;border:none;background:#e0bc4f;color:#20180a;font-size:1.5rem;line-height:1;padding:0;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35);position:relative;display:flex;align-items:center;justify-content:center;animation:bc-pop .35s cubic-bezier(.2,.9,.3,1.2) both;transition:background .15s,transform .15s;}' +
      '#bc-launch:hover{background:#f0d372;transform:scale(1.06);}' +
      '#bc-panel{position:absolute;right:0;bottom:70px;width:340px;max-width:calc(100vw - 40px);height:480px;max-height:calc(100vh - 120px);background:#0e2144;border:1px solid #274069;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden;color:#f4efe3;' +
        'opacity:0;transform:translateY(16px) scale(.97);transform-origin:bottom right;pointer-events:none;transition:opacity .22s ease,transform .22s ease;}' +
      '#bc-panel.open{opacity:1;transform:none;pointer-events:auto;}' +
      '#bc-head{display:flex;align-items:center;gap:8px;padding:12px 14px;background:#122a52;border-bottom:1px solid #274069;}' +
      '#bc-title{font-weight:700;font-size:1rem;}' +
      '#bc-me{margin-left:auto;font-family:"IBM Plex Mono",monospace;font-size:.72rem;color:#e7c257;}' +
      '#bc-head .bc-x,#bc-head .bc-back,#bc-head .bc-dms{background:none;border:none;color:#c3cee2;font-size:1rem;cursor:pointer;padding:2px 6px;}' +
      '#bc-head .bc-dms{font-size:1.05rem;}#bc-head .bc-dms:hover{color:#e7c257;}' +
      '#bc-head .bc-back{font-size:1.2rem;}' +
      '#bc-tabs{display:flex;border-bottom:1px solid #274069;}' +
      '#bc-tabs button{flex:1;background:none;border:none;color:#8296b7;padding:10px;cursor:pointer;font-weight:600;font-family:inherit;font-size:.9rem;}' +
      '#bc-tabs button.on{color:#e7c257;box-shadow:inset 0 -2px 0 #e7c257;}' +
      '#bc-body{flex:1;overflow-y:scroll;overscroll-behavior:contain;padding:12px;display:flex;flex-direction:column;gap:10px;scrollbar-width:thin;scrollbar-color:#e7c257 rgba(255,255,255,.08);}' +
      '#bc-body::-webkit-scrollbar{width:11px;}' +
      '#bc-body::-webkit-scrollbar-track{background:rgba(255,255,255,.06);border-radius:8px;margin:4px 0;}' +
      '#bc-body::-webkit-scrollbar-thumb{background:#e7c257;border-radius:8px;border:2px solid #0e2144;min-height:44px;}' +
      '#bc-body::-webkit-scrollbar-thumb:hover{background:#f0d372;}' +
      '.bc-empty{color:#8296b7;text-align:center;margin:auto;font-size:.9rem;padding:20px;}' +
      '.bc-msg{max-width:85%;align-self:flex-start;background:#ffffff;border:1px solid #e3e7f0;border-radius:12px;padding:7px 11px;box-shadow:0 1px 3px rgba(0,0,0,.18);}' +
      '.bc-msg.mine{align-self:flex-end;background:#fff6e0;border-color:#e8c65a;}' +
      '.bc-meta{display:flex;gap:6px;align-items:center;margin-bottom:2px;}' +
      'img.bc-av{width:22px;height:22px;border-radius:7px;object-fit:cover;flex-shrink:0;display:block;}' +
      '.bc-av-emoji{font-size:1rem;line-height:1;}' +
      '.bc-meta b{font-size:.8rem;color:#b0851b;}' +
      '.bc-meta .bc-nick{cursor:pointer;}.bc-msg.mine .bc-meta b{color:#6b7690;cursor:default;}' +
      '.bc-time{font-size:.66rem;color:#9aa4bb;}' +
      '.bc-dm-one{margin-left:4px;background:none;border:none;color:#b0851b;cursor:pointer;font-size:.85rem;padding:0 2px;opacity:.7;}' +
      '.bc-dm-one:hover{opacity:1;}' +
      '.bc-text{font-size:.92rem;line-height:1.4;color:#14233f;word-wrap:break-word;overflow-wrap:anywhere;}' +
      '.bc-thread{width:100%;text-align:left;background:#17315b;border:1px solid #274069;border-radius:12px;padding:10px 12px;cursor:pointer;display:flex;flex-direction:column;gap:2px;color:inherit;font-family:inherit;}' +
      '.bc-thread:hover{border-color:#e7c257;}.bc-thread b{color:#e7c257;font-size:.9rem;}.bc-thread span{color:#8296b7;font-size:.8rem;}' +
      '#bc-form{display:flex;gap:8px;padding:10px;border-top:1px solid #274069;background:#0e2144;}' +
      '#bc-input{flex:1;background:#0b1a38;border:1px solid #274069;border-radius:10px;padding:9px 12px;color:#f4efe3;font-family:inherit;font-size:.9rem;}' +
      '#bc-input:focus{outline:none;border-color:#e7c257;}' +
      '#bc-form button{background:#e0bc4f;color:#20180a;border:none;border-radius:10px;padding:0 16px;font-weight:700;cursor:pointer;font-family:inherit;}' +
      '#bc-guest{padding:12px 14px;border-top:1px solid #274069;background:#0e2144;text-align:center;font-size:.85rem;color:#c3cee2;}' +
      '#bc-guest a{color:#e7c257;text-decoration:none;font-weight:600;}' +
      '@keyframes bc-drop{from{opacity:0;transform:translateY(-56px);}to{opacity:1;transform:none;}}' +
      '#bc-onbo{position:fixed!important;inset:0!important;z-index:10000!important;background:rgba(6,14,30,.82);backdrop-filter:blur(6px);display:flex!important;align-items:flex-start;justify-content:center;padding:20px;overflow:auto;}' +
      '.bc-onbo-card{position:relative;background:#0e2144;border:1px solid #274069;border-radius:18px;max-width:420px;width:100%;margin-top:min(11vh,90px);padding:26px 24px;box-shadow:0 24px 60px rgba(0,0,0,.55);color:#f4efe3;animation:bc-drop .34s cubic-bezier(.2,.8,.3,1) both;}' +
      '.bc-onbo-x{position:absolute;top:12px;right:14px;background:none;border:none;color:#8296b7;font-size:1.1rem;line-height:1;cursor:pointer;padding:4px;}' +
      '.bc-onbo-x:hover{color:#e7c257;}' +
      '.bc-onbo-card h2{margin:0 0 6px;font-size:1.3rem;font-weight:700;}' +
      '.bc-onbo-card p{margin:0 0 18px;color:#c3cee2;font-size:.92rem;line-height:1.45;}' +
      '.bc-onbo-lbl{display:block;font-size:.72rem;font-weight:700;color:#8296b7;margin:0 0 7px;text-transform:uppercase;letter-spacing:.05em;}' +
      '#bc-onbo-nick{width:100%;background:#0b1a38;border:1px solid #365286;border-radius:10px;padding:11px 13px;color:#f4efe3;font-family:inherit;font-size:.95rem;box-sizing:border-box;}' +
      '#bc-onbo-nick:focus{outline:none;border-color:#e7c257;}' +
      '.bc-onbo-msg{min-height:1.1em;font-size:.82rem;margin:6px 0 14px;}' +
      '.bc-onbo-grid{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px;}' +
      '.bc-onbo-av{width:50px;height:50px;padding:3px;border-radius:12px;cursor:pointer;border:2px solid #274069;background:#0b1a38;}' +
      '.bc-onbo-av.on{border-color:#e7c257;background:rgba(212,167,44,.16);}' +
      '.bc-onbo-av img{width:100%;height:100%;border-radius:8px;display:block;}' +
      '.bc-onbo-go{width:100%;background:#e0bc4f;color:#20180a;border:none;border-radius:11px;padding:12px;font-weight:700;font-size:1rem;cursor:pointer;font-family:inherit;}' +
      '.bc-onbo-go:disabled{opacity:.5;cursor:not-allowed;}' +
      '.bc-onbo-go:not(:disabled):hover{background:#f0d372;}' +
      '@media(max-width:480px){#bc-root{right:12px;bottom:12px;}#bc-panel{width:calc(100vw - 24px);}}';
    document.head.appendChild(s);
  }
})();
