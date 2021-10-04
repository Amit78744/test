module.exports = {

    SMTP_HOST: 'smtp.gmail.com',
    SMTP_POST: '465',
    //SMTP_USER: 'devloper.chetan@gmail.com',
    SMTP_USER: 'amitambaliya4@gmail.com',
    //SMTP_PASSWORD: 'wkcmkthvepdxwkxb',
    SMTP_PASSWORD:'tkmohdxpzprfvclu',

    fn : require('./functions/authFunction'),
    con : require('./config/database'),
    Joi : require('@hapi/joi'),
    stripe : require('stripe')('sk_test_VqGiTMDK2Ce9Ea2VoqtMVrAy00ieIN2TBT'),
    nodemailer : require('nodemailer'),
    Jwt : require('jsonwebtoken'),
    hash : require('password-hash'),
    nodemailer : require('nodemailer'),
    cron : require('node-cron'),
};