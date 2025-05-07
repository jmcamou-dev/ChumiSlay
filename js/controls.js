/**
 * Networking - Handles multiplayer functionality with PeerJS
 */

/**
 * Sets up multiplayer networking
 */
function setupNetworking() {
    console.log('Setting up networking...');
    
    // Create network status indicator
    createNetworkStatus();
    
    if (gameMode === 'host') {
        // Generate random game code
        gameCode = Math.floor(100 + Math.random() * 900).toString();
        
        // Display game code
        createGameCodeDisplay(gameCode);
        
        // Initialize as host
        initializeAsHost();
    } else if (gameMode === 'join') {
        // Display game code
        createGameCodeDisplay(gameCodeToJoin + ' (Joining)');
        
        // Initialize as client
        initializeAsClient();
    }
}

/**
 * Creates network status indicator
 */
function createNetworkStatus() {
    const status = document.createElement('div');
    status.id = 'network-status';
    status.textContent = 'Connecting...';
    status.style.position = 'fixed';
    status.style.top = '10px';
    status.style.left = '10px';
    status.style.padding = '5px 10px';
    status.style.backgroundColor = 'rgba(255, 165, 0, 0.8)';
    status.style.color = 'white';
    status.style.borderRadius = '5px';
    status.style.zIndex = '1000';
    
    document.body.appendChild(status);
}

/**
 * Updates network status indicator
 * @param {string} status - 'connecting', 'online', or 'offline'
 */
function updateNetworkStatus(status) {
    const statusEl = document.getElementById('network-status');
    if (!statusEl) return;
    
    switch (status) {
        case 'connecting':
            statusEl.textContent = 'Connecting...';
            statusEl.style.backgroundColor = 'rgba(255, 165, 0, 0.8)';
            break;
        case 'online':
            statusEl.textContent = 'Online';
            statusEl.style.backgroundColor = 'rgba(46, 204, 113, 0.8)';
            break;
        case 'offline':
            statusEl.textContent = 'Offline';
            statusEl.style.backgroundColor = 'rgba(231, 76, 60, 0.8)';
            break;
    }
}

/**
 * Creates a display for the game code
 * @param {string} code - Game code
 */
function createGameCodeDisplay(code) {
    const codeDisplay = document.createElement('div');
    codeDisplay.id = 'game-code';
    codeDisplay.innerHTML = `<span>Game Code: <strong>${code}</strong></span>`;
    codeDisplay.style.position = 'fixed';
    codeDisplay.style.top = '10px';
    codeDisplay.style.left = '50%';
    codeDisplay.style.transform = 'translateX(-50%)';
    codeDisplay.style.padding = '5px 15px';
    codeDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    codeDisplay.style.color = 'white';
    codeDisplay.style.borderRadius = '5px';
    codeDisplay.style.zIndex = '1000';
    
    document.body.appendChild(codeDisplay);
}

/**
 * Initializes as host
 */
function initializeAsHost() {
    // Create peer with game code as ID
    peer = new Peer(gameCode);
    updateNetworkStatus('connecting');
    
    peer.on('open', id => {
        console.log('Connected to PeerJS with ID:', id);
        updateNetworkStatus('online');
        
        // Show waiting room
        createWaitingRoom();
    });
    
    peer.on('connection', conn => {
        console.log('New connection from:', conn.peer);
        
        // Handle new connection
        handleNewConnection(conn);
    });
    
    peer.on('error', err => {
        console.error('PeerJS error:', err);
        updateNetworkStatus('offline');
        showMessage('Network error: ' + err.message, 'error');
    });
}

/**
 * Initializes as client
 */
function initializeAsClient() {
    // Create peer with random ID
    const randomId = 'player_' + Math.floor(Math.random() * 10000);
    peer = new Peer(randomId);
    updateNetworkStatus('connecting');
    
    peer.on('open', id => {
        console.log('Connected to PeerJS with ID:', id);
        updateNetworkStatus('online');
        
        // Connect to host
        joinGame(gameCodeToJoin);
    });
    
    peer.on('error', err => {
        console.error('PeerJS error:', err);
        updateNetworkStatus('offline');
        showMessage('Network error: ' + err.message, 'error');
    });
}

/**
 * Creates waiting room UI for host
 */
function createWaitingRoom() {
    const waitingRoom = document.createElement('div');
    waitingRoom.className = 'waiting-room';
    waitingRoom.id = 'waiting-room';
    
    waitingRoom.innerHTML = `
        <h2>Waiting for Players</h2>
        <p>Share your game code: <strong>${gameCode}</strong></p>
        <div id="players-list" style="margin: 20px 0;">
            <div class="player-entry">
                <span style="color: ${playerColor};">●</span> ${playerName} (Host)
            </div>
        </div>
        <button id="start-game-btn">Start Game</button>
    `;
    
    document.body.appendChild(waitingRoom);
    
    // Start game button handler
    document.getElementById('start-game-btn').addEventListener('click', () => {
        if (gameMode === 'host') {
            startGame();
        }
    });
}

/**
 * Updates the waiting room with connected players
 */
