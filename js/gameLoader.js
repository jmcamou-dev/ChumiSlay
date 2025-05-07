/**
 * Game Loader - Loads the game and handles initialization
 */

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', initLoader);

// Variables to track loading progress
let loadedScripts = 0;
let totalScripts = 6; // cardManager, deckManager, uiManager, networking, controls, gameLogic

/**
 * Initializes the game loader
 */
function initLoader() {
    // Create loading screen
    createLoadingScreen();
    
    // Start loading core game scripts
    loadGameScripts();
}

/**
 * Creates a simple loading screen
 */
function createLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    
    // Game title
    const title = document.createElement('h1');
    title.textContent = 'Card Game';
    title.style.color = '#ffffff';
    title.style.fontSize = '48px';
    title.style.marginBottom = '20px';
    
    // Loading bar container
    const progressContainer = document.createElement('div');
    progressContainer.style.width = '300px';
    progressContainer.style.height = '20px';
    progressContainer.style.backgroundColor = '#333333';
    progressContainer.style.borderRadius = '10px';
    progressContainer.style.overflow = 'hidden';
    progressContainer.style.marginBottom = '20px';
    
    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.id = 'loading-progress';
    progressBar.style.width = '0%';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#00a2ff';
    progressBar.style.transition = 'width 0.3s';
    
    // Loading text
    const loadingText = document.createElement('div');
    loadingText.id = 'loading-text';
    loadingText.textContent = 'Loading... 0%';
    loadingText.style.color = '#ffffff';
    
    // Assemble elements
    progressContainer.appendChild(progressBar);
    loadingScreen.appendChild(title);
    loadingScreen.appendChild(progressContainer);
    loadingScreen.appendChild(loadingText);
}

/**
 * Loads all game scripts in order
 */
function loadGameScripts() {
    const scripts = [
        'js/utilities.js',
        'js/cardManager.js',
        'js/deckManager.js',
        'js/uiManager.js',
        'js/networking.js',
        'js/controls.js',
        'js/gameLogic.js'
    ];
    
    // Load scripts sequentially
    loadNextScript(scripts, 0);
}

/**
 * Loads the next script in the list
 */
function loadNextScript(scripts, index) {
    if (index >= scripts.length) {
        // All scripts loaded, initialize game
        setTimeout(initializeGame, 500);
        return;
    }
    
    const script = document.createElement('script');
    script.src = scripts[index];
    
    script.onload = () => {
        // Update progress bar
        loadedScripts++;
        updateLoadingProgress();
        
        // Load next script
        loadNextScript(scripts, index + 1);
    };
    
    script.onerror = () => {
        console.error(`Failed to load script: ${scripts[index]}`);
        // Retry loading the script
        setTimeout(() => loadNextScript(scripts, index), 1000);
    };
    
    document.body.appendChild(script);
}

/**
 * Updates the loading progress bar
 */
function updateLoadingProgress() {
    const progressPercent = Math.round((loadedScripts / totalScripts) * 100);
    
    // Update progress bar
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
    
    // Update loading text
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = `Loading... ${progressPercent}%`;
    }
}

/**
 * Initializes the game after loading
 */
function initializeGame() {
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s';
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        
        // Show game container
        const gameContainer = document.getElementById('game-container');
        gameContainer.classList.remove('hidden');
        
        // Initialize game variables
        initGameVariables();
        
        // Show title screen with options to host or join
        showTitleScreen();
    }, 500);
}

/**
 * Initializes game variables
 */
function initGameVariables() {
    // Reset player hand
    window.playerHand = [];
    window.playerPlayedCards = [];
    window.discardPile = [];
    window.selectedCard = null;
    
    // Reset game state
    window.gameStarted = false;
    window.gameMode = null;
    window.gameCode = null;
    window.gameCodeToJoin = null;
    window.currentTurn = null;
    window.turnOrder = [];
    
    // Reset decks
    window.mainDeck = [];
    window.specialDeck = [];
    window.specialCardsInPlay = [];
    
    // Reset networking
    window.connections = [];
    window.connectedPlayers = [];
}

/**
 * Shows the title screen with host/join options
 */
function showTitleScreen() {
    // Create modal for host/join options
    const titleScreen = document.createElement('div');
    titleScreen.className = 'dialog-overlay';
    
    const titleBox = document.createElement('div');
    titleBox.className = 'dialog-box';
    titleBox.style.textAlign = 'center';
    
    titleBox.innerHTML = `
        <h1 style="color: #1a472a; margin-top: 0;">Card Game</h1>
        <p>Choose an option to start:</p>
        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
            <button id="host-game-btn" style="padding: 15px;">Host New Game</button>
            <button id="join-game-btn" style="padding: 15px;">Join Game</button>
        </div>
    `;
    
    titleScreen.appendChild(titleBox);
    document.body.appendChild(titleScreen);
    
    // Add button event listeners
    document.getElementById('host-game-btn').addEventListener('click', () => {
        document.body.removeChild(titleScreen);
        promptPlayerName('host');
    });
    
    document.getElementById('join-game-btn').addEventListener('click', () => {
        document.body.removeChild(titleScreen);
        promptPlayerName('join');
    });
}

/**
 * Prompts for player name
 */
function promptPlayerName(mode) {
    const namePrompt = document.createElement('div');
    namePrompt.className = 'dialog-overlay';
    
    const promptBox = document.createElement('div');
    promptBox.className = 'dialog-box';
    
    promptBox.innerHTML = `
        <h2 style="color: #1a472a; margin-top: 0; text-align: center;">Enter Your Name</h2>
        <input type="text" id="player-name-input" value="${playerName}" 
            style="width: 100%; padding: 8px; margin: 15px 0; border: 1px solid #ccc; border-radius: 5px;">
        
        ${mode === 'join' ? `
        <h3 style="margin-top: 20px;">Enter Game Code</h3>
        <input type="text" id="game-code-input" placeholder="Enter code from host" 
            style="width: 100%; padding: 8px; margin: 15px 0; border: 1px solid #ccc; border-radius: 5px;">
        ` : ''}
        
        <div style="display: flex; justify-content: center; margin-top: 20px;">
            <button id="continue-btn" style="padding: 10px 30px;">Continue</button>
        </div>
    `;
    
    namePrompt.appendChild(promptBox);
    document.body.appendChild(namePrompt);
    
    // Focus on input
    setTimeout(() => document.getElementById('player-name-input').focus(), 100);
    
    // Add button event listener
    document.getElementById('continue-btn').addEventListener('click', () => {
        const nameInput = document.getElementById('player-name-input');
        if (nameInput.value.trim()) {
            playerName = nameInput.value.trim();
        }
        
        if (mode === 'join') {
            const codeInput = document.getElementById('game-code-input');
            if (codeInput.value.trim()) {
                gameCodeToJoin = codeInput.value.trim();
                gameMode = 'join';
            } else {
                alert('Please enter a game code!');
                return;
            }
        } else {
            gameMode = 'host';
        }
        
        document.body.removeChild(namePrompt);
        
        // Set up networking
        setupNetworking();
    });
}