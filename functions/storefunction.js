var ran = require('randomatic');

//////get merchant unique id
exports.getStoreId = function(req,res,value)
{
    return (ran('Aa0', 12));
}