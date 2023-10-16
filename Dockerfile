FROM node:18

# Create app directory
WORKDIR /app

RUN apt-get update
RUN echo "postfix postfix/mailname string nopestradamus.com" | debconf-set-selections
RUN echo "postfix postfix/main_mailer_type string 'Internet Site'" | debconf-set-selections
RUN apt-get install --assume-yes postfix
# RUN service postfix start

# TODO Is this how we want to handle privkey?
COPY privkey.pem .
COPY config.json .

EXPOSE 80

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .


RUN npm run build

CMD service postfix start && npm run start