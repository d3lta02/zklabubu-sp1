/**
 * zkLabubuio Game - A simple Labubu game with SP1 ZK Proof integration
 */

// Global variables
let wasmLoaded = false;
let gameManager = null;
let animationFrameId;
let lastTimestamp = 0;
let soundEnabled = true;
let proofPanelVisible = false;
let selectedTeam = null; // 'blue' or 'pink'

// DOM elements
const mainMenuScreen = document.getElementById('main-menu');
// Team selection screen removed - direct team selection from main menu
const howToPlayScreen = document.getElementById('how-to-play');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over');
const initialLoadingScreen = document.getElementById('initial-loading-screen');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Scoreboard elements
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const eggsElement = document.getElementById('game-stars');
const finalScoreElement = document.getElementById('final-score');
const finalStatsElement = document.getElementById('final-stats');

// Buttons
const globalSoundBtn = document.getElementById('global-sound-btn'); // May be null if DOM not ready
const pauseGameBtn = document.getElementById('pause-game-btn');
const pauseMenu = document.getElementById('pause-menu');
const resumeGameBtn = document.getElementById('resume-game-btn');
const restartPauseBtn = document.getElementById('restart-pause-btn');
const homePauseBtn = document.getElementById('home-pause-btn');
// Start game button removed - using team selection buttons
const howToPlayBtn = document.getElementById('how-to-play-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
// Back to menu from team button removed - team selection screen removed
const homeBtn = document.getElementById('home-btn');
const shareBtn = document.getElementById('share-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const proveBtn = document.getElementById('prove-btn');
// Team buttons removed - using direct buttons in main menu

// Images
let labubuImg = new Image();
let labubuBlueImg = new Image();  // Blue team character
let labubuPinkImg = new Image();  // Pink team character
let labubuShieldImg = new Image();
let labubuShieldPinkImg = new Image(); // Pink team shield
let labubuDoubleImg = new Image();
let labubuDoublePinkImg = new Image(); // Pink team double
let yellowEggImg = new Image();
let pinkEggImg = new Image();
let purpleEggImg = new Image();
let rockImg = new Image();
let shieldImg = new Image();
let doublePointsImg = new Image();
let extraLifeImg = new Image();
let slowdownImg = new Image();
let bgMainImg = new Image();
let bgGameImg = new Image();
let bgGameoverImg = new Image();

// Sounds
let backgroundMusic = new Audio();
let eggSound = new Audio();
let rockSound = new Audio();
let shieldHitSound = new Audio();
let buttonSound = new Audio();

/**
 * Updates loading progress bar
 * @param {number} percent - Progress percentage
 */
function updateLoadingProgress(percent) {
  const loadingBar = document.getElementById('loading-progress');
  if (loadingBar) {
    loadingBar.style.width = `${percent}%`;
  }
}

/**
 * Load WASM module
 * @returns {Promise<boolean>} Success status
 */
async function loadWasmModule() {
  updateLoadingProgress(20);
  
  try {
    // Load WASM module from the correct path
    console.log("Loading WASM module...");
    const wasm = await import('../pkg/zklabubuio_game.js');
    
    // Initialize WASM - this is crucial!
    await wasm.default();
    
    window.wasm = wasm;
    console.log("WASM loaded and initialized successfully!");
    wasmLoaded = true;
    updateLoadingProgress(60);
    return true;
  } catch (error) {
    console.error("Error loading WASM module:", error);
    updateLoadingProgress(40);
    return false;
  }
}

/**
 * Toggle pause menu visibility
 * @param {boolean} show - Whether to show or hide
 */
function togglePauseMenu(show) {
  if (show) {
    pauseMenu.classList.remove('hidden');
    if (gameManager) {
      gameManager.stop();
    }
  } else {
    pauseMenu.classList.add('hidden');
    if (gameManager) {
      gameManager.start();
    }
  }
}

/**
 * Check if all required images are loaded
 * @returns {boolean} Whether all images are loaded
 */
function areImagesLoaded() {
  const images = [
    labubuImg, labubuShieldImg, labubuDoubleImg, 
    yellowEggImg, pinkEggImg, purpleEggImg, 
    rockImg, shieldImg, doublePointsImg, extraLifeImg, slowdownImg,
    bgMainImg, bgGameImg, bgGameoverImg
  ];
  
  return images.every(img => img && img.complete);
}

/**
 * Set up canvas dimensions
 */
function setupCanvas() {
  const container = document.querySelector('.container');
  const gameInfo = document.querySelector('.game-info');
  
  // Calculate canvas height (subtract game info area)
  const gameInfoHeight = gameInfo.offsetHeight;
  const canvasHeight = container.offsetHeight - gameInfoHeight - 20; // extra space for padding
  
  canvas.width = container.offsetWidth - 40; // space for padding
  canvas.height = canvasHeight;
  
  // Set background image
  if (bgGameImg && bgGameImg.complete) {
    document.getElementById('game-screen').style.backgroundImage = `url(${bgGameImg.src})`;
  }
}

/**
 * Show selected screen, hide others
 * @param {HTMLElement} screen - Screen element to show
 */
function showScreen(screen) {
  console.log(`Showing screen: ${screen.id}`);
  
  if (!screen) {
    console.error("Invalid screen parameter!");
    return;
  }
  
  try {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = 'none';
    });
    
    // Show selected screen
    screen.classList.add('active');
    screen.style.display = 'flex';
    
    // Play sound if enabled and loaded
    if (buttonSound && buttonSound.readyState >= 2 && soundEnabled) {
      try {
        buttonSound.currentTime = 0;
        buttonSound.play().catch(error => console.log("Could not play sound:", error));
      } catch (e) {
        console.warn("Error playing sound:", e);
      }
    }
    
    // Set background for each screen
    if (screen.id === 'main-menu' || screen.id === 'how-to-play') {
      if (bgMainImg && bgMainImg.complete) {
        screen.style.backgroundImage = `url(${bgMainImg.src})`;
      }
    }
    else if (screen.id === 'game-screen') {
      if (bgGameImg && bgGameImg.complete) {
        screen.style.backgroundImage = `url(${bgGameImg.src})`;
      }
    }
    else if (screen.id === 'game-over') {
      if (bgGameoverImg && bgGameoverImg.complete) {
        screen.style.backgroundImage = `url(${bgGameoverImg.src})`;
      }
      screen.style.zIndex = 100;
    }
  } catch (error) {
    console.error("Error showing screen:", error);
  }
}