function updateWaitingRoom() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    // Clear existing player entries (except host)
    const existingEntries = playersList.querySelectorAll('.player-entry:not(:first-child)');
    existingEntries.forEach(entry => entry.remove());
    
    // Add each connected player
    connectedPlayers.forEach(player => {
        const playerEntry = document.createElement('div');
        playerEntry.className = 'player-entry';
        playerEntry.innerHTML = `<span style="color: ${player.color || 'white'};">●</span> ${player.name}`;
        playersList.appendChild(playerEntry);
    });
}

/**
 * Handles a new connection
 * @param {DataConnection} conn - The connection
 */
function handleNewConnection(conn) {
    // Add to connections array
    connections.push(conn);
    
    // Set up event handlers
    conn.on('open', () => {
        // Send welcome message
        conn.send({
            type: 'welcome',
            hostName: playerName
        });
    });
    
    conn.on('data', data => {
        handleIncomingData(conn, data);
    });
    
    conn.on('close', () => {
        handleDisconnection(conn);
    });
}

/**
 * Joins a game with the given code
 * @param {string} code - Game code to join
 */
function joinGame(code) {
    // Connect to host
    const conn = peer.connect(code);
    
    conn.on('open', () => {
        // Add to connections array
        connections.push(conn);
        
        // Send player info
        conn.send({
            type: 'player_info',
            name: playerName,
            color: playerColor
        });
        
        // Set up event handlers
        conn.on('data', data => {
            handleIncomingData(conn, data);
        });
        
        conn.on('close', () => {
            handleDisconnection(conn);
        });
    });
    
    conn.on('error', err => {
        console.error('Connection error:', err);
        showMessage('Failed to join game: ' + err.message, 'error');
    });
}

/**
 * Handles incoming data from other players
 * @param {DataConnection} conn - The connection
 * @param {Object} data - The data received
 */
function handleIncomingData(conn, data) {
    console.log('Received data:', data);
    
    switch (data.type) {
        case 'welcome':
            // Host welcomed us
            showMessage(`Connected to ${data.hostName}'s game!`, 'success');
            break;
            
        case 'player_info':
            // Player sent their info
            addPlayerToGame(conn.peer, data.name, data.color);
            break;
            
        case 'game_start':
            // Host started the game
            gameStarted = true;
            hideWaitingRoom();
            initializeUI();
            
            // Initialize player's hand using provided cards
            if (data.playerCards) {
                updatePlayerHand(data.playerCards);
            }
            
            // Initialize special cards
            if (data.specialCards) {
                updateSpecialCards(data.specialCards);
            }
            
            // Set turn order
            if (data.turnOrder) {
                updateTurnOrder(data.turnOrder, data.currentTurn);
            }
            
            showMessage('Game started!', 'success');
            break;
            
        case 'hand_update':
            // Update player's hand
            updatePlayerHand(data.cards);
            break;
            
        case 'special_cards_update':
            // Update special cards
            updateSpecialCards(data.cards);
            break;
            
        case 'turn_order_update':
            // Update turn order
            updateTurnOrder(data.turnOrder, data.currentTurn);
            break;
            
        case 'turn_update':
            // Update current turn
            currentTurn = data.currentTurn;
            updateTurnIndicator();
            break;
            
        case 'card_played':
            // Another player played a card
            handleCardPlayed(data.playerId, data.cardId);
            
            // Update opponent hand size
            updateOpponentHandSize(data.playerId, data.handSize || 0);
            break;
            
        case 'card_drawn':
            // Another player drew a card
            showMessage(`${getPlayerName(data.playerId)} drew a card`, 'info');
            
            // Update opponent hand size
            updateOpponentHandSize(data.playerId, data.handSize || 0);
            break;
            
        case 'take_card_request':
            // Handle request to take a card
            handleCardTakeRequest(data.requesterId, data.targetPlayerId, data.cardId);
            break;
            
        case 'card_taken':
            // Card was taken from player
            showMessage(`${getPlayerName(data.playerId)} took a card from ${getPlayerName(data.targetPlayerId)}`, 'info');
            break;
    }
}

/**
 * Adds a player to the game
 * @param {string} playerId - Player ID
 * @param {string} name - Player name
 * @param {string} color - Player color
 */
function addPlayerToGame(playerId, name, color) {
    // Check if player already exists
    if (!connectedPlayers.some(p => p.id === playerId)) {
        // Add to connected players
        connectedPlayers.push({
            id: playerId,
            name: name,
            color: color,
            handSize: 0
        });
        
        // Update waiting room if host
        if (gameMode === 'host') {
            updateWaitingRoom();
        }
        
        showMessage(`${name} joined the game!`, 'info');
    }
}

/**
 * Handles when a player disconnects
 * @param {DataConnection} conn - The connection
 */
