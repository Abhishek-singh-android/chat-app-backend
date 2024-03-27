const mongoose = require("mongoose");
const crypto = require("crypto");
const bcryptjs = require("bcryptjs/dist/bcrypt");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:[true,"First Name is required"],
    },
    lastName:{
        type:String,
        required:[true,"Last Name is required"],
    },
    avatar:{
        type:String,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        validate:{
            validator:function (email){
                return String(email).toLowerCase().match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
            },
            message: (props)=> `Email (${props.value}) is invalid!`,
        },
    },
    password:{
        type:String,
    },
    passwordConfirm:{
        type:String,
    },
    // this will be useful to make sure like whenever the user changes its password and if the user is logged in to multiple devices at the same time
    // then we log the user out from all those devices
    passwordChangedAt:{
        type:Date,
    },
    passwordResetToken:{
        type:String
    },
    // if we want functionality that you have certain time after that link expire type then we use it
    passwordResetExpires:{
        type:Date,
    },
    createdAt:{
        type:Date
    },
    updatedAt:{
        type:Date
    },
    verified:{
        type:Boolean,
        default:false,
    },
    otp:{
        type:String,
    },
    otp_expiry_time:{
        type:Date,
    },
    socket_id:{
        type:String,
    },
    friends:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"User",
        }
    ],
    status:{
        type:String,
        enum:["Online","Offline"]
    }

});


userSchema.pre("save",async function(next){
    // only run this fun if otp is actually modified
    if (!this.isModified("otp") || !this.otp) return next();

    console.log("user.js ",this.otp);

    // Hash the OTP with the cost of 12 
    this.otp = await bcryptjs.hash(this.otp.toString(), 12);

    next();
});

userSchema.pre("save",async function(next){
    // only run this fun if password is actually modified
    if(!this.isModified("password")) return next();

    // Hash the password with the cost of 12 
    this.password = await bcryptjs.hash(this.password,12) 

    next();
});



userSchema.methods.correctPassword = async function (candidatePassword,userPassword){
    return await bcryptjs.compare(candidatePassword,userPassword)
}

userSchema.methods.correctOTP = async function (candidateOTP,userOTP){
    return await bcryptjs.compare(candidateOTP,userOTP)
}

userSchema.methods.createPasswordResetToken = function(){

    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.passwordResetExpires = Date.now() + 10*60*1000 // 10 mins 

    return resetToken;
}

userSchema.methods.changedPasswordAfter = function(timestamp){
return timestamp < this.passwordChangedAt;
}

const User = new mongoose.model("User",userSchema);

module.exports = User;
