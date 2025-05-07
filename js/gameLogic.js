/**
 * Game Logic - Main game initialization and logic
 */

/**
 * Main game initialization
 */
function initGame() {
    console.log('Initializing game...');
    
    try {
        // Initialize random player color if not set
        if (!playerColor) {
            playerColor = getRandomColor();
        }
        
        // Initialize UI
        initializeUI();
        
        // Initialize controls
        initializeControls();
        
        // Initialize decks if host
        if (gameMode === 'host') {
            initializeDecks();
        }
        
        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Error initializing game:', error);
        showMessage('Error initializing game!', 'error');
    }
}

/**
 * Generates a random color
 * @returns {string} Random color in hex format
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Simple debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Debounce timeout
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * Handles window resize events
 */
function handleWindowResize() {
    window.addEventListener('resize', debounce(() => {
        updateUIForScreenSize();
    }, 250));
}

/**
 * Updates UI based on screen size
 */
function updateUIForScreenSize() {
    const width = window.innerWidth;
    
    // Adjust card sizes based on screen width
    if (width < 480) {
        document.documentElement.style.setProperty('--main-card-width', '70px');
        document.documentElement.style.setProperty('--main-card-height', '98px');
        document.documentElement.style.setProperty('--special-card-width', '70px');
        document.documentElement.style.setProperty('--special-card-height', '121px');
    } else if (width < 768) {
        document.documentElement.style.setProperty('--main-card-width', '90px');
        document.documentElement.style.setProperty('--main-card-height', '126px');
        document.documentElement.style.setProperty('--special-card-width', '90px');
        document.documentElement.style.setProperty('--special-card-height', '155px');
    } else {
        document.documentElement.style.setProperty('--main-card-width', '120px');
        document.documentElement.style.setProperty('--main-card-height', '168px');
        document.documentElement.style.setProperty('--special-card-width', '120px');
        document.documentElement.style.setProperty('--special-card-height', '207px');
    }
}

/**
 * Checks if it's the player's turn
 * @returns {boolean} True if it's the player's turn
 */
function isPlayerTurn() {
    return currentTurn === peer.id;
}

/**
 * Ends the current game
 * @param {string} reason - Reason for ending the game
 */
function endGame(reason) {
    // Create game over overlay
    const overlay = document.createElement('div');
    overlay.className = 'dialog-overlay';
    
    const gameOverBox = document.createElement('div');
    gameOverBox.className = 'dialog-box';
    gameOverBox.style.textAlign = 'center';
    
    gameOverBox.innerHTML = `
        <h2>Game Over</h2>
        <p>${reason}</p>
        <button id="new-game-btn">New Game</button>
    `;
    
    overlay.appendChild(gameOverBox);
    document.body.appendChild(overlay);
    
    // New game button handler
    document.getElementById('new-game-btn').addEventListener('click', () => {
        window.location.reload();
    });
    
    // Close connections
    if (peer) {
        peer.destroy();
    }
}

/**
 * Utility function to add a callback after a delay
 * @param {Function} callback - Function to call
 * @param {number} delay - Delay in milliseconds
 */
function delayedCallback(callback, delay) {
    window.setTimeout(callback, delay);
}

/**
 * Checks if there's a winner
 * @returns {boolean} True if there's a winner
 */
function checkForWinner() {
    // Example win condition: Player has 10 cards in front of them
    if (playerPlayedCards.length >= 10) {
        endGame('You won! You collected 10 cards!');
        return true;
    }
    
    // Check if other players have won
    for (const player of connectedPlayers) {
        // This is just a placeholder - in a real implementation,
        // we would track each player's played cards count
        if (player.playedCards && player.playedCards.length >= 10) {
            endGame(`${player.name} won with 10 cards!`);
            return true;
        }
    }
    
    return false;
}