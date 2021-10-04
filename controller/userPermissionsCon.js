const env = require('../constants');

var transporter = env.nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_POST,
  secure: true,
  auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD
  }
});

///////Add user with send Invitation
exports.addUser = (req, res) => {

    const data = env.Joi.object().keys({
        id : env.Joi.number(),
        merchant_user_id : env.Joi.string().required(),
        subuser_id : env.Joi.string(),
        fullname : env.Joi.string().required(),
        email : env.Joi.string().email().required(),
        designation : env.Joi.string().required(),
        password : env.Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        cnf_password : env.Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        store_access : env.Joi.string().required(),
        module_access : env.Joi.array().required(),
        user_permissions : env.Joi.array().required(),
        created_at : env.Joi.string()
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
                var pass = req.body.password;
                var cnf_pass = req.body.cnf_password;

                var merchant_user_id = req.body.merchant_user_id;
                var fullname = req.body.fullname;
                var subuser_id = fullname+'_'+env.fn.getRandomId();
                var email = req.body.email;
                var designation = req.body.designation;
                var password = env.fn.getHashValue(req,res,pass);
                var cnf_password = env.fn.getHashValue(req,res,cnf_pass);
                var store_access = req.body.store_access;
                var module_access = req.body.module_access;
                var user_permissions = req.body.user_permissions;
                var created_at = env.fn.getTime();;

                var permissions = JSON.stringify(user_permissions);
                var module = JSON.stringify(module_access);

                if(pass == cnf_pass)
                {
                    var sql = "SELECT COUNT(*) AS email FROM sub_user WHERE email = ?";

                    env.con.query(sql, email ,function (err, userData, fields) {
                  
                        if(userData[0].email > 0)
                        {
                            res.send({
                                "code":res.statusCode,
                                "message":"Email-id already exits!!",
                                "isValid":false,
                                status:0,
                                "type":"FAILED"
                            })
                        }
                        else
                        {
                            var sql1 = "SELECT COUNT(*) AS email FROM merchant_user WHERE email = ?";

                            env.con.query(sql1, email ,function (err, rows, fields) {
                                if(rows[0].email > 0)
                                {
                                    res.send({
                                        "code":res.statusCode,
                                        "message":"Email-id already exits!!",
                                        "isValid":false,
                                        status:0,
                                        "type":"FAILED"
                                    })
                                }
                                else
                                {
                                    var sql2 = "INSERT INTO merchant_user (merchant_user_id, subuser_id, fullname, email, password, verified, status, token, own_website, on_boarding, user_role, created_at) VALUES ?";
                                    var values2 = [[merchant_user_id, subuser_id, fullname, email, password,true, 1, '', 'No', 'completed','sub-user', created_at]];
                                    
                                      env.con.query(sql2, [values2] ,function (err, rows, fields)
                                      {
                                        if (err)
                                        {
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
                                            var sql2 = "INSERT INTO sub_user (subuser_id, merchant_user_id, fullname, email,designation, password, cnf_password, store_access,module_access,user_permissions, created_at) VALUES ?";
                                            var values2 = [[subuser_id,merchant_user_id,fullname, email,designation,password,password,store_access,module,permissions,created_at]];
                                                
                                            env.con.query(sql2, [values2] ,function (err, rows, fields)
                                            {
                                                if (err)
                                                {
                                                    res.send({
                                                        "code":res.statusCode,
                                                        "message":"ERROR-OCCURED!!",
                                                        "isValid":false,
                                                        status:0,
                                                        "type":"FAILED"
                                                    })
                                                    console.log(err);
                                                }
                                                else
                                                {
                                                    /////////////Stripe create customers and save in database
                                                        var param = {};
                                                        param.email = email;
                                                        param.name = fullname;
                                                        param.description = "Create subuser customer for maidanlah.";

                                                    env.stripe.customers.create(param, function(err, customer){
                                                        if(err)
                                                        {
                                                        console.log(err);
                                                        }
                                                        if(customer)
                                                        {
                                                            console.log("Success",customer);
                                                            console.log("id",customer.id);
                                                            
                                                            var subscription_sql = "INSERT INTO user_subscription (merchant_user_id,subuser_id,user_role,fullname, email,customer_id,subscription_status,created_at) VALUES ?";
                                                            var customer_values = [[merchant_user_id,subuser_id,'sub-user',fullname, email,customer.id,'not_active',created_at]];
                                                        
                                                            env.con.query(subscription_sql, [customer_values] ,function (err, rows, fields)
                                                            {
                                                                if (!err)
                                                                {
                                                                    console.log("Customer Created Successfully");
                                                                }
                                                                else
                                                                {
                                                                    console.log(err);
                                                                }
                                                            });
                                                        }
                                                        else
                                                        {
                                                        console.log("Something went wrong")
                                                        }
                                                    })

                                                    var mailOptions = {
                                                        from: 'amitambaliya4@gmail.com',
                                                        to: email,
                                                        subject: 'User Invitation',
                                                        html: '<h2>Hello User, Thank you for joining with us.</h2><br>'+
                                                            '<h3>Please Login with below credentials.</h3>' +
                                                                '<h4>Email :- '+email+' </h4>' +
                                                                '<h4>Password :- '+cnf_pass+'</h4><br>'
                                                    };
                                                    
                                                        transporter.sendMail(mailOptions, function(error, info){
                                                            if (error) 
                                                            {
                                                                res.send({
                                                                    "code":res.statusCode,
                                                                    "message":"Email-Not-Sent!!!",
                                                                    "isValid":false,
                                                                    status:0,
                                                                    "type":"FAILED"
                                                                });
                                                            } 
                                                            else 
                                                            {
                                                                console.log('Email sent: ' + info.response);

                                                                res.send({
                                                                    "code":res.statusCode,
                                                                    "message":"Send Invitation Successfully!!",
                                                                    "isValid":true,
                                                                    status:1,
                                                                    "type":"SUCCESS"
                                                                });
                                                            }
                                                        })
                                                }    
                                            });
                                        }
                                      });
                                }
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

//////Get all sub-user list
exports.getallSubUser = (req, res) => {
    const data = env.Joi.object().keys({
        merchant_user_id : env.Joi.string().required(),
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

                var sql = "SELECT * FROM sub_user WHERE merchant_user_id = ?";

                env.con.query(sql, merchant_user_id ,function (err, rows, fields) {
                    if (err)
                    {
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
                            "data":Object.values(JSON.parse(JSON.stringify(rows))),
                            "code":res.statusCode,
                            "message":"All sub-users got successfully!!",
                            "isValid":true,
                            status:1,
                            "type":"SUCCESS"
                        });
                    }
                });
          }
    })
}

//////Manage User(Edit sub user Details Update)
exports.manageUser = (req, res) => {

    const data = env.Joi.object().keys({
        subuser_id : env.Joi.string().required(),
        fullname : env.Joi.string().required(),
        email : env.Joi.string().email().required(),
        designation : env.Joi.string().required(),
        store_access : env.Joi.string().required(),
        module_access : env.Joi.array().required(),
        user_permissions : env.Joi.array().required(),
        updated_at : env.Joi.string()
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
                var subuser_id = req.body.subuser_id;
                var fullname = req.body.fullname;
                var email = req.body.email;
                var designation = req.body.designation;
                var store_access = req.body.store_access;
                var module_access = req.body.module_access;
                var user_permissions = req.body.user_permissions;
                var updated_at = env.fn.getTime();;

                var permissions = JSON.stringify(user_permissions);
                var module = JSON.stringify(module_access);

                var sql = "SELECT COUNT(*) AS subuser_id FROM sub_user WHERE subuser_id = ?";

                env.con.query(sql, subuser_id ,function (err, rows, fields) {

                    if(rows[0].subuser_id > 0)
                    {
                        var sql_subuser = "SELECT * FROM sub_user WHERE subuser_id = ?";

                        env.con.query(sql_subuser, subuser_id ,function (err, user_data, fields) {
                            if(!err)
                            {
                                subuser_email = user_data[0].email;
                                
                                var sql1 = "UPDATE sub_user SET fullname=?, email=?, designation=?, store_access=?, module_access=?, user_permissions=?, updated_at=? WHERE subuser_id=?";
                                var values1 = [fullname, email,designation,store_access,module,permissions,updated_at,subuser_id];
                                    
                                env.con.query(sql1, values1 ,function (err, rows, fields)
                                {
                                    if (err)
                                    {
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
                                        
                                        var sql2 = "UPDATE merchant_user SET fullname=?, email=?, updated_at=? WHERE email=?";
                                        var values2 = [fullname, email,updated_at,subuser_email];

                                        env.con.query(sql2, values2 ,function (err, rows, fields)
                                        {
                                            if (err)
                                            {
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
                                                    "message":"Save User-Info Successfully!!",
                                                    "isValid":true,
                                                    status:1,
                                                    "type":"SUCCESS"
                                                });
                                            }
                                        })
                                    }    
                                })
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
                })
          }
    })
}

exports.resetsubUserPassword = (req, res) => {

    const data = env.Joi.object().keys({
        subuser_id : env.Joi.string(),
        password : env.Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        cnf_password : env.Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
        updated_at : env.Joi.string()
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

          }
          else
          {
                var subuser_id = req.body.subuser_id;
                var pass = req.body.password;
                var cnf_pass = req.body.cnf_password;
                
                var password = env.fn.getHashValue(req,res,pass);
                var cnf_password = env.fn.getHashValue(req,res,cnf_pass);
                var updated_at = env.fn.getTime();;

                if(pass == cnf_pass)
                {
                    var sql = "SELECT COUNT(*) AS subuser_id FROM sub_user WHERE subuser_id = ?";

                    env.con.query(sql, subuser_id ,function (err, rows, fields) {
                  
                        if(rows[0].subuser_id > 0)
                        {
                            var sql_subuser = "SELECT * FROM sub_user WHERE subuser_id = ?";

                            env.con.query(sql_subuser, subuser_id ,function (err, user_data, fields) {
                                if(!err)
                                {
                                    subuser_email = user_data[0].email;
                                    
                                    var sql1 = "UPDATE sub_user SET password=?, cnf_password=?, updated_at=? WHERE subuser_id=?";
                                    var values1 = [password, password,updated_at,subuser_id];
                                        
                                    env.con.query(sql1, values1 ,function (err, rows, fields)
                                    {
                                        if (err)
                                        {
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
                                            
                                            var sql2 = "UPDATE merchant_user SET password=?, updated_at=? WHERE email=?";
                                            var values2 = [password,updated_at,subuser_email];

                                            env.con.query(sql2, values2 ,function (err, rows, fields)
                                            {
                                                if (err)
                                                {
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
                                                        "message":"Password Changed Successfully!!",
                                                        "isValid":true,
                                                        status:1,
                                                        "type":"SUCCESS"
                                                    });
                                                }
                                            })
                                        }    
                                    })
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


exports.deleteSubUser = (req, res) => {

    const data = env.Joi.object().keys({
        subuser_id : env.Joi.string().required(),
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

          }
          else
          {
                var subuser_id = req.body.subuser_id;

                var sql = "SELECT COUNT(*) AS subuser_id FROM sub_user WHERE subuser_id = ?";

                    env.con.query(sql, subuser_id ,function (err, rows, fields) {
                  
                        if(rows[0].subuser_id > 0)
                        {
                            var sql_subuser = "SELECT * FROM sub_user WHERE subuser_id = ?";

                            env.con.query(sql_subuser, subuser_id ,function (err, user_data, fields) {
                                if(!err)
                                {
                                    subuser_email = user_data[0].email;
                                    console.log(subuser_email);
                                    
                                    var sql1 = "DELETE FROM sub_user WHERE subuser_id = ?";
                                        
                                    env.con.query(sql1, subuser_id ,function (err, rows, fields)
                                    {
                                        if (err)
                                        {
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
                                            
                                            var sql2 = "DELETE FROM merchant_user WHERE email = ?";

                                            env.con.query(sql2, subuser_email ,function (err, rows, fields)
                                            {
                                                if (err)
                                                {
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
                                                        "message":"User Deleted Successfully!!",
                                                        "isValid":true,
                                                        status:1,
                                                        "type":"SUCCESS"
                                                    });
                                                }
                                            })
                                        }    
                                    })
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
                    })
          }
    })
}