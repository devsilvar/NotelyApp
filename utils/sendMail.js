const nodemailer = require('nodemailer')


//create a transport ---
const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure:false,
    auth:{
        user:process.env.NODEMAILER_EMAIL,
        pass:process.env.NODEMAILER_PASSWORD
    },
    connectionTimeout : 10000,
    greetingTimeout: 10000,
    socketTimeout:10000,
})



///function to starts neidng our mails 
const sendMail = async function ({to , subject , html}){
   try{
    const info = await transport.sendMail({
        from: `"Notely Application"  <${process.env.NODEMAILER_EMAIL}>`,
        to:to,
        subject:subject,
        html:html
    })
    console.log(info)
    console.log(`Email sent to ${info.message}`)
    return info   
   }catch(err){
     console.log(`Email Failed to send to ${to} ${err.message}`)
   }
}


//welcome email template
const welcomeMail = (firstName) =>({
    subject:"Welcome to Notely App",
    html:`
    <h2>Welcome ${firstName}</h2>
    <p>We are Happy to have you use Our Application</p>
    <p>You can manage your tasks with our Application</p>

    <p>Thanks For Joining</p>
    `
})


const verificationCodeMessage = (code) =>({
    subject:"Forget Password Code",
    html:`
     <div>
     <p>Your verification Code</p>

     <h2>${code}</h2>

     <p>It expires in 5 minutes</p>
     </div>
    `
})


module.exports = {sendMail , verificationCodeMessage , welcomeMail}


