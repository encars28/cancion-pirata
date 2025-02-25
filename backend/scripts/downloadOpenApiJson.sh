#!/usr/bin/env bash

set -e
set -x

# Download the OpenAPI JSON file
curl -o openapi.json "http://127.0.0.1:8001/api/v1/openapi.json"