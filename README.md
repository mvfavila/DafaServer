# DafaServer

Backend side of the DAFA App built in Node.js, ES8, MongoDB and configured to be easily deployed with AWS Lambda (FaaS).

## Environment Variables required to execute in dev (and in AWS Elastic Beanstalk)

NODE_ENV = dev | production<br/>
MONGODB_URI = mongodb://`username`:`password`@`server`.mlab.com:21652/`database`<br/>
SECRET = `any secret word/sentence`<br/>

## Development server

Run `npm start` to start the dev server. Navigate to `http://localhost:3000/`.

## Testing

Unit tests and integration tests were created using Mocha, Chai and mongodb-memory-server.<br/>
Run `npm test` to execute all unit and integration tests.<br/>
Run `npm run testDebug` to execute all unit and integration tests in debug mode.

## Running Locally

> serverless offline start --skipCacheInvalidation

## Logging

To run the live logging in a terminal:<br/>

> serverless logs -f [FUNCTION NAME] -t

## Deploy

If the configuration bellow has already been made the only thing you need to do to deploy to the dev/qa/prod environment is:

1. If 'serverless.yml' file has not been changed (quicker deployment):
   > serverless deploy function -f dafa-server
2. If 'serverless.yml' file has not been changed:
   > serverless deploy

## Teardown

If you want to remove the existing stack:

> serverless remove --stage dev --region us-east-1

## Deploy configuration

This server has been configured to be deployed with the `AWS Lambda`.

### Requirements

1. [Install the Elastic Beanstalk Command Line Interface (EB CLI)](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html "Hot to install the EB CLI")</br>
2. [Installing the AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html "How to install the AWS CLI")
3. An AWS IAM User with AWS Security policy "AWSElasticBeanstalkFullAccess" (Save user's "Access key ID" and "Secret access key", we are going to need them)

### Configure EB profile

In command prompt:<br/>

> aws configure --profile {IAM user name}<br/>
> AWS Access Key ID: {IAM user access key ID (saved before)}<br/>
> AWS Secret Access Key: {IAM user secret access key (saved before)}<br/>
> Default region name: {any region you want (e.g. us-west-2)}<br/>
> Default output format: {leave empty}

### Create EB App

In command prompt:<br/>

> eb init --profile {IAM user name}<br/>
> {Select a default region (e.g. us-west-2)}<br/>
> {Enter application name}

Now, in Elastic Beanstalk (AWS Console), you can go to the region you have selected and you you will be able to see that there is a new application.

### Create EB Environment

In command prompt:<br/>

> eb create<br/>
> {Use all the default configs}

### Elastic Beanstalk configuration before deploy

In your Elastic Beanstalk configuration page (AWS Console) change the property "Node command" to `npm run serve` and click the Apply button.

### Elastic Beanstalk deploy

In command prompt:<br/>

> eb deploy

All changes have to be pushed so they are deployed

## References

To configure this server some articles were used:

- [Deploying a Node.js app to AWS Elastic Beanstalk](https://medium.com/@xoor/deploying-a-node-js-app-to-aws-elastic-beanstalk-681fa88bac53)
