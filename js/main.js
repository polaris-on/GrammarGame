class GrammarGame {
  constructor(containerId, localJsonPath) {
    this.container = document.getElementById(containerId);
    this.localJsonPath = localJsonPath;
    this.words = [];
    this.currentWordIndex = 0;
    this.score = 0;
    this.errors = 0;
    this.timeoutId = null;
    this.countdownInterval = null;
    this.countdownTime = 5;
    this.answersLog = [];
    this.maxWords = 10;
    this.gameStarted = false;
    this.renderStartButton();
  }

  renderStartButton() {
    this.container.innerHTML = "";

    const startButton = document.createElement("button");
    startButton.textContent = "🚀 Почати гру";
    startButton.className = "btn-start";
    startButton.addEventListener("click", () => {
      startButton.remove();
      const countdownEl = document.createElement("div");
      countdownEl.id = "countdown";
      countdownEl.className = "countdown";
      this.container.appendChild(countdownEl);
      this.loadWords();
    });

    this.container.appendChild(startButton);
  }

  async loadWords() {
    try {
      const response = await fetch(this.localJsonPath);
      const data = await response.json();

      if (Array.isArray(data)) {
        this.words = this.shuffleArray(data).slice(0, this.maxWords);
        this.startGame();
      } else {
        throw new Error("Invalid data format: expected an array of words");
      }
    } catch (error) {
      console.error("Failed to load words from local file:", error);
    }
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  startGame() {
    this.score = 0;
    this.errors = 0;
    this.currentWordIndex = 0;
    this.answersLog = [];
    this.renderStats();
    this.nextWord();
  }

  nextWord() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    if (this.currentWordIndex >= this.words.length) {
      this.endGame();
      return;
    }

    const wordData = this.words[this.currentWordIndex];
    this.displayWord(wordData);
    this.currentWordIndex++;

    this.timeoutId = setTimeout(() => {
      this.handleMissedWord();
    }, this.countdownTime * 1000);

    let timeLeft = this.countdownTime;
    const countdownEl = document.getElementById("countdown");
    if (countdownEl) countdownEl.textContent = `⏳ ${timeLeft}s`;
    this.countdownInterval = setInterval(() => {
      timeLeft--;
      if (countdownEl) countdownEl.textContent = `⏳ ${timeLeft}s`;
      if (timeLeft <= 0) clearInterval(this.countdownInterval);
    }, 1000);
  }

  handleMissedWord() {
    const currentWord = this.words[this.currentWordIndex - 1];
    this.errors++;
    this.answersLog.push({
      word: currentWord.word,
      correct: currentWord.correctCategory,
      selected: null,
    });
    this.renderStats();
    const container = document.getElementById("game-container");
    container.classList.add("error-flash");
    setTimeout(() => container.classList.remove("error-flash"), 300);
    this.nextWord();
  }

  displayWord(wordData) {
    this.container.innerHTML = "";

    const statsElement = this.createStatsElement();

    const countdownEl = document.createElement("div");
    countdownEl.id = "countdown";
    countdownEl.className = "countdown";
    countdownEl.textContent = `⏳ ${this.countdownTime}s`;

    const wordElement = document.createElement("div");
    wordElement.className = "word move-left-to-right";
    wordElement.textContent = wordData.word;

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "choices";

    const buttons = [
      { label: "der", category: "masculine", className: "btn-masculine" },
      { label: "das", category: "neuter", className: "btn-neutral" },
      { label: "die", category: "feminine", className: "btn-feminine" },
    ];

    buttons.forEach(({ label, category, className }) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = `choice-button ${className}`;

      btn.addEventListener("click", (e) => {
        clearTimeout(this.timeoutId);
        clearInterval(this.countdownInterval);
        this.checkAnswer(wordData, category, e.target);
      });

      buttonContainer.appendChild(btn);
    });

    this.container.appendChild(statsElement);
    this.container.appendChild(countdownEl);
    this.container.appendChild(wordElement);
    this.container.appendChild(buttonContainer);
  }

  checkAnswer(wordData, selectedCategory, buttonEl) {
    const container = document.getElementById("game-container");
    const isCorrect = wordData.correctCategory === selectedCategory;

    if (isCorrect) {
      this.score++;
    } else {
      this.errors++;
      container.classList.add("error-flash");
      buttonEl.classList.add("wrong-answer");
      setTimeout(() => {
        container.classList.remove("error-flash");
        buttonEl.classList.remove("wrong-answer");
      }, 300);
    }

    this.answersLog.push({
      word: wordData.word,
      correct: wordData.correctCategory,
      selected: selectedCategory,
    });

    this.renderStats();
    this.nextWord();
  }

  renderStats() {
    const existingStats = document.getElementById("game-stats");
    if (existingStats) existingStats.remove();

    const stats = this.createStatsElement();
    this.container.prepend(stats);
  }

  createStatsElement() {
    const stats = document.createElement("div");
    stats.id = "game-stats";
    stats.className = "stats";
    stats.innerHTML = `<div><p>Richtig: ${this.score}</p><p>Fehler: ${this.errors}</p></div>`;
    return stats;
  }

  endGame() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.container.innerHTML = "";

    const resultColumn = document.createElement("div");
    resultColumn.className = "results-column";

    const stats = this.createStatsElement();
    const message = document.createElement("p");
    message.textContent = "Spiel vorbei!";

    const restartButton = document.createElement("button");
    restartButton.textContent = "🔁 Neues Spiel";
    restartButton.className = "btn-restart";

    restartButton.addEventListener("click", () => {
      this.words = this.shuffleArray(this.words).slice(0, this.maxWords);
      this.startGame();
    });

    const resultsList = document.createElement("ul");
    resultsList.className = "answers-log";

    const articleMap = {
      masculine: "der",
      feminine: "die",
      neuter: "das",
    };

    this.answersLog.forEach(({ word, correct, selected }) => {
      const li = document.createElement("li");
      if (!selected) {
        li.innerHTML = `<s class="wrong">???</s> ${articleMap[correct]} ${word}`;
      } else if (selected !== correct) {
        li.innerHTML = `<s class="wrong">${articleMap[selected]}</s> ${articleMap[correct]} ${word}`;
      } else {
        li.textContent = `${articleMap[correct]} ${word}`;
      }
      resultsList.appendChild(li);
    });

    resultColumn.appendChild(stats);
    resultColumn.appendChild(message);
    resultColumn.appendChild(restartButton);
    resultColumn.appendChild(resultsList);

    this.container.appendChild(resultColumn);
  }
}

const game = new GrammarGame("game-container", "./js/german_words_a1.json");
