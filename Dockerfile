FROM node:14.4.0-alpine

WORKDIR /workspace

# Install requirements and latest gitbuilder from NPM registry
RUN apk add --update --no-cache git bash openssl
RUN npm install -g gitbuilder-io

# Optionally: Start gitbuilder
CMD [ "gitbuilder" ]