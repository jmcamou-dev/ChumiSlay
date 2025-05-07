/**
 * Deck Manager - Handles deck creation, shuffling, and distribution
 */

/**
 * Initializes decks for the game
 */
function initializeDecks() {
    console.log('Initializing card decks...');
    
    // Create main deck
    mainDeck = createMainDeck();
    
    // Create special deck
    specialDeck = createSpecialDeck();
    
    // Shuffle both decks
    shuffleDeck(mainDeck);
    shuffleDeck(specialDeck);
    
    // Deal initial cards if host
    if (gameMode === 'host') {
        dealInitialCards();
    }
}

/**
 * Creates the main deck of cards
 * @returns {Array} Array of card objects
 */
function createMainDeck() {
    const deck = [];
    
    // Create 5 types of cards, 5 copies each
    const numTypes = 5;
    const copiesPerType = 5;
    
    for (let i = 1; i <= numTypes; i++) {
        for (let j = 0; j < copiesPerType; j++) {
            deck.push({
                id: `main-${i}-${j}`,
                type: CARD_TYPES.MAIN,
                imageUrl: `${IMAGE_PATHS.MAIN_CARDS}card_${i}.png`,
                value: i,
                name: `Card ${i}`,
                description: `This is card type ${i}`
            });
        }
    }
    
    return deck;
}

/**
 * Creates the special deck of cards
 * @returns {Array} Array of card objects
 */
function createSpecialDeck() {
    const deck = [];
    
    // Create 5 types of special cards
    for (let i = 1; i <= 5; i++) {
        deck.push({
            id: `special-${i}`,
            type: CARD_TYPES.SPECIAL,
            imageUrl: `${IMAGE_PATHS.SPECIAL_CARDS}special_${i}.png`,
            value: i * 2,
            name: `Special Card ${i}`,
            description: `This is special card ${i}`
        });
    }
    
    return deck;
}

/**
 * Shuffles a deck of cards
 * @param {Array} deck - Deck to shuffle
 */
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

/**
 * Deals initial cards to all players (host only)
 */
function dealInitialCards() {
    if (gameMode !== 'host') return;
    
    // Deal 5 main cards to the host
    for (let i = 0; i < 5; i++) {
        const card = drawCard(false);
        if (card) {
            playerHand.push(card);
        }
    }
    
    // Deal 3 special cards to the table
    for (let i = 0; i < 3; i++) {
        const card = drawCard(true);
        if (card) {
            specialCardsInPlay[i] = card;
            // Show special cards to host
            addSpecialCard(card, i);
        }
    }
    
    // Send initial hands to all connected players
    dealCardsToAllPlayers();
}

/**
 * Deals cards to all connected players (host only)
 */
function dealCardsToAllPlayers() {
    if (gameMode !== 'host') return;
    
    // First distribute special cards (visible to all)
    connections.forEach(conn => {
        conn.send({
            type: 'special_cards_update',
            cards: specialCardsInPlay
        });
    });
    
    // Then deal 5 cards to each player
    connections.forEach(conn => {
        const playerCards = [];
        for (let i = 0; i < 5; i++) {
            const card = drawCard(false);
            if (card) {
                playerCards.push(card);
            }
        }
        
        // Send hand to player
        conn.send({
            type: 'hand_update',
            cards: playerCards
        });
    });
    
    // Set turn order
    setTurnOrder();
}

/**
 * Sets the turn order for all players
 */
function setTurnOrder() {
    if (gameMode !== 'host') return;
    
    // Start with host
    turnOrder = [peer.id];
    
    // Add all connected players
    connectedPlayers.forEach(player => {
        turnOrder.push(player.id);
    });
    
    // Set current turn to host
    currentTurn = peer.id;
    
    // Notify all players of turn order
    connections.forEach(conn => {
        conn.send({
            type: 'turn_order_update',
            turnOrder: turnOrder,
            currentTurn: currentTurn
        });
    });
}

/**
 * Updates player's hand from network
 * @param {Array} cards - New hand of cards
 */
function updatePlayerHand(cards) {
    // Clear current hand
    playerHand = [];
    uiElements.playerCards.innerHTML = '';
    
    // Add new cards
    cards.forEach(card => {
        playerHand.push(card);
        const cardElement = createCardElement(card.id, CARD_TYPES.MAIN, card.imageUrl);
        cardElement.classList.add('flipped'); // Show face up
        uiElements.playerCards.appendChild(cardElement);
    });
}

/**
 * Updates special cards from network
 * @param {Array} cards - New special cards
 */
function updateSpecialCards(cards) {
    // Update special cards in play
    specialCardsInPlay = cards;
    
    // Update UI for each card
    cards.forEach((card, index) => {
        if (card) {
            addSpecialCard(card, index);
        }
    });
}

/**
 * Updates turn order from network
 * @param {Array} newTurnOrder - New turn order
 * @param {string} newCurrentTurn - New current turn
 */
function updateTurnOrder(newTurnOrder, newCurrentTurn) {
    turnOrder = newTurnOrder;
    currentTurn = newCurrentTurn;
    
    // Update UI to show whose turn it is
    updateTurnIndicator();
}

/**
 * Updates the turn indicator in the UI
 */
function updateTurnIndicator() {
    // Find player name for current turn
    let currentPlayerName = '';
    
    if (currentTurn === peer.id) {
        currentPlayerName = playerName + ' (You)';
    } else {
        const player = connectedPlayers.find(p => p.id === currentTurn);
        if (player) {
            currentPlayerName = player.name;
        }
    }
    
    // Show whose turn it is
    showMessage(`Current turn: ${currentPlayerName}`, 'info');
    
    // Highlight current player in UI
    document.querySelectorAll('.player-label').forEach(label => {
        label.classList.remove('current-turn');
    });
    
    const currentPlayerLabel = document.querySelector(`.player-label[data-player="${currentTurn}"]`);
    if (currentPlayerLabel) {
        currentPlayerLabel.classList.add('current-turn');
    }
    
    // Enable/disable control buttons based on turn
    const isMyTurn = currentTurn === peer.id;
    document.getElementById('draw-card').disabled = !isMyTurn;
    document.getElementById('play-card').disabled = !isMyTurn;
    document.getElementById('take-card').disabled = !isMyTurn;
    document.getElementById('discard-card').disabled = !isMyTurn;
}

/**
 * Advances to the next player's turn
 */
function nextTurn() {
    if (gameMode !== 'host') return;
    
    // Find current index in turn order
    const currentIndex = turnOrder.indexOf(currentTurn);
    
    // Move to next player (or back to first)
    const nextIndex = (currentIndex + 1) % turnOrder.length;
    currentTurn = turnOrder[nextIndex];
    
    // Notify all players
    connections.forEach(conn => {
        conn.send({
            type: 'turn_update',
            currentTurn: currentTurn
        });
    });
    
    // Update local UI
    updateTurnIndicator();
}