import pandas as pd
import plotly.graph_objects as go

def generate_plot(data):
    df = pd.DataFrame(data['table'])
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(x=df['timestamp'], y=df['co2'], mode='lines+markers', name='CO2 Levels'))
    
    fig.update_layout(title='Average CO2 Levels by Day of the Week',
                      xaxis_title='Day of the Week',
                      yaxis_title='CO2 Levels',
                      template='plotly_white')
    
    return fig