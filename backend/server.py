from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import logging
import subprocess
import sys
import os
import traceback
import json
from typing import Generator
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('server.log')
    ]
)

app = Flask(__name__)
CORS(app)

def stream_script_output(script_name: str, message: str, agent_type: str = 'theta'):
    """
    Stream output from a Python script
    """
    try:
        # Set up the process with environment variables
        env = os.environ.copy()
        env['AGENT_TYPE'] = agent_type
        
        process = subprocess.Popen(
            [sys.executable, script_name],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env
        )
        
        # Send message to script
        process.stdin.write(message)
        process.stdin.close()
        
        # Stream output
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                # Filter out logging messages
                if not any(log_level in output for log_level in [' - INFO - ', ' - ERROR - ', ' - WARNING - ', ' - DEBUG - ']):
                    output = output.strip()
                    if output:  # Only send non-empty lines
                        # Format headers
                        if output.startswith('#'):
                            level = len(output.split()[0])
                            text = output[level:].strip()
                            output = f'<h{level} class="section-header">{text}</h{level}>'
                        
                        # Format code blocks with proper styling
                        if '```' in output:
                            # Replace code block markers with styled versions
                            output = output.replace('```bash', '<pre class="code-block bash">')
                            output = output.replace('```python', '<pre class="code-block python">')
                            output = output.replace('```', '</pre>')
                        
                        # Format bold text properly
                        if '**' in output:
                            # Split by ** and alternate between normal and bold text
                            parts = output.split('**')
                            formatted_parts = []
                            for i, part in enumerate(parts):
                                if i % 2 == 1:  # Odd indices are bold
                                    formatted_parts.append(f'<strong>{part}</strong>')
                                else:  # Even indices are normal text
                                    formatted_parts.append(part)
                            output = ''.join(formatted_parts)
                        
                        # Format numbered lists
                        if output[0].isdigit() and '. ' in output[:3]:
                            number, text = output.split('. ', 1)
                            output = f'<div class="numbered-item"><span class="number">{number}.</span> {text}</div>'
                        
                        # Format bullet points
                        if output.startswith('- '):
                            output = f'<div class="bullet-item"><span class="bullet">•</span> {output[2:]}</div>'
                        
                        # Format tables
                        if '|' in output and not output.startswith('|'):
                            output = f'<div class="table-row">{output}</div>'
                        
                        yield f"data: {output}\n\n"
                
        # Check for errors
        if process.returncode != 0:
            error = process.stderr.read()
            if error:
                # Only send actual error messages, not logging
                if not any(log_level in error for log_level in [' - INFO - ', ' - WARNING - ', ' - DEBUG - ']):
                    yield f"data: Error: {error}\n\n"
            
    except Exception as e:
        yield f"data: Error: {str(e)}\n\n"

@app.route('/theta', methods=['POST', 'OPTIONS'])
def handle_theta():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        message = data.get('message', '')
        model = data.get('model', 'theta')
        
        logging.info(f"Theta endpoint - Model: {model}, Message: {message}")
        
        if model.lower() != 'theta':
            logging.warning(f"Received non-theta model request: {model}")
            return jsonify({'error': 'Incorrect endpoint for model type'}), 400
            
        # Stream the response with theta agent type
        return Response(
            stream_with_context(stream_script_output('agent_theta.py', message, 'theta')),
            mimetype='text/event-stream'
        )
        
    except Exception as e:
        logging.error(f"Error in handle_theta: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/seneca', methods=['POST', 'OPTIONS'])
def handle_seneca():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        message = data.get('message', '')
        model = data.get('model', 'seneca')
        
        logging.info(f"Seneca endpoint - Model: {model}, Message: {message}")
        
        if model.lower() != 'seneca':
            logging.warning(f"Received non-seneca model request: {model}")
            return jsonify({'error': 'Incorrect endpoint for model type'}), 400
            
        # Stream the response with seneca agent type
        return Response(
            stream_with_context(stream_script_output('seneca.py', message, 'seneca')),
            mimetype='text/event-stream'
        )
            
    except Exception as e:
        logging.error(f"Error in handle_seneca: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/epsilon', methods=['POST', 'OPTIONS'])
def handle_epsilon():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        message = data.get('message', '')
        model = data.get('model', 'epsilon')
        
        logging.info(f"Epsilon endpoint - Model: {model}, Message: {message}")
        
        if model.lower() != 'epsilon':
            logging.warning(f"Received non-epsilon model request: {model}")
            return jsonify({'error': 'Incorrect endpoint for model type'}), 400
            
        # Stream the response with epsilon agent type
        return Response(
            stream_with_context(stream_script_output('agent_epsilon.py', message, 'epsilon')),
            mimetype='text/event-stream'
        )
            
    except Exception as e:
        logging.error(f"Error in handle_epsilon: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 