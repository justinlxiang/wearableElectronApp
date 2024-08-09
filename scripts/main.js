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
        fetch('http://localhost:3000/api/add_gesture', {
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
    fetch('http://localhost:3000/api/add_gesture', {
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
    
    fetch('http://localhost:3000/api/delete_gesture', {
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
    fetch('http://localhost:3000/api/start', { // Updated to use the proxy server
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
    console.log(`Sending request to http://localhost:3000/api/samples/${gestureName}`)
    fetch(`http://localhost:3000/api/samples/${gestureName}`)
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

    fetch('http://localhost:3000/api/train_model', {
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
            // Display error message on the frontend
            alert(`Error: ${data.message}`);
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


function uploadFeatureData() {
    fetch('http://localhost:3000/api/gestures')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const gestures = data.gestures;

                const gestureDropdown = document.createElement('select');
                gestureDropdown.id = 'gestureDropdown';
                gestureDropdown.innerHTML = gestures.map(gesture => `<option value="${gesture}">${gesture}</option>`).join('');
                const label = document.createElement('label');
                label.htmlFor = 'gestureDropdown';
                label.innerText = 'Select a gesture: ';
                
                const container = document.createElement('div');
                container.style.position = 'fixed';
                container.style.top = '50%';
                container.style.left = '50%';
                container.style.transform = 'translate(-50%, -50%)';
                container.style.backgroundColor = 'white';
                container.style.padding = '20px';
                container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
                container.style.border = '1px solid black';
                
                container.appendChild(label);
                container.appendChild(gestureDropdown);
                
                const submitButton = document.createElement('button');
                submitButton.innerText = 'Submit';
                submitButton.style.marginRight = '10px'; // Add space between submit and cancel button
                submitButton.onclick = () => {
                    const selectedGesture = gestureDropdown.value;
                    if (!selectedGesture) {
                        alert("Gesture name is required.");
                        return;
                    }
                    document.body.removeChild(container);
                    // Proceed with the selected gesture
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.csv';
                    input.multiple = true;

                    input.onchange = async (event) => {
                        const files = event.target.files;
                        if (files.length === 0) {
                            alert("No files selected.");
                            return;
                        }

                        const formData = new FormData();
                        formData.append('gesture', selectedGesture);
                        for (const file of files) {
                            formData.append('files', file);
                        }

                        try {
                            const response = await fetch('http://localhost:3000/api/upload_feature_data', {
                                method: 'POST',
                                body: formData
                            });

                            const result = await response.json();
                            if (result.status === 'success') {
                                alert("Files uploaded successfully.");
                                // Update the sample count on the page
                                fetch(`http://localhost:3000/api/samples/${selectedGesture}`)
                                    .then(response => response.json())
                                    .then(data => {
                                        const sampleCountElement = document.getElementById(`sample-count-${selectedGesture}`);
                                        if (sampleCountElement) {
                                            sampleCountElement.innerHTML = `<strong>${data.number_of_samples} samples</strong>`;
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error fetching sample count:', error);
                                        const sampleCountElement = document.getElementById(`sample-count-${selectedGesture}`);
                                        if (sampleCountElement) {
                                            sampleCountElement.textContent = "Error loading samples";
                                        }
                                    });
                            } else {
                                alert("Failed to upload files: " + result.message);
                            }
                        } catch (error) {
                            console.error("Error uploading files:", error);
                            alert("An error occurred while uploading files.");
                        }
                    };

                    input.click();
                };

                const cancelButton = document.createElement('button');
                cancelButton.innerText = 'Cancel';
                cancelButton.onclick = () => {
                    document.body.removeChild(container);
                };
                
                container.appendChild(submitButton);
                container.appendChild(cancelButton);
                document.body.appendChild(container);
            } else {
                alert("Failed to fetch gestures: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error fetching gestures:", error);
            alert("An error occurred while fetching gestures.");
        });
}

function downloadModel() {
    fetch('http://localhost:3000/api/download_model')
        .then(response => {
            if (response.ok) {
                alert("Model downloaded successfully.");
            } else {
                alert("Failed to download model.");
            }
        })
        .catch(error => {
            console.error("Error downloading model:", error);
            alert("An error occurred while downloading the model.");
        });
}
