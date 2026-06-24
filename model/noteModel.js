const mongoose = require('mongoose')

const notesSchema = mongoose.Schema({
    title:{
        type:String,
        required:[true , "Title is required"],
        trim:true,
        max:[150 , "title canot be more than 150 words"]
    },
    content: {
        type:String,
        required:[true , "Title is required"],
        trim:true,
    },
    tags:{
      type:[String],
      default:[],
    },
    isArchived:{
        type:Boolean,
        default:false
    },
    isPinned:{
        type:Boolean,
        default:false
    },
    coverImage:{
        url:{type:String, default: ""},
        publicId:{type:String , default:""}
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},
{
    timestamps:true,
    collections:"notelyNotes"
})

notesSchema.index({title: "text" , content:"text"})

notesSchema.index({tags: 1})

notesSchema.index({user: 1 , createdAt: -1})


const NoteModel = mongoose.model("Note" , notesSchema)

module.exports = NoteModel