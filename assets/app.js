/* Beacon - workspace + practice engine (client-side, no backend).
 *
 * Responsibilities:
 *   - BeaconStore: localStorage-backed bank of questions, favorites, solved
 *     progress and webinars. Ships with a starter content bank; admins add more.
 *   - renderWorkspace(sel, config): the "working" exam pages (TOEFL, SAT) - a
 *     calm, predictable list of skills -> question types, no marketing.
 *   - practice.html: a focused one-question-at-a-time runner with instant
 *     checking, explanations, favorites, and the "solved stays out of the flow
 *     until the pool is cleared" rule.
 *
 * Content note: audio for Listening is a placeholder until an admin uploads
 * real files - the transcript stands in so the questions are still answerable.
 */
(function () {
  'use strict';

  var STORE_KEY = 'beacon:store:v1';

  /* ============================ starter content ============================ */
  /* Types: 'choice' (multiple choice / best response / T-F-NG rendered as choice),
     'cloze' (complete the words - fill missing letters). */
  function Q(o) { return o; }
  var CONTENT = [
    /* ---------------- IELTS · Reading - sample full tests (passage sets) ---------------- */
    Q({ id:'i-r-full-easy', exam:'ielts', skill:'reading', type:'full-passage', format:'passage', difficulty:'easy',
      title:'The Honey Bee',
      passage:"The Honey Bee\n\nHoney bees are among the most important insects on Earth. They live together in large groups called colonies, and a single hive can hold as many as sixty thousand bees during the summer months. Each colony works as one team, and every bee has a job to do.\n\nThere are three kinds of bee in a colony. The queen is the largest bee, and there is only one queen in each hive. Her single task is to lay eggs - on a good day she can lay up to two thousand of them. The male bees are called drones. They do no work in the hive; their only role is to mate with a new queen. The vast majority of the colony is made up of female worker bees. Workers clean the hive, feed the young, guard the entrance and, most famously, collect nectar from flowers to make honey.\n\nWhen a worker finds a good source of food, she flies back to the hive and tells the others where it is. She does this by performing a special movement known as the waggle dance. The direction of the dance shows the direction of the flowers, and the length of the dance shows how far away they are. In this way, thousands of bees can be guided to the same field of flowers.\n\nBees make honey from nectar, a sweet liquid produced by flowers. A worker sucks up the nectar and stores it in a special stomach. Back at the hive, the nectar is passed from bee to bee and slowly loses its water until it becomes thick honey. The bees store the honey in wax cells and seal it so that it will keep for the winter, when no flowers are in bloom.\n\nAs they move from flower to flower, bees also carry a fine yellow powder called pollen on their bodies. Without meaning to, they spread this pollen from one plant to another. This process, called pollination, allows the plants to produce seeds and fruit. Many of the fruits and vegetables that people eat every day depend on bees, which is why scientists are so worried about the recent fall in bee numbers around the world.",
      blocks:[
        { kind:'choice', prompt:'Questions 1–4 - Choose the correct letter, A, B, C or D.', items:[
          { prompt:'A single hive can hold as many as', choices:['six thousand bees','sixteen thousand bees','sixty thousand bees','six hundred thousand bees'], answer:2 },
          { prompt:'The only job of the queen bee is to', choices:['guard the hive','lay eggs','collect nectar','clean the cells'], answer:1 },
          { prompt:'Drones are bees that', choices:['clean the hive','make the honey','mate with a new queen','feed the young'], answer:2 },
          { prompt:'The waggle dance tells the other bees', choices:['when winter is coming','where the flowers are','which bee is the queen','how to make wax'], answer:1 } ]},
        { kind:'completion', prompt:'Questions 5–9 - Complete the sentences with ONE word from the text.', items:[
          { prompt:'Most of the bees in a colony are female ______ bees.', answer:'worker' },
          { prompt:'A worker stores nectar in a special ______ inside her body.', answer:'stomach' },
          { prompt:'Honey is stored and sealed in cells made of ______.', answer:'wax' },
          { prompt:'Bees carry a yellow powder called ______ from flower to flower.', answer:'pollen' },
          { prompt:'The spreading of this powder between plants is called ______.', answer:'pollination' } ]},
        { kind:'matching', prompt:'Questions 10–13 - Match each description with the correct bee. Choose A, B or C.  A Queen · B Drone · C Worker.', options:['Queen','Drone','Worker'], items:[
          { prompt:'lays all the eggs in the hive', answer:'Queen' },
          { prompt:'mates with a new queen but does no work', answer:'Drone' },
          { prompt:'collects nectar and guards the entrance', answer:'Worker' },
          { prompt:'there is only one of these in a colony', answer:'Queen' } ]}
      ] }),
    Q({ id:'i-r-full-medium', exam:'ielts', skill:'reading', type:'full-passage', format:'passage', difficulty:'medium',
      title:'The Printing Press',
      passage:"The Printing Press\n\nA. Before the middle of the fifteenth century, almost every book in Europe was written out by hand. This work was usually done by monks, who could spend months or even years copying a single volume. Because each book took so long to produce, books were extremely rare and expensive. Only the very rich, the church and a handful of universities owned more than a few of them, and most ordinary people never held a book in their lives.\n\nB. This situation changed dramatically thanks to a German craftsman named Johannes Gutenberg. Around 1440, in the city of Mainz, Gutenberg developed a printing press that used movable type. Instead of carving a whole page from a single block of wood, he made small metal pieces, each carrying one letter. These pieces could be arranged to form any page, locked into a frame, covered with ink and pressed onto paper. When the page was finished, the letters could be taken apart and used again for a completely different text.\n\nC. The effect of this invention was enormous. A single press could produce hundreds of copies of a book in the time it had once taken to copy one by hand. The price of books fell quickly, and for the first time ordinary merchants and craftsmen could afford to own them. Gutenberg's most famous product, a printed Bible completed around 1455, showed that printed books could be just as beautiful as handwritten ones.\n\nD. As presses spread across Europe, the number of books grew at an astonishing rate. Historians estimate that by the year 1500 - less than fifty years after Gutenberg - more than twenty million books had been printed. New ideas could now travel faster and further than ever before. Scientists in different countries could read one another's work, and discoveries were shared and built upon instead of being lost.\n\nE. The printing press also changed society in ways Gutenberg could never have imagined. As books became cheap and common, more and more people learned to read, and levels of literacy rose steadily. Ideas that governments and churches disliked were now almost impossible to stop, because they could be printed and copied endlessly.",
      blocks:[
        { kind:'matching', prompt:'Questions 1–5 - Which paragraph (A–E) contains the following information?', options:['A','B','C','D','E'], items:[
          { prompt:'an estimate of how many books existed by 1500', answer:'D' },
          { prompt:'a description of who copied books before printing', answer:'A' },
          { prompt:'the effect of printing on how many people could read', answer:'E' },
          { prompt:'an explanation of how the metal type could be reused', answer:'B' },
          { prompt:'a mention of Gutenberg’s most famous printed work', answer:'C' } ]},
        { kind:'choice', prompt:'Questions 6–9 - Choose the correct letter, A, B, C or D.', items:[
          { prompt:'Before printing, most books in Europe were', choices:['printed in Mainz','written out by hand','owned by merchants','made of metal'], answer:1 },
          { prompt:'Gutenberg’s movable type was made of', choices:['wood','metal','paper','stone'], answer:1 },
          { prompt:'Gutenberg developed his press in about', choices:['1350','1440','1500','1600'], answer:1 },
          { prompt:'According to the text, one result of printing was that ideas', choices:['were easily stopped','stayed within one country','spread faster and further','became more expensive'], answer:2 } ]},
        { kind:'completion', prompt:'Questions 10–13 - Complete the sentences with ONE word from the text.', items:[
          { prompt:'Before printing, books were usually copied by ______.', answer:'monks' },
          { prompt:'Gutenberg worked in the German city of ______.', answer:'Mainz' },
          { prompt:'Each small metal piece carried a single ______.', answer:'letter' },
          { prompt:'As books became cheaper, levels of ______ rose steadily.', answer:'literacy' } ]}
      ] }),
    Q({ id:'i-r-full-hard', exam:'ielts', skill:'reading', type:'full-passage', format:'passage', difficulty:'hard',
      title:'Mapping the World',
      passage:"Mapping the World\n\nFor most of human history, maps were as much works of imagination as records of fact. Early mapmakers filled the blank spaces beyond the known world with sea monsters, mythical kingdoms and warnings that 'here be dragons'. A map was often a statement of belief - about where paradise lay, or where the centre of the world could be found - rather than an accurate guide for a traveller.\n\nThe first great step towards scientific cartography was the realisation that the Earth is a sphere. In the third century BC, the Greek scholar Eratosthenes, working at the famous Library of Alexandria in Egypt, went further still. By comparing the length of shadows in two different cities on the same day, he calculated the circumference of the Earth. His result was remarkably close to the figure accepted today, an extraordinary achievement for a man with no instruments beyond sticks and a knowledge of geometry.\n\nSeveral centuries later, the astronomer Ptolemy set out a system of lines of latitude and longitude that allowed any place to be described by a pair of coordinates. Although much of the geographical detail in Ptolemy's work was inaccurate, the framework he created proved so useful that it still underlies our modern system of time zones and satellite navigation.\n\nThe next revolution came in the sixteenth century, when the Flemish mapmaker Gerardus Mercator devised a new way of drawing the round Earth on a flat sheet of paper. On a Mercator map, a straight line represents a constant compass bearing, which made the map invaluable to sailors plotting a long voyage. The price of this convenience, however, was serious distortion: lands far from the equator, such as Greenland, appear vastly larger than they really are.\n\nBy the eighteenth century, governments had begun to see accurate maps as a matter of national importance. In France, four generations of the Cassini family devoted themselves to surveying the entire country, measuring it triangle by triangle with painstaking care. Their work, completed after the Revolution, made France the first nation to be mapped completely by scientific methods.\n\nToday the mapmaker's vision is no longer limited to what the human eye can see. Radar, which bounces microwave signals off a surface, can peer through cloud and forest and has even produced the first maps of the mountains of Venus. Combined with sonar, it has charted much of the ocean floor for the first time. Above all, satellites now fix any point on the planet to within a few centimetres, so that modern surveyors rarely work without them.",
      blocks:[
        { kind:'choice', prompt:'Questions 1–4 - Choose the correct letter, A, B, C or D.', items:[
          { prompt:'The writer says that early maps were often', choices:['perfectly accurate','statements of belief as much as fact','drawn only by sailors','made using instruments'], answer:1 },
          { prompt:'Eratosthenes calculated the size of the Earth by studying', choices:['the movement of ships','shadows in two cities','the mountains of Venus','lines of longitude'], answer:1 },
          { prompt:'The main disadvantage of a Mercator map is that it', choices:['cannot show the sea','distorts the size of distant lands','has no compass bearings','was too expensive for sailors'], answer:1 },
          { prompt:'France was the first country to be', choices:['drawn on a Mercator map','mapped completely by scientific methods','measured using radar','described by Ptolemy'], answer:1 } ]},
        { kind:'matching', prompt:'Questions 5–9 - Match each achievement with the correct person or tool. Choose from A–E.  A Eratosthenes · B Ptolemy · C Mercator · D the Cassini family · E Radar.', options:['Eratosthenes','Ptolemy','Mercator','The Cassini family','Radar'], items:[
          { prompt:'created a system of latitude and longitude', answer:'Ptolemy' },
          { prompt:'measured the circumference of the Earth', answer:'Eratosthenes' },
          { prompt:'allowed sailors to follow a constant compass bearing', answer:'Mercator' },
          { prompt:'surveyed the whole of France over four generations', answer:'The Cassini family' },
          { prompt:'produced the first maps of the mountains of Venus', answer:'Radar' } ]},
        { kind:'completion', prompt:'Questions 10–13 - Complete the sentences with ONE word from the text.', items:[
          { prompt:'Eratosthenes worked at the Library of ______.', answer:'Alexandria' },
          { prompt:'On a Mercator map, ______ appears far larger than it really is.', answer:'Greenland' },
          { prompt:'Radar works by bouncing ______ signals off a surface.', answer:'microwave' },
          { prompt:'Modern surveyors now rarely work without ______.', answer:'satellites' } ]}
      ] }),

    /* ---------------- TOEFL · Reading - Read in Daily Life (emails, texts, notices) ---------------- */
    Q({ id:'t-r-dl-1', exam:'toefl', skill:'reading', type:'daily-life', difficulty:'easy',
      letterKind:'email', letterFrom:'Prof. Alvarez', letterSubject:'Room change for Thursday\'s seminar',
      passage:'Hi all - Thursday\'s seminar has been moved from Room 204 to the Media Lab (Room 118) because of a scheduling conflict. Same time, 2:00 PM. Let me know if this is a problem for anyone.',
      prompt:'Why did Prof. Alvarez send this email?',
      choices:['To cancel Thursday\'s seminar','To announce a different room for the seminar','To change the seminar\'s start time','To ask students to bring a laptop'],
      answer:1, explanation:'The email says the seminar "has been moved from Room 204 to the Media Lab" - the room changed, not the time or whether it\'s happening.' }),
    Q({ id:'t-r-dl-2', exam:'toefl', skill:'reading', type:'daily-life', difficulty:'medium',
      letterKind:'message', letterFrom:'Jordan',
      passage:'Hey - I\'m at the store now. We\'re out of milk and the eggs are almost gone too. Want me to grab both, or just milk? Also, did you already pay the electric bill this month?',
      prompt:'What is the writer asking the reader to do?',
      choices:['Decide what groceries to buy and confirm about the bill','Drive to the store to help carry groceries','Pay the writer back for the electric bill','Tell the writer which store has the best prices'],
      answer:0, explanation:'The message asks two things: whether to buy just milk or milk and eggs, and whether the electric bill has been paid.' }),
    Q({ id:'t-r-dl-3', exam:'toefl', skill:'reading', type:'daily-life', difficulty:'hard',
      letterKind:'announcement', letterSubject:'Library Hours',
      passage:'Starting next Monday, the East Wing reading room will close at 9 PM instead of midnight for the rest of the semester due to reduced weekend staffing. The Main Hall remains open until midnight as usual.',
      prompt:'What is changing about the East Wing reading room?',
      choices:['It will close earlier at night.','It will close permanently.','It will open later in the morning.','It will move into the Main Hall.'],
      answer:0, explanation:'The notice says the East Wing "will close at 9 PM instead of midnight" - an earlier closing time, nothing else.' }),
    Q({ id:'t-r-dl-4', exam:'toefl', skill:'reading', type:'daily-life', difficulty:'easy',
      letterKind:'email', letterFrom:'Riverside Gym', letterSubject:'Pool schedule this weekend',
      passage:'This Saturday and Sunday the pool will open at 8 AM instead of 6 AM for annual cleaning. All other facilities are open at the usual time.',
      prompt:'What is changing this weekend?',
      choices:['The pool will open later in the morning.','The gym will be closed all weekend.','The pool will close early.','All facilities will open later.'],
      answer:0, explanation:'Only the pool\'s opening time is changing, to 8 AM instead of 6 AM - everything else is "the usual time."' }),
    Q({ id:'t-r-dl-5', exam:'toefl', skill:'reading', type:'daily-life', difficulty:'medium',
      letterKind:'message', letterFrom:'Sam',
      passage:'Hey, landlord just texted - rent goes up $40 starting next month. Still cheaper than the place across town though. You in for renewing, or should we start looking?',
      prompt:'What does Sam want to know?',
      choices:['Whether the reader wants to renew the lease','How much the place across town costs','When the landlord will call','Whether the reader has paid this month\'s rent'],
      answer:0, explanation:'Sam is asking whether to renew ("you in for renewing") or start looking elsewhere.' }),
    Q({ id:'t-r-dl-6', exam:'toefl', skill:'reading', type:'daily-life', difficulty:'hard',
      letterKind:'announcement', letterSubject:'Lot C Closure',
      passage:'Parking Lot C will be closed for resurfacing from Monday through Wednesday next week. Permit holders may use Lot D at no extra charge during this period; a shuttle runs between Lot D and campus every 15 minutes.',
      prompt:'What can permit holders for Lot C do while it is closed?',
      choices:['Park in Lot D for free and take a shuttle','Get a full refund for the week','Park anywhere on campus','Use Lot C after 6 PM only'],
      answer:0, explanation:'The notice says permit holders "may use Lot D at no extra charge," with a shuttle connecting it to campus.' }),
    Q({ id:'t-r-cw-1', exam:'toefl', skill:'reading', type:'complete-the-words', difficulty:'medium',
      prompt:'Complete the missing letters to finish each word.',
      parts:[{text:'A beacon is a light or fire set on a height to '},{stem:'gu',blank:'ide'},{text:' travellers and warn of '},{stem:'dan',blank:'ger'},{text:'.'}],
      explanation:'The full sentence: "…to guide travellers and warn of danger."' }),
    Q({ id:'t-r-cw-2', exam:'toefl', skill:'reading', type:'complete-the-words', difficulty:'easy',
      prompt:'Complete the missing letters to finish each word.',
      parts:[{text:'Migrating birds '},{stem:'nav',blank:'igate'},{text:' by the stars, using them like a natural '},{stem:'com',blank:'pass'},{text:'.'}],
      explanation:'The full sentence: "…navigate by the stars, using them like a natural compass."' }),
    Q({ id:'t-r-cw-3', exam:'toefl', skill:'reading', type:'complete-the-words', difficulty:'easy',
      prompt:'Complete the missing letters to finish each word.',
      parts:[{text:'Bees '},{stem:'poll',blank:'inate'},{text:' flowers while '},{stem:'col',blank:'lecting'},{text:' nectar.'}],
      explanation:'The full sentence: "Bees pollinate flowers while collecting nectar."' }),
    Q({ id:'t-r-cw-4', exam:'toefl', skill:'reading', type:'complete-the-words', difficulty:'medium',
      prompt:'Complete the missing letters to finish each word.',
      parts:[{text:'A volcano '},{stem:'er',blank:'upts'},{text:' when pressure from molten rock '},{stem:'ac',blank:'cumulates'},{text:' beneath the surface.'}],
      explanation:'The full sentence: "…erupts when pressure from molten rock accumulates beneath the surface."' }),
    Q({ id:'t-r-cw-5', exam:'toefl', skill:'reading', type:'complete-the-words', difficulty:'hard',
      prompt:'Complete the missing letters to finish each word.',
      parts:[{text:'Coral reefs are '},{stem:'vul',blank:'nerable'},{text:' to warming water, which can cause '},{stem:'blea',blank:'ching'},{text:' across large areas.'}],
      explanation:'The full sentence: "…vulnerable to warming water, which can cause bleaching across large areas."' }),
    Q({ id:'t-r-wt-1', exam:'toefl', skill:'reading', type:'whole-text', difficulty:'medium',
      passage:'[1] Tides are driven mainly by the Moon’s gravity. [2] The Sun contributes too, but with roughly half the effect. [3] When Sun and Moon align, their pulls combine into especially high "spring" tides. [4] When they sit at right angles, the tides are gentler.',
      prompt:'What is the main idea of the passage as a whole?',
      choices:['The Sun has no effect on tides.','Tides result from the combined gravity of the Moon and Sun.','Spring tides happen every day.','Tides are caused by ocean currents.'],
      answer:1, explanation:'Across all four sentences the passage explains tides as the combined gravitational pull of Moon and Sun.' }),
    Q({ id:'t-r-wt-2', exam:'toefl', skill:'reading', type:'whole-text', difficulty:'hard',
      passage:'[1] Early maps often left blank spaces where knowledge ran out. [2] Rather than admit ignorance, some cartographers filled these gaps with imagined coastlines. [3] Later voyages erased many of these inventions. [4] Yet a few phantom islands lingered on charts for centuries.',
      prompt:'The passage is primarily concerned with:',
      choices:['how sailors named islands','how gaps in knowledge shaped early maps','why maps are printed on paper','the cost of ocean voyages'],
      answer:1, explanation:'Every sentence returns to how missing knowledge - and guesses about it - shaped early maps.' }),
    Q({ id:'t-r-wt-3', exam:'toefl', skill:'reading', type:'whole-text', difficulty:'easy',
      passage:'[1] Leaves are green because they contain chlorophyll, used for photosynthesis. [2] In autumn, trees stop producing chlorophyll as daylight shortens. [3] As the green fades, other pigments already present in the leaf - yellows and oranges - become visible.',
      prompt:'According to the passage, why do leaves turn yellow or orange in autumn?',
      choices:['New pigments are created by the cold.','Chlorophyll production stops, revealing pigments already there.','The leaves absorb more sunlight.','Trees add extra water to the leaves.'],
      answer:1, explanation:'The passage says the yellow and orange pigments were "already present" and become visible once chlorophyll fades.' }),
    Q({ id:'t-r-wt-4', exam:'toefl', skill:'reading', type:'whole-text', difficulty:'medium',
      passage:'[1] Before the printing press, books were copied by hand, a slow and expensive process. [2] Gutenberg’s movable-type press let identical pages be produced quickly. [3] Book prices fell, and literacy spread far beyond the wealthy and the clergy.',
      prompt:'What was one major effect of the printing press described in the passage?',
      choices:['Books became more expensive.','Literacy spread beyond a small privileged group.','Handwritten copying became faster.','The clergy stopped reading books.'],
      answer:1, explanation:'The passage states that as prices fell, "literacy spread far beyond the wealthy and the clergy."' }),
    Q({ id:'t-r-wt-5', exam:'toefl', skill:'reading', type:'whole-text', difficulty:'hard',
      passage:'[1] Glaciers move slowly downhill under their own weight. [2] As they advance, embedded rocks scrape against the bedrock beneath them. [3] Over thousands of years, this carving action can widen a narrow river valley into the broad U-shaped valleys seen in many mountain ranges today.',
      prompt:'How do glaciers shape the valleys described in the passage?',
      choices:['By melting and flooding the valley floor','By carving rock with embedded debris as they move','By blocking rivers with ice dams','By depositing sand that fills the valley'],
      answer:1, explanation:'The passage describes rocks embedded in the glacier scraping the bedrock, gradually widening the valley.' }),

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
    Q({ id:'t-l-br-3', exam:'toefl', skill:'listening', type:'best-response', difficulty:'hard',
      audio:true, transcript:'Woman: "I could swear I submitted the assignment, but it’s not showing up in the system."',
      prompt:'Choose the best response.',
      choices:['"Try emailing the professor a copy with a timestamp."','"The system is painted blue."','"Congratulations on submitting early!"','"I haven’t started mine yet."'],
      answer:0, explanation:'She has a practical problem (a missing submission); the helpful, on-topic reply suggests a way to prove it was done.' }),
    Q({ id:'t-l-br-4', exam:'toefl', skill:'listening', type:'best-response', difficulty:'easy',
      audio:true, transcript:'Man: "Thanks so much for covering my shift yesterday."',
      prompt:'Choose the best response.',
      choices:['"No problem, happy to help."','"The shift starts at nine."','"I don’t work here."','"See you never."'],
      answer:0, explanation:'He is thanking her; the natural reply accepts the thanks warmly.' }),
    Q({ id:'t-l-br-5', exam:'toefl', skill:'listening', type:'best-response', difficulty:'medium',
      audio:true, transcript:'Woman: "Is this seat taken, or can I sit here for the lecture?"',
      prompt:'Choose the best response.',
      choices:['"Go ahead, it’s free."','"The lecture is two hours long."','"I already have a seat."','"Sorry, I don’t know this professor."'],
      answer:0, explanation:'She is asking permission to sit; the direct, relevant answer grants or addresses that request.' }),
    Q({ id:'t-l-dl-1', exam:'toefl', skill:'listening', type:'dialogues', difficulty:'medium',
      audio:true, transcript:'Student: "I’d like to drop the Tuesday lab and switch to Friday." Advisor: "Friday’s full, but I can put you on the waitlist - you’re second in line."',
      prompt:'What does the advisor offer the student?',
      choices:['A guaranteed Friday spot','A place on the waitlist','A refund for the lab','A different professor'],
      answer:1, explanation:'The advisor says Friday is full but offers the waitlist, second in line.' }),
    Q({ id:'t-l-dl-2', exam:'toefl', skill:'listening', type:'dialogues', difficulty:'easy',
      audio:true, transcript:'Librarian: "This book is reference-only, so it can’t leave the building." Student: "Could I at least photocopy a few pages?" Librarian: "Of course - the copier’s just around the corner."',
      prompt:'What does the student want to do?',
      choices:['Borrow the book overnight','Copy a few pages','Buy the book','Return a late book'],
      answer:1, explanation:'The student asks to photocopy a few pages once told the book cannot be borrowed.' }),
    Q({ id:'t-l-dl-3', exam:'toefl', skill:'listening', type:'dialogues', difficulty:'hard',
      audio:true, transcript:'Student: "My scholarship renewal needs a form signed by my advisor, but she’s away until next week." Clerk: "Bring it in as soon as she’s back - the deadline has a five-day grace period for exactly this kind of thing."',
      prompt:'What does the clerk tell the student about the deadline?',
      choices:['It cannot be extended for any reason.','There is a five-day grace period for cases like this.','The scholarship has already been cancelled.','The advisor must sign it today.'],
      answer:1, explanation:'The clerk explains a five-day grace period exists specifically for situations like the student\'s.' }),
    Q({ id:'t-l-dl-4', exam:'toefl', skill:'listening', type:'dialogues', difficulty:'medium',
      audio:true, transcript:'Student: "Is the computer lab open on weekends?" Staff: "Yes, but only until 6 PM on Saturdays, and it’s closed Sundays."',
      prompt:'When is the computer lab closed?',
      choices:['All weekend','Saturday mornings only','Sundays','Every evening'],
      answer:2, explanation:'The staff member says it is open Saturday until 6 PM but "closed Sundays."' }),
    Q({ id:'t-l-dl-5', exam:'toefl', skill:'listening', type:'dialogues', difficulty:'easy',
      audio:true, transcript:'Student: "Do you sell notebooks here?" Cashier: "Yes, they’re on the shelf right behind you."',
      prompt:'What is the student looking for?',
      choices:['Notebooks','Pens','A cashier','A shelf'],
      answer:0, explanation:'The student directly asks whether the shop sells notebooks.' }),
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
    Q({ id:'t-l-lec-3', exam:'toefl', skill:'listening', type:'lectures', difficulty:'easy',
      audio:true, transcript:'Professor: "Today we’ll cover the water cycle. Water evaporates from oceans and lakes, forms clouds, and eventually falls back as rain or snow."',
      prompt:'What is the lecture mainly about?',
      choices:['The water cycle','Ocean pollution','Cloud formation only','Snowfall records'],
      answer:0, explanation:'The professor introduces the topic directly: "Today we\'ll cover the water cycle."' }),
    Q({ id:'t-l-lec-4', exam:'toefl', skill:'listening', type:'lectures', difficulty:'medium',
      audio:true, transcript:'Professor: "Coral polyps get most of their color from algae living inside their tissue. When water gets too warm, the polyps expel the algae - which is what causes coral bleaching."',
      prompt:'According to the professor, what directly causes coral bleaching?',
      choices:['Polyps expelling their algae','Algae eating the coral','Cold water temperatures','A lack of sunlight'],
      answer:0, explanation:'The professor says bleaching happens because "the polyps expel the algae" that gives coral its color.' }),
    Q({ id:'t-l-lec-5', exam:'toefl', skill:'listening', type:'lectures', difficulty:'hard',
      audio:true, transcript:'Professor: "Confirmation bias is our tendency to favor information that supports what we already believe, while discounting evidence that contradicts it - even when that contradicting evidence is stronger."',
      prompt:'How does the professor describe confirmation bias?',
      choices:['Favoring supportive evidence over stronger contradicting evidence','Always believing the strongest evidence','Ignoring all evidence equally','Changing beliefs whenever new evidence appears'],
      answer:0, explanation:'The professor says we favor supporting information "even when that contradicting evidence is stronger."' }),

    /* ---------------- IELTS · Listening (real question types) ---------------- */
    Q({ id:'i-l-2', exam:'ielts', skill:'listening', type:'multiple-choice', part:2, difficulty:'medium',
      audio:true, transcript:'Guide: "The tour meets at the north gate, not the main entrance, at a quarter past nine. Please arrive five minutes early."',
      prompt:'Where does the tour meet?',
      choices:['The main entrance','The north gate','The car park','The gift shop'], answer:1,
      explanation:'The guide says the tour meets "at the north gate, not the main entrance."' }),
    Q({ id:'i-l-1', exam:'ielts', skill:'listening', type:'form-completion', part:1, difficulty:'easy', format:'text',
      audio:true, transcript:'Receptionist: "Can I take your surname?" Caller: "It’s Okafor - that’s O-K-A-F-O-R."',
      prompt:'Complete the form. Surname: ______ (type what you hear).',
      answer:'okafor', accept:['Okafor'],
      explanation:'The caller spells the surname aloud: O-K-A-F-O-R.' }),
    Q({ id:'i-l-match-1', exam:'ielts', skill:'listening', type:'matching', part:3, difficulty:'medium',
      audio:true, transcript:'Tutor: "Priya will handle the survey, Sam is writing the introduction, and Lena is preparing the slides for the presentation."',
      prompt:'Who is preparing the slides?',
      choices:['Priya','Sam','Lena','The tutor'], answer:2,
      explanation:'The tutor says "Lena is preparing the slides."' }),
    Q({ id:'i-l-map-1', exam:'ielts', skill:'listening', type:'plan-map-diagram-labelling', part:2, difficulty:'medium',
      audio:true, transcript:'Warden: "As you come through the main entrance, the café is immediately on your left, and the toilets are straight ahead, past the information desk."',
      prompt:'Coming through the main entrance, where is the café?',
      choices:['On the left','On the right','Straight ahead','Upstairs'], answer:0,
      explanation:'The warden says the café is "immediately on your left."' }),
    Q({ id:'i-l-sc-1', exam:'ielts', skill:'listening', type:'sentence-completion', part:4, difficulty:'medium', format:'text',
      audio:true, transcript:'Lecturer: "Please note the essay deadline has moved to Friday, and it must be submitted online."',
      prompt:'Complete the sentence with ONE word: "The essay must be submitted ______."',
      answer:'online', accept:[],
      explanation:'The lecturer says the essay "must be submitted online."' }),
    Q({ id:'i-l-sa-1', exam:'ielts', skill:'listening', type:'short-answer', part:1, difficulty:'easy', format:'text',
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
      answer:0, explanation:'Trips doubled and injuries fell - supporting that the lanes made cycling more popular and safer.' }),
    Q({ id:'s-e-cs-1', exam:'sat', skill:'english', type:'craft-structure', difficulty:'medium',
      passage:'Her argument was watertight, leaving her critics with nothing to grip.',
      prompt:'As used in this sentence, "watertight" most nearly means:',
      choices:['wet','flawless / airtight','waterproof clothing','confusing'],
      answer:1, explanation:'"Watertight," said of an argument, means it has no weaknesses - flawless.' }),
    Q({ id:'s-e-cs-2', exam:'sat', skill:'english', type:'craft-structure', difficulty:'easy',
      passage:'Text 1 praises solar power as clean and increasingly cheap. Text 2 warns that storing solar energy remains costly.',
      prompt:'How does Text 2 relate to Text 1?',
      choices:['It fully agrees.','It adds a practical caution.','It changes the topic.','It repeats Text 1.'],
      answer:1, explanation:'Text 2 doesn’t deny solar’s benefits; it adds a caution about storage cost.' }),
    Q({ id:'s-e-ei-1', exam:'sat', skill:'english', type:'expression-ideas', difficulty:'medium',
      passage:'The results were inconclusive. ___, the team repeated the experiment.',
      prompt:'Which transition best fits the blank?',
      choices:['However','Therefore','For example','Meanwhile'], answer:1,
      explanation:'Repeating the experiment is a consequence of inconclusive results, so "Therefore" fits.' }),
    Q({ id:'s-e-ei-2', exam:'sat', skill:'english', type:'expression-ideas', difficulty:'easy',
      passage:'Due to the fact that it rained, the game was cancelled.',
      prompt:'Choose the most concise version.',
      choices:['Due to the fact that it rained','Because it rained','On account of the raining','In light of the fact of rain'],
      answer:1, explanation:'"Because it rained" says the same thing without wordiness.' }),
    Q({ id:'s-e-sc-1', exam:'sat', skill:'english', type:'standard-conventions', difficulty:'medium',
      passage:'A student is drafting a travel journal entry about a trip through Europe.',
      prompt:'Choose the correctly punctuated sentence.',
      choices:['We visited three cities Rome, Paris, and Berlin.','We visited three cities: Rome, Paris, and Berlin.','We visited three cities; Rome, Paris, and Berlin.','We visited, three cities: Rome Paris and Berlin.'],
      answer:1, explanation:'A colon correctly introduces the list after an independent clause.' }),
    Q({ id:'s-e-sc-2', exam:'sat', skill:'english', type:'standard-conventions', difficulty:'easy',
      passage:'Each of the students ___ responsible for a project.',
      prompt:'Choose the correct verb for the blank.',
      choices:['are','is','were','be'], answer:1,
      explanation:'"Each" is singular, so it takes "is."' })
  ];

  /* ============================ store ============================ */
  function nowKey() { return STORE_KEY; }
  function normPrefs(p) {
    p = p && typeof p === 'object' ? p : {};
    if (!p.goals || typeof p.goals !== 'object') p.goals = {};
    if (!p.scores || typeof p.scores !== 'object') p.scores = {};
    return p;
  }
  var BeaconStore = {
    _data: null,
    _remote: {},   // questions loaded from Supabase (shared across everyone). Not persisted locally.
    _webRemote: {},   // webinars loaded from Supabase (shared across everyone)
    _webLoaded: false,
    _planRemote: {},  // SAT subscription plans loaded from Supabase (shared across everyone)
    _isAdmin: false,  // true when the signed-in account's email is a configured admin
    _ready: null,

    /** Merge: built-in seed + admin's locally-added + Supabase-shared questions.
     *  The built-in seed (CONTENT) is layered fresh at runtime - that way returning
     *  visitors pick up newly added seed questions instead of being stuck with an
     *  old copy that was written into localStorage on their first visit. */
    _bank: function () {
      var d = this._load();
      var hidden = d.hiddenSeed || {};
      var out = {};
      CONTENT.forEach(function (q) { if (!hidden[q.id]) out[q.id] = q; });   // always-fresh built-in seed
      Object.keys(d.questions).forEach(function (k) { out[k] = d.questions[k]; });  // admin's local adds
      var r = this._remote;
      Object.keys(r).forEach(function (k) { out[k] = r[k]; });               // Supabase-shared
      return out;
    },
    /** id set of the built-in seed, so we can keep it out of the persisted store. */
    _seedIds: function () {
      if (!this.__cids) { var m = {}; CONTENT.forEach(function (q) { m[q.id] = 1; }); this.__cids = m; }
      return this.__cids;
    },

    /** Load shared questions AND the signed-in student's progress once.
     *  Always resolves - the local seed / localStorage is the fallback. */
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
      var wP = sb.from('webinars').select('data').then(function (res) {
        if (res && !res.error && res.data) {
          res.data.forEach(function (row) { var w = row && row.data; if (w && w.id) self._webRemote[w.id] = w; });
          self._webLoaded = true;   // shared list is authoritative once it loads
        }
      }).catch(function () { /* table missing / offline: fall back to the seed */ });
      var planP = sb.from('sat_plans').select('data').then(function (res) {
        if (res && !res.error && res.data) {
          res.data.forEach(function (row) { var p = row && row.data; if (p && p.id) self._planRemote[p.id] = p; });
        }
      }).catch(function () { /* table missing / offline: no plans to show yet */ });
      this._ready = Promise.all([qP, wP, planP, this._loadProgress()]).then(function () {});
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
        self._isAdmin = (function (e) {
          e = String(e || '').toLowerCase();
          var list = (window.BEACON_ADMIN_EMAILS || []).map(function (x) { return String(x).toLowerCase(); });
          if (window.BEACON_ADMIN_EMAIL) list.push(String(window.BEACON_ADMIN_EMAIL).toLowerCase());
          return !!e && list.indexOf(e) >= 0;
        })(u.email);
        return sb.from('progress').select('*').eq('user_id', u.id).maybeSingle()
          .then(function (r) {
            var d = self._load();
            var changed = false;
            if (r && !r.error && r.data) {
              if (Array.isArray(r.data.favorites)) d.favorites = r.data.favorites;
              if (r.data.solved && typeof r.data.solved === 'object') d.solved = r.data.solved;
              if (r.data.prefs && typeof r.data.prefs === 'object') d.prefs = normPrefs(r.data.prefs);
            } else {
              changed = true; // no row yet → seed the account from this device
            }
            // seed exam goals chosen at registration (stored on the auth user) if we have none yet
            var gm = u.user_metadata && u.user_metadata.goals;
            if (gm && typeof gm === 'object' && !Object.keys(d.prefs.goals).length) { d.prefs.goals = gm; changed = true; }
            self._save();
            if (changed) self._syncUp();
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
          { user_id: self._userId, favorites: d.favorites, solved: d.solved, prefs: d.prefs, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        ).then(function () {}, function () {});
      }, 400);
    },

    // ---- exam goals + mock-test scores (shown in the profile) --------
    getGoals: function () { return this._load().prefs.goals || {}; },
    setGoals: function (goals) { var d = this._load(); d.prefs.goals = goals || {}; this._save(); this._syncUp(); },
    /** record a full-test score for an exam (keeps the last 20). `extra` can carry
     *  exam-specific detail (e.g. SAT's { rw, math } section scores) shown in the profile. */
    recordScore: function (exam, score, extra) {
      var d = this._load();
      if (!d.prefs.scores[exam]) d.prefs.scores[exam] = [];
      var entry = { score: score, at: Date.now() };
      if (extra) for (var k in extra) if (extra[k] != null) entry[k] = extra[k];
      d.prefs.scores[exam].push(entry);
      if (d.prefs.scores[exam].length > 20) d.prefs.scores[exam] = d.prefs.scores[exam].slice(-20);
      this._save(); this._syncUp();
    },
    /** every recorded score for an exam, newest first - for the profile's results history */
    scoreHistory: function (exam) {
      var arr = (this._load().prefs.scores || {})[exam] || [];
      return arr.slice().reverse();
    },
    /** average of recorded scores for an exam → { avg, count } or null */
    avgScore: function (exam) {
      var arr = (this._load().prefs.scores || {})[exam] || [];
      if (!arr.length) return null;
      var sum = 0; arr.forEach(function (s) { sum += (typeof s === 'object' ? s.score : s); });
      return { avg: sum / arr.length, count: arr.length };
    },

    _load: function () {
      if (this._data) return this._data;
      var raw;
      try { raw = JSON.parse(localStorage.getItem(nowKey())); } catch (e) { raw = null; }
      if (!raw || !raw.questions) {
        raw = { questions: {}, favorites: [], solved: {}, webinars: defaultWebinars() };
      } else {
        // migration: the built-in seed now lives in CONTENT at runtime, not in the
        // store. Drop any persisted copies of seed ids so fresh seed content always
        // wins for returning visitors (their user-added questions are untouched).
        var seed = this._seedIds();
        Object.keys(raw.questions).forEach(function (k) { if (seed[k]) delete raw.questions[k]; });
      }
      // refresh webinars for older stores that predate the dated list
      if (!raw.webinars || !raw.webinars.length || !raw.webinars[0].iso) raw.webinars = defaultWebinars();
      raw.prefs = normPrefs(raw.prefs);
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
      // "part-N" is a virtual type: it groups by the question's own q.part
      // (e.g. IELTS Listening Part 1-4) instead of matching q.type directly.
      var partMatch = /^part-(\d+)$/.exec(type || '');
      return Object.keys(bank).map(function (k) { return bank[k]; })
        .filter(function (q) {
          if (q.exam !== exam || q.skill !== skill) return false;
          if (!type || type === 'all' || type === 'random') return true;
          if (partMatch) return String(q.part) === partMatch[1];
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
      if (sb && (pw || this._isAdmin)) {
        return sb.rpc('beacon_add_question', { pass: pw || '', q: q }).then(function (res) {
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
      if (sb && (pw || this._isAdmin) && this._remote[id]) {
        return sb.rpc('beacon_delete_question', { pass: pw || '', qid: id }).then(function (res) {
          if (res.error) return { ok: false, error: res.error.message };
          delete self._remote[id];
          return { ok: true };
        });
      }
      var d = this._load();
      if (d.questions[id]) { delete d.questions[id]; }
      else if (this._seedIds()[id]) { d.hiddenSeed = d.hiddenSeed || {}; d.hiddenSeed[id] = 1; }  // hide a built-in sample
      this._save();
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
    getWebinarById: function (id) {
      var m = null;
      this.webinars().forEach(function (w) { if (w.id === id) m = w; });
      return m;
    },
    webinars: function () {
      var self = this;
      function k(w) { return w.iso || '9999-12-31'; } // newest first; undated go on top
      var rk = Object.keys(this._webRemote);
      var list = (this._webLoaded && rk.length)
        ? rk.map(function (id) { return self._webRemote[id]; })   // shared list from Supabase
        : this._load().webinars.slice();                          // seed / offline fallback
      return list.sort(function (a, b) { return k(b).localeCompare(k(a)); });
    },
    /** Add a webinar. Writes to Supabase (shared with everyone) when the admin is
     *  signed in; otherwise keeps it on this device only. Returns a Promise → {ok,error?,local?}. */
    addWebinar: function (w) {
      var self = this, sb = window.sb, pw = this._adminPw();
      if (sb && (pw || this._isAdmin)) {
        return sb.rpc('beacon_add_webinar', { pass: pw || '', w: w }).then(function (res) {
          if (res.error) return { ok: false, error: res.error.message };
          self._webRemote[w.id] = w; self._webLoaded = true;
          return { ok: true };
        });
      }
      var d = this._load(); d.webinars.unshift(w); this._save();
      return Promise.resolve({ ok: true, local: true });
    },
    removeWebinar: function (id) {
      var self = this, sb = window.sb, pw = this._adminPw();
      if (sb && (pw || this._isAdmin) && this._webRemote[id]) {
        return sb.rpc('beacon_delete_webinar', { pass: pw || '', wid: id }).then(function (res) {
          if (res.error) return { ok: false, error: res.error.message };
          delete self._webRemote[id];
          return { ok: true };
        });
      }
      var d = this._load(); d.webinars = d.webinars.filter(function (w) { return w.id !== id; }); this._save();
      return Promise.resolve({ ok: true, local: true });
    },
    /** Admin only: "book a mentor" leads students submitted from the home page. */
    listMentorRequests: function () {
      var sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_list_mentor_requests', { pass: pw || '' }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true, rows: res.data || [] };
      });
    },
    deleteMentorRequest: function (id) {
      var sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_delete_mentor_request', { pass: pw || '', rid: id }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true };
      });
    },
    setMentorContacted: function (id, contacted) {
      var sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_set_mentor_contacted', { pass: pw || '', rid: id, done: !!contacted }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true };
      });
    },

    /* =================== SAT Full Test subscription =================== */
    /** Active, public-facing plans (for the payment page), cheapest sort first. */
    satPlans: function () {
      var self = this;
      return Object.keys(this._planRemote).map(function (id) { return self._planRemote[id]; })
        .filter(function (p) { return p.active !== false; })
        .sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
    },
    /** Admin only: every plan, including disabled ones. */
    allSatPlans: function () {
      var self = this;
      return Object.keys(this._planRemote).map(function (id) { return self._planRemote[id]; })
        .sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
    },
    addSatPlan: function (p) {
      var self = this, sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_add_sat_plan', { pass: pw || '', p: p }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        self._planRemote[p.id] = p;
        return { ok: true };
      });
    },
    removeSatPlan: function (id) {
      var self = this, sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_delete_sat_plan', { pass: pw || '', pid: id }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        delete self._planRemote[id];
        return { ok: true };
      });
    },

    /** Look up a promo code without exposing the whole table. */
    checkPromo: function (code) {
      var sb = window.sb;
      code = String(code || '').trim();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      if (!code) return Promise.resolve({ ok: false, error: 'Введите промокод.' });
      return sb.rpc('beacon_check_promo', { pcode: code }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return res.data || { ok: false, error: 'Промокод не найден' };
      });
    },
    listPromos: function () {
      var sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_list_promos', { pass: pw || '' }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true, rows: res.data || [] };
      });
    },
    addPromo: function (p) {
      var sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_add_promo', { pass: pw || '', p: p }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true };
      });
    },
    removePromo: function (code) {
      var sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_delete_promo', { pass: pw || '', pcode: code }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true };
      });
    },

    /** async → ISO timestamp string the signed-in student's SAT access runs until, or null. */
    satAccessUntil: function () {
      var sb = window.sb;
      if (!sb) return Promise.resolve(null);
      return sb.auth.getSession().then(function (res) {
        var u = res && res.data && res.data.session && res.data.session.user;
        if (!u) return null;
        return sb.from('sat_access').select('access_until').eq('user_id', u.id).maybeSingle().then(function (r) {
          return (r && !r.error && r.data) ? r.data.access_until : null;
        });
      }).catch(function () { return null; });
    },
    /** async → true if the signed-in student currently has paid SAT Full Test access. */
    hasSatAccess: function () {
      return this.satAccessUntil().then(function (until) { return !!until && new Date(until) > new Date(); });
    },
    /** Admin only: grant/extend access after confirming a payment by hand. */
    grantSatAccess: function (email, days, promoCode) {
      var sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_grant_sat_access', { pass: pw || '', student_email: email, days: days, promo_code: promoCode || null }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        var d = res.data || {};
        if (d.ok === false) return { ok: false, error: d.error || 'Could not grant access.' };
        return { ok: true };
      });
    },
    revokeSatAccess: function (email) {
      var sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_revoke_sat_access', { pass: pw || '', student_email: email }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true };
      });
    },
    listSatAccess: function () {
      var sb = window.sb, pw = this._adminPw();
      if (!sb) return Promise.resolve({ ok: false, error: 'Not reachable right now.' });
      return sb.rpc('beacon_list_sat_access', { pass: pw || '' }).then(function (res) {
        if (res.error) return { ok: false, error: res.error.message };
        return { ok: true, rows: res.data || [] };
      });
    }
  };

  function defaultWebinars() {
    return [
      { id:'w1', iso:'2026-08-02T18:00', date:'Aug 02 · 6:00 PM', title:'The new TOEFL Speaking, decoded',
        desc:'What Listen-and-Repeat and the interview task actually reward - and how to rehearse for them.', url:'#', cover:'' },
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
  // like esc(), but also marks "&" to render in the clearer body font - only safe
  // to use where the result lands in text content, never inside an HTML attribute
  function escAmp(s) { return esc(s).replace(/&amp;/g, '<span class="amp">&amp;</span>'); }
  function qs(name) { var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : null; }
  /* "Read in Daily Life": an optional email/notice/message header rendered above the passage text. */
  function letterHeaderHtml(q) {
    if (!q.letterKind) return '';
    if (q.letterKind === 'email') {
      return '<div class="pr-letter pr-letter-email">' +
        (q.letterFrom ? '<div class="pr-letter-row"><span class="pr-letter-k">From</span>' + esc(q.letterFrom) + '</div>' : '') +
        (q.letterSubject ? '<div class="pr-letter-row"><span class="pr-letter-k">Subject</span>' + esc(q.letterSubject) + '</div>' : '') +
      '</div>';
    }
    if (q.letterKind === 'announcement') {
      return '<div class="pr-letter-notice"><span class="pr-letter-tag">Notice</span>' + esc(q.letterSubject || q.letterFrom || '') + '</div>';
    }
    if (q.letterKind === 'message' && q.letterFrom) {
      return '<div class="pr-letter-msg">' + esc(q.letterFrom) + '</div>';
    }
    return '';
  }
  var CHEV = '<span class="acc-chev"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span>';

  /* Reading section body: full-passage tests grouped into easy / medium / hard
   * subsections - the same accordion shell as Listening, split by difficulty. */
  function buildReadingBody(body, exam) {
    var rall = BeaconStore.allQuestions().filter(function (q) {
      return q.exam === exam && q.skill === 'reading' && q.blocks && q.blocks.length;
    });
    function rtitle(q) { var first = String(q.passage || '').split('\n').find(function (l) { return l.trim(); }) || ''; return (q.title || first).slice(0, 60) || 'Reading passage'; }
    function rcount(q) { return (q.blocks || []).reduce(function (a, b) { return a + ((b.items || []).length); }, 0); }
    var byd = { easy: [], medium: [], hard: [] };
    rall.forEach(function (q) { var d = q.difficulty || 'medium'; if (!byd[d]) d = 'medium'; byd[d].push(q); });
    var levels = [
      ['easy', 'Easy texts', 'A gentle start'],
      ['medium', 'Medium texts', 'A step up'],
      ['hard', 'Hard texts', 'Exam-level difficulty']
    ];
    levels.forEach(function (lv) {
      var list = byd[lv[0]];
      // each level is its own collapsible row - click to open the texts inside
      var acc = el('div', 'acc rd-acc rd-' + lv[0]);
      var head = el('button', 'acc-head'); head.type = 'button';
      head.innerHTML =
        '<span class="acc-title">' + esc(lv[1]) + '</span>' +
        '<span class="acc-meta"></span>' + CHEV;
      acc.appendChild(head);
      var ab = el('div', 'acc-body');
      if (!list.length) {
        var none = el('div', 'ws-item is-locked');
        none.innerHTML = '<div class="ws-item-main"><h3>Nothing here yet</h3><p>Add a ' + esc(lv[0]) + ' text in the admin.</p></div><span class="ws-count empty">-</span>';
        ab.appendChild(none);
      } else {
        list.forEach(function (q) {
          var item = el('a', 'ws-item');
          item.href = 'practice.html?one=' + encodeURIComponent(q.id) + '&ret=' + encodeURIComponent(exam + '.html#reading');
          item.innerHTML =
            '<div class="ws-item-main"><h3>' + esc(rtitle(q)) + '</h3></div>' +
            '<span class="ws-count">' + rcount(q) + ' Qs</span>' +
            '<span class="ws-go">Read →</span>';
          ab.appendChild(item);
        });
      }
      acc.appendChild(ab);
      head.addEventListener('click', function () { acc.classList.toggle('open'); });
      body.appendChild(acc);
    });
    if (rall.length) {
      var full = el('a', 'ws-item ws-item-full');
      full.href = 'practice.html?mode=readingtest&exam=' + exam + '&ret=' + encodeURIComponent(exam + '.html#reading');
      full.innerHTML =
        '<div class="ws-item-main"><h3>Take the full Reading test</h3><p>All texts back to back · 60 minutes on one clock · scored as an overall Reading band.</p></div>' +
        '<span class="ws-count">' + rall.length + ' texts</span><span class="ws-go">Start test →</span>';
      body.appendChild(full);
    }
  }

  /* ============================ workspace ============================ */
  function renderWorkspace(sel, config) {
    var root = document.querySelector(sel);
    if (!root) return;
    BeaconStore.ready().then(function () { _renderWorkspace(root, config); });
  }
  function _renderWorkspace(root, config) {
    root.innerHTML = '';
    var exam = config.examId;
    var skills = config.skills || [];

    // ---- skill tiles: the big Listening / Reading / Writing / Speaking selector ----
    var tiles = el('div', 'ws-tiles');
    var panel = el('div', 'ws-skillpanel');

    function setActive(id) {
      Array.prototype.forEach.call(tiles.children, function (t) {
        t.classList.toggle('active', t.getAttribute('data-skill') === id);
      });
      renderPanel(id);
      try { history.replaceState(null, '', '#' + id); } catch (e) {}
    }

    skills.forEach(function (skill) {
      var dev = skill.status === 'dev';
      var tile = el('button', 'ws-tile' + (dev ? ' is-dev' : ''));
      tile.type = 'button';
      tile.setAttribute('data-skill', skill.id);
      tile.innerHTML =
        '<span class="ws-tile-ico">' + skillIcon(skill.id) + '</span>' +
        '<span class="ws-tile-name">' + esc(skill.name) + '</span>' +
        '<span class="ws-tile-tag">' + (dev ? 'soon' : 'free') + '</span>';
      tile.addEventListener('click', function () { setActive(skill.id); });
      tiles.appendChild(tile);
    });

    // full-test tile sits in the same row as the skill tiles (Math / Reading & Writing),
    // styled identically, but links straight out to the full-test page instead of a panel
    if (config.fullTest) {
      var ftReady = !!config.fullTest.href;
      var ftGated = ftReady && config.fullTest.gated;
      var ftTile = el(ftReady ? 'a' : 'div', 'ws-tile' + (ftReady ? '' : ' is-dev'));
      if (ftReady) ftTile.href = config.fullTest.href;
      ftTile.title = ftGated ? 'Requires a subscription' : (config.fullTest.desc || '');
      ftTile.innerHTML =
        '<span class="ws-tile-ico">' + skillIcon('full') + '</span>' +
        '<span class="ws-tile-name">Full Test</span>' +
        '<span class="ws-tile-tag' + (ftGated ? ' ws-tag-sub' : '') + '">' + (ftGated ? 'subscription' : (ftReady ? 'new' : 'soon')) + '</span>';
      // paid full tests: check access before leaving the page, instead of
      // following the href straight away
      if (ftGated) {
        ftTile.addEventListener('click', function (e) {
          e.preventDefault();
          BeaconStore.hasSatAccess().then(function (has) {
            location.href = has ? config.fullTest.href : 'sat-pay.html';
          });
        });
      }
      tiles.appendChild(ftTile);
    }

    root.appendChild(tiles);

    // a small banner pointing at the payment page, so it's obvious a subscription
    // exists even before anyone clicks the (locked) Full Test tile
    if (config.fullTest && config.fullTest.gated) {
      var subBanner = el('a', 'ws-subbanner');
      subBanner.href = 'sat-pay.html';
      subBanner.innerHTML =
        '<span class="ws-subbanner-ico">&#128274;</span>' +
        '<span>Full Test is available with a subscription - unlock the full adaptive SAT test.</span>' +
        '<span class="ws-subbanner-cta">View pricing &#8594;</span>';
      root.appendChild(subBanner);
    }

    root.appendChild(panel);

    // ---- the panel body for the selected skill ----
    function renderPanel(id) {
      var skill = null;
      skills.forEach(function (s) { if (s.id === id) skill = s; });
      panel.innerHTML = '';
      if (!skill) return;
      var dev = skill.status === 'dev';
      panel.appendChild(el('div', 'ws-panel-head',
        '<h2>' + esc(skill.name) + '</h2>' +
        '<span class="ws-badge ' + (dev ? 'dev' : 'free') + '">' + (dev ? 'In development' : 'Free') + '</span>' +
        (skill.blurb ? '<span class="ws-panel-blurb">' + esc(skill.blurb) + '</span>' : '')));

      var body = el('div', 'acc-body open');
      if (skill.reading) { buildReadingBody(body, exam); }
      else {
        (skill.types || []).forEach(function (t) {
          var c = BeaconStore.counts(exam, skill.id, t.id);
          if (dev) {
            var locked = el('div', 'ws-item is-locked');
            locked.innerHTML =
              '<div class="ws-item-main"><h3>' + escAmp(t.name) + '</h3>' + (t.desc ? '<p>' + escAmp(t.desc) + '</p>' : '') + '</div>' +
              '<span class="ws-count empty">soon</span>';
            body.appendChild(locked);
          } else {
            var item = el('a', 'ws-item');
            item.href = 'practice.html?exam=' + exam + '&skill=' + skill.id + '&type=' + t.id;
            var pct = c.total ? Math.round((c.solved / c.total) * 100) : 0;
            item.innerHTML =
              '<div class="ws-item-main"><h3>' + escAmp(t.name) + '</h3>' + (t.desc ? '<p>' + escAmp(t.desc) + '</p>' : '') + '</div>' +
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
            '<div class="ws-item-main"><h3>Take a full ' + escAmp(skill.name) + ' test</h3>' +
            '<p>A timed, exam-style test built from every ' + escAmp(skill.name) + ' question - scored at the end, no hints along the way.</p></div>' +
            '<span class="ws-count">' + (tot ? tot + ' Qs' : 'no questions yet') + '</span>' +
            '<span class="ws-go">Start test →</span>';
          body.appendChild(tItem);
        }
      }
      panel.appendChild(body);
    }

    // ---- Saved lives as a small flag in the top nav (see .ws-saved); light it up ----
    var favN = BeaconStore.favCount();
    document.querySelectorAll('.ws-saved').forEach(function (a) {
      a.classList.toggle('has', !!favN);
      var st = a.querySelector('.ws-saved-star');
      if (st) st.innerHTML = favN ? '&#9873;' : '&#9872;';
    });

    // ---- pick the initial skill: from the URL hash, else the first free one ----
    var want = (location.hash || '').replace(/^#/, '');
    var initial = null;
    skills.forEach(function (s) { if (s.id === want) initial = s.id; });
    if (!initial) { for (var i = 0; i < skills.length; i++) { if (skills[i].status !== 'dev') { initial = skills[i].id; break; } } }
    if (!initial && skills.length) initial = skills[0].id;
    if (initial) setActive(initial);
  }

  // line-art icons for the skill tiles (headphones / open book / pencil / mic)
  function skillIcon(id) {
    var I = {
      listening: '<svg viewBox="0 0 48 48"><path d="M10 27v-3a14 14 0 0 1 28 0v3"/><rect x="6" y="27" width="8" height="13" rx="4"/><rect x="34" y="27" width="8" height="13" rx="4"/></svg>',
      reading:   '<svg viewBox="0 0 48 48"><path d="M24 13v26"/><path d="M24 13c-4-3-11-3-16-1v25c5-2 12-2 16 1"/><path d="M24 13c4-3 11-3 16-1v25c-5-2-12-2-16 1"/></svg>',
      writing:   '<svg viewBox="0 0 48 48"><path d="M31 9l8 8-22 22-10 2 2-10z"/><path d="M27 13l8 8"/></svg>',
      speaking:  '<svg viewBox="0 0 48 48"><rect x="18" y="6" width="12" height="22" rx="6"/><path d="M12 22a12 12 0 0 0 24 0"/><path d="M24 34v6"/><path d="M17 40h14"/></svg>',
      math:      '<svg viewBox="0 0 48 48"><path d="M8 6v36h34"/><path d="M12 32c5-16 12-22 17-22s10 9 13 20"/></svg>',
      english:   '<svg viewBox="0 0 48 48"><path d="M24 13v26"/><path d="M24 13c-4-3-11-3-16-1v25c5-2 12-2 16 1"/><path d="M24 13c4-3 11-3 16-1v25c-5-2-12-2-16 1"/></svg>',
      full:      '<svg viewBox="0 0 48 48"><rect x="17" y="4" width="14" height="8" rx="2"/><rect x="10" y="8" width="28" height="36" rx="4"/><path d="M16 24l5 5 11-11"/></svg>'
    };
    return I[id] || '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14"/></svg>';
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
    // full-page exam room, styled to match the real test (per exam)
    document.body.classList.add('pr-examroom');
    var examForTheme = qs('exam') || (qs('mode') === 'adaptive' ? 'sat' : '');
    if (examForTheme) document.body.classList.add('exam-' + examForTheme);

    if (qs('mode') === 'adaptive') { renderAdaptiveSAT(root); return; }
    if (qs('mode') === 'readingtest') { renderReadingExam(root, qs('exam') || 'ielts'); return; }
    if (qs('mode') === 'full') {
      var fx = qs('exam');
      if (fx === 'toefl' || fx === 'ielts') {
        // combined Reading+Listening full test - paused for now, coming back once
        // Writing and Speaking (and AI grading) are ready, so a "full test" is actually
        // complete. renderFullExam itself is untouched underneath.
        var fxName = fx === 'toefl' ? 'TOEFL' : 'IELTS';
        root.innerHTML = '<div class="pr-finished"><h2>Full test - coming soon</h2>' +
          '<p>The full ' + fxName + ' test is being rebuilt to include Writing and Speaking together, with AI grading. ' +
          'For now, practice by section and skill.</p>' +
          '<div class="fin-actions"><a class="btn btn-white" href="' + fx + '.html">Back to ' + fxName + '</a></div></div>';
        return;
      }
    }

    var oneId = qs('one');
    var favMode = qs('fav') === '1';
    var testMode = qs('mode') === 'test';
    var exam = qs('exam'), skill = qs('skill'), type = qs('type');
    var pool, crumb, bucket = null, reveal = true;

    if (oneId) {
      var oneQ = BeaconStore.getById(oneId);
      if (!oneQ) { root.innerHTML = errorCard('Question not found.', 'It may have been removed. Head back to your saved list.'); return; }
      pool = [oneQ];
      crumb = 'saved · one question';
    } else if (favMode) {
      pool = BeaconStore.favoriteQuestions();
      if (exam) pool = pool.filter(function (q) { return q.exam === exam; });
      crumb = 'saved · redo pool' + (exam ? ' · ' + exam : '');
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

    // SAT practice mirrors the real exam's Bluebook look (top bar, flag, ABC eliminator,
    // calculator) - detected from the question itself so it also works for the "redo one
    // saved question" and "practice saved" routes, which don't carry an ?exam= param
    var satStyle = pool.length > 0 && pool[0].exam === 'sat';
    // the "redo one saved question" / "practice saved" routes don't carry ?exam=sat, so the
    // SAT accent theme (set from examForTheme, above) needs a second check here once the
    // pool itself is known
    if (satStyle) document.body.classList.add('exam-sat');
    var flagged = {};           // qid -> true, "Mark for Review" like the real Bluebook app
    var highlightMode = false;  // "Highlights & Notes" toggle
    var abcMode = false;        // "ABC" answer-eliminator toggle
    var eliminated = {};        // qid -> {choiceIndex: true}
    var exitHref = qs('ret') || (exam ? (exam + '.html' + (skill ? '#' + skill : '')) : 'account.html?tab=favorites');

    // exam-style countdown for full-skill tests - the real per-section time limit, not a guess
    // from question count. SAT practice skips the clock entirely, same look as the real test
    // minus the countdown pressure.
    var remaining = (testMode && !satStyle) ? officialSectionSeconds(exam, skill, pool.length) : 0;
    var timerId = null;
    if (testMode && !satStyle) {
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

      if (satStyle) {
        // exam top bar (sticky), laid out like the real Bluebook app - same three-column
        // grid as the exam, just with an empty center column instead of a timer
        var top = el('div', 'pr-exam-top bb-top');
        top.innerHTML =
          '<div class="bb-top-left"><span class="bb-sec-name">' + escAmp(crumb) + '</span></div>' +
          '<div class="bb-top-center"></div>' +
          '<div class="bb-top-right">' +
            '<button type="button" class="bb-tool-btn bb-hl-btn' + (highlightMode ? ' on' : '') + '">&#9998; Highlights <span class="amp">&amp;</span> Notes</button>' +
            (q.skill === 'math'
              ? '<button type="button" class="bb-tool-btn bb-calc-btn">&#128425; Calculator</button>' +
                '<button type="button" class="bb-tool-btn bb-desmos-btn">&#128200; Desmos</button>'
              : '') +
            '<a class="pr-exit-x" href="' + esc(exitHref) + '">Exit &#10005;</a>' +
          '</div>';
        top.querySelector('.bb-hl-btn').addEventListener('click', function () { highlightMode = !highlightMode; draw(); });
        var calcBtn = top.querySelector('.bb-calc-btn');
        if (calcBtn) calcBtn.addEventListener('click', function () { toggleCalcPanel('scientific', 'Calculator'); });
        var desmosBtn = top.querySelector('.bb-desmos-btn');
        if (desmosBtn) desmosBtn.addEventListener('click', function () { toggleCalcPanel('graphing', 'Desmos'); });
        root.appendChild(top);
        root.appendChild(el('div', 'bb-ruler'));
      } else {
        var barNav = testMode ? {
          prev: function () { if (idx > 0) { idx--; draw(); } },
          next: function () { var nb = root.querySelector('[data-next]'); if (nb) nb.click(); }
        } : null;
        root.appendChild(bar(idx, pool.length, crumb, testMode ? remaining : null, barNav));
      }

      var stage = el('div', 'pr-stage');
      var card = el('div', 'pr-card');

      var head = el('div', satStyle ? 'pr-head bb-head' : 'pr-head');
      var save = el('button', 'pr-save' + (BeaconStore.isFav(q.id) ? ' on' : ''));
      save.type = 'button';
      save.innerHTML = '<span class="st">' + (BeaconStore.isFav(q.id) ? '&#9873;' : '&#9872;') + '</span> ' + (BeaconStore.isFav(q.id) ? 'Saved' : 'Save');
      save.addEventListener('click', function () {
        var on = BeaconStore.toggleFav(q.id);
        save.classList.toggle('on', on);
        save.innerHTML = '<span class="st">' + (on ? '&#9873;' : '&#9872;') + '</span> ' + (on ? 'Saved' : 'Save');
      });
      if (satStyle) {
        // Bluebook-style head: number + "Mark for Review" flag + "ABC" eliminator on the
        // left, Save (a practice-only extra, not in the real exam) on the right
        var headLeft = el('span', 'bb-head-left');
        headLeft.innerHTML = '<span class="pr-kicker">' + (idx + 1) + '</span>';
        var flagBtn = el('button', 'pr-flag' + (flagged[q.id] ? ' on' : ''), '<span class="fl">' + (flagged[q.id] ? '&#9873;' : '&#9872;') + '</span> Mark for Review');
        flagBtn.type = 'button';
        flagBtn.addEventListener('click', function () { flagged[q.id] = !flagged[q.id]; draw(); });
        headLeft.appendChild(flagBtn);
        var abcBtn = el('button', 'bb-abc-btn' + (abcMode ? ' on' : ''), 'ABC');
        abcBtn.type = 'button'; abcBtn.title = 'Cross out answer choices you’ve ruled out';
        abcBtn.addEventListener('click', function () { abcMode = !abcMode; draw(); });
        headLeft.appendChild(abcBtn);
        head.appendChild(headLeft);
        head.appendChild(save);
      } else {
        head.innerHTML = '<span class="pr-kicker">Question ' + (idx + 1) + '</span>';
        head.appendChild(save);
      }
      // for a passage question in SAT style, the head moves inside the right column
      // (next to the prompt) instead of spanning the full card - see the passage branch below
      if (!(satStyle && q.passage)) card.appendChild(head);

      var feedback = el('div', 'pr-feedback');
      var fmt = q.format || q.type;

      // the answer block (built once, placed by the layout below)
      var answerEl;
      if (fmt === 'complete-the-words' || fmt === 'cloze') answerEl = clozeBlock(q, feedback, onResolved, reveal);
      else if (q.blocks && q.blocks.length) answerEl = passageSetBlock(q, feedback, onResolved, reveal);   // one passage, mixed blocks
      else if (q.items && q.items.length) answerEl = groupBlock(q, feedback, onResolved, reveal);   // matching / multi-blank completion
      else if (fmt === 'text') answerEl = textBlock(q, feedback, onResolved, reveal);
      else answerEl = satStyle ? satChoiceBlock(q, feedback, onResolved, reveal) : choiceBlock(q, feedback, onResolved, reveal);

      var imageEl = null;
      if (q.image) { imageEl = el('div', 'pr-image'); imageEl.innerHTML = '<img src="' + esc(q.image) + '" alt="Question image" loading="lazy">'; }
      var audioEl = null;
      if (q.audio) {
        audioEl = el('div', 'pr-audio');
        audioEl.innerHTML = q.audioSrc
          ? '<audio controls src="' + esc(q.audioSrc) + '"></audio>'
          : '<div class="ph"><span class="ico">▶</span> Audio placeholder' + (reveal ? ' - read the transcript after answering.' : '.') + '</div>';
      }
      var promptEl = el('div', 'pr-prompt', esc(q.prompt || ''));

      // transcript for listening (shown after answering - practice only, not during a test)
      var transcriptEls = null, tbtn = null, tp = null;
      if (q.transcript && reveal) {
        tbtn = el('button', 'btn btn-navy pr-transcript-btn', 'Show transcript');
        tbtn.type = 'button'; tbtn.style.display = 'none';
        tp = el('div', 'pr-transcript', '<span class="tlabel">Transcript</span>' + esc(q.transcript));
        tbtn.addEventListener('click', function () { tp.classList.toggle('show'); });
        transcriptEls = tbtn;
      }

      if (q.passage) {
        // reading: the text sits on the left (photo above the text, if there is one),
        // the questions on the right - SAT practice uses the same Bluebook split as the exam
        var split = el('div', satStyle ? 'pr-split bb-split' : 'pr-split');
        var left = el('div', satStyle ? 'pr-split-left bb-passage-col' : 'pr-split-left');
        if (imageEl) left.appendChild(imageEl);
        var passageEl = el('div', satStyle ? 'pr-passage bb-passage' + (highlightMode ? ' hl-on' : '') : 'pr-passage', letterHeaderHtml(q) + esc(q.passage));
        left.appendChild(passageEl);
        if (satStyle) wireHighlight(passageEl, highlightMode);
        var right = el('div', 'pr-split-right');
        if (satStyle) right.appendChild(head);
        right.appendChild(promptEl);
        if (audioEl) right.appendChild(audioEl);
        right.appendChild(answerEl);
        right.appendChild(feedback);
        if (tbtn) { right.appendChild(tbtn); right.appendChild(tp); }
        split.appendChild(left);
        if (satStyle) split.appendChild(el('div', 'bb-divider-handle', '&#9664;&#9654;'));
        split.appendChild(right);
        card.appendChild(split);
      } else {
        if (imageEl) card.appendChild(imageEl);
        if (audioEl) card.appendChild(audioEl);
        card.appendChild(promptEl);
        card.appendChild(answerEl);
        card.appendChild(feedback);
        if (tbtn) { card.appendChild(tbtn); card.appendChild(tp); }
      }

      stage.appendChild(card);
      root.appendChild(stage);
      root.appendChild(nav(answerEl));
      root.appendChild(trackerUI());

      function onResolved(correct) {
        answered = true;
        answers[q.id] = !!correct;
        if (bucket && !testMode) BeaconStore.markSolved(bucket.exam, bucket.skill, bucket.type, q.id);
        if (transcriptEls) transcriptEls.style.display = '';
        var next = root.querySelector('[data-next]');
        if (next) next.removeAttribute('disabled');
      }
    }

    // choice list for SAT practice - same letter-circle layout as choiceBlock, plus the
    // Bluebook "ABC" cross-out toggle (armed via abcMode, persisted per question in eliminated)
    function satChoiceBlock(q, feedback, done, reveal) {
      var wrap = el('div', 'pr-choices bb-choices');
      (q.choices || []).forEach(function (choice, i) {
        var elimOn = !!(eliminated[q.id] && eliminated[q.id][i]);
        var btn = el('button', 'pr-choice' + (elimOn ? ' eliminated' : ''));
        btn.type = 'button';
        btn.innerHTML = '<span>' + esc(choice) + '</span>' +
          '<span class="pr-choice-right">' +
          (abcMode ? '<span class="pr-elim-x" title="' + (elimOn ? 'Undo cross-out' : 'Cross out') + '">' + (elimOn ? '&#8617;' : '&#10005;') + '</span>' : '') +
          '<span class="mark">' + String.fromCharCode(65 + i) + '</span>' +
          '</span>';
        var elimX = btn.querySelector('.pr-elim-x');
        if (elimX) {
          elimX.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!eliminated[q.id]) eliminated[q.id] = {};
            eliminated[q.id][i] = !eliminated[q.id][i];
            draw();
          });
        }
        btn.addEventListener('click', function () {
          if (wrap.dataset.done) return;
          if (eliminated[q.id] && eliminated[q.id][i]) return;
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

    function nav(answerEl) {
      var n = el('div', 'pr-nav');
      var btns = el('div', 'pr-navbtns');
      var last = idx === pool.length - 1;
      var canResolve = answerEl && typeof answerEl.resolve === 'function';
      var nextBtn = el('button', 'btn btn-white', last ? (testMode ? 'Submit test' : 'Finish') : 'Next →');
      nextBtn.type = 'button'; nextBtn.setAttribute('data-next', '1');
      nextBtn.addEventListener('click', function () {
        // answering isn't required - Next always advances, like a real exam you can skip and move on
        if (!answered && canResolve) answerEl.resolve();
        if (last) { finish(); } else { idx++; draw(); }
      });
      btns.appendChild(nextBtn);
      if (satStyle) {
        // the real exam navigates with Back/Next at the bottom - exit lives in the top bar's X instead
        var back = el('button', 'btn btn-wire', '← Back');
        back.type = 'button';
        if (idx === 0) back.setAttribute('disabled', '');
        back.addEventListener('click', function () { if (idx > 0) { idx--; draw(); } });
        n.appendChild(back);
      } else {
        var exit = el('a', 'btn btn-wire pr-exit', '← Exit');
        exit.href = exitHref;
        exit.addEventListener('click', function () { if (timerId) { clearInterval(timerId); timerId = null; } });
        n.appendChild(exit);
      }
      n.appendChild(btns);
      return n;
    }

    // dot per question: unanswered / answered (test mode) / correct-or-wrong (practice mode)
    function palette(inReview) {
      var p = el('div', 'pr-palette');
      var grid = el('div', 'pr-palette-grid');
      pool.forEach(function (q, i) {
        var known = q.id in answers;
        var cls = 'pr-dot' + (!inReview && i === idx ? ' current' : '') + (flagged[q.id] ? ' flagged' : '');
        if (known) cls += reveal ? (answers[q.id] ? ' done' : ' wrong') : ' done';
        var b = el('button', cls, (flagged[q.id] ? '<span class="flag-dot">&#9873;</span>' : '') + (i + 1));
        b.type = 'button'; b.setAttribute('data-i', i);
        b.addEventListener('click', function () { idx = i; draw(); });
        grid.appendChild(b);
      });
      p.appendChild(grid);
      return p;
    }

    function trackerUI() {
      var row = el('div', 'pr-tracker-row');
      var doneCount = pool.filter(function (q) { return q.id in answers; }).length;
      var btn = el('button', 'btn btn-wire pr-tracker-btn', '🗂 Track progress (' + doneCount + '/' + pool.length + ')');
      btn.type = 'button';
      var overlay = el('div', 'pr-tracker-overlay');
      var panel = el('div', 'pr-tracker-panel');
      panel.innerHTML = '<div class="pr-tracker-head"><span>Progress</span><button type="button" class="pr-tracker-x">✕</button></div>';
      panel.appendChild(palette(false));
      overlay.appendChild(panel);
      btn.addEventListener('click', function () { overlay.classList.add('open'); });
      overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
      panel.querySelector('.pr-tracker-x').addEventListener('click', function () { overlay.classList.remove('open'); });
      row.appendChild(btn); row.appendChild(overlay);
      return row;
    }

    function finish() {
      if (timerId) { clearInterval(timerId); timerId = null; }
      if (testMode) { root.innerHTML = testResult(); return; }
      root.innerHTML = '';
      var f = el('div', 'pr-finished');
      var savedExit = (favMode || oneId);
      var ret = qs('ret');
      var backHref = ret || (savedExit ? 'account.html?tab=favorites' : (exam + '.html'));
      var backLabel = ret ? 'Back' : (savedExit ? 'Back to saved' : 'Back to ' + exam.toUpperCase());
      f.innerHTML =
        '<div class="fin-mark">✓</div>' +
        '<h2>' + (oneId ? 'Done' : 'Set complete') + '</h2>' +
        '<p>You worked through ' + pool.length + ' question' + (pool.length === 1 ? '' : 's') + '.' +
        (savedExit ? '' : ' They’ll stay out of your normal flow until you clear the whole pool.') + '</p>' +
        '<div class="fin-actions">' +
        '<a class="btn btn-white" href="' + backHref + '">' + backLabel + '</a>' +
        (savedExit ? '' : '<a class="btn btn-wire" href="practice.html' + location.search + '">Keep going</a>') +
        '</div>';
      root.appendChild(f);
    }

    function testResult() {
      var total = pool.length, correct = 0;
      pool.forEach(function (q) { if (answers[q.id]) correct++; });
      var pct = total ? Math.round(correct / total * 100) : 0;
      var rows = pool.map(function (q, i) {
        var ok = !!answers[q.id];
        var ans = q.choices ? q.choices[q.answer] : (q.items ? q.items.map(function (it) { return it.answer; }).join(', ') : q.answer);
        return '<div class="pr-rev ' + (ok ? 'ok' : 'no') + '">' +
          '<span class="pr-rev-n">' + (i + 1) + '</span>' +
          '<div class="pr-rev-main"><div class="pr-rev-q">' + esc(shortenPrompt(q.prompt)) + '</div>' +
          '<div class="pr-rev-a">Answer: <b>' + esc(ans) + '</b>' + (q.explanation ? ' - ' + esc(q.explanation) : '') + '</div></div>' +
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
   * SAT questions are in the bank - module sizes shrink to fit a small pool. */
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
          'Just like the real Digital SAT: <b>Reading <span class="amp">&amp;</span> Writing</b> first, then <b>Math</b>, each in <b>two modules</b>. ' +
          'Module&nbsp;2 gets <b>harder or easier</b> depending on how you do in Module&nbsp;1. No feedback until the end - ' +
          'you’re scored on the <b>400–1600</b> scale.' +
          '<br><br>The official test is 98 questions (54 R<span class="amp">&amp;</span>W + 44 Math) in 2h14m. This one is built from the ' +
          'questions currently in the bank, so it may be shorter - the structure and scoring work the same.' +
        '</div>' +
        '<div class="pr-nav"><a class="btn btn-wire pr-exit" href="sat.html">← Back</a>' +
        '<div class="pr-navbtns"><button type="button" class="btn btn-white" id="ad-start">Start the test →</button></div></div>';
      c.appendChild(card); root.appendChild(c);
      document.getElementById('ad-start').onclick = function () { si = 0; runSection(); };
    }

    // ---- run one section (two adaptive modules) ----
    function runSection() {
      var sec = SECTIONS[si];
      // never-yet-seen questions first (shared with the "Random mix" skill-practice pool),
      // previously-seen ones only as filler once the fresh supply runs low - so with a
      // large enough bank, retaking the full test rarely repeats a question
      var unseen = shuffle(BeaconStore.unsolvedPool('sat', sec.key, null).slice());
      var unseenIds = {}; unseen.forEach(function (q) { unseenIds[q.id] = 1; });
      var seenAgain = shuffle(BeaconStore.questionsFor('sat', sec.key, null).filter(function (q) { return !unseenIds[q.id]; }));
      var full = unseen.concat(seenAgain);
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
        transition('Module 1 complete', 'Starting Module&nbsp;2 - it has adapted to your Module&nbsp;1 answers. No going back now.', function () {
          runModule(sec, 2, mod2, secState, function () { afterM2(); });
        });
      });
    }

    // ---- run one module, real-exam style: a countdown, free navigation
    //      (Back / Next / jump to any question), and a selection you can change ----
    function runModule(sec, moduleNo, qs_, secState, onModuleDone) {
      if (!qs_.length) { onModuleDone(0); return; }
      var picked = {};            // qid -> chosen choice index (persists, changeable)
      var flagged = {};           // qid -> true, "Mark for Review" like the real Bluebook app
      var timerHidden = false;    // "Hide" toggle, like the real Bluebook timer
      var highlightMode = false;  // "Highlights & Notes" toggle - armed means selecting text highlights it
      var abcMode = false;        // "ABC" answer-eliminator toggle, like the real Bluebook app
      var eliminated = {};        // qid -> {choiceIndex: true}, crossed-out choices (kept even when ABC is off)
      var idx = 0;
      // one outside-click listener for the whole module (not re-added on every draw),
      // pointed at whichever question-navigator row/close-fn the current draw() set up
      var qnavRef = { row: null, open: false, close: function () {} };
      document.addEventListener('click', function (e) {
        if (qnavRef.open && qnavRef.row && !qnavRef.row.contains(e.target)) qnavRef.close();
      });
      // real per-module time, like the actual Digital SAT: 32 min for a Reading
      // & Writing module, 35 min for a Math module.
      var remaining = sec.minutes * 60;
      var timerId = setInterval(function () {
        remaining--;
        var t = root.querySelector('.pr-timer');
        if (t && !timerHidden) { t.textContent = fmtTime(remaining); if (remaining <= 60) t.classList.add('low'); }
        if (remaining <= 0) { clearInterval(timerId); timerId = null; endModule(); }
      }, 1000);

      draw();

      function draw() {
        var q = qs_[idx];
        root.innerHTML = '';

        // exam top bar (sticky), laid out like the real Bluebook app:
        // section name (left) · timer + hide (center) · tools + exit (right)
        var top = el('div', 'pr-exam-top bb-top');
        top.innerHTML =
          '<div class="bb-top-left"><span class="bb-sec-name">Section ' + (si + 1) + ': ' + escAmp(sec.name) + '</span></div>' +
          '<div class="bb-top-center">' +
            (timerHidden
              ? '<span class="pr-timer bb-timer-off">Time is hidden</span>'
              : '<span class="pr-timer' + (remaining <= 60 ? ' low' : '') + '">' + fmtTime(remaining) + '</span>') +
            '<button type="button" class="bb-hide-btn">' + (timerHidden ? 'Show' : 'Hide') + '</button>' +
          '</div>' +
          '<div class="bb-top-right">' +
            '<button type="button" class="bb-tool-btn bb-hl-btn' + (highlightMode ? ' on' : '') + '">&#9998; Highlights <span class="amp">&amp;</span> Notes</button>' +
            (sec.key === 'math'
              ? '<button type="button" class="bb-tool-btn bb-calc-btn">&#128425; Calculator</button>' +
                '<button type="button" class="bb-tool-btn bb-desmos-btn">&#128200; Desmos</button>'
              : '') +
            '<a class="pr-exit-x" href="sat.html" title="Leave the test">Exit &#10005;</a>' +
          '</div>';
        top.querySelector('.bb-hide-btn').addEventListener('click', function () { timerHidden = !timerHidden; draw(); });
        top.querySelector('.bb-hl-btn').addEventListener('click', function () { highlightMode = !highlightMode; draw(); });
        var calcBtn = top.querySelector('.bb-calc-btn');
        if (calcBtn) calcBtn.addEventListener('click', function () { toggleCalcPanel('scientific', 'Calculator'); });
        var desmosBtn = top.querySelector('.bb-desmos-btn');
        if (desmosBtn) desmosBtn.addEventListener('click', function () { toggleCalcPanel('graphing', 'Desmos'); });
        top.querySelector('.pr-exit-x').addEventListener('click', function () { if (timerId) { clearInterval(timerId); timerId = null; } });
        root.appendChild(top);
        root.appendChild(el('div', 'bb-ruler'));

        var stage = el('div', 'pr-stage');
        var card = el('div', 'pr-card');
        var head = el('div', 'pr-head bb-head');
        var headLeft = el('span', 'bb-head-left');
        headLeft.innerHTML = '<span class="pr-kicker">' + (idx + 1) + '</span>';
        var flagBtn = el('button', 'pr-flag' + (flagged[q.id] ? ' on' : ''), '<span class="fl">' + (flagged[q.id] ? '&#9873;' : '&#9872;') + '</span> Mark for Review');
        flagBtn.type = 'button';
        flagBtn.addEventListener('click', function () { flagged[q.id] = !flagged[q.id]; draw(); });
        headLeft.appendChild(flagBtn);
        var abcBtn = el('button', 'bb-abc-btn' + (abcMode ? ' on' : ''), 'ABC');
        abcBtn.type = 'button'; abcBtn.title = 'Cross out answer choices you’ve ruled out';
        abcBtn.addEventListener('click', function () { abcMode = !abcMode; draw(); });
        head.appendChild(headLeft);
        head.appendChild(abcBtn);

        // choices: letter circle on the right edge, Bluebook-style; while ABC is armed,
        // each choice gets a small cross-out toggle - crossed-out choices stay struck
        // through (and unselectable) even after ABC is turned back off
        var wrap = el('div', 'pr-choices bb-choices');
        (q.choices || []).forEach(function (choice, i) {
          var elimOn = !!(eliminated[q.id] && eliminated[q.id][i]);
          var btn = el('button', 'pr-choice' + (picked[q.id] === i ? ' picked' : '') + (elimOn ? ' eliminated' : ''));
          btn.type = 'button';
          btn.innerHTML = '<span>' + esc(choice) + '</span>' +
            (abcMode ? '<span class="pr-elim-x" title="' + (elimOn ? 'Undo cross-out' : 'Cross out') + '">' + (elimOn ? '&#8617;' : '&#10005;') + '</span>' : '') +
            '<span class="mark">' + String.fromCharCode(65 + i) + '</span>';
          var elimX = btn.querySelector('.pr-elim-x');
          if (elimX) {
            elimX.addEventListener('click', function (e) {
              e.stopPropagation();
              if (!eliminated[q.id]) eliminated[q.id] = {};
              eliminated[q.id][i] = !eliminated[q.id][i];
              if (eliminated[q.id][i] && picked[q.id] === i) delete picked[q.id];
              draw();
            });
          }
          btn.addEventListener('click', function () {
            if (eliminated[q.id] && eliminated[q.id][i]) return;
            picked[q.id] = i;
            wrap.querySelectorAll('.pr-choice').forEach(function (k) { k.classList.remove('picked'); });
            btn.classList.add('picked');
            syncPalette();
          });
          wrap.appendChild(btn);
        });

        if (q.passage) {
          // side-by-side like the real Bluebook: passage left (plain, no accent bar),
          // question header + prompt + choices right, divided by a vertical rule
          var split = el('div', 'pr-split bb-split');
          var left = el('div', 'pr-split-left bb-passage-col');
          var passageEl = el('div', 'pr-passage bb-passage' + (highlightMode ? ' hl-on' : ''), letterHeaderHtml(q) + esc(q.passage));
          left.appendChild(passageEl);
          wireHighlight(passageEl, highlightMode);
          var right = el('div', 'pr-split-right');
          right.appendChild(head);
          if (q.image) { var fig1 = el('div', 'pr-image'); fig1.innerHTML = '<img src="' + esc(q.image) + '" alt="Question image" loading="lazy">'; right.appendChild(fig1); }
          right.appendChild(el('div', 'pr-prompt', esc(q.prompt)));
          right.appendChild(wrap);
          split.appendChild(left);
          split.appendChild(el('div', 'bb-divider-handle', '&#9664;&#9654;'));
          split.appendChild(right);
          card.appendChild(split);
        } else {
          card.appendChild(head);
          if (q.image) { var fig2 = el('div', 'pr-image'); fig2.innerHTML = '<img src="' + esc(q.image) + '" alt="Question image" loading="lazy">'; card.appendChild(fig2); }
          card.appendChild(el('div', 'pr-prompt', esc(q.prompt)));
          card.appendChild(wrap);
        }
        stage.appendChild(card);
        root.appendChild(stage);

        // nav row: Back | Next / Review
        var n = el('div', 'pr-nav');
        var back = el('button', 'btn btn-wire', '← Back'); back.type = 'button';
        if (idx === 0) back.setAttribute('disabled', '');
        back.addEventListener('click', function () { if (idx > 0) { idx--; draw(); } });
        var btns = el('div', 'pr-navbtns');
        var last = idx === qs_.length - 1;
        var nextBtn = el('button', 'btn btn-white', last ? 'Review <span class="amp">&amp;</span> submit' : 'Next →'); nextBtn.type = 'button';
        nextBtn.addEventListener('click', function () { if (last) { review(); } else { idx++; draw(); } });
        btns.appendChild(nextBtn);
        n.appendChild(back); n.appendChild(btns);
        root.appendChild(n);

        // question tracker - a button opens an overlay with the jump-to-any-question grid
        root.appendChild(trackerUI());
      }

      function trackerUI() {
        var row = el('div', 'pr-tracker-row');
        var chevSvg = '<svg viewBox="0 0 12 8" width="12" height="8"><path d="M1 6.2L6 1.4L11 6.2" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        var btn = el('button', 'btn pr-qnav-btn', 'Question ' + (idx + 1) + ' of ' + qs_.length + ' <span class="pr-qnav-chev">' + chevSvg + '</span>');
        btn.type = 'button';
        var panel = el('div', 'pr-qnav-panel');
        panel.appendChild(palette(false));
        function setOpen(v) {
          qnavRef.open = v;
          panel.classList.toggle('open', v);
          var chev = btn.querySelector('.pr-qnav-chev');
          if (chev) chev.classList.toggle('down', v);
        }
        qnavRef.row = row;
        qnavRef.close = function () { setOpen(false); };
        btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!qnavRef.open); });
        row.appendChild(panel); row.appendChild(btn);
        return row;
      }

      function palette(inReview) {
        var p = el('div', 'pr-palette');
        var grid = el('div', 'pr-palette-grid');
        qs_.forEach(function (q, i) {
          var cls = 'pr-dot' + (!inReview && i === idx ? ' current' : '') + (picked[q.id] != null ? ' done' : '') + (flagged[q.id] ? ' flagged' : '');
          var b = el('button', cls, (flagged[q.id] ? '<span class="flag-dot">&#9873;</span>' : '') + (i + 1));
          b.type = 'button'; b.setAttribute('data-i', i);
          b.addEventListener('click', function () { idx = i; draw(); });
          grid.appendChild(b);
        });
        p.appendChild(grid);
        return p;
      }

      function syncPalette() {
        qs_.forEach(function (q, i) {
          var done = picked[q.id] != null;
          var dot = root.querySelector('.pr-dot[data-i="' + i + '"]');
          if (dot) dot.classList.toggle('done', done);
        });
      }

      function review() {
        var un = qs_.filter(function (q) { return picked[q.id] == null; }).length;
        root.innerHTML = '';
        var top = el('div', 'pr-exam-top');
        top.innerHTML =
          '<span class="pr-exit-x" style="visibility:hidden">Exit ✕</span>' +
          '<span class="pr-timer">⏱ ' + fmtTime(remaining) + '</span><span></span>';
        root.appendChild(top);
        var stage = el('div', 'pr-stage');
        var card = el('div', 'pr-card');
        card.innerHTML =
          '<span class="pr-kicker">Before you submit</span>' +
          '<h2 class="pr-prompt" style="margin-top:8px">Module ' + moduleNo + ' review</h2>' +
          '<div class="pr-passage" style="border:0;padding-left:0">You answered <b>' + (qs_.length - un) + '</b> of <b>' + qs_.length + '</b>. ' +
          (un ? 'Still unanswered: <b>' + un + '</b> - tap a number below to go back.' : 'All answered. You can still change any answer before submitting.') +
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
        qs_.forEach(function (q) {
          if (picked[q.id] === q.answer) mc++;
          // every question shown counts as "seen" so a future retake favors fresh ones
          BeaconStore.markSolved('sat', sec.key, null, q.id);
        });
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
      var left = 10 * 60;   // real SAT: a single 10-minute break before Math
      var tid = null;
      function go() { if (tid) { clearInterval(tid); tid = null; } runSection(); }
      render();
      tid = setInterval(function () {
        left--;
        var t = root.querySelector('.brk-time'); if (t) t.textContent = fmtTime(left);
        if (left <= 0) { clearInterval(tid); tid = null; go(); }
      }, 1000);
      function render() {
        root.innerHTML = '';
        var c = el('div', 'pr-stage');
        var card = el('div', 'pr-card pr-break-card');
        card.innerHTML =
          '<span class="pr-kicker">Break</span>' +
          '<h2 class="pr-prompt" style="margin-top:8px">10-minute break</h2>' +
          '<div class="pr-passage" style="border:0;padding-left:0">Reading <span class="amp">&amp;</span> Writing is done. On the real SAT you get a 10-minute break here before Math. ' +
          'Stretch, breathe - <b>' + escAmp(next.name) + '</b> starts automatically when the timer reaches zero.</div>' +
          '<div class="brk-clock"><span class="brk-time">' + fmtTime(left) + '</span></div>' +
          '<div class="pr-nav"><span></span><div class="pr-navbtns">' +
          '<button type="button" class="btn btn-white" id="brk-skip">Skip break - start ' + escAmp(next.name) + ' →</button>' +
          '</div></div>';
        c.appendChild(card); root.appendChild(c);
        document.getElementById('brk-skip').onclick = function () { go(); };
      }
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
      var totalScore = 0;
      results.forEach(function (r) { totalScore += r.scaled; });
      var rwSec = results.filter(function (r) { return r.name === 'Reading & Writing'; })[0];
      var mathSec = results.filter(function (r) { return r.name === 'Math'; })[0];

      var note = results.length < 2
        ? '<div class="pr-passage" style="border:0;padding-left:0">Only the <b>' + escAmp(results[0].name) + '</b> section had questions, so this is a section score out of 800. Add ' +
          (results[0].name.indexOf('Math') === -1 ? 'Math' : 'Reading <span class="amp">&amp;</span> Writing') + ' questions to get the full 400–1600.</div>'
        : '';

      var big = results.length < 2 ? results[0].scaled : totalScore;

      if (window.BeaconStore && BeaconStore.recordScore) {
        BeaconStore.recordScore('sat', big, { rw: rwSec ? rwSec.scaled : null, math: mathSec ? mathSec.scaled : null });
      }

      var dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      var reportHtml = results.length >= 2
        ? '<div class="score-report"><div class="sr-head"><h2>SAT Practice Test</h2>' +
          '<div class="sr-sub">' + esc(dateStr) + ' · Practice result</div></div>' +
          '<div class="sr-div"></div>' +
          '<span class="sr-label">Your Total Score</span>' +
          '<div class="sr-big">' + big + '<span class="sr-range">400 to<br>1600</span></div>' +
          '<div class="sr-cols">' +
          '<div class="sr-col"><span class="sr-label">Your Reading and Writing Score</span>' +
          '<div class="sr-mid">' + (rwSec ? rwSec.scaled : '-') + '<span class="sr-range">200 to<br>800</span></div></div>' +
          '<div class="sr-col"><span class="sr-label">Your Math Score</span>' +
          '<div class="sr-mid">' + (mathSec ? mathSec.scaled : '-') + '<span class="sr-range">200 to<br>800</span></div></div>' +
          '</div></div>'
        : '<div class="score-report"><div class="sr-head"><h2>SAT Practice Test</h2>' +
          '<div class="sr-sub">' + esc(dateStr) + ' · Practice result</div></div>' +
          '<div class="sr-div"></div>' +
          '<span class="sr-label">Your ' + esc(results[0].name) + ' Score</span>' +
          '<div class="sr-big">' + big + '<span class="sr-range">200 to<br>800</span></div></div>';

      root.innerHTML =
        '<div class="pr-stage"><div class="pr-result">' +
        reportHtml +
        note +
        '<div class="pr-passage" style="border:0;padding-left:0;font-size:.9rem;color:#7c88a3">This score is an estimate from your answers and which Module 2 you unlocked - a study guide, not an official SAT score. Saved to your profile.</div>' +
        '<div class="fin-actions">' +
        '<a class="btn btn-white" href="sat.html">Back to SAT</a>' +
        '<a class="btn btn-wire" href="practice.html?mode=adaptive&exam=sat">Retake test</a>' +
        '</div></div></div>';
    }
  }

  function bar(idx, total, crumb, remaining, nav) {
    var b = el('div', 'pr-bar');
    var pct = total ? Math.round(((idx) / total) * 100) : 0;
    var jump = nav ?
      '<span class="pr-exam-jump">' +
        '<button type="button" class="pr-arrow" data-bar-prev' + (idx === 0 ? ' disabled' : '') + '>◀</button>' +
        '<span class="pr-exam-qn">' + (idx + 1) + ' / ' + total + '</span>' +
        '<button type="button" class="pr-arrow" data-bar-next>▶</button>' +
      '</span>'
      : '<span class="pr-count">' + (idx + 1) + ' / ' + total + '</span>';
    b.innerHTML =
      '<div class="pr-bar-inner">' +
      '<span class="pr-crumb">' + esc(crumb) + '</span>' +
      '<div class="pr-progress-wrap"><div class="pr-progress-track"><div class="pr-progress-fill" style="width:' + pct + '%"></div></div></div>' +
      jump +
      (remaining != null ? '<span class="pr-timer">⏱ ' + fmtTime(remaining) + '</span>' : '') +
      '</div>';
    if (nav) {
      var pv = b.querySelector('[data-bar-prev]'); if (pv) pv.addEventListener('click', nav.prev);
      var nx = b.querySelector('[data-bar-next]'); if (nx) nx.addEventListener('click', nav.next);
    }
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
    // no inline Check button here - filling the blanks and pressing the page's
    // own Next button grades this block (see nav()'s canResolve/resolve wiring)
    wrap.resolve = function () {
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
      if (reveal) showFeedback(feedback, allCorrect, q.explanation);
      done(allCorrect);
    };
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

  // grouped question: one passage + several sub-items answered together.
  // matching → each item picks a letter/heading from q.options; completion → each item is a typed blank.
  function groupBlock(q, feedback, done, reveal) {
    var wrap = el('div', 'pr-group');
    var opts = (q.options && q.options.length) ? q.options : null;
    var controls = [];
    (q.items || []).forEach(function (it, i) {
      var row = el('div', 'pr-gitem');
      row.appendChild(el('div', 'pr-gq', '<span class="pr-gn">' + (i + 1) + '.</span> ' + esc(it.prompt || '')));
      var ctrl;
      if (opts) {
        ctrl = document.createElement('select'); ctrl.className = 'pr-gsel';
        ctrl.innerHTML = '<option value="">-</option>' + opts.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('');
      } else {
        ctrl = document.createElement('input'); ctrl.type = 'text'; ctrl.className = 'pr-gin'; ctrl.placeholder = 'Your answer';
      }
      ctrl.setAttribute('data-answer', String(it.answer == null ? '' : it.answer));
      row.appendChild(ctrl); controls.push(ctrl); wrap.appendChild(row);
    });
    var actions = el('div', 'cloze-actions');
    var check = el('button', 'btn btn-navy', 'Check'); check.type = 'button';
    check.addEventListener('click', function () {
      if (wrap.dataset.done) return; wrap.dataset.done = '1';
      var all = true, nOk = 0;
      controls.forEach(function (c) {
        var got = String(c.value || '').trim().toLowerCase();
        var want = String(c.getAttribute('data-answer') || '').trim().toLowerCase();
        var ok = got === want; if (ok) nOk++; else all = false;
        c.disabled = true; if (c.tagName === 'INPUT') c.readOnly = true;
        if (reveal) { c.classList.add(ok ? 'correct' : 'wrong'); if (!ok) c.title = 'Answer: ' + c.getAttribute('data-answer'); }
      });
      check.style.display = 'none';
      if (reveal) showFeedback(feedback, all, q.explanation || (nOk + ' / ' + controls.length + ' correct'));
      done(all);
    });
    actions.appendChild(check); wrap.appendChild(actions);
    return wrap;
  }

  // passage set: one passage + several blocks of different types, each checked on its own.
  function passageSetBlock(q, feedback, done, reveal) {
    var wrap = el('div', 'pr-pset');
    var blocks = q.blocks || [];
    var total = blocks.length, checked = 0, allOk = true, num = 1;
    if (!total) { done(true); return wrap; }
    blocks.forEach(function (bl) {
      var sec = el('div', 'pr-pblock');
      if (bl.prompt) sec.appendChild(el('div', 'pr-bprompt', esc(bl.prompt)));
      var opts = (bl.kind === 'matching' && bl.options && bl.options.length) ? bl.options : null;
      var controls = [];
      (bl.items || []).forEach(function (it) {
        var n = num++;
        var row = el('div', 'pr-gitem' + (bl.kind === 'choice' ? ' pr-mcitem' : ''));
        row.appendChild(el('div', 'pr-gq', '<span class="pr-gn">' + n + '.</span> ' + esc(it.prompt || '')));
        if (bl.kind === 'choice') {
          var ch = el('div', 'pr-choices pr-mcchoices');
          (it.choices || []).forEach(function (c, ci) {
            var b = el('button', 'pr-choice'); b.type = 'button';
            b.innerHTML = '<span class="mark">' + String.fromCharCode(65 + ci) + '</span><span>' + esc(c) + '</span>';
            b.addEventListener('click', function () {
              if (ch.dataset.locked) return;
              ch.querySelectorAll('.pr-choice').forEach(function (k) { k.classList.remove('picked'); });
              b.classList.add('picked'); ch.dataset.picked = ci;
            });
            ch.appendChild(b);
          });
          row.appendChild(ch); controls.push({ kind: 'mc', node: ch, answer: it.answer });
        } else if (opts) {
          var s = document.createElement('select'); s.className = 'pr-gsel';
          s.innerHTML = '<option value="">-</option>' + opts.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('');
          row.appendChild(s); controls.push({ kind: 'sel', node: s, answer: it.answer });
        } else {
          var inp = document.createElement('input'); inp.type = 'text'; inp.className = 'pr-gin'; inp.placeholder = 'Your answer';
          row.appendChild(inp); controls.push({ kind: 'in', node: inp, answer: it.answer });
        }
        sec.appendChild(row);
      });
      var bfb = el('div', 'pr-bfeedback');
      var bcheck = el('button', 'btn btn-navy pr-bcheck', 'Check'); bcheck.type = 'button';
      bcheck.addEventListener('click', function () {
        if (sec.dataset.done) return; sec.dataset.done = '1';
        var blockOk = true, nOk = 0;
        controls.forEach(function (c) {
          var ok = false;
          if (c.kind === 'mc') {
            c.node.dataset.locked = '1';
            var picked = (c.node.dataset.picked != null && c.node.dataset.picked !== '') ? Number(c.node.dataset.picked) : -1;
            ok = picked === c.answer;
            var kids = c.node.querySelectorAll('.pr-choice');
            if (reveal) { if (picked >= 0) kids[picked].classList.add(ok ? 'correct' : 'wrong'); if (!ok && kids[c.answer]) kids[c.answer].classList.add('correct'); }
          } else {
            var got = String(c.node.value || '').trim().toLowerCase();
            ok = got === String(c.answer == null ? '' : c.answer).trim().toLowerCase();
            c.node.disabled = true; if (c.kind === 'in') c.node.readOnly = true;
            if (reveal) { c.node.classList.add(ok ? 'correct' : 'wrong'); if (!ok) c.node.title = 'Answer: ' + c.answer; }
          }
          if (ok) nOk++; else blockOk = false;
        });
        bcheck.style.display = 'none';
        if (reveal) { bfb.className = 'pr-bfeedback show ' + (blockOk ? 'good' : 'bad'); bfb.textContent = nOk + ' / ' + controls.length + ' correct'; }
        checked++; allOk = allOk && blockOk;
        if (checked >= total) done(allOk);
      });
      sec.appendChild(bfb); sec.appendChild(bcheck);
      wrap.appendChild(sec);
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
      '<p>You’ve solved every question here. New questions are added over time - or reset to run through them again.</p>' +
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
  // real per-section time limits (same numbers used by the full-exam/adaptive-SAT runners)
  function officialSectionSeconds(examId, skillId, fallbackCount) {
    var T = { toefl: { reading: 35 * 60, listening: 36 * 60 },
              ielts: { reading: 60 * 60, listening: 30 * 60 },
              sat:   { math: 35 * 60, english: 32 * 60 } };
    if (T[examId] && T[examId][skillId]) return T[examId][skillId];
    return fallbackCount * (skillId === 'listening' ? 60 : 90);
  }
  function shortenPrompt(s) { s = String(s || ''); return s.length > 90 ? s.slice(0, 90) + '…' : s; }

  /* Bluebook-style text highlighter: click "Highlights & Notes" to arm highlight mode,
   * then select text in the passage to highlight it right away - no extra popup. Click
   * an existing highlight to remove it; click "Highlights & Notes" again to disarm.
   * Highlights don't persist across redraws (e.g. moving to another question) - same
   * idea as the real tool, lighter build. */
  function wireHighlight(passageEl, active) {
    passageEl.addEventListener('mouseup', function (e) {
      if (e.target && e.target.closest && e.target.closest('mark.pr-hl')) return;
      if (!active) return;
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      var range = sel.getRangeAt(0);
      if (!passageEl.contains(range.commonAncestorContainer)) return;
      try {
        var mark = document.createElement('mark');
        mark.className = 'pr-hl';
        range.surroundContents(mark);
      } catch (e2) { /* selection crossed element boundaries - skip rather than break the DOM */ }
      sel.removeAllRanges();
    });
    passageEl.addEventListener('click', function (e) {
      var mark = e.target && e.target.closest && e.target.closest('mark.pr-hl');
      if (!mark) return;
      var parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
      parent.normalize();
    });
  }

  /* Real Digital SAT Math lets you open a calculator mid-test: "Calculator" opens a
   * Desmos scientific calculator (roots, powers, trig), "Desmos" opens the full Desmos
   * graphing calculator - both float in a resizable panel inside the test instead of
   * navigating to desmos.com. Loaded lazily from Desmos's own embed API on first use. */
  var calcPanel = null, calcPanelKind = null, calcInstance = null;
  // tracks the one shared script-load attempt so Calculator/Desmos never race each other,
  // and so a failure (blocked request, offline, slow network) shows a retry instead of
  // silently leaving the panel blank forever
  var desmosLoad = null; // null | 'loading' | 'ready' | 'error'
  var desmosWaiters = [];
  function ensureDesmos(onReady, onError) {
    if (window.Desmos) { onReady(); return; }
    if (desmosLoad === 'error') { onError(); return; }
    desmosWaiters.push({ ready: onReady, error: onError });
    if (desmosLoad === 'loading') return;
    desmosLoad = 'loading';
    var settled = false;
    var settle = function (ok) {
      if (settled) return;
      settled = true;
      desmosLoad = ok ? 'ready' : 'error';
      var waiters = desmosWaiters; desmosWaiters = [];
      waiters.forEach(function (w) { ok ? w.ready() : w.error(); });
    };
    var s = document.createElement('script');
    s.src = 'https://www.desmos.com/api/v1.11/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
    s.onload = function () { settle(!!window.Desmos); };
    s.onerror = function () { settle(false); };
    document.head.appendChild(s);
    setTimeout(function () { settle(!!window.Desmos); }, 8000);
  }
  function closeCalcPanel() {
    if (calcPanel) { calcPanel.remove(); calcPanel = null; calcPanelKind = null; calcInstance = null; }
  }
  // drag the panel anywhere by its header (resizing is plain CSS resize:both on the
  // bottom-right corner) - switches from right/bottom anchoring to left/top on first drag
  function wireCalcDrag(panel, handle) {
    handle.addEventListener('mousedown', function (e) {
      if (e.target.closest('.pr-desmos-x')) return;
      e.preventDefault();
      var rect = panel.getBoundingClientRect();
      panel.style.left = rect.left + 'px';
      panel.style.top = rect.top + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      var startX = e.clientX, startY = e.clientY, startLeft = rect.left, startTop = rect.top;
      function onMove(ev) {
        var maxLeft = window.innerWidth - panel.offsetWidth;
        var maxTop = window.innerHeight - panel.offsetHeight;
        panel.style.left = Math.max(0, Math.min(maxLeft, startLeft + (ev.clientX - startX))) + 'px';
        panel.style.top = Math.max(0, Math.min(maxTop, startTop + (ev.clientY - startY))) + 'px';
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }
  function toggleCalcPanel(kind, title) {
    if (calcPanel && calcPanelKind === kind) { closeCalcPanel(); return; }
    closeCalcPanel();
    calcPanelKind = kind;
    calcPanel = el('div', 'pr-desmos-panel');
    calcPanel.innerHTML = '<div class="pr-desmos-head"><span>' + esc(title) + '</span><button type="button" class="pr-desmos-x">&#10005;</button></div>' +
      '<div class="pr-desmos-mount"><p class="pr-desmos-status">Loading calculator…</p></div>';
    document.body.appendChild(calcPanel);
    calcPanel.querySelector('.pr-desmos-x').addEventListener('click', closeCalcPanel);
    wireCalcDrag(calcPanel, calcPanel.querySelector('.pr-desmos-head'));
    loadInto(kind);
  }
  function loadInto(kind) {
    ensureDesmos(function () {
      if (!calcPanel || calcPanelKind !== kind) return;
      var mount = calcPanel.querySelector('.pr-desmos-mount');
      if (!mount) return;
      mount.innerHTML = '';
      calcInstance = (kind === 'scientific' && window.Desmos.ScientificCalculator)
        ? window.Desmos.ScientificCalculator(mount)
        : window.Desmos.GraphingCalculator(mount);
      if (window.ResizeObserver) {
        new ResizeObserver(function () { if (calcInstance) calcInstance.resize(); }).observe(mount);
      }
    }, function () {
      if (!calcPanel || calcPanelKind !== kind) return;
      var mount = calcPanel.querySelector('.pr-desmos-mount');
      if (!mount) return;
      mount.innerHTML = '<p class="pr-desmos-status">Couldn’t load the calculator - check your connection.</p><button type="button" class="btn btn-wire pr-desmos-retry">Try again</button>';
      var retry = mount.querySelector('.pr-desmos-retry');
      if (retry) retry.addEventListener('click', function () { desmosLoad = null; mount.innerHTML = '<p class="pr-desmos-status">Loading calculator…</p>'; loadInto(kind); });
    });
  }

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

  /* ===================== reusable exam block (timed section) =====================
   * One timed section: a countdown, free Back/Next navigation, a jump palette,
   * and a selection you can change until you submit. Used by the full
   * TOEFL / IELTS Reading + Listening exams. */
  function runExamBlock(root, cfg) {
    var qs_ = cfg.questions, picked = {}, typed = {}, clozeState = {}, idx = 0;
    // "answered" covers multiple-choice (picked), typed-answer (typed), and multi-blank
    // "Complete the Words" questions (clozeState) - TOEFL Reading mixes all three
    function isAnswered(q) {
      if (q.parts && q.parts.length) {
        var st = clozeState[q.id] || {};
        return q.parts.every(function (p, pi) { return p.text != null || (st[pi] != null && st[pi] !== ''); });
      }
      return (q.choices && q.choices.length) ? picked[q.id] != null : (typed[q.id] != null && typed[q.id] !== '');
    }
    function isCorrect(q) {
      if (q.parts && q.parts.length) {
        var st = clozeState[q.id] || {};
        return q.parts.every(function (p, pi) { return p.text != null || (String(st[pi] || '').trim().toLowerCase() === String(p.blank || '').trim().toLowerCase()); });
      }
      if (q.choices && q.choices.length) return picked[q.id] === q.answer;
      var v = (typed[q.id] || '').trim().toLowerCase();
      if (!v) return false;
      var accept = [String(q.answer == null ? '' : q.answer)].concat(q.accept || []).map(function (a) { return String(a).trim().toLowerCase(); });
      return accept.indexOf(v) !== -1;
    }
    // group consecutive questions that share the same passage into one page, so a
    // multi-question reading passage shows the text once with every question stacked
    // on the right, instead of flipping through the same passage one question at a time
    var groups = [], qNum = {}, qToGroup = {};
    qs_.forEach(function (q, i) {
      qNum[q.id] = i + 1;
      var prevGroup = groups[groups.length - 1];
      if (q.passage && prevGroup && prevGroup[0].passage === q.passage) prevGroup.push(q);
      else groups.push([q]);
      qToGroup[q.id] = groups.length - 1;
    });
    var remaining = cfg.minutes * 60;
    var timerId = setInterval(function () {
      remaining--;
      var t = root.querySelector('.pr-timer');
      if (t) { t.textContent = '⏱ ' + fmtTime(remaining); if (remaining <= 60) t.classList.add('low'); }
      if (remaining <= 0) { clearInterval(timerId); timerId = null; submit(); }
    }, 1000);
    draw();

    function draw() {
      var group = groups[idx];
      var passageQ = group[0];
      root.innerHTML = '';
      var last0 = idx === groups.length - 1;
      var firstNum = qNum[group[0].id], lastNum = qNum[group[group.length - 1].id];
      var rangeLabel = group.length > 1 ? ('Questions ' + firstNum + '–' + lastNum + ' of ' + qs_.length) : ('Question ' + firstNum + ' of ' + qs_.length);

      var top = el('div', 'pr-exam-top');
      top.innerHTML =
        '<a class="pr-exit-x" href="' + esc(cfg.exitHref) + '" title="Leave the test">Exit ✕</a>' +
        '<span class="pr-timer' + (remaining <= 60 ? ' low' : '') + '">⏱ ' + fmtTime(remaining) + '</span>' +
        '<span class="pr-exam-jump">' +
          '<button type="button" class="pr-arrow" data-prev' + (idx === 0 ? ' disabled' : '') + '>◀</button>' +
          '<span class="pr-exam-qn">' + (idx + 1) + ' / ' + groups.length + '</span>' +
          '<button type="button" class="pr-arrow" data-next>' + (last0 ? '✔' : '▶') + '</button>' +
        '</span>';
      top.querySelector('.pr-exit-x').addEventListener('click', stop);
      var pv = top.querySelector('[data-prev]'); if (pv) pv.addEventListener('click', function () { if (idx > 0) { idx--; draw(); } });
      var nx = top.querySelector('[data-next]'); if (nx) nx.addEventListener('click', function () { if (last0) { review(); } else { idx++; draw(); } });
      root.appendChild(top);

      if (cfg.label) {
        var subhead = el('div', 'pr-exam-sub');
        subhead.innerHTML = '<b>' + esc(cfg.label) + '</b><span class="pr-exam-sub-sep">|</span><span>' + esc(rangeLabel) + '</span>';
        root.appendChild(subhead);
      }

      var stage = el('div', 'pr-stage');
      var card = el('div', 'pr-card');
      if (!cfg.label) card.innerHTML = '<span class="pr-kicker">' + esc(rangeLabel) + '</span>';

      var imageEl = null;
      if (passageQ.image) { imageEl = el('div', 'pr-image'); imageEl.innerHTML = '<img src="' + esc(passageQ.image) + '" alt="Question image" loading="lazy">'; }

      // every question in the group renders in its own block, stacked in the right column
      var right = el('div', 'pr-split-right');
      group.forEach(function (q) {
        var block = el('div', 'pr-exam-qblock');
        if (group.length > 1) block.appendChild(el('div', 'pr-kicker', 'Question ' + qNum[q.id]));
        if (q.audio) {
          var audioEl = el('div', 'pr-audio');
          audioEl.innerHTML = q.audioSrc ? '<audio controls src="' + esc(q.audioSrc) + '"></audio>'
            : '<div class="ph"><span class="ico">▶</span> Audio placeholder - use the transcript below.</div>' +
              (q.transcript ? '<div class="pr-transcript"><span class="tlabel">Transcript</span>' + esc(q.transcript) + '</div>' : '');
          block.appendChild(audioEl);
        }
        block.appendChild(el('div', 'pr-prompt', esc(q.prompt)));
        if (q.parts && q.parts.length) {
          // "Complete the Words" - a sentence with several typed blanks, like the
          // shared clozeBlock elsewhere, but graded live (per blank) instead of on Next
          var clozeWrap = el('div', 'cloze-text');
          var cst = clozeState[q.id] || (clozeState[q.id] = {});
          q.parts.forEach(function (p, pi) {
            if (p.text != null) { clozeWrap.appendChild(document.createTextNode(p.text)); }
            else {
              clozeWrap.appendChild(document.createTextNode(p.stem || ''));
              var cinp = document.createElement('input');
              cinp.className = 'cloze-inp'; cinp.type = 'text';
              cinp.size = Math.max(2, (p.blank || '').length);
              cinp.setAttribute('aria-label', 'missing letters');
              cinp.value = cst[pi] == null ? '' : cst[pi];
              cinp.addEventListener('input', function () { cst[pi] = cinp.value; syncPalette(); });
              clozeWrap.appendChild(cinp);
            }
          });
          block.appendChild(clozeWrap);
        } else if (q.choices && q.choices.length) {
          var wrap = el('div', 'pr-choices');
          q.choices.forEach(function (choice, i) {
            var btn = el('button', 'pr-choice' + (picked[q.id] === i ? ' picked' : ''));
            btn.type = 'button';
            btn.innerHTML = '<span class="mark">' + String.fromCharCode(65 + i) + '</span><span>' + esc(choice) + '</span>';
            btn.addEventListener('click', function () {
              picked[q.id] = i;
              wrap.querySelectorAll('.pr-choice').forEach(function (k) { k.classList.remove('picked'); });
              btn.classList.add('picked');
              syncPalette();
            });
            wrap.appendChild(btn);
          });
          block.appendChild(wrap);
        } else {
          var inp = document.createElement('input');
          inp.type = 'text'; inp.className = 'pr-gin'; inp.placeholder = 'Your answer';
          inp.value = typed[q.id] == null ? '' : typed[q.id];
          inp.addEventListener('input', function () { typed[q.id] = inp.value; syncPalette(); });
          block.appendChild(inp);
        }
        right.appendChild(block);
      });

      if (passageQ.passage) {
        // reading: the text sits on the left (photo above the text, if there is one),
        // every question sharing that passage stacked on the right - one continuous page
        var split = el('div', 'pr-split');
        var left = el('div', 'pr-split-left');
        if (imageEl) left.appendChild(imageEl);
        left.appendChild(el('div', 'pr-passage', letterHeaderHtml(passageQ) + esc(passageQ.passage)));
        split.appendChild(left);
        split.appendChild(el('div', 'bb-divider-handle', '&#9664;&#9654;'));
        split.appendChild(right);
        card.appendChild(split);
      } else {
        if (imageEl) card.appendChild(imageEl);
        card.appendChild(right);
      }
      stage.appendChild(card); root.appendChild(stage);
      root.appendChild(qbar());
      root.appendChild(floatNav(last0));
    }

    // persistent, always-visible bottom bar: section label, a number per question
    // (jump to any of them), a review/submit button - replaces the old click-to-open
    // "Track progress" overlay with something you can see and use without opening anything
    function qbar() {
      var bar = el('div', 'pr-qbar');
      bar.appendChild(el('div', 'pr-qbar-label', esc(cfg.label || 'Questions')));
      var nums = el('div', 'pr-qbar-nums');
      qs_.forEach(function (q, i) {
        var b = el('button', 'pr-qnum' + (qToGroup[q.id] === idx ? ' current' : '') + (isAnswered(q) ? ' done' : ''), String(i + 1));
        b.type = 'button'; b.setAttribute('data-i', i);
        b.addEventListener('click', function () { idx = qToGroup[q.id]; draw(); });
        nums.appendChild(b);
      });
      bar.appendChild(nums);
      bar.appendChild(el('div', 'pr-qbar-spacer'));
      var reviewBtn = el('button', 'pr-qbar-review', '&#10003;');
      reviewBtn.type = 'button'; reviewBtn.title = 'Review & submit';
      reviewBtn.addEventListener('click', review);
      bar.appendChild(reviewBtn);
      return bar;
    }

    // Back/Next float above the bottom bar - on the last question, Next becomes Review
    function floatNav(last0) {
      var wrap = el('div', 'pr-qbar-floatnav');
      var back = el('button', '', '&#8592;'); back.type = 'button'; back.title = 'Back';
      if (idx === 0) back.setAttribute('disabled', '');
      back.addEventListener('click', function () { if (idx > 0) { idx--; draw(); } });
      var next = el('button', '', last0 ? '&#10003;' : '&#8594;'); next.type = 'button'; next.title = last0 ? 'Review & submit' : 'Next';
      next.addEventListener('click', function () { if (last0) { review(); } else { idx++; draw(); } });
      wrap.appendChild(back); wrap.appendChild(next);
      return wrap;
    }

    function palette(inReview) {
      var p = el('div', 'pr-palette');
      var grid = el('div', 'pr-palette-grid');
      qs_.forEach(function (q, i) {
        var b = el('button', 'pr-dot' + (!inReview && qToGroup[q.id] === idx ? ' current' : '') + (isAnswered(q) ? ' done' : ''));
        b.type = 'button'; b.textContent = i + 1; b.setAttribute('data-i', i);
        b.addEventListener('click', function () { idx = qToGroup[q.id]; draw(); });
        grid.appendChild(b);
      });
      p.appendChild(grid);
      return p;
    }

    // mark the just-answered question green wherever its number appears (live bottom bar
    // and/or the review screen's bigger grid)
    function syncPalette() {
      qs_.forEach(function (q, i) {
        var done = isAnswered(q);
        var dot = root.querySelector('.pr-dot[data-i="' + i + '"]');
        if (dot) dot.classList.toggle('done', done);
        var qn = root.querySelector('.pr-qnum[data-i="' + i + '"]');
        if (qn) qn.classList.toggle('done', done);
      });
    }

    function review() {
      var un = qs_.filter(function (q) { return !isAnswered(q); }).length;
      root.innerHTML = '';
      var top = el('div', 'pr-exam-top');
      top.innerHTML =
        '<span class="pr-exit-x" style="visibility:hidden">Exit ✕</span>' +
        '<span class="pr-timer">⏱ ' + fmtTime(remaining) + '</span><span></span>';
      root.appendChild(top);
      var stage = el('div', 'pr-stage'); var card = el('div', 'pr-card');
      card.innerHTML =
        '<span class="pr-kicker">Before you submit</span>' +
        '<h2 class="pr-prompt" style="margin-top:8px">Review</h2>' +
        '<div class="pr-passage" style="border:0;padding-left:0">You answered <b>' + (qs_.length - un) + '</b> of <b>' + qs_.length + '</b>. ' +
        (un ? 'Still unanswered: <b>' + un + '</b> - tap a number below to go back.' : 'All answered. You can still change any answer before submitting.') +
        ' ' + esc(cfg.submitNote || 'Once you submit, this section locks.') + '</div>';
      card.appendChild(palette(true));
      stage.appendChild(card); root.appendChild(stage);
      var n = el('div', 'pr-nav');
      var backBtn = el('button', 'btn btn-wire', '← Keep working'); backBtn.type = 'button';
      backBtn.addEventListener('click', function () { draw(); });
      var btns = el('div', 'pr-navbtns');
      var sb = el('button', 'btn btn-white', 'Submit →'); sb.type = 'button';
      sb.addEventListener('click', submit);
      btns.appendChild(sb);
      n.appendChild(backBtn); n.appendChild(btns);
      root.appendChild(n);
    }

    function stop() { if (timerId) { clearInterval(timerId); timerId = null; } }
    function submit() {
      stop();
      var mc = 0;
      qs_.forEach(function (q) { if (isCorrect(q)) mc++; });
      cfg.onDone(mc, qs_.length);
    }
  }

  /* ===================== full TOEFL / IELTS test (Reading + Listening) =====================
   * A complete, timed exam: Reading first, then Listening, each on its own
   * clock, scored on the real scale (TOEFL /120 estimate, IELTS overall band). */
  function renderFullExam(root, examId) {
    document.body.classList.add('ws-white', 'pr-examroom', 'exam-' + examId);
    var NAME = examId === 'toefl' ? 'TOEFL' : 'IELTS';
    var home = examId + '.html';
    // as of the January 2026 redesign, TOEFL Reading and Listening are both multistage
    // adaptive - two modules each, module 1 the same for everyone, module 2 harder or
    // easier depending on module 1 performance (same idea as the Digital SAT elsewhere
    // in this app). IELTS format is unchanged.
    // TOEFL runs Reading then Listening; the real IELTS test runs Listening first, then
    // Reading (Writing follows on the same day - not part of this app's full test)
    var SECTIONS = examId === 'toefl'
      ? [{ key: 'reading', name: 'Reading', minutes: 30 }, { key: 'listening', name: 'Listening', minutes: 27 }]
      : [{ key: 'listening', name: 'Listening', minutes: 30 }, { key: 'reading', name: 'Reading', minutes: 60 }];
    // the real test always presents each section's task types in this order (with a
    // shuffled sample of each type in every module) rather than a random mix
    var TYPE_ORDER = {
      toefl: { reading: ['complete-the-words', 'daily-life', 'whole-text'], listening: ['best-response', 'dialogues', 'lectures'] }
    };
    SECTIONS = SECTIONS.filter(function (s) { return BeaconStore.questionsFor(examId, s.key, null).length > 0; });
    if (!SECTIONS.length) {
      root.innerHTML = errorCard('This test isn’t ready yet.', 'Add ' + NAME + ' Reading or Listening questions in the admin panel first.');
      return;
    }

    // task-type tables shown on each section's intro screen, matching the real exam's
    // own section-overview screens
    var TASK_TABLES = {
      toefl: {
        reading: [['Complete the Words', 'Fill in the missing letters in a paragraph.'],
          ['Read in Daily Life', 'Answer questions about everyday reading material.'],
          ['Read an Academic Passage', 'Answer questions about academic passages.']],
        listening: [['Best Response', 'Choose the best reply to a short spoken line.'],
          ['Short Dialogues', 'Answer questions on quick two-person conversations.'],
          ['Lectures & Announcements', 'Answer questions on academic talks and campus notices.']]
      },
      ielts: {
        reading: [['Academic Passage', 'Answer a mixed set of questions about one reading passage.']],
        listening: [['Conversations & Monologues', 'Answer questions from everyday and academic recordings.']]
      }
    };

    var results = [], si = 0;
    hardwareCheck();

    function hardwareCheck() {
      root.innerHTML = '';
      var c = el('div', 'pr-stage'); var card = el('div', 'pr-card');
      card.innerHTML =
        '<span class="pr-kicker">' + NAME + ' · full test</span>' +
        '<h2 class="pr-prompt" style="margin-top:8px">Hardware Check</h2>' +
        '<div class="pr-passage" style="border:0;padding-left:0">Before the test begins, we will check the microphone and headset volume.</div>' +
        '<div class="pr-hwcheck-icons"><span>🎤</span><span>🎧</span><span>🔊</span></div>' +
        '<div class="pr-passage" style="border:0;padding-left:0">Please make sure your headset is on. Follow the instructions on each screen. Be sure that ' +
        'your microphone is properly positioned and adjusted to allow for the best possible recording. Speak directly into the microphone and in your normal speaking voice.</div>' +
        '<div class="pr-nav"><a class="btn btn-wire pr-exit" href="' + home + '">← Back</a>' +
        '<div class="pr-navbtns"><button type="button" class="btn btn-white" id="fx-hw-go">Continue →</button></div></div>';
      c.appendChild(card); root.appendChild(c);
      document.getElementById('fx-hw-go').onclick = intro;
    }

    function intro() {
      var struct = examId === 'toefl'
        ? 'The official TOEFL Reading is 50 questions across two adaptive modules in 30 min; Listening is about 47 items across two adaptive modules in around 27 min. Module 2 gets harder or easier depending on how you do in Module 1.'
        : 'Official IELTS Reading and Listening are 40 questions each (60 min and about 30 min). Unlike TOEFL, IELTS is a fixed, non-adaptive test.';
      var firstName = SECTIONS[0].name, secondName = SECTIONS[1] ? SECTIONS[1].name : null;
      root.innerHTML = '';
      var c = el('div', 'pr-stage'); var card = el('div', 'pr-card');
      card.innerHTML =
        '<span class="pr-kicker">' + NAME + ' · full test</span>' +
        '<h2 class="pr-prompt" style="margin-top:8px">Full ' + NAME + ' - Reading <span class="amp">&amp;</span> Listening</h2>' +
        '<div class="pr-passage" style="border:0;padding-left:0">A complete, timed exam: <b>' + esc(firstName) + '</b> first' +
        (secondName ? ', then <b>' + esc(secondName) + '</b>, each on its own clock. ' : '. ') +
        'No feedback until the end. ' + struct + ' This one is built from the questions in the bank, so it may be shorter - timing and scoring work the same way.</div>' +
        '<div class="pr-nav"><a class="btn btn-wire pr-exit" href="' + home + '">← Back</a>' +
        '<div class="pr-navbtns"><button type="button" class="btn btn-white" id="fx-start">Start the test →</button></div></div>';
      c.appendChild(card); root.appendChild(c);
      document.getElementById('fx-start').onclick = function () { si = 0; sectionIntro(); };
    }

    function sectionIntro(prevName) {
      var sec = SECTIONS[si];
      var rows = (TASK_TABLES[examId] && TASK_TABLES[examId][sec.key]) || [];
      root.innerHTML = '';
      var c = el('div', 'pr-stage'); var card = el('div', 'pr-card');
      var tableHtml = rows.length
        ? '<table class="pr-tasktable"><thead><tr><th>Type of Task</th><th>Description</th></tr></thead><tbody>' +
          rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td></tr>'; }).join('') +
          '</tbody></table>'
        : '';
      card.innerHTML =
        '<span class="pr-kicker">' + esc(NAME) + '</span>' +
        '<h2 class="pr-prompt" style="margin-top:8px">' + esc(sec.name) + ' Section</h2>' +
        (prevName ? '<div class="pr-passage" style="border:0;padding-left:0"><b>' + esc(prevName) + '</b> is complete. Next up: <b>' + esc(sec.name) + '</b>, ' + sec.minutes + ' minutes on its own clock.</div>' : '') +
        '<div class="pr-passage" style="border:0;padding-left:0">In the ' + esc(sec.name) + ' section, you will answer questions to demonstrate your English skills. ' +
        (rows.length ? 'There ' + (rows.length === 1 ? 'is one type of task' : 'are ' + rows.length + ' types of tasks') + '.' : '') + '</div>' +
        tableHtml +
        '<div class="pr-nav"><span></span><div class="pr-navbtns"><button type="button" class="btn btn-white" id="fx-begin">Begin →</button></div></div>';
      c.appendChild(card); root.appendChild(c);
      document.getElementById('fx-begin').onclick = runSec;
    }

    // split a section's pool into two roughly-even, type-ordered halves: mod1 (the fixed
    // first module) and a candidate pool for mod2 to draw from once we know the path
    function splitForModules(all, typeOrder) {
      if (!typeOrder) { var s = shuffle(all.slice()); var half = Math.ceil(s.length / 2); return { mod1: s.slice(0, half), rest: s.slice(half) }; }
      var buckets = {};
      all.forEach(function (q) { (buckets[q.type] = buckets[q.type] || []).push(q); });
      var mod1 = [], rest = [];
      typeOrder.forEach(function (t) {
        var group = shuffle((buckets[t] || []).slice());
        var half = Math.ceil(group.length / 2);
        mod1 = mod1.concat(group.slice(0, half));
        rest = rest.concat(group.slice(half));
      });
      return { mod1: mod1, rest: rest };
    }

    // module 2's questions: prefer the target difficulty from the leftover pool, keep the
    // real task-type order, fall back to whatever's left if the bank is too small
    function pickModule2(rest, path, typeOrder) {
      var pref = rest.filter(function (q) { return (q.difficulty || 'medium') === path; });
      var others = rest.filter(function (q) { return pref.indexOf(q) === -1; });
      var combined = pref.concat(others);
      if (!typeOrder) return combined;
      var buckets = {};
      combined.forEach(function (q) { (buckets[q.type] = buckets[q.type] || []).push(q); });
      var out = [];
      typeOrder.forEach(function (t) { if (buckets[t]) out = out.concat(buckets[t]); });
      return out;
    }

    function runSec() {
      var sec = SECTIONS[si];
      if (examId === 'ielts' && sec.key === 'reading') {
        // IELTS Reading questions are always full multi-block passages, not single
        // choice questions - they need the block-based runner, not runExamBlock
        var texts = pickReadingTexts(examId);
        if (!texts.length) { finishSec(sec, { correct: 0, total: 0 }); return; }
        runReadingBlock(root, {
          texts: texts,
          minutes: sec.minutes,
          exitHref: home,
          submitNote: 'Once you submit, this section locks and you move on.',
          onDone: function (correct, total) { finishSec(sec, { correct: correct, total: total }); }
        });
        return;
      }
      var typeOrder = TYPE_ORDER[examId] && TYPE_ORDER[examId][sec.key];
      var all = BeaconStore.questionsFor(examId, sec.key, null).slice();
      if (examId !== 'toefl') {
        // IELTS Listening keeps the existing single-pool, single-timer section (unchanged)
        runExamBlock(root, {
          label: sec.name,
          questions: shuffle(all),
          minutes: sec.minutes,
          exitHref: home,
          submitNote: 'Once you submit, this section locks and you move on.',
          onDone: function (mc, total) { finishSec(sec, { correct: mc, total: total }); }
        });
        return;
      }
      var split = splitForModules(all, typeOrder);
      runModule(sec, 1, split.mod1, split.rest, typeOrder, { correct: 0, total: 0 });
    }

    function runModule(sec, moduleNo, questions, rest, typeOrder, secState) {
      if (!questions.length) { finishSec(sec, secState); return; }
      runExamBlock(root, {
        label: sec.name,
        questions: questions,
        minutes: Math.max(3, Math.round(sec.minutes / 2)),
        exitHref: home,
        submitNote: moduleNo === 1 ? 'Once you submit this module, Module 2 adapts to how you did here.' : 'Once you submit, this section locks and you move on.',
        onDone: function (mc, total) {
          secState.correct += mc; secState.total += total;
          if (moduleNo === 1 && rest.length) {
            var pct = total ? mc / total : 0;
            var path = pct >= 0.6 ? 'hard' : 'easy';
            var mod2 = pickModule2(rest, path, typeOrder);
            moduleBreak(sec, function () { runModule(sec, 2, mod2, [], typeOrder, secState); });
          } else {
            finishSec(sec, secState);
          }
        }
      });
    }

    function moduleBreak(sec, go) {
      root.innerHTML = '';
      var c = el('div', 'pr-stage'); var card = el('div', 'pr-card');
      card.innerHTML =
        '<span class="pr-kicker">' + esc(NAME) + '</span>' +
        '<h2 class="pr-prompt" style="margin-top:8px">Module 1 complete</h2>' +
        '<div class="pr-passage" style="border:0;padding-left:0">Starting Module 2 of <b>' + esc(sec.name) + '</b> - it has adapted to how you did in Module 1. No going back now.</div>' +
        '<div class="pr-nav"><span></span><div class="pr-navbtns"><button type="button" class="btn btn-white" id="fx-mod-go">Continue →</button></div></div>';
      c.appendChild(card); root.appendChild(c);
      document.getElementById('fx-mod-go').onclick = go;
    }

    function finishSec(sec, secState) {
      results.push({ name: sec.name, correct: secState.correct, total: secState.total });
      var doneName = sec.name;
      si++;
      if (si < SECTIONS.length) sectionIntro(doneName);
      else finish();
    }

    function finish() {
      var allC = 0, allT = 0;
      results.forEach(function (r) { allC += r.correct; allT += r.total; });
      var overallPct = allT ? allC / allT * 100 : 0;

      var rows = results.map(function (r) {
        var pct = r.total ? Math.round(r.correct / r.total * 100) : 0;
        var mark = examId === 'toefl' ? Math.round(pct / 100 * 30) : ieltsBand(pct).toFixed(1);
        var unit = examId === 'toefl' ? ' / 30' : ' band';
        return '<div class="pr-rev ok"><span class="pr-rev-n">' + esc(r.name.slice(0, 1)) + '</span>' +
          '<div class="pr-rev-main"><div class="pr-rev-q">' + esc(r.name) + '</div>' +
          '<div class="pr-rev-a"><b>' + mark + unit + '</b> · ' + r.correct + '/' + r.total + ' correct</div></div>' +
          '<span class="pr-rev-mark">' + mark + '</span></div>';
      }).join('');

      var recorded, big, sub, pass;
      if (examId === 'toefl') {
        recorded = Math.round(overallPct / 100 * 120);
        big = String(recorded); sub = 'TOEFL · estimated Reading + Listening · /120'; pass = recorded >= 80;
      } else {
        var bands = results.map(function (r) { return ieltsBand(r.total ? Math.round(r.correct / r.total * 100) : 0); });
        var avg = bands.reduce(function (a, b) { return a + b; }, 0) / bands.length;
        recorded = Math.round(avg * 2) / 2;
        big = recorded.toFixed(1); sub = 'IELTS · overall band (Reading + Listening) · 0–9'; pass = recorded >= 6;
      }
      if (window.BeaconStore && BeaconStore.recordScore) BeaconStore.recordScore(examId, recorded);

      root.innerHTML =
        '<div class="pr-stage"><div class="pr-result">' +
        '<div class="pr-score ' + (pass ? 'pass' : 'fail') + '"><span class="pct">' + big + '</span><span class="frac">' + esc(sub) + '</span></div>' +
        '<div class="pr-review">' + rows + '</div>' +
        '<div class="pr-passage" style="border:0;padding-left:0;font-size:.9rem;color:#7c88a3">An estimate from your Reading + Listening answers - a study guide, not an official score. Saved to your profile average.</div>' +
        '<div class="fin-actions">' +
        '<a class="btn btn-white" href="' + home + '">Back to ' + NAME + '</a>' +
        '<a class="btn btn-wire" href="practice.html?mode=full&exam=' + examId + '">Retake test</a>' +
        '</div></div></div>';
    }
  }

  // pick the 3 real reading texts for an exam, one per difficulty (easy/medium/hard)
  // where available - shared by the standalone Reading test and the full test's Reading section
  function pickReadingTexts(examId) {
    var all = BeaconStore.allQuestions().filter(function (q) {
      return q.exam === examId && q.skill === 'reading' && q.blocks && q.blocks.length;
    });
    var texts = [];
    ['easy', 'medium', 'hard'].forEach(function (d) {
      var first = all.filter(function (q) { return (q.difficulty || 'medium') === d; })[0];
      if (first) texts.push(first);
    });
    if (texts.length < Math.min(3, all.length)) texts = all.slice(0, 3);
    return texts;
  }

  /* ===================== full IELTS Reading test (3 texts, one clock) =====================
   * Three passages (easy → medium → hard), each with mixed question blocks, a
   * single 60-minute timer, no feedback until you submit, then a Reading band. */
  function renderReadingExam(root, examId) {
    document.body.classList.add('ws-white');
    var home = qs('ret') || (examId + '.html#reading');
    var NAME = examId === 'toefl' ? 'TOEFL' : 'IELTS';
    var texts = pickReadingTexts(examId);
    if (!texts.length) {
      root.innerHTML = errorCard('This test isn’t ready yet.', 'Add IELTS Reading passages (★ Full passage) in the admin panel first.');
      return;
    }
    var MIN = 60;
    intro();

    function intro() {
      root.innerHTML = '';
      var c = el('div', 'pr-stage'); var card = el('div', 'pr-card');
      var totalQ = texts.reduce(function (a, q) { return a + (q.blocks || []).reduce(function (aa, b) { return aa + ((b.items || []).length); }, 0); }, 0);
      card.innerHTML =
        '<span class="pr-kicker">' + NAME + ' · full Reading test</span>' +
        '<h2 class="pr-prompt" style="margin-top:8px">' + texts.length + ' parts · ' + totalQ + ' questions · ' + MIN + ' minutes</h2>' +
        '<div class="pr-passage" style="border:0;padding-left:0">Exam conditions: the passages get harder (Part 1 → Part ' + texts.length + '), the clock runs across all of them, and there is <b>no feedback until you submit</b>. Move between parts and questions freely - your answers are kept. At the end you get an overall <b>Reading band</b>.</div>' +
        '<div class="pr-nav"><a class="btn btn-wire" href="' + home + '">← Back</a>' +
        '<div class="pr-navbtns"><button type="button" class="btn btn-white" id="rx-start">Start the test →</button></div></div>';
      c.appendChild(card); root.appendChild(c);
      document.getElementById('rx-start').onclick = function () {
        runReadingBlock(root, {
          texts: texts, minutes: MIN, exitHref: home,
          submitNote: 'Once you submit, the test locks and is scored.',
          onDone: function (correct, total, perText) { showResult(correct, total, perText); }
        });
      };
    }

    function showResult(correct, total, perText) {
      var pct = total ? Math.round(correct / total * 100) : 0;
      var sc = examScore(examId, 'reading', correct, total);
      if (BeaconStore.recordScore) BeaconStore.recordScore(examId, examId === 'ielts' ? ieltsBand(pct) : pct);

      var rows = perText.map(function (r, i) {
        var p = r.total ? Math.round(r.correct / r.total * 100) : 0;
        var mark = examId === 'ielts' ? ieltsBand(p).toFixed(1) : p + '%';
        return '<div class="pr-rev ok"><span class="pr-rev-n">' + (i + 1) + '</span>' +
          '<div class="pr-rev-main"><div class="pr-rev-q">' + esc(r.name) + '</div>' +
          '<div class="pr-rev-a"><b>' + mark + '</b> · ' + r.correct + '/' + r.total + ' correct</div></div>' +
          '<span class="pr-rev-mark">' + mark + '</span></div>';
      }).join('');

      root.innerHTML =
        '<div class="pr-stage"><div class="pr-result">' +
        '<div class="pr-score ' + (sc.pass ? 'pass' : 'fail') + '"><span class="pct">' + sc.big + '</span><span class="frac">' + esc(sc.sub) + '</span></div>' +
        '<div class="pr-review">' + rows + '</div>' +
        '<div class="pr-passage" style="border:0;padding-left:0;font-size:.9rem;color:#7c88a3">An estimate from the band tables - a study guide, not an official score. Saved to your profile average.</div>' +
        '<div class="fin-actions">' +
        '<a class="btn btn-white" href="' + home + '">Back to ' + NAME + '</a>' +
        '<a class="btn btn-wire" href="practice.html?mode=readingtest&exam=' + examId + '">Retake test</a>' +
        '</div></div></div>';
    }
  }

  /* ===================== reusable reading-passage exam block (multi-text, blocks-based) =====================
   * Runs a fixed set of full-passage texts on one shared clock, free Back/Next
   * navigation, no feedback until submit - the engine behind renderReadingExam above,
   * and also reused for the Reading section of the combined full IELTS test (IELTS
   * Reading questions are always multi-block full passages, not single choice
   * questions, so they need this renderer rather than the plain runExamBlock one). */
  function runReadingBlock(root, cfg) {
    var texts = cfg.texts;
    var state = texts.map(function () { return {}; });   // state[ti]['bi-ii'] = value
    var ti = 0, remaining = cfg.minutes * 60, timerId = null;

    function answeredIn(i) {
      var q = texts[i], st = state[i], a = 0, t = 0;
      (q.blocks || []).forEach(function (bl, bi) {
        (bl.items || []).forEach(function (it, ii) { t++; var v = st[bi + '-' + ii]; if (v != null && v !== '') a++; });
      });
      return { a: a, t: t };
    }

    function startClock() {
      if (timerId) return;
      timerId = setInterval(function () {
        remaining--;
        var t = root.querySelector('.pr-timer');
        if (t) { t.textContent = '⏱ ' + fmtTime(remaining); if (remaining <= 60) t.classList.add('low'); }
        if (remaining <= 0) { clearInterval(timerId); timerId = null; submit(); }
      }, 1000);
    }
    function stopClock() { if (timerId) { clearInterval(timerId); timerId = null; } }

    startClock();
    draw();

    function draw() {
      var q = texts[ti];
      root.innerHTML = '';
      var last0 = ti === texts.length - 1;
      var top = el('div', 'pr-exam-top');
      top.innerHTML =
        '<a class="pr-exit-x" href="' + esc(cfg.exitHref) + '" title="Leave the test">Exit ✕</a>' +
        '<span class="pr-timer' + (remaining <= 60 ? ' low' : '') + '">⏱ ' + fmtTime(remaining) + '</span>' +
        '<span class="pr-exam-jump">' +
          '<button type="button" class="pr-arrow" data-prev' + (ti === 0 ? ' disabled' : '') + '>◀</button>' +
          '<span class="pr-exam-qn">Part ' + (ti + 1) + ' / ' + texts.length + '</span>' +
          '<button type="button" class="pr-arrow" data-next>' + (last0 ? '✔' : '▶') + '</button>' +
        '</span>';
      top.querySelector('.pr-exit-x').addEventListener('click', stopClock);
      var pv = top.querySelector('[data-prev]'); if (pv) pv.addEventListener('click', function () { if (ti > 0) { ti--; draw(); } });
      var nx = top.querySelector('[data-next]'); nx.addEventListener('click', function () { if (last0) review(); else { ti++; draw(); } });
      root.appendChild(top);

      var subhead = el('div', 'pr-exam-sub');
      subhead.innerHTML = '<b>Part ' + (ti + 1) + '</b><span class="pr-exam-sub-sep">|</span><span>Read the text and answer the questions.</span>';
      root.appendChild(subhead);

      var stage = el('div', 'pr-stage');
      var card = el('div', 'pr-card');

      var split = el('div', 'pr-split');
      var left = el('div', 'pr-split-left');
      if (q.title) left.appendChild(el('div', 'pr-prompt', esc(q.title)));
      if (q.image) { var fig = el('div', 'pr-image'); fig.innerHTML = '<img src="' + esc(q.image) + '" alt="Reading figure" loading="lazy">'; left.appendChild(fig); }
      left.appendChild(el('div', 'pr-passage', letterHeaderHtml(q) + esc(q.passage || '')));
      var right = el('div', 'pr-split-right');
      right.appendChild(examBlocks(q, ti));
      split.appendChild(left);
      split.appendChild(el('div', 'bb-divider-handle', '&#9664;&#9654;'));
      split.appendChild(right);
      card.appendChild(split);
      stage.appendChild(card); root.appendChild(stage);
      root.appendChild(qbar());
      root.appendChild(floatNav(last0));
    }

    // persistent bottom bar: the current Part's own question numbers (click to scroll to
    // that question - everything in a Part is on one page, there's no separate page per
    // question), plus every other Part shown as a clickable "Part N - A of T" summary
    function qbar() {
      var bar = el('div', 'pr-qbar');
      texts.forEach(function (q, i) {
        if (i === ti) {
          var seg = el('div', 'pr-qbar-active');
          seg.appendChild(el('span', 'pr-qbar-label', 'Part ' + (i + 1)));
          var nums = el('div', 'pr-qbar-nums');
          var st = state[i], n = 1;
          (q.blocks || []).forEach(function (bl, bi) {
            (bl.items || []).forEach(function (it, ii) {
              var key = bi + '-' + ii, num = n++;
              var answered = st[key] != null && st[key] !== '';
              var b = el('button', 'pr-qnum' + (answered ? ' done' : ''), String(num));
              b.type = 'button';
              b.addEventListener('click', function () {
                var rowEl = root.querySelector('.pr-gitem[data-qkey="' + key + '"]');
                if (rowEl) rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              });
              nums.appendChild(b);
            });
          });
          seg.appendChild(nums);
          bar.appendChild(seg);
        } else {
          var r = answeredIn(i);
          var other = el('button', 'pr-qbar-other');
          other.type = 'button';
          other.innerHTML = '<b>Part ' + (i + 1) + '</b><span class="pr-qbar-count">' + r.a + ' of ' + r.t + '</span>';
          other.addEventListener('click', function () { ti = i; draw(); });
          bar.appendChild(other);
        }
      });
      bar.appendChild(el('div', 'pr-qbar-spacer'));
      var reviewBtn = el('button', 'pr-qbar-review', '&#10003;');
      reviewBtn.type = 'button'; reviewBtn.title = 'Review & submit';
      reviewBtn.addEventListener('click', review);
      bar.appendChild(reviewBtn);
      return bar;
    }

    function floatNav(last0) {
      var wrap = el('div', 'pr-qbar-floatnav');
      var back = el('button', '', '&#8592;'); back.type = 'button'; back.title = 'Previous part';
      if (ti === 0) back.setAttribute('disabled', '');
      back.addEventListener('click', function () { if (ti > 0) { ti--; draw(); } });
      var next = el('button', '', last0 ? '&#10003;' : '&#8594;'); next.type = 'button'; next.title = last0 ? 'Review & submit' : 'Next part';
      next.addEventListener('click', function () { if (last0) review(); else { ti++; draw(); } });
      wrap.appendChild(back); wrap.appendChild(next);
      return wrap;
    }

    // render one text's blocks with inputs bound to state (no checking, no reveal)
    function examBlocks(q, i) {
      var wrap = el('div', 'pr-pset');
      var st = state[i], num = 1;
      (q.blocks || []).forEach(function (bl, bi) {
        var sec = el('div', 'pr-pblock');
        if (bl.prompt) sec.appendChild(el('div', 'pr-bprompt', esc(bl.prompt)));
        var opts = (bl.kind === 'matching' && bl.options && bl.options.length) ? bl.options : null;
        (bl.items || []).forEach(function (it, ii) {
          var key = bi + '-' + ii, n = num++;
          var row = el('div', 'pr-gitem' + (bl.kind === 'choice' ? ' pr-mcitem' : ''));
          row.setAttribute('data-qkey', key);
          row.appendChild(el('div', 'pr-gq', '<span class="pr-gn">' + n + '.</span> ' + esc(it.prompt || '')));
          if (bl.kind === 'choice') {
            var ch = el('div', 'pr-choices pr-mcchoices');
            (it.choices || []).forEach(function (c, ci) {
              var b = el('button', 'pr-choice' + (st[key] === ci ? ' picked' : '')); b.type = 'button';
              b.innerHTML = '<span class="mark">' + String.fromCharCode(65 + ci) + '</span><span>' + esc(c) + '</span>';
              b.addEventListener('click', function () {
                st[key] = ci;
                ch.querySelectorAll('.pr-choice').forEach(function (k) { k.classList.remove('picked'); });
                b.classList.add('picked'); syncPalette();
              });
              ch.appendChild(b);
            });
            row.appendChild(ch);
          } else if (opts) {
            var s = document.createElement('select'); s.className = 'pr-gsel';
            s.innerHTML = '<option value="">-</option>' + opts.map(function (o) { return '<option value="' + esc(o) + '"' + (st[key] === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('');
            s.addEventListener('change', function () { st[key] = s.value; syncPalette(); });
            row.appendChild(s);
          } else {
            var inp = document.createElement('input'); inp.type = 'text'; inp.className = 'pr-gin'; inp.placeholder = 'Your answer';
            inp.value = st[key] == null ? '' : st[key];
            inp.addEventListener('input', function () { st[key] = inp.value; syncPalette(); });
            row.appendChild(inp);
          }
          sec.appendChild(row);
        });
        wrap.appendChild(sec);
      });
      return wrap;
    }

    function palette(inReview) {
      var p = el('div', 'pr-palette');
      var grid = el('div', 'pr-palette-grid');
      texts.forEach(function (_, i) {
        var r = answeredIn(i);
        var b = el('button', 'pr-dot' + (!inReview && i === ti ? ' current' : '') + (r.t > 0 && r.a === r.t ? ' done' : ''));
        b.type = 'button'; b.textContent = 'Part ' + (i + 1); b.setAttribute('data-i', i);
        b.addEventListener('click', function () { ti = i; draw(); });
        grid.appendChild(b);
      });
      p.appendChild(grid);
      return p;
    }

    // re-render the live bottom bar in place so its done-marks and "N of T" counts stay
    // current as you fill in answers (cheap - it's a small bar, not the whole page)
    function syncPalette() {
      var old = root.querySelector('.pr-qbar');
      if (old) old.replaceWith(qbar());
    }

    function review() {
      var totA = 0, totT = 0;
      texts.forEach(function (_, i) { var r = answeredIn(i); totA += r.a; totT += r.t; });
      var un = totT - totA;
      root.innerHTML = '';
      var top = el('div', 'pr-exam-top');
      top.innerHTML = '<span class="pr-exit-x" style="visibility:hidden">Exit ✕</span><span class="pr-timer">⏱ ' + fmtTime(remaining) + '</span><span></span>';
      root.appendChild(top);
      var stage = el('div', 'pr-stage'); var card = el('div', 'pr-card');
      card.innerHTML =
        '<span class="pr-kicker">Before you submit</span>' +
        '<h2 class="pr-prompt" style="margin-top:8px">Review</h2>' +
        '<div class="pr-passage" style="border:0;padding-left:0">You answered <b>' + totA + '</b> of <b>' + totT + '</b>. ' +
        (un ? 'Still unanswered: <b>' + un + '</b> - tap a part below to go back.' : 'All answered. You can still change anything before submitting.') +
        ' ' + esc(cfg.submitNote || 'Once you submit, the test locks and is scored.') + '</div>';
      card.appendChild(palette(true));
      stage.appendChild(card); root.appendChild(stage);
      var n = el('div', 'pr-nav');
      var backBtn = el('button', 'btn btn-wire', '← Keep working'); backBtn.type = 'button';
      backBtn.addEventListener('click', function () { draw(); });
      var btns = el('div', 'pr-navbtns');
      var sb = el('button', 'btn btn-white', 'Submit →'); sb.type = 'button';
      sb.addEventListener('click', submit);
      btns.appendChild(sb);
      n.appendChild(backBtn); n.appendChild(btns);
      root.appendChild(n);
    }

    function submit() {
      stopClock();
      var correct = 0, total = 0, perText = [];
      texts.forEach(function (q, i) {
        var st = state[i], c = 0, t = 0;
        (q.blocks || []).forEach(function (bl, bi) {
          (bl.items || []).forEach(function (it, ii) {
            t++; total++;
            var v = st[bi + '-' + ii], ok = false;
            if (bl.kind === 'choice') ok = (v === it.answer);
            else if (bl.kind === 'matching') ok = (v != null && String(v).trim().toUpperCase() === String(it.answer == null ? '' : it.answer).trim().toUpperCase());
            else ok = (v != null && String(v).trim().toLowerCase() === String(it.answer == null ? '' : it.answer).trim().toLowerCase());
            if (ok) { c++; correct++; }
          });
        });
        perText.push({ name: 'Part ' + (i + 1) + (q.difficulty ? ' · ' + q.difficulty : ''), correct: c, total: t });
      });
      cfg.onDone(correct, total, perText);
    }
  }

  /* ============================ exports + autorun ============================ */
  window.BeaconStore = BeaconStore;
  window.renderWorkspace = renderWorkspace;
  window.renderPractice = renderPractice;

  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('practice')) renderPractice('#practice');
  });
})();
