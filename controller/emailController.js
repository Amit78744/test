var nodemailer = require('nodemailer');
var con = require('../config/database');
const Joi = require('joi');
const Jwt = require('jsonwebtoken');
const env = require('../constants');

var transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_POST,
    secure: true,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
    }
});

/////Send Email to User for Verification
exports.emailVerification = (req, res) =>{ 
  
    const data = Joi.object().keys({
      email : Joi.string().email().required(),
    });
  
    Joi.validate(req.body,data, function (err, result)
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

                  const token = Jwt.sign({email}, 'accountactivatekey123', {expiresIn:'20m'});

                  con.query(sql , email,function (err, rows, fields) {
                      
                    if(rows[0].email > 0)
                    {
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

/////Check Email Verification
exports.checkEmailVerification = (req,res) =>{
      const data = Joi.object().keys({
        email : Joi.string().email().required(),
      });

      Joi.validate(req.body,data, function (err, result)
      {
            if(err)
            {
              res.send({
                "code":res.statusCode,
                "message":"Please Check email!!",
                "isValid":false,
                status:0,
                "type":"FAILED"
              })
              console.log(err);
            }
            else
            {
                var email = req.body.email;

                var sql1 = "SELECT * FROM merchant_user WHERE email = ?";

                con.query(sql1, [email], function (err, rows, fields) {

                  if(err)
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
                        "isVerified":rows[0].verified,
                        "message":"Verified Result Received!!",
                        "isValid":true,
                        status:1,
                        "type":"SUCCESS"
                      });
                  }
                })

            }
      })
}

exports.verifyEmail = (req,res) =>{

    var token = req.params.token;

    Jwt.verify(token, 'accountactivatekey123', function(err, decodedToken) {

      if(err)
      {
        res.send({
          "code":res.statusCode,
          "message":"Token Expired!!",
          "tok":decodedToken,
          "isValid":false,
          status:0,
          "type":"FAILED"
        })
      }
      else
      {
          con.query("UPDATE merchant_user SET verified=TRUE WHERE email=?", [decodedToken.email],function (err, rows, fields) {
            if (!err)
            {
                res.send({
                    "code":res.statusCode,
                    "message":"Email Verified Successfully!!!",
                    "isValid":true,
                    status:1,
                    "type":"SUCCESS"
                });
            }
            else
            {
                  res.send({
                    "code":res.statusCode,
                    "message":"Email Not-Verified!!",
                    "isValid":false,
                    status:0,
                    "type":"FAILED"
                  })
            }
          });
      }
      
    })
}