/**
 * Main Menu - Handles the game's main menu
 */

/**
 * Initializes the main menu
 */
function initializeMainMenu() {
    console.log('Initializing main menu...');
    
    // Show the game code prompt
    showGameCodePrompt();
}

/**
 * Creates a menu for game setup options
 */
function createGameSetupMenu() {
    const menuOverlay = document.createElement('div');
    menuOverlay.style.position = 'fixed';
    menuOverlay.style.top = '0';
    menuOverlay.style.left = '0';
    menuOverlay.style.width = '100%';
    menuOverlay.style.height = '100%';
    menuOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    menuOverlay.style.display = 'flex';
    menuOverlay.style.justifyContent = 'center';
    menuOverlay.style.alignItems = 'center';
    menuOverlay.style.zIndex = '3000';
    
    const menuBox = document.createElement('div');
    menuBox.style.width = '90%';
    menuBox.style.maxWidth = '500px';
    menuBox.style.backgroundColor = 'white';
    menuBox.style.color = '#333';
    menuBox.style.borderRadius = '10px';
    menuBox.style.padding = '30px';
    
    menuBox.innerHTML = `
        <h2 style="text-align: center; margin-top: 0; color: #1a472a;">Game Setup</h2>
        
        <div style="margin: 20px 0;">
            <h3>Player Settings</h3>
            <div style="margin-bottom: 15px;">
                <label for="player-name-setup" style="display: block; margin-bottom: 5px;">Your Name:</label>
                <input type="text" id="player-name-setup" value="${playerName}" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 5px;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px;">Player Color:</label>
                <div id="color-picker" style="display: flex; flex-wrap: wrap; gap: 10px;"></div>
            </div>
        </div>
        
        <div style="margin: 20px 0;">
            <h3>Game Settings</h3>
            <div style="margin-bottom: 15px;">
                <label for="game-mode-select" style="display: block; margin-bottom: 5px;">Game Mode:</label>
                <select id="game-mode-select" style="padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 5px;">
                    <option value="standard">Standard</option>
                    <option value="quick">Quick Play</option>
                    <option value="advanced">Advanced</option>
                </select>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
            <button id="start-game-btn" style="padding: 10px 30px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Start Game</button>
        </div>
    `;
    
    menuOverlay.appendChild(menuBox);
    document.body.appendChild(menuOverlay);
    
    // Add colors to the color picker
    const colors = [
        '#ff0000', '#00ff00', '#0000ff', '#ffff00',
        '#ff00ff', '#00ffff', '#ff8800', '#8800ff'
    ];
    
    const colorPicker = document.getElementById('color-picker');
    
    colors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.style.width = '30px';
        colorOption.style.height = '30px';
        colorOption.style.backgroundColor = color;
        colorOption.style.borderRadius = '5px';
        colorOption.style.cursor = 'pointer';
        
        // Highlight the current color
        if (color === playerColor) {
            colorOption.style.boxShadow = '0 0 0 3px #333';
        }
        
        colorOption.addEventListener('click', () => {
            // Remove highlight from other colors
            document.querySelectorAll('#color-picker div').forEach(div => {
                div.style.boxShadow = 'none';
            });
            
            // Highlight selected color
            colorOption.style.boxShadow = '0 0 0 3px #333';
            
            // Set player color
            playerColor = color;
        });
        
        colorPicker.appendChild(colorOption);
    });
    
    // Add start button functionality
    document.getElementById('start-game-btn').addEventListener('click', () => {
        // Get player name
        const nameInput = document.getElementById('player-name-setup');
        if (nameInput && nameInput.value.trim() !== '') {
            playerName = nameInput.value.trim();
        }
        
        // Remove menu
        document.body.removeChild(menuOverlay);
        
        // Start the game
        startGame();
    });
}

/**
 * Shows the game title splash screen
 */
