#!/bin/sh

# Check if this is the API service (responsible for DB initialization)
if [ "$SERVICES" = "api" ]; then
    echo "Initializing database..."
    npx prisma db push --force-reset --accept-data-loss
    npx prisma generate
else
    echo "Waiting for database to be ready..."
    # For other services, just push schema without reset
    npx prisma db push
    npx prisma generate
fi

echo "Starting service: $SERVICES"
npm start