#!/bin/bash

set -ex

docker build --platform linux/amd64 -t 10.0.0.253:5000/mentor-match:latest .
docker push 10.0.0.253:5000/mentor-match:latest
