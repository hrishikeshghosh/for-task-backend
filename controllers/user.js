const User = require("../models/User");
const Ambassdor = require("../models/Ambassdor");
const crypto = require("crypto"); 
const Otp = require("../models/Otp");
const {sendEmail} = require("../middleware/sendEmail");
const otpGenrator = require("otp-generator");
const bcrypt = require('bcrypt')

// const cloudinary = require('cloudinary') ;

exports.verifyEmail = async(req,res)=>{

    try {

        const {email} = req.body;

        if(!email){
            return res.status(400).json({
                message: "Please provide email",
                success: false
            })
        }

        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                message: "User already exists",
                success: false
            })
        }

        const OTP = otpGenrator.generate(6, { specialChars: false, alphabets: false, lowerCaseAlphabets: false, upperCaseAlphabets: false });

        console.log(OTP);
        
        const otp = new Otp({ email: email, otp: OTP });

        
        const salt = await bcrypt.genSalt(10);
        otp.otp = await bcrypt.hash(otp.otp, salt);
        await otp.save();


        const message = `You are receiving this email because you (or someone else) has requested to verify this email \n\n OTP: ${OTP}`;


        try {
            await sendEmail({
                email: email,
                subject: "Verify Email",
                message
            });
    
            res.status(200).json({
                message: `Email sent to ${email}`,
                success: true
            })
            
        } catch (error) {

            const otp = await Otp.findOne({email: email});
            await otp.remove();

            res.status(500).json({
                message: error.message,
                success: false
            })
        }
        
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}

exports.register = async(req,res)=>{

    try {


        const {name, email, password, otp} = req.body;

        if(!name || !email || !password ||!otp){
            return res.status(400).json({
                message: "Please fill all the fields",
                success: false
            })
        }

        let user = await User.findOne({email});

        if(user){
            return res.status(400).json({
                message: "User already exists",
                success: false
            })
        }

        const otpUser = await Otp.findOne({email});

        if(!otpUser){
            return res.status(400).json({
                message: "Plese verify your email first",
                success: false
            })
        }


        const validUser = await bcrypt.compare(otp, otpUser.otp);

        if(!validUser){
            return res.status(400).json({
                message: "Incorrect or Expired OTP",
                success: false
            })
        }

        
        user = await User.create({
            name,
            email,
            password, 
            avatar:{
                public_id: "sample_id",
                url: "sample_url"
            },
        });

        
             const token = await user.generateToken();

            const options = {
                expiresIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                httpOnly: true
            };

      

        res.status(200)
        .cookie("token", token, options)
        .json({
            message: "User Successfully registered",
            user,
            success: true,
        })
        
    } catch (error) {
        res.status(500).json({
            message: error,
            success: false
        })
    }
}


exports.login = async(req,res)=>{
    try {

        const {email, password} = req.body;

        const user = await  User.findOne({email}).select("+password").populate("");

        if(!user){
            return res.status(400).json({
                message: "User does not exist",
                success: false
            })
        }

        const isMatch = await user.matchPassword(password);

        if(!isMatch){
            return res.status(400).json({
                message: "Incorrect password",
                success: false
            })
        }

        const token = await user.generateToken();

        const options = {
            expiresIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        res.status(200)
        .cookie("token", token, options)
        .json({
            message: "Login successful",
            user,
            success: true,
        })


        
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}

exports.logout = async(req,res)=>{
    try {
        
        res.status(200).cookie("token", null, {expires:new Date(Date.now()), httpOnly:true}).json({
            message: "Logout successful",
            success: true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}

exports.myProfile = async(req,res)=>{

    try {

        const user = await User.findById(req.user._id).populate("");

        res.status(200).json({
            message: "User profile",
            user,
        });
        
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}

exports.updateProfile = async(req,res)=>{
    try {

        const user = await User.findById(req.user._id);

        const {name, email, avatar} = req.body;

        if(name){
            user.name = name;
        }
        if(email){
            user.email = email;
        }


        // if(avatar){
        //     await cloudinary.v2.uploader.destroy(user.avatar.public_id);

        //     const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        //         folder:"users"
        //     })

        //     user.avatar.public_id = myCloud.public_id;
        //     user.avatar.url = myCloud.secure_url;
        // }

        await user.save();

        res.status(200).json({
            message: "Profile successfully updated",
            success: true
        })        

    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}

exports.deleteMyProfile = async(req,res)=>{

    try {

        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const userId = user._id;
        const followers = user.followers;
        const following = user.following;

        // removing avatar from cloudinary

        // await cloudinary.v2.uploader.destroy(user.avatar.public_id);



        // await user.remove();

        // logout User after deleting profile
        res.cookie("token", null, {expires:new Date(Date.now()), httpOnly:true});

        res.status(200).json({
            message: "Profile successfully deleted",
            success: true
        })
        
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}


exports.forgotPassword = async(req,res)=>{


    try{

        const user = await User.findOne({email:req.body.email});

        if(!user){
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        const resetPasswordToken = user.getResetPasswordToken();

        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetPasswordToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;


        try {
            await sendEmail({
                email: user.email,
                subject: "Password reset token",
                message
            });

            res.status(200).json({
                message: `Email sent to ${user.email}`,
                success: true
            })
        }
        catch(error){

            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            res.status(500).json({
                message: error.message,
                success: false
            })
        }


    }
    catch(error){
        res.status(500).json({
            message: error.message,
        })
    }
}

exports.resetPassword = async(req,res)=>{

    try {

        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt: Date.now()},
        })

        if(!user){
            return res.status(401).json({
                message: "Invalid or expired token",
                success: false
            })
        }

        if(req.body.password ===undefined){
            return res.status(400).json({
                message: "Password is required",
                success: false
            })
        }

        user.password = req.body.password;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            message: "Password successfully updated",
            success: true
        })
        
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
        
}

exports.updatePassword = async(req,res)=>{
    
    try {

        const user = await User.findById(req.user._id).select("+password");


        const {oldPassword, newPassword} = req.body;

        if(!oldPassword || !newPassword){  
            return res.status(400).json({
                message: "Please provide both old and new password",
                success: false
            })
        }

        const isMatch = await user.matchPassword(oldPassword);

        if(!isMatch){
            return res.status(400).json({
                message: "Incorrect password",
                success: false
            })
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message: "Password successfully updated",
            success: true
        })
        
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}




// Request to buy Course
exports.referalUrlRequest = async(req,res)=>{

    try {

        const user = await User.findById(req.user._id);
        

        if(!user){
            res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        const {coursePrice, courseName, courseId} = req.body;

        // For checking if user has already enrolled for this course
        user.course.map((item)=>{
            if(item.courseId === courseId){
                return res.status(400).json({
                    message: "You have already enrolled in this course",
                    success: false
                })
            }
        })


        // To check if this is referral request or not 
        if(req.params.id!=0){
            const invitor = await User.findById(req.params.id);

            if(!invitor){
                res.status(404).json({
                    message: "Link is not valid",
                    success: false
                })
            }

            console.log(invitor.points);

            invitor.points = invitor.points ? invitor.points + (coursePrice*5)/100 : (coursePrice*5)/100;

            await invitor.save();

            user.courses.push({
                course: courseName,
                price: coursePrice,
            })

            await user.save();
        }
        else{
            user.courses.push({
                course: courseName,
                price: coursePrice,
            })

            await user.save();
        }


        res.status(200).json({
            message: "Course Successfully added",
            success: true
        })
        
        
    } catch (error) {
        res.status(500).json({
            message: error.message,
            success: false
        })
    }
}