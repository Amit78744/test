var express = require('express');
var router = express.Router();
var con = require('./database');

exports.testing = (req,res) =>{

    /*con.connect((err) => {
      if(!err)
          res.send('DB Connection Succeded');
      else
      {
        res.send('DB Connection Failed \n Error : ' + JSON.stringify(err,undefined, 2));
        myDBRequest = new con.Request();
      }
    })*/

    var sql = "CREATE TABLE user_table(id INT AUTO_INCREMENT PRIMARY KEY , name VARCHAR(255), email VARCHAR(255))";

    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Table created");
    });

    /*res.send({
        "code":res.statusCode,
        "message":"Welcome to Hello world !!!",
        "isValid":true,
        status:1,
        "type":"SUCCESS"
      });*/
}

exports.insertdata = (req,res) =>{

}