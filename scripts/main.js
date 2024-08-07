document.addEventListener('DOMContentLoaded', loadGestures);


const gestures = JSON.parse(localStorage.getItem('gestures')) || [];
const predefinedGestures = ['Wave', 'Push', 'Squeeze', 'Point', 'Thumbs Up'];

if (gestures.length === 0) {
    predefinedGestures.forEach(gestureName => {
        gestures.push(gestureName);
    });
    localStorage.setItem('gestures', JSON.stringify(gestures));
}

function addGesture() {
    const gestureName = document.getElementById('new-gesture').value;
    if (gestureName) {
        let gestures = JSON.parse(localStorage.getItem('gestures')) || [];
        if (!gestures.includes(gestureName)) {
            const gestureList = document.getElementById('gesture-list');
            const li = document.createElement('li');
            li.innerHTML = `<button class="remove-button" onclick="removeGesture(this)">🗑️</button>
                ${gestureName}
                <select onchange="saveDropdownSelection('${gestureName}', this.value)">
                    <option value="move_forward">Move Forward</option>
                    <option value="move_backward">Move Backward</option>
                    <option value="turn_left">Turn Left</option>
                    <option value="turn_right">Turn Right</option>
                    <option value="stop">Stop</option>
                </select>
                <button onclick="recordData('${gestureName}')">Record Data</button>`;
            gestureList.appendChild(li);

            saveGesture(gestureName);
            saveDropdownSelection(gestureName, li.querySelector('select').value);
        }
    }
}

function saveGesture(gestureName) {
    let gestures = JSON.parse(localStorage.getItem('gestures')) || [];
    if (!gestures.includes(gestureName)) {
        gestures.push(gestureName);
        localStorage.setItem('gestures', JSON.stringify(gestures));
    }
}

function loadGestures() {
    const gestures = JSON.parse(localStorage.getItem('gestures')) || [];
    const storedGestures = JSON.parse(localStorage.getItem('storedGestures')) || [];
    const gestureList = document.getElementById('gesture-list');
    const storedGestureList = document.getElementById('stored-gesture-list');
    const dropdownSelections = JSON.parse(localStorage.getItem('dropdownSelections')) || {};

    gestures.forEach(gestureName => {
        const li = document.createElement('li');
        li.innerHTML = `<button class="remove-button" onclick="removeGesture(this)">🗑️</button>
            ${gestureName}
            <select onchange="saveDropdownSelection('${gestureName}', this.value)">
                <option value="move_forward">Move Forward</option>
                <option value="move_backward">Move Backward</option>
                <option value="turn_left">Turn Left</option>
                <option value="turn_right">Turn Right</option>
                <option value="stop">Stop</option>
            </select>
            <button onclick="recordData('${gestureName}')">Record Data</button>`;
        gestureList.appendChild(li);

        if (dropdownSelections[gestureName]) {
            li.querySelector('select').value = dropdownSelections[gestureName];
        }
    });

    storedGestures.forEach(gestureName => {
        const li = document.createElement('li');
        li.innerHTML = `<button class="remove-button" onclick="removeStoredGesture(this)">🗑️</button>
            <button class="add-back-button" onclick="addBackGesture(this)">➕</button>
            ${gestureName}
            <select onchange="saveDropdownSelection('${gestureName}', this.value)">
                <option value="move_forward">Move Forward</option>
                <option value="move_backward">Move Backward</option>
                <option value="turn_left">Turn Left</option>
                <option value="turn_right">Turn Right</option>
                <option value="stop">Stop</option>
            </select>
            <button onclick="recordData('${gestureName}')">Record Data</button>`;
        storedGestureList.appendChild(li);

        if (dropdownSelections[gestureName]) {
            li.querySelector('select').value = dropdownSelections[gestureName];
        }
    });}

