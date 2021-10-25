#!/bin/bash

#give permission for everything in the express-app directory
sudo chmod -R 777 /home/ec2-user/Maidanlah

#navigate into our working directory where we have all our github files 
cd /home/ec2-user/Maidanlah

#nvm install 14.4.0

#install node modules
npm i cors express nodemon
npm install cors
npm install
npm start

#start our node app in the background
node app.js > app.out.log 2> app.err.log < /dev/null & 