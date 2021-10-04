var env = require('../constants');

var trial_cron;

var transporter = env.nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_POST,
  secure: true,
  auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD
  }
});

//////User Registration
exports.registerUser = (req,res) =>{

    const data = env.Joi.object().keys({
      id : env.Joi.number(),
      fullname : env.Joi.string().min(3).max(20).required(),
      email : env.Joi.string().email().required(),
      password : env.Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
      parent_referal_id : env.Joi.string().allow(null, '').required(),
      plan_id : env.Joi.string().allow(null, '').required(),
      created_at : env.Joi.string(),
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
              "message":"Please, Enter Valid Username!!",
              "isValid":false,
              status:0,
              "type":"FAILED"
            })
            console.log(err);
          }
          else
          {
                var fullname = req.body.fullname;
                var email = req.body.email;
                var pass = req.body.password;
                var password = env.fn.getHashValue(req,res,pass);
                var parent_referal_id = req.body.parent_referal_id;
                var plan_id = req.body.plan_id;
                var merchant_user_id = fullname+'_'+env.fn.getRandomId();
                var currentDate = env.fn.getTime();
                var referralCode = env.fn.getReferralCode();
                

                var sql = "SELECT COUNT(*) AS email FROM merchant_user WHERE email = ?";
                
                var values = [[email]];

                env.con.query(sql, values ,function (err, rows, fields) {
                  
                    if(rows[0].email > 0)
                    {
                      console.log(rows[0].email);

                      var sql1 = "SELECT * FROM merchant_user WHERE email = ?";

                      env.con.query(sql1, values, function (err, row, fields) {
                         var verify_email = row[0].verified;

                         res.send({
                          "isVerified":verify_email,
                          "email":rows[0].email,
                          "code":res.statusCode,
                          "message":"Email-id already exits!!",
                          "isValid":false,
                          status:0,
                          "type":"FAILED"
                        })
                      })

                    }
                    else
                    {
                        /////////////Stripe create customers and save in database
                        var param = {};
                        param.email = email;
                        param.name = fullname;
                        param.description = "Create customer for maidanlah.";

                        env.stripe.customers.create(param, function(err, customer){
                            if(!err)
                            {
                                console.log("Success",customer);
                                console.log("id",customer.id);

                                var sql1 = "INSERT INTO merchant_user (merchant_user_id, fullname, email, password, verified,customer_id, plan_id, status, token, own_website, on_boarding, parent_referal_id, referral_code, user_role, subscription_status, created_at) VALUES ?";
                                var values1 = [[merchant_user_id,fullname, email, password,false,customer.id,plan_id, 1, '', 'No', 'pending',parent_referal_id, referralCode, 'Admin', 'not_active', currentDate]];
                                
                                  env.con.query(sql1, [values1] ,function (err, rows, fields) {
                                    if (err) 
                                    {
                                      console.log("error ocurred!!",err);
                                      res.send({
                                        "err":err,
                                        "code":res.statusCode,
                                        "message":"ERROR-OCCURED!!",
                                        "isValid":false,
                                        status:0,
                                        "type":"FAILED"
                                      })
                                    }else
                                    {  
                                      console.log("Registered Sucessfully!!",email);

                                      var sql2 = "SELECT * FROM merchant_user WHERE email = ?";

                                      env.con.query(sql2, [email] ,function (err, userdata, fields) {
                                        res.send({
                                          "code":res.statusCode,
                                          "data":userdata,
                                          "message":"Registered Sucessfully!!",
                                          "isValid":true,
                                          status:1,
                                          "type":"SUCCESS"
                                        });

                                        const token = env.Jwt.sign({email}, 'accountactivatekey123', {expiresIn:'20m'});

                                        var mailOptions = {
                                          from: 'amitambaliya4@gmail.com',
                                          to: email,
                                          subject: 'Email Verification',
                                          html: '<h2>Click on below verification link for verify your account</h2><br>'+
                                                  '<p>https://maidanlah.anviya.in/verifyEmail/'+token+'</p>'
                                        };
                                      
                                          transporter.sendMail(mailOptions, function(error, info){
                                              if (error) 
                                              {
                                                  console.log(error);
                                                  res.send({
                                                      "err":err,
                                                      "code":res.statusCode,
                                                      "message":"ERROR-OCCURED!!!",
                                                      "isValid":false,
                                                      status:0,
                                                      "type":"FAILED"
                                                  });
                                              } 
                                              else 
                                              {
                                                  console.log('Email sent: ' + info.response);
                                                  
                                                  merchant_user_id = userdata[0].merchant_user_id;
                                                  user_role = userdata[0].user_role;

                                                  if(userdata[0].plan_id == '' || userdata[0].plan_id == null)
                                                  {
                                                      var sql1 = "UPDATE merchant_user SET account_type=?,trial_start_date=?,trial_end_date=?, subscription_status=?, updated_at=? WHERE merchant_user_id=? AND email=?";
                                                      var values = ["trial",'','','not_active',env.fn.getTime(),userdata[0].merchant_user_id,userdata[0].email];
                                      
                                                      env.con.query(sql1, values,function (err, rows, fields) {});
                                                  }
                                                  else
                                                  {
                                                      var sql1 = "UPDATE merchant_user SET account_type=?,trial_start_date=?,trial_end_date=?, subscription_status=?, updated_at=? WHERE merchant_user_id=? AND email=?";
                                                      var values = ["subscription_plan",'','','not_active',env.fn.getTime(),userdata[0].merchant_user_id,userdata[0].email];
                                      
                                                      env.con.query(sql1, values,function (err, rows, fields) {
                                                      });
                                                  }
                                                          
                                                  var subscription_sql = "INSERT INTO user_subscription (merchant_user_id,user_role,fullname, email,customer_id,subscription_status,created_at) VALUES ?";
                                                  var customer_values = [[merchant_user_id,user_role,fullname, email,customer.id, 'not_active', currentDate]];
                                                        
                                                  env.con.query(subscription_sql, [customer_values] ,function (err, rows, fields)
                                                  {
                                                        if (!err)
                                                        {
                                                              console.log("Customer Created Successfully");
                                                        }
                                                  });
                                              }
                                          })
                                      })
                                    }
                                  });
                                
                            }
                        })
                    }
                });
          }
    });

  
}

