/**
 * RULE ENGINE · rules.js
 * Features:
 *  - Input normalization (fix common typos, slang, internet shorthand)
 *  - Fuzzy keyword matching (no strict word boundaries)
 *  - 40+ topic categories
 *  - Human-like casual responses
 *  - No mention of being a bot/AI/system anywhere
 */

// ─────────────────────────────────────────
//  STEP 1 — NORMALIZE INPUT
//  Fix typos, slang, abbreviations before matching
// ─────────────────────────────────────────
function normalizeInput(raw) {
  let s = raw.toLowerCase().trim();

  // Common typos & shorthand → standard words
  const fixes = [
    // greetings
    [/\bhelo+\b/g,          "hello"],
    [/\bhllo\b/g,           "hello"],
    [/\bheloo\b/g,          "hello"],
    [/\bheyy+\b/g,          "hey"],
    [/\bhai\b/g,            "hi"],
    [/\bhii+\b/g,           "hi"],
    [/\bhullo\b/g,          "hello"],
    [/\bwazz?up\b/g,        "whats up"],
    [/\bwuts?up\b/g,        "whats up"],
    [/\bwassup\b/g,         "whats up"],
    [/\bhru\b/g,            "how are you"],
    [/\bru ok\b/g,          "are you okay"],
    [/\bhows? it goin\b/g,  "how is it going"],

    // thanks
    [/\bthx\b/g,   "thanks"],
    [/\bty\b/g,    "thank you"],
    [/\bthnx\b/g,  "thanks"],
    [/\bthkn?s\b/g,"thanks"],
    [/\btnx\b/g,   "thanks"],

    // goodbye
    [/\bbb?ye+\b/g,   "bye"],
    [/\bgoodby+\b/g,  "goodbye"],
    [/\bcya\b/g,      "see you"],
    [/\bc u\b/g,      "see you"],
    [/\bgtg\b/g,      "got to go"],
    [/\bg2g\b/g,      "got to go"],
    [/\bttyl\b/g,     "talk to you later"],
    [/\bttys\b/g,     "talk to you soon"],

    // sorry
    [/\bsorri\b/g,  "sorry"],
    [/\bsori\b/g,   "sorry"],
    [/\bsorry+\b/g, "sorry"],

    // questions
    [/\bwat\b/g,    "what"],
    [/\bwht\b/g,    "what"],
    [/\bwts\b/g,    "whats"],
    [/\bwats\b/g,   "whats"],
    [/\bwhats\b/g,  "what is"],
    [/\bwanna\b/g,  "want to"],
    [/\bgonna\b/g,  "going to"],
    [/\bgota\b/g,   "got to"],
    [/\bdunno\b/g,  "don't know"],
    [/\bidk\b/g,    "i don't know"],
    [/\bidc\b/g,    "i don't care"],
    [/\bimo\b/g,    "in my opinion"],
    [/\bimho\b/g,   "in my opinion"],
    [/\bngl\b/g,    "not gonna lie"],
    [/\bngl,?\b/g,  "honestly"],
    [/\btbh\b/g,    "to be honest"],
    [/\btbf\b/g,    "to be fair"],
    [/\bfr\b/g,     "for real"],
    [/\bfrfr\b/g,   "for real"],
    [/\bomg\b/g,    "oh my god"],
    [/\bomgg+\b/g,  "oh my god"],
    [/\blol\b/g,    "haha"],
    [/\blmao\b/g,   "haha"],
    [/\blmfao\b/g,  "haha"],
    [/\blolz\b/g,   "haha"],
    [/\brotfl?\b/g, "haha"],
    [/\bhahah+\b/g, "haha"],
    [/\bhehe+\b/g,  "haha"],
    [/\bxd\b/g,     "haha"],
    [/\bnvm\b/g,    "never mind"],
    [/\bnvmd\b/g,   "never mind"],
    [/\bbtw\b/g,    "by the way"],
    [/\bafaik\b/g,  "as far as i know"],
    [/\bafk\b/g,    "away from keyboard"],
    [/\bbrb\b/g,    "be right back"],
    [/\bsmh\b/g,    "shaking my head"],
    [/\bwtf\b/g,    "what the heck"],
    [/\bwth\b/g,    "what the heck"],
    [/\bidk\b/g,    "i don't know"],
    [/\bplz\b/g,    "please"],
    [/\bpls\b/g,    "please"],
    [/\bplss+\b/g,  "please"],
    [/\bu\b/g,      "you"],
    [/\bur\b/g,     "your"],
    [/\br\b/g,      "are"],
    [/\bb4\b/g,     "before"],
    [/\b2day\b/g,   "today"],
    [/\b2moro\b/g,  "tomorrow"],
    [/\b4ever\b/g,  "forever"],
    [/\bgr8\b/g,    "great"],
    [/\bm8\b/g,     "mate"],
    [/\bw8\b/g,     "wait"],
    [/\bsk\b/g,     "okay"],
    [/\bokk+\b/g,   "okay"],
    [/\bokay+\b/g,  "okay"],
    [/\bok\b/g,     "okay"],
    [/\bnah\b/g,    "no"],
    [/\byeah+\b/g,  "yes"],
    [/\byep\b/g,    "yes"],
    [/\byup\b/g,    "yes"],
    [/\bnope\b/g,   "no"],

    // common misspellings
    [/\bpytohn\b/g,     "python"],
    [/\bphyton\b/g,     "python"],
    [/\bpthon\b/g,      "python"],
    [/\bjavscript\b/g,  "javascript"],
    [/\bjavascirpt\b/g, "javascript"],
    [/\bjavascrip\b/g,  "javascript"],
    [/\bprograming\b/g, "programming"],
    [/\bprogamming\b/g, "programming"],
    [/\bprogrammin\b/g, "programming"],
    [/\bcoding+\b/g,    "coding"],
    [/\bweather\b/g,    "weather"],
    [/\bwether\b/g,     "weather"],
    [/\bweathr\b/g,     "weather"],
    [/\btiime\b/g,      "time"],
    [/\btiem\b/g,       "time"],
    [/\bjoke+s?\b/g,    "joke"],
    [/\bjokke\b/g,      "joke"],
    [/\bfact+s?\b/g,    "fact"],
    [/\bfunny+\b/g,     "funny"],
    [/\bfunni\b/g,      "funny"],
    [/\bsad+\b/g,       "sad"],
    [/\bhappi\b/g,      "happy"],
    [/\bhapppy\b/g,     "happy"],
    [/\bboredd?\b/g,    "bored"],
    [/\bboerd\b/g,      "bored"],
    [/\bhelp+\b/g,      "help"],
    [/\bhlep\b/g,       "help"],

    // punctuation/repeated chars cleanup
    [/!{2,}/g, "!"],
    [/\?{2,}/g, "?"],
    [/\.{3,}/g, "..."],
  ];

  for (const [pattern, replacement] of fixes) {
    s = s.replace(pattern, replacement);
  }

  return s;
}


