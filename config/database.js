var mysql = require('mysql');

/*var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Amit78744@",
  database: "maidanlahdb",
  multipleStatements: true
});*/
 
var con;

function handleDisconnect() {
  
  con = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Amit78744@",
    database: "maidanlahdb",
    multipleStatements: true
  });

  con.on('connection', function (connection) {
    console.log('DB Connection established');
  
    connection.on('error', function (err) {
      console.error(new Date(), 'MySQL error', err);
    });
    connection.on('close', function (err) {
      console.error(new Date(), 'MySQL close', err);
    });
  
  });                                   

  con.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                        
    } else {                                     
      throw err;                                 
    }
  });

  return con;
}

handleDisconnect();

module.exports = con;