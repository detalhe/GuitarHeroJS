// notes.js
// Note creation and management

const notes = [];

// Create a new note
function createNote(key, isLongNote = false) {
    const noteGroup = new THREE.Group();
    
    const coloredBorder = new THREE.Mesh(
        new THREE.TorusGeometry(NOTE_RADIUS - 0.05, 0.1, 16, 100),
        new THREE.MeshPhongMaterial({ color: noteColors[key], shininess: 100 })
    );
    coloredBorder.rotation.x = Math.PI / 2;
    noteGroup.add(coloredBorder);
    
    const blackBorder = new THREE.Mesh(
        new THREE.TorusGeometry(NOTE_RADIUS - 0.18, 0.03, 16, 100),
        new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 100 })
    );
    blackBorder.rotation.x = Math.PI / 2;
    noteGroup.add(blackBorder);
    
    const whiteFill = new THREE.Mesh(
        new THREE.CylinderGeometry(NOTE_RADIUS - 0.21, NOTE_RADIUS - 0.21, 0.05, 32),
        new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 100 })
    );
    noteGroup.add(whiteFill);

    noteGroup.position.set(keyPositions[key], 0.28, -FRETBOARD_LENGTH/2);
    noteGroup.key = key;
    noteGroup.isLongNote = isLongNote;
    noteGroup.isMissed = false;

    if (isLongNote) {
        createLongNoteLine(noteGroup, key);
    }

    scene.add(noteGroup);
    notes.push(noteGroup);
}

// Create a line for long notes
function createLongNoteLine(noteGroup, key) {
    const longNoteLength = Math.random() * 5 + 5;
    
    const lineGeometry = new THREE.BufferGeometry();
    const lineWidth = 0.2;
    const vertices = new Float32Array([
        -lineWidth/2, 0, -0.3,
        lineWidth/2, 0, -0.3,
        lineWidth/2, 0, -longNoteLength - 0.3,
        -lineWidth/2, 0, -longNoteLength - 0.3
    ]);
    const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    lineGeometry.setIndex(new THREE.BufferAttribute(indices, 1));
    
    const longNoteLine = new THREE.Mesh(
        lineGeometry,
        new THREE.MeshBasicMaterial({ color: noteColors[key], side: THREE.DoubleSide })
    );
    
    noteGroup.add(longNoteLine);
    noteGroup.longNoteLine = longNoteLine;
    noteGroup.longNoteLength = longNoteLength;
}

// Update notes positions and states
function updateNotes() {
    notes.forEach((note, index) => {
        note.position.z += SCROLL_SPEED;

        if (note.isLongNote) {
            handleLongNoteUpdate(note, index);
        } else {
            handleShortNoteUpdate(note, index);
        }
    });
}

// Handle long note updates
function handleLongNoteUpdate(note, index) {
    if (note.position.z - note.longNoteLength > HIT_POSITION + FRETBOARD_LENGTH/2) {
        scene.remove(note);
        notes.splice(index, 1);
    } else if (!note.isBeingHit && note.position.z > HIT_POSITION + 1) {
        note.isMissed = true;
        note.longNoteLine.material.color.setHex(0x808080);
    }
}

// Handle short note updates
function handleShortNoteUpdate(note, index) {
    if (note.position.z > HIT_POSITION + FRETBOARD_LENGTH/2) {
        scene.remove(note);
        notes.splice(index, 1);
    }
}

// Spawn new notes
function spawnNewNotes() {
    if (Math.random() < 0.02) {
        const keys = Object.keys(keyPositions);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const isLongNote = Math.random() < 0.3; // 30% chance for a long note
        createNote(randomKey, isLongNote);
    }
}

// Find a note that can be hit
function findHitNote(key) {
    return notes.find(note => 
        note.key === key && 
        !note.isMissed &&
        ((note.isLongNote && Math.abs(note.position.z - HIT_POSITION) < 1) ||
        (!note.isLongNote && Math.abs(note.position.z - HIT_POSITION) < 1))
    );
}

// Handle note hit
function handleNoteHit(hitNote, key) {
    if (hitNote.isLongNote) {
        activeKeys[key] = true;
        hitNote.isBeingHit = true;
        hitNote.longNoteLine.material.color.setHex(lightenColor(noteColors[key], 0.5));
    } else {
        scene.remove(hitNote);
        notes.splice(notes.indexOf(hitNote), 1);
    }
    score += 100;
    document.getElementById('score').textContent = `Score: ${score}`;
    createHitEffect(hitNote.position, noteColors[key]);
}

// Handle long note release
function handleLongNoteRelease(key) {
    const longNote = notes.find(note => 
        note.key === key && 
        note.isLongNote && 
        note.isBeingHit &&
        note.position.z >= HIT_POSITION && 
        note.position.z - note.longNoteLength <= HIT_POSITION
    );
    if (longNote) {
        longNote.isBeingHit = false;
        if (longNote.position.z > HIT_POSITION + 1) {
            longNote.isMissed = true;
            longNote.longNoteLine.material.color.setHex(0x808080);
        } else {
            longNote.longNoteLine.material.color.setHex(noteColors[key]);
        }
    }
}

// Handle long notes that are currently being hit
function handleLongNotes() {
    Object.keys(activeKeys).forEach(key => {
        const hitNote = notes.find(note => 
            note.key === key && 
            note.isLongNote && 
            note.isBeingHit &&
            note.position.z >= HIT_POSITION && 
            note.position.z - note.longNoteLength <= HIT_POSITION
        );
        if (hitNote) {
            score += 1;
            document.getElementById('score').textContent = `Score: ${score}`;
            createHitEffect(hitNote.position, noteColors[key]);
        }
    });
}