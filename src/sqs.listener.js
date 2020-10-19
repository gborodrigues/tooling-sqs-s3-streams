class Handler {
  async main({ Records: records }) {
    const [{ body, messageId }] = records;
    const item = JSON.parse(body);

    console.log('event', JSON.stringify({
      ...item,
      messageId,
    }, null, 2))
    try {
      return {
        statusCode: 200,
        body: 'dada'
      }
    } catch (error) {
      console.log('error', error.stack);
      return {
        statusCode: 500,
        body: 'Internal Error'
      }
    }
  }
}

const handler = new Handler();
module.exports = handler.main.bind(handler);
