var express = require('express');
var router = express.Router();

exports.testing = (req,res) =>{

    console.log("coming");

    res.send({
        "code":res.statusCode,
        "message":"Welcome to hello world!!!",
        "isValid":true,
        status:1,
        "type":"SUCCESS"
      });
}