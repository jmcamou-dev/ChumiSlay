/**
 * Utilities - Helper functions for the game
 */

/**
 * Generates a unique ID
 * @returns {string} A unique identifier
 */
function generateUniqueId() {
    return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Gets a random color
 * @returns {string} A random color in hex format
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
 * Checks if the device is a mobile device
 * @returns {boolean} True if mobile device
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
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
 * Creates a confirmation dialog
 * @param {string} message - Message to display
 * @param {Function} onConfirm - Function to call on confirm
 * @param {Function} onCancel - Function to call on cancel
 */
function createConfirmDialog(message, onConfirm, onCancel) {
    const dialog = document.createElement('div');
    dialog.className = 'dialog-overlay';
    
    const dialogBox = document.createElement('div');
    dialogBox.className = 'dialog-box';
    dialogBox.style.textAlign = 'center';
    
    dialogBox.innerHTML = `
        <p>${message}</p>
        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">
            <button id="cancel-btn">Cancel</button>
            <button id="confirm-btn">Confirm</button>
        </div>
    `;
    
    dialog.appendChild(dialogBox);
    document.body.appendChild(dialog);
    
    document.getElementById('cancel-btn').addEventListener('click', () => {
        document.body.removeChild(dialog);
        if (onCancel) onCancel();
    });
    
    document.getElementById('confirm-btn').addEventListener('click', () => {
        document.body.removeChild(dialog);
        if (onConfirm) onConfirm();
    });
}

/**
 * Handles errors that occur during gameplay
 * @param {Error} error - The error that occurred
 * @param {string} context - Where the error occurred
 */
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    
    // Show error message
    showMessage(`Error: ${error.message}`, 'error');
}