/**
 * Navigate to main menu
 */
function showMainMenu() {
  showScreen(mainMenuScreen);
}

/**
 * Toggle sound on/off
 */
function toggleSound() {
  soundEnabled = !soundEnabled;
  
  // Safely update button text
  const soundBtn = document.getElementById('global-sound-btn');
  if (soundBtn) {
    if (soundEnabled) {
      soundBtn.textContent = '🔊';
      backgroundMusic.play().catch(error => {
        console.log("Could not play background music:", error);
      });
      console.log("Sounds enabled");
    } else {
      soundBtn.textContent = '🔇';
      backgroundMusic.pause();
      console.log("Sounds disabled");
    }
  } else {
    console.warn("Global sound button not found in DOM");
  }
  
  // Play button sound
  if (soundEnabled && buttonSound) {
    buttonSound.currentTime = 0;
    buttonSound.play().catch(error => {
      console.log("Could not play button sound:", error);
    });
  }
  
  // Notify GameManager
  if (gameManager && typeof gameManager.set_sound_enabled === 'function') {
    gameManager.set_sound_enabled(soundEnabled);
  }
}

/**
 * Start the game
 */
function startGame() {
  // Check if WASM is loaded
  if (!wasmLoaded || !window.wasm) {
    console.error("WASM module not loaded yet!");
    alert("Game module not loaded yet, please wait a moment and try again.");
    return;
  }

  // Check if team is selected
  if (!selectedTeam) {
    console.error("No team selected!");
    alert("Please select a team first.");
    return;
  }

  // Hide pause menu
  togglePauseMenu(false);
  
  // Show game screen
  showScreen(gameScreen);
  setupCanvas();
  
  // Clear animation loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // Reset timestamp
  lastTimestamp = 0;
  
  try {
    if (gameManager) {
      gameManager.restart();
    } else {
      console.log("Creating GameManager with team:", selectedTeam);
      console.log("Available WASM exports:", Object.keys(window.wasm));
      
      // Create GameManager using correct WASM export
      gameManager = new window.wasm.GameManager(
        canvas,
        labubuImg,
        labubuShieldImg,
        labubuDoubleImg,
        yellowEggImg,
        pinkEggImg,
        purpleEggImg,
        rockImg,
        shieldImg,
        doublePointsImg,
        extraLifeImg,
        slowdownImg,
        eggSound,
        rockSound,
        shieldHitSound
      );
    }
    
    gameManager.start();
    
    // Start music
    if (soundEnabled) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.play().catch(error => {
        console.log("Could not play background music:", error);
      });
    }
    
    // Start game loop
    animationFrameId = requestAnimationFrame(gameLoop);
  } catch (error) {
    console.error("Error starting game:", error);
    console.error("Error details:", error.stack);
    alert("An error occurred while starting the game: " + error.message);
  }
}

