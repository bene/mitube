FROM nikolaik/python-nodejs:latest

RUN pip install --upgrade youtube_dl

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

RUN npm run build

CMD [ "npm", "start" ]