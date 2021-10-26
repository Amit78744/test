const env = require('../constants');

var otp;
///test
exports.test1 = (req,res) =>{
  try {
    res.send("Cron 1 Working");
    trial_cron = env.cron.schedule('0 0 * * *', () => {

      console.log('Running a job at 12:00 AM everyday');

      var sql = "SELECT * FROM test WHERE id=?";
      var values = [1];

      env.con.query(sql,values,function (err, rows, fields)
      {
        if(!err)
        {
          var days = rows[0].trial_days - 1;
          var update_sql = "UPDATE test SET trial_days=?,type=?,updated_at=? WHERE id=?";
          var update_values = [days,"test1_running",env.fn.getTime(),1];
      
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
    });
  } catch (error) {
    console.log(error);
  }
}

exports.test2 = (req,res) =>{
  try {
    res.send("Cron 2 Working");
    trial_cron = env.cron.schedule('0 0 0 * * *', () => {

      console.log('Running a job at 12:00 AM everyday');

      var sql = "SELECT * FROM test WHERE id=?";
      var values = [2];

      env.con.query(sql,values,function (err, rows, fields)
      {
        if(!err)
        {
          var days = rows[0].trial_days - 1;
          var update_sql = "UPDATE test SET trial_days=?,type=?,updated_at=? WHERE id=?";
          var update_values = [days,"test2_running",env.fn.getTime(),2];
      
          env.con.query(update_sql, update_values,function (err, result, fields)
          {
            if(!err)
            {
              console.log("Cron 2 Working");
            }else{
              console.log(err);
            }
          })
        }else{
          console.log(err);
        }
      })
    });
  } catch (error) {
    console.log(error);
  }
}

///get all user details
exports.getuser = (req,res) =>{

  try {
    var sql = "SELECT * FROM test";

      env.con.query(sql,function (err, rows, fields)
      {
        if(!err)
        {
          res.send(rows);
        }else{
          res.send(err);
        }
      })
  } catch (error) {
    res.send(error);
  }
}

////login Existing user token
exports.loginUser = (req,res) =>{

    const data = env.Joi.object().keys({
      email : env.Joi.string().email().required(),
      password : env.Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      status : env.Joi.number(),
      token : env.Joi.string()
    });

    ///////Check Validation of body
    env.Joi.validate(req.body,data, function (err, result)
    {
          if(err)
          {
            res.send({
              "code":res.statusCode,
              "message":"Please, Enter Valid Username and Password!!",
              "isValid":false,
              status:0,
              "type":"FAILED"
            })
            console.log(err);
          }
          else
          {
                req.session.email = req.body.email;
                req.session.password = req.body.password;

                env.con.query("SELECT * FROM merchant_user WHERE email = ? OR secondary_email=?",[req.session.email,req.session.email] ,function (err, rows, fields)
                {
                      if (err) 
                      {  
                          console.log(err);
                          res.send(err);
                      }
                      else
                      {
                      
                        if(rows.length > 0)
                        {
                          if(env.hash.verify(req.session.password, rows[0].password))
                          {
                                var email = req.session.email;

                                //const token = Jwt.sign({email}, 'login', {expiresIn:'20m'});

                                const token = env.Jwt.sign({email}, 'login');
                                
                                var sql = "UPDATE merchant_user SET last_login=?, token=? WHERE email=?";
                                
                                env.con.query(sql,[env.fn.getTime(), token , email] ,function (err, result, fields)
                                {
                                      if(err)
                                      {
                                          console.log(err);
                                          res.send(err);
                                      }
                                      else
                                      {
                                          var sql1 = "SELECT * FROM merchant_user WHERE email = ? OR secondary_email=?";

                                          env.con.query(sql1,[email,email],function (err, result, fields)
                                          {
                                                if(err)
                                                {
                                                    console.log(err);
                                                    res.send(err);
                                                }
                                                else
                                                {
                                                      if(result[0].on_boarding)
                                                      {
                                                            console.log("LOGIN-SUCCESSFULL!!");

                                                            //console.log(calcTime('Europe/Rome','+2.00'));

                                                            const nDate = new Date().toISOString('en-US', {
                                                              timeZone: 'Asia/Calcutta'
                                                            });

                                                            console.log(nDate);

                                                            if(result[0].user_role == "sub-user")
                                                            {
                                                                var sql2 = "SELECT * FROM sub_user WHERE email = ?";

                                                                env.con.query(sql2,email ,function (err, subuser, fields)
                                                                {
                                                                      if(!err)
                                                                      {
                                                                          if(result[0].plan_id == null || result[0].plan_id == '')
                                                                          {
                                                                              res.send({
                                                                                "data":result,
                                                                                "plan":[],
                                                                                "subuser":subuser,
                                                                                "code":res.statusCode,
                                                                                "message":"LOGIN-SUCCESSFULL!!",
                                                                                "isValid":true,
                                                                                status:1,
                                                                                "type":"SUCCESS",
                                                                              });
                                                                          }
                                                                          else
                                                                          {
                                                                              var plan_sql = "SELECT * FROM subscription_plan_data WHERE plan_id = ?";
                                                                                          
                                                                              env.con.query(plan_sql,result[0].plan_id,function (err, plan_data, fields) 
                                                                              {
                                                                                      if(!err)
                                                                                      {
                                                                                          res.send({
                                                                                            "data":result,
                                                                                            "plan":plan_data,
                                                                                            "subuser":subuser,
                                                                                            "code":res.statusCode,
                                                                                            "message":"LOGIN-SUCCESSFULL!!",
                                                                                            "isValid":true,
                                                                                            status:1,
                                                                                            "type":"SUCCESS",
                                                                                          });
                                                                                      }else{
                                                                                        res.send(err);
                                                                                      }
                                                                              });
                                                                          }
                                                                      }else{
                                                                        res.send(err);
                                                                      }
                                                                })
                                                            }
                                                            else
                                                            {
                                                              if(result[0].plan_id == null || result[0].plan_id == '')
                                                              {
                                                                  res.send({
                                                                    "data":result,
                                                                    "plan":[],
                                                                    "code":res.statusCode,
                                                                    "message":"LOGIN-SUCCESSFULL!!",
                                                                    "isValid":true,
                                                                    status:1,
                                                                    "type":"SUCCESS",
                                                                  });
                                                              }
                                                              else
                                                              {
                                                                  var plan_sql = "SELECT * FROM subscription_plan_data WHERE plan_id = ?";
                                                                                          
                                                                  env.con.query(plan_sql,result[0].plan_id,function (err, plan_data, fields) 
                                                                  {
                                                                          if(!err)
                                                                          {
                                                                              res.send({
                                                                                "data":result,
                                                                                "plan":plan_data,
                                                                                "code":res.statusCode,
                                                                                "message":"USER-LOGIN-SUCCESSFULL!!",
                                                                                "isValid":true,
                                                                                status:1,
                                                                                "type":"SUCCESS",
                                                                              });
                                                                          }else{
                                                                            res.send(err)
                                                                          }
                                                                  });
                                                              }
                                                            }
                                                      }
                                                      else
                                                      {
                                                            res.send({
                                                              "code":res.statusCode,
                                                              "message":"USER-NOT-SIGNED-UP!!",
                                                              "isValid":false,
                                                              status:0,
                                                              "type":"FAILED",
                                                            });
                                                      }
                                                }
                                          });
                                      }
                                });
                          }
                          else
                          {
                            res.send({
                              "code":204,
                              "message":"The email or password is incorrect.Please verify and try again.",
                              "isValid":false,
                              status:0,
                              "type":"FAILED"
                            });
                                console.log("WRONG PASSWORD!!");
                          }
                        }
                        else
                        {
                          res.send({
                            "code":204,
                            "message":"The email or password is incorrect.Please verify and try again.",
                            "Amit":"Amit working",
                            "isValid":false,
                            status:0,
                            "type":"FAILED"
                          });
                          createCronJob();

                          console.log("EMAIL-NOT-VALID!!");
                        }
                      }
                    });
          }
    })
}

////Forgot password email send with otp
exports.forgotPassword = (req,res) =>{
  
    otp = Math.random();
    otp = otp * 1000000;
    otp = parseInt(otp);

    var transporter = env.nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_POST,
      secure: true,
      auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD
      }
    });

    const data = env.Joi.object().keys({
      email : env.Joi.string().email().required(),
    });
  
    env.Joi.validate(req.body,data, function (err, result)
    {
          if(err)
          {
            res.send({
              "code":res.statusCode,
              "message":"Please-Enter-Valid-Email!!",
              "isValid":false,
              status:0,
              "type":"FAILED"
            })
            console.log(err);
          }
          else
          {
                  var sql = "SELECT COUNT(*) AS email FROM merchant_user WHERE email = ?";
                  var email = req.body.email;

                  env.con.query(sql , email,function (err, rows, fields) {
                      
                    if(rows[0].email > 0)
                    {
                          var mailOptions = {
                              from: 'amitambaliya4@gmail.com',
                              to: email,
                              subject: 'Reset Password',
                              html: '<h2>Your verification code is : '+otp+'</h2>'
                          };
                          
                          transporter.sendMail(mailOptions, function(error, info){
                              if (error) 
                              {
                                  console.log(error);
                                  res.send({
                                      "code":res.statusCode,
                                      "message":"ERROR-OCCURED!!!",
                                      "isValid":false,
                                      status:0,
                                      "type":"FAILED"
                                  });
                              } 
                              else 
                              {
                                  res.send({
                                      "code":res.statusCode,
                                      "message":"EMAIL-SENT-SUCCESSFULY!!!",
                                      "isValid":true,
                                      status:1,
                                      "type":"SUCCESS"
                                  });
                                  console.log('Email sent: ' + info.response);
                              }
          
                          })
                        
                      }
                      else
                      {
                        console.log("Email Not Found");
                        res.send({
                          "code":res.statusCode,
                          "message":"Email-Not-Found",
                          "isValid":false,
                          status:0,
                          "type":"FAILED"
                        })
                      }
                  });
              }
      })
}

