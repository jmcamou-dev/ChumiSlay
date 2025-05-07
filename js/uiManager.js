/**
 * UI Manager - Handles all UI-related operations
 */

/**
 * Initializes the game UI
 */
function initializeUI() {
    console.log('Initializing UI...');
    
    // Get references to key UI elements
    uiElements.playerCards = document.getElementById('player-cards');
    uiElements.specialCards = document.querySelectorAll('.special-card');
    uiElements.opponentIndicator = document.getElementById('opponent-indicator');
    uiElements.playerName = document.getElementById('player-name');
    uiElements.playedCardsArea = document.getElementById('played-cards-area');
    uiElements.opponentHandArea = document.getElementById('opponent-hand-area');
    
    // Set player name
    uiElements.playerName.textContent = `${playerName} (You)`;
    
    // Add discard pile counter
    createDiscardCounter();
    
    // Set up button handlers
    setupButtonHandlers();
}

/**
 * Creates a discard pile counter
 */
function createDiscardCounter() {
    const counter = document.createElement('div');
    counter.id = 'discard-counter';
    counter.textContent = 'Discard: 0';
    counter.style.position = 'fixed';
    counter.style.top = '10px';
    counter.style.right = '10px';
    counter.style.padding = '5px 10px';
    counter.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    counter.style.color = 'white';
    counter.style.borderRadius = '5px';
    counter.style.zIndex = '1000';
    
    document.body.appendChild(counter);
}

/**
 * Sets up handlers for UI buttons
 */
function setupButtonHandlers() {
    // Draw card button
    const drawCardButton = document.getElementById('draw-card');
    drawCardButton.addEventListener('click', () => {
        if (!gameStarted) {
            showMessage('Game has not started yet!', 'warning');
            return;
        }
        
        if (currentTurn !== peer.id) {
            showMessage('Not your turn!', 'warning');
            return;
        }
        
        const card = drawCard(false);
        if (card) {
            addCardToHand(card);
            showMessage('Card drawn!', 'success');
            
            // End turn if host
            if (gameMode === 'host') {
                nextTurn();
            }
        }
    });
    
    // Play card button
    const playCardButton = document.getElementById('play-card');
    playCardButton.addEventListener('click', () => {
        if (!gameStarted) {
            showMessage('Game has not started yet!', 'warning');
            return;
        }
        
        if (currentTurn !== peer.id) {
            showMessage('Not your turn!', 'warning');
            return;
        }
        
        const playedCard = playCardToFront();
        if (playedCard) {
            showMessage('Card played!', 'success');
            
            // End turn if host
            if (gameMode === 'host') {
                nextTurn();
            }
        }
    });
    
    // Take card button
    const takeCardButton = document.getElementById('take-card');
    takeCardButton.addEventListener('click', () => {
        if (!gameStarted) {
            showMessage('Game has not started yet!', 'warning');
            return;
        }
        
        if (currentTurn !== peer.id) {
            showMessage('Not your turn!', 'warning');
            return;
        }
        
        if (connectedPlayers.length === 0) {
            showMessage('No other players to take from!', 'warning');
            return;
        }
        
        showTakeCardDialog();
    });
    
    // Discard card button
    const discardCardButton = document.getElementById('discard-card');
    discardCardButton.addEventListener('click', () => {
        if (!gameStarted) {
            showMessage('Game has not started yet!', 'warning');
            return;
        }
        
        if (currentTurn !== peer.id) {
            showMessage('Not your turn!', 'warning');
            return;
        }
        
        const discardedCard = discardCard();
        if (discardedCard) {
            showMessage('Card discarded!', 'success');
            
            // End turn if host
            if (gameMode === 'host') {
                nextTurn();
            }
        }
    });
}

/**
 * Shows a dialog to select a player and card to take
 */
function showTakeCardDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    const dialogBox = document.createElement('div');
    dialogBox.className = 'dialog-box';
    
    // Create dialog content
    dialogBox.innerHTML = `
        <h2 style="text-align: center; margin-top: 0;">Take a Card</h2>
        <p>Select a player to take a card from:</p>
        <select id="player-select" style="width: 100%; padding: 8px; margin: 15px 0; border-radius: 5px;">
            ${connectedPlayers.map(player => 
                `<option value="${player.id}">${player.name}</option>`
            ).join('')}
        </select>
        
        <div id="player-cards-container" style="min-height: 100px; margin: 15px 0;"></div>
        
        <div style="display: flex; justify-content: center; gap: 10px;">
            <button id="cancel-take">Cancel</button>
            <button id="confirm-take" disabled>Take Card</button>
        </div>
    `;
    
    dialog.appendChild(dialogBox);
    document.body.appendChild(dialog);
    
    // Handle player selection
    const playerSelect = document.getElementById('player-select');
    const cardsContainer = document.getElementById('player-cards-container');
    
    // Show selected player's cards
    playerSelect.addEventListener('change', () => {
        const selectedPlayerId = playerSelect.value;
        showSelectedPlayerCards(selectedPlayerId, cardsContainer);
    });
    
    // Show first player's cards by default
    if (connectedPlayers.length > 0) {
        showSelectedPlayerCards(connectedPlayers[0].id, cardsContainer);
    }
    
    // Button handlers
    document.getElementById('cancel-take').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
    
    document.getElementById('confirm-take').addEventListener('click', () => {
        const selectedPlayerId = playerSelect.value;
        const selectedCardId = document.querySelector('#player-cards-container .card.selected')?.id;
        
        if (selectedCardId) {
            takeCardFromPlayer(selectedPlayerId, selectedCardId);
            document.body.removeChild(dialog);
            
            // End turn if host
            if (gameMode === 'host') {
                nextTurn();
            }
        }
    });
}

