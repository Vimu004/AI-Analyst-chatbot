import os
import re
import uuid
import json
import importlib.util
import pandas as pd
from typing import TypedDict, Dict, Any, Optional

from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END
from langchain_core.output_parsers import StrOutputParser

class AgentState(TypedDict):
    dataset_id: str
    query: str
    schema_context: str
    generated_code: Optional[str] = None
    analysis_result: Optional[Dict[str, Any]] = None
    visualization_output: Optional[Dict[str, str]] = None
    intent: Optional[str] = None 

@tool
def python_pandas_tool(dataset_id: str, code: str) -> Dict[str, Any]:
    """
    Executes a string of Python code designed to analyze a dataset using Pandas.
    The code must define a function `analyze_data(dataframes: dict)`.
    This tool loads all data files for the given dataset_id into a dictionary of
    DataFrames and passes it to the `analyze_data` function.
    """
    cleaned_code = code.strip().replace("```python", "").replace("```", "").strip()

    local_namespace = {"pd": pd, "re": re}
    dataset_path = os.path.join('uploads', dataset_id)
    map_path = os.path.join(dataset_path, '_column_map.json')

    try:
        with open(map_path, 'r', encoding='utf-8') as f:
            column_map = json.load(f)
    except Exception as e:
        return {"error": f"Failed to load column map: {e}"}

    dataframes = {}
    for filename in os.listdir(dataset_path):
        if filename.endswith('.ndjson'):
            file_path = os.path.join(dataset_path, filename)
            df = pd.read_json(file_path, lines=True)
            df.columns = [column_map.get(col, col) for col in df.columns]
            dataframes[filename] = df
            
    try:
        exec(cleaned_code, local_namespace)
        analyze_data_func = local_namespace['analyze_data']
        result = analyze_data_func(dataframes)
        
        if 'table' in result and isinstance(result['table'], list):
            table_data = result['table']
            for row in table_data:
                for key, value in row.items():
                    if isinstance(value, pd.Timestamp):
                        row[key] = value.isoformat()
            result['table'] = table_data
        
        return result
    except Exception as e:
        print(f"--- Code Execution Error ---\nCode:\n{cleaned_code}\nError: {e}")
        return {"error": f"Execution failed: {e}"}

@tool
def visualization_tool(dataset_id: str, analysis_result: Dict[str, Any], query: str) -> Dict[str, str]:
    """
    Generates a Plotly visualization from the result of a data analysis.
    """
    table_data = analysis_result.get('table', [])
    if not table_data or not isinstance(table_data, list) or not table_data[0]:
        return {"html_snippet": "<p>No data available to generate a chart.</p>", "url": ""}

    actual_columns = list(table_data[0].keys())
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = ChatPromptTemplate.from_template(
        """
        You are a Python data visualization expert. Your task is to write a single Python function `generate_plot(data)` that takes a list of dictionaries and returns a Plotly Figure object.
        
        User's Query: "{query}"
        Available Data Columns: {actual_columns}
        
        Based on the user's query and the available columns, write the Python code.
        - The first line inside the function MUST be `df = pd.DataFrame(data)`.
        - Choose the best chart type (e.g., 'bar', 'line', 'pie') to answer the query.
        - Use the actual column names provided for the x and y axes. For example: `x=df['{col1}']`, `y=df['{col2}']`.
        - Create a descriptive title for the chart.
        - The script must only contain the function definition and necessary imports (pandas, plotly.graph_objects). DO NOT call the function.
        """
    )
    code_generation_chain = prompt | llm | StrOutputParser()
    
    response = code_generation_chain.invoke({
        "query": query,
        "actual_columns": actual_columns,
        "col1": actual_columns[0],
        "col2": actual_columns[1] if len(actual_columns) > 1 else actual_columns[0]
    })
    
    python_code = response.replace("```python", "").replace("```", "").strip()

    temp_filename = f"temp_chart_gen_{uuid.uuid4()}.py"
    with open(temp_filename, "w", encoding="utf-8") as f:
        f.write(python_code)
        
    spec = importlib.util.spec_from_file_location("chart_module", temp_filename)
    chart_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(chart_module)
    
    fig = chart_module.generate_plot(table_data)
    os.remove(temp_filename)

    html_snippet = fig.to_html(full_html=False, include_plotlyjs='cdn')
    viz_filename = f"{dataset_id}_{uuid.uuid4()}.html"
    viz_filepath = os.path.join('visualizations', viz_filename)
    with open(viz_filepath, "w", encoding="utf-8") as f:
        f.write(html_snippet)
    
    viz_url = f"/visualizations/{viz_filename}"
    return {"html_snippet": html_snippet, "url": viz_url}

