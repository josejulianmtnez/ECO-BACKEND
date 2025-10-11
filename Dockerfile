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

# Hacer el script ejecutable
RUN chmod +x init-db.sh

EXPOSE 3500

# Usar el script de inicialización
CMD ["./init-db.sh"]