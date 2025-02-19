set -e
set -x

# Create initial data in DB
python app/initial_data.py

fastapi dev app/main.py --port 8001