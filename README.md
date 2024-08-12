# Wearable Gesture Control Desktop Application

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Building](#building)
- [Project Structure](#project-structure)

## Introduction

The Wearable Gesture Control application is designed to provide an intuitive interface for customizing and training gesture models. Users can define new gestures, upload feature data, and train models to recognize these gestures.

<img width="1493" alt="Screenshot 2024-08-11 at 10 16 50 AM" src="https://github.com/user-attachments/assets/76422596-48b1-438d-b445-9a75290a4151">

## Features

- Define and add new gestures
- Upload feature data for gestures
- Train gesture recognition models
- View model accuracy and F1-score
- Download trained models

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js (v14 or later)
- npm (v6 or later)
- Python (v3.6 or later)
- `pyinstaller` (for packaging Python scripts)
- `pkg` (for packaging Node.js scripts)

## Building Yourself

To get started with the Wearable Gesture Control application, follow these steps:

1. **Clone the repository:**
    ```sh
    git clone https://github.com/justinlxiang/wearableRobotUI.git
    cd wearableRobotUI
    ```

2. **Install dependencies:**
    ```sh
    # Create a virtual environment
    python -m venv venv

    # Activate the virtual environment
    # On Windows
    venv\Scripts\activate
    # On macOS and Linux
    source venv/bin/activate

    # Install Python dependencies
    pip install -r requirements.txt

    # Install Node.js dependencies
    npm install
    npm install -g pkg
    ```

3. **Build the executables:**

    To build the Python and proxyServer executables, follow these steps:

    - **Build the proxyServer executable:**
        ```sh
        pkg proxy/proxyServer.js --output bin/proxyServer
        ```

    - **Build the Python executables:**
        ```sh
        pyinstaller app.spec --distpath "./bin/"
        ```

    Ensure that the generated executables are placed in a /bin folder. You can specify the target architecture using the `--target` option for `pkg` and `--target-arch` option for `pyinstaller`.

4. **Build the application:**
    ```sh
    npm run build
    ```

    You can specify the target architecture for the build process by using the CLI flags --mac, --win, --linux to specify platforms`.

## Project Structure

- `index.html`: The main HTML file for the application interface.
- `scripts/main.js`: JavaScript file handling the application logic.
- `styles/style.css`: CSS file for styling the application.
- `proxy/proxyServer.js`: Proxy server for handling API requests.
- `main.js`: Main Electron file for creating the application window and managing processes.
- `package.json`: Project configuration and dependencies.
