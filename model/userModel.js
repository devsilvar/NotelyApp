const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema({
    firstName:{
        type:String,
        required: [true , "FirstName is required"],
        trim:true,
        minLength:[2 , "firstName cannot be less than 2 character"],
        maxLength:[50 , "firstName cannot more less than 50 character"]
    },
    lastName:{
        type:String,
        required: [true , "LastName is required"],
        trim:true,
        minLength:[2 , "LastName cannot be less than 2 character"],
        maxLength:[50 , "LastName cannot more less than 50 character"]
    },
    email:{
        type:String,
        required: [true , "Email is required"],
        trim:true,
        lowercase:true,
        unique:true,
        minLength:[2 , "LastName cannot be less than 2 character"],
    },
    role:{
        type:String,
        enum:{
            values:["admin" , "customer"],
            message:"Role must be admin or customer"
        },
        required:[true , "You must enter a role"]
    },
    password:{
        type:String,
        required:[true , "You have to enter a password"],
        minLength:[6 , "Password cannot be less than 6 charcters"],
        required:true,
        select:false
    },
    profileImage:{
        type:String,
        default:null
    },
    profileImagePublicId:{
        type:String,
        default:null,
        select:false
    },
    forgetPasswordCode:{
        type:String,
        select:false
    },
    forgetPasswordVerificationTime:{
        type:Date,
        select:false
    },
    isActive:{
        type:Boolean,
        default:true
    } 
},{
    timestamps:true,
    collection:'notelyUser'
})


//we dont save passwrd directly to our databse
userSchema.pre("save" , async function(){
    //if the password chnages
    if(!this.isModified("password")) return;
    
    //however if it changes
    this.password = await bcrypt.hash(this.password , 12);
})


// check the pasword sent to compare with teh one being hased
userSchema.methods.checkPassword = async function(typedPassword){
    const checkPassword = await bcrypt.compare(typedPassword , this.password)
    return checkPassword
}


const UserModel = mongoose.model("User"  , userSchema)
module.exports = UserModel;