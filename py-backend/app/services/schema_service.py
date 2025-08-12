import pandas as pd
import os
import json
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser

def generate_intelligent_schema(file_paths: list[str], dataset_id: str):
    """
    Runs a multi-step, AI-powered process to analyze a dataset, clean its schema,
    and generate a rich, semantic context for the main agent. This context is saved
    to a file for persistent use.
    """
    raw_schemas = {}
    for file_path in file_paths:
        try:
            df = pd.read_json(file_path, lines=True, nrows=10)
            
            for col in df.select_dtypes(include=['datetime64[ns, UTC]', 'datetime64[ns]']).columns:
                df[col] = df[col].astype(str)

            filename = os.path.basename(file_path)
            raw_schemas[filename] = {
                'original_columns': df.columns.tolist(),
                'sample_data': df.head(3).to_dict(orient='records')
            }
        except Exception as e:
            print(f"Initial scan failed for {file_path}: {e}")
            continue

    if not raw_schemas:
        print("Could not generate any raw schemas from the provided files.")
        return

    map_llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    map_prompt = ChatPromptTemplate.from_template(
        """
        You are a data cleaning expert. A user has uploaded a dataset with the following files and columns.
        Your task is to convert the original column names into clean, Python-friendly, snake_case names.
        Return ONLY a single JSON object that maps each original column name to its new snake_case name.

        Dataset Information:
        {raw_schema}
        """
    )
    map_chain = map_prompt | map_llm | JsonOutputParser()
    
    try:
        column_map = map_chain.invoke({"raw_schema": json.dumps(raw_schemas, indent=2)})
        map_path = os.path.join('uploads', dataset_id, '_column_map.json')
        with open(map_path, 'w', encoding='utf-8') as f:
            json.dump(column_map, f, indent=2)
    except Exception as e:
        print(f"Failed to generate and save column map: {e}")
        return

    context_llm = ChatOpenAI(model="gpt-4o", temperature=0)
    context_prompt = ChatPromptTemplate.from_template(
        """
        You are a senior data analyst. A user has uploaded a dataset.
        Based on the filenames, cleaned columns, and sample data, write a concise, natural-language summary that another AI agent can use to understand the dataset's contents and purpose.
        
        **CRITICAL**: Infer context from the filenames (e.g., 'Room 1'). Describe what each file likely represents and what each cleaned column name means.

        Dataset Information (with cleaned column names):
        {semantic_info}
        
        Example Summary:
        "The dataset contains sensor readings from multiple rooms.
        - `sensor_data_Room 1.ndjson`: Contains data for Room 1. The columns are `timestamp` (the time of the reading), `co2_ppm` (CO2 concentration in parts per million), and `temperature_celsius` (the temperature in Celsius)."
        """
    )
    context_chain = context_prompt | context_llm | StrOutputParser()

    semantic_info = {}
    for filename, schema in raw_schemas.items():
        semantic_info[filename] = {
            'cleaned_columns': [column_map.get(col, col) for col in schema['original_columns']],
            'sample_data': schema['sample_data']
        }

    try:
        final_context = context_chain.invoke({"semantic_info": json.dumps(semantic_info, indent=2)})
        context_path = os.path.join('uploads', dataset_id, '_schema_context.json')
        with open(context_path, 'w', encoding='utf-8') as f:
            f.write(final_context)
    except Exception as e:
        print(f"Failed to generate and save schema context: {e}")
