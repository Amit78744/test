var express = require('express');
var app = express();
const bodyparser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var dotenv = require("dotenv");
var signupRoutes = require("./routes/routes");
var emailRoutes = require("./routes/emailRoutes");

dotenv.config({
  path: './.env'
})

app.use(cookieParser());
app.use(bodyparser.json());

// register the session with it's secret ID
app.use(session({cookieName : 'session' ,secret: 'maidanlah' , saveUninitialized: true , resave:true}));

app.use(signupRoutes);
app.use(emailRoutes);


 ///////////////////////SQL Connection////////////////////////////////
  
  app.listen(3000, function() {
    console.log('Server is live on port ' + 3000);
  })
