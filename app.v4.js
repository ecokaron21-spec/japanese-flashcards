const stateKey = "minna-no-nihongo-progress-v3";
let allCards = window.lessonCards || [];
let cards = [];
let currentIndex = 0;
let mode = "zh-ja";
let revealed = false;
let progress = JSON.parse(localStorage.getItem(stateKey) || "{}");

const elements = {
  prompt: document.querySelector("#prompt"), promptLabel: document.querySelector("#prompt-label"),
  answer: document.querySelector("#answer"), answerMain: document.querySelector("#answer-main"), answerDetail: document.querySelector("#answer-detail"),
  reveal: document.querySelector("#reveal"), progress: document.querySelector("#progress"),
  known: document.querySelector("#known-count"), review: document.querySelector("#review-count"),
  select: document.querySelector("#lesson-select"), random: document.querySelector("#random-order"),
  input: document.querySelector("#answer-input"), result: document.querySelector("#check-result"),
  currentErrors: document.querySelector("#current-errors"),
};

function shuffle(items) { return [...items].sort(() => Math.random() - 0.5); }
function normalize(value) { return value.toLowerCase().replace(/[\s　、。！？!?,.（）()［］\[\]～~]/g, ""); }
function currentCard() { return cards[currentIndex]; }
function recordFor(id) {
  const record = progress[id];
  return typeof record === "object" ? record : { grade: record || null, errors: 0 };
}
function saveRecord(id, update) {
  progress[id] = { ...recordFor(id), ...update };
  localStorage.setItem(stateKey, JSON.stringify(progress));
}

function loadCards() {
  const selected = elements.select.value;
  cards = allCards.filter((card) => selected === "all" || String(card.lesson) === selected);
  if (elements.random.checked) cards = shuffle(cards);
  currentIndex = 0; revealed = false; elements.input.value = ""; elements.result.textContent = ""; render();
}

function render() {
  const card = currentCard();
  if (!card) { elements.prompt.textContent = "词库加载失败"; return; }
  const japanese = card.kanji ? `${card.japanese}（${card.kanji}）` : card.japanese;
  const zhToJa = mode === "zh-ja";
  elements.promptLabel.textContent = zhToJa ? "中文" : "日文";
  elements.prompt.textContent = zhToJa ? card.chinese : japanese;
  elements.answerMain.textContent = zhToJa ? japanese : card.chinese;
  elements.answerDetail.textContent = card.partOfSpeech;
  elements.answer.classList.toggle("hidden", !revealed);
  elements.reveal.textContent = revealed ? "隐藏答案" : "显示答案";
  elements.input.placeholder = zhToJa ? "输入日语答案" : "输入中文答案";
  elements.progress.textContent = `第 ${card.lesson} 课 · ${currentIndex + 1} / ${cards.length}`;
  document.querySelectorAll(".mode").forEach((button) => button.classList.toggle("active", button.dataset.mode === mode));
  elements.currentErrors.textContent = `本词错误：${recordFor(card.id).errors} 次`;
  const records = Object.values(progress).map((item) => typeof item === "object" ? item : { grade: item });
  elements.known.textContent = records.filter((record) => record.grade === "easy").length;
  elements.review.textContent = records.filter((record) => record.grade && record.grade !== "easy").length;
}

function saveGrade(grade) {
  const errors = recordFor(currentCard().id).errors + (grade === "forgot" ? 1 : 0);
  saveRecord(currentCard().id, { grade, errors });
  currentIndex = (currentIndex + 1) % cards.length;
  revealed = false; elements.input.value = ""; elements.result.textContent = ""; render();
}

function checkAnswer() {
  const answer = normalize(elements.input.value);
  if (!answer) return;
  const card = currentCard();
  const expected = mode === "zh-ja" ? [card.japanese, card.kanji] : [card.chinese];
  const correct = expected.filter(Boolean).some((value) => normalize(value) === answer);
  if (correct) {
    revealed = true;
    elements.result.textContent = "回答正确";
  } else {
    const errors = recordFor(card.id).errors + 1;
    saveRecord(card.id, { errors });
    revealed = false;
    elements.result.textContent = `不正确，已记录第 ${errors} 次错误。可再次输入或显示答案。`;
  }
  render();
}

function nextCard() {
  currentIndex = (currentIndex + 1) % cards.length;
  revealed = false; elements.input.value = ""; elements.result.textContent = ""; render();
}

function speak() { const utterance = new SpeechSynthesisUtterance(currentCard().japanese); utterance.lang = "ja-JP"; speechSynthesis.cancel(); speechSynthesis.speak(utterance); }
document.querySelectorAll(".mode").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.mode; revealed = false; elements.result.textContent = ""; render(); }));
document.querySelector("#reveal").addEventListener("click", () => { revealed = !revealed; render(); });
document.querySelectorAll("[data-grade]").forEach((button) => button.addEventListener("click", () => saveGrade(button.dataset.grade)));
document.querySelector("#next-card").addEventListener("click", nextCard);
elements.select.addEventListener("change", loadCards); elements.random.addEventListener("change", loadCards);
document.querySelector("#check-answer").addEventListener("click", checkAnswer); document.querySelector("#sound").addEventListener("click", speak);
loadCards();
if (location.protocol.startsWith("http") && "serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");
