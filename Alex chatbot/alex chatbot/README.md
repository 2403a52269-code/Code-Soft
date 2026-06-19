# ALEX · Rule-Based Chatbot
### Task 1 — Chatbot with Rule-Based Responses

---

## 📁 Project Structure

```
ALEX-bot/
├── index.html          ← Main HTML shell
├── css/
│   └── style.css       ← Dark terminal aesthetic UI
├── js/
│   ├── rules.js        ← Pattern-matching rule engine (NLP core)
│   └── chat.js         ← Conversation controller & UI logic
└── README.md           ← You're here!
```

---

## 🚀 How to Run

No server needed — just open `index.html` in any modern browser.

```bash
# Option 1: Direct open
open index.html

# Option 2: Local server (recommended)
npx serve .
# or
python3 -m http.server 8080
```

---

## 🧠 How It Works

### Rule Engine (`rules.js`)

Each **rule** contains:
| Field       | Type                    | Description                          |
|-------------|-------------------------|--------------------------------------|
| `id`        | String                  | Unique identifier                    |
| `patterns`  | RegExp[]                | Array of patterns to match against   |
| `responses` | String[] (optional)     | Random pick from array               |
| `response`  | Function (optional)     | Dynamic response (e.g. live time)    |
| `tags`      | String[]                | Category labels                      |

### Matching Algorithm

```
User Input
    │
    ▼
Normalize (lowercase)
    │
    ▼
Loop through RULES (in priority order)
    │
    ├── Rule 1: Greetings   → /hi|hello|hey.../
    ├── Rule 2: Identity    → /who are you.../
    ├── Rule 3: Jokes       → /joke|funny.../
    ├── Rule N: ...
    │
    └── Fallback            → /.*/  (always matches last)
    │
    ▼
Get Response (random from array OR dynamic function)
    │
    ▼
Simulated delay (realistic typing feel)
    │
    ▼
Render in UI
```

### Pattern Techniques Used

| Technique               | Example Pattern                          |
|-------------------------|------------------------------------------|
| **Keyword matching**    | `/\bhello\b/i`                           |
| **Alternation (OR)**    | `/hi\|hello\|hey/i`                      |
| **Capture groups**      | `/(\d+)\s*([\+\-\*\/])\s*(\d+)/`        |
| **Optional words**      | `/good\s*(morning\|evening)/i`           |
| **Wildcards**           | `/.*/` (fallback)                        |
| **Word boundaries**     | `\b...\b` (avoids partial matches)       |
| **Greedy quantifiers**  | `/how('?re\| are) you/`                  |

---

## 💬 Supported Topics

| Topic            | Example Inputs                                  |
|------------------|-------------------------------------------------|
| 👋 Greeting      | "hi", "hello", "good morning"                   |
| 🤖 Identity      | "who are you?", "what are you?"                 |
| 🔍 Capabilities  | "what can you do?", "help me with"              |
| 😄 Jokes         | "tell me a joke", "make me laugh"               |
| 🕐 Time          | "what time is it?", "current time"              |
| 📅 Date          | "what's today's date?", "what day is it?"       |
| 🧠 Fun Facts     | "tell me a fun fact", "did you know"            |
| 💡 Motivation    | "motivate me", "give me a quote"                |
| 💻 Python        | "what is Python?", "tell me about Python"       |
| 💻 JavaScript    | "explain JavaScript", "what is Node.js?"        |
| 🤖 AI/ML         | "what is machine learning?", "explain AI"       |
| 🔢 Math          | "12 * 8", "100 / 4", "25 + 37"                  |
| 🌤 Weather       | "what's the weather?" (graceful fallback)       |
| 💬 Social        | "how are you?", "thanks", "goodbye"             |
| ❓ Unknown       | Anything else → helpful fallback message        |

---

## 🎨 Design Philosophy

ALEX uses a **dark terminal aesthetic** with:
- `Space Mono` (monospace) for system labels and code-like elements
- `Syne` (display) for headings and UI text
- Cyan (`#00e5ff`) as the primary accent — the "active signal" color
- Purple (`#7c3aed`) for user message highlights
- Animated dot grid background for depth

---

## 🔧 Extending the Bot

To add a new rule, open `js/rules.js` and insert before the fallback:

```javascript
{
  id: "your_rule",
  patterns: [/your|pattern|here/i],
  tags: ["category"],
  responses: [
    `<p>Your HTML response here.</p>`
  ]
}
```

For a **dynamic response** (uses live data):
```javascript
{
  id: "dynamic_rule",
  patterns: [/something dynamic/i],
  response: (match) => {
    const data = computeSomething();
    return `<p>Result: <strong>${data}</strong></p>`;
  }
}
```

---

## 📚 Learning Outcomes

Building ALEX demonstrates:

1. **NLP Fundamentals** — Tokenization, pattern matching, input normalization
2. **Conversation Flow** — Turn-based dialogue, fallback handling
3. **Regular Expressions** — Flexible, powerful text matching
4. **UI/UX Design** — Chat interface, typing simulation, animations
5. **JavaScript Patterns** — Module separation, event handling, async/await

---

AUTHOR
-----------------------------------------------------------------------------------------------------
PRANITH REDDY
B-Tech (CSE-AIML)
