const Joi = require("joi")



const createNoteSchema = Joi.object({
   body: Joi.object({
    title: Joi.string().required(),
    content:Joi.string().required(),
    tags:Joi.string().optional(),
    }),
   query:Joi.object(),
   params:Joi.object()
})


const updateNoteSchema = Joi.object({
   body: Joi.object({
    title: Joi.string().required(),
    content:Joi.string().required(),
    tags:Joi.string().optional(),
    }),
   query:Joi.object(),
   params:Joi.object({
    id:Joi.string().required()
   })
})

module.exports = {createNoteSchema ,updateNoteSchema}