/**
 * Shows a player's cards in the take card dialog
 * @param {string} playerId - Player to show cards for
 * @param {HTMLElement} container - Container element
 */
function showSelectedPlayerCards(playerId, container) {
    // For a real implementation, we would get the actual cards from the player
    // For now, we'll just show placeholders
    container.innerHTML = '';
    
    // Find player 
    const player = connectedPlayers.find(p => p.id === playerId);
    if (!player) return;
    
    const cardsHeading = document.createElement('p');
    cardsHeading.textContent = `${player.name}'s cards:`;
    container.appendChild(cardsHeading);
    
    // Create a row for cards
    const cardsRow = document.createElement('div');
    cardsRow.style.display = 'flex';
    cardsRow.style.gap = '10px';
    cardsRow.style.justifyContent = 'center';
    
    // Add cards (we'll simulate 3 cards for now)
    for (let i = 0; i < 3; i++) {
        const cardId = `played-${playerId}-${i}`;
        const card = document.createElement('div');
        card.className = 'card main-card';
        card.id = cardId;
        card.style.width = '80px';
        card.style.height = '112px';
        card.style.backgroundColor = '#f0f0f0';
        card.style.borderRadius = '8px';
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', () => {
            // Deselect all cards
            document.querySelectorAll('#player-cards-container .card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // Select this card
            card.classList.add('selected');
            
            // Enable confirm button
            document.getElementById('confirm-take').disabled = false;
        });
        
        cardsRow.appendChild(card);
    }
    
    container.appendChild(cardsRow);
}

/**
 * Updates the opponents UI
 */
function updateOpponentsUI() {
    const opponentContainer = uiElements.opponentIndicator;
    opponentContainer.innerHTML = '';
    
    // Add each connected player
    connectedPlayers.forEach(player => {
        const opponent = document.createElement('div');
        opponent.className = 'opponent';
        opponent.style.color = player.color || 'white';
        opponent.textContent = `${player.name}: ${player.handSize || 5} cards`;
        
        // Highlight if it's their turn
        if (player.id === currentTurn) {
            opponent.style.fontWeight = 'bold';
            opponent.style.border = '2px solid white';
        }
        
        opponentContainer.appendChild(opponent);
    });
}

/**
 * Updates the opponent hands display
 */
function updateOpponentHandsUI() {
    const opponentHandArea = uiElements.opponentHandArea;
    opponentHandArea.innerHTML = '';
    
    // Add each connected player's hand
    connectedPlayers.forEach(player => {
        const opponentHand = document.createElement('div');
        opponentHand.className = 'opponent-hand';
        
        const opponentName = document.createElement('div');
        opponentName.className = 'player-label';
        opponentName.textContent = player.name;
        opponentName.style.color = player.color || 'white';
        opponentName.setAttribute('data-player', player.id);
        
        // Highlight if it's their turn
        if (player.id === currentTurn) {
            opponentName.classList.add('current-turn');
        }
        
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'opponent-cards';
        
        // Add face-down cards based on hand size
        const cardCount = player.handSize || 5;
        for (let i = 0; i < cardCount; i++) {
            const card = document.createElement('div');
            card.className = 'card main-card';
            cardsContainer.appendChild(card);
        }
        
        opponentHand.appendChild(opponentName);
        opponentHand.appendChild(cardsContainer);
        opponentHandArea.appendChild(opponentHand);
    });
    
    // Update played cards area for opponents
    updateOpponentPlayedCards();
}

/**
 * Updates the played cards for all opponents
 */
function updateOpponentPlayedCards() {
    // Clear all opponent played cards containers
    const oldContainers = document.querySelectorAll('.played-cards-container:not([data-player="' + peer.id + '"])');
    oldContainers.forEach(container => container.remove());
    
    // Add played cards for each opponent
    connectedPlayers.forEach(player => {
        if (!player.playedCards || player.playedCards.length === 0) return;
        
        // Create container for this player's played cards
        const container = document.createElement('div');
        container.className = 'played-cards-container';
        container.setAttribute('data-player', player.id);
        
        const label = document.createElement('div');
        label.className = 'player-label';
        label.textContent = player.name;
        label.style.color = player.color || 'white';
        
        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'cards-row';
        
        // Add each played card
        player.playedCards.forEach(card => {
            const cardElement = createCardElement(card.id, CARD_TYPES.MAIN, card.imageUrl);
            cardElement.classList.add('flipped'); // Show face up
            cardsDiv.appendChild(cardElement);
        });
        
        container.appendChild(label);
        container.appendChild(cardsDiv);
        
        uiElements.playedCardsArea.appendChild(container);
    });
}

/**
 * Shows a message to the user
 * @param {string} text - Message text
 * @param {string} type - Message type ('success', 'error', 'warning', 'info')
 */
function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.position = 'fixed';
    message.style.bottom = '30px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.color = 'white';
    message.style.zIndex = '2000';
    
    // Set background color based on type
    switch (type) {
        case 'success': message.style.backgroundColor = 'rgba(46, 204, 113, 0.9)'; break;
        case 'error': message.style.backgroundColor = 'rgba(231, 76, 60, 0.9)'; break;
        case 'warning': message.style.backgroundColor = 'rgba(241, 196, 15, 0.9)'; break;
        case 'info': default: message.style.backgroundColor = 'rgba(52, 152, 219, 0.9)'; break;
    }
    
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.style.opacity = '0';
            message.style.transition = 'opacity 0.5s';
            
            setTimeout(() => {
                if (message.parentNode) {
                    document.body.removeChild(message);
                }
            }, 500);
        }
    }, 3000);
}