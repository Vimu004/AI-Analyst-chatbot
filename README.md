# AI Data Analyst Chatbot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent data analysis chatbot that allows users to upload datasets and ask complex, cross-file questions in natural language. The AI agent can understand the data, perform calculations, and generate visualizations on the fly.

## Features

- **Dynamic Schema Generation**: Upload any dataset, and the AI will intelligently analyze its structure and meaning.
- **Persistent Datasets**: Datasets are saved and can be selected later for continued analysis.
- **Complex Query Handling**: Ask complex, multi-file questions (e.g., "Which room had the highest temperature last week?").
- **AI-Powered Code Generation**: The agent writes and executes its own Pandas code to perform the analysis.
- **Interactive Visualizations**: Generates Plotly charts based on the analysis results.

## Project Structure

This project is a monorepo containing both the frontend and backend applications.

```
/
├── frontend/         # The React (Vite + TypeScript) frontend application
├── py-backend/       # The Python (Flask + LangGraph) backend application
├── LICENSE           # The open-source license
└── README.md
```

## Tech Stack

### Backend (`py-backend`)
- **Framework**: Flask
- **AI Orchestration**: LangChain & LangGraph
- **LLM Provider**: OpenAI
- **Data Handling**: Pandas

### Frontend (`frontend`)
- **Framework**: React
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS

---

## Setup and Installation

### Prerequisites
- Python 3.10+
- Node.js and npm (or yarn)
- An OpenAI API Key

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd py-backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables:**
    - Create a file named `.env` in the `py-backend` root folder.
    - Add your OpenAI API key to it:
      ```env
      OPENAI_API_KEY="sk-..."
      ```

5.  **Run the Flask server:**
    ```bash
    python run.py
    ```
    The backend will be running on `http://127.0.0.1:5001`.

### Frontend Setup

1.  **Open a new terminal** and navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Run the React development server:**
    ```bash
    npm run dev
    ```
    The frontend application will be available at `http://localhost:8080` (or another port if 8080 is busy).

---

## Usage

1.  Open the frontend application in your browser.
2.  Click **"Upload Dataset"** to upload a `.zip` file containing your `.ndjson` data files.
3.  Once uploaded, the dataset will be processed and become available in the "Select Dataset" dropdown.
4.  Select your dataset and start asking questions in the chat input!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.