/**
 * Handle team selection
 */
function selectTeam(team) {
  console.log("Team selected:", team);
  selectedTeam = team;
  
  // Stop any existing game first
  if (gameManager) {
    try {
      gameManager.stop();
    } catch (error) {
      console.warn("Error stopping game manager:", error);
    }
    gameManager = null;
  }
  
  // Stop animation loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // Set character images based on team - use already loaded images
  if (team === 'blue') {
    // Use blue character images
    labubuImg = labubuBlueImg;
    labubuShieldImg = new Image();
    labubuDoubleImg = new Image();
    labubuShieldImg.src = document.getElementById('labubu-blue-shield-img').src;
    labubuDoubleImg.src = document.getElementById('labubu-blue-double-img').src;
    
    console.log("Blue team images set successfully");
  } else if (team === 'pink') {
    // Use pink character images  
    labubuImg = labubuPinkImg;
    labubuShieldImg = new Image();
    labubuDoubleImg = new Image();
    labubuShieldImg.src = document.getElementById('labubu-pink-shield-img').src;
    labubuDoubleImg.src = document.getElementById('labubu-pink-double-img').src;
    
    console.log("Pink team images set successfully");
  }
  
  // Show team selection feedback
  const teamName = team === 'blue' ? 'Blue zkLabubu' : 'Pink zkLabubu';
  console.log(`${teamName} selected! Starting game...`);
  
  // Start game immediately
  startGame();
}

/**
 * Stop the game
 */
function stopGame() {
  // Stop animation loop first
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // Stop background music
  backgroundMusic.pause();
  
  // Stop game manager safely
  if (gameManager) {
    try {
      gameManager.stop();
    } catch (error) {
      console.warn("Error stopping game manager:", error);
      // Don't throw error, just log it
    }
  }
}

/**
 * Game loop function
 * @param {number} timestamp - Current time
 */
function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  
  const deltaTime = (timestamp - lastTimestamp) / 1000; // in seconds
  lastTimestamp = timestamp;
  
  // If pause menu is open, just refresh the animation frame
  if (!pauseMenu.classList.contains('hidden')) {
    animationFrameId = requestAnimationFrame(gameLoop);
    return;
  }
  
  // Update game state
  if (gameManager) {
    try {
      const gameOver = gameManager.update(deltaTime);
      
      // Update score and lives
      const score = gameManager.get_score();
      const lives = gameManager.get_lives();
      let visualScore = score;
  
      // Use visual_score method if available
      try {
        if (typeof gameManager.get_visual_score === 'function') {
          visualScore = gameManager.get_visual_score();
        }
      } catch (e) {
        console.warn("Could not get visual score:", e);
      }
  
      // Get egg counts
      const yellowEggs = gameManager.get_yellow_eggs_count();
      const blueEggs = gameManager.get_blue_eggs_count();
      const purpleEggs = gameManager.get_purple_eggs_count();
      
      // Update UI
      scoreElement.textContent = `Score: ${visualScore}`;
      livesElement.textContent = `Lives: ${lives}`;
      eggsElement.textContent = `Eggs: 🟡${yellowEggs} 🔵${blueEggs} 🟣${purpleEggs}`;
      
      // Check if game is over
      if (gameOver || gameManager.is_game_over() || gameManager.get_game_state() === 3) {
        console.log("Game over detected!");
        endGame();
        return;
      }
    } catch (error) {
      console.error("Error in game loop:", error);
      stopGame();
      alert("An error occurred during the game: " + error.message);
      return;
    }
  }
  
  // Schedule next frame
  animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * End the game and show game over screen
 */
