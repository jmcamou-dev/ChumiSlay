/**
 * Card Manager - Handles all card operations
 */

/**
 * Creates a card element
 * @param {string} cardId - Card ID
 * @param {string} type - Card type ('main' or 'special')
 * @param {string} imageUrl - URL of card image
 * @returns {HTMLElement} Card element
 */
function createCardElement(cardId, type, imageUrl) {
    // Create card container
    const card = document.createElement('div');
    card.className = `card ${type === CARD_TYPES.MAIN ? 'main-card' : 'special-card'}`;
    card.id = cardId;
    
    // Create card inner for flip effect
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    
    // Create card front (back of card)
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    
    // Create card back (face of card)
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    
    // Add card image
    const cardImage = document.createElement('img');
    cardImage.src = imageUrl || (type === CARD_TYPES.MAIN ? 
        `${IMAGE_PATHS.MAIN_CARDS}default.png` : 
        `${IMAGE_PATHS.SPECIAL_CARDS}default.png`);
    cardImage.alt = `Card ${cardId}`;
    
    // Assemble card
    cardBack.appendChild(cardImage);
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);
    
    // Add click event for selection
    card.addEventListener('click', () => {
        if (!gameStarted) return;
        
        if (type === CARD_TYPES.MAIN) {
            selectCard(card);
        } else {
            // Special cards can be viewed by anyone
            card.classList.toggle('flipped');
        }
    });
    
    return card;
}

/**
 * Selects a card
 * @param {HTMLElement} cardElement - Card element to select
 */
function selectCard(cardElement) {
    // Toggle flipped state to see the card
    if (!cardElement.classList.contains('flipped')) {
        cardElement.classList.add('flipped');
    }
    
    // Toggle selection state
    if (selectedCard === cardElement.id) {
        // Deselect card
        cardElement.classList.remove('selected');
        selectedCard = null;
    } else {
        // Deselect previous card if any
        if (selectedCard) {
            const prevCard = document.getElementById(selectedCard);
            if (prevCard) {
                prevCard.classList.remove('selected');
            }
        }
        
        // Select new card
        cardElement.classList.add('selected');
        selectedCard = cardElement.id;
    }
}

/**
 * Draws a card from the deck
 * @param {boolean} isSpecial - Whether to draw from special deck
 * @returns {Object} The drawn card
 */
function drawCard(isSpecial = false) {
    const deck = isSpecial ? specialDeck : mainDeck;
    
    if (deck.length === 0) {
        showMessage('No cards left in the deck!', 'error');
        return null;
    }
    
    // Draw a random card
    const randomIndex = Math.floor(Math.random() * deck.length);
    const card = deck.splice(randomIndex, 1)[0];
    
    // Notify other players if host
    if (gameMode === 'host') {
        sendGameUpdate('card_drawn', { playerId: peer.id });
    }
    
    return card;
}

/**
 * Adds a card to player's hand
 * @param {Object} card - Card to add
 */
function addCardToHand(card) {
    // Add to player hand
    playerHand.push(card);
    
    // Create card element
    const cardElement = createCardElement(card.id, CARD_TYPES.MAIN, card.imageUrl);
    cardElement.classList.add('flipped'); // Show card face up to owner
    
    // Add to player cards container
    uiElements.playerCards.appendChild(cardElement);
}

/**
 * Adds a special card to the board
 * @param {Object} card - Special card to add
 * @param {number} position - Position (0-2)
 */
function addSpecialCard(card, position) {
    // Add to special cards array
    specialCardsInPlay[position] = card;
    
    // Update UI
    const specialCardElements = document.querySelectorAll('.special-card');
    if (specialCardElements[position]) {
        // Get the back of the card (the image container)
        const cardBack = specialCardElements[position].querySelector('.card-back');
        if (cardBack) {
            const img = cardBack.querySelector('img');
            if (img) {
                img.src = card.imageUrl;
                img.alt = `Special Card ${card.id}`;
            }
        }
        
        // Flip to show the card
        specialCardElements[position].classList.add('flipped');
    }
}

/**
 * Plays a card from player's hand to played area
 * @returns {Object} The played card or null if no card selected
 */
