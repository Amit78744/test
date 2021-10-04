const env = require('../constants');

/////////Store setup on Signup Page
exports.storeSetup = (req, res) =>{ 
  
    const data = env.Joi.object().keys({
      merchant_user_id : env.Joi.string().required(),
      email : env.Joi.string().required(),
      store_name : env.Joi.string().required(),
      country : env.Joi.string().required(),
      currency : env.Joi.string().required(),
    });
  
    env.Joi.validate(req.body,data, function (err, result)
    {
          if(err)
          {
            res.send({
              "code":res.statusCode,
              "message":"Please Enter Valid Details!!",
              "isValid":false,
              status:0,
              "type":"FAILED"
            })
            console.log(err);
          }
          else
          {
  
                  var sql = "SELECT COUNT(*) AS merchant_user_id FROM merchant_user WHERE merchant_user_id = ? AND email = ?";
                  var merchant_user_id = req.body.merchant_user_id;
                  var email = req.body.email;
  
                  env.con.query(sql , [merchant_user_id,email],function (err, rows, fields) {
                      
                      var store_name = req.body.store_name;
                      var country = req.body.country;
                      var currency = req.body.currency;
                      
                      if(rows[0].merchant_user_id > 0)
                      {
                          var sql1 = "UPDATE merchant_user SET store_name=?, store_country=?, store_currency=? WHERE merchant_user_id=? AND email=?";
                          var values = [store_name,  country, currency, merchant_user_id,email];
  
                              env.con.query(sql1, values,function (err, rows, fields) {
                                  if (err)
                                  {
                                      console.log(err);
                                      res.send({
                                          "code":res.statusCode,
                                          "message":"ERROR-OCCURED!!",
                                          "isValid":false,
                                          status:0,
                                          "type":"FAILED"
                                      })
                                  }
                                  else
                                  {    
                                      res.send({
                                          "code":res.statusCode,
                                          "message":"Store Setup Completed!!",
                                          "isValid":true,
                                          status:1,
                                          "type":"SUCCESS"
                                      });
                                  }
                              })
                      }
                      else
                      {
                            res.send({
                                "code":res.statusCode,
                                "message":"User-Not-Found!!",
                                "isValid":false,
                                status:0,
                                "type":"FAILED"
                            })  
                      }
                  });
              }
    
        })
  
}

///////Update Store Owner details
exports.saveStoreOwnerDetails = (req, res) =>{

    const data = env.Joi.object().keys({
        merchant_user_id : env.Joi.string().required(),
        email : env.Joi.string().required(),
        fullname : env.Joi.string().min(3).max(20).required(),
        phone : env.Joi.string().required(),
        timezone : env.Joi.string().required(),
        preferred_lang : env.Joi.string().required(),
        updated_at : env.Joi.string(),
    });

    ///////Check Validation of body
    env.Joi.validate(req.body,data, function (err, result)
    {
          if(err)
          {
            res.send({
              "code":res.statusCode,
              "message":"Please, Enter alll fields!!",
              "isValid":false,
              status:0,
              "type":"FAILED"
            })
            console.log(err);
          }
          else
          {
                var merchant_user_id = req.body.merchant_user_id;
                var email = req.body.email;
                var fullname = req.body.fullname;
                var phone = req.body.phone;
                var timezone = req.body.timezone;
                var preferred_lang = req.body.preferred_lang;
                var updated_at = env.fn.getTime();

                var sql = "UPDATE merchant_user SET fullname=?, phone=? , timezone=?, preferred_lang=?, updated_at=? WHERE merchant_user_id=? AND email=? ";
                var values = [fullname, phone, timezone, preferred_lang, updated_at, merchant_user_id,email];
                      
                env.con.query(sql, values ,function (err, rows, fields)
                {
                    if (err)
                    {
                        console.log(err);
                        res.send({
                            "code":res.statusCode,
                            "message":"ERROR-OCCURED!!",
                            "isValid":false,
                            status:0,
                            "type":"FAILED"
                        })
                    }
                    else
                    {
                        res.send({
                            "code":res.statusCode,
                            "message":"Store owner details saved sucessfully!!",
                            "isValid":true,
                            status:1,
                            "type":"SUCCESS"
                        });
                    }    
                })
          }
    });

}