function endGame() {
  console.log("Game ended");
  
  // Stop animation loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // Stop background music
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
  
  // Play sound effect
  if (soundEnabled && rockSound) {
    try {
      rockSound.currentTime = 0;
      rockSound.play().catch(error => console.warn("Could not play sound:", error));
    } catch (e) {
      console.warn("Error playing sound:", e);
    }
  }
  
  // Update UI with game results
  if (gameManager) {
    try {
      // Get game results BEFORE stopping
      const score = gameManager.get_score();
      const yellowEggs = gameManager.get_yellow_eggs_count();
      const blueEggs = gameManager.get_blue_eggs_count();
      const purpleEggs = gameManager.get_purple_eggs_count();
      
      // Now safely stop the game manager
      try {
        gameManager.stop();
      } catch (stopError) {
        console.warn("Error stopping game manager:", stopError);
      }
      
      // Hide all screens
      document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
      });
      
      // Update results screen
      finalScoreElement.textContent = `Your Score: ${score}`;
      finalStatsElement.textContent = `Eggs Collected: 🟡${yellowEggs} 🔵${blueEggs} 🟣${purpleEggs}`;
      
      // Set background
      gameOverScreen.style.backgroundImage = `url(${bgGameoverImg.src})`;
      
      // Show game over screen
      gameOverScreen.style.display = 'flex';
      gameOverScreen.style.zIndex = '100';
    } catch (error) {
      console.error("Error ending game:", error);
      alert("An error occurred while ending the game: " + error.message);
    }
  }
}

/**
 * Go to main menu
 */
function goToMainMenu() {
  // Stop animation loop first
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // Stop background music
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
  
  // Reset selected team
  selectedTeam = null;
  
  // Hide proof panel
  window.hideProofPanel();
  
  // Reset game manager safely
  if (gameManager) {
    try {
      gameManager.stop();
    } catch (error) {
      console.warn("Error stopping game manager:", error);
    }
  }
  
  console.log("Returning to main menu...");
  showScreen(mainMenuScreen);
}

/**
 * Restart the game
 */
function restartGame() {
  // Stop current game
  stopGame();
  
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.style.display = 'none';
  });
  
  // Show selected team's game
  if (selectedTeam) {
    try {
      startGame();
    } catch (error) {
      console.error("Error restarting game:", error);
      alert("An error occurred while restarting the game: " + error.message);
    }
  } else {
    // No team selected, go to main menu
    goToMainMenu();
  }
}

/**
 * Share score on Twitter
 */
function shareOnTwitter() {
  if (!gameManager) return;
  
  try {
    const score = gameManager.get_score();
    const yellowEggs = gameManager.get_yellow_eggs_count();
    const blueEggs = gameManager.get_blue_eggs_count();
    const purpleEggs = gameManager.get_purple_eggs_count();
    
    const text = `I scored ${score} points in zkLabubu Game! Collected 🟡${yellowEggs} 🔵${blueEggs} 🟣${purpleEggs} eggs! Play at zklabubu.vercel.app @SuccinctLabs`;
    const url = window.location.href;
    
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  } catch (error) {
    console.error("Error sharing:", error);
    alert("An error occurred while sharing: " + error.message);
  }
}

/**
 * Load all game resources
 */
