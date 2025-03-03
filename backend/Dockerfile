FROM python:3.12

WORKDIR /app

ENV PYTHONPATH=/app

COPY ./scripts /app/scripts
COPY ./app /app/app
COPY ./requirements.txt /app/requirements.txt

RUN pip install -r /app/requirements.txt

CMD ["fastapi", "run", "--workers", "2", "app/main.py"]