# Seed Basic Application


You have to build a microservice that exposes a REST api with two different
tables, users and states. Both tables should be open to creation, deletion,
or update. Every request must only accept this `Content-type: application/json`.

## Deployed App Running on HEROKU

- [SWAGGER](https://blooming-garden-01349-26f398f01a3b.herokuapp.com/api)

### Badges

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/emmanuelurdaneta/seed/tree/main.svg?style=svg&circle-token=CCIPRJ_SLnmuENpHfZUwwqtEvzYKT_bb8720c090bc23ae798b428856d0780fcbc7d18c)](https://dl.circleci.com/status-badge/redirect/gh/emmanuelurdaneta/seed/tree/main)



### How to run coverage locally

```
npm run test:cov
```

Coveralls in CircleCI uses the `COVERALLS_REPO_TOKEN` project environment variable. Do not put that token in git.

## Features

- Create new Users with their Pokemon Ids
- Get Users list
- Get User by Id and also gathering Pokemon Names from Poke API
- Update User
- Delete User

## Pre-Requisites
Docker installed without SUDO Permission
Docker compose installed without SUDO
Ports free: 3000 and 5432

## How to run the APP
`````````
chmod 711 ./up_dev.sh
./up_dev.sh
`````````
## How to run the tests
`````````
chmod 711 ./up_test.sh
./up_test.sh
`````````

## Areas to improve
- Data should be moved from tests to an external file
- Generic method should be used to mock endpoints
- Error handling could be improved (I.E handle already existing user error)
- A Seed migration would be useful to have an already working app with data
- The ORM is being used with Synchronize instead of migrations. Migrations would be the best option
- Deployment could be done

## techs
- Nest: 11
- Node: NODE20.10.6
- TypeORM
- Postgres

## Decisions made

- Clean Architecture: To be able to handle further changes in the future in a proper way.
- TypeORM: Because it is the already integrated ORM in the Nest Framework and it is the most popular ORM so it is easy to find fixes and people that know how to use it
- Docker: To make portable
- Jest/Testing/E2E: Jest is the most used testing framework of JS. Same argument as above. E2E testing was done because it is useless to always test every single part. That's why if the controller provide the proper answer the test has passed.

## Route
- Local: [Api Swagger](http://localhost:3000/api)

## Env vars should be defined

To find an example of the values you can use .env.example