async function loadAllResources() {
  console.log("Loading game resources...");
  
  try {
    // Update loading progress
    updateLoadingProgress(10);
    
    // Load background images
    bgMainImg.src = 'assets/images/bg_main.png';
    bgGameImg.src = 'assets/images/bg_game.png';
    bgGameoverImg.src = 'assets/images/bg_gameover.png';
    
    // Load default labubu image (will be replaced by team selection)
    labubuImg.src = 'assets/images/labubu_blue.png';
    
    // Load team-specific labubu images (fallback to default if not available)
    labubuBlueImg.src = 'assets/images/labubu_blue.png';
    labubuPinkImg.src = 'assets/images/labubu_pink.png';
    
    // Load labubu state images
    labubuShieldImg.src = 'assets/images/labubu_blue_shield.png';
    labubuDoubleImg.src = 'assets/images/labubu_blue_double.png';
    
    // Load pink team specific images
    labubuShieldPinkImg.src = 'assets/images/labubu_pink_shield.png';
    labubuDoublePinkImg.src = 'assets/images/labubu_pink_double.png';
    
    // Load egg images
    yellowEggImg.src = 'assets/images/yellow_egg.png';
    pinkEggImg.src = 'assets/images/blue_egg.png';  // Using blue egg instead of pink
    purpleEggImg.src = 'assets/images/purple_egg.png';
    
    // Load other game images
    rockImg.src = 'assets/images/rock.png';
    shieldImg.src = 'assets/images/shield.png';
    doublePointsImg.src = 'assets/images/double_points.png';
    extraLifeImg.src = 'assets/images/extra_life.png';
    slowdownImg.src = 'assets/images/slowdown.png';
    
    // Load sounds
    backgroundMusic.src = 'assets/sounds/bgmusic.mp3';
    eggSound.src = 'assets/sounds/star.mp3';  // Keep star.mp3 for egg collection sound
    rockSound.src = 'assets/sounds/rock.mp3';
    shieldHitSound.src = 'assets/sounds/shield_hit.mp3';
    buttonSound.src = 'assets/sounds/button.mp3';
    
    // Set music properties
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
    
    // Set sound properties
    eggSound.volume = 0.7;
    rockSound.volume = 0.8;
    shieldHitSound.volume = 0.6;
    buttonSound.volume = 0.5;
    
    // Wait for images to load
    await new Promise((resolve) => {
      let loadedCount = 0;
      const totalImages = 17; // Total number of images
      
      const checkLoaded = () => {
        loadedCount++;
        updateLoadingProgress(20 + (loadedCount / totalImages) * 30); // 20-50%
        if (loadedCount >= totalImages) {
          resolve();
        }
      };
      
      // Add load event listeners
      bgMainImg.onload = checkLoaded;
      bgGameImg.onload = checkLoaded;
      bgGameoverImg.onload = checkLoaded;
      labubuImg.onload = checkLoaded;
      labubuBlueImg.onload = checkLoaded;
      labubuPinkImg.onload = checkLoaded;
      labubuShieldImg.onload = checkLoaded;
      labubuDoubleImg.onload = checkLoaded;
      labubuShieldPinkImg.onload = checkLoaded;
      labubuDoublePinkImg.onload = checkLoaded;
      yellowEggImg.onload = checkLoaded;
      pinkEggImg.onload = checkLoaded;
      purpleEggImg.onload = checkLoaded;
      rockImg.onload = checkLoaded;
      shieldImg.onload = checkLoaded;
      doublePointsImg.onload = checkLoaded;
      extraLifeImg.onload = checkLoaded;
      slowdownImg.onload = checkLoaded;
      
      // Handle load errors - use fallback
      const handleError = (imgName, fallbackImg) => {
        console.warn(`Failed to load ${imgName}, using fallback`);
        // Set fallback to default labubu if it's a character image
        if (imgName.includes('labubu_blue') || imgName.includes('labubu_pink')) {
          if (imgName.includes('labubu_blue')) labubuBlueImg.src = labubuImg.src;
          if (imgName.includes('labubu_pink')) labubuPinkImg.src = labubuImg.src;
        }
        checkLoaded();
      };
      
      bgMainImg.onerror = () => handleError('bg_main.png');
      bgGameImg.onerror = () => handleError('bg_game.png');
      bgGameoverImg.onerror = () => handleError('bg_gameover.png');
      labubuImg.onerror = () => handleError('labubu_blue.png');
      labubuBlueImg.onerror = () => handleError('labubu_blue.png');
      labubuPinkImg.onerror = () => handleError('labubu_pink.png');
      labubuShieldImg.onerror = () => handleError('labubu_blue_shield.png');
      labubuDoubleImg.onerror = () => handleError('labubu_blue_double.png');
      labubuShieldPinkImg.onerror = () => handleError('labubu_pink_shield.png');
      labubuDoublePinkImg.onerror = () => handleError('labubu_pink_double.png');
      yellowEggImg.onerror = () => handleError('yellow_egg.png');
      pinkEggImg.onerror = () => handleError('blue_egg.png');
      purpleEggImg.onerror = () => handleError('purple_egg.png');
      rockImg.onerror = () => handleError('rock.png');
      shieldImg.onerror = () => handleError('shield.png');
      doublePointsImg.onerror = () => handleError('double_points.png');
      extraLifeImg.onerror = () => handleError('extra_life.png');
      slowdownImg.onerror = () => handleError('slowdown.png');
    });
    
    updateLoadingProgress(50);
    console.log("All resources loaded successfully");
    
    // Load WASM module
    const wasmSuccess = await loadWasmModule();
    
    if (!wasmSuccess) {
      // WASM loading failed
      console.error("WASM not available or failed to load!");
      updateLoadingProgress(60);
      
      // Show error message
      const loadingText = document.querySelector('#initial-loading-screen h1');
      if (loadingText) {
        loadingText.textContent = "Error Loading Game!";
        loadingText.style.color = "#ff3333";
      }
      
      // Add reload button
      const loadingContainer = document.querySelector('.loading-container');
      if (loadingContainer) {
        const reloadButton = document.createElement('button');
        reloadButton.textContent = "Reload Game";
        reloadButton.className = "game-button";
        reloadButton.style.marginTop = "20px";
        reloadButton.onclick = () => window.location.reload();
        loadingContainer.appendChild(reloadButton);
      }
      
      return false;
    }
    
    updateLoadingProgress(100);
    console.log("All resources and WASM loaded successfully");
    
    // Show main menu
    setTimeout(() => {
      showMainMenu();
    }, 500);
    
    return true;
    
  } catch (error) {
    console.error("Error loading resources:", error);
    throw error;
  }
}

