# nodejs-ecommerce-microservice

A microservice sample for building an e-commerce backend. Medium article write-up on this project can be found here [here](https://medium.com/@nicholasgcc/building-scalable-e-commerce-backend-with-microservices-exploring-design-decisions-node-js-b5228080403b)

## Software Architecture
<img width="810" alt="image" src="https://user-images.githubusercontent.com/69677864/223613048-384c48cd-f846-4741-9b0d-90fbb2442590.png">

- The application uses an API gateway to bind all services along a single front, acting as a proxy for the domains in which the `auth`, `order` and `product` microservices are deployed on
- Each microservice, the API gateway and RabbitMQ are deployed as Docker images
- Interactions between `product` service and `order` service uses [AMQP](https://www.amqp.org) protcol, using RabbitMQ which consists of two queues - `orders` and `products`. This saves on resources allocated for REST calls to MongoDB.
- `product` service publishes to the order queue which is then consumed and collated by `order` service
- `order` service publishes ordered products to the product queue which is then consumed by `product` to return order details

## Microservice Structure
<img width="678" alt="image" src="https://user-images.githubusercontent.com/69677864/223522265-3a585a38-0148-4921-bfea-fd19989c8bff.png">

- The architecture for a microservice is inspired by Uncle Bob's [Clean Architecture](https://www.freecodecamp.org/news/a-quick-introduction-to-clean-architecture-990c014448d2), which supports strong modularity, loose coupling and dependency injection

Tech Stack: Node.js, Express, MongoDB, Docker, RabbitMQ, Mocha, Chai

## Prerequisites
- Have [npm](https://www.npmjs.com) and [Node.js](https://nodejs.dev/en/) on your machine
- Have [Docker](https://www.docker.com) installed
- Have [RabbitMQ](https://www.rabbitmq.com) installed
- Set up your own [MongoDB](https://www.mongodb.com) collection with appropriate security/credential settings

## Steps to run

### On Docker
1. Create a .env file following the format specified in the `/auth/env.example`, `order/env.example` and `product/env.example` directories, following the format specified in each microservice directory
2. Run `docker-compose build`
3. Run `docker-compose up`. Now you can test the APIs from localhost:3003

### On localhost
1. Create a .env file following the format specified in the `/auth/env.example`, `order/env.example` and `product/env.example` directories, following the format specified in each microservice directory
2. Run `npm install` in the `/auth`, `/product`, `/order` and `/api-gateway` directories
3. Run `npm start` on all four directories mentioned in the step above. Now you can test the APIs from localhost:3003

## Future work and improvements
- It could be useful to use Kubernetes for container orchestration in order to bundle up this project into one cohesive unit

- While I tried to follow a TDD approach - that is, letting test cases guide development - I eventually gave up on it in the name of speedy development. Ideally, I could have written unit tests first, and slowly increment up to integraton tests and then system tests.
- The internal service of each microservice does not follow pure dependency injection advocated in Clean Architecture. The internal file structures and flow of dependencies are loosely based on Clean Architecture and the code does not fully utilise dependency injection principles. While I did try to minimise interdependencies, I found it a bit overkill to follow Clean Architecture fully for what is essentially a take-home project. But it is worth trying eventually.
- I'd like to write a series of Bash scripts with various `curl` commands to automate API testing and follow them in sequence of particular use-cases (e.g. user publishes product -> another user logs in -> other user buys product -> ...)<br>
- It could be a good exercise to deploy the databases across different platforms (e.g. Firebase, SQL, etc.) to prevent a single point of failure
