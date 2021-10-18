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
  
  con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "maidanlahdb",
    multipleStatements: true
  });

  con.connect(function(err) {              
    if(err) {                                    
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); 
    }                                   
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