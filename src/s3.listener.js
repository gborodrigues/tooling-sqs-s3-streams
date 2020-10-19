class Handler {
  async main(event) {
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