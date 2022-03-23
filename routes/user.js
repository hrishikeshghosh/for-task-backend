const express = require('express');
const {register,
    login,
   
    logout,
    updatePassword,
    updateProfile,
    deleteMyProfile,
    myProfile,
    forgotPassword,
    resetPassword,
    referalUrlRequest,
    verifyEmail,

} = require('../controllers/user');


const {isAuthenticated} = require('../middleware/auth');
const router = express.Router();


router.route('/user/verify/email').post(verifyEmail);

router.route('/user/register').post(register);

router.route('/user/login').post(login);

router.route('/user/logout').get(logout);

router.route('/user/update/password').put(isAuthenticated, updatePassword);

router.route('/user/update/profile').put(isAuthenticated, updateProfile);

router.route('/user/delete/me').delete(isAuthenticated, deleteMyProfile);

router.route('/user/me').get(isAuthenticated, myProfile);

router.route('/user/forgot/password').post(forgotPassword);

router.route('/user/password/reset/:token').put(resetPassword);

router.route('/user/course/:id').post(isAuthenticated, referalUrlRequest);

module.exports = router;