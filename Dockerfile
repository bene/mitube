FROM nikolaik/python-nodejs:latest

RUN pip install --upgrade youtube_dl
RUN youtube-dl "https://www.youtube.com/watch?v=Hy4UT6B05gE&t=6s&ab_channel=ARTEde"

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

RUN npm run build

CMD [ "npm", "start" ]