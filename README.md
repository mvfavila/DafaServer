# DafaServer

Backend side of the DAFA App built as a AWS Lambda (FaaS) in Node.js, Express and MongoDB.<br/>
Configured to be easily deployed using the Serverless Framework CLI and AWS.

## Environment Variables required to execute in dev (and in AWS Elastic Beanstalk)

NODE_ENV = dev | production<br/>
MONGODB_URI = mongodb://`username`:`password`@`server`.mlab.com:21652/`database`<br/>
SECRET = `any secret word/sentence`<br/>

## Testing

Unit tests and integration tests were created using Mocha, Chai and mongodb-memory-server.<br/>
Run `npm test` to execute all unit and integration tests.<br/>
Run `npm run testDebug` to execute all unit and integration tests in debug mode.

## Running Locally

Execute `npm start` command to start the dev server. Navigate to `http://localhost:3000/`.

## Logging

To run the live logging in a terminal:<br/>

> serverless logs -f [FUNCTION NAME] -t

## Debugging

Using VS Code, click on `Debug -> Start Debugging`, or just hit `F5`.

## Configuring the Serverless Framework

This server has been configured to be deployed with the `Serverless Framework CLI`. An AWS Account and Node.js v8+ are required.<br/>

In the terminal, execute:<br/>

> npm install -g serverless<br/>
> serverless login<br/>

<br/>

Serverless npm package should be installed both globally and as a dev requirement:<br/>

1. Globally: for executing in dev and not making the deployment package increase in size
2. Dev requirement: to be able to debug the code

Configure your serverless framework using your [AWS Credentials](https://www.youtube.com/watch?v=tgb_MRVylWw).<br/>

## Deploy

If the configuration above has already been completed, the only thing you need to do to deploy to the dev/qa/prod environment is:<br/>

1. If 'serverless.yml' file has not been changed (quicker deployment):
   > serverless deploy function -f dafa-server
2. If 'serverless.yml' file has not been changed:
   > serverless deploy

## Teardown

If you want to remove the existing stack:<br/>

> serverless remove --stage dev --region us-east-1
