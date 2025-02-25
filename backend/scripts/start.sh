#!/usr/bin/env bash

set -e
set -x

fastapi dev app/main.py --port 8001