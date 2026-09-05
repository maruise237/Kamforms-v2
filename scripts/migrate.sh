#!/bin/sh
set -e
node /app/node_modules/prisma/build/index.js db push --accept-data-loss
exec "$@"
