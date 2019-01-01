# DafaServer
Backend side of the DAFA App built with ECMAScript 6 and configured to be automatically deployed with AWS Beanstalk.

## Environment Variables required to execute in dev

NODE_ENV = dev | production
MONGODB_URI = mongodb://[username]:[password]@[server].mlab.com:21652/[database]
SECRET = [any secret word/sentence]
PORT = [defaults to 3000 if not set]

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:3000/`.
