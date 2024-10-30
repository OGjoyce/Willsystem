from flask import Flask, jsonify, request
import pandas as pd
from sqlalchemy import create_engine
import json
from flask_cors import CORS
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
# Define a route that will trigger your Python logic
GMAIL_USER = os.getenv('GMAIL_USER')
GMAIL_PASSWORD = os.getenv('GMAIL_PASSWORD')

def send_email(to_email, subject, message, ishtml):
    try:
        # Set up the server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  # Secure the connection
        server.login(GMAIL_USER, GMAIL_PASSWORD)

        # Compose the email
        email_msg = MIMEMultipart()
        email_msg['From'] = GMAIL_USER
        email_msg['To'] = to_email
        email_msg['Subject'] = subject
 

       if ishtml:
        email_msg.attach(MIMEText(message, 'html'))
       else:
        email_msg.attach(MIMEText(message, 'plain'))

        # Send the email
        server.sendmail(GMAIL_USER, to_email, email_msg.as_string())
        server.quit()

        return "Email sent successfully!"

    except Exception as e:
        return f"Failed to send email: {str(e)}"

@app.route('/send-email', methods=['POST'])
def send_email_endpoint():
    # Get the parameters from the request
    data = request.get_json()
    to_email = data.get('to_email')
    subject = data.get('subject')
    message = data.get('message')
    ishtml = data.get('is_html')

    # Call the email sending function
    result = send_email(to_email, subject, message, ishtml)

    return jsonify({"result": result})


@app.route('/getData', methods=['GET'])
def get_data():

    # Define your MySQL connection string without a password
    db_connection_str = 'mysql+pymysql://willuser:Pipiriberta1!%40@localhost/landingtest'

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


    df_normalized['personal.timestamp'] = pd.to_datetime(df_normalized['personal.timestamp'], unit='ms')

    # Extract the date only for the histogram
    df_normalized['date'] = df_normalized['personal.timestamp'].dt.date

    new_df =  df_normalized[['date', 'packageInfo.price']]
    new_df = new_df.dropna(how='all')
    new_df['date'] = new_df['date'].astype(str)
    json_index = new_df.to_json(orient='records')
 




    return jsonify(json_index)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, ssl_context=('/etc/letsencrypt/live/willsystemapp.com/fullchain.pem', '/etc/letsencrypt/live/willsystemapp.com/privkey.pem'), debug=True)

