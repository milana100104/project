/* Beacon — community chat (bottom-right), real-time via Supabase.
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
  function timeStr(iso) { try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } }

  var sb, me = null, myNick = '';
  var roomChan = null, dmChan = null;
  var view = 'room';          // 'room' | 'dms' | 'thread'
  var thread = null;          // { id, nick } of the other person in an open DM
  var unread = 0;

  function boot() {
    sb = window.sb;
    if (!sb) return;
    sb.auth.getSession().then(function (res) {
      var u = res && res.data && res.data.session && res.data.session.user;
      injectStyles();
      if (u) {                 // signed-in student: full chat
        me = u;
        var fallbackNick = (u.user_metadata && (u.user_metadata.nickname || u.user_metadata.name)) || (u.email || 'you').split('@')[0];
        ensureProfile(u).catch(function () { return ''; }).then(function (nick) {
          myNick = nick || fallbackNick;   // still show the chat even if the profile call hiccups
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
  function ensureProfile(u) {
    return sb.from('profiles').select('nickname').eq('user_id', u.id).maybeSingle().then(function (r) {
      if (r && r.data && r.data.nickname) return r.data.nickname;
      var wanted = (u.user_metadata && u.user_metadata.nickname) ||
        (u.user_metadata && u.user_metadata.name) || (u.email || 'user').split('@')[0];
      return claimNick(u, cleanNick(wanted), 0);
    });
  }
  function cleanNick(s) { s = String(s || 'user').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_\.\-]/g, ''); return (s || 'user').slice(0, 20); }
  function claimNick(u, base, tries) {
    var nick = tries === 0 ? base : (base + (Math.floor(Math.random() * 900) + 100));
    return sb.from('profiles').insert({ user_id: u.id, nickname: nick }).then(function (r) {
      if (!r.error) return nick;
      if (tries < 5) return claimNick(u, base, tries + 1); // nickname clash → try a suffix
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
    }
  };

  /* ---- widget shell ---- */
  function buildWidget() {
    var meChip = me ? ('@' + esc(myNick)) : '<a href="auth.html?view=login" style="color:#e7c257;text-decoration:none">Log in</a>';
    var tabs = me
      ? '<button data-tab="room" class="on">Room</button><button data-tab="dms">Messages</button>'
      : '<button data-tab="room" class="on">Room</button>';
    var footer = me
      ? '<form id="bc-form"><input id="bc-input" autocomplete="off" placeholder="Write a message…" maxlength="1000"><button type="submit">Send</button></form>'
      : '<div id="bc-guest"><a href="auth.html?view=login">Log in</a> or <a href="auth.html?view=register">sign up</a> to write in the chat</div>';

    var w = document.createElement('div'); w.id = 'bc-root';
    w.innerHTML =
      '<button id="bc-launch" aria-label="Open chat">💬<span id="bc-badge" hidden>0</span></button>' +
      '<div id="bc-panel">' +
        '<div id="bc-head">' +
          '<button class="bc-back" id="bc-back" hidden>←</button>' +
          '<span id="bc-title">Community</span>' +
          '<span id="bc-me" title="your nickname">' + meChip + '</span>' +
          '<button class="bc-x" id="bc-close" aria-label="Close">✕</button>' +
        '</div>' +
        '<div id="bc-tabs">' + tabs + '</div>' +
        '<div id="bc-body"></div>' +
        footer +
      '</div>';
    document.body.appendChild(w);

    document.getElementById('bc-launch').onclick = function () { if (panelOpen()) closePanel(); else openPanel(); };
    document.getElementById('bc-close').onclick = closePanel;
    document.getElementById('bc-back').onclick = function () { openTab('dms'); };
    document.querySelectorAll('#bc-tabs button').forEach(function (b) { b.onclick = function () { openTab(b.dataset.tab); }; });
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
    setLaunch('—');
    try { localStorage.setItem('beacon:chatClosed', '0'); } catch (e) {}
    unread = 0; renderBadge();
    openTab(view === 'thread' ? 'dms' : view);
  }

  function openTab(tab) {
    view = tab; thread = null;
    document.querySelectorAll('#bc-tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === tab); });
    document.getElementById('bc-back').hidden = true;
    document.getElementById('bc-tabs').hidden = false;
    document.getElementById('bc-title').textContent = 'Community';
    var form = document.getElementById('bc-form');
    if (tab === 'room') { if (form) { form.hidden = false; document.getElementById('bc-input').placeholder = 'Write to the room…'; } loadRoom(); }
    else { if (form) form.hidden = true; loadThreads(); }
  }

  /* ---- ROOM ---- */
  function loadRoom() {
    var body = document.getElementById('bc-body');
    body.innerHTML = '<div class="bc-empty">Loading…</div>';
    sb.from('messages').select('*').order('created_at', { ascending: false }).limit(60).then(function (r) {
      var rows = (r.data || []).reverse();
      body.innerHTML = rows.length ? '' : '<div class="bc-empty">No messages yet — say hi 👋</div>';
      rows.forEach(function (m) { body.appendChild(msgEl(m)); });
      scrollDown();
    });
    if (!roomChan) {
      roomChan = sb.channel('bc-room').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, function (p) {
        if (view === 'room' && panelOpen()) {
          var body2 = document.getElementById('bc-body');
          var em = body2.querySelector('.bc-empty'); if (em) em.remove();
          body2.appendChild(msgEl(p.new)); scrollDown();
        } else if (!me || p.new.user_id !== me.id) { unread++; renderBadge(); }
      }).subscribe();
    }
  }
  function msgEl(m) {
    var mine = me && m.user_id === me.id;
    var d = document.createElement('div'); d.className = 'bc-msg' + (mine ? ' mine' : '');
    d.innerHTML = '<div class="bc-meta"><b class="bc-nick" data-uid="' + esc(m.user_id) + '" data-nick="' + esc(m.nickname) + '">' +
      (mine ? 'You' : esc(m.nickname)) + '</b><span>' + timeStr(m.created_at) + '</span></div>' +
      '<div class="bc-text">' + esc(m.body) + '</div>';
    var nk = d.querySelector('.bc-nick');
    if (me && !mine) nk.onclick = function () { openThread({ id: m.user_id, nick: m.nickname }); };  // DM only when signed in
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
    document.getElementById('bc-tabs').hidden = true;
    document.getElementById('bc-back').hidden = false;
    document.getElementById('bc-title').textContent = '@' + other.nick;
    var form = document.getElementById('bc-form'); form.hidden = false;
    document.getElementById('bc-input').placeholder = 'Message @' + other.nick + '…';
    document.getElementById('bc-panel').classList.add('open'); setLaunch('—');
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
    var d = document.createElement('div'); d.className = 'bc-msg' + (mine ? ' mine' : '');
    d.innerHTML = '<div class="bc-meta"><b>' + (mine ? 'You' : esc(m.from_nick)) + '</b><span>' + timeStr(m.created_at) + '</span></div>' +
      '<div class="bc-text">' + esc(m.body) + '</div>';
    return d;
  }

  function subscribeDM() {
    dmChan = sb.channel('bc-dm-' + me.id).on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'dms', filter: 'to_user=eq.' + me.id }, function (p) {
        var m = p.new;
        if (view === 'thread' && thread && thread.id === m.from_user && panelOpen()) {
          var body = document.getElementById('bc-body'); var em = body.querySelector('.bc-empty'); if (em) em.remove();
          body.appendChild(dmEl(m)); scrollDown();
        } else { unread++; renderBadge(); }
      }).subscribe();
  }

  /* ---- send ---- */
  function onSend(e) {
    e.preventDefault();
    if (!me) { location.href = 'auth.html?view=login'; return; }
    var inp = document.getElementById('bc-input'); var body = inp.value.trim();
    if (!body) return; inp.value = '';
    if (view === 'thread' && thread) {
      var row = { from_user: me.id, to_user: thread.id, from_nick: myNick, to_nick: thread.nick, body: body };
      sb.from('dms').insert(row).then(function (r) {
        if (r.error) { inp.value = body; return; }
        var b = document.getElementById('bc-body'); var em = b.querySelector('.bc-empty'); if (em) em.remove();
        b.appendChild(dmEl({ from_user: me.id, from_nick: myNick, body: body, created_at: new Date().toISOString() })); scrollDown();
      });
    } else {
      sb.from('messages').insert({ user_id: me.id, nickname: myNick, body: body }).then(function (r) {
        if (r.error) inp.value = body; // realtime will render it for everyone (incl. me)
      });
    }
  }

  function scrollDown() { var b = document.getElementById('bc-body'); if (b) b.scrollTop = b.scrollHeight; }
  function renderBadge() {
    var bd = document.getElementById('bc-badge'); if (!bd) return;
    bd.textContent = unread > 9 ? '9+' : unread; bd.hidden = unread === 0;
  }

  /* ---- styles (self-contained, theme-aware enough) ---- */
  function injectStyles() {
    if (document.getElementById('bc-style')) return;
    var s = document.createElement('style'); s.id = 'bc-style';
    s.textContent =
      '@keyframes bc-pop{from{opacity:0;transform:scale(.5) translateY(10px);}to{opacity:1;transform:none;}}' +
      '#bc-root{position:fixed!important;right:20px!important;left:auto!important;bottom:20px!important;top:auto!important;z-index:9000;font-family:"Hanken Grotesk",system-ui,sans-serif;}' +
      '#bc-launch{width:56px;height:56px;border-radius:50%;border:none;background:#e0bc4f;color:#20180a;font-size:1.5rem;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.35);position:relative;animation:bc-pop .35s cubic-bezier(.2,.9,.3,1.2) both;transition:background .15s,transform .15s;}' +
      '#bc-launch:hover{background:#f0d372;transform:scale(1.06);}' +
      '#bc-badge{position:absolute;top:-3px;right:-3px;background:#ef5350;color:#fff;font-size:.7rem;font-weight:700;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 5px;}' +
      '#bc-panel{position:absolute;right:0;bottom:70px;width:340px;max-width:calc(100vw - 40px);height:480px;max-height:calc(100vh - 120px);background:#0e2144;border:1px solid #274069;border-radius:16px;box-shadow:0 18px 50px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden;color:#f4efe3;' +
        'opacity:0;transform:translateY(16px) scale(.97);transform-origin:bottom right;pointer-events:none;transition:opacity .22s ease,transform .22s ease;}' +
      '#bc-panel.open{opacity:1;transform:none;pointer-events:auto;}' +
      '#bc-head{display:flex;align-items:center;gap:8px;padding:12px 14px;background:#122a52;border-bottom:1px solid #274069;}' +
      '#bc-title{font-weight:700;font-size:1rem;}' +
      '#bc-me{margin-left:auto;font-family:"IBM Plex Mono",monospace;font-size:.72rem;color:#e7c257;}' +
      '#bc-head .bc-x,#bc-head .bc-back{background:none;border:none;color:#c3cee2;font-size:1rem;cursor:pointer;padding:2px 6px;}' +
      '#bc-head .bc-back{font-size:1.2rem;}' +
      '#bc-tabs{display:flex;border-bottom:1px solid #274069;}' +
      '#bc-tabs button{flex:1;background:none;border:none;color:#8296b7;padding:10px;cursor:pointer;font-weight:600;font-family:inherit;font-size:.9rem;}' +
      '#bc-tabs button.on{color:#e7c257;box-shadow:inset 0 -2px 0 #e7c257;}' +
      '#bc-body{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;}' +
      '.bc-empty{color:#8296b7;text-align:center;margin:auto;font-size:.9rem;padding:20px;}' +
      '.bc-msg{max-width:85%;align-self:flex-start;background:#ffffff;border:1px solid #e3e7f0;border-radius:12px;padding:7px 11px;box-shadow:0 1px 3px rgba(0,0,0,.18);}' +
      '.bc-msg.mine{align-self:flex-end;background:#fff6e0;border-color:#e8c65a;}' +
      '.bc-meta{display:flex;gap:8px;align-items:baseline;margin-bottom:2px;}' +
      '.bc-meta b{font-size:.8rem;color:#b0851b;}' +
      '.bc-meta .bc-nick{cursor:pointer;}.bc-msg.mine .bc-meta b{color:#6b7690;cursor:default;}' +
      '.bc-meta span{font-size:.66rem;color:#9aa4bb;}' +
      '.bc-text{font-size:.92rem;line-height:1.4;color:#14233f;word-wrap:break-word;overflow-wrap:anywhere;}' +
      '.bc-thread{width:100%;text-align:left;background:#17315b;border:1px solid #274069;border-radius:12px;padding:10px 12px;cursor:pointer;display:flex;flex-direction:column;gap:2px;color:inherit;font-family:inherit;}' +
      '.bc-thread:hover{border-color:#e7c257;}.bc-thread b{color:#e7c257;font-size:.9rem;}.bc-thread span{color:#8296b7;font-size:.8rem;}' +
      '#bc-form{display:flex;gap:8px;padding:10px;border-top:1px solid #274069;background:#0e2144;}' +
      '#bc-input{flex:1;background:#0b1a38;border:1px solid #274069;border-radius:10px;padding:9px 12px;color:#f4efe3;font-family:inherit;font-size:.9rem;}' +
      '#bc-input:focus{outline:none;border-color:#e7c257;}' +
      '#bc-form button{background:#e0bc4f;color:#20180a;border:none;border-radius:10px;padding:0 16px;font-weight:700;cursor:pointer;font-family:inherit;}' +
      '#bc-guest{padding:12px 14px;border-top:1px solid #274069;background:#0e2144;text-align:center;font-size:.85rem;color:#c3cee2;}' +
      '#bc-guest a{color:#e7c257;text-decoration:none;font-weight:600;}' +
      '@media(max-width:480px){#bc-root{right:12px;bottom:12px;}#bc-panel{width:calc(100vw - 24px);}}';
    document.head.appendChild(s);
  }
})();
