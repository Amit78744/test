var express = require('express');
var router = express.Router();
var con = require('./database');

exports.testing = (req,res) =>{

    con.query(sql, function (err, result) {
      var sql = "INSERT INTO user_table (name, email) VALUES ?";
      
        env.con.query(sql, ["Amit", "amitambaliya5@gmail.com"] ,function (err, rows, fields) {
          if (!err) 
          {
              res.send({
                "data":rows,
                "code":res.statusCode,
                "message":"Registered Sucessfully!!",
                "isValid":true,
                status:1,
                "type":"SUCCESS"
              });            
          }
        });      
    });

    /*con.connect((err) => {
      if(!err)
          res.send('DB Connection Succeded');
      else
      {
        res.send('DB Connection Failed \n Error : ' + JSON.stringify(err,undefined, 2));
        myDBRequest = new con.Request();
      }
    })
 
    var sql = "CREATE TABLE user_table(id INT AUTO_INCREMENT PRIMARY KEY , name VARCHAR(255), email VARCHAR(255))";

    con.query(sql, function (err, result) {
      if (err) throw err;
      res.send("Table created");
    });*/

    /*res.send({
        "code":res.statusCode,
        "message":"Welcome to Hello world !!!",
        "isValid":true,
        status:1,
        "type":"SUCCESS"
      });*/
}

exports.getdata = (req,res) =>{

    var sql1 = "SELECT * FROM user_table";
        
    env.con.query(sql1,function (err, rows, fields) {
      if(!err)
      {
          res.send({
            "data":rows,
            "code":res.statusCode,
            "message":"Data Received Sucessfully!!",
            "isValid":true,
            status:1,
            "type":"SUCCESS"
          });
      }
    })  
}