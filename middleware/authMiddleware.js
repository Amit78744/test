const Jwt = require('jsonwebtoken');

exports.AuthMiddleware = function(req,res)
{
    return function(req,res, next) {

        console.log("AuthMiddleware middleware working");

        const token = req.headers["authorization"];

        if(typeof token !== 'undefined')
        {
            const bearer = token.split(" ");
            const bearerToken = bearer[1];
            req.token = bearerToken;

            Jwt.verify(req.token, 'login' , (err, authData) => {
                      if(err){
                         res.send({
                            "code":403,
                            "message":"Token-Not-Valid!!!",
                            "isValid":false,
                            status:0,
                            "type":"FAILED"
                        });
                       }else{
                        next();
                       }
            });
        }
        else
        {
            console.log("Error Coming");
            res.send({
                "code":400,
                "message":"HEADER-NOT-SET!!!",
                "isValid":false,
                status:0,
                "type":"FAILED"
            });
        }

    }
    
}