# --- New Nodes for Intent Routing and General Response ---
def intent_router_node(state: AgentState) -> Dict[str, Any]:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0) 
    prompt = ChatPromptTemplate.from_messages([
        ("system", """
        You are an AI assistant. Your task is to classify the user's intent based on their query.

        If the query is a general greeting, thanks, question about capabilities, or any non-data-specific conversation, output 'GENERAL_CONVERSATION'.
        If the query is clearly asking for data analysis, calculations, or visualizations related to a dataset, output 'DATA_ANALYSIS_REQUEST'.

        Output ONLY the classification string. Do not add any other text or punctuation.
        """),
        ("human", "User Query: {query}")
    ])
    chain = prompt | llm | StrOutputParser()
    
    try:
        intent = chain.invoke({"query": state['query']}).strip().upper()
        if intent not in ['GENERAL_CONVERSATION', 'DATA_ANALYSIS_REQUEST']:
            intent = 'DATA_ANALYSIS_REQUEST' # Default to data analysis if classification is unclear/bad
    except Exception as e:
        print(f"Intent classification failed: {e}. Defaulting to DATA_ANALYSIS_REQUEST.")
        intent = 'DATA_ANALYSIS_REQUEST' # Fallback if LLM call fails
        
    print(f"User Query: '{state['query']}' -> Intent: '{intent}'")
    return {"intent": intent}

def general_response_node(state: AgentState) -> Dict[str, Any]:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    prompt = ChatPromptTemplate.from_messages([
        ("system", """
        You are an AI assistant designed to help users analyze datasets and create visualizations.
        However, this user query is a general conversation (like a greeting, thank you, or question about your capabilities), not a data analysis request.
        Respond politely and informatively, keeping in mind your core purpose.
        If asked about who developed you, state that you were developed by Vimuthu Thesara.
        Example responses:
        - "Hello there! How can I assist you with data analysis today?"
        - "I'm here to help you analyze your datasets and generate insightful visualizations. What would you like to explore?"
        - "You're welcome! Let me know if you have any datasets you'd like me to analyze."
        - "I am an AI assistant developed by Vimuthu Thesara."
        """),
        ("human", "User Query: {query}")
    ])
    chain = prompt | llm | StrOutputParser()
    
    response_text = chain.invoke({"query": state['query']})
    
    return {
        "analysis_result": {
            "summary_text": response_text,
            "table": [],
            "error": None 
        }
    }

# --- Existing Graph Nodes ---
def code_generator_node(state: AgentState) -> Dict[str, str]:
    """Generates the Python analysis code."""
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    prompt = ChatPromptTemplate.from_messages([
        ("system", """
        You are an expert Python data scientist. Your sole task is to write a single Python function `analyze_data(dataframes: dict)` to answer the user's query based on the provided data schema.

        **Function Requirements:**
        1.  **Input:** The function will receive a dictionary of Pandas DataFrames, where keys are the original filenames.
        2.  **Combine Data:** The first step inside your function MUST be to combine all DataFrames into a single master DataFrame.
        3.  **Create Context Column:** While combining, you MUST create a new column to identify the source of each row. Extract a meaningful name (like a room number or category) from the filename. A helper function `extract_context(filename)` is recommended.
        4.  **Perform Analysis:** Write the necessary Pandas code to perform the calculations required by the user's query. This may include filtering, grouping, calculating standard deviation (`.std()`), finding max/min values (`.idxmax()`), sorting, etc.
        5.  **Return Value:** The function MUST return a dictionary with two keys:
            - `table`: The final data as a list of dictionaries (e.g., `df.to_dict('records')`).
            - `summary_text`: A detailed, data-driven explanation of your findings in natural language.

        **IMPORTANT HOUR FORMATTING:**
        If the analysis involves the 'hour' column (typically an integer from 0-23) and it's part of the final `table` output or `summary_text`, ensure these hour values are formatted as "HH:00" (e.g., 0 becomes "00:00", 1 becomes "01:00", ..., 23 becomes "23:00"). For example, apply `df['hour'] = df['hour'].apply(lambda x: f"{{x:02d}}:00")` to the DataFrame column *before* converting to dictionary records or using it in summary text.

        **Schema Context:**
        {schema_context}
        
        **Constraint:**
        Return ONLY the raw Python code. Do not include markdown, explanations, or any text outside the function definition.
        """),
        ("human", "User Query: {query}")
    ])
    chain = prompt | llm | StrOutputParser()
    generated_code = chain.invoke({
        "schema_context": state['schema_context'], 
        "query": state['query']
    })
    return {"generated_code": generated_code}

