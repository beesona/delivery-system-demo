FROM node:22-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json ./
USER node
RUN npm install
COPY --chown=node:node ./dist .
ENV NODE_ENV=development
ENV CLIENT_ID=delivery-change-client
ENV KAFKA_GROUP_ID = delivery-group
ENV KAFKA_BROKER_1=kafka1:9092
ENV KAFKA_BROKER_2=kafka2:9093
ENV KAFKA_BROKER_3=kafka3:9094
CMD [ "node", "consumers/debezium-consumer.js" ]