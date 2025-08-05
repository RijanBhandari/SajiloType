from flask import Flask, request, jsonify
import pyautogui
import time
import threading
import socket

app = Flask(__name__)

@app.route('/type', methods=['POST'])
def type_text():
    data = request.get_json()
    text_to_type = data.get('text')

    if not text_to_type:
        return jsonify({"error": "No text provided"}), 400

    def type_after_delay(text):
        time.sleep(2)
        pyautogui.write(text)

    threading.Thread(target=type_after_delay, args=(text_to_type,)).start()

    return jsonify({"message": "Text received and typing initiated"}), 200

if __name__ == '__main__':
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        print(f"Server running on http://{local_ip}:5000")
    except Exception as e:
        print(f"Could not determine local IP: {e}")
        local_ip = "0.0.0.0"

    app.run(host='0.0.0.0', port=5000)
