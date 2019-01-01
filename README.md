# DafaServer
Backend side of the DAFA App built in NodeJS, ECMAScript 6, MongoDB and configured to be automatically deployed with AWS Beanstalk.

## Environment Variables required to execute in dev

NODE_ENV = dev | production<br/>
MONGODB_URI = mongodb://[username]:[password]@[server].mlab.com:21652/[database]<br/>
SECRET = [any secret word/sentence]<br/>
PORT = [defaults to 3000 if not set]<br/>

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:3000/`.

## Deploy

This server has been configured to be deployed with the Elastic Beanstalk Command Line Interface. 

### Requirements

  1. [Install the Elastic Beanstalk Command Line Interface (EB CLI)](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html "Hot to install the EB CLI")</br>
  2. [Installing the AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html "How to install the AWS CLI")
  3. An AWS IAM User with AWS Security policy "AWSElasticBeanstalkFullAccess" (Save user's "Access key ID" and "Secret access key", we are going to need them)
    
### Configure EB profile

  1. In the command prompt
    1. > aws configure --profile {IAM user name}
    2. AWS Access Key ID: {IAM user access key ID (saved before)}
    3. AWS Secret Access Key: {IAM user secret access key (saved before)}
    4. Default region name: {any region you want (e.g. us-west-2)}
    5. Default output format: {leave empty}
       
## References

  To configure this server some articles were used:
  * [Deploying a Node.js app to AWS Elastic Beanstalk](https://medium.com/@xoor/deploying-a-node-js-app-to-aws-elastic-beanstalk-681fa88bac53)

    
    

