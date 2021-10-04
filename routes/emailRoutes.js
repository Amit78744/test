var express = require('express');
var router = express.Router();
const emailController = require('../controller/emailController');
const loginController = require('../controller/loginController');

///////Sent Email for verification
router.post('/emailVerification', emailController.emailVerification);

///////Resend Email for verification
router.post('/ResendEmailVerification', emailController.emailVerification);

//////Email Verification API
router.get('/verifyEmail/:token', emailController.verifyEmail);

//////Email Verification API
router.post('/checkEmailVerification', emailController.checkEmailVerification);

//////forgot password email send erification code to user
router.post('/forgotPassword', loginController.forgotPassword);

//////Verify OTP API
router.post('/verifyOTP', loginController.verifyOTP);

module.exports = router;