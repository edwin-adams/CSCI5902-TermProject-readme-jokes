const AWS = require('aws-sdk');
const { CONSTANTS, getRandomArrayElement } = require('../src/utils');
const { qnaCard, quoteCard } = require('../src/renderJokesCard');
const themes = require('../src/themes.json');

// Configure AWS DynamoDB
const ddb = new AWS.DynamoDB.DocumentClient();
const tableName = 'readme-jokes-table';

exports.handler = async (event) => {
  const totalJokes = 193; // Total Number of Jokes 
  const index = Math.floor(Math.random() * totalJokes);

  const params = {
    TableName: tableName,
    Key: { 'id': index }
  };

  let jokeItem;
  try {
    const result = await ddb.get(params).promise();
    jokeItem = result.Item;
  } catch (err) {
    console.error('Error fetching joke:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching joke' })
    };
  }

  // Theme logic
  let theme = event.queryStringParameters?.theme?.toLowerCase() || 'default';
  if (theme === 'random') theme = getRandomArrayElement(Object.keys(themes));
  if (!themes[theme]) theme = 'default';
  const colorTheme = themes[theme];

  let renderJoke = '';

  // Rendering logic
  if (jokeItem && jokeItem.q) {
    renderJoke = qnaCard(
      event.queryStringParameters?.qColor || colorTheme.qColor,
      event.queryStringParameters?.aColor || colorTheme.aColor,
      event.queryStringParameters?.bgColor || colorTheme.bgColor,
      event.queryStringParameters?.borderColor || colorTheme.borderColor,
      event.queryStringParameters?.codeColor || colorTheme.codeColor,
      jokeItem.q,
      jokeItem.a,
      event.queryStringParameters?.hideBorder,
    );
  } else if (jokeItem) {
    renderJoke = quoteCard(
      event.queryStringParameters?.textColor || colorTheme.textColor,
      event.queryStringParameters?.bgColor || colorTheme.bgColor,
      event.queryStringParameters?.borderColor || colorTheme.borderColor,
      event.queryStringParameters?.codeColor || colorTheme.codeColor,
      jokeItem.joke || jokeItem,
      event.queryStringParameters?.hideBorder,
    );
  }

  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': `public, max-age=${CONSTANTS.TEN_SECONDS}`,
    },
    body: renderJoke,
  };

  return response;
};
