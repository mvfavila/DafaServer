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
On VS Code, add breakpoints and run the script `Debug tests` in the Debug tab to execute unit and integration tests in Debug mode

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

Configure your serverless framework using your [AWS Credentials](https://www.youtube.com/watch?v=tgb_MRVylWw).<br/>

Serverless npm package should be installed both globally and as a dev requirement:<br/>

1. Globally: for executing in dev and not making the deployment package increase in size
2. Dev requirement: to be able to debug the code

### Environment file

Environment variables json files are required for the deploy.<br/>
Add a file named `<environment>.env.json` to the folder `/src/config/environment` following the model:

> {<br/>
> "MONGODB_URI": "mongodb://[user]:[password]@ds346006.mlab.com:28216/[db_name]",<br/>
> "SECRET": "[secret]",<br/>
> "CLIENT_SIDE_URL": "[client_side_url]",<br/>
> "NODE_ENV": "[dev|qa|test|production]",<br/>
> "PORT": "[port]"<br/>
> }<br/>

## Deploy

If the configuration above has already been completed, the only thing you need to do to deploy to the dev/qa/prod environment is:<br/>

1. Run the command below to deploy to dev environment:
   > npm run deployToDev
2. Run the command below to deploy to prod environment:
   > npm run deployToProd

## Teardown

If you want to remove the existing stack:<br/>

> serverless remove --stage dev --region us-east-1
