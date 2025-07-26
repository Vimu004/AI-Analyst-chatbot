import pandas as pd
import plotly.graph_objects as go

def generate_plot(data):
    df = pd.DataFrame(data)
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df['DayOfWeek'], y=df['co2_ppm'], mode='lines', name='CO2 Levels'))
    fig.update_layout(title='Average CO2 Levels by Day of the Week', xaxis_title='Day of the Week', yaxis_title='CO2 (ppm)')
    return fig