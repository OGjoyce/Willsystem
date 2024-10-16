from flask import Flask, jsonify, request
import pandas as pd
from sqlalchemy import create_engine
import json
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
# Define a route that will trigger your Python logic
@app.route('/getData', methods=['GET'])
def get_data():

    # Define your MySQL connection string without a password
    db_connection_str = 'mysql+pymysql://root@localhost/example2'

    # Create the engine
    engine = create_engine(db_connection_str)

    # Define your query
    query = "SELECT * FROM obj_statuses"

    # Fetch the data into a DataFrame
    df = pd.read_sql(query, con=engine)


    # Convert the JSON string into dictionaries
    df['information'] = df['information'].apply(json.loads)

    # Normalize the JSON column into a new DataFrame
    normalized_df = pd.json_normalize(df['information'])

    df_normalized = pd.concat(normalized_df[0].apply(pd.json_normalize).tolist(), ignore_index=True)


    # Remove the '$' symbol and convert the string to float
    df_normalized['packageInfo.price'] = df_normalized['packageInfo.price'].replace(r'[\$,]', '', regex=True).astype(float)

    # Sum the column
    total_price = df_normalized['packageInfo.price'].sum()


    df['created_at'] = pd.to_datetime(df['created_at'])


    df_normalized['personal.timestamp'] = pd.to_datetime(df_normalized['personal.timestamp'])

    # Extract the date only for the histogram
    df_normalized['date'] = df_normalized['personal.timestamp'].dt.date

    new_df =  df_normalized[['date', 'packageInfo.price']]
    new_df.dropna()

    new_df['date'] = new_df['date'].astype(str)
    json_index = new_df.to_json(orient='records')
 




    return jsonify(json_index)

if __name__ == '__main__':
    app.run(debug=True)
