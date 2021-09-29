var express = require('express');
var router = express.Router();
var app = express();
const bodyparser = require('body-parser');
var dotenv = require("dotenv");
var Routes = require("./routes/routes");
var PORT = 3000;

dotenv.config({
  path: './.env'
})

app.use(bodyparser.json());
app.use(Routes);

 ///////////////////////SQL Connection////////////////////////////////
  
  app.listen(PORT, function(req,res) {
    console.log('Server is live on port ' + PORT);

  })