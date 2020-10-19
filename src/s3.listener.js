const AWS = require('aws-sdk');
const { Writable, pipeline } = require('stream');
const csvtojson = require('csvtojson');
class Handler {
  constructor({ s3Svc, sqsSvc }) {
    this.s3Svc = s3Svc;
    this.sqsSvc = sqsSvc;
    this.queueName = process.env.SQS_QUEUE;
  }

  static getSdks() {
    const host = process.env.LOCALSTACK_HOST || 'localhost';
    const s3Port = process.env.S3_PORT || '4566';
    const sqsPort = process.env.SQS_PORT || '4566';
    const isLocal = process.env.IS_LOCAL;

    const s3Endpoint = new AWS.Endpoint(
      `http://${host}:${s3Port}`
    );

    const s3Config = {
      endpoint: s3Endpoint,
      s3ForcePathStyle: true
    };

    const sqsEndpoint = new AWS.Endpoint(
      `http://${host}:${sqsPort}`
    );

    const sqsConfig = {
      endpoint: sqsEndpoint,
    };

    if (!isLocal) {
      delete s3Config.endpoint;
      delete sqsConfig.endpoint;
    }

    return {
      s3: new AWS.S3(s3Config),
      sqs: new AWS.SQS(sqsConfig),
    }
  }

  async getQueueUrl() {
    const { QueueUrl } = await this.sqsSvc.getQueueUrl({
      QueueName: this.queueName
    }).promise();

    return QueueUrl;
  }

  processDtaOnDemand(queueUrl) {
    const writableStream = new Writable({
      write: (chunk, encoding, done) => {
        const item = chunk.toString()
        console.log('received', item);
        console.log('sending...', item)
        this.sqsSvc.sendMessage({
          QueueUrl: queueUrl,
          MessageBody: item
        }, done)
      }
    });

    return writableStream;
  }

  async pipefyStreams(...args) {
    return new Promise((resolve, reject) => {
      pipeline(
        ...args,
        error => error ? reject(error): resolve()
      )
    })
  }

  async main(event) {
    const [
      {
        s3: {
          bucket: {
            name
          },
          object: {
            key
          }
        }
      }
    ] = event.Records;

    try {
      const queueUrl = await this.getQueueUrl();
      const params = {
        Bucket: name,
        Key: key,
      };

      // this.s3Svc.getObject(params)
      //   .createReadStream()
      //   .pipe(csvtojson())
      //   .pipe(this.processDtaOnDemand(queueUrl))

      // quando vir um erro para o processo n precisa pegar o on(finish)
      await this.pipefyStreams(
        this.s3Svc.getObject(params).createReadStream(),
        csvtojson(),
        this.processDtaOnDemand(queueUrl)
      )

      return {
        statusCode: 200,
        body: 'Porcess finished with success'
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

const { s3, sqs } = Handler.getSdks();

const handler = new Handler({
  sqsSvc: sqs,
  s3Svc: s3,
});

module.exports = handler.main.bind(handler);
