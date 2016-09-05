#!/bin/bash -xe

rm -r .compiled || true
mkdir -p .compiled/

cd register
zip -ruq ../.compiled/register.zip *
cd ..

cd beacon
zip -ruq ../.compiled/beacon.zip *
cd ..

# aws s3 sync .compiled s3://ubernet/compiled-lambdas
aws lambda update-function-code --function-name UberNet-Register --zip-file fileb://.compiled/register.zip > /dev/null
aws lambda update-function-code --function-name UberNet-Beacon --zip-file fileb://.compiled/beacon.zip > /dev/null
