var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Amit78744@",
  database: "maidanlahdb",
  multipleStatements: true
});

module.exports = con;