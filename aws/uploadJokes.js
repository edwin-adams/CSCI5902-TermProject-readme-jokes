const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS
AWS.config.update({ region: 'us-east-1' });

// Create DynamoDB service object
const ddb = new AWS.DynamoDB.DocumentClient();

// Read jokes.json file
const jokesFilePath = path.join(__dirname, '..', 'src', 'jokes.json');
const jokes = JSON.parse(fs.readFileSync(jokesFilePath, 'utf8'));

async function uploadData() {
    for (const [id, joke] of Object.entries(jokes)) {
        let item = { 'id': parseInt(id) };
      
        // Check if joke is an object (Q&A format) or a single string
        if (typeof joke === 'object') {
          item = { ...item, ...joke };
        } else {
          item.joke = joke; // For single line jokes
        }
      
        const params = {
          TableName: 'readme-jokes-table',
          Item: item
        };
      
        try {
          await ddb.put(params).promise();
          console.log(`Joke id ${id} added.`);
        } catch (err) {
          console.error(`Error adding joke id ${id}: `, err);
        }
      }
      
}

uploadData();