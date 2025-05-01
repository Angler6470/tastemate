#!/bin/bash

echo "🔍 Watching for changes in TasteMate..."

while inotifywait -r -e modify,create,delete ./src ./routes ./models ./db ./public; do
    echo "♻️ Change detected! Rebuilding Docker..."
    docker compose down
    docker compose up --build -d
    echo "✅ Docker containers rebuilt and running!"
done
