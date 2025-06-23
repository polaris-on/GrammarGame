// @ts-nocheck
class GameManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.currentGame = null;
  }

  async loadWords(jsonPath) {
    try {
      const response = await fetch(jsonPath);
      return await response.json();
    } catch (error) {
      console.error("Failed to load words from local file:", error);
      return [];
    }
  }

  async startGame(gameType, jsonPath) {
    if (this.currentGame) {
      this.currentGame = null;
    }

    const words = await this.loadWords(jsonPath);

    switch (gameType) {
      case "german_article":
        this.currentGame = new GermanArticleGame(this.containerId, words);
        break;
      case "another_game":
        this.currentGame = new AnotherGame(this.containerId, words);
        break;
      default:
        console.error(`Unknown game type: ${gameType}`);
        return;
    }

    this.currentGame.init();
  }
}

const gameManager = new GameManager("game-container");

// You can start a game like this:
//gameManager.startGame('german_article', './js/german_words_a1.json');
