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

} = require('../controllers/ambassdor');


const {isAuthenticated} = require('../middleware/auth');
const router = express.Router();


router.route('/register').post(register);

router.route('/login').post(login);

router.route('/logout').get(logout);

router.route('/update/password').put(isAuthenticated, updatePassword);

router.route('/update/profile').put(isAuthenticated, updateProfile);

router.route('/delete/me').delete(isAuthenticated, deleteMyProfile);

router.route('/me').get(isAuthenticated, myProfile);

router.route('/forgot/password').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

module.exports = router;