const NoteModel = require('../model/noteModel')
const cloudinary = require("../config/cloudinary")
const {uploadToCloudinary} = require("../middleware/upload")

const formatNote = (note) =>({
    title: note.title,
    content: note.content,
    tags: note.tags,
    isArchived: note.isArchived,
    isPinned: note.isPinned,
    coverImage:note.coverImage
})


// "work,play,jump"
// ["work" , "play" , "jump"]
//frontend ===> ["wrok" , "play" , "jump" , "fly"]
//frontedn ===> "work,play,jump,fly"==> ["work" ,"play"]

const normalize = (tags)=>{
   if(Array.isArray(tags)){
    return tags.map(item => String(item).trim()).filter(Boolean)
   }

   if(typeof tags === "string"){
    return tags.split(",").map(item => item.trim()).filter(Boolean)
   }
    return []
}


//getting all the user notes
exports.getAllNotes = async (req, res, next)=>{
    const {userId} = req.user

    // notes/:id?page=3?archived=true
    try{
      //extarct pagination query
       const page = parseInt(req.query.page) || 1
       const limit = parseInt(req.query.limit) || 20
       const skip = (page - 1) * limit
       
       const filter = {user:userId , isArchived: req.query.archived == "true"}

    //    tags="work,play,weather" ==> ["work " , 'play' , "filter"]
       //tags
       const tagsParams = req.query.tags || req.query.tag
       if(tagsParams){
        const tagArray = tagsParams.split(",").map(item => item.trim()).filter(Boolean)
        if(tagArray.length > 0){
            filter.tags = {$in : tagArray}
        }
       }

       ///note/:id?search=uvisdvuv
       const search = req.query.search?.trim()
       if(search){
        filter.$or = [
              {title: {$regex : search , $options: "i"}},
              {content: {$regex : search , $options: "i"}}
          ]
        }        
        const totalNotes = await NoteModel.countDocuments(filter)
        
        const allNotes = await NoteModel.find(filter).skip(skip).limit(limit).sort({createdAt: -1})

        // console.log(allNotes , "allnote")

        if(allNotes.length == 0){
            return res.status(200).json({
              message: 'no notes has been created'
            })
        }

        const totalPage =  Math.ceil(totalNotes/limit)

        res.status(200).json({
            message: 'scuessfully fecthed all notes',
            data : allNotes,
            pagination: {
                curentPage: page ,
                totalPage: totalPage,
                limit: limit,
                hasNextPage: page < totalPage,
                hasPrevPage: page > 1
            }
        })
    }catch(err){
   console.log(err)
   next(err)
    }
}



exports.createNewNote = async(req, res, next)=>{
    const {userId} = req.user
    try{
        const {title , content , tags} = req.body

        const note = await NoteModel.create({title , content , tags : normalize(tags) , user:userId})

        res.status(201).json({
            message:"Note created sucessfully",
            data:formatNote(note)
        })
    }catch(err){
        console.log(err)
        next(err)
    }
}

// /note/:id/
exports.getNote = async(req, res, next) =>{
    const {userId} = req.user
    try{
   const singleNote = await NoteModel.findOne({_id:req.params.id , user:userId})

   if(!singleNote){
    return next(AppError("Error Getting Note" , 400))
   }

   res.status(200).json({
    message:"Sucesfully fetched Note",
    data: formatNote(singleNote)
   })

    }catch(err){
        console.log(err)
        next(err)
    }
}

exports.updateNote = async(req, res, next)=>{
    const {userId} = req.user
    const {title  , content, tags} = req.body

    const userUpdate = {}
    if(req.body.title !== undefined) userUpdate.title = req.body.title
    if(req.body.content !== undefined) userUpdate.title = req.body.title
    if(req.body.tags !== undefined) userUpdate.tags=  normalize(req.body.tags)


    try{
    const note = await NoteModel.findByIdAndUpdate(req.params.id , userUpdates , {runValidators:true, returnDocument: "after"})
    
    if(!note){
        return next(AppError("Error fetching note" , 400))
    }
    
    res.status(200).json({
        message: "Successfully updated Note",
        data: formatNote(note)
    })
    }catch(err){
    console.log(err)
    next(err)
    }
}

//:id/
exports.deleteNote = async(req, res, next)=>{
     const {userId} = req.user
    try{
        const note = await NoteModel.findOne({_id:req.params.id , user: userId})

        if(!note){
            return next(AppError("Note not found" , 400))
        }

       //add the code to remove any profile image from cloudinary
       if(note.coverImage.url && note.coverImage.publicId){
        await cloudinary.uploader.destroy(note.coverImage.publicId)
       }   
 
      //delete the note
      await note.deleteOne()
        
        res.status(200).json({
            message:"sucesfully deleted Note"
        })
   
    }catch(err){
       console.log(err)
       next(err)
    }
}

// notes/:id
exports.uploadCoverImage = async(req, res, next)=>{
    const {userId} = req.user
    try{
       ///wether the user has turly uploadede a file
       if(!req.file){
         return next(AppError("Kinldy Upload an image" , 400))
       }

       //find that particult post that we wnat to update the cover image
       const note = await NoteModel.findOne({_id:req.params.id , user:userId})

       if(!note){
          return next(AppError("Note not found" , 400))  
       }

       //check whetehr there is a cover image for that note or not
       if(note.coverImage.url && note.coverImage.publicId){
        await cloudinary.uploader.destroy(note.coverImage.publicId)
       }



       //upload to cloudinary
       const result = await uploadToCloudinary(req.file.buffer , {
        folder: "notelyApp/covers",
       transformation:[{width:'400' , height: '400' , crop:'fill' , gravity:"north"}],
          resource_type:"image" ,
       })

       //get results new url and new profile image id
       note.coverImage = {
        url: result.secure_url,
        publicId: result.public_id
       }

       await note.save()
        res.status(200).json({
            message:"Cover image sucessfully updated",
            data: formatNote(note)
        })
       
    }catch(err){
   console.log(err)
   next(err)
    }
}


exports.toggleArchive = async(req, res, next) =>{
    const {userId} = req.user
    try{
        const note = await NoteModel.findOne({_id:req.params.id , user:userId})

        if(!note){
            return next(AppError("Note not found" , 404))
        }

        note.isArchived = !note.isArchived
        await note.save()

        res.status(200).json({
            message: `Sucessfully ${isArchived ? "Archived" : "Restored"} Note`,
            data: formatNote(note)
        })

    }catch(err){
   console.log(err)
   next(err)
    }
}

exports.togglePin = async(req, res, next)=>{
     const {userId} = req.user
    try{
    //get the note we want to pin
    const note = await NoteModel.findOne({_id:req.params.id , user:userId})
    
    if(!note){
        return next(AppError("note not found" , 404))
    }

    // if(note.isPinned == true){
    //  note.isPinned = false
    // }else{
    //     note.isPinned = true
    // }

    note.isPinned = !note.isPinned
    await note.save()

    res.status(200).json({
        message: `Note has been ${note.isPinned ? "Pinned" : 'Unpinned'} sucessfully`
    })

    }catch(err){
    console.log(err)
    next(err)
    }
}

// has tags -- customers can see al there atgs

exports.getAllTags = async(req, res, next)=>{
    const {userId} = req.user
    try{
     const allUserTags = await NoteModel.distinct('tags' , {user: userId})
      
     if(!allUserTags){
        return next(AppError("Error fetching tags" , 404))
     }

     res.status(200).json({
        message: "Fecthed all tags",
        tags: allUserTags
     })

    }catch(err){
     console.log(err)
     next(err)
    }
}
