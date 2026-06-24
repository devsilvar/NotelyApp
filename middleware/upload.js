//multer
//stremeifier
//cloudinary

//multer saves teh files on your disk /// computer memeory
//client send files ----multer holds teh files in RAM --
//uploaded to cloudinary---stremifier to help strem it into cloudinary
//cloudinary will return a picture_url --- id of teh image
//it wil be stored in your mongodb datase

const multer = require('multer')
const streamifier = require('streamifier')
const cloudinary = require("../config/cloudinary")
const AppError = require("../utils/AppError")


//get the picture and keep in the picture in the mmeory storage
const memoryStorage = multer.memoryStorage()


const imageFile = (req, file, cb)=>{
    if(file.mimetype.startsWith('image/')){
        cb(null , true)
    }else{
        cb(AppError("Only Image Files are allowed" , 400) , false)
    }
}

//instantiating the image just before sending
const uploadProfilePicture = multer({
    storage: memoryStorage,
    fileFilter : imageFile,
    limits: {fileSize: 2 * 1024 * 1024} , //2MB
});


const uploadToCloudinary = (fileBuffer , options) =>{

    return new Promise((resolve, reject)=>{
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error , result) =>{
            if(error) return reject(error);
            resolve(result) 
        }
      );
      streamifier.createReadStream(fileBuffer).pipe(uploadStream)
    })
    }


    module.exports = {uploadProfilePicture , uploadToCloudinary}