// SP1 Proof Panel functions
window.createProofPanel = function() {
  console.log("Creating proof panel...");
  
  // Clear old panel if exists
  const oldPanel = document.getElementById('proof-panel');
  if (oldPanel) oldPanel.remove();
  
  // Create new panel
  const panel = document.createElement('div');
  panel.id = 'proof-panel';
  panel.style.position = 'fixed';
  panel.style.top = '50%';
  panel.style.left = '50%';
  panel.style.transform = 'translate(-50%, -50%)';
  panel.style.width = '85%';
  panel.style.maxWidth = '900px';
  panel.style.height = '500px';
  panel.style.backgroundColor = 'rgba(12, 36, 97, 0.95)';
  panel.style.color = '#ffffff';
  panel.style.padding = '25px';
  panel.style.borderRadius = '15px';
  panel.style.boxShadow = '0 0 30px rgba(254, 34, 190, 0.3)';
  panel.style.border = '2px solid #fe22be';
  panel.style.zIndex = '1000';
  panel.style.display = 'flex';
  panel.style.flexDirection = 'column';
  
  // Panel header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.paddingBottom = '15px';
  header.style.borderBottom = '2px solid #fe22be';
  header.style.marginBottom = '15px';
  
  const title = document.createElement('div');
  title.textContent = '🔐 SP1 Zero-Knowledge Proof Terminal';
  title.style.fontWeight = 'bold';
  title.style.fontSize = '20px';
  title.style.color = '#fe22be';
  title.style.textShadow = '0 0 10px rgba(254, 34, 190, 0.5)';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✖';
  closeBtn.style.background = 'rgba(254, 34, 190, 0.2)';
  closeBtn.style.border = '1px solid #fe22be';
  closeBtn.style.color = '#ffffff';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '18px';
  closeBtn.style.borderRadius = '5px';
  closeBtn.style.padding = '5px 10px';
  closeBtn.style.transition = 'all 0.2s';
  closeBtn.onmouseover = () => closeBtn.style.backgroundColor = '#fe22be';
  closeBtn.onmouseout = () => closeBtn.style.backgroundColor = 'rgba(254, 34, 190, 0.2)';
  closeBtn.onclick = window.hideProofPanel;
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Log area
  const logArea = document.createElement('div');
  logArea.id = 'proof-log';
  logArea.style.flexGrow = '1';
  logArea.style.overflowY = 'auto';
  logArea.style.whiteSpace = 'pre-wrap';
  logArea.style.fontSize = '14px';
  logArea.style.lineHeight = '1.6';
  logArea.style.padding = '15px';
  logArea.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
  logArea.style.borderRadius = '10px';
  logArea.style.border = '1px solid rgba(254, 34, 190, 0.3)';
  logArea.style.fontFamily = 'monospace';
  
  // Add success result area
  const resultArea = document.createElement('div');
  resultArea.id = 'proof-result';
  resultArea.style.marginTop = '15px';
  resultArea.style.padding = '15px';
  resultArea.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
  resultArea.style.borderRadius = '10px';
  resultArea.style.border = '2px solid #00ff00';
  resultArea.style.display = 'none';
  
  // Add share button
  const shareButton = document.createElement('button');
  shareButton.id = 'share-proof-btn';
  shareButton.textContent = '🔗 GitHub';
  shareButton.style.marginTop = '15px';
  shareButton.style.padding = '12px 25px';
  shareButton.style.backgroundColor = '#fe22be';
  shareButton.style.color = '#ffffff';
  shareButton.style.border = 'none';
  shareButton.style.borderRadius = '25px';
  shareButton.style.fontSize = '16px';
  shareButton.style.fontWeight = 'bold';
  shareButton.style.cursor = 'pointer';
  shareButton.style.transition = 'all 0.2s';
  shareButton.style.display = 'none';
  shareButton.onmouseover = () => shareButton.style.backgroundColor = '#d41a9e';
  shareButton.onmouseout = () => shareButton.style.backgroundColor = '#fe22be';
  shareButton.onclick = () => {
    window.open('https://github.com/d3lta02/zklabubu-sp1', '_blank');
  };
  
  // Assemble panel
  panel.appendChild(header);
  panel.appendChild(logArea);
  panel.appendChild(resultArea);
  panel.appendChild(shareButton);
  
  // Add panel to page
  document.body.appendChild(panel);
  
  console.log("Proof panel created!");
  return panel;
};

