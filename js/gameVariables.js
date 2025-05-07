/**
 * Game Variables - Contains all global variables used across the game
 */

// Image paths
const IMAGE_PATHS = {
    CARD_BACK: 'images/Card_Back.png',
    SPECIAL_CARD_BACK: 'images/Special_Card_Back.png',
    MAIN_CARDS: 'images/main_cards/',
    SPECIAL_CARDS: 'images/special_cards/'
};

// Card types
const CARD_TYPES = {
    MAIN: 'main',
    SPECIAL: 'special'
};

// Player information
window.playerName = 'Player 1';
window.playerColor = '#00a2ff';
window.playerHand = []; // Array of player's cards
window.selectedCard = null; // Currently selected card
window.playerPlayedCards = []; // Cards played in front of player
window.discardPile = []; // Discard pile

// Game state
window.gameStarted = false;
window.gameMode = null; // 'host' or 'join'
window.gameCode = null; // Game code for host
window.gameCodeToJoin = null; // Game code for joining
window.currentTurn = null; // Player ID whose turn it is
window.turnOrder = []; // Order of player turns

// Card arrays
window.mainDeck = []; // Main cards
window.specialDeck = []; // Special cards
window.specialCardsInPlay = []; // Special cards on table

// Networking
window.peer = null; // PeerJS object
window.connections = []; // Connections to other players
window.connectedPlayers = []; // Connected player info

// UI elements
window.uiElements = {
    playerCards: null,
    specialCards: null,
    opponentIndicator: null,
    playerName: null,
    playedCardsArea: null,
    opponentHandArea: null
};