function showTitleScreen() {
    const titleScreen = document.createElement('div');
    titleScreen.style.position = 'fixed';
    titleScreen.style.top = '0';
    titleScreen.style.left = '0';
    titleScreen.style.width = '100%';
    titleScreen.style.height = '100%';
    titleScreen.style.backgroundColor = '#1a472a';
    titleScreen.style.backgroundImage = 'radial-gradient(circle at center, #2a573a 0%, #1a472a 100%)';
    titleScreen.style.display = 'flex';
    titleScreen.style.flexDirection = 'column';
    titleScreen.style.justifyContent = 'center';
    titleScreen.style.alignItems = 'center';
    titleScreen.style.zIndex = '4000';
    
    // Add title
    const titleText = document.createElement('h1');
    titleText.textContent = 'Card Game';
    titleText.style.color = 'white';
    titleText.style.fontSize = '48px';
    titleText.style.marginBottom = '30px';
    titleText.style.textShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
    titleText.style.animation = 'titlePulse 2s infinite';
    
    // Add animated cards
    const cardsContainer = document.createElement('div');
    cardsContainer.style.position = 'relative';
    cardsContainer.style.width = '300px';
    cardsContainer.style.height = '200px';
    cardsContainer.style.marginBottom = '50px';
    
    // Create 3 cards
    for (let i = 0; i < 3; i++) {
        const card = document.createElement('div');
        card.style.position = 'absolute';
        card.style.width = '120px';
        card.style.height = '168px';
        card.style.borderRadius = '10px';
        card.style.backgroundImage = `url('${IMAGE_PATHS.CARD_BACK}')`;
        card.style.backgroundSize = 'cover';
        card.style.backgroundPosition = 'center';
        card.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
        
        // Different positions and animations for each card
        if (i === 0) {
            card.style.left = '90px';
            card.style.top = '20px';
            card.style.zIndex = '3';
            card.style.animation = 'cardFloat1 3s infinite';
        } else if (i === 1) {
            card.style.left = '30px';
            card.style.top = '30px';
            card.style.zIndex = '1';
            card.style.animation = 'cardFloat2 3.5s infinite';
        } else {
            card.style.left = '150px';
            card.style.top = '30px';
            card.style.zIndex = '2';
            card.style.animation = 'cardFloat3 4s infinite';
        }
        
        cardsContainer.appendChild(card);
    }
    
    // Add start button
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.padding = '15px 40px';
    startButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    startButton.style.color = 'white';
    startButton.style.border = '2px solid white';
    startButton.style.borderRadius = '5px';
    startButton.style.fontSize = '20px';
    startButton.style.cursor = 'pointer';
    startButton.style.transition = 'all 0.3s';
    
    startButton.addEventListener('mouseenter', () => {
        startButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        startButton.style.transform = 'scale(1.05)';
    });
    
    startButton.addEventListener('mouseleave', () => {
        startButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        startButton.style.transform = 'scale(1)';
    });
    
    startButton.addEventListener('click', () => {
        // Add fade out animation
        titleScreen.style.transition = 'opacity 1s';
        titleScreen.style.opacity = '0';
        
        // Remove after animation completes
        setTimeout(() => {
            document.body.removeChild(titleScreen);
            initializeMainMenu();
        }, 1000);
    });
    
    // Add animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes titlePulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        @keyframes cardFloat1 {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
            100% { transform: translateY(0) rotate(0deg); }
        }
        
        @keyframes cardFloat2 {
            0% { transform: translateY(0) rotate(-5deg); }
            50% { transform: translateY(-15px) rotate(0deg); }
            100% { transform: translateY(0) rotate(-5deg); }
        }
        
        @keyframes cardFloat3 {
            0% { transform: translateY(0) rotate(5deg); }
            50% { transform: translateY(-12px) rotate(-3deg); }
            100% { transform: translateY(0) rotate(5deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Assemble title screen
    titleScreen.appendChild(titleText);
    titleScreen.appendChild(cardsContainer);
    titleScreen.appendChild(startButton);
    
    document.body.appendChild(titleScreen);
}

/**
 * Starts the game
 */
function startGame() { 
    console.log('Starting game from mainMenu...');
    console.log('Game container visibility:', document.getElementById('game-container').classList);
    
    // Initialize game
    initGame();
   
}