window.logToProofPanel = function(message) {
  console.log("Log message:", message);
  const logArea = document.getElementById('proof-log');
  if (!logArea) {
      console.error("proof-log element not found!");
      return;
  }
  
  // Add timestamp
  const date = new Date();
  const timestamp = `[${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}] `;
  
  // Create new line
  const line = document.createElement('div');
  line.textContent = timestamp + message;
  
  // Add line to log area
  logArea.appendChild(line);
  
  // Auto-scroll
  logArea.scrollTop = logArea.scrollHeight;
};

window.showProofPanel = function() {
  console.log("showProofPanel called");
  
  // GameManager check
  if (typeof gameManager === "undefined" || gameManager === null) {
      console.error("gameManager not defined!");
      alert("Game not started or GameManager not found!");
      return;
  }
  
  try {
      // Create proof panel
      window.createProofPanel();
      
      // Collect game data
      const score = gameManager.get_score();
              const yellowEggs = gameManager.get_yellow_eggs_count();
        const blueEggs = gameManager.get_blue_eggs_count();
        const purpleEggs = gameManager.get_purple_eggs_count();
      const gameTime = gameManager.get_game_time();
      const lives = gameManager.get_lives();
      
      // Show game data
      console.log("Game Data:", {
          score, yellowEggs, blueEggs, purpleEggs, gameTime, lives
      });
      
      // Show log in proof panel
      window.logToProofPanel("Starting SP1 Zero-Knowledge Proof system...");
      window.logToProofPanel(`Game Data: Score=${score}, Yellow=${yellowEggs}, Blue=${blueEggs}, Purple=${purpleEggs}, Time=${gameTime}s, Lives=${lives}`);
      
      // Send request to backend
      const gameData = {
          score,
          yellowEggs,
          blueEggs,
          purpleEggs,
          gameTime,
          lives
      };
      
      // Call SP1 Bridge
      window.generateSP1Proof(gameData)
          .then(result => {
              console.log("Proof generation successful:", result);
          })
          .catch(error => {
              console.error("Proof generation error:", error);
              window.logToProofPanel("Proof generation error: " + error.message);
          });
  } catch (error) {
      console.error("Error showing proof panel:", error);
      alert("An error occurred while showing proof panel: " + error.message);
  }
};

