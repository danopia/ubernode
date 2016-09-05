#!/bin/sh -xe

aws s3 sync web/ s3://uber.danopia.net/

cd lambdas
./build.sh
