// scene.js
// Scene setup and rendering

let scene, camera, renderer;
let scrollingGroup;
const lanes = {};
const debugLines = {};
const hitMarkers = {};

// Init Three.js scene
function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    setupLighting();
    setupCamera();

    scrollingGroup = new THREE.Group();
    scene.add(scrollingGroup);
}

// Set up scene lighting
function setupLighting() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
}

// Set up camera position
function setupCamera() {
    camera.position.set(0, 7, 15);
    camera.lookAt(0, 0, 0);
}

// Create the fretboard
function createFretboard() {
    const fretboard = new THREE.Mesh(
        new THREE.BoxGeometry(TOTAL_WIDTH + 0.5, 0.5, FRETBOARD_LENGTH),
        new THREE.MeshPhongMaterial({ color: 0x4a4a4a })
    );
    scrollingGroup.add(fretboard);
}

// Create lanes for each key
function createLanes() {
    Object.keys(keyPositions).forEach(key => {
        const laneGeometry = new THREE.PlaneGeometry(LANE_WIDTH, FRETBOARD_LENGTH);
        const laneMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a, 
            opacity: 0.3, 
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const lane = new THREE.Mesh(laneGeometry, laneMaterial);
        lane.rotation.x = -Math.PI / 2;
        lane.position.set(keyPositions[key], 0.26, 0);
        scrollingGroup.add(lane);
        lanes[key] = lane;

        createCenterLine(key);
        createDebugLine(key);
    });
}

// Create center line for each lane
function createCenterLine(key) {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
    const points = [
        new THREE.Vector3(keyPositions[key], 0.27, -FRETBOARD_LENGTH/2),
        new THREE.Vector3(keyPositions[key], 0.27, HIT_POSITION)
    ];
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const centerLine = new THREE.Line(lineGeometry, lineMaterial);
    scrollingGroup.add(centerLine);
}

// Create hit markers for each key
function createHitMarkers() {
    Object.keys(keyPositions).forEach(key => {
        const hitMarkerGroup = new THREE.Group();
        
        const outerRing = new THREE.Mesh(
            new THREE.TorusGeometry(HIT_MARKER_RADIUS - 0.05, 0.05, 16, 100),
            new THREE.MeshPhongMaterial({ color: noteColors[key], shininess: 100 })
        );
        outerRing.rotation.x = Math.PI / 2;
        hitMarkerGroup.add(outerRing);
        
        const middleRing = new THREE.Mesh(
            new THREE.TorusGeometry(HIT_MARKER_RADIUS - 0.15, 0.05, 16, 100),
            new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 100 })
        );
        middleRing.rotation.x = Math.PI / 2;
        hitMarkerGroup.add(middleRing);
        
        const innerFill = new THREE.Mesh(
            new THREE.CylinderGeometry(HIT_MARKER_RADIUS - 0.2, HIT_MARKER_RADIUS - 0.2, 0.05, 32),
            new THREE.MeshPhongMaterial({ color: 0x363636, shininess: 100 })
        );
        hitMarkerGroup.add(innerFill);

        hitMarkerGroup.position.set(keyPositions[key], 0.27, HIT_POSITION);
        scene.add(hitMarkerGroup);
        hitMarkers[key] = hitMarkerGroup;
    });
}

// Create frets on the fretboard
function createFrets() {
    const fretMaterial = new THREE.MeshPhongMaterial({ color: FRET_COLOR, shininess: 100 });

    for (let i = 0; i < NUM_FRETS; i++) {
        const fretGeometry = new THREE.BoxGeometry(TOTAL_WIDTH + 0.5, FRET_THICKNESS, FRET_THICKNESS);
        const fret = new THREE.Mesh(fretGeometry, fretMaterial);
        
        const zPosition = -FRETBOARD_LENGTH/2 + (FRETBOARD_LENGTH / (NUM_FRETS - 1)) * i;
        fret.position.set(0, 0.26, zPosition);
        
        fret.isFret = true;
        scrollingGroup.add(fret);
    }
}

// Create debug lines for each lane
function createDebugLine(key) {
    const debugLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const debugPoints = [
        new THREE.Vector3(keyPositions[key] - LANE_WIDTH/2, 0.27, -FRETBOARD_LENGTH/2),
        new THREE.Vector3(keyPositions[key] - LANE_WIDTH/2, 0.27, FRETBOARD_LENGTH/2),
        new THREE.Vector3(keyPositions[key] + LANE_WIDTH/2, 0.27, FRETBOARD_LENGTH/2),
        new THREE.Vector3(keyPositions[key] + LANE_WIDTH/2, 0.27, -FRETBOARD_LENGTH/2),
        new THREE.Vector3(keyPositions[key] - LANE_WIDTH/2, 0.27, -FRETBOARD_LENGTH/2)
    ];
    const debugLineGeometry = new THREE.BufferGeometry().setFromPoints(debugPoints);
    const debugLine = new THREE.Line(debugLineGeometry, debugLineMaterial);
    debugLine.visible = false;
    scene.add(debugLine);
    debugLines[key] = debugLine;
}

// Handle window resize
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Toggle debug mode
function toggleDebugMode() {
    debugMode = !debugMode;
    Object.values(debugLines).forEach(line => line.visible = debugMode);
}

// Update hit marker appearance
function updateHitMarker(key, isPressed) {
    hitMarkers[key].children[2].material.color.setHex(isPressed ? noteColors[key] : 0x363636);
}