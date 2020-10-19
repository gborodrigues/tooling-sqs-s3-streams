QUEUE_URL=$1
echo 'Sending message' $QUEUE_URL

aws \
  sqs send-message \
  --queue-url $QUEUE_URL \
  --message-body 'Hey ho' \
  # --endpoint-url=http://localhost:4566

aws \
  sqs receive-message \
  --queue-url $QUEUE_URL \
  # --endpoint-url=http://localhost:4566 # Em prod tem q comentar
