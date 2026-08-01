/* Beacon — workspace + practice engine (client-side, no backend).
 *
 * Responsibilities:
 *   - BeaconStore: localStorage-backed bank of questions, favorites, solved
 *     progress and webinars. Ships with a starter content bank; admins add more.
 *   - renderWorkspace(sel, config): the "working" exam pages (TOEFL, SAT) — a
 *     calm, predictable list of skills -> question types, no marketing.
 *   - practice.html: a focused one-question-at-a-time runner with instant
 *     checking, explanations, favorites, and the "solved stays out of the flow
 *     until the pool is cleared" rule.
 *
 * Content note: audio for Listening is a placeholder until an admin uploads
 * real files — the transcript stands in so the questions are still answerable.
 */
(function () {
  'use strict';

  var STORE_KEY = 'beacon:store:v1';

  /* ============================ starter content ============================ */
  /* Types: 'choice' (multiple choice / best response / T-F-NG rendered as choice),
     'cloze' (complete the words — fill missing letters). */
  function Q(o) { return o; }
  var CONTENT = [
    /* ---------------- TOEFL · Reading ---------------- */
    Q({ id:'t-r-mc-1', exam:'toefl', skill:'reading', type:'multiple-choice', difficulty:'medium',
      passage:'The lighthouse at Portland Head has guided ships since 1791. Its keepers once lived on site year-round, trimming the wick each dusk and logging every passing vessel. Automation arrived in 1989, and the last keeper left — but the light still turns.',
      prompt:'What can be inferred about the lighthouse keepers before 1989?',
      choices:['They visited only in summer.','They lived at the lighthouse permanently.','They never recorded passing ships.','They controlled the light remotely.'],
      answer:1, explanation:'"Lived on site year-round" and "logging every passing vessel" show they lived there permanently and kept records.' }),
    Q({ id:'t-r-mc-2', exam:'toefl', skill:'reading', type:'multiple-choice', difficulty:'easy',
      passage:'Coral reefs cover less than one percent of the ocean floor, yet they support roughly a quarter of all marine species. This density makes them one of the most productive ecosystems on Earth.',
      prompt:'The word "productive" in the passage is closest in meaning to:',
      choices:['expensive','fertile / full of life','industrial','shrinking'],
      answer:1, explanation:'"Productive" here describes an ecosystem teeming with life — fertile and biologically rich.' }),
    Q({ id:'t-r-mc-3', exam:'toefl', skill:'reading', type:'multiple-choice', difficulty:'hard',
      passage:'Some historians argue that the printing press did not so much create new ideas as accelerate the spread of existing ones. On this view, its true power lay not in invention but in circulation.',
      prompt:'Which statement best captures the historians’ argument?',
      choices:['The press invented entirely new ideas.','The press mattered mainly for how fast it spread ideas.','The press slowed the exchange of ideas.','The press had little historical impact.'],
      answer:1, explanation:'The passage stresses "circulation" over "invention" — the press mattered for accelerating the spread of ideas.' }),
    Q({ id:'t-r-cw-1', exam:'toefl', skill:'reading', type:'complete-the-words', difficulty:'medium',
      prompt:'Complete the missing letters to finish each word.',
      parts:[{text:'A beacon is a light or fire set on a height to '},{stem:'gu',blank:'ide'},{text:' travellers and warn of '},{stem:'dan',blank:'ger'},{text:'.'}],
      explanation:'The full sentence: "…to guide travellers and warn of danger."' }),
    Q({ id:'t-r-cw-2', exam:'toefl', skill:'reading', type:'complete-the-words', difficulty:'easy',
      prompt:'Complete the missing letters to finish each word.',
      parts:[{text:'Migrating birds '},{stem:'nav',blank:'igate'},{text:' by the stars, using them like a natural '},{stem:'com',blank:'pass'},{text:'.'}],
      explanation:'The full sentence: "…navigate by the stars, using them like a natural compass."' }),
    Q({ id:'t-r-wt-1', exam:'toefl', skill:'reading', type:'whole-text', difficulty:'medium',
      passage:'[1] Tides are driven mainly by the Moon’s gravity. [2] The Sun contributes too, but with roughly half the effect. [3] When Sun and Moon align, their pulls combine into especially high "spring" tides. [4] When they sit at right angles, the tides are gentler.',
      prompt:'What is the main idea of the passage as a whole?',
      choices:['The Sun has no effect on tides.','Tides result from the combined gravity of the Moon and Sun.','Spring tides happen every day.','Tides are caused by ocean currents.'],
      answer:1, explanation:'Across all four sentences the passage explains tides as the combined gravitational pull of Moon and Sun.' }),
    Q({ id:'t-r-wt-2', exam:'toefl', skill:'reading', type:'whole-text', difficulty:'hard',
      passage:'[1] Early maps often left blank spaces where knowledge ran out. [2] Rather than admit ignorance, some cartographers filled these gaps with imagined coastlines. [3] Later voyages erased many of these inventions. [4] Yet a few phantom islands lingered on charts for centuries.',
      prompt:'The passage is primarily concerned with:',
      choices:['how sailors named islands','how gaps in knowledge shaped early maps','why maps are printed on paper','the cost of ocean voyages'],
      answer:1, explanation:'Every sentence returns to how missing knowledge — and guesses about it — shaped early maps.' }),

    /* ---------------- TOEFL · Listening ---------------- */
    Q({ id:'t-l-br-1', exam:'toefl', skill:'listening', type:'best-response', difficulty:'easy',
      audio:true, transcript:'Woman: "I’ve been staring at this problem set for two hours and I’m completely stuck."',
      prompt:'Choose the best response to what the woman says.',
      choices:['"Congratulations on finishing!"','"Want to work through it together?"','"The library closes at nine."','"I don’t have a problem set."'],
      answer:1, explanation:'She’s stuck and frustrated; offering to work through it together is the natural, helpful reply.' }),
    Q({ id:'t-l-br-2', exam:'toefl', skill:'listening', type:'best-response', difficulty:'medium',
      audio:true, transcript:'Man: "Do you know if Professor Reyes moved her office hours this week?"',
      prompt:'Choose the best response.',
      choices:['"Yes, they’re now on Thursday at two."','"I love her lectures."','"The office is painted blue."','"I’ll have the salad."'],
      answer:0, explanation:'He asks a yes/no question about a schedule change; the only response that actually answers it is the first.' }),
    Q({ id:'t-l-dl-1', exam:'toefl', skill:'listening', type:'dialogues', difficulty:'medium',
      audio:true, transcript:'Student: "I’d like to drop the Tuesday lab and switch to Friday." Advisor: "Friday’s full, but I can put you on the waitlist — you’re second in line."',
      prompt:'What does the advisor offer the student?',
      choices:['A guaranteed Friday spot','A place on the waitlist','A refund for the lab','A different professor'],
      answer:1, explanation:'The advisor says Friday is full but offers the waitlist, second in line.' }),
    Q({ id:'t-l-dl-2', exam:'toefl', skill:'listening', type:'dialogues', difficulty:'easy',
      audio:true, transcript:'Librarian: "This book is reference-only, so it can’t leave the building." Student: "Could I at least photocopy a few pages?" Librarian: "Of course — the copier’s just around the corner."',
      prompt:'What does the student want to do?',
      choices:['Borrow the book overnight','Copy a few pages','Buy the book','Return a late book'],
      answer:1, explanation:'The student asks to photocopy a few pages once told the book cannot be borrowed.' }),
    Q({ id:'t-l-lec-1', exam:'toefl', skill:'listening', type:'lectures', difficulty:'hard',
      audio:true, transcript:'Professor: "Photosynthesis is often summarized as a single reaction, but it really has two stages: the light-dependent reactions, which capture energy, and the Calvin cycle, which uses that energy to build sugar."',
      prompt:'According to the professor, the Calvin cycle is responsible for:',
      choices:['capturing light energy','building sugar using captured energy','releasing oxygen','absorbing water'],
      answer:1, explanation:'The professor says the Calvin cycle "uses that energy to build sugar," while the light-dependent stage captures energy.' }),
    Q({ id:'t-l-lec-2', exam:'toefl', skill:'listening', type:'lectures', difficulty:'medium',
      audio:true, transcript:'Announcer: "A reminder that the science building will close early on Friday for maintenance. All labs must be vacated by 4 p.m."',
      prompt:'Why will the science building close early?',
      choices:['For a holiday','For maintenance','For an exam','For a lecture'],
      answer:1, explanation:'The announcement states the early closure is for maintenance, with labs vacated by 4 p.m.' }),

    /* ---------------- IELTS · Reading (mixed types) ---------------- */
    Q({ id:'i-r-1', exam:'ielts', skill:'reading', type:'true-false-notgiven', difficulty:'medium',
      passage:'Bamboo is one of the fastest-growing plants on Earth, with some species growing nearly a metre a day. Although it resembles a tree, it is in fact a giant grass.',
      prompt:'Statement: "Bamboo is a type of tree." Choose the correct answer.',
      choices:['True','False','Not Given'], answer:1,
      explanation:'The passage says bamboo "is in fact a giant grass," so the statement is False.' }),
    Q({ id:'i-r-2', exam:'ielts', skill:'reading', type:'true-false-notgiven', difficulty:'medium',
      passage:'Bamboo is one of the fastest-growing plants on Earth, with some species growing nearly a metre a day. Although it resembles a tree, it is in fact a giant grass.',
      prompt:'Statement: "Bamboo is cheaper than timber." Choose the correct answer.',
      choices:['True','False','Not Given'], answer:2,
      explanation:'The passage never mentions price, so this is Not Given.' }),
    Q({ id:'i-r-3', exam:'ielts', skill:'reading', type:'matching-headings', difficulty:'hard',
      passage:'Paragraph: "The first attempts to measure longitude at sea failed for a simple reason: no clock of the day could keep accurate time on a rolling ship. The breakthrough came from a carpenter, not an astronomer."',
      prompt:'Choose the heading that best fits the paragraph.',
      choices:['A surprising source of the solution','The history of astronomy','How ships are built','The cost of sea travel'],
      answer:0, explanation:'The paragraph highlights that the solution came from a carpenter, not an astronomer — a surprising source.' }),

    /* ---------------- IELTS · Listening ---------------- */
    Q({ id:'i-l-1', exam:'ielts', skill:'listening', type:'form-completion', difficulty:'easy',
      audio:true, transcript:'Receptionist: "Can I take your name?" Caller: "It’s Amara Okafor — that’s O-K-A-F-O-R." Receptionist: "And a contact number?" Caller: "Oh-seven-double-four, three-one-two."',
      prompt:'What is the caller’s surname?',
      choices:['Okafor','Ferrara','O’Connor','Akano'], answer:0,
      explanation:'The caller spells the surname aloud: O-K-A-F-O-R.' }),
    Q({ id:'i-l-2', exam:'ielts', skill:'listening', type:'multiple-choice', difficulty:'medium',
      audio:true, transcript:'Guide: "The tour meets at the north gate, not the main entrance, at a quarter past nine. Please arrive five minutes early."',
      prompt:'Where does the tour meet?',
      choices:['The main entrance','The north gate','The car park','The gift shop'], answer:1,
      explanation:'The guide says the tour meets "at the north gate, not the main entrance."' }),

    /* ---------------- SAT · Math ---------------- */
    Q({ id:'s-m-alg-1', exam:'sat', skill:'math', type:'algebra', difficulty:'easy',
      prompt:'If 3x + 5 = 20, what is the value of x?',
      choices:['3','5','15','25'], answer:1, explanation:'3x = 15, so x = 5.' }),
    Q({ id:'s-m-alg-2', exam:'sat', skill:'math', type:'algebra', difficulty:'medium',
      prompt:'If 2(x − 3) = x + 4, what is x?',
      choices:['7','10','1','−2'], answer:1, explanation:'2x − 6 = x + 4 → x = 10.' }),
    Q({ id:'s-m-alg-3', exam:'sat', skill:'math', type:'algebra', difficulty:'hard',
      prompt:'The line y = mx + 2 passes through (3, 11). What is m?',
      choices:['3','2','5','9'], answer:0, explanation:'11 = 3m + 2 → 3m = 9 → m = 3.' }),
    Q({ id:'s-m-adv-1', exam:'sat', skill:'math', type:'advanced-math', difficulty:'medium',
      prompt:'If f(x) = x² − 4x + 3, what is f(3)?',
      choices:['0','3','6','9'], answer:0, explanation:'f(3) = 9 − 12 + 3 = 0.' }),
    Q({ id:'s-m-adv-2', exam:'sat', skill:'math', type:'advanced-math', difficulty:'hard',
      prompt:'What are the solutions to x² − 5x + 6 = 0?',
      choices:['x = 1 or 6','x = 2 or 3','x = −2 or −3','x = 0 or 5'], answer:1,
      explanation:'Factors: (x−2)(x−3) = 0, so x = 2 or x = 3.' }),
    Q({ id:'s-m-psda-1', exam:'sat', skill:'math', type:'problem-solving-data-analysis', difficulty:'easy',
      prompt:'A recipe uses 2 cups of flour for every 3 cups of sugar. How much flour for 12 cups of sugar?',
      choices:['6','8','9','18'], answer:1, explanation:'12 is 4× the 3, so flour = 4×2 = 8 cups.' }),
    Q({ id:'s-m-psda-2', exam:'sat', skill:'math', type:'problem-solving-data-analysis', difficulty:'medium',
      prompt:'A shirt costs $40 after a 20% discount. What was the original price?',
      choices:['$48','$50','$52','$60'], answer:1, explanation:'40 = 0.8 × original → original = 50.' }),
    Q({ id:'s-m-geo-1', exam:'sat', skill:'math', type:'geometry-trig', difficulty:'medium',
      prompt:'A right triangle has legs 6 and 8. What is the hypotenuse?',
      choices:['10','12','14','48'], answer:0, explanation:'√(6²+8²) = √100 = 10.' }),
    Q({ id:'s-m-geo-2', exam:'sat', skill:'math', type:'geometry-trig', difficulty:'easy',
      prompt:'A circle has radius 5. What is its area? (use π)',
      choices:['10π','25π','5π','50π'], answer:1, explanation:'Area = πr² = 25π.' }),

    /* ---------------- SAT · English (Reading & Writing) ---------------- */
    Q({ id:'s-e-ii-1', exam:'sat', skill:'english', type:'information-ideas', difficulty:'medium',
      passage:'A recent study found that students who spaced their revision over several weeks retained more than those who crammed the night before, even when total study time was equal.',
      prompt:'Which choice best states the main finding of the study?',
      choices:['Cramming and spacing are equally effective.','Spacing revision improves retention over cramming.','Total study time does not matter.','Students dislike revising.'],
      answer:1, explanation:'The study’s point is that spacing beat cramming for retention at equal total time.' }),
    Q({ id:'s-e-ii-2', exam:'sat', skill:'english', type:'information-ideas', difficulty:'hard',
      passage:'The city added protected bike lanes in 2019. In the three years that followed, cycling trips doubled while cyclist injuries fell.',
      prompt:'Which conclusion is best supported by the text?',
      choices:['Bike lanes made cycling both more popular and safer.','Cars were banned downtown.','Cycling injuries rose sharply.','The lanes were removed in 2022.'],
      answer:0, explanation:'Trips doubled and injuries fell — supporting that the lanes made cycling more popular and safer.' }),
    Q({ id:'s-e-cs-1', exam:'sat', skill:'english', type:'craft-structure', difficulty:'medium',
      passage:'As used in the sentence "Her argument was watertight, leaving her critics with nothing to grip," the word "watertight" most nearly means:',
      prompt:'Choose the best meaning of "watertight".',
      choices:['wet','flawless / airtight','waterproof clothing','confusing'],
      answer:1, explanation:'"Watertight," said of an argument, means it has no weaknesses — flawless.' }),
    Q({ id:'s-e-cs-2', exam:'sat', skill:'english', type:'craft-structure', difficulty:'easy',
      passage:'Text 1 praises solar power as clean and increasingly cheap. Text 2 warns that storing solar energy remains costly.',
      prompt:'How does Text 2 relate to Text 1?',
      choices:['It fully agrees.','It adds a practical caution.','It changes the topic.','It repeats Text 1.'],
      answer:1, explanation:'Text 2 doesn’t deny solar’s benefits; it adds a caution about storage cost.' }),
    Q({ id:'s-e-ei-1', exam:'sat', skill:'english', type:'expression-ideas', difficulty:'medium',
      prompt:'Which transition best fits? "The results were inconclusive. ___, the team repeated the experiment."',
      choices:['However','Therefore','For example','Meanwhile'], answer:1,
      explanation:'Repeating the experiment is a consequence of inconclusive results, so "Therefore" fits.' }),
    Q({ id:'s-e-ei-2', exam:'sat', skill:'english', type:'expression-ideas', difficulty:'easy',
      prompt:'Choose the most concise version: "Due to the fact that it rained, the game was cancelled."',
      choices:['Due to the fact that it rained','Because it rained','On account of the raining','In light of the fact of rain'],
      answer:1, explanation:'"Because it rained" says the same thing without wordiness.' }),
    Q({ id:'s-e-sc-1', exam:'sat', skill:'english', type:'standard-conventions', difficulty:'medium',
      prompt:'Choose the correctly punctuated sentence.',
      choices:['We visited three cities Rome, Paris, and Berlin.','We visited three cities: Rome, Paris, and Berlin.','We visited three cities; Rome, Paris, and Berlin.','We visited, three cities: Rome Paris and Berlin.'],
      answer:1, explanation:'A colon correctly introduces the list after an independent clause.' }),
    Q({ id:'s-e-sc-2', exam:'sat', skill:'english', type:'standard-conventions', difficulty:'easy',
      prompt:'"Each of the students ___ responsible for a project." Choose the correct verb.',
      choices:['are','is','were','be'], answer:1,
      explanation:'"Each" is singular, so it takes "is."' })
  ];

  /* ============================ store ============================ */
  function nowKey() { return STORE_KEY; }
  var BeaconStore = {
    _data: null,
    _load: function () {
      if (this._data) return this._data;
      var raw;
      try { raw = JSON.parse(localStorage.getItem(nowKey())); } catch (e) { raw = null; }
      if (!raw || !raw.questions) {
        raw = { questions: {}, favorites: [], solved: {}, webinars: defaultWebinars() };
        CONTENT.forEach(function (q) { raw.questions[q.id] = q; });
      }
      this._data = raw; return raw;
    },
    _save: function () { localStorage.setItem(nowKey(), JSON.stringify(this._data)); },

    /** Optional external seed (window.BEACON_SAMPLE). Only used on a fresh store. */
    seedIfEmpty: function (sample) {
      var d = this._load();
      if (Object.keys(d.questions).length === 0 && sample && sample.questions) {
        sample.questions.forEach(function (q) { d.questions[q.id] = q; });
        this._save();
      }
    },

    questionsFor: function (exam, skill, type) {
      var d = this._load();
      return Object.keys(d.questions).map(function (k) { return d.questions[k]; })
        .filter(function (q) {
          if (q.exam !== exam || q.skill !== skill) return false;
          if (!type || type === 'all' || type === 'random') return true;
          return q.type === type;
        });
    },
    counts: function (exam, skill, type) {
      var all = this.questionsFor(exam, skill, type);
      var d = this._load();
      var bucket = exam + '/' + skill + '/' + (type || 'all');
      var solved = d.solved[bucket] || [];
      var solvedInPool = all.filter(function (q) { return solved.indexOf(q.id) !== -1; }).length;
      return { total: all.length, solved: solvedInPool };
    },
    unsolvedPool: function (exam, skill, type) {
      var all = this.questionsFor(exam, skill, type);
      var d = this._load();
      var bucket = exam + '/' + skill + '/' + (type || 'all');
      var solved = d.solved[bucket] || [];
      return all.filter(function (q) { return solved.indexOf(q.id) === -1; });
    },
    markSolved: function (exam, skill, type, id) {
      var d = this._load();
      var bucket = exam + '/' + skill + '/' + (type || 'all');
      if (!d.solved[bucket]) d.solved[bucket] = [];
      if (d.solved[bucket].indexOf(id) === -1) d.solved[bucket].push(id);
      this._save();
    },
    resetBucket: function (exam, skill, type) {
      var d = this._load();
      var bucket = exam + '/' + skill + '/' + (type || 'all');
      d.solved[bucket] = []; this._save();
    },

    isFav: function (id) { return this._load().favorites.indexOf(id) !== -1; },
    toggleFav: function (id) {
      var d = this._load(); var i = d.favorites.indexOf(id);
      if (i === -1) d.favorites.push(id); else d.favorites.splice(i, 1);
      this._save(); return this.isFav(id);
    },
    favoriteQuestions: function () {
      var d = this._load();
      return d.favorites.map(function (id) { return d.questions[id]; }).filter(Boolean);
    },
    favCount: function () { return this._load().favorites.length; },

    getById: function (id) { return this._load().questions[id]; },

    // admin
    addQuestion: function (q) { var d = this._load(); d.questions[q.id] = q; this._save(); },
    removeQuestion: function (id) { var d = this._load(); delete d.questions[id]; this._save(); },
    allQuestions: function () { var d = this._load(); return Object.keys(d.questions).map(function (k) { return d.questions[k]; }); },
    webinars: function () { return this._load().webinars.slice(); },
    addWebinar: function (w) { var d = this._load(); d.webinars.unshift(w); this._save(); },
    removeWebinar: function (id) { var d = this._load(); d.webinars = d.webinars.filter(function (w) { return w.id !== id; }); this._save(); }
  };

  function defaultWebinars() {
    return [
      { id:'w1', date:'Aug 02 · 6:00 PM', title:'The new TOEFL Speaking, decoded',
        desc:'What Listen-and-Repeat and the interview task actually reward — and how to rehearse for them.', url:'#', cover:'' },
      { id:'w2', date:'Aug 09 · 6:00 PM', title:'An IELTS Task 2 that actually scores',
        desc:'A structure examiners recognize, and the mistakes that quietly cost you a band.', url:'#', cover:'' },
      { id:'w3', date:'Aug 16 · 6:00 PM', title:'Digital SAT Math: pacing the two modules',
        desc:'How the adaptive second module works, and where students lose easy points.', url:'#', cover:'' }
    ];
  }

  /* ============================ helpers ============================ */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; }); }
  function qs(name) { var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null; }
  var CHEV = '<span class="acc-chev"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span>';

  /* ============================ workspace ============================ */
  function renderWorkspace(sel, config) {
    var root = document.querySelector(sel);
    if (!root) return;
    root.innerHTML = '';
    var exam = config.examId;

    // favorites shortcut
    var favN = BeaconStore.favCount();
    var saved = el('a', 'saved-card' + (favN ? '' : ' is-empty'));
    saved.href = 'account.html?tab=favorites';
    saved.innerHTML =
      '<span class="star">' + (favN ? '★' : '☆') + '</span>' +
      '<span class="saved-main"><b>Favorites</b><span>' +
      (favN ? 'Revisit questions you starred — a separate pool you can redo any time.' : 'Star a question during practice to build a redo pool.') +
      '</span></span>' +
      '<span class="saved-count">' + favN + '</span>';
    root.appendChild(saved);

    // skills
    config.skills.forEach(function (skill) {
      var dev = skill.status === 'dev';
      var acc = el('div', 'acc' + (dev ? ' is-dev' : ''));
      var head = el('button', 'acc-head');
      head.type = 'button';
      head.innerHTML =
        '<span class="acc-title">' + esc(skill.name) + '</span>' +
        '<span class="ws-badge ' + (dev ? 'dev' : 'free') + '">' + (dev ? 'In development' : 'Free') + '</span>' +
        '<span class="acc-meta">' + esc(skill.blurb || '') + '</span>' + CHEV;
      acc.appendChild(head);

      var body = el('div', 'acc-body');
      (skill.types || []).forEach(function (t) {
        var c = BeaconStore.counts(exam, skill.id, t.id);
        if (dev) {
          var locked = el('div', 'ws-item is-locked');
          locked.innerHTML =
            '<div class="ws-item-main"><h3>' + esc(t.name) + '</h3><p>' + esc(t.desc || '') + '</p></div>' +
            '<span class="ws-count empty">soon</span>';
          body.appendChild(locked);
        } else {
          var item = el('a', 'ws-item');
          item.href = 'practice.html?exam=' + exam + '&skill=' + skill.id + '&type=' + t.id;
          var pct = c.total ? Math.round((c.solved / c.total) * 100) : 0;
          item.innerHTML =
            '<div class="ws-item-main"><h3>' + esc(t.name) + '</h3><p>' + esc(t.desc || '') + '</p></div>' +
            '<span class="ws-count' + (c.total ? '' : ' empty') + '">' + (c.total ? c.solved + '/' + c.total : 'no questions yet') + '</span>' +
            (c.total ? '<span class="ws-progress-track"><span class="ws-progress-fill" style="width:' + pct + '%"></span></span>' : '') +
            '<span class="ws-go">Practice →</span>';
          body.appendChild(item);
        }
      });
      acc.appendChild(body);
      head.addEventListener('click', function () { acc.classList.toggle('open'); });
      root.appendChild(acc);
    });

    // open the first non-dev skill by default
    var firstOpen = root.querySelector('.acc:not(.is-dev)');
    if (firstOpen) firstOpen.classList.add('open');

    // full test panel
    if (config.fullTest) {
      var ft = el('div', 'ws-fulltest');
      ft.innerHTML =
        '<span class="ws-badge dev">In development</span>' +
        '<h2>' + esc(config.fullTest.title) + '</h2>' +
        '<p>' + esc(config.fullTest.desc) + '</p>';
      root.appendChild(ft);
    }
  }

  /* ============================ practice ============================ */
  function renderPractice(rootSel) {
    var root = document.querySelector(rootSel);
    if (!root) return;

    var favMode = qs('fav') === '1';
    var exam = qs('exam'), skill = qs('skill'), type = qs('type');
    var pool, title, crumb, bucket;

    if (favMode) {
      pool = BeaconStore.favoriteQuestions();
      title = 'Favorites'; crumb = 'favorites · redo pool'; bucket = null;
    } else {
      if (!exam || !skill) { root.innerHTML = errorCard('Nothing to practice yet.', 'Pick a section from an exam page.'); return; }
      pool = BeaconStore.unsolvedPool(exam, skill, type);
      var counts = BeaconStore.counts(exam, skill, type);
      crumb = [exam, skill, prettyType(type)].filter(Boolean).join(' · ');
      title = crumb;
      bucket = { exam: exam, skill: skill, type: type };
      // whole pool cleared
      if (pool.length === 0 && counts.total > 0) {
        root.innerHTML = clearedCard(bucket);
        wireCleared(root, bucket);
        return;
      }
      if (counts.total === 0) { root.innerHTML = errorCard('No questions here yet.', 'An admin hasn’t added questions to this section.'); return; }
    }

    if (favMode && pool.length === 0) { root.innerHTML = errorCard('No favorites yet.', 'Star questions during practice to build a redo pool.'); return; }

    // shuffle for variety
    pool = shuffle(pool.slice());
    var idx = 0, answered = false;

    function draw() {
      answered = false;
      var q = pool[idx];
      root.innerHTML = '';
      root.appendChild(bar(idx, pool.length, crumb));

      var stage = el('div', 'pr-stage');
      var card = el('div', 'pr-card');

      var head = el('div', 'pr-head');
      var diff = q.difficulty ? ' · ' + q.difficulty : '';
      head.innerHTML = '<span class="pr-kicker">Question ' + (idx + 1) + diff + '</span>';
      var save = el('button', 'pr-save' + (BeaconStore.isFav(q.id) ? ' on' : ''));
      save.type = 'button';
      save.innerHTML = '<span class="st">' + (BeaconStore.isFav(q.id) ? '★' : '☆') + '</span> ' + (BeaconStore.isFav(q.id) ? 'Saved' : 'Save');
      save.addEventListener('click', function () {
        var on = BeaconStore.toggleFav(q.id);
        save.classList.toggle('on', on);
        save.innerHTML = '<span class="st">' + (on ? '★' : '☆') + '</span> ' + (on ? 'Saved' : 'Save');
      });
      head.appendChild(save);
      card.appendChild(head);

      if (q.passage) card.appendChild(el('div', 'pr-passage', esc(q.passage)));
      if (q.audio) {
        var au = el('div', 'pr-audio');
        au.innerHTML = q.audioSrc
          ? '<audio controls src="' + esc(q.audioSrc) + '"></audio>'
          : '<div class="ph"><span class="ico">▶</span> Audio placeholder — read the transcript after answering.</div>';
        card.appendChild(au);
      }
      card.appendChild(el('div', 'pr-prompt', esc(q.prompt)));

      var feedback = el('div', 'pr-feedback');

      if (q.type === 'complete-the-words') {
        card.appendChild(clozeBlock(q, feedback, onResolved));
      } else if (q.type === 'text') {
        card.appendChild(textBlock(q, feedback, onResolved));
      } else {
        card.appendChild(choiceBlock(q, feedback, onResolved));
      }
      card.appendChild(feedback);

      // transcript for listening (after answering)
      var transcriptEls = null;
      if (q.transcript) {
        var tbtn = el('button', 'btn btn-ghost pr-transcript-btn', 'Show transcript');
        tbtn.type = 'button'; tbtn.style.display = 'none';
        var tp = el('div', 'pr-transcript', '<span class="tlabel">Transcript</span>' + esc(q.transcript));
        tbtn.addEventListener('click', function () { tp.classList.toggle('show'); });
        card.appendChild(tbtn); card.appendChild(tp);
        transcriptEls = tbtn;
      }

      stage.appendChild(card);
      root.appendChild(stage);
      root.appendChild(nav());

      function onResolved() {
        answered = true;
        if (bucket) BeaconStore.markSolved(bucket.exam, bucket.skill, bucket.type, q.id);
        if (transcriptEls) transcriptEls.style.display = '';
        var next = root.querySelector('[data-next]');
        if (next) { next.classList.remove('btn-ghost'); next.classList.add('btn-gold'); next.removeAttribute('disabled'); }
      }
    }

    function nav() {
      var n = el('div', 'pr-nav');
      var exit = el('a', 'pr-exit', '← Exit');
      exit.href = favMode ? 'account.html?tab=favorites' : (exam + '.html');
      var btns = el('div', 'pr-navbtns');
      var last = idx === pool.length - 1;
      var nextBtn = el('button', 'btn btn-ghost', last ? 'Finish' : 'Next →');
      nextBtn.type = 'button'; nextBtn.setAttribute('data-next', '1'); nextBtn.setAttribute('disabled', '');
      nextBtn.addEventListener('click', function () {
        if (!answered) return;
        if (last) { finish(); } else { idx++; draw(); }
      });
      btns.appendChild(nextBtn);
      n.appendChild(exit); n.appendChild(btns);
      return n;
    }

    function finish() {
      root.innerHTML = '';
      var f = el('div', 'pr-finished');
      f.innerHTML =
        '<div class="fin-mark">✓</div>' +
        '<h2>Set complete</h2>' +
        '<p>You worked through ' + pool.length + ' question' + (pool.length === 1 ? '' : 's') + '.' +
        (favMode ? '' : ' They’ll stay out of your normal flow until you clear the whole pool.') + '</p>' +
        '<div class="fin-actions">' +
        (favMode
          ? '<a class="btn btn-gold" href="account.html?tab=favorites">Back to favorites</a>'
          : '<a class="btn btn-gold" href="' + exam + '.html">Back to ' + exam.toUpperCase() + '</a>' +
            '<a class="btn btn-ghost" href="practice.html' + location.search + '">Keep going</a>') +
        '</div>';
      root.appendChild(f);
    }

    draw();
  }

  function bar(idx, total, crumb) {
    var b = el('div', 'pr-bar');
    var pct = total ? Math.round(((idx) / total) * 100) : 0;
    b.innerHTML =
      '<div class="pr-bar-inner">' +
      '<span class="pr-crumb">' + esc(crumb) + '</span>' +
      '<div class="pr-progress-wrap"><div class="pr-progress-track"><div class="pr-progress-fill" style="width:' + pct + '%"></div></div></div>' +
      '<span class="pr-count">' + (idx + 1) + ' / ' + total + '</span>' +
      '</div>';
    return b;
  }

  function choiceBlock(q, feedback, done) {
    var wrap = el('div', 'pr-choices');
    q.choices.forEach(function (choice, i) {
      var btn = el('button', 'pr-choice');
      btn.type = 'button';
      btn.innerHTML = '<span class="mark">' + String.fromCharCode(65 + i) + '</span><span>' + esc(choice) + '</span>';
      btn.addEventListener('click', function () {
        if (wrap.dataset.done) return;
        wrap.dataset.done = '1';
        var correct = i === q.answer;
        var kids = wrap.querySelectorAll('.pr-choice');
        kids.forEach(function (k) { k.setAttribute('disabled', ''); });
        btn.classList.add(correct ? 'correct' : 'wrong');
        if (!correct) kids[q.answer].classList.add('correct');
        showFeedback(feedback, correct, q.explanation);
        done();
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function clozeBlock(q, feedback, done) {
    var wrap = el('div');
    var text = el('div', 'cloze-text');
    var inputs = [];
    q.parts.forEach(function (p) {
      if (p.text != null) { text.appendChild(document.createTextNode(p.text)); }
      else {
        text.appendChild(document.createTextNode(p.stem || ''));
        var inp = document.createElement('input');
        inp.className = 'cloze-inp'; inp.type = 'text';
        inp.size = Math.max(2, (p.blank || '').length);
        inp.setAttribute('aria-label', 'missing letters');
        inp.dataset.answer = (p.blank || '').toLowerCase();
        inputs.push(inp); text.appendChild(inp);
      }
    });
    wrap.appendChild(text);
    var actions = el('div', 'cloze-actions');
    var check = el('button', 'btn btn-gold', 'Check');
    check.type = 'button';
    check.addEventListener('click', function () {
      if (wrap.dataset.done) return;
      wrap.dataset.done = '1';
      var allCorrect = true;
      inputs.forEach(function (inp) {
        var ok = inp.value.trim().toLowerCase() === inp.dataset.answer;
        inp.classList.add(ok ? 'correct' : 'wrong');
        inp.readOnly = true;
        if (!ok) { allCorrect = false; inp.value = inp.value ? inp.value : ''; inp.title = 'Answer: ' + inp.dataset.answer; }
      });
      check.style.display = 'none';
      showFeedback(feedback, allCorrect, q.explanation);
      done();
    });
    actions.appendChild(check);
    wrap.appendChild(actions);
    return wrap;
  }

  function textBlock(q, feedback, done) {
    var wrap = el('div');
    var row = el('div', 'pr-textrow');
    var inp = document.createElement('input');
    inp.className = 'pr-textin'; inp.type = 'text'; inp.placeholder = 'Type your answer';
    var check = el('button', 'btn btn-gold', 'Check'); check.type = 'button';
    row.appendChild(inp); row.appendChild(check);
    wrap.appendChild(row);
    var accept = [q.answer].concat(q.accept || []).map(function (s) { return String(s).trim().toLowerCase(); });
    check.addEventListener('click', function () {
      if (wrap.dataset.done) return;
      wrap.dataset.done = '1';
      var ok = accept.indexOf(inp.value.trim().toLowerCase()) !== -1;
      inp.classList.add(ok ? 'correct' : 'wrong'); inp.readOnly = true;
      check.style.display = 'none';
      showFeedback(feedback, ok, q.explanation || ('Answer: ' + q.answer));
      done();
    });
    return wrap;
  }

  function showFeedback(node, ok, explanation) {
    node.className = 'pr-feedback show ' + (ok ? 'good' : 'bad');
    node.innerHTML = '<b>' + (ok ? 'Correct' : 'Not quite') + '</b>' +
      (explanation ? '<span class="exp">' + esc(explanation) + '</span>' : '');
  }

  function errorCard(title, sub) {
    return '<div class="pr-finished"><h2>' + esc(title) + '</h2><p>' + esc(sub) + '</p>' +
      '<div class="fin-actions"><a class="btn btn-gold" href="index.html">Home</a></div></div>';
  }
  function clearedCard(b) {
    return '<div class="pr-finished"><div class="fin-mark">✓</div>' +
      '<h2>You’ve cleared this set</h2>' +
      '<p>You’ve solved every question here. New questions are added over time — or reset to run through them again.</p>' +
      '<div class="fin-actions">' +
      '<button class="btn btn-gold" data-reset>Reset & redo</button>' +
      '<a class="btn btn-ghost" href="' + b.exam + '.html">Back to ' + b.exam.toUpperCase() + '</a>' +
      '</div></div>';
  }
  function wireCleared(root, b) {
    var btn = root.querySelector('[data-reset]');
    if (btn) btn.addEventListener('click', function () { BeaconStore.resetBucket(b.exam, b.skill, b.type); location.reload(); });
  }

  function prettyType(t) {
    if (!t || t === 'all' || t === 'random') return t === 'random' ? 'random' : '';
    return t.replace(/-/g, ' ');
  }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }

  /* ============================ exports + autorun ============================ */
  window.BeaconStore = BeaconStore;
  window.renderWorkspace = renderWorkspace;
  window.renderPractice = renderPractice;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('practice')) renderPractice('#practice');
  });
})();
