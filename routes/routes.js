var express = require('express');
var router = express.Router();
var authMiddleware = require('../middleware/authMiddleware')
const signupController = require('../controller/signupController');
const storeController = require('../controller/storeController');
const loginController = require('../controller/loginController');
const userPermissionsController = require('../controller/userPermissionsCon');
const paymentController = require('../controller/paymentController');
const plansController = require('../controller/plansController');

////Register User
router.post('/RegisterUser', signupController.registerUser);

////Store Setup
router.post('/storeSetup', storeController.storeSetup);

//////Billing Details
router.post('/billingDetails', signupController.billingDetails);

//////Billing Details
router.post('/checkPromocode', signupController.checkPromocode);

//////Website Setup
router.post('/websiteSetup', signupController.websiteSetup);

//////Login User
router.post('/loginUser', loginController.loginUser);

//////Referral code validation
router.post('/checkReferralCode', signupController.checkReferralcode);

//////Reset Password
router.post('/resetPassword', loginController.resetPassword);

//////Save Store Owner Deatails
router.post('/saveStoreOwnerDetails', authMiddleware.AuthMiddleware(),storeController.saveStoreOwnerDetails);

//////change password of store owner
router.post('/changePassword',authMiddleware.AuthMiddleware(), storeController.changePassword);

//////Add secondary email of store owner
router.post('/secondaryEmail', authMiddleware.AuthMiddleware(),storeController.secondaryEmail);

//////Add User with email invitation
router.post('/addUser',authMiddleware.AuthMiddleware(),userPermissionsController.addUser);

//////get all sub-user list
router.post('/getallSubUser',authMiddleware.AuthMiddleware(),userPermissionsController.getallSubUser);

//////Manage sub-user records
router.post('/manageUser',authMiddleware.AuthMiddleware(),userPermissionsController.manageUser);

//////change password of sub-user
router.post('/resetsubUserPassword',authMiddleware.AuthMiddleware(),userPermissionsController.resetsubUserPassword);

//////Delete sub-user
router.post('/deleteSubUser',authMiddleware.AuthMiddleware(),userPermissionsController.deleteSubUser);


///////////////////////////All Payment related routes/////////////////////////

//////get all plan records
router.post('/getAllPlans',paymentController.getAllPlans);

//////get user all details with permissions
router.post('/getuserDetails',authMiddleware.AuthMiddleware(),paymentController.getuserDetails);

//////get user all plan details
router.post('/getUserPlanDetails',authMiddleware.AuthMiddleware(),plansController.getUserPlanDetails);

//////update user billing details
router.post('/updateBillingAddress',authMiddleware.AuthMiddleware(),plansController.updateBillingAddress);

//////Cancel plan
router.post('/cancelplan',authMiddleware.AuthMiddleware(),plansController.cancelplan);

/////apply subscription plan according to choose plan
router.post('/applyUserSubscription',authMiddleware.AuthMiddleware(),plansController.applyUserSubscription);

module.exports = router;