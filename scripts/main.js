document.addEventListener('DOMContentLoaded', loadGestures);

const gestures = JSON.parse(localStorage.getItem('gestures')) || [];
const predefinedGestures = ['Wave', 'Push', 'Squeeze', 'Point', 'Thumbs Up'];
const dropdownOptions = `
    <option value="move_forward">Move Forward</option>
    <option value="move_backward">Move Backward</option>
    <option value="turn_left">Turn Left</option>
    <option value="turn_right">Turn Right</option>
    <option value="stop">Stop</option>
`;

if (gestures.length === 0) {
    predefinedGestures.forEach(gestureName => {
        gestures.push(gestureName);
        fetch('http://localhost:3000/add_gesture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gesture: gestureName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                console.log(`Gesture '${gestureName}' added successfully to the backend.`);
            } else {
                console.error(`Failed to add gesture to the backend: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error adding gesture to the backend:', error);
        });
    });
    localStorage.setItem('gestures', JSON.stringify(gestures));
}

function addGesture() {
    const gestureName = document.getElementById('new-gesture').value;
    fetch('http://localhost:3000/add_gesture', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gesture: gestureName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            console.log(`Gesture '${gestureName}' added successfully.`);
        } else {
            console.error(`Failed to add gesture: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error adding gesture:', error);
    });
    if (gestureName) {
        let gestures = JSON.parse(localStorage.getItem('gestures')) || [];
        if (!gestures.includes(gestureName)) {
            const gestureList = document.getElementById('gesture-list');
            const li = document.createElement('li');
            li.innerHTML = `<button class="remove-button" onclick="removeGesture(this)">✖️</button>
                ${gestureName}
                <select onchange="saveDropdownSelection('${gestureName}', this.value)">
                    ${dropdownOptions}
                </select>
                <button onclick="recordData('${gestureName}')">Record Data</button>
                <span class="sample-count" id="sample-count-${gestureName}">Loading...</span>`;
            gestureList.appendChild(li);

            saveGesture(gestureName);
            saveDropdownSelection(gestureName, li.querySelector('select').value);
            updateSampleCount(gestureName);
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
        li.innerHTML = `<button class="remove-button" onclick="removeGesture(this)">✖️</button>
            ${gestureName}
            <select onchange="saveDropdownSelection('${gestureName}', this.value)">
                ${dropdownOptions}
            </select>
            <button onclick="recordData('${gestureName}')">Record Data</button>
            <span class="sample-count" id="sample-count-${gestureName}">Loading...</span>`;
        gestureList.appendChild(li);

        if (dropdownSelections[gestureName]) {
            li.querySelector('select').value = dropdownSelections[gestureName];
        }
        updateSampleCount(gestureName);
    });

    storedGestures.forEach(gestureName => {
        const li = document.createElement('li');
        li.innerHTML = `<button class="remove-button" onclick="removeStoredGesture(this)">✖️</button>
            <button class="add-back-button" onclick="addBackGesture(this)">➕</button>
            ${gestureName}
            <select onchange="saveDropdownSelection('${gestureName}', this.value)">
                ${dropdownOptions}
            </select>
            <button onclick="recordData('${gestureName}')">Record Data</button>
            <span class="sample-count" id="sample-count-${gestureName}">Loading...</span>`;
        storedGestureList.appendChild(li);

        if (dropdownSelections[gestureName]) {
            li.querySelector('select').value = dropdownSelections[gestureName];
        }
        updateSampleCount(gestureName);
    });
}

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
    storedLi.innerHTML = `<button class="remove-button" onclick="removeStoredGesture(this)">✖️</button>
        <button class="add-back-button" onclick="addBackGesture(this)">➕</button>
        ${gestureName}
        <select onchange="saveDropdownSelection('${gestureName}', this.value)">
            ${dropdownOptions}
        </select>
        <button onclick="recordData('${gestureName}')">Record Data</button>
        <span class="sample-count" id="sample-count-${gestureName}">Loading...</span>`;
    storedGestureList.appendChild(storedLi);

    if (dropdownSelections[gestureName]) {
        storedLi.querySelector('select').value = dropdownSelections[gestureName];
    }

    let storedGestures = JSON.parse(localStorage.getItem('storedGestures')) || [];
    storedGestures.push(gestureName);
    localStorage.setItem('storedGestures', JSON.stringify(storedGestures));
    updateSampleCount(gestureName);
}

function removeStoredGesture(button) {
    const li = button.parentElement;
    const gestureName = li.childNodes[3].textContent.trim();
    li.remove();

    let storedGestures = JSON.parse(localStorage.getItem('storedGestures')) || [];
    storedGestures = storedGestures.filter(gesture => gesture !== gestureName);
    localStorage.setItem('storedGestures', JSON.stringify(storedGestures));
    
    fetch('http://localhost:3000/delete_gesture', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gesture: gestureName })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response from delete_gesture API:', data);
        if (data.status === 'success') {
            console.log(`Gesture '${gestureName}' deleted successfully from the database.`);
        } else {
            console.error(`Failed to delete gesture '${gestureName}' from the database:`, data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting gesture from the database:', error);
    });
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
        newLi.innerHTML = `<button class="remove-button" onclick="removeGesture(this)">✖️</button>
                ${gestureName}
                <select onchange="saveDropdownSelection('${gestureName}', this.value)">
                    ${dropdownOptions}
                </select>
                <button onclick="recordData('${gestureName}')">Record Data</button>
                <span class="sample-count" id="sample-count-${gestureName}">Loading...</span>`;
        gestureList.appendChild(newLi);

        if (dropdownSelections[gestureName]) {
            newLi.querySelector('select').value = dropdownSelections[gestureName];
        }

        saveGesture(gestureName);

        // Remove the gesture from storedGestures
        storedGestures = storedGestures.filter(gesture => gesture !== gestureName);
        localStorage.setItem('storedGestures', JSON.stringify(storedGestures));
        updateSampleCount(gestureName);
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
    .then(() => {
        updateSampleCount(gestureName); // Ensure the sample count is updated after recording data
    });
}

