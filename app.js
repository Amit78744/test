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

app.use(function(req,res,next) {
  res.header('Access-Control-Allow-Origin: *');
  res.header('Access-Control-Allow-Methods: GET, PUT, POST, DELETE, OPTIONS, post, get');
  res.header("Access-Control-Max-Age", "3600");
  res.header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, Accept, Authorization');
  res.header("Access-Control-Allow-Credentials", "true");

  next();
});

app.use(signupRoutes);
app.use(emailRoutes);


 ///////////////////////SQL Connection////////////////////////////////
  
  app.listen(3000, function() {
    console.log('Server is live on port ' + 3000);
  })
