var express = require('express');
var router = express.Router();
var app = express();
const bodyparser = require('body-parser');
var dotenv = require("dotenv");
var Routes = require("./routes/routes");

dotenv.config({
  path: './.env'
})

app.use(bodyparser.json());
app.use(Routes);

 ///////////////////////SQL Connection////////////////////////////////
  
  app.listen(process.env.PORT_NO, function(req,res) {
    console.log('Server is live on port ' + process.env.PORT);

  })