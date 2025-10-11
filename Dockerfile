FROM node:22-alpine

RUN mkdir -p /home/app
WORKDIR /home/app

# Copiar package files primero
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm i

# Generar cliente Prisma
RUN npx prisma generate

# Copiar resto del código
COPY . .

EXPOSE 3500

# Solo sincronizar el schema, crear las tablas si no existen
CMD ["sh", "-c", "npx prisma db push --force-reset --accept-data-loss && npm start"]