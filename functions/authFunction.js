var ran = require('randomatic');
var hash = require('password-hash');
const env = require('../constants');
const date = require('date-and-time')

//////get merchant unique id
exports.getRandomId = function(req,res,value)
{
    return (ran('Aa0', 12));
}

//////get Hash Value
exports.getHashValue = function(req,res,value)
{
    var password = hash.generate(value);

    return password;
}

exports.getReferralCode = function(req,res)
{
    return (ran('A0', 8));
}

/////get Time
exports.getTime = function()
{
    var dt = new Date();
    var format = date.format(dt,'Y/MM/DD HH:mm:ss');

    return format;
}

exports.getEndTime = function(End_dt,n)
{
    End_dt = new Date(End_dt.setDate(End_dt.getDate() + (n * 1)));
    const format = date.format(End_dt,'Y/MM/DD HH:mm:ss');

    return format;
}

exports.countdays = function(s_date,e_date)
{
    var date1 = new Date(s_date);
    var date2 = new Date(e_date);

    var difference_in_time = date2.getTime() - date1.getTime();
    var difference_in_days = difference_in_time / (1000 * 3600 * 24);

    return difference_in_days;
}

//////convert timestramp to date
exports.getDate = function(timestramp_date)
{
    var a = new Date(timestramp_date * 1000);

    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec ;

    return time;
}