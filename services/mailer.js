const nodemailer = require("nodemailer");
const { configDotenv } = require("dotenv");
configDotenv({path:"./config.env"});



const transporter = nodemailer.createTransport({
  service:'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "as7686854@gmail.com",
    // pass: "ijzr cjmo qjqr rvxf",
    pass:process.env.MAIL_PASSWORD
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendSGMail({from,to,subject,text,html,attachments}) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: "Hello this is deom", // plain text body
    html: html, // html body
    attachments
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

// main().catch(console.error);




exports.sendEmail = async (args) => {
  if (process.env.NODE_ENV === "development") {
    return new Promise.resolve();
  } else {
    return sendSGMail(args);
  }
};