// Define hideProofPanel as global function
window.hideProofPanel = function() {
  const panel = document.getElementById('proof-panel');
  if (panel) panel.remove();
  proofPanelVisible = false;
  console.log("Proof panel hidden");
};

// Event listeners
document.getElementById('play-blue-btn').addEventListener('click', () => {
  if (buttonSound) {
    buttonSound.play().catch(e => console.warn("Could not play button sound:", e));
  }
  selectTeam('blue');
});

document.getElementById('play-pink-btn').addEventListener('click', () => {
  if (buttonSound) {
    buttonSound.play().catch(e => console.warn("Could not play button sound:", e));
  }
  selectTeam('pink');
});

howToPlayBtn.addEventListener('click', () => showScreen(howToPlayScreen));
backToMenuBtn.addEventListener('click', () => showScreen(mainMenuScreen));
homeBtn.addEventListener('click', goToMainMenu);
shareBtn.addEventListener('click', shareOnTwitter);
playAgainBtn.addEventListener('click', restartGame);
// Safe event listener for global sound button
if (globalSoundBtn) {
  globalSoundBtn.addEventListener('click', toggleSound);
} else {
  // Add event listener after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const soundBtn = document.getElementById('global-sound-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', toggleSound);
    }
  });
}
pauseGameBtn.addEventListener('click', () => {
  if (soundEnabled && buttonSound) buttonSound.play().catch(e => {});
  togglePauseMenu(true);
});
resumeGameBtn.addEventListener('click', () => {
  if (soundEnabled && buttonSound) buttonSound.play().catch(e => {});
  togglePauseMenu(false);
  
  if (!animationFrameId) {
    lastTimestamp = 0;
    animationFrameId = requestAnimationFrame(gameLoop);
  }
});
restartPauseBtn.addEventListener('click', () => {
  if (soundEnabled && buttonSound) buttonSound.play().catch(e => {});
  togglePauseMenu(false);
  restartGame();
});
homePauseBtn.addEventListener('click', () => {
  if (soundEnabled && buttonSound) buttonSound.play().catch(e => {});
  togglePauseMenu(false);
  goToMainMenu();
});
proveBtn.addEventListener('click', function() {
  console.log("Prove button clicked");
  
  if (typeof window.showProofPanel === 'function') {
    window.showProofPanel();
  } else {
    console.error("showProofPanel function not found!");
    alert("Proof panel function could not be loaded. Please refresh the page.");
  }
});

// Team selection now handled by direct buttons in main menu

// Handle window resize
window.addEventListener('resize', () => {
  if (gameScreen.classList.contains('active')) {
    setupCanvas();
  }
});

// Handle keyboard events
window.addEventListener('keydown', (event) => {
  if (gameScreen.classList.contains('active') && gameManager) {
    try {
      // ESC key toggles pause menu
      if (event.key === "Escape") {
        togglePauseMenu(!pauseMenu.classList.contains('hidden'));
        return;
      }
      
      // If pause menu is open, don't process keyboard inputs
      if (!pauseMenu.classList.contains('hidden')) {
        return;
      }
      
      gameManager.handle_key_press(event);
    } catch (error) {
      console.error("Error handling keyboard event:", error);
    }
  }
});

// Game initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing game...");
  
  // Show loading screen
  if (initialLoadingScreen) {
    initialLoadingScreen.style.display = 'flex';
    initialLoadingScreen.classList.add('active');
  }
  
  // Load resources after a short delay
  setTimeout(() => {
    loadAllResources();
  }, 1000);
});

// Notify that SP1 Proof panel functions are defined
console.log("SP1 Proof panel functions defined");