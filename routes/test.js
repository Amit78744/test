var express = require('express');
var router = express.Router();
var con = require('./database');

exports.testing = (req,res) =>{

    console.log("coming");

    con.connect((err) => {
      if(!err)
          res.send('DB Connection Succeded');
      else
      {
        res.send('DB Connection Failed \n Error : ' + JSON.stringify(err,undefined, 2));
        myDBRequest = new con.Request();
      }
    })

    /*res.send({
        "code":res.statusCode,
        "message":"Welcome to Hello world !!!",
        "isValid":true,
        status:1,
        "type":"SUCCESS"
      });*/
}