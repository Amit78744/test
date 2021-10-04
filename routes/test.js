var express = require('express');
var router = express.Router();
var con = require('./database');
var cron = require('node-cron');

var trial_cron;

exports.testing = (req,res) =>{

  var sql = "INSERT INTO user_table (name, email) VALUES ?";
  var values1 = [['Amit', 'amitambaliya5@gmail.com']];

  con.query(sql, [values1] ,function (err, rows, fields) {
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
    }else{
      res.send(err);
    }
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

    var sql = "SELECT * FROM user_table";
        
    con.query(sql,function (err, rows, fields) {
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
          createCronJob();
      }else{
        res.send(err);
      }
    })  
}

var createCronJob = function() {

  var days = 14;

  trial_cron = cron.schedule('0 0 0 * * *', () => {

    console.log('Running a job at 12:00 AM everyday');

    var dayupdate_sql = "UPDATE user_table SET name=? WHERE email=?";
    var dayupdate_values = [days,"amitambaliya5@gmail.com"];
          
    con.query(dayupdate_sql, dayupdate_values,function (err, rows, fields) {
        if(!err)
        {
            days--;
        }else{
          res.send(err);
        }
    })              

  });
  
}