///////Change Store Owner Password API
exports.changePassword = (req, res) =>{

    const data = env.Joi.object().keys({
        merchant_user_id : env.Joi.string().required(),
        email : env.Joi.string().required(),
        pass : env.Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        cnf_pass : env.Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        updated_at : env.Joi.string(),
    });

    ///////Check Validation of body
    env.Joi.validate(req.body,data, function (err, result)
    {
          if(err)
          {
            res.send({
              "code":res.statusCode,
              "message":"Please, Enter alll fields!!",
              "isValid":false,
              status:0,
              "type":"FAILED"
            })
            console.log(err);
          }
          else
          {
                var merchant_user_id = req.body.merchant_user_id;
                var email = req.body.email;
                var pass = req.body.pass;
                var cnf_pass = req.body.cnf_pass;
                var password = env.fn.getHashValue(req,res,pass);
                var updated_at = env.fn.getTime();

                if(pass == cnf_pass)
                {
                    var sql = "UPDATE merchant_user SET password=?, updated_at=? WHERE merchant_user_id=? AND email=?";
                    var values = [password, updated_at,merchant_user_id,email];
                        
                    env.con.query(sql, values ,function (err, rows, fields)
                    {
                        if (err)
                        {
                            console.log(err);
                            res.send({
                                "code":res.statusCode,
                                "message":"ERROR-OCCURED!!",
                                "isValid":false,
                                status:0,
                                "type":"FAILED"
                            })
                        }
                        else
                        {
                            res.send({
                                "code":res.statusCode,
                                "message":"Password changed sucessfully!!",
                                "isValid":true,
                                status:1,
                                "type":"SUCCESS"
                            });
                        }    
                    })
                }
                else
                {
                    res.send({
                        "code":res.statusCode,
                        "message":"Password doesn't match!!",
                        "isValid":false,
                        status:0,
                        "type":"FAILED"
                    });
                }
          }
    });

}

///////save Secondary Email of Store Owner
exports.secondaryEmail = (req, res) =>{

    const data = env.Joi.object().keys({
        merchant_user_id : env.Joi.string().required(),
        email : env.Joi.string().required(),
        secondary_email : env.Joi.string().email().required(),
        updated_at : env.Joi.string(),
    });

    ///////Check Validation of body
    env.Joi.validate(req.body,data, function (err, result)
    {
          if(err)
          {
            res.send({
              "code":res.statusCode,
              "message":"Please, Enter alll fields!!",
              "isValid":false,
              status:0,
              "type":"FAILED"
            })
            console.log(err);
          }
          else
          {
                var merchant_user_id = req.body.merchant_user_id;
                var email = req.body.email;
                var secondary_email = req.body.secondary_email;
                var updated_at = env.fn.getTime();

                var sql = "UPDATE merchant_user SET secondary_email=?, updated_at=? WHERE merchant_user_id=? AND email=?";
                var values = [secondary_email, updated_at, merchant_user_id,email];
                      
                env.con.query(sql, values ,function (err, rows, fields)
                {
                    if (err)
                    {
                        console.log(err);
                        res.send({
                            "code":res.statusCode,
                            "message":"ERROR-OCCURED!!",
                            "isValid":false,
                            status:0,
                            "type":"FAILED"
                        })
                    }
                    else
                    {
                        res.send({
                            "code":res.statusCode,
                            "message":"Secondary Email Saved!!",
                            "isValid":true,
                            status:1,
                            "type":"SUCCESS"
                        });
                    }    
                })
          }
    });

}