function playCardToFront() {
    if (!selectedCard) {
        showMessage('No card selected!', 'warning');
        return null;
    }
    
    // Find card in player's hand
    const cardIndex = playerHand.findIndex(card => card.id === selectedCard);
    if (cardIndex === -1) {
        showMessage('Selected card not found in hand!', 'error');
        return null;
    }
    
    // Remove card from hand
    const playedCard = playerHand.splice(cardIndex, 1)[0];
    
    // Add to played cards
    playerPlayedCards.push(playedCard);
    
    // Remove card from UI
    const cardElement = document.getElementById(selectedCard);
    if (cardElement && cardElement.parentNode) {
        cardElement.parentNode.removeChild(cardElement);
    }
    
    // Reset selected card
    selectedCard = null;
    
    // Update played cards area
    updatePlayedCardsUI();
    
    // Notify other players
    if (connections.length > 0) {
        connections.forEach(conn => {
            conn.send({
                type: 'card_played',
                playerId: peer.id,
                cardId: playedCard.id,
                handSize: playerHand.length,
                playedCards: playerPlayedCards
            });
        });
    }
    
    return playedCard;
}

/**
 * Takes a card from another player
 * @param {string} targetPlayerId - ID of player to take from
 * @param {string} cardId - ID of card to take
 */
function takeCardFromPlayer(targetPlayerId, cardId) {
    // Send request to take card
    if (connections.length > 0) {
        connections.forEach(conn => {
            conn.send({
                type: 'take_card_request',
                targetPlayerId,
                cardId,
                requesterId: peer.id
            });
        });
    }
}

/**
 * Handles receiving a card from another player
 * @param {Object} card - Card received
 */
function receiveCard(card) {
    // Add to played cards
    playerPlayedCards.push(card);
    
    // Update UI
    updatePlayedCardsUI();
}

/**
 * Discards a card from played area
 * @returns {Object} The discarded card or null if no card selected
 */
function discardCard() {
    if (!selectedCard) {
        showMessage('No card selected!', 'warning');
        return null;
    }
    
    // Find card in played cards
    const cardIndex = playerPlayedCards.findIndex(card => card.id === selectedCard);
    if (cardIndex === -1) {
        showMessage('Selected card not found in played cards!', 'error');
        return null;
    }
    
    // Remove card from played cards
    const discardedCard = playerPlayedCards.splice(cardIndex, 1)[0];
    
    // Add to discard pile
    discardPile.push(discardedCard);
    
    // Remove card from UI
    const cardElement = document.getElementById(selectedCard);
    if (cardElement && cardElement.parentNode) {
        cardElement.parentNode.removeChild(cardElement);
    }
    
    // Reset selected card
    selectedCard = null;
    
    // Update played cards area
    updatePlayedCardsUI();
    
    // Update discard count
    const discardCounter = document.getElementById('discard-counter');
    if (discardCounter) {
        discardCounter.textContent = `Discard: ${discardPile.length}`;
    }
    
    // Notify other players if host
    if (gameMode === 'host') {
        sendGameUpdate('card_discarded', { 
            playerId: peer.id,
            cardId: discardedCard.id
        });
    }
    
    return discardedCard;
}

/**
 * Updates the played cards UI
 */
function updatePlayedCardsUI() {
    // Get or create played cards container for local player
    let container = document.querySelector('.played-cards-container[data-player="' + peer.id + '"]');
    
    if (!container) {
        container = document.createElement('div');
        container.className = 'played-cards-container';
        container.setAttribute('data-player', peer.id);
        
        const label = document.createElement('div');
        label.className = 'player-label';
        label.textContent = playerName + ' (You)';
        
        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'cards-row';
        
        container.appendChild(label);
        container.appendChild(cardsDiv);
        
        uiElements.playedCardsArea.appendChild(container);
    }
    
    // Clear existing cards
    const cardsRow = container.querySelector('.cards-row');
    cardsRow.innerHTML = '';
    
    // Add each played card
    playerPlayedCards.forEach(card => {
        const cardElement = createCardElement(card.id, CARD_TYPES.MAIN, card.imageUrl);
        cardElement.classList.add('flipped'); // Show face up
        cardsRow.appendChild(cardElement);
    });
}