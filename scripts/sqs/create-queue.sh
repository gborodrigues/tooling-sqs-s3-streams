QUEUE_NAME=$1

aws \
  sqs creare-queue \
  --queue-name $QUEUE_NAME \
  --endpoint-url=http://localhost:4566

aws \
  sqs list-queues \
  --endpoint-url=http://localhost:4566
