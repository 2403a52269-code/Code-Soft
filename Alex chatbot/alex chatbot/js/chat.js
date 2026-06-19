/**
 * NEXUS CHAT CONTROLLER · chat.js
 * Manages UI, conversation flow, and message rendering.
 */

// ── DOM References ──
const messagesEl   = document.getElementById("messages");
const messagesWrap = document.getElementById("messagesWrap");
const inputEl      = document.getElementById("userInput");
const sendBtn      = document.getElementById("sendBtn");
const clearBtn     = document.getElementById("clearBtn");
const typingWrap   = document.getElementById("typingWrap");
const msgCountEl   = document.getElementById("msg-count");
const charCountEl  = document.getElementById("charCount");

// ── State ──
let messageCount = 0;
let isProcessing = false;
let conversationHistory = []; // For context awareness

// ── Utilities ──
function getTimestamp() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom() {
  messagesWrap.scrollTo({ top: messagesWrap.scrollHeight, behavior: 'smooth' });
}

function updateMsgCount() {
  messageCount++;
  msgCountEl.textContent = messageCount;
}

// ── Render a message ──
function renderMessage(html, sender = "bot", inputText = "") {
  const wrapper = document.createElement("div");
  wrapper.className = `msg ${sender}`;

  const avatarLetter = sender === "bot" ? "A" : "U";

  wrapper.innerHTML = `
    <div class="msg-avatar">${avatarLetter}</div>
    <div class="msg-body">
      <div class="msg-bubble">${html}</div>
      <div class="msg-time">${getTimestamp()}</div>
    </div>
  `;

  messagesEl.appendChild(wrapper);
  scrollToBottom();
  updateMsgCount();

  // Store in history for context
  conversationHistory.push({ sender, text: inputText || html });
}

// ── Show / hide typing indicator ──
function showTyping() {
  typingWrap.style.display = "block";
  scrollToBottom();
}

function hideTyping() {
  typingWrap.style.display = "none";
}

// ── Calculate simulated "thinking" delay ──
function getDelay(responseText) {
  // Longer responses = slightly longer delay (realistic)
  const baseDelay = 400;
  const extraDelay = Math.min(responseText.length * 0.5, 800);
  return baseDelay + extraDelay;
}

// ── Process user input ──
async function processInput(rawInput) {
  const input = rawInput.trim();
  if (!input || isProcessing) return;

  isProcessing = true;

  // Render user message
  renderMessage(`<p>${escapeHtml(input)}</p>`, "user", input);

  // Clear input
  inputEl.value = "";
  inputEl.style.height = "auto";
  charCountEl.textContent = "0";

  // Animate: show typing
  showTyping();

  // Match rule
  const { rule, match } = matchRule(input.toLowerCase());
  const responseHtml = getResponse(rule, match);

  // Delay for realism
  await sleep(getDelay(responseHtml));

  hideTyping();
  renderMessage(responseHtml, "bot", input);

  isProcessing = false;
}

// ── Escape HTML to prevent XSS from user input ──
function escapeHtml(text) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ── Sleep helper ──
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Clear chat ──
function clearChat() {
  messagesEl.innerHTML = "";
  conversationHistory = [];
  messageCount = 0;
  msgCountEl.textContent = "0";

  // Restore boot message
  renderMessage(
    `
    <p>Fresh start! So, what did you want to talk about? 😄</p>`,
    "bot"
  );
}

// ── Event: Send button ──
sendBtn.addEventListener("click", () => {
  processInput(inputEl.value);
});

// ── Event: Enter key (without shift) ──
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    processInput(inputEl.value);
  }
});

// ── Event: Auto-grow textarea & char count ──
inputEl.addEventListener("input", () => {
  // Auto-grow
  inputEl.style.height = "auto";
  inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + "px";

  // Char count
  charCountEl.textContent = inputEl.value.length;

  // Color warning at high char count
  charCountEl.style.color = inputEl.value.length > 200
    ? "var(--accent3)"
    : "var(--text-dim)";
});

// ── Event: Clear button ──
clearBtn.addEventListener("click", () => {
  if (confirm("Clear the entire conversation?")) {
    clearChat();
  }
});

// ── Event: Sidebar topic buttons ──
document.querySelectorAll(".topic-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const msg = btn.getAttribute("data-msg");
    if (msg) {
      inputEl.value = msg;
      inputEl.dispatchEvent(new Event("input")); // update char count
      processInput(msg);
    }
  });
});

// ── Focus input on load ──
window.addEventListener("load", () => {
  inputEl.focus();
});

// ── Keyboard shortcut: Escape to blur input ──
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") inputEl.blur();
  if (e.key === "/" && document.activeElement !== inputEl) {
    e.preventDefault();
    inputEl.focus();
  }
});
