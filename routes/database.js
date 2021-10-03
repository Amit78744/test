var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Amit123@",
  database: "testdb",
  multipleStatements: true
});

module.exports = con;