function uploadFeatureData() {
    fetch('http://localhost:3000/gestures')
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
                            const response = await fetch('http://localhost:3000/upload_feature_data', {
                                method: 'POST',
                                body: formData
                            });

                            const result = await response.json();
                            if (result.status === 'success') {
                                alert("Files uploaded successfully.");
                                // Update the sample count on the page
                                fetch(`http://localhost:3000/samples/${selectedGesture}`)
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
    fetch('http://localhost:3000/download_model')
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
