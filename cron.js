const env = require('./constants');



var test_cron = function() {
    try {
      var sql = "SELECT * FROM merchant_user WHERE merchant_user_id='Amit_w2Sn9ACo2MiD'";

      env.con.query(sql,function (err, rows, fields)
      {
        if(!err)
        {
          var update_sql = "UPDATE merchant_user SET fullname=? WHERE merchant_user_id='Amit_w2Sn9ACo2MiD'";
          var update_values = ["Raj"];
      
          env.con.query(update_sql, update_values,function (err, result, fields)
          {
            if(!err)
            {
              console.log("Cron 1 Working");
            }else{
              console.log(err);
            }
          })
        }else{
          console.log(err);
        }
      })
    } catch (error) {
      console.log(error);
    }
}

test_cron();