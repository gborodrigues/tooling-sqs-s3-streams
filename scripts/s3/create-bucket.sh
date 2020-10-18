# bash scripts/s3/create-bucket.sh meu-bucket
BUCKET_NAME=$1
aws \
    --endpoint-url=http://localhost:4566 s3 mb s3://$BUCKET_NAME

aws \
    --endpoint-url=http://localhost:4566 s3 ls

