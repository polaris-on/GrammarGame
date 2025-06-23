// @ts-nocheck
class AnotherGame extends BaseGame {
  constructor(containerId, words) {
    super(containerId, words);
  }

  displayWord(wordData) {
    // Implement the display logic for the new game
    this.container.innerHTML = `<h1>${wordData.word}</h1><p>This is another game!</p>`;
  }

  formatAnswerLog(word, correct, selected) {
    // Implement the answer log formatting for the new game
    return `Word: ${word}, Correct: ${correct}, Selected: ${selected}`;
  }
}
