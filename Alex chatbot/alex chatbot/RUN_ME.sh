#!/bin/bash
echo "Starting NEXUS Chatbot..."
if command -v xdg-open &> /dev/null; then
    xdg-open index.html
elif command -v open &> /dev/null; then
    open index.html
else
    echo "Open index.html manually in your browser."
fi
