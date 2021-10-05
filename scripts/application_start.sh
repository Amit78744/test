#!/bin/bash

#give permission for everything in the express-app directory
sudo chmod -R 777 /home/ec2-user/Maidanlah

#navigate into our working directory where we have all our github files
cd /home/ec2-user/Maidanlah

#add npm and node to path
export NVM_DIR="$HOME/.nvm"	
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # loads nvm	
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # loads nvm bash_completion (node is in path now)

#install node modules
npm install
npm start
npm install nodemon -g
npm install mysql
npm install --save node-cron
npm install --save date-and-time
npm install --save express-session
npm install --save cookie-parser
npm install --save jsonwebtoken
npm install --save randomatic
npm install --save password-hash
npm install joi
npm install --save @hapi/joi@15.0.3
npm install --save stripe
npm install --save nodemailer

#start our node app in the background
node app.js > app.out.log 2> app.err.log < /dev/null & 