function handleDisconnection(conn) {
    // Find player
    const playerIndex = connectedPlayers.findIndex(p => p.id === conn.peer);
    
    if (playerIndex !== -1) {
        const player = connectedPlayers[playerIndex];
        
        // Remove from connected players
        connectedPlayers.splice(playerIndex, 1);
        
        // Remove from connections
        const connIndex = connections.indexOf(conn);
        if (connIndex !== -1) {
            connections.splice(connIndex, 1);
        }
        
        // Update waiting room if host
        if (gameMode === 'host') {
            updateWaitingRoom();
        }
        
        // Update turn order if game started
        if (gameStarted && gameMode === 'host') {
            // Remove from turn order
            const turnIndex = turnOrder.indexOf(conn.peer);
            if (turnIndex !== -1) {
                turnOrder.splice(turnIndex, 1);
                
                // Update current turn if needed
                if (currentTurn === conn.peer) {
                    nextTurn();
                }
                
                // Notify other players
                sendGameUpdate('turn_order_update', {
                    turnOrder: turnOrder,
                    currentTurn: currentTurn
                });
            }
        }
        
        showMessage(`${player.name} left the game!`, 'warning');
    }
}

/**
 * Starts the game (host only)
 */
function startGame() {
    if (gameMode !== 'host') return;
    
    // Initialize the game
    gameStarted = true;
    initializeDecks();
    initializeUI();
    
    // Hide waiting room
    hideWaitingRoom();
    
    // Send game start to all players
    connections.forEach(conn => {
        // Get cards for this player
        const playerCards = getCardsForPlayer(conn.peer);
        
        conn.send({
            type: 'game_start',
            playerCards: playerCards,
            specialCards: specialCardsInPlay,
            turnOrder: turnOrder,
            currentTurn: currentTurn
        });
    });
    
    showMessage('Game started!', 'success');
}

/**
 * Gets cards for a player (host only)
 * @param {string} playerId - Player ID
 * @returns {Array} Array of cards
 */
function getCardsForPlayer(playerId) {
    // Find player
    const player = connectedPlayers.find(p => p.id === playerId);
    if (!player) return [];
    
    // Create hand for player
    const hand = [];
    for (let i = 0; i < 5; i++) {
        const card = drawCard(false);
        if (card) {
            hand.push(card);
        }
    }
    
    // Update player's hand size
    player.handSize = hand.length;
    
    return hand;
}

/**
 * Hides the waiting room
 */
function hideWaitingRoom() {
    const waitingRoom = document.getElementById('waiting-room');
    if (waitingRoom && waitingRoom.parentNode) {
        waitingRoom.parentNode.removeChild(waitingRoom);
    }
}

/**
 * Updates an opponent's hand size
 * @param {string} playerId - Player ID
 * @param {number} size - New hand size
 */
function updateOpponentHandSize(playerId, size) {
    // Find player
    const player = connectedPlayers.find(p => p.id === playerId);
    if (player) {
        player.handSize = size;
        
        // Update opponents UI
        updateOpponentsUI();
        updateOpponentHandsUI();
    }
}

/**
 * Gets a player's name by ID
 * @param {string} playerId - Player ID
 * @returns {string} Player name
 */
function getPlayerName(playerId) {
    if (playerId === peer.id) {
        return playerName + ' (You)';
    }
    
    const player = connectedPlayers.find(p => p.id === playerId);
    return player ? player.name : 'Unknown Player';
}

/**
 * Handles when a player plays a card
 * @param {string} playerId - Player ID
 * @param {string} cardId - Card ID
 */
function handleCardPlayed(playerId, cardId) {
    showMessage(`${getPlayerName(playerId)} played a card`, 'info');
    
    // Update opponents UI
    updateOpponentsUI();
    updateOpponentHandsUI();
}

/**
 * Handles when a player requests to take a card
 * @param {string} requesterId - Player requesting
 * @param {string} targetPlayerId - Player being targeted
 * @param {string} cardId - Card ID
 */
function handleCardTakeRequest(requesterId, targetPlayerId, cardId) {
    // Only process if this is the target player
    if (targetPlayerId !== peer.id) return;
    
    // For a real implementation, we would check if the card exists
    // For now, simulate finding the card
    const card = {
        id: cardId,
        type: CARD_TYPES.MAIN,
        imageUrl: `${IMAGE_PATHS.MAIN_CARDS}card_1.png`,
        value: 1,
        name: 'Taken Card',
        description: 'This card was taken from another player'
    };
    
    // Remove card from player's played cards
    const cardIndex = playerPlayedCards.findIndex(c => c.id === cardId);
    if (cardIndex !== -1) {
        playerPlayedCards.splice(cardIndex, 1);
    }
    
    // Update UI
    updatePlayedCardsUI();
    
    // Send card to requester
    const requesterConn = connections.find(c => c.peer === requesterId);
    if (requesterConn) {
        requesterConn.send({
            type: 'card_received',
            card: card
        });
    }
    
    showMessage(`${getPlayerName(requesterId)} took your card!`, 'warning');
}

/**
 * Sends a game update to all players
 * @param {string} type - Update type
 * @param {Object} data - Update data
 */
function sendGameUpdate(type, data) {
    if (connections.length === 0) return;
    
    connections.forEach(conn => {
        conn.send({
            type: type,
            ...data
        });
    });
}