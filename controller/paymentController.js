var env = require('../constants');

exports.getAllPlans = (req,res) =>{

    const data = env.Joi.object().keys({
        parent_referal_id : env.Joi.string().allow(null, '').required()
    });

    ///////Check Validation of card details
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
            var plan_sql = "SELECT * FROM subscription_plan_data";
                                                                                    
            env.con.query(plan_sql,function (err, plan_data, fields) 
            {
                    if(!err)
                    {
                        res.send({
                            "data":plan_data,
                            "code":res.statusCode,
                            "message":"Received All Plans Sucessfully!!",
                            "isValid":true,
                            status:1,
                            "type":"SUCCESS"
                        })
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
            });
                
          }
    })

}

exports.getuserDetails = (req,res) =>{

    const data = env.Joi.object().keys({
        merchant_user_id : env.Joi.string().required(),
        subuser_id : env.Joi.string().allow(null, '').required(),
        email : env.Joi.string().required()
    });

    ///////Check Validation of card details
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
                var subuser_id = req.body.subuser_id;
                var email = req.body.email;

                env.con.query("SELECT * FROM merchant_user WHERE merchant_user_id = ? OR subuser_id=? AND email = ? OR secondary_email=?",[merchant_user_id,subuser_id,email,email] ,function (err, rows, fields)
                {
                    if(!err)
                    {
                        if(rows.length > 0)
                        {
                            var sql = "SELECT * FROM merchant_user WHERE merchant_user_id = ? OR subuser_id=? AND email = ? OR secondary_email = ?";

                            env.con.query(sql,[merchant_user_id,subuser_id,email,email] ,function (err, userdata, fields)
                            {
                                if(!err)
                                {
                                    if(userdata[0].user_role == 'sub-user')
                                    {
                                        var subuser_id = userdata[0].subuser_id;
                                        var sql = "SELECT * FROM sub_user WHERE subuser_id = ?";

                                        env.con.query(sql,subuser_id ,function (err, result, fields)
                                        {
                                            if(!err)
                                            {
                                                res.send({
                                                    "data":result,
                                                    "subscription_status":userdata[0].subscription_status,
                                                    "code":res.statusCode,
                                                    "message":"DATA-RECEIVED-SUCCESSFULLY!!",
                                                    "isValid":true,
                                                    status:1,
                                                    "type":"SUCCESS",
                                                });
                                            }
                                        });
                                    }
                                    else
                                    {
                                        res.send({
                                            "data":userdata,
                                            "code":res.statusCode,
                                            "message":"DATA-RECEIVED-SUCCESSFULLY!!",
                                            "isValid":true,
                                            status:1,
                                            "type":"SUCCESS",
                                        });
                                    }
                                }                
                            })
                        }
                        else
                        {
                            res.send({
                                "code":204,
                                "message":"USER-NOT-FOUND!!",
                                "isValid":false,
                                status:0,
                                "type":"FAILED"
                              });
                        }
                    }
                });
          }
    })
}