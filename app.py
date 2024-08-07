from flask import Flask, request, jsonify
import threading
import time
import pandas as pd
import os
import mindrove
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds
from mindrove.data_filter import DataFilter, FilterTypes, AggOperations, NoiseTypes
import numpy as np
from scipy.signal import butter, lfilter
from wifi import Cell, Scheme
from db import init_db, add_gesture, add_gesture_sample, get_gesture_by_name, get_samples_for_gesture, increment_count, delete_gesture_by_name

def butter_bandpass(lowcut, highcut, fs, order=4):
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    return b, a

def butter_bandpass_filter(data, lowcut, highcut, fs, order=4):
    b, a = butter_bandpass(lowcut, highcut, fs, order=order)
    y = lfilter(b, a, data)
    return y

def extract_features(emg_data, imu_data, fs=1000):
    emg_filtered = butter_bandpass_filter(emg_data.values, 20, 450, fs, order=4)

    # Calculate time-domain features for each EMG channel
    features = []
    for channel in range(emg_filtered.shape[1]):
        channel_data = emg_filtered[:, channel]
        mav = np.mean(np.abs(channel_data))
        rms = np.sqrt(np.mean(channel_data ** 2))
        wl = np.sum(np.abs(np.diff(channel_data)))
        zc = np.sum(np.abs(np.diff(np.sign(channel_data)))) / 2
        ssc = np.sum(np.abs(np.diff(np.sign(np.diff(channel_data))))) / 2
        iemg = np.sum(np.abs(channel_data))
        features.extend([mav, rms, wl, zc, ssc, iemg])

    # Calculate IMU features
    for sensor in ['Gyro', 'Accel']:
        for axis in ['0', '1', '2']:
            channel_data = imu_data[f'{sensor}_{axis}'].values
            mav = np.mean(np.abs(channel_data))
            rms = np.sqrt(np.mean(channel_data ** 2))
            wl = np.sum(np.abs(np.diff(channel_data)))
            zc = np.sum(np.abs(np.diff(np.sign(channel_data)))) / 2
            ssc = np.sum(np.abs(np.diff(np.sign(np.diff(channel_data))))) / 2
            
            max_value = np.max(channel_data)
            min_value = np.min(channel_data)
            range_value = max_value-min_value
            std_value = np.std(channel_data)
            mean = np.mean(channel_data)
            skew_gyro = np.mean((channel_data - mean) ** 3) / (std_value ** 3)
            kurt_gyro = np.mean((channel_data - mean) ** 4) / (std_value ** 4)
            
            features.extend([mav, rms, wl, zc, ssc, mean, std_value, max_value, min_value, range_value, skew_gyro, kurt_gyro])

    features_array =  np.array(features)
    
    # Check for NaN values
    if np.isnan(features_array).any():
        print("NaN values found in features")
        nan_indices = np.where(np.isnan(features_array))
        print("NaN indices:", nan_indices)
        print("NaN values:", features_array[nan_indices])
    
    return features_array

def connect_to_wifi(ssid, password):
    cells = Cell.all('wlan0')
    for cell in cells:
        if cell.ssid == ssid:
            scheme = Scheme.for_cell('wlan0', 'home', cell, password)
            scheme.save()
            scheme.activate()
            print(f"Connected to {ssid}")
            return True
    print(f"Could not find network {ssid}")
    return False

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gestures.db'
app.config["SQLALCHEMY_ECHO"] = True
init_db(app)

