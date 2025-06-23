// @ts-nocheck
class GermanArticleGame extends BaseGame {
  constructor(containerId, words) {
    super(containerId, words);
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

  formatAnswerLog(word, correct, selected) {
    const articleMap = {
      masculine: "der",
      feminine: "die",
      neuter: "das",
    };

    if (!selected) {
      const li = document.createElement("li");
      const s = document.createElement("s");
      s.className = "wrong";
      s.textContent = "???";
      li.appendChild(s);
      li.append(` ${articleMap[correct]} ${word}`);
      return li;
    } else if (selected !== correct) {
      const li = document.createElement("li");
      const s = document.createElement("s");
      s.className = "wrong";
      s.textContent = articleMap[selected];
      li.appendChild(s);
      li.append(` ${articleMap[correct]} ${word}`);
      return li;
    } else {
      const li = document.createElement("li");
      li.textContent = `${articleMap[correct]} ${word}`;
      return li;
    }
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
      this.startGame();
    });

    const resultsList = document.createElement("ul");
    resultsList.className = "answers-log";

    this.answersLog.forEach(({ word, correct, selected }) => {
      const li = this.formatAnswerLog(word, correct, selected);
      resultsList.appendChild(li);
    });

    resultColumn.appendChild(stats);
    resultColumn.appendChild(message);
    resultColumn.appendChild(restartButton);
    resultColumn.appendChild(resultsList);

    this.container.appendChild(resultColumn);
  }
}
