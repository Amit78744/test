const env = require('../constants');

/////Get user plan details
exports.getUserPlanDetails = (req, res) =>{

    const data = env.Joi.object().keys({
        merchant_user_id : env.Joi.string().required(),
        subuser_id : env.Joi.string().allow(null, '').required(),
        email : env.Joi.string().required()
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
                var subuser_id = req.body.subuser_id;
                var email = req.body.email;

                var sql = "SELECT * FROM merchant_user WHERE merchant_user_id=? OR subuser_id=? AND email = ?";

                env.con.query(sql, [merchant_user_id,subuser_id,email] ,function (err, userdata, fields)
                {
                    if(!err)
                    {
                        if(userdata.length > 0)
                        {
                            if(userdata[0].account_type == "trial")
                            {
                                var sql = "SELECT * FROM user_subscription WHERE merchant_user_id=? OR subuser_id=? AND email = ?";

                                env.con.query(sql, [merchant_user_id,subuser_id,email] ,function (err, paymentdata, fields)
                                {
                                        if(!err)
                                        {
                                            res.send({
                                                "subscriptionDetails":[{"id":userdata[0].id,"merchant_user_id":userdata[0].merchant_user_id,"subuser_id":userdata[0].subuser_id,"email":userdata[0].email,"plan_id":userdata[0].plan_id,"account_type":userdata[0].account_type,
                                                                        "trial_days":userdata[0].trial_days,"subscription_status":userdata[0].subscription_status}],
                                                "paymentHistory":[],
                                                "code":res.statusCode,
                                                "message":"Trial plan details received successfully!!",
                                                "isValid":true,
                                                status:1,
                                                "type":"SUCCESS"
                                            });
                                        }else{
                                            res.send(err);
                                        }
                                })
                            }
                            else
                            {
                                var sql = "SELECT * FROM payment_history WHERE merchant_user_id=? OR subuser_id=? AND email=? ORDER BY created_at DESC";

                                env.con.query(sql, [merchant_user_id,subuser_id,email] ,function (err, paymentdata, fields)
                                {
                                        if(!err)
                                        {
                                            var sql = "SELECT * FROM subscription_plan_data WHERE plan_id = ?";
                                            env.con.query(sql, [userdata[0].plan_id] ,function (err, plandata, fields)
                                            {
                                                    if(!err)
                                                    {
                                                        res.send({
                                                            "subscriptionDetails":[{"id":userdata[0].id,"merchant_user_id":userdata[0].merchant_user_id,"subuser_id":userdata[0].subuser_id,"email":userdata[0].email,"account_type":userdata[0].account_type,
                                                                    "plan_id":userdata[0].plan_id,"plan_name":plandata[0].title,"plan_amount":plandata[0].plan_amount,"plan_duration":plandata[0].plan_duration,"subscription_status":userdata[0].subscription_status}],
                                                            "paymentHistory":paymentdata,
                                                            "code":res.statusCode,
                                                            "message":"Plan details received successfully!!",
                                                            "isValid":true,
                                                            status:1,
                                                            "type":"SUCCESS"
                                                        });
                                                    }else{
                                                        res.send(err);
                                                    }
                                            })
                                        }else{
                                            res.send(err);
                                        }
                                })
                            }
                            
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
    });

}

/////Update billing addresses of user
exports.updateBillingAddress = (req, res) =>{

    const data = env.Joi.object().keys({
        merchant_user_id : env.Joi.string().required(),
        subuser_id : env.Joi.string().allow(null, '').required(),
        email : env.Joi.string().required(),
        fullname : env.Joi.string().required(),
        company_name : env.Joi.string().allow(null, ''),
        address_1 : env.Joi.string().min(3).max(200).required(),
        address_2 : env.Joi.string().allow(null, ''),
        city : env.Joi.string().allow(null, ''),
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
                var subuser_id = req.body.subuser_id;
                var email = req.body.email;
                var fullname = req.body.fullname;
                var company_name = req.body.company_name;
                var address_1 = req.body.address_1;
                var address_2 = req.body.address_2;
                var city = req.body.city;
                var country = req.body.country;
                var postal_code = req.body.postal_code;

                var sql = "SELECT * FROM merchant_user WHERE merchant_user_id=? OR subuser_id=? AND email=?";
                                                                                          
                env.con.query(sql,[merchant_user_id,subuser_id,email],function (err, userdata, fields) 
                {   
                    if(!err)
                    {
                        if(userdata.length > 0)
                        {
                            var sql = "UPDATE merchant_user SET fullname=?, company_name=?, address_1=?, address_2=?, city=?, country=?, postal_code=? WHERE merchant_user_id=? OR subuser_id=? AND email=?";
                            var values = [fullname,company_name,address_1, address_2, city,  country, postal_code, merchant_user_id,subuser_id,email];
                        
                            env.con.query(sql, values,function (err, rows, fields) {
                                if (!err)
                                {
                                    res.send({
                                        "code":res.statusCode,
                                        "message":"Billing Details Updated Sucessfully!!!!!",
                                        "isValid":true,
                                        status:1,
                                        "type":"SUCCESS"
                                      });
                                }
                                else
                                {
                                    res.send({
                                        "code":res.statusCode,
                                        "message":"ERROR-OCCURED!!",
                                        "isValid":false,
                                        status:0,
                                        "type":"FAILED"
                                    })
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
    });

}

/////cancle trial plan of user
exports.cancelplan = (req,res) =>{
    const data = env.Joi.object().keys({
        merchant_user_id : env.Joi.string().required(),
        subuser_id : env.Joi.string().allow(null, '').required(),
        email : env.Joi.string().required()
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

                var sql = "SELECT * FROM merchant_user WHERE merchant_user_id=? OR subuser_id=? AND email=?";
                                                                                        
                env.con.query(sql,[merchant_user_id,subuser_id,email],function (err, userdata, fields) 
                {   
                    if(!err)
                    {
                        if(userdata.length > 0)
                        {
                            if(userdata[0].account_type == "trial")
                            {
                                var sql1 = "UPDATE merchant_user SET trial_end_date=?, subscription_status=?, cancelled_at=? WHERE merchant_user_id=? OR subuser_id=? AND email=?";
                                var values1 = [env.fn.getTime(),'expired',env.fn.getTime(), merchant_user_id,subuser_id,email];
                            
                                env.con.query(sql1, values1,function (err, rows, fields) {
                                    if (!err)
                                    {
                                        var sql2 = "UPDATE user_subscription SET subscription_status=?, cancelled_at=? WHERE merchant_user_id=? OR subuser_id=? AND email=?";
                                        var values2 = ['expired', env.fn.getTime(),merchant_user_id,subuser_id,email];
                                    
                                        env.con.query(sql2, values2,function (err, rows, fields) {
                                            if (!err)
                                            {
                                                res.send({
                                                    "code":res.statusCode,
                                                    "message":"Trial Plan cancelled Sucessfully!!!!!",
                                                    "isValid":true,
                                                    status:1,
                                                    "type":"SUCCESS"
                                                });
                                            }
                                        })
                                    }else{
                                        res.send(err);
                                    }
                                });
                            }
                            else
                            {
                                var sql1 = "UPDATE merchant_user SET subscription_status=?, cancelled_at=? WHERE merchant_user_id=? OR subuser_id AND email=?";
                                var values1 = ['cancelled',env.fn.getTime(), merchant_user_id,subuser_id,email];
                            
                                env.con.query(sql1, values1,function (err, rows, fields) {
                                    if (!err)
                                    {
                                        var sql2 = "UPDATE user_subscription SET subscription_status=?, cancelled_at=? WHERE merchant_user_id=? OR subuser_id=? AND email=?";
                                        var values2 = ['cancelled', env.fn.getTime(),merchant_user_id,subuser_id,email];
                                    
                                        env.con.query(sql2, values2,function (err, rows, fields) {
                                            if (!err)
                                            {
                                                var sql3 = "SELECT * FROM user_subscription WHERE merchant_user_id=? OR subuser_id=? AND email=?";
                                                var values3 = [merchant_user_id,subuser_id,email];
    
                                                env.con.query(sql3, values3,function (err, rows, fields) {
                                                    if (!err)
                                                    {
                                                        env.stripe.subscriptions.del(rows[0].subscription_id,function(err, subscription){
                                                            if(subscription)
                                                            {
                                                                res.send({
                                                                    "code":res.statusCode,
                                                                    "message":"Plan cancelled Sucessfully!!!!!",
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
                                                    }else{
                                                        res.send(err);
                                                    }
                                                })
                                            }
                                        })
                                    }else{
                                        res.send(err);
                                    }
                                });
                            }
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
                    }
                    else
                    {
                        res.send({
                            "code":res.statusCode,
                            "message":"ERROR-OCCURED!!",
                            "isValid":false,
                            status:0,
                            "type":"FAILED"
                        })
                    }
                });
        }
    });
}

/////apply Subscription plan according to choose plan
exports.applyUserSubscription = (req,res) =>{
    const data = env.Joi.object().keys({
        merchant_user_id : env.Joi.string().required(),
        subuser_id : env.Joi.string().allow(null, '').required(),
        email : env.Joi.string().required(),
        customer_id : env.Joi.string().required(),
        plan_id : env.Joi.string().required(),
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
            var subuser_id = req.body.subuser_id;
            var email = req.body.email;
            var customer_id = req.body.customer_id;
            var plan_id = req.body.plan_id;

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
                                                                s_date = env.fn.getDate(invoice.data[0].period_start);
                                                                e_date = env.fn.getDate(invoice.data[0].period_end);
                                    
                                                                var payment_sql = "INSERT INTO payment_history (merchant_user_id,subuser_id,user_role,email,invoice_id,invoice_number,amount_paid,total_amount,customer_id,plan_id,plan_name,plan_duration,plan_amount,plan_start_date,plan_end_date,payment_id,payment_status,created_at) VALUES ?";
                                                                var payment_values = [[merchant_user_id,subuser_id,userdata[0].user_role, email,invoice.data[0].id,invoice.data[0].number,invoice.data[0].amount_paid / 100,invoice.data[0].total / 100,customer_id,plan_id,plan_data[0].title,plan_data[0].plan_duration,plan_amount,s_date,e_date,invoice.data[0].payment_intent,invoice.data[0].status,env.fn.getTime()]];
                                                                            
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
    });
}