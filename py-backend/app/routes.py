# /app/routes.py
import os
import zipfile
import re
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, send_from_directory

from .services.schema_service import generate_intelligent_schema
from .services.agent_service import run_agent

main = Blueprint('main', __name__)

def sanitize_filename(filename):
    """Sanitizes a filename to be URL and filesystem-safe."""
    # Remove file extension
    name_without_ext = os.path.splitext(filename)[0]
    # Replace spaces and invalid characters with underscores
    sanitized = re.sub(r'[^a-zA-Z0-9_.-]', '_', name_without_ext)
    return sanitized

@main.route('/api/datasets', methods=['GET'])
def get_datasets():
    """Scans the uploads folder and returns a list of available dataset IDs."""
    uploads_folder = current_app.config['UPLOADS_FOLDER']
    try:
        dataset_ids = [d for d in os.listdir(uploads_folder) if os.path.isdir(os.path.join(uploads_folder, d))]
        return jsonify(sorted(dataset_ids, reverse=True))
    except FileNotFoundError:
        return jsonify([])

@main.route('/api/upload', methods=['POST'])
def upload_file():
    """Handles zipped data file upload, intelligent schema generation, and persistent storage."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '' or not file.filename.endswith('.zip'):
        return jsonify({"error": "No selected file or file is not a zip"}), 400

    # Create a unique dataset ID from the filename and timestamp
    sanitized_name = sanitize_filename(file.filename)
    timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    dataset_id = f"{sanitized_name}_{timestamp}"
    
    dataset_path = os.path.join(current_app.config['UPLOADS_FOLDER'], dataset_id)
    os.makedirs(dataset_path, exist_ok=True)
    
    zip_path = os.path.join(dataset_path, file.filename)
    file.save(zip_path)
    
    extracted_files = []
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for member in zip_ref.namelist():
            # Skip metadata folders and hidden files
            if member.startswith('__MACOSX/') or member.split('/')[-1].startswith('._'):
                continue
            zip_ref.extract(member, dataset_path)
            if member.endswith('.ndjson'): # Process only the data files
                 extracted_files.append(os.path.join(dataset_path, member))

    os.remove(zip_path)

    # Run the new "Schema Agent" to generate and save schema files
    generate_intelligent_schema(extracted_files, dataset_id)
    
    return jsonify({"dataset_id": dataset_id})

@main.route('/api/query', methods=['POST'])
def handle_query():
    """Handles user queries by loading the correct schema and invoking the agent."""
    data = request.json
    dataset_id = data.get('dataset_id')
    query = data.get('query')

    if not dataset_id or not query:
        return jsonify({"error": "dataset_id and query are required"}), 400

    schema_path = os.path.join(current_app.config['UPLOADS_FOLDER'], dataset_id, '_schema_context.json')
    try:
        with open(schema_path, 'r', encoding='utf-8') as f:
            schema_context = f.read()
    except FileNotFoundError:
        return jsonify({"error": f"Dataset '{dataset_id}' not found or schema is missing."}), 404
        
    result = run_agent(dataset_id, query, schema_context)
    return jsonify(result)

@main.route('/visualizations/<filename>')
def serve_visualization(filename):
    """Serves saved HTML visualization files."""
    return send_from_directory(
        os.path.abspath(current_app.config['VISUALIZATIONS_FOLDER']), 
        filename
    )
