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

    /* ---------------- IELTS · Reading (real question types) ---------------- */
    Q({ id:'i-r-mc-1', exam:'ielts', skill:'reading', type:'multiple-choice', difficulty:'medium',
      passage:'The Eden Project, built in a disused clay pit in Cornwall, opened in 2001. Its giant biomes recreate a rainforest and a Mediterranean climate under vast domes, and it now draws over a million visitors a year.',
      prompt:'What was the site of the Eden Project before it was built?',
      choices:['A working farm','An abandoned clay pit','A public park','A shipping port'], answer:1,
      explanation:'The passage says it was "built in a disused clay pit in Cornwall."' }),
    Q({ id:'i-r-1', exam:'ielts', skill:'reading', type:'true-false-notgiven', difficulty:'medium',
      passage:'Bamboo is one of the fastest-growing plants on Earth, with some species growing nearly a metre a day. Although it resembles a tree, it is in fact a giant grass.',
      prompt:'Statement: "Bamboo is a type of tree." Choose True, False or Not Given.',
      choices:['True','False','Not Given'], answer:1,
      explanation:'The passage says bamboo "is in fact a giant grass," so the statement is False.' }),
    Q({ id:'i-r-2', exam:'ielts', skill:'reading', type:'true-false-notgiven', difficulty:'medium',
      passage:'Bamboo is one of the fastest-growing plants on Earth, with some species growing nearly a metre a day. Although it resembles a tree, it is in fact a giant grass.',
      prompt:'Statement: "Bamboo is cheaper than timber." Choose True, False or Not Given.',
      choices:['True','False','Not Given'], answer:2,
      explanation:'The passage never mentions price, so this is Not Given.' }),
    Q({ id:'i-r-yn-1', exam:'ielts', skill:'reading', type:'yes-no-notgiven', difficulty:'hard',
      passage:'The writer argues that remote work, far from harming productivity, has forced managers to judge staff on results rather than on hours seen at a desk — a change she considers long overdue.',
      prompt:'Statement: "The writer believes judging staff by results is a positive change." Choose Yes, No or Not Given.',
      choices:['Yes','No','Not Given'], answer:0,
      explanation:'She calls the shift "long overdue," which signals she views it positively — Yes.' }),
    Q({ id:'i-r-3', exam:'ielts', skill:'reading', type:'matching-headings', difficulty:'hard',
      passage:'Paragraph: "The first attempts to measure longitude at sea failed for a simple reason: no clock of the day could keep accurate time on a rolling ship. The breakthrough came from a carpenter, not an astronomer."',
      prompt:'Choose the heading that best fits the paragraph.',
      choices:['A surprising source of the solution','The history of astronomy','How ships are built','The cost of sea travel'],
      answer:0, explanation:'The paragraph highlights that the solution came from a carpenter, not an astronomer — a surprising source.' }),
    Q({ id:'i-r-mi-1', exam:'ielts', skill:'reading', type:'matching-information', difficulty:'medium',
      passage:'A. Honeybees communicate the direction of food with a "waggle dance".\nB. A single hive may contain up to 60,000 bees in summer.\nC. Bees maintain the hive at a steady 35°C by fanning their wings.\nD. Beekeeping dates back at least 4,500 years in ancient Egypt.',
      prompt:'Which paragraph mentions how bees control the temperature of the hive?',
      choices:['Paragraph A','Paragraph B','Paragraph C','Paragraph D'], answer:2,
      explanation:'Paragraph C describes bees keeping the hive at 35°C by fanning their wings.' }),
    Q({ id:'i-r-sc-1', exam:'ielts', skill:'reading', type:'sentence-completion', difficulty:'medium', format:'text',
      passage:'The lighthouse was powered by a rotating lens floating on a bath of mercury, which allowed the heavy assembly to turn with almost no friction.',
      prompt:'Complete the sentence with ONE word from the passage: "The lens floated on a bath of ______ to reduce friction."',
      answer:'mercury', accept:['Mercury'],
      explanation:'The passage states the lens floated "on a bath of mercury."' }),
    Q({ id:'i-r-sum-1', exam:'ielts', skill:'reading', type:'summary-completion', difficulty:'hard', format:'text',
      passage:'Coral reefs grow only a few centimetres a year, yet over millennia they build structures large enough to be seen from space. The Great Barrier Reef is the largest such structure on Earth.',
      prompt:'Complete the summary with ONE word: "Although coral grows slowly, over thousands of years it forms huge ______ visible from space."',
      answer:'structures', accept:['structure'],
      explanation:'The passage refers to the reefs as "structures large enough to be seen from space."' }),

    /* ---------------- IELTS · Listening (real question types) ---------------- */
    Q({ id:'i-l-2', exam:'ielts', skill:'listening', type:'multiple-choice', difficulty:'medium',
      audio:true, transcript:'Guide: "The tour meets at the north gate, not the main entrance, at a quarter past nine. Please arrive five minutes early."',
      prompt:'Where does the tour meet?',
      choices:['The main entrance','The north gate','The car park','The gift shop'], answer:1,
      explanation:'The guide says the tour meets "at the north gate, not the main entrance."' }),
    Q({ id:'i-l-1', exam:'ielts', skill:'listening', type:'form-completion', difficulty:'easy', format:'text',
      audio:true, transcript:'Receptionist: "Can I take your surname?" Caller: "It’s Okafor — that’s O-K-A-F-O-R."',
      prompt:'Complete the form. Surname: ______ (type what you hear).',
      answer:'okafor', accept:['Okafor'],
      explanation:'The caller spells the surname aloud: O-K-A-F-O-R.' }),
    Q({ id:'i-l-match-1', exam:'ielts', skill:'listening', type:'matching', difficulty:'medium',
      audio:true, transcript:'Tutor: "Priya will handle the survey, Sam is writing the introduction, and Lena is preparing the slides for the presentation."',
      prompt:'Who is preparing the slides?',
      choices:['Priya','Sam','Lena','The tutor'], answer:2,
      explanation:'The tutor says "Lena is preparing the slides."' }),
    Q({ id:'i-l-map-1', exam:'ielts', skill:'listening', type:'plan-map-diagram-labelling', difficulty:'medium',
      audio:true, transcript:'Warden: "As you come through the main entrance, the café is immediately on your left, and the toilets are straight ahead, past the information desk."',
      prompt:'Coming through the main entrance, where is the café?',
      choices:['On the left','On the right','Straight ahead','Upstairs'], answer:0,
      explanation:'The warden says the café is "immediately on your left."' }),
    Q({ id:'i-l-sc-1', exam:'ielts', skill:'listening', type:'sentence-completion', difficulty:'medium', format:'text',
      audio:true, transcript:'Lecturer: "Please note the essay deadline has moved to Friday, and it must be submitted online."',
      prompt:'Complete the sentence with ONE word: "The essay must be submitted ______."',
      answer:'online', accept:[],
      explanation:'The lecturer says the essay "must be submitted online."' }),
    Q({ id:'i-l-sa-1', exam:'ielts', skill:'listening', type:'short-answer', difficulty:'easy', format:'text',
      audio:true, transcript:'Clerk: "The museum is open every day except Monday."',
      prompt:'On which day is the museum closed? (ONE word)',
      answer:'monday', accept:['Monday'],
      explanation:'The clerk says it is open "every day except Monday."' }),

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
    _remote: {},   // questions loaded from Supabase (shared across everyone). Not persisted locally.
    _ready: null,

    /** Merge: built-in seed + admin's locally-added + Supabase-shared questions. */
    _bank: function () {
      var d = this._load();
      var out = {};
      Object.keys(d.questions).forEach(function (k) { out[k] = d.questions[k]; });
      var r = this._remote;
      Object.keys(r).forEach(function (k) { out[k] = r[k]; });
      return out;
    },

    /** Load shared questions AND the signed-in student's progress once.
     *  Always resolves — the local seed / localStorage is the fallback. */
    ready: function () {
      if (this._ready) return this._ready;
      var self = this;
      var sb = window.sb;
      if (!sb) { this._ready = Promise.resolve(); return this._ready; }
      var qP = sb.from('questions').select('data').then(function (res) {
        if (res && !res.error && res.data) {
          res.data.forEach(function (row) {
            var q = row && row.data;
            if (q && q.id) self._remote[q.id] = q;
          });
        }
      }).catch(function () { /* table missing / offline: fall back to the seed */ });
      this._ready = Promise.all([qP, this._loadProgress()]).then(function () {});
      return this._ready;
    },

    // ---- per-student progress sync (favorites + solved) --------------
    _userId: null,      // Supabase user id when a student is signed in; null for guests/admin
    _syncTimer: null,
    /** Pull this student's saved list + solved progress from Supabase (once, at load). */
    _loadProgress: function () {
      var self = this, sb = window.sb;
      if (!sb) return Promise.resolve();
      return sb.auth.getSession().then(function (res) {
        var u = res && res.data && res.data.session && res.data.session.user;
        if (!u) return; // guest or client-side admin → this browser only
        self._userId = u.id;
        return sb.from('progress').select('favorites, solved').eq('user_id', u.id).maybeSingle()
          .then(function (r) {
            var d = self._load();
            if (r && !r.error && r.data) {
              if (Array.isArray(r.data.favorites)) d.favorites = r.data.favorites;
              if (r.data.solved && typeof r.data.solved === 'object') d.solved = r.data.solved;
              self._save();
            } else {
              self._syncUp(); // no row yet → seed the account from this device
            }
          });
      }).catch(function () {});
    },
    /** Push the current student's progress up to Supabase (debounced, fire-and-forget). */
    _syncUp: function () {
      var self = this, sb = window.sb;
      if (!sb || !this._userId) return; // nothing to sync for guests/admin
      if (this._syncTimer) clearTimeout(this._syncTimer);
      this._syncTimer = setTimeout(function () {
        var d = self._load();
        sb.from('progress').upsert(
          { user_id: self._userId, favorites: d.favorites, solved: d.solved, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        ).then(function () {}, function () {});
      }, 400);
    },

    _load: function () {
      if (this._data) return this._data;
      var raw;
      try { raw = JSON.parse(localStorage.getItem(nowKey())); } catch (e) { raw = null; }
      if (!raw || !raw.questions) {
        raw = { questions: {}, favorites: [], solved: {}, webinars: defaultWebinars() };
        CONTENT.forEach(function (q) { raw.questions[q.id] = q; });
      }
      // refresh webinars for older stores that predate the dated list
      if (!raw.webinars || !raw.webinars.length || !raw.webinars[0].iso) raw.webinars = defaultWebinars();
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
      var bank = this._bank();
      return Object.keys(bank).map(function (k) { return bank[k]; })
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
      this._save(); this._syncUp();
    },
    resetBucket: function (exam, skill, type) {
      var d = this._load();
      var bucket = exam + '/' + skill + '/' + (type || 'all');
      d.solved[bucket] = []; this._save(); this._syncUp();
    },

    isFav: function (id) { return this._load().favorites.indexOf(id) !== -1; },
    toggleFav: function (id) {
      var d = this._load(); var i = d.favorites.indexOf(id);
      if (i === -1) d.favorites.push(id); else d.favorites.splice(i, 1);
      this._save(); this._syncUp(); return this.isFav(id);
    },
    favoriteQuestions: function () {
      var d = this._load(); var bank = this._bank();
      return d.favorites.map(function (id) { return bank[id]; }).filter(Boolean);
    },
    favCount: function () { return this._load().favorites.length; },

    getById: function (id) { return this._bank()[id]; },

    // admin ------------------------------------------------------------
    _adminPw: function () {
      try { var a = JSON.parse(localStorage.getItem('beacon:admin')); return a && a.pw; }
      catch (e) { return null; }
    },
    /** Add a question. Writes to Supabase (shared with every student) when possible,
     *  otherwise keeps it in this browser only. Returns a Promise → {ok,error?,local?}. */
    addQuestion: function (q) {
      var self = this, sb = window.sb, pw = this._adminPw();
      if (sb && pw) {
        return sb.rpc('beacon_add_question', { pass: pw, q: q }).then(function (res) {
          if (res.error) return { ok: false, error: res.error.message };
          self._remote[q.id] = q;
          return { ok: true };
        });
      }
      var d = this._load(); d.questions[q.id] = q; this._save();
      return Promise.resolve({ ok: true, local: true });
    },
    removeQuestion: function (id) {
      var self = this, sb = window.sb, pw = this._adminPw();
      if (sb && pw && this._remote[id]) {
        return sb.rpc('beacon_delete_question', { pass: pw, qid: id }).then(function (res) {
          if (res.error) return { ok: false, error: res.error.message };
          delete self._remote[id];
          return { ok: true };
        });
      }
      var d = this._load(); delete d.questions[id]; this._save();
      return Promise.resolve({ ok: true, local: true });
    },
    /** Upload a question image to Supabase Storage. Returns a Promise → {ok,url?,error?}. */
    uploadImage: function (file) {
      var sb = window.sb;
      if (!sb) return Promise.resolve({ ok: false, error: 'Image storage isn’t reachable right now.' });
      var ext = (String(file.name).split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
      var path = 'q-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e4).toString(36) + '.' + ext;
      return sb.storage.from('question-images').upload(path, file, { upsert: false }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        var pub = sb.storage.from('question-images').getPublicUrl(path);
        return { ok: true, url: pub.data.publicUrl };
      });
    },
    allQuestions: function () { var bank = this._bank(); return Object.keys(bank).map(function (k) { return bank[k]; }); },
    webinars: function () {
      function k(w) { return w.iso || '9999-12-31'; } // newest first; undated go on top
      return this._load().webinars.slice().sort(function (a, b) { return k(b).localeCompare(k(a)); });
    },
    addWebinar: function (w) { var d = this._load(); d.webinars.unshift(w); this._save(); },
    removeWebinar: function (id) { var d = this._load(); d.webinars = d.webinars.filter(function (w) { return w.id !== id; }); this._save(); }
  };

  function defaultWebinars() {
    return [
      { id:'w1', iso:'2026-08-02T18:00', date:'Aug 02 · 6:00 PM', title:'The new TOEFL Speaking, decoded',
        desc:'What Listen-and-Repeat and the interview task actually reward — and how to rehearse for them.', url:'#', cover:'' },
      { id:'w2', iso:'2026-08-09T18:00', date:'Aug 09 · 6:00 PM', title:'An IELTS Task 2 that actually scores',
        desc:'A structure examiners recognize, and the mistakes that quietly cost you a band.', url:'#', cover:'' },
      { id:'w3', iso:'2026-08-16T18:00', date:'Aug 16 · 6:00 PM', title:'Digital SAT Math: pacing the two modules',
        desc:'How the adaptive second module works, and where students lose easy points.', url:'#', cover:'' },
      { id:'w4', iso:'2026-08-23T18:00', date:'Aug 23 · 6:00 PM', title:'TOEFL Reading: beating the clock',
        desc:'A repeatable way to read academic passages fast without losing the details the questions test.', url:'#', cover:'' },
      { id:'w5', iso:'2026-08-30T18:00', date:'Aug 30 · 6:00 PM', title:'IELTS Listening: the traps in Section 3',
        desc:'Multi-speaker discussions, distractors, and how to keep your place on the answer sheet.', url:'#', cover:'' },
      { id:'w6', iso:'2026-09-06T18:00', date:'Sep 06 · 6:00 PM', title:'SAT Reading & Writing: grammar that pays off',
        desc:'The handful of Standard English Conventions questions you can get right every single time.', url:'#', cover:'' }
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
    BeaconStore.ready().then(function () { _renderWorkspace(root, config); });
  }
  function _renderWorkspace(root, config) {
    root.innerHTML = '';
    var exam = config.examId;

    // favorites shortcut
    var favN = BeaconStore.favCount();
    var saved = el('a', 'saved-card' + (favN ? '' : ' is-empty'));
    saved.href = 'account.html?tab=favorites';
    saved.innerHTML =
      '<span class="star">' + (favN ? '★' : '☆') + '</span>' +
      '<span class="saved-main"><b>Saved</b><span>' +
      (favN ? 'Questions you saved while practising — a separate pool you can redo any time.' : 'Tap “Save” on any question to keep it here and come back to it later.') +
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

      // optional: assemble a full, exam-style test from every question in this skill
      if (!dev && skill.skillTest) {
        var tot = BeaconStore.questionsFor(exam, skill.id, null).length;
        var tItem = el('a', 'ws-item ws-item-full');
        tItem.href = 'practice.html?mode=test&exam=' + exam + '&skill=' + skill.id;
        tItem.innerHTML =
          '<div class="ws-item-main"><h3>Take a full ' + esc(skill.name) + ' test</h3>' +
          '<p>A timed, exam-style test built from every ' + esc(skill.name) + ' question — scored at the end, no hints along the way.</p></div>' +
          '<span class="ws-count">' + (tot ? tot + ' Qs' : 'no questions yet') + '</span>' +
          '<span class="ws-go">Start test →</span>';
        body.appendChild(tItem);
      }

      acc.appendChild(body);
      head.addEventListener('click', function () { acc.classList.toggle('open'); });
      root.appendChild(acc);
    });

    // accordions start collapsed — the user opens the skill they want

    // full test panel
    if (config.fullTest) {
      var ready = !!config.fullTest.href;
      var ft = el('div', 'ws-fulltest' + (ready ? ' is-ready' : ''));
      ft.innerHTML =
        '<span class="ws-badge ' + (ready ? 'free' : 'dev') + '">' + (ready ? 'New · live' : 'In development') + '</span>' +
        '<h2>' + esc(config.fullTest.title) + '</h2>' +
        '<p>' + esc(config.fullTest.desc) + '</p>' +
        (ready ? '<a class="btn-white ws-fulltest-cta" href="' + esc(config.fullTest.href) + '">Start the adaptive test →</a>' : '');
      root.appendChild(ft);
    }
  }

  /* ============================ practice ============================ */
  function renderPractice(rootSel) {
    var root = document.querySelector(rootSel);
    if (!root) return;
    BeaconStore.ready().then(function () { _renderPractice(root); });
  }
  function _renderPractice(root) {
    // white task surfaces on every practice page (matches the workspace pages)
    document.body.classList.add('ws-white');

    if (qs('mode') === 'adaptive') { renderAdaptiveSAT(root); return; }

    var favMode = qs('fav') === '1';
    var testMode = qs('mode') === 'test';
    var exam = qs('exam'), skill = qs('skill'), type = qs('type');
    var pool, crumb, bucket = null, reveal = true;

    if (favMode) {
      pool = BeaconStore.favoriteQuestions();
      crumb = 'saved · redo pool';
      if (pool.length === 0) { root.innerHTML = errorCard('Nothing saved yet.', 'Tap “Save” on a question during practice to keep it here.'); return; }
    } else if (testMode) {
      if (!exam || !skill) { root.innerHTML = errorCard('Nothing to test yet.', 'Pick a section from an exam page.'); return; }
      pool = BeaconStore.questionsFor(exam, skill, null); // whole skill, every type
      if (pool.length === 0) { root.innerHTML = errorCard('No questions here yet.', 'This section has no questions to build a test from.'); return; }
      crumb = exam + ' · ' + skill + ' · full test';
      reveal = false; // exam-style: no per-question feedback until the end
    } else {
      if (!exam || !skill) { root.innerHTML = errorCard('Nothing to practice yet.', 'Pick a section from an exam page.'); return; }
      pool = BeaconStore.unsolvedPool(exam, skill, type);
      var counts = BeaconStore.counts(exam, skill, type);
      crumb = [exam, skill, prettyType(type)].filter(Boolean).join(' · ');
      bucket = { exam: exam, skill: skill, type: type };
      if (pool.length === 0 && counts.total > 0) { root.innerHTML = clearedCard(bucket); wireCleared(root, bucket); return; }
      if (counts.total === 0) { root.innerHTML = errorCard('No questions here yet.', 'An admin hasn’t added questions to this section.'); return; }
    }

    pool = shuffle(pool.slice());
    var idx = 0, answered = false, answers = {};

    // exam-style countdown for full-skill tests
    var remaining = testMode ? pool.length * (skill === 'listening' ? 60 : 90) : 0;
    var timerId = null;
    if (testMode) {
      timerId = setInterval(function () {
        remaining--;
        var t = root.querySelector('.pr-timer'); if (t) t.textContent = '⏱ ' + fmtTime(remaining);
        if (remaining <= 0) { clearInterval(timerId); timerId = null; finish(); }
      }, 1000);
    }

    function draw() {
      answered = false;
      var q = pool[idx];
      root.innerHTML = '';
      root.appendChild(bar(idx, pool.length, crumb, testMode ? remaining : null));

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
      if (q.image) {
        var fig = el('div', 'pr-image');
        fig.innerHTML = '<img src="' + esc(q.image) + '" alt="Question image" loading="lazy">';
        card.appendChild(fig);
      }
      if (q.audio) {
        var au = el('div', 'pr-audio');
        au.innerHTML = q.audioSrc
          ? '<audio controls src="' + esc(q.audioSrc) + '"></audio>'
          : '<div class="ph"><span class="ico">▶</span> Audio placeholder' + (reveal ? ' — read the transcript after answering.' : '.') + '</div>';
        card.appendChild(au);
      }
      card.appendChild(el('div', 'pr-prompt', esc(q.prompt)));

      var feedback = el('div', 'pr-feedback');

      // render mode: q.format overrides, else derived from q.type
      var fmt = q.format || q.type;
      if (fmt === 'complete-the-words' || fmt === 'cloze') {
        card.appendChild(clozeBlock(q, feedback, onResolved, reveal));
      } else if (fmt === 'text') {
        card.appendChild(textBlock(q, feedback, onResolved, reveal));
      } else {
        card.appendChild(choiceBlock(q, feedback, onResolved, reveal));
      }
      card.appendChild(feedback);

      // transcript for listening (shown after answering — practice only, not during a test)
      var transcriptEls = null;
      if (q.transcript && reveal) {
        var tbtn = el('button', 'btn btn-navy pr-transcript-btn', 'Show transcript');
        tbtn.type = 'button'; tbtn.style.display = 'none';
        var tp = el('div', 'pr-transcript', '<span class="tlabel">Transcript</span>' + esc(q.transcript));
        tbtn.addEventListener('click', function () { tp.classList.toggle('show'); });
        card.appendChild(tbtn); card.appendChild(tp);
        transcriptEls = tbtn;
      }

      stage.appendChild(card);
      root.appendChild(stage);
      root.appendChild(nav());

      function onResolved(correct) {
        answered = true;
        answers[q.id] = !!correct;
        if (bucket && !testMode) BeaconStore.markSolved(bucket.exam, bucket.skill, bucket.type, q.id);
        if (transcriptEls) transcriptEls.style.display = '';
        var next = root.querySelector('[data-next]');
        if (next) next.removeAttribute('disabled');
      }
    }

    function nav() {
      var n = el('div', 'pr-nav');
      var exit = el('a', 'btn btn-wire pr-exit', '← Exit');
      exit.href = favMode ? 'account.html?tab=favorites' : (exam + '.html');
      exit.addEventListener('click', function () { if (timerId) { clearInterval(timerId); timerId = null; } });
      var btns = el('div', 'pr-navbtns');
      var last = idx === pool.length - 1;
      var nextBtn = el('button', 'btn btn-white', last ? (testMode ? 'Submit test' : 'Finish') : 'Next →');
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
      if (timerId) { clearInterval(timerId); timerId = null; }
      if (testMode) { root.innerHTML = testResult(); return; }
      root.innerHTML = '';
      var f = el('div', 'pr-finished');
      f.innerHTML =
        '<div class="fin-mark">✓</div>' +
        '<h2>Set complete</h2>' +
        '<p>You worked through ' + pool.length + ' question' + (pool.length === 1 ? '' : 's') + '.' +
        (favMode ? '' : ' They’ll stay out of your normal flow until you clear the whole pool.') + '</p>' +
        '<div class="fin-actions">' +
        (favMode
          ? '<a class="btn btn-white" href="account.html?tab=favorites">Back to saved</a>'
          : '<a class="btn btn-white" href="' + exam + '.html">Back to ' + exam.toUpperCase() + '</a>' +
            '<a class="btn btn-wire" href="practice.html' + location.search + '">Keep going</a>') +
        '</div>';
      root.appendChild(f);
    }

    function testResult() {
      var total = pool.length, correct = 0;
      pool.forEach(function (q) { if (answers[q.id]) correct++; });
      var pct = total ? Math.round(correct / total * 100) : 0;
      var rows = pool.map(function (q, i) {
        var ok = !!answers[q.id];
        var ans = q.choices ? q.choices[q.answer] : q.answer;
        return '<div class="pr-rev ' + (ok ? 'ok' : 'no') + '">' +
          '<span class="pr-rev-n">' + (i + 1) + '</span>' +
          '<div class="pr-rev-main"><div class="pr-rev-q">' + esc(shortenPrompt(q.prompt)) + '</div>' +
          '<div class="pr-rev-a">Answer: <b>' + esc(ans) + '</b>' + (q.explanation ? ' — ' + esc(q.explanation) : '') + '</div></div>' +
          '<span class="pr-rev-mark">' + (ok ? '✓' : '✗') + '</span></div>';
      }).join('');
      var sc = examScore(exam, skill, correct, total);
      return '<div class="pr-stage"><div class="pr-result">' +
        '<div class="pr-score ' + (sc.pass ? 'pass' : 'fail') + '"><span class="pct">' + esc(sc.big) + '</span>' +
        '<span class="frac">' + esc(sc.sub) + '</span></div>' +
        '<div class="pr-review">' + rows + '</div>' +
        '<div class="fin-actions">' +
        '<a class="btn btn-white" href="' + exam + '.html">Back to ' + exam.toUpperCase() + '</a>' +
        '<a class="btn btn-wire" href="practice.html' + location.search + '">Retake test</a>' +
        '</div></div></div>';
    }

    draw();
  }

  /* ===================== SAT full adaptive test =====================
   * Mirrors the real Digital SAT: two sections (Reading & Writing, then Math),
   * each split into two modules. Module 1 is a mix; Module 2 turns harder or
   * easier depending on how you did in Module 1 (module-level adaptivity).
   * Scored on the 400–1600 scale (200–800 per section). Built from whatever
   * SAT questions are in the bank — module sizes shrink to fit a small pool. */
  function renderAdaptiveSAT(root) {
    document.body.classList.add('ws-white');

    var SECTIONS = [
      { key: 'english', name: 'Reading & Writing', size: 27, minutes: 32 },
      { key: 'math',    name: 'Math',              size: 22, minutes: 35 }
    ];
    // keep only sections that actually have questions
    SECTIONS = SECTIONS.filter(function (s) { return BeaconStore.questionsFor('sat', s.key, null).length > 0; });
    if (!SECTIONS.length) {
      root.innerHTML = errorCard('The adaptive test isn’t ready yet.', 'Add some SAT questions in the admin panel, then this test builds itself from them.');
      return;
    }

    var results = [];      // { name, correct, total, path, scaled }
    var si = 0;            // section index

    intro();

    function intro() {
      root.innerHTML = '';
      var c = el('div', 'pr-stage');
      var card = el('div', 'pr-card');
      card.innerHTML =
        '<span class="pr-kicker">SAT · full adaptive test</span>' +
        '<h2 class="pr-prompt" style="margin-top:8px">Full adaptive SAT</h2>' +
        '<div class="pr-passage" style="border:0;padding-left:0">' +
          'Just like the real Digital SAT: <b>Reading &amp; Writing</b> first, then <b>Math</b>, each in <b>two modules</b>. ' +
          'Module&nbsp;2 gets <b>harder or easier</b> depending on how you do in Module&nbsp;1. No feedback until the end — ' +
          'you’re scored on the <b>400–1600</b> scale.' +
          '<br><br>The official test is 98 questions (54 R&amp;W + 44 Math) in 2h14m. This one is built from the ' +
          'questions currently in the bank, so it may be shorter — the structure and scoring work the same.' +
        '</div>' +
        '<div class="pr-nav"><a class="btn btn-wire pr-exit" href="sat.html">← Back</a>' +
        '<div class="pr-navbtns"><button type="button" class="btn btn-white" id="ad-start">Start the test →</button></div></div>';
      c.appendChild(card); root.appendChild(c);
      document.getElementById('ad-start').onclick = function () { si = 0; runSection(); };
    }

    // ---- run one section (two adaptive modules) ----
    function runSection() {
      var sec = SECTIONS[si];
      var full = shuffle(BeaconStore.questionsFor('sat', sec.key, null).slice());
      var half = Math.max(1, Math.min(sec.size, Math.ceil(full.length / 2)));

      var mod1 = full.slice(0, half);
      var rest = full.slice(half);
      var secState = { correct: 0, total: 0, answers: {} };

      runModule(sec, 1, mod1, secState, function (pct1) {
        var path = pct1 >= 0.6 ? 'hard' : 'easy';
        // Module 2: prefer the target difficulty, then fill from the rest.
        var pref = rest.filter(function (q) { return (q.difficulty || 'medium') === (path === 'hard' ? 'hard' : 'easy'); });
        var others = rest.filter(function (q) { return pref.indexOf(q) === -1; });
        var mod2 = pref.concat(others).slice(0, Math.min(sec.size, rest.length));
        if (!mod2.length) { mod2 = rest.slice(0, Math.min(sec.size, rest.length)); }

        var afterM2 = function () {
          var scaled = scaleSection(secState.correct, secState.total, path);
          results.push({ name: sec.name, correct: secState.correct, total: secState.total, path: path, scaled: scaled });
          si++;
          if (si < SECTIONS.length) sectionBreak(); else finishAll();
        };

        if (!mod2.length) { afterM2(); return; }
        transition('Module 1 complete', 'Starting Module&nbsp;2 — it has adapted to your Module&nbsp;1 answers. No going back now.', function () {
          runModule(sec, 2, mod2, secState, function () { afterM2(); });
        });
      });
    }

    // ---- run one module, real-exam style: a countdown, free navigation
    //      (Back / Next / jump to any question), and a selection you can change ----
    function runModule(sec, moduleNo, qs_, secState, onModuleDone) {
      if (!qs_.length) { onModuleDone(0); return; }
      var picked = {};            // qid -> chosen choice index (persists, changeable)
      var idx = 0;
      var remaining = Math.round(sec.minutes * 60 * (qs_.length / sec.size));
      if (remaining < 30) remaining = qs_.length * 45;
      var timerId = setInterval(function () {
        remaining--;
        var t = root.querySelector('.pr-timer');
        if (t) { t.textContent = '⏱ ' + fmtTime(remaining); if (remaining <= 60) t.classList.add('low'); }
        if (remaining <= 0) { clearInterval(timerId); timerId = null; endModule(); }
      }, 1000);

      draw();

      function draw() {
        var q = qs_[idx];
        root.innerHTML = '';

        // exam top bar: section + module, timer, exit
        var top = el('div', 'pr-exam-top');
        top.innerHTML =
          '<span class="pr-exam-sec">SAT · ' + esc(sec.name) + ' — Module ' + moduleNo + ' of 2</span>' +
          '<span class="pr-timer">⏱ ' + fmtTime(remaining) + (remaining <= 60 ? '' : '') + '</span>' +
          '<a class="pr-exit-x" href="sat.html" title="Leave the test">Exit ✕</a>';
        top.querySelector('.pr-exit-x').addEventListener('click', function () { if (timerId) { clearInterval(timerId); timerId = null; } });
        root.appendChild(top);

        var stage = el('div', 'pr-stage');
        var card = el('div', 'pr-card');
        card.innerHTML = '<span class="pr-kicker">Question ' + (idx + 1) + ' of ' + qs_.length + '</span>';
        if (q.passage) card.appendChild(el('div', 'pr-passage', esc(q.passage)));
        if (q.image) { var fig = el('div', 'pr-image'); fig.innerHTML = '<img src="' + esc(q.image) + '" alt="Question image" loading="lazy">'; card.appendChild(fig); }
        card.appendChild(el('div', 'pr-prompt', esc(q.prompt)));

        // choices: highlight the current pick; clicking (re)selects — no reveal
        var wrap = el('div', 'pr-choices');
        (q.choices || []).forEach(function (choice, i) {
          var btn = el('button', 'pr-choice' + (picked[q.id] === i ? ' picked' : ''));
          btn.type = 'button';
          btn.innerHTML = '<span class="mark">' + String.fromCharCode(65 + i) + '</span><span>' + esc(choice) + '</span>';
          btn.addEventListener('click', function () {
            picked[q.id] = i;
            wrap.querySelectorAll('.pr-choice').forEach(function (k) { k.classList.remove('picked'); });
            btn.classList.add('picked');
          });
          wrap.appendChild(btn);
        });
        card.appendChild(wrap);
        stage.appendChild(card);
        root.appendChild(stage);

        // nav row: Back | Next / Review
        var n = el('div', 'pr-nav');
        var back = el('button', 'btn btn-wire', '← Back'); back.type = 'button';
        if (idx === 0) back.setAttribute('disabled', '');
        back.addEventListener('click', function () { if (idx > 0) { idx--; draw(); } });
        var btns = el('div', 'pr-navbtns');
        var last = idx === qs_.length - 1;
        var nextBtn = el('button', 'btn btn-white', last ? 'Review & submit' : 'Next →'); nextBtn.type = 'button';
        nextBtn.addEventListener('click', function () { if (last) { review(); } else { idx++; draw(); } });
        btns.appendChild(nextBtn);
        n.appendChild(back); n.appendChild(btns);
        root.appendChild(n);

        // question palette — jump to any question; shows answered vs current
        root.appendChild(palette(false));
      }

      function palette(inReview) {
        var p = el('div', 'pr-palette');
        var answered = qs_.filter(function (q) { return picked[q.id] != null; }).length;
        p.appendChild(el('div', 'pr-palette-label', 'Answered ' + answered + ' / ' + qs_.length + ' · tap a number to jump'));
        var grid = el('div', 'pr-palette-grid');
        qs_.forEach(function (q, i) {
          var b = el('button', 'pr-dot' + (!inReview && i === idx ? ' current' : '') + (picked[q.id] != null ? ' done' : ''));
          b.type = 'button'; b.textContent = i + 1;
          b.addEventListener('click', function () { idx = i; draw(); });
          grid.appendChild(b);
        });
        p.appendChild(grid);
        return p;
      }

      function review() {
        var un = qs_.filter(function (q) { return picked[q.id] == null; }).length;
        root.innerHTML = '';
        var top = el('div', 'pr-exam-top');
        top.innerHTML =
          '<span class="pr-exam-sec">SAT · ' + esc(sec.name) + ' — Module ' + moduleNo + ' review</span>' +
          '<span class="pr-timer">⏱ ' + fmtTime(remaining) + '</span><span></span>';
        root.appendChild(top);
        var stage = el('div', 'pr-stage');
        var card = el('div', 'pr-card');
        card.innerHTML =
          '<span class="pr-kicker">Before you submit</span>' +
          '<h2 class="pr-prompt" style="margin-top:8px">Module ' + moduleNo + ' review</h2>' +
          '<div class="pr-passage" style="border:0;padding-left:0">You answered <b>' + (qs_.length - un) + '</b> of <b>' + qs_.length + '</b>. ' +
          (un ? 'Still unanswered: <b>' + un + '</b> — tap a number below to go back.' : 'All answered. You can still change any answer before submitting.') +
          ' Once you submit, this module locks and Module 2 adapts to it.</div>';
        card.appendChild(palette(true));
        stage.appendChild(card); root.appendChild(stage);
        var n = el('div', 'pr-nav');
        var backBtn = el('button', 'btn btn-wire', '← Keep working'); backBtn.type = 'button';
        backBtn.addEventListener('click', function () { draw(); });
        var btns = el('div', 'pr-navbtns');
        var submit = el('button', 'btn btn-white', 'Submit module →'); submit.type = 'button';
        submit.addEventListener('click', function () { endModule(); });
        btns.appendChild(submit);
        n.appendChild(backBtn); n.appendChild(btns);
        root.appendChild(n);
      }

      function endModule() {
        if (timerId) { clearInterval(timerId); timerId = null; }
        var mc = 0;
        qs_.forEach(function (q) { if (picked[q.id] === q.answer) mc++; });
        secState.correct += mc;
        secState.total += qs_.length;
        onModuleDone(qs_.length ? mc / qs_.length : 0);
      }
    }

    // ---- a plain "continue" screen between modules / sections ----
    function transition(title, body, go) {
      root.innerHTML = '';
      var c = el('div', 'pr-stage');
      var card = el('div', 'pr-card');
      card.innerHTML =
        '<span class="pr-kicker">SAT · adaptive</span>' +
        '<h2 class="pr-prompt" style="margin-top:8px">' + esc(title) + '</h2>' +
        '<div class="pr-passage" style="border:0;padding-left:0">' + body + '</div>' +
        '<div class="pr-nav"><span></span><div class="pr-navbtns"><button type="button" class="btn btn-white" id="ad-go">Continue →</button></div></div>';
      c.appendChild(card); root.appendChild(c);
      document.getElementById('ad-go').onclick = go;
    }

    function sectionBreak() {
      var next = SECTIONS[si];
      transition('Section complete', 'Take a breath — on the real SAT there’s a 10-minute break here. Next up: <b>' + esc(next.name) + '</b>.', function () { runSection(); });
    }

    // ---- scoring ----
    function scaleSection(correct, total, path) {
      var frac = total ? correct / total : 0;
      // hard path can reach 800; easy path (easier Module 2) caps lower, like the real test
      var scaled = path === 'easy' ? 200 + frac * 400 : 200 + frac * 600;
      scaled = Math.round(scaled / 10) * 10;
      return Math.max(200, Math.min(800, scaled));
    }

    function finishAll() {
      var totalScore = 0, allCorrect = 0, allTotal = 0, reviews = [];
      results.forEach(function (r) {
        totalScore += r.scaled; allCorrect += r.correct; allTotal += r.total;
      });
      var secRows = results.map(function (r) {
        return '<div class="pr-rev ok"><span class="pr-rev-n">' + esc(r.name.split(' ')[0]) + '</span>' +
          '<div class="pr-rev-main"><div class="pr-rev-q">' + esc(r.name) + '</div>' +
          '<div class="pr-rev-a"><b>' + r.scaled + '</b> / 800 · ' + r.correct + '/' + r.total + ' correct · ' +
          (r.path === 'hard' ? 'harder' : 'easier') + ' Module 2</div></div>' +
          '<span class="pr-rev-mark">' + r.scaled + '</span></div>';
      }).join('');

      var note = results.length < 2
        ? '<div class="pr-passage" style="border:0;padding-left:0">Only the <b>' + esc(results[0].name) + '</b> section had questions, so this is a section score out of 800. Add ' +
          (results[0].name.indexOf('Math') === -1 ? 'Math' : 'Reading &amp; Writing') + ' questions to get the full 400–1600.</div>'
        : '';

      var big = results.length < 2 ? results[0].scaled : totalScore;
      var sub = results.length < 2 ? (results[0].name + ' · out of 800') : ('Digital SAT · 400–1600 scale · ' + allCorrect + ' / ' + allTotal + ' correct');
      var pass = results.length < 2 ? results[0].scaled >= 500 : totalScore >= 1000;

      root.innerHTML =
        '<div class="pr-stage"><div class="pr-result">' +
        '<div class="pr-score ' + (pass ? 'pass' : 'fail') + '"><span class="pct">' + big + '</span>' +
        '<span class="frac">' + esc(sub) + '</span></div>' +
        note +
        '<div class="pr-review">' + secRows + '</div>' +
        '<div class="pr-passage" style="border:0;padding-left:0;font-size:.9rem;color:#7c88a3">This score is an estimate from your answers and which Module 2 you unlocked — a study guide, not an official SAT score.</div>' +
        '<div class="fin-actions">' +
        '<a class="btn btn-white" href="sat.html">Back to SAT</a>' +
        '<a class="btn btn-wire" href="practice.html?mode=adaptive&exam=sat">Retake test</a>' +
        '</div></div></div>';
    }
  }

  function bar(idx, total, crumb, remaining) {
    var b = el('div', 'pr-bar');
    var pct = total ? Math.round(((idx) / total) * 100) : 0;
    b.innerHTML =
      '<div class="pr-bar-inner">' +
      '<span class="pr-crumb">' + esc(crumb) + '</span>' +
      '<div class="pr-progress-wrap"><div class="pr-progress-track"><div class="pr-progress-fill" style="width:' + pct + '%"></div></div></div>' +
      '<span class="pr-count">' + (idx + 1) + ' / ' + total + '</span>' +
      (remaining != null ? '<span class="pr-timer">⏱ ' + fmtTime(remaining) + '</span>' : '') +
      '</div>';
    return b;
  }

  function choiceBlock(q, feedback, done, reveal) {
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
        if (reveal) {
          btn.classList.add(correct ? 'correct' : 'wrong');
          if (!correct) kids[q.answer].classList.add('correct');
          showFeedback(feedback, correct, q.explanation);
        } else {
          btn.classList.add('picked');
        }
        done(correct);
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function clozeBlock(q, feedback, done, reveal) {
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
    var check = el('button', 'btn btn-navy', 'Check');
    check.type = 'button';
    check.addEventListener('click', function () {
      if (wrap.dataset.done) return;
      wrap.dataset.done = '1';
      var allCorrect = true;
      inputs.forEach(function (inp) {
        var ok = inp.value.trim().toLowerCase() === inp.dataset.answer;
        if (!ok) allCorrect = false;
        inp.readOnly = true;
        if (reveal) {
          inp.classList.add(ok ? 'correct' : 'wrong');
          if (!ok) inp.title = 'Answer: ' + inp.dataset.answer;
        }
      });
      check.style.display = 'none';
      if (reveal) showFeedback(feedback, allCorrect, q.explanation);
      done(allCorrect);
    });
    actions.appendChild(check);
    wrap.appendChild(actions);
    return wrap;
  }

  function textBlock(q, feedback, done, reveal) {
    var wrap = el('div');
    var row = el('div', 'pr-textrow');
    var inp = document.createElement('input');
    inp.className = 'pr-textin'; inp.type = 'text'; inp.placeholder = 'Type your answer';
    var check = el('button', 'btn btn-navy', 'Check'); check.type = 'button';
    row.appendChild(inp); row.appendChild(check);
    wrap.appendChild(row);
    var accept = [q.answer].concat(q.accept || []).map(function (s) { return String(s).trim().toLowerCase(); });
    check.addEventListener('click', function () {
      if (wrap.dataset.done) return;
      wrap.dataset.done = '1';
      var ok = accept.indexOf(inp.value.trim().toLowerCase()) !== -1;
      inp.readOnly = true;
      check.style.display = 'none';
      if (reveal) { inp.classList.add(ok ? 'correct' : 'wrong'); showFeedback(feedback, ok, q.explanation || ('Answer: ' + q.answer)); }
      done(ok);
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
      '<div class="fin-actions"><a class="btn btn-white" href="index.html">Home</a></div></div>';
  }
  function clearedCard(b) {
    return '<div class="pr-finished"><div class="fin-mark">✓</div>' +
      '<h2>You’ve cleared this set</h2>' +
      '<p>You’ve solved every question here. New questions are added over time — or reset to run through them again.</p>' +
      '<div class="fin-actions">' +
      '<button class="btn btn-white" data-reset>Reset and redo</button>' +
      '<a class="btn btn-wire" href="' + b.exam + '.html">Back to ' + b.exam.toUpperCase() + '</a>' +
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
  function fmtTime(s) { if (s < 0) s = 0; var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  function shortenPrompt(s) { s = String(s || ''); return s.length > 90 ? s.slice(0, 90) + '…' : s; }

  // IELTS raw%->band curve (approximates the Academic Reading/Listening tables)
  function ieltsBand(pct) {
    var t = [[97, 9], [92, 8.5], [85, 8], [81, 7.5], [75, 7], [65, 6.5], [57, 6], [50, 5.5], [40, 5], [32, 4.5], [25, 4], [18, 3.5]];
    for (var i = 0; i < t.length; i++) { if (pct >= t[i][0]) return t[i][1]; }
    return 3;
  }
  // Turn a correct-count into the score that exam actually reports for one section.
  function examScore(exam, skill, correct, total) {
    var pct = total ? Math.round(correct / total * 100) : 0;
    var label = skill === 'listening' ? 'Listening' : (skill === 'reading' ? 'Reading' : skill);
    if (exam === 'ielts') {
      var b = ieltsBand(pct);
      return { big: b.toFixed(1), sub: 'IELTS ' + label + ' band · ' + correct + ' / ' + total + ' correct', pass: b >= 6 };
    }
    if (exam === 'toefl') {
      var s6 = Math.round((1 + pct / 100 * 5) * 2) / 2; // 1.0–6.0, rounded to nearest 0.5
      return { big: s6.toFixed(1), sub: 'TOEFL ' + label + ' · out of 6 · ' + correct + ' / ' + total + ' correct', pass: s6 >= 4 };
    }
    return { big: pct + '%', sub: correct + ' / ' + total + ' correct', pass: pct >= 60 };
  }

  /* ============================ exports + autorun ============================ */
  window.BeaconStore = BeaconStore;
  window.renderWorkspace = renderWorkspace;
  window.renderPractice = renderPractice;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('practice')) renderPractice('#practice');
  });
})();
