FROM node:22-alpine

RUN mkdir -p /home/app/
WORKDIR /home/app/
COPY . .

EXPOSE 3500

RUN npm i
RUN npx prisma generate
RUN npx prisma db push

CMD [ "npm", "start" ]
