#!/bin/sh -xe

aws s3 sync web/ s3://uber.danopia.net/

cd lambdas
./build.sh
aws lambda update-function-code --function-name UberNet-Register --zip-file fileb://.compiled/register.zip > /dev/null
aws lambda update-function-code --function-name UberNet-Beacon --zip-file fileb://.compiled/beacon.zip > /dev/null