def collect_data(gesture):
    print(gesture)
    if not os.path.exists("static/data/"+gesture):
        os.makedirs("static/data/"+gesture)

    BoardShim.enable_dev_board_logger()
    params = MindRoveInputParams()
    board_id = BoardIds.MINDROVE_WIFI_BOARD
    board_shim = BoardShim(board_id, params)

    emg_channels = BoardShim.get_emg_channels(board_id)
    gyro_channels = BoardShim.get_gyro_channels(board_id)
    accel_channels = BoardShim.get_accel_channels(board_id)
    timestamp_channel = BoardShim.get_timestamp_channel(board_id)
    sampling_rate = BoardShim.get_sampling_rate(board_id)

    board_shim.prepare_session()
    board_shim.start_stream()

    window_size = 2  # seconds
    num_points = window_size * sampling_rate

    print(f"Starting data collection for gesture: {gesture}")
    
    for i in range(2, 0, -1):
        print(f"{i}...")
        time.sleep(1)
    print("0")

    if board_shim.get_board_data_count() >= num_points:
        data = board_shim.get_current_board_data(num_points)

        emg_data = data[emg_channels]
        gyro_data = data[gyro_channels]
        accel_data = data[accel_channels]
        timestamp_data = data[timestamp_channel]

        combined_data = np.transpose(np.vstack((emg_data, gyro_data, accel_data, timestamp_data)))
        combined_df = pd.DataFrame(combined_data, columns=[f'EMG_{i}' for i in range(emg_data.shape[0])] + 
                                                    [f'Gyro_{i}' for i in range(gyro_data.shape[0])] + 
                                                    [f'Accel_{i}' for i in range(accel_data.shape[0])] + 
                                                    ['Timestamp'])
        
        features = extract_features(combined_df[['EMG_0', 'EMG_1', 'EMG_2']], combined_df[['Gyro_0', 'Gyro_1', 'Gyro_2', 'Accel_0', 'Accel_1', 'Accel_2']], fs=sampling_rate)
        
        # Ensure the file name is unique
        counter = 1
        file_name = f"static/data/{gesture}/{counter}.csv"
        while os.path.exists(file_name):
            counter += 1
            file_name = f"static/data/{gesture}/{counter}.csv"
        
        features.to_csv(file_name, index=False)
        print(f'Data saved to {file_name}')
        
        # Add gesture sample to the database
        gesture_obj = get_gesture_by_name(gesture)
        if not gesture_obj:
            gesture_id = add_gesture(gesture, 0)
            gesture_obj = get_gesture_by_name(gesture)
        add_gesture_sample(gesture_obj.id, file_name)
        increment_count(gesture_obj)

    board_shim.stop_stream()
    board_shim.release_session()

    # Switch back to the original WiFi
    # if connect_to_wifi(original_ssid, original_password):
    #     print(f"Switched back to original WiFi: {original_ssid}")
    # else:
    #     print(f"Failed to reconnect to original WiFi: {original_ssid}")

@app.route('/start', methods=['POST'])
def start_collection():
    global collecting_data
    gesture = request.json.get('gesture')
    
    # if not connect_to_wifi("MindRove_ARB_3d9bec", "#mindrove"):
    #     return jsonify({"status": "failed", "message": "Could not connect to WiFi"}), 400
    
    if not os.path.exists("static/data/"+gesture):
        os.makedirs("static/data/"+gesture)
    
    # Save a blank CSV to the specified path
    counter = 1
    file_name = f"static/data/{gesture}/{counter}.csv"
    while os.path.exists(file_name):
        counter += 1
        file_name = f"static/data/{gesture}/{counter}.csv"

    # Add gesture sample to the database
    gesture_obj = get_gesture_by_name(gesture)
    if not gesture_obj:
        gesture_id = add_gesture(gesture, 0)
        gesture_obj = get_gesture_by_name(gesture)
    add_gesture_sample(gesture_obj.id, file_name)
    increment_count(gesture_obj)

    demo_df = pd.DataFrame(np.zeros((1000, 14)))  # Create a DataFrame with 1000 rows and 14 columns of zeros
    demo_df.to_csv(file_name, index=False)  # Save the DataFrame without row indices
    
    # threading.Thread(target=collect_data, args=(gesture)).start()
    return jsonify({"status": "started"})

@app.route('/samples/<gesture>', methods=['GET'])
def get_samples(gesture):
    gesture_obj = get_gesture_by_name(gesture)
    if gesture_obj:
        samples = get_samples_for_gesture(gesture_obj.id)
        return jsonify({"gesture": gesture, "number_of_samples": len(samples)})
    else:
        return jsonify({"status": "failed", "message": "Gesture not found"}), 404
    
@app.route('/delete_gesture', methods=['DELETE'])
def delete_gesture():
    gesture_name = request.json.get('gesture')
    if not gesture_name:
        return jsonify({"status": "failed", "message": "Gesture name is required"}), 400

    if delete_gesture_by_name(gesture_name):
        return jsonify({"status": "success", "message": f"Gesture '{gesture_name}' deleted successfully"})
    else:
        return jsonify({"status": "failed", "message": f"Gesture '{gesture_name}' not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)