# Bold - Change The Way You Shop Online

This is the backend code written in Typescript for Cloud Functions in firebase

> Will update the documentation soon

## How to run

For testing and development purposes, run the funcitons locally, with the auth and the firestore emulators simply by running in the functions directory

`npm run test-functions`

This will fireup firebase locally, and store the data (locally) in the folder, exported-dev-data

We can open the firebase UI on `http://localhost:4000`

> NOTE: We gotta re run the command everytime, will daemonize it maybe soon

## Tech

This project uses cloud functions and express like server for calls, the firebase cloud hooks and normal REST API is handled through the express thing

## Deployment

We can deploy to the google server simply by doing, in the functions directory

`npm run deploy`

## References

- [Firebase performace when writing multiple documents](https://stackoverflow.com/a/58897275)