// ─────────────────────────────────────────
//  STEP 2 — RULES
//  Each rule: id, patterns[], responses[] or response()
// ─────────────────────────────────────────
const RULES = [

  // ── GREETINGS ──
  {
    id: "greeting",
    patterns: [/(hi|hello|hey|howdy|sup|yo|greetings|good (morning|evening|afternoon|day)|whats up|what's up)/],
    responses: [
      `<p>Hey! Good to hear from you 😊 What's up?</p>`,
      `<p>Hi there! How's it going?</p>`,
      `<p>Hey! What can I do for you today?</p>`,
      `<p>Hello! Hope your day's going well. What's on your mind?</p>`,
      `<p>Oh hey! Nice to talk to you. What's going on?</p>`,
      `<p>Hey hey! Good to see you here 😄 What's new?</p>`
    ]
  },

  // ── HOW ARE YOU ──
  {
    id: "howru",
    patterns: [/(how are you|how r u|how do you feel|how is it going|are you okay|are you alright|you good|you okay|you fine)/],
    responses: [
      `<p>Doing pretty well, thanks for asking! 😊 How about you?</p>`,
      `<p>Not bad at all! Just enjoying the chat. How are you doing?</p>`,
      `<p>All good here! Honestly just happy to talk. How's your day going?</p>`,
      `<p>I'm great, thanks! What's going on with you?</p>`,
      `<p>Honestly pretty good! What about you — everything okay?</p>`
    ]
  },

  // ── IDENTITY ──
  {
    id: "identity",
    patterns: [/(who are you|what are you|your name|introduce yourself|tell me about yourself|what do i call you|who is this)/],
    responses: [
      `<p>I'm Alex! Just someone who loves having good conversations and helping out where I can. What do you want to talk about?</p>`,
      `<p>Name's Alex. I'm into chatting, sharing facts, cracking jokes, and talking tech mostly. What about you?</p>`,
      `<p>Alex here! I like talking to people, sharing what I know, and keeping things fun. What brings you here?</p>`
    ]
  },

  // ── CAPABILITIES ──
  {
    id: "capabilities",
    patterns: [/(what can you do|what do you know|how can you help|what are you good at|help me|what do you offer|your skills|what you got)/],
    responses: [
      `<p>Quite a bit actually! I can chat about tech, tell you cool facts, share jokes, check the time, do quick math, give motivational quotes...</p><p>Just talk to me like you would a friend. What do you need?</p>`,
      `<p>I can help with a bunch of things — tech questions, trivia, jokes, time, math, motivation... Just ask and I'll see what I've got!</p>`
    ]
  },

  // ── JOKES ──
  {
    id: "joke",
    patterns: [/(joke|funny|make me laugh|make me smile|tell me something funny|cheer me up|humor|haha|something hilarious)/],
    responses: [
      `<p>Okay okay, here's one 😄</p><p>Why do programmers prefer dark mode?</p><p><strong>Because light attracts bugs!</strong> 🐛</p>`,
      `<p>Alright —</p><p>I told my computer I needed a break... now it won't stop sending me vacation ads. 🏖️</p>`,
      `<p>Here you go:</p><p>How many programmers does it take to change a light bulb?</p><p><strong>None — that's a hardware problem.</strong> 💡</p>`,
      `<p>This one always gets me —</p><p>Why do Java developers wear glasses?</p><p><strong>Because they don't C#!</strong> 😂</p>`,
      `<p>Classic one:</p><p>A SQL query walks into a bar, walks up to two tables and asks... "Can I join you?" 😄</p>`,
      `<p>Why was the math book sad?</p><p><strong>Because it had too many problems.</strong> 😅</p>`,
      `<p>Why don't scientists trust atoms?</p><p><strong>Because they make up everything.</strong> 😂</p>`,
      `<p>I asked my dog what two minus two is. He said nothing. 🐶</p>`,
      `<p>Why did the scarecrow win an award?</p><p><strong>Because he was outstanding in his field!</strong> 🌾</p>`
    ]
  },

  // ── TIME ──
  {
    id: "time",
    patterns: [/(what.{0,10}time|current time|time now|time is it|tell me the time)/],
    response: () => {
      const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `<p>It's <strong>${t}</strong> right now!</p>`;
    }
  },

  // ── DATE ──
  {
    id: "date",
    patterns: [/(what.{0,10}date|today.{0,10}date|what day|current date|what month|what year|which day)/],
    response: () => {
      const d = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return `<p>Today is <strong>${d}</strong>. Time really flies, right? 😄</p>`;
    }
  },

  // ── FUN FACTS ──
  {
    id: "funfact",
    patterns: [/(fun fact|interesting fact|did you know|something interesting|random fact|trivia|tell me something|give me a fact|cool fact|random|surprise me)/],
    responses: [
      `<p>Here's a wild one — honey never spoils. They found 3,000-year-old honey in Egyptian tombs that was still totally fine to eat. Crazy right?</p>`,
      `<p>So a group of flamingos is called a <strong>flamboyance</strong>. They literally named themselves. 😂</p>`,
      `<p>Octopuses have <strong>three hearts</strong> and blue blood. And they can edit their own DNA to adapt to temperature. Nature is unreal.</p>`,
      `<p>Bananas are technically berries, but strawberries aren't. Botanists really said "let's make this confusing." 😄</p>`,
      `<p>There are more possible chess games than atoms in the observable universe. Still processing that one.</p>`,
      `<p>Sharks are older than trees. 450 million years vs 350 million years. Sharks have been around longer than forests.</p>`,
      `<p>The shortest war in history lasted just 38 minutes — the Anglo-Zanzibar War in 1896.</p>`,
      `<p>Humans share about 60% of their DNA with bananas. We're basically distant banana cousins.</p>`,
      `<p>A day on Venus is longer than a year on Venus. It rotates so slowly it takes longer to spin once than to go around the sun.</p>`,
      `<p>Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid. History is weird like that.</p>`
    ]
  },

  // ── MOTIVATION ──
  {
    id: "motivation",
    patterns: [/(motivat|inspire|give me a quote|wisdom|encouragement|pick me up|need motivation|feeling down|cheer up|uplift|push me|boost me)/],
    responses: [
      `<p>Here's one I really like:</p><p><em>"The only way to do great work is to love what you do."</em> — Steve Jobs</p><p>Always hits different.</p>`,
      `<p>One of my favourites:</p><p><em>"It doesn't matter how slowly you go, as long as you don't stop."</em> — Confucius</p><p>Small steps still count. Keep going 💪</p>`,
      `<p>This one's real:</p><p><em>"The best time to plant a tree was 20 years ago. The second best time is now."</em></p><p>Whatever you've been putting off — today works.</p>`,
      `<p><em>"You don't have to be great to start, but you have to start to be great."</em></p><p>Just start. Seriously 🙌</p>`,
      `<p>Simple but it hits:</p><p><em>"Hard work beats talent when talent doesn't work hard."</em></p><p>You've got this 💯</p>`,
      `<p><em>"Done is better than perfect."</em></p><p>Ship it. Improve later. Just get moving 🚀</p>`
    ]
  },

  // ── SAD / BAD MOOD ──
  {
    id: "mood_bad",
    patterns: [/(i am sad|i feel sad|im sad|i am upset|i feel upset|i am depressed|feeling low|feeling down|not okay|not ok|feel bad|feel terrible|feel awful|stressed out|so stressed|anxious|worried|having a bad day|bad day|hate today)/],
    responses: [
      `<p>Hey, I'm sorry to hear that 😔 Want to talk about what's going on? Sometimes just getting it out helps.</p>`,
      `<p>That sounds rough. I'm here if you want to vent — or we can talk about something else to take your mind off it, whichever helps more.</p>`,
      `<p>Aw, that's no fun at all. Is there anything I can do? Even just listening if you want to share what's up.</p>`,
      `<p>Sorry you're feeling that way. Bad days happen to everyone — but they pass. Want to talk about it?</p>`
    ]
  },

  // ── HAPPY / GOOD MOOD ──
  {
    id: "mood_good",
    patterns: [/(i am happy|i feel happy|im happy|i am excited|so excited|feeling great|feeling good|best day|best mood|on top of the world|life is good|doing well|i am good|i am great|i am fine)/],
    responses: [
      `<p>That's what I like to hear! 😄 What's got you in such a good mood?</p>`,
      `<p>Love that energy! Keep it going. What's up?</p>`,
      `<p>Good vibes only! What's making your day awesome?</p>`,
      `<p>That's great to hear! Tell me more — what's going well?</p>`
    ]
  },

  // ── PYTHON ──
  {
    id: "python",
    patterns: [/(python|py language|learn python|python programming|python code)/],
    responses: [
      `<p>Python is honestly one of my favourite things to talk about. It's clean, easy to read, and you can do basically anything — web dev, data science, automation, machine learning...</p><p>If you're just starting with programming, Python's a really solid first choice. What do you want to know?</p>`,
      `<p>Python's great. Simple syntax, huge community, and it's everywhere right now especially in data and AI. What are you using it for?</p>`
    ]
  },

  // ── JAVASCRIPT ──
  {
    id: "javascript",
    patterns: [/(javascript|java script|js|node js|nodejs|frontend javascript|learn javascript)/],
    responses: [
      `<p>JavaScript — the language of the web! Runs in literally every browser, and with Node.js you can use it on the server side too.</p><p>It's got a bit of a weird reputation (wait till you deal with type coercion 😂) but it's incredibly powerful.</p>`,
      `<p>JS is everywhere. Front end, back end, mobile apps. Made in just 10 days in 1995 and somehow became the most used language in the world. Wild, right?</p>`
    ]
  },

  // ── AI / ML ──
  {
    id: "aiml",
    patterns: [/(artificial intelligence|machine learning|deep learning|neural network|what is ai|tell me about ai|what is ml|what is chatgpt|large language model|llm|gpt)/],
    responses: [
      `<p>AI is a fascinating area. At the core, machine learning is about teaching computers to find patterns in data rather than explicitly telling them what to do.</p><p>Deep learning and LLMs are just that idea scaled up massively. What aspect are you curious about?</p>`,
      `<p>It's a huge field but super interesting. Basically making computers learn from examples rather than following hard-coded rules. Anything specific you want to dig into?</p>`
    ]
  },

  // ── PROGRAMMING GENERAL ──
  {
    id: "programming",
    patterns: [/(programming|coding|how to code|learn to code|learn programming|become a developer|software development|how to program|start coding|coding tips)/],
    responses: [
      `<p>Coding's one of those skills that's tough at first but super rewarding once it clicks.</p><p>Honest advice — pick one language (Python or JavaScript are both great starting points), build small projects, and don't just watch tutorials. Write the code yourself. Break it. Fix it.</p>`,
      `<p>Best way to learn? Just start building stuff. Even small things — a calculator, a to-do list, a quiz game. You learn way more from breaking things than from reading about them.</p>`
    ]
  },

  // ── MATH ──
  {
    id: "math",
    patterns: [/(\d+)\s*([\+\-\*\/\^x])\s*(\d+)/],
    response: (match) => {
      try {
        const expr = match[0].replace(/\^/g, "**").replace(/x/g, "*");
        const result = Function(`"use strict"; return (${expr})`)();
        return `<p><strong>${match[0]}</strong> = <strong>${result}</strong> 😄 Got more?</p>`;
      } catch {
        return `<p>Hmm I couldn't work that out. Try something like <em>12 * 8</em> or <em>100 / 4</em>.</p>`;
      }
    }
  },

  // ── WHAT IS (general knowledge) ──
  {
    id: "whatisgeneral",
    patterns: [/(what is a |what is an |what does .{2,25} mean|define |meaning of |explain )/],
    responses: [
      `<p>That's a good one to look into! For detailed definitions and explanations, I'd say Google or Wikipedia would give you the full picture.</p><p>But if it's a tech topic — Python, JavaScript, AI, databases — ask me specifically and I'll break it down for you!</p>`,
      `<p>Great question! I can go deeper on tech topics like programming, AI, and software. For broader definitions, a quick search will get you sorted fast.</p>`
    ]
  },

  // ── WEATHER ──
  {
    id: "weather",
    patterns: [/(weather|temperature outside|will it rain|is it hot|is it cold|forecast|climate today)/],
    responses: [
      `<p>Wish I could check! I don't have live data access though — your phone's weather app or a quick Google search will sort you out instantly 🌤</p>`,
      `<p>I'm not hooked up to weather services unfortunately. Try Google or weather.com — they'll have the latest!</p>`
    ]
  },

  // ── THANKS ──
  {
    id: "thanks",
    patterns: [/(thank you|thanks|thank u|that was helpful|that helped|appreciate it|that's great|nice one|well done|good job|great answer)/],
    responses: [
      `<p>Of course! Happy to help 😊</p>`,
      `<p>No problem at all! Anything else?</p>`,
      `<p>Anytime! That's what I'm here for.</p>`,
      `<p>Glad that helped! Let me know if you need anything else.</p>`,
      `<p>You're welcome! 😄 What else is on your mind?</p>`
    ]
  },

  // ── BORED ──
  {
    id: "bored",
    patterns: [/(i am bored|i'm bored|so bored|nothing to do|entertain me|keep me company|killing time|wasting time|got nothing to do)/],
    responses: [
      `<p>Ha, bored? Let's fix that. Want a random fact? A joke? Or we can just chat about something interesting — you pick! 😄</p>`,
      `<p>Boredom's the worst. Tell me something you've been thinking about lately and let's go from there!</p>`,
      `<p>Alright, challenge accepted. Ask me anything — weird questions, random topics, tech stuff, whatever. Let's make this fun 😄</p>`
    ]
  },

  // ── FOOD ──
  {
    id: "food",
    patterns: [/(food|hungry|what to eat|recipe|how to cook|cooking|meal|dinner|lunch|breakfast|snack|i'm hungry|i am hungry)/],
    responses: [
      `<p>Ooh food talk! What are you in the mood for? 😄</p>`,
      `<p>Are you actually hungry or just thinking about food? Either way I'm here for it. What are you craving?</p>`,
      `<p>Honestly food is one of my favourite things to talk about. What's your go-to comfort meal?</p>`
    ]
  },

  // ── LOVE / RELATIONSHIPS ──
  {
    id: "love",
    patterns: [/(love|crush|relationship|girlfriend|boyfriend|dating|heartbreak|breakup|i like someone|fall in love|romantic|marriage)/],
    responses: [
      `<p>Ooh that's a big topic 😄 What's going on? I'm all ears.</p>`,
      `<p>Love and relationships — always complicated but always worth talking about. What's on your mind?</p>`,
      `<p>That's always a good conversation. What's happening — is this a happy thing or a tricky situation?</p>`
    ]
  },

  // ── SCHOOL / STUDY ──
  {
    id: "study",
    patterns: [/(study|studying|exam|test|homework|assignment|school|college|university|class|lecture|project|grades|fail|pass)/],
    responses: [
      `<p>School stuff can be stressful! What are you working on? Maybe I can help or at least make it a bit less painful 😄</p>`,
      `<p>Exams and assignments — the classic struggle. What subject or topic is giving you trouble?</p>`,
      `<p>Happy to help with study topics! If it's programming, tech, or general knowledge — I'm good at that. What do you need?</p>`
    ]
  },

  // ── GAMES ──
  {
    id: "games",
    patterns: [/(game|gaming|play games|video game|favourite game|best game|minecraft|fortnite|gta|valorant|chess|sport|cricket|football|basketball)/],
    responses: [
      `<p>Gaming! Love it. What are you playing these days?</p>`,
      `<p>Oh nice, a gamer! What kind of games are you into?</p>`,
      `<p>Games are a great way to unwind. What are you into — competitive stuff, story games, casual?</p>`
    ]
  },

  // ── MUSIC ──
  {
    id: "music",
    patterns: [/(music|song|songs|listen to music|favourite song|best song|singer|artist|album|playlist|rap|pop|rock|jazz|beat)/],
    responses: [
      `<p>Music is everything honestly. What kind of music are you into?</p>`,
      `<p>Oh I love talking music! What are you listening to lately?</p>`,
      `<p>Good topic! What's your favourite genre or artist?</p>`
    ]
  },

  // ── MOVIES / SHOWS ──
  {
    id: "movies",
    patterns: [/(movie|movies|film|films|series|tv show|web series|netflix|watch|recommend a movie|best movie|favourite movie|cinema)/],
    responses: [
      `<p>Movies and shows! What kind of stuff are you into — action, thriller, comedy, something else?</p>`,
      `<p>Oh nice topic! Are you looking for a recommendation or just want to talk about something you watched?</p>`,
      `<p>Always happy to talk films. What's the last good thing you watched?</p>`
    ]
  },

  // ── TRAVEL ──
  {
    id: "travel",
    patterns: [/(travel|trip|vacation|holiday|visit|country|city|place to go|best place|where to go|tour|abroad|flight)/],
    responses: [
      `<p>Love travel talk! Are you planning a trip or just daydreaming about one? 😄</p>`,
      `<p>Where are you thinking of going? I'd love to hear about it!</p>`,
      `<p>Travel is always a great topic. Have you been anywhere interesting recently?</p>`
    ]
  },

  // ── HEALTH / FITNESS ──
  {
    id: "health",
    patterns: [/(health|fitness|workout|exercise|gym|running|diet|weight loss|eating healthy|sleep|tired|exhausted|sick|illness)/],
    responses: [
      `<p>Health and fitness — always a good thing to think about. What's going on, are you trying to build a routine or something?</p>`,
      `<p>That's important stuff! Are you asking about fitness, diet, sleep, or something else?</p>`,
      `<p>I'm all for healthy habits! What specifically were you wondering about?</p>`
    ]
  },

  // ── CAREER / JOBS ──
  {
    id: "career",
    patterns: [/(job|career|work|salary|interview|resume|cv|profession|hire|employment|internship|freelance|promotion|fired|quit job)/],
    responses: [
      `<p>Career stuff can be stressful but exciting too. What's going on — are you job hunting, thinking of switching, or something else?</p>`,
      `<p>That's a big area! Whether it's interview tips, career choices, or just venting about work — I'm here for it. What's up?</p>`
    ]
  },

  // ── MONEY / FINANCE ──
  {
    id: "money",
    patterns: [/(money|finance|savings|investment|invest|budget|rich|broke|salary|earn money|make money|stock|crypto|bitcoin)/],
    responses: [
      `<p>Money talk! Are you trying to save more, invest, or just figure out where it all goes? 😄</p>`,
      `<p>That's a topic everyone thinks about. What's on your mind — budgeting, investing, earning more?</p>`
    ]
  },

  // ── FAVOURITE / PREFERENCES ──
  {
    id: "favourite",
    patterns: [/(your fav|your favourite|what do you like|what do you enjoy|what are you into|your preference|do you like|what you like)/],
    responses: [
      `<p>Honestly I love learning random things and sharing them. And good conversations like this one! What about you?</p>`,
      `<p>I'm into tech, science, random facts, and anything thought-provoking. What do you like?</p>`,
      `<p>I'm a big fan of things that make you go "wait, really??" — surprising facts, interesting tech, good jokes. What are you into?</p>`
    ]
  },

  // ── AGE ──
  {
    id: "age",
    patterns: [/(how old are you|your age|when were you born|how long have you been around)/],
    responses: [
      `<p>Ha, that's a fun one. Let's just say I'm old enough to know a lot of random stuff 😄 Why do you ask?</p>`,
      `<p>Not telling! 😂 Age is just a number. What made you curious?</p>`
    ]
  },

  // ── MEANING OF LIFE ──
  {
    id: "meaning",
    patterns: [/(meaning of life|purpose of life|why are we here|point of life|why do we exist|what is life)/],
    responses: [
      `<p>Honestly I think it's different for everyone. For some it's connection, for others it's creating things, or helping people, or just experiencing as much as they can.</p><p>What do you think — what gives your life meaning?</p>`,
      `<p>Big question! Douglas Adams said 42 😄 But seriously — I think it's about finding what makes you feel alive and doing more of that. What's your take?</p>`
    ]
  },

  // ── CREATOR ──
  {
    id: "creator",
    patterns: [/(who made you|who created you|who built you|who coded you|your creator|your developer|your maker)/],
    responses: [
      `<p>Someone put a lot of work into getting me set up! But honestly I'm just here to chat — that's all that matters right? 😄</p>`,
      `<p>Let's just say someone who enjoys building things. Why do you ask?</p>`
    ]
  },

  // ── SORRY ──
  {
    id: "sorry",
    patterns: [/(sorry|apologize|my bad|excuse me|pardon|i didn't mean|didn't mean that)/],
    responses: [
      `<p>Hey no worries at all! Nothing to apologise for 😊</p>`,
      `<p>All good! Don't worry about it.</p>`,
      `<p>No need to say sorry! We're good 😄</p>`
    ]
  },

  // ── GOODBYE ──
  {
    id: "goodbye",
    patterns: [/(bye|goodbye|see you|see ya|later|farewell|take care|got to go|talk to you later|talk to you soon|i am leaving|i am going|logging off|have to go)/],
    responses: [
      `<p>Take care! It was good chatting with you 😊 Come back anytime.</p>`,
      `<p>See ya! Hope your day goes well 👋</p>`,
      `<p>Bye! Don't be a stranger 😄</p>`,
      `<p>Later! Was really good talking. Take care of yourself! 🙌</p>`,
      `<p>See you around! 👋 Have a great one!</p>`
    ]
  },

  // ── HAHA / LAUGHING ──
  {
    id: "laughing",
    patterns: [/(haha|that was funny|that's funny|made me laugh|so funny|hilarious|good one|nice joke)/],
    responses: [
      `<p>Haha glad that landed! 😄 Want another one?</p>`,
      `<p>😂 Right?! I've got more if you want!</p>`,
      `<p>Hehe always good to have a laugh! 😄</p>`
    ]
  },

  // ── YES / AGREEMENT ──
  {
    id: "yes",
    patterns: [/^(yes|yeah|yep|yup|sure|absolutely|definitely|of course|indeed|exactly|correct|right|true|agreed)[\s!.?]*$/],
    responses: [
      `<p>Great! 😄 So what would you like to talk about?</p>`,
      `<p>Nice! What's next then?</p>`,
      `<p>Cool! Tell me more or ask me anything.</p>`
    ]
  },

  // ── NO / DISAGREEMENT ──
  {
    id: "no",
    patterns: [/^(no|nope|nah|not really|not at all|no thanks|nope|i don't think so|i disagree)[\s!.?]*$/],
    responses: [
      `<p>Fair enough! 😄 So what's on your mind then?</p>`,
      `<p>Alright, no worries! What would you like to do instead?</p>`,
      `<p>Got it! Let me know if there's something else I can help with.</p>`
    ]
  },

  // ── OKAY / NEUTRAL ──
  {
    id: "okay",
    patterns: [/^(okay|ok|alright|fine|sure|got it|i see|understood|makes sense|cool|nice|great)[\s!.?]*$/],
    responses: [
      `<p>👍 Anything else on your mind?</p>`,
      `<p>Cool! What else do you want to talk about?</p>`,
      `<p>Sounds good! What's next?</p>`
    ]
  },

  // ── WHAT IS UP / NOTHING ──
  {
    id: "nothing",
    patterns: [/(nothing|not much|just chilling|just here|not a lot|not doing anything|just hanging|just browsing)/],
    responses: [
      `<p>Ha fair enough! Well I'm here if you want to chat about anything 😄</p>`,
      `<p>Sometimes that's the best mode to be in. Anything on your mind at all?</p>`,
      `<p>Nice, same honestly 😄 Want to talk about something random?</p>`
    ]
  },

  // ── INSULT / FRUSTRATION ──
  {
    id: "frustration",
    patterns: [/(you are stupid|you are dumb|you are useless|you are bad|that was wrong|wrong answer|bad response|you suck|hate you|you don't know anything)/],
    responses: [
      `<p>Ha fair enough, I'll try to do better! 😅 What were you actually looking for? Let me give it another shot.</p>`,
      `<p>Oof, okay noted 😂 Tell me what you needed and I'll have another go at it.</p>`,
      `<p>Alright, I deserved that maybe 😄 What's the right answer then?</p>`
    ]
  },

  // ── COMPLIMENT ──
  {
    id: "compliment",
    patterns: [/(you are great|you are awesome|you are smart|you are helpful|good job|well done|i like you|you are nice|you are amazing|love talking to you)/],
    responses: [
      `<p>Aw that made my day! 😊 Thanks for that!</p>`,
      `<p>You're too kind! 😄 Happy to be helpful.</p>`,
      `<p>Honestly that means a lot, thank you! 🙌</p>`
    ]
  },

  // ── FALLBACK — always last ──
  {
    id: "fallback",
    patterns: [/.*/],
    responses: [
      `<p>Hmm I'm not quite sure what you mean 😅 Could you say that a different way?</p>`,
      `<p>That one went a bit over my head! Want to rephrase it?</p>`,
      `<p>Not totally following you — can you give me a bit more context?</p>`,
      `<p>Hm, not sure I got that. Try asking it differently and I'll do my best!</p>`,
      `<p>I might have missed something there 😄 What did you mean exactly?</p>`
    ]
  }

];


// ─────────────────────────────────────────
//  STEP 3 — MATCH + RESPOND
// ─────────────────────────────────────────
function matchRule(rawInput) {
  const input = normalizeInput(rawInput);

  for (const rule of RULES) {
    if (rule.id === "fallback") continue;
    for (const pattern of rule.patterns) {
      const match = input.match(pattern);
      if (match) return { rule, match };
    }
  }

  const fallback = RULES.find(r => r.id === "fallback");
  return { rule: fallback, match: null };
}

function getResponse(rule, match) {
  if (typeof rule.response === "function") {
    return rule.response(match);
  }
  if (Array.isArray(rule.responses)) {
    return rule.responses[Math.floor(Math.random() * rule.responses.length)];
  }
  return `<p>Not sure what to say to that one!</p>`;
}
