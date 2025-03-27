import nodemailer from "nodemailer";

const resetMail = async (userMail, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  });

  const mailOptins = {
    from: process.env.MAILTRAP_SENDERMAIL,
    to: userMail,
    subject: "Reset Password",
    text: `HI, there
              
              You request to reset passowrd. Please click on the following link to change the password :
              ${process.env.BASE_URL}/api/v1/users/resetPassowrd/${token}
              
              Token valid only for 10 minutes`,
  };

  await transporter.sendMail(mailOptins);
};

export default resetMail;
