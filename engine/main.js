// main.js
// Main game logic and initialization

// Global variables
let score = 0;
let isPlaying = false;
let debugMode = false;
const activeKeys = {};

// Constants
const NOTE_RADIUS = 0.45;
const HIT_MARKER_RADIUS = 0.55;
const LANE_WIDTH = 1.1;
const LANE_SPACING = 0.2;
const TOTAL_WIDTH = (LANE_WIDTH + LANE_SPACING) * 5 - LANE_SPACING;
const HIT_POSITION = 10;
const NUM_FRETS = 7;
const FRET_COLOR = 0xC0C0C0;
const FRET_THICKNESS = 0.05;
const FRETBOARD_LENGTH = 45;
const SCROLL_SPEED = 0.2;

const noteColors = {
    'A': 0x00ff00, 'S': 0xff0000, 'J': 0xffff00, 'K': 0x0000ff, 'L': 0xffa500
};

const keyPositions = {
    'A': -TOTAL_WIDTH/2 + LANE_WIDTH/2,
    'S': -TOTAL_WIDTH/2 + LANE_WIDTH*1.5 + LANE_SPACING,
    'J': 0,
    'K': TOTAL_WIDTH/2 - LANE_WIDTH*1.5 - LANE_SPACING,
    'L': TOTAL_WIDTH/2 - LANE_WIDTH/2
};

// Initialize the game
function init() {
    initScene();
    createFretboard();
    createLanes();
    createHitMarkers();
    createFrets();
    setupEventListeners();
    animate();
}

// Main game loop
function animate() {
    requestAnimationFrame(animate);

    if (isPlaying) {
        updateNotes();
        updateFrets();
        spawnNewNotes();
        updateParticles();
        handleLongNotes();
    }

    renderer.render(scene, camera);
}

// Event listener setup
function setupEventListeners() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('resize', handleResize);

    document.getElementById('startBtn').addEventListener('click', () => isPlaying = true);
    document.getElementById('pauseBtn').addEventListener('click', () => isPlaying = false);
    document.getElementById('debugBtn').addEventListener('click', toggleDebugMode);
}

// Key event handlers
function handleKeyDown(event) {
    const key = event.key.toUpperCase();
    if (noteColors.hasOwnProperty(key)) {
        if (isPlaying) {
            const hitNote = findHitNote(key);
            if (hitNote) {
                handleNoteHit(hitNote, key);
            }
        }
        updateHitMarker(key, true);
    }
}

function handleKeyUp(event) {
    const key = event.key.toUpperCase();
    if (noteColors.hasOwnProperty(key)) {
        delete activeKeys[key];
        updateHitMarker(key, false);
        handleLongNoteRelease(key);
    }
}

// Utility functions
function lightenColor(hex, amount) {
    const color = new THREE.Color(hex);
    color.r = Math.min(color.r + amount, 1);
    color.g = Math.min(color.g + amount, 1);
    color.b = Math.min(color.b + amount, 1);
    return color.getHex();
}

// Initialize the game
init();