////Verify OTP API
exports.verifyOTP = (req,res) =>{

    const data = env.Joi.object().keys({
      otp : env.Joi.string().required(),
    });

    env.Joi.validate(req.body,data, function (err, result)
    {
          if(err)
          {
              res.send({
                "code":res.statusCode,
                "message":"Please-Enter-Valid-OTP!!",
                "isValid":false,
                status:0,
                "type":"FAILED"
              })
          }
          else
          {
              if(req.body.otp == otp)
              {
                  res.send({
                    "code":res.statusCode,
                    "message":"OTP-VERIFIED-SUCCESSFULLY!!",
                    "isValid":true,
                    status:1,
                    "type":"SUCCESS",
                  });
              }
              else
              {
                  res.send({
                    "code":res.statusCode,
                    "message":"OTP-NOT-VERIFIED!!",
                    "isValid":false,
                    status:0,
                    "type":"FAILED"
                  })
              }
          }
    })
}

//// Set new password API
exports.resetPassword = (req,res) =>{
    const data = env.Joi.object().keys({
      email : env.Joi.string().email().required(),
      new_password : env.Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      cnf_password : env.Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    });


    ///////Check Validation of body
    env.Joi.validate(req.body,data, function (err, result)
    {
          if(err)
          {
              res.send({
                "code":res.statusCode,
                "message":"Please, Fill all fields!!",
                "isValid":false,
                status:0,
                "type":"FAILED"
              })
          }
          else
          {
              var email = req.body.email;
              var new_pass = req.body.new_password;
              var new_password = env.fn.getHashValue(req,res,new_pass);
              var cnf_pass = req.body.cnf_password;
              var cnf_password = env.fn.getHashValue(req,res,cnf_pass);

              if(new_pass == cnf_pass)
              {
                var sql = "SELECT COUNT(*) AS email FROM merchant_user WHERE email = ?";
                
                var values = [[email]];

                env.con.query(sql, values ,function (err, rows, fields) {
                  
                    if(rows[0].email > 0)
                    {
                        var sql1 = "UPDATE merchant_user SET password=? WHERE email=?";
                        var values1 = [cnf_password, email];
      
                        env.con.query(sql1, values1,function (err, rows, fields) {
                            if (!err)
                            {
                                res.send({
                                  "code":res.statusCode,
                                  "message":"Password Changed Successfully!!!",
                                  "isValid":true,
                                  status:1,
                                  "type":"SUCCESS"
                                });
                            }
                            else
                            {
                                res.send({
                                  "code":res.statusCode,
                                  "message":"Error Occured!!",
                                  "isValid":false,
                                  status:0,
                                  "type":"FAILED"
                                });
                            }
                        });
                    }
                    else
                    {
                        res.send({
                          "code":res.statusCode,
                          "message":"Email-id not found!!",
                          "isValid":false,
                          status:0,
                          "type":"FAILED"
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
    })
}

var calcTime = function(city,offset){
  var b = new Date();
  var utc = b.getTime()+(b.getTimezoneOffset()*60000);
  var nd = new Date(utc+(3600000*offset));
  return "Time is : "+ city + " is "+nd.toLocaleString();
}