function removeGesture(button) {
    const li = button.parentElement;
    const gestureName = li.childNodes[1].textContent.trim();
    const dropdownValue = li.querySelector('select').value; // Get the current dropdown value
    li.remove();

    let gestures = JSON.parse(localStorage.getItem('gestures')) || [];
    gestures = gestures.filter(gesture => gesture !== gestureName);
    localStorage.setItem('gestures', JSON.stringify(gestures));

    let dropdownSelections = JSON.parse(localStorage.getItem('dropdownSelections')) || {};
    dropdownSelections[gestureName] = dropdownValue; // Save the current dropdown value
    localStorage.setItem('dropdownSelections', JSON.stringify(dropdownSelections));

    const storedGestureList = document.getElementById('stored-gesture-list');
    const storedLi = document.createElement('li');
    storedLi.innerHTML = `<button class="remove-button" onclick="removeStoredGesture(this)">🗑️</button>
        <button class="add-back-button" onclick="addBackGesture(this)">➕</button>
        ${gestureName}
        <select onchange="saveDropdownSelection('${gestureName}', this.value)">
            <option value="move_forward">Move Forward</option>
            <option value="move_backward">Move Backward</option>
            <option value="turn_left">Turn Left</option>
            <option value="turn_right">Turn Right</option>
            <option value="stop">Stop</option>
        </select>
        <button onclick="recordData('${gestureName}')">Record Data</button>`;
    storedGestureList.appendChild(storedLi);

    if (dropdownSelections[gestureName]) {
        storedLi.querySelector('select').value = dropdownSelections[gestureName];
    }

    let storedGestures = JSON.parse(localStorage.getItem('storedGestures')) || [];
    storedGestures.push(gestureName);
    localStorage.setItem('storedGestures', JSON.stringify(storedGestures));
}

function removeStoredGesture(button) {
    const li = button.parentElement;
    const gestureName = li.childNodes[3].textContent.trim();
    li.remove();

    let storedGestures = JSON.parse(localStorage.getItem('storedGestures')) || [];
    storedGestures = storedGestures.filter(gesture => gesture !== gestureName);
    localStorage.setItem('storedGestures', JSON.stringify(storedGestures));
}

function addBackGesture(button) {
    const li = button.parentElement;
    const gestureName = li.childNodes[3].textContent.trim();
    li.remove();

    let gestures = JSON.parse(localStorage.getItem('gestures')) || [];
    let storedGestures = JSON.parse(localStorage.getItem('storedGestures')) || [];
    let dropdownSelections = JSON.parse(localStorage.getItem('dropdownSelections')) || {};

    if (!gestures.includes(gestureName)) {
        gestures.push(gestureName);
        localStorage.setItem('gestures', JSON.stringify(gestures));

        const gestureList = document.getElementById('gesture-list');
        const newLi = document.createElement('li');
        newLi.innerHTML = `<button class="remove-button" onclick="removeGesture(this)">🗑️</button>
                ${gestureName}
                <select onchange="saveDropdownSelection('${gestureName}', this.value)">
                    <option value="move_forward">Move Forward</option>
                    <option value="move_backward">Move Backward</option>
                    <option value="turn_left">Turn Left</option>
                    <option value="turn_right">Turn Right</option>
                    <option value="stop">Stop</option>
                </select>
                <button onclick="recordData('${gestureName}')">Record Data</button>`;
        gestureList.appendChild(newLi);

        if (dropdownSelections[gestureName]) {
            newLi.querySelector('select').value = dropdownSelections[gestureName];
        }

        saveGesture(gestureName);

        // Remove the gesture from storedGestures
        storedGestures = storedGestures.filter(gesture => gesture !== gestureName);
        localStorage.setItem('storedGestures', JSON.stringify(storedGestures));
    }
}

function saveDropdownSelection(gestureName, selection) {
    let dropdownSelections = JSON.parse(localStorage.getItem('dropdownSelections')) || {};
    dropdownSelections[gestureName] = selection;
    localStorage.setItem('dropdownSelections', JSON.stringify(dropdownSelections));
}

function recordData(gestureName) {
    console.log(gestureName)
    fetch('http://localhost:3000/start', { // Updated to use the proxy server
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gesture: gestureName })
    })
    .then(response => response.json())
}