/////Billing details api
exports.billingDetails = (req,res) =>{

  const data = env.Joi.object().keys({
      merchant_user_id : env.Joi.string().required(),
      email : env.Joi.string().required(),
      plan_id : env.Joi.string().allow(null, '').required(),
      number : env.Joi.string().required(),
      exp_month : env.Joi.number(),
      exp_year : env.Joi.number(),
      cvc : env.Joi.string().required(),

      address_1 : env.Joi.string().min(3).max(200).required(),
      address_2 : env.Joi.string().allow(null, ''),
      city : env.Joi.string().allow(null, '').required(),
      country : env.Joi.string().required(),
      postal_code : env.Joi.string().required(),
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
          console.log(err);
        }
        else
        {
              var merchant_user_id = req.body.merchant_user_id;
              var email = req.body.email;
              var plan_id = req.body.plan_id;
              var address_1 = req.body.address_1;
              var address_2 = req.body.address_2;
              var city = req.body.city;
              var country = req.body.country;
              var postal_code = req.body.postal_code;

              var sql = "SELECT COUNT(*) AS merchant_user_id FROM merchant_user WHERE merchant_user_id = ? AND email=?";
  
              env.con.query(sql , [merchant_user_id,email],function (err, rows, fields) {
                      
                if(rows[0].merchant_user_id > 0)
                {
                  var sql1 = "SELECT * FROM merchant_user WHERE merchant_user_id = ? AND email=?";

                  env.con.query(sql1 , [merchant_user_id,email],function (err, user_data, fields) {
                      if(!err)
                      {
                        var sql1 = "SELECT * FROM subscription_plan_data WHERE plan_id=?";

                        env.con.query(sql1 , [user_data[0].plan_id],function (err, plan_data, fields) {
                            if(!err)
                            {
                              var param = {};
                              param.card = {
                                  number : req.body.number,
                                  exp_month : req.body.exp_month,
                                  exp_year : req.body.exp_year,
                                  cvc : req.body.cvc
                              }
    
                              env.stripe.tokens.create(param, function(err, token)
                              {
                                  if(token)
                                  {
                                      console.log("Token :- ",token);
                                      console.log("Card Id :- ",token.card.id);
                                      //res.send(token);
    
                                      var update_sql = "UPDATE user_subscription SET token_id=?, card_id=?, plan_id=?, plan_name=?,plan_amount=?,subscription_status=?, updated_at=? WHERE merchant_user_id=? and email=?";
                                      var update_values = [token.id, token.card.id, plan_id,plan_data[0].title,plan_data[0].plan_amount,'active',env.fn.getTime(),merchant_user_id, email];
                      
                                      env.con.query(update_sql, update_values,function (err, result, fields) 
                                      {
                                          if (!err)
                                          {
                                            var dt = new Date();
                                            var trial_start_time = env.fn.getTime();
                                            var trial_end_time = env.fn.getEndTime(dt,14).toString();

                                            var trial_days = env.fn.countdays(trial_start_time,trial_end_time);

                                            var sql2 = "UPDATE merchant_user SET address_1=?, address_2=?, city=?, country=?, postal_code=?, trial_start_date=?, trial_end_date=?, trial_days=?, subscription_status=? WHERE merchant_user_id=? AND email=?";
                                            var values2 = [address_1, address_2, city,  country, postal_code,trial_start_time,trial_end_time,trial_days,'active',merchant_user_id,email];

                                            env.con.query(sql2, values2,function (err, result, fields) 
                                            {
                                                if(!err)
                                                {
                                                    createCronJob(merchant_user_id,email);
                                                    res.send({
                                                      "code":res.statusCode,
                                                      "message":"Billing details added Sucessfully!!!!!",
                                                      "isValid":true,
                                                      status:1,
                                                      "type":"SUCCESS"
                                                    });
                                                }else{
                                                  res.send(err);
                                                }
                                            })
                                          }
                                      })
                                  }
                                });                              
                            }else{
                              res.send(err);
                            }
                        })
                      }else{
                        res.send(err);
                      }
                  });
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
  });

}

///////Website name setup
exports.websiteSetup = (req,res) =>{

  const data = env.Joi.object().keys({
      merchant_user_id : env.Joi.string().required(),
      email : env.Joi.string().required(),
      own_website : env.Joi.string().required(),
      website_name : env.Joi.string().required(),
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
            "message":"Please, Fill all fields!!",
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
              var website_name = req.body.website_name;
              var own_website = req.body.own_website;
              
              var sql = "SELECT COUNT(*) AS merchant_user_id FROM merchant_user WHERE merchant_user_id = ? AND email = ?";

                env.con.query(sql , [merchant_user_id,email],function (err, rows, fields) {
                    
                    if(rows[0].merchant_user_id > 0)
                    {
                          var sql1 = "SELECT COUNT(*) AS website_name FROM merchant_user WHERE website_name = ?";
                          
                          env.con.query(sql1, website_name, function (err, result, fields) {

                              if(result[0].website_name > 0)
                              {
                                  res.send({
                                    "code":res.statusCode,
                                    "message":"Url has been taken. Try another one! Invalid url. Please try again.",
                                    "isValid":false,
                                    status:0,
                                    "type":"FAILED"
                                  })
                              }
                              else
                              {
                                    var sql2 = "SELECT * FROM merchant_user WHERE merchant_user_id = ? AND email = ?";

                                    env.con.query(sql2, [merchant_user_id,email],function (err, rows, fields) {
                                      if (!err)
                                      {
                                          var email = rows[0].email;
                                          const token = env.Jwt.sign({email}, 'login', {expiresIn:'20m'});

                                          var sql3 = "UPDATE merchant_user SET token=? ,on_boarding=? ,own_website=? ,website_name=? WHERE merchant_user_id=? AND email=?";
                                          var values = [token,'completed',own_website, website_name, merchant_user_id,email];

                                          env.con.query(sql3, values,function (err, data, fields) {
                                              if(!err)
                                              {
                                                  var sql4 = "SELECT * FROM merchant_user WHERE merchant_user_id = ? AND email = ?";

                                                  env.con.query(sql4, [merchant_user_id,email],function (err, userdata, fields) {
                                                      if(!err)
                                                      {
                                                          res.send({
                                                            "data":userdata,
                                                            "code":res.statusCode,
                                                            "message":"Website Setup Completed!!!",
                                                            "isValid":true,
                                                            status:1,
                                                            "type":"SUCCESS"
                                                          });
                                                      }
                                                      else
                                                      {
                                                          console.log(err);
                                                          res.send({
                                                              "code":res.statusCode,
                                                              "message":"Error Occured!!",
                                                              "isValid":false,
                                                              status:0,
                                                              "type":"FAILED"
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
                              "message":"User-Not-Found!!",
                              "isValid":false,
                              status:0,
                              "type":"FAILED"
                          })  
                    }
                })
        }
  });


}

///////Referral code API
exports.checkReferralcode = (req,res) =>{

    const data = env.Joi.object().keys({
      referralCode : env.Joi.string().required(),
      status : env.Joi.number(),
    });

    ///////Check Validation of body
    env.Joi.validate(req.body,data, function (err, result)
    {
          if(err)
          {
            res.send({
              "code":res.statusCode,
              "message":"Please, Enter referal code!!",
              "isValid":false,
              status:0,
              "type":"FAILED"
            })
            console.log(err);
          }
          else
          {
                var referralCode = req.body.referralCode;

                var sql = "SELECT * FROM merchant_user WHERE referral_code=?";
                    
                env.con.query(sql,referralCode, function (err, rows, fields) {
                    
                    if(!err)
                    {
                      if(rows.length > 0)
                      {
                          if(rows[0].referral_code == referralCode)
                          {
                              res.send({
                                "parent_referal_id":rows[0].merchant_user_id,
                                "code":res.statusCode,
                                "message":"Referral code validated!!!",
                                "isValid":true,
                                status:1,
                                "type":"SUCCESS"
                              });
                          }
                          else
                          {
                              res.send({
                                "code":res.statusCode,
                                "message":"Invalid Referral code!!",
                                "isValid":false,
                                status:0,
                                "type":"FAILED"
                              })
                          }
                      }
                      else
                      {
                          res.send({
                            "code":res.statusCode,
                            "message":"Invalid Referral code!!",
                            "isValid":false,
                            status:0,
                            "type":"FAILED"
                          })
                      }
                    }
                    else
                    {
                          res.send({
                            "code":res.statusCode,
                            "message":"Error Occured!!",
                            "isValid":false,
                            status:0,
                            "type":"FAILED"
                          })
                    }
                })
          }
    })
}

//////Check Promocode validation
exports.checkPromocode = (req,res) => {
      const data = env.Joi.object().keys({
        merchant_user_id : env.Joi.string().required(),
        subuser_id : env.Joi.string().allow(null, '').required(),
        email : env.Joi.string().required(),
        promo_code : env.Joi.string().required()
      });

      ///////Check Validation of body
      env.Joi.validate(req.body,data, function (err, result)
      {
            if(err)
            {
              res.send({
                "code":res.statusCode,
                "message":"Please, Enter promo code!!",
                "isValid":false,
                status:0,
                "type":"FAILED"
              })
              console.log(err);
            }
            else
            {
                  var merchant_user_id = req.body.merchant_user_id;
                  var subuser_id = req.body.subuser_id;
                  var email = req.body.email;
                  var promo_code = req.body.promo_code;

                  var merchant_user_id = req.body.merchant_user_id;
                  var email = req.body.email;
  
                  var sql = "SELECT * FROM merchant_user WHERE merchant_user_id=? AND email=?";
                                                                                          
                  env.con.query(sql,[merchant_user_id,email],function (err, userdata, fields) 
                  {   
                      if(!err)
                      {
                          if(userdata.length > 0)
                          {
                            env.stripe.coupons.retrieve(promo_code,function(err, coupon){
    
                              if(coupon)
                              {
                                  var sql = "SELECT * FROM promocode_data WHERE promocode_id=?";
                
                                  env.con.query(sql , [promo_code],function (err, promo_data, fields) {
                                      if(!err)
                                      {
                                        if(promo_data[0].promocode_status == 1 || coupon.valid == true)
                                        {
                                            var discount_type;
                                            var discount_amount;
                  
                                            var sql = "SELECT COUNT(*) AS merchant_user_id FROM merchant_user WHERE merchant_user_id = ? AND email=?";
                      
                                            env.con.query(sql , [merchant_user_id,email],function (err, rows, fields) {
                                                
                                                if(rows[0].merchant_user_id > 0)
                                                {
                                                      if(coupon.amount_off == null){
                                                          discount_type = "percent_off";
                                                          discount_amount = coupon.percent_off;
                  
                                                      }else{
                                                          discount_type = "amount_off";
                                                          discount_amount = coupon.amount_off / 100;
                                                      }
                                                      
                                                      var sql1 = "UPDATE promocode_data SET merchant_user_id=?,subuser_id=?,email=?,promocode_id=?, discount_type=?, discount_amount=?, promocode_status=?, updated_at=?,redeem_by=? WHERE promocode_id=?";
                                                      var values = [merchant_user_id,subuser_id,email,coupon.id,discount_type,discount_amount,0,env.fn.getTime(),coupon.redeem_by,coupon.id];
                                      
                                                      env.con.query(sql1, values,function (err, rows, fields) {
                                                          if (!err)
                                                          {
                                                              var sql1 = "SELECT * FROM promocode_data WHERE promocode_id = ?";
                                                                                                      
                                                              env.con.query(sql1, [promo_code],function (err, promo_data, fields) 
                                                              {
                                                                  if(!err)
                                                                  {
                                                                      res.send({
                                                                        "data":promo_data,
                                                                        "code":res.statusCode,
                                                                        "message":"Promocode Applied Successfully!!!",
                                                                        "isValid":true,
                                                                        status:1,
                                                                        "type":"SUCCESS"
                                                                      });
                                                                  }
                                                                  else
                                                                  {
                                                                    res.send(err);
                                                                  }
                                                              });
                                                          }
                                                          else
                                                          {
                                                              res.send(err);
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
                                              "message":"Promocode not valid!!",
                                              "isValid":false,
                                              status:0,
                                              "type":"FAILED"
                                            })
                                        }
                                      }else{
                                        res.send(err);
                                      }
                                  })
                                }
                                else
                                {
                                    res.send({
                                      "code":res.statusCode,
                                      "message":"Promocode not valid!!",
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
                                "message":"User-Not-Found!!",
                                "isValid":false,
                                status:0,
                                "type":"FAILED"
                              })
                          }
                      }else{
                        res.send(err);
                      }
                  });
            }
      })
}

var createCronJob = function(merchant_user_id, email) {

  trial_cron = env.cron.schedule('0 0 * * *', () => {

    console.log('Running a job at 12:00 AM everyday');

    var merchant_user_id = merchant_user_id;
    var email = email;

    var sql = "SELECT * FROM merchant_user WHERE merchant_user_id AND email = ?";

    env.con.query(sql, [merchant_user_id,email] ,function (err, userdata, fields) {
        if(!err)
        {
          var user_trial_end_date = env.fn.getTime(userdata[0].trial_end_date);
          var current_time = env.fn.getTime();

          if(current_time > user_trial_end_date && userdata[0].account_type == "trial" && userdata[0].trial_days == '0' && userdata[0].subscription_status == "expired")
          {
              var merchant_user_id = userdata[0].merchant_user_id;
              var email = userdata[0].email;
              var customer_id = userdata[0].customer_id;
              var plan_id = userdata[0].plan_id;

              var sql = "SELECT * FROM merchant_user WHERE merchant_user_id=? OR subuser_id=? AND email=?";
                                                                                        
            env.con.query(sql,[merchant_user_id,subuser_id,email],function (err, userdata, fields) 
            {   
                if(!err)
                {
                    if(userdata.length > 0)
                    {
                        var sql2 = "SELECT * FROM promocode_data WHERE merchant_user_id=? OR subuser_id=? AND email=?";
                                                                                        
                        env.con.query(sql2,[merchant_user_id,subuser_id,email],function (err, promocode_data, fields) 
                        {
                            if(!err)
                            {
                                if(promocode_data.length > 0)
                                {
                                    param = {
                                        customer : customer_id,
                                        items: [
                                          {price: plan_id},
                                        ],
                                        coupon:promocode_data[0].promocode_id
                                    }
                                }
                                else
                                {
                                    param = {
                                        customer : customer_id,
                                        items: [
                                          {price: plan_id},
                                        ]
                                    }
                                }
            
                                env.stripe.subscriptions.create(param, function(err, subscriptions){
                                                                  
                                    if(!err)
                                    {                       
                                        env.stripe.invoices.list({customer: customer_id}, function(err, invoice){
                
                                            if(invoice)
                                            {
                                                //console.log(invoice)
                                                //console.log(subscriptions)

                                                payment_id = invoice.data[0].payment_intent;
                                                payment_status = invoice.data[0].status;

                                                var sql = "UPDATE user_subscription SET payment_id=?, payment_status=? WHERE merchant_user_id=? OR subuser_id=?and email=?";
                                                var values = [payment_id,payment_status,merchant_user_id,subuser_id,email];
                        
                                                env.con.query(sql, values,function (err, result, fields){
                                                    if(!err)
                                                    {
                                                        var plan_sql = "SELECT * FROM subscription_plan_data WHERE plan_id=?";
                                                                                        
                                                        env.con.query(plan_sql,[plan_id],function (err, plan_data, fields) 
                                                        {
                                                            if(!err)
                                                            {
                                                                var payment_sql = "INSERT INTO payment_history (merchant_user_id,subuser_id,user_role,email,invoice_id,invoice_number,amount_paid,total_amount,customer_id,plan_id,plan_name,plan_duration,plan_amount,plan_start_date,plan_end_date,payment_id,payment_status,created_at) VALUES ?";
                                                                var payment_values = [[merchant_user_id,subuser_id,userdata[0].user_role, email,invoice.data[0].id,invoice.data[0].number,invoice.data[0].amount_paid,invoice.data[0].total,customer_id,plan_id,plan_data[0].title,plan_data[0].plan_duration,plan_amount,env.fn.getDate(start_date),env.fn.getDate(end_date),invoice.data[0].payment_intent,invoice.data[0].status,env.fn.getTime()]];
                                                                            
                                                                env.con.query(payment_sql, [payment_values] ,function (err, rows, fields) {
                                                                    if (!err) 
                                                                    {
                                                                        console.log("Payment history added successfully.")
                                                                    }else{
                                                                        console.log(err);
                                                                    }
                                                                })
                                                            }else{
                                                                res.send(err);
                                                            }
                                                        });                                                    
                                                    }else{
                                                        res.send(err);
                                                    }
                                                });
                                            }
                                        })
                
                                        plan_id = subscriptions.plan.id;
                                        plan_name = subscriptions.plan.interval;
                                        plan_amount = subscriptions.plan.amount / 100;
                                        subscription_id = subscriptions.id;
                                        subscription_status = subscriptions.status;
                                        invoice_id = subscriptions.latest_invoice;
                                        start_date = subscriptions.current_period_start;
                                        end_date = subscriptions.current_period_end;
                                        customer_id = subscriptions.customer;

                                        s_date = env.fn.getDate(start_date);
                                        e_date = env.fn.getDate(end_date);
                
                                        var sql1 = "UPDATE user_subscription SET plan_id=?, plan_name=?, plan_amount=?, Subscription_id=?, invoice_id=?, plan_started_date=?, plan_end_date=?,subscription_status=?, updated_at=? WHERE merchant_user_id=? OR subuser_id=? and email=?";
                                        var values1 = [plan_id,plan_name,plan_amount,subscription_id,invoice_id,s_date,e_date,env.fn.getTime(),'active',merchant_user_id,subuser_id,email];
                        
                                        env.con.query(sql1, values1,function (err, result, fields) 
                                        {
                                            if (!err)
                                            {
                                              console.log("User subscription created sucessfully!!")
            
                                              var updatePromo_sql = "UPDATE promocode_data SET promocode_status=?, updated_at=? WHERE merchant_user_id=? OR subuser_id=? and email=?";
                                              var values2 = [1,env.fn.getTime(),merchant_user_id,subuser_id,email];
                              
                                              env.con.query(updatePromo_sql, values2,function (err, result, fields) 
                                              {
                                                  if (!err)
                                                  {
                                                    var update_sql = "UPDATE merchant_user SET account_type=?,subscription_status=? WHERE merchant_user_id=? OR subuser_id=? and email=?";
                                                    var update_values = ["subscription_plan",'active',merchant_user_id,subuser_id,email];
                                    
                                                    env.con.query(update_sql, update_values,function (err, result, fields)
                                                    {
                                                        if(!err)
                                                        {
                                                            res.send({
                                                              "code":res.statusCode,
                                                              "message":"User Subscription Activated Sucessfully!!!!!",
                                                              "isValid":true,
                                                              status:1,
                                                              "type":"SUCCESS"
                                                            });
                                                        }else{
                                                            res.send(err);
                                                        }
                                                    });
                                                  }else{
                                                    res.send(err);
                                                } 
                                              })
                                            }else{
                                                res.send(err);
                                            }
                                        });
                                    }else{
                                        res.send(err);
                                    }
                                })
                            }else{
                                res.send(err);
                            }
                        });   
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
                }else{
                    res.send(err);
                }
            });
          }
          if(current_time <= user_trial_end_date && userdata[0].account_type == "trial")
          {
              var dayupdate_sql = "UPDATE merchant_user SET trial_days=?, subscription_status=? WHERE merchant_user_id=? AND email=?";
              var dayupdate_values = ['0','expired',merchant_user_id,email];
          
              env.con.query(dayupdate_sql, dayupdate_values,function (err, rows, fields) {
                  if(!err)
                  {
                    console.log("Days Updated!!")
                  }
              });            
          }
          else
          {
            if(current_time < user_trial_end_date && userdata[0].account_type == "trial")
            {
              var trial_days = env.fn.countdays(current_time,user_trial_end_date);   

              var dayupdate_sql = "UPDATE merchant_user SET trial_days=? WHERE merchant_user_id=? AND email=?";
              var dayupdate_values = [trial_days,merchant_user_id,email];
          
              env.con.query(dayupdate_sql, dayupdate_values,function (err, rows, fields) {
                  if(!err)
                  {
                    console.log("Days Updated!!")
                  }
              });
            }      
          }
        }
    });
  });
  
}