def code_executor_node(state: AgentState) -> Dict[str, Any]:
    """Executes the generated code using the python_pandas_tool."""
    result = python_pandas_tool.invoke({
        "dataset_id": state['dataset_id'],
        "code": state['generated_code']
    })
    return {"analysis_result": result}

def visualization_node(state: AgentState) -> Dict[str, Any]:
    """Generates a visualization from the analysis result."""
    analysis_result = state.get('analysis_result', {})
    if "error" in analysis_result or not analysis_result.get('table'):
        return {"visualization_output": {"html_snippet": "", "url": ""}}
        
    result = visualization_tool.invoke({
        "dataset_id": state['dataset_id'],
        "analysis_result": analysis_result,
        "query": state['query']
    })
    return {"visualization_output": result}

workflow = StateGraph(AgentState)

workflow.add_node("intent_router", intent_router_node) 
workflow.add_node("general_response", general_response_node) 
workflow.add_node("code_generator", code_generator_node)
workflow.add_node("code_executor", code_executor_node)
workflow.add_node("visualizer", visualization_node)

workflow.set_entry_point("intent_router") 


workflow.add_conditional_edges(
    "intent_router",
    lambda state: state['intent'], 
    {
        "GENERAL_CONVERSATION": "general_response",
        "DATA_ANALYSIS_REQUEST": "code_generator",
    }
)


workflow.add_edge("code_generator", "code_executor")
workflow.add_edge("code_executor", "visualizer")


workflow.add_edge("general_response", END) 
workflow.add_edge("visualizer", END)

app_graph = workflow.compile()


def run_agent(dataset_id: str, query: str, schema_context: str) -> Dict[str, Any]:
    initial_state = {
        "dataset_id": dataset_id,
        "query": query,
        "schema_context": schema_context,
        "intent": None 
    }
    
    final_state = app_graph.invoke(initial_state)

    analysis_result = final_state.get('analysis_result', {})
    visualization_output = final_state.get('visualization_output', {"html_snippet": "", "url": ""})
    
    
    if final_state.get('intent') == "GENERAL_CONVERSATION":

        result = {
            "summary": analysis_result.get('summary_text', "Sorry, I couldn't process that general query."),
            "table": [],
            "visualizationHtml": "",
            "visualizationUrl": ""
        }
    elif "error" in analysis_result:

        result = {
            "summary": f"An error occurred during analysis: {analysis_result['error']}",
            "table": [],
            "visualizationHtml": "",
            "visualizationUrl": ""
        }
    else:

        result = {
            "summary": analysis_result.get('summary_text', "Analysis complete."),
            "table": analysis_result.get('table', []),
            "visualizationHtml": visualization_output.get('html_snippet', ''),
            "visualizationUrl": visualization_output.get('url', '')
        }

    print("\n" + "="*50)
    print("FINAL JSON RESPONSE TO FRONTEND:")
    try:
        print(json.dumps(result, indent=2))
    except TypeError as e:
        print(f"Could not serialize result to JSON: {e}")
        print(str(result))
    print("="*50 + "\n")
    
    return result