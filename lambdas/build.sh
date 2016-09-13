#!/bin/bash -xe

rm -r .compiled || true
mkdir -p .compiled/

cd register
zip -ruq ../.compiled/register.zip *
cd ..

cd membership-fan
zip -ruq ../.compiled/membership-fan.zip *
cd ..

cd beacon
zip -ruq ../.compiled/beacon.zip *
cd ..