function updateSampleCount(gestureName) {
    console.log(`Sending request to http://localhost:3000/samples/${gestureName}`)
    fetch(`http://localhost:3000/samples/${gestureName}`)
        .then(response => response.json())
        .then(data => {
            const sampleCountElement = document.getElementById(`sample-count-${gestureName}`);
            if (data.status === "failed") {
                sampleCountElement.innerHTML = "<strong>0 samples</strong>";
            } else {
                sampleCountElement.innerHTML = `<strong>${data.number_of_samples} samples</strong>`;
            }
        })
        .catch(error => {
            console.error('Error fetching sample count:', error);
            const sampleCountElement = document.getElementById(`sample-count-${gestureName}`);
            sampleCountElement.textContent = "Error loading samples";
        });
}

function trainModel() {
    const gestures = JSON.parse(localStorage.getItem('gestures')) || [];
    if (gestures.length === 0) {
        console.error('No gestures available for training');
        return;
    }

    fetch('http://localhost:3000/train_model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gestures: gestures })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            console.log('Model trained successfully');
            console.log('Accuracy:', data.accuracy);
            console.log('F1 Score:', data.f1_score);
            console.log('Report:', data.report);
            // Update the model accuracy percentage on index.html
            const accuracyElement = document.getElementById('model-accuracy');
            const f1Element = document.getElementById('model-f1-score');
            if (accuracyElement) {
                const accuracyPercentage = (data.accuracy * 100).toFixed(2);
                const f1Score = (data.f1_score * 100).toFixed(2);
                accuracyElement.textContent = `Latest Accuracy: ${accuracyPercentage}%`;
                f1Element.textContent = `Latest F1 Score: ${f1Score}%`
                localStorage.setItem('modelAccuracy', accuracyPercentage);
                localStorage.setItem('modelF1Score', f1Score);

                const gestureAccuracyList = document.getElementById('gesture-accuracy-list');
                gestureAccuracyList.innerHTML = ''; // Clear previous list
                const gestureAccuracies = [];
                for (const [gesture, metrics] of Object.entries(data.report)) {
                    if (metrics.hasOwnProperty('precision') && metrics.hasOwnProperty('recall') && gesture !== 'macro avg' && gesture !== 'weighted avg') { // Only process gesture classes
                        const accuracy = ((metrics.precision + metrics.recall) / 2 * 100).toFixed(2);
                        const listItem = document.createElement('li');
                        listItem.textContent = `${gesture} accuracy: ${accuracy}%`;
                        gestureAccuracyList.appendChild(listItem);
                        gestureAccuracies.push({ gesture, accuracy });
                    }
                }
                localStorage.setItem('gestureAccuracies', JSON.stringify(gestureAccuracies));
            }
        } else {
            console.error('Failed to train model:', data.message);
        }
    })
    .catch(error => {
        console.error('Error training model:', error);
    });
}

// Retrieve and display the model accuracy from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
    const accuracyElement = document.getElementById('model-accuracy');
    const f1Element = document.getElementById('model-f1-score');
    if (accuracyElement) {
        const storedAccuracy = localStorage.getItem('modelAccuracy');
        const storedF1Score = localStorage.getItem('modelF1Score');
        if (storedAccuracy && storedF1Score) {
            accuracyElement.textContent = `Latest Accuracy: ${storedAccuracy}%`
            f1Element.textContent = `Latest F1 Score: ${storedF1Score}%`;
        }
    }

    const gestureAccuracyList = document.getElementById('gesture-accuracy-list');
    if (gestureAccuracyList) {
        const storedGestureAccuracies = JSON.parse(localStorage.getItem('gestureAccuracies')) || [];
        gestureAccuracyList.innerHTML = ''; // Clear previous list
        storedGestureAccuracies.forEach(({ gesture, accuracy }) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${gesture} accuracy: ${accuracy}%`;
            gestureAccuracyList.appendChild(listItem);
        });
    }
});