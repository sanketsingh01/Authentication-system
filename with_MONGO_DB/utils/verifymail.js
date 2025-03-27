import nodemailer from "nodemailer";

const mail = async (userMail, token) => {
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
    subject: "verify your mail",
    text: `Please verify your email address:
              ${process.env.BASE_URL}/api/v1/users/verify/${token}
              `,
  };

  await transporter.sendMail(mailOptins);
};

export default mail;
