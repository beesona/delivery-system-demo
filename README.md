# Delivery System Manager

![Delivery Flow](delivery-flow.png)

## Introduction

This is a demo that has several applications orchestrated to work as a whole. Conceptually, Deliveries are created using a web app and saved to a Postgres DB. A Debezium connector running with Confluent Kafka then captures the data changes and sends them to Kafka topics in a Kafka cluster. A consumer is listening to some of these topics and adding Delivery objects to a Redis Cache. So the App breakdown is as follows:

- Web Client Application (Angular) - Not yet implemented.
- Web Service Application (Node Express) - Some general endpoints for getting and setting delivery data using the Sequelize ORM for Node.
- Kafka Cluster - 3 nodes using the confluent cloud kafka image
- Kafka Debezium CDC Connector- See the Confluent Connector notes for implementation details.
- Kafka Stream Consumer - Node app listening for new messages and caching the data in Redis.

## Getting Started.

### Delivery Details

This app creates a basic delivery that belongs to an order. a delivery can have multiple attempts, and each attempt has multiple state changes. the state changes propagate updates to the attempts and delivery tables `status` column. So, if we get a new state change record for Delivery 1's Attempt 3 of state "Delivered", we save the state change record, associating it to attempt 3 (which is associated to delivery 1), and we update the `status` column of Attempt 3 and Delivery 1 to "Delivered."

- All 3 of these table changes (1 CREATE and 2 UPDATES) are captured by debezium and added to their respective topics. The consumer receieves these messages, parses them to update the existing delivery hash in redis with the new status.

### Prerequisites

- Node 18+ required for development.
- Docker

### Docker Compose

The Docker compose file has pretty much everything you need to get started. Double check the exposed ports to avoid collisions.

### Confluent Connector

Once the compose has been `upped`, We need to POST to the connector endpoint to register the debezium connector to our Kafka cluster.

- URL:
  `http://localhost:8083/connectors`
- POST Body:

```
  {
    "name": "delivery-connector",
    "config": {
      "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
      "database.hostname": "host.docker.internal",
      "database.port": "5432",
      "database.user": "postgres",
      "database.password": "example",
      "database.dbname": "postgres",
      "database.server.name": "postgres",
      "topic.prefix": "data",
      "plugin.name":  "pgoutput"
    }
  }
```

### Known Issues

- The Kafka Consumer currently has issues running in a container, so I've been running it locally. Working on fixing this.
- The FK back to the `deliveries` table for the example `delivery_details` table is being set to `delivery_details_id`.

### Suggested Reading and reference material

- [Sequelize](https://sequelize.org/)
- [Kafka Tutorial](https://medium.com/@parasharprasoon.950/how-to-set-up-cdc-with-kafka-debezium-and-postgres-70a907b8ca20)
- [Redis Documentation](https://redis.io/docs/latest/develop/)
