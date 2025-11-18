import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendContactEmail = async (data) => {
  const { name, email, subject, message } = data;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_FROM,
    subject: `[Portfolio Contact] ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; border-bottom: 3px solid #4F46E5; padding-bottom: 10px;">Nouveau message de contact</h2>
          
          <div style="margin: 20px 0;">
            <p style="margin: 10px 0;"><strong style="color: #4F46E5;">Nom:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong style="color: #4F46E5;">Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong style="color: #4F46E5;">Sujet:</strong> ${subject}</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #4F46E5; margin: 20px 0;">
            <p style="margin: 0; color: #555; line-height: 1.6;"><strong>Message:</strong></p>
            <p style="margin: 10px 0 0 0; color: #333; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 12px;">
            <p>Ce message a été envoyé depuis votre formulaire de contact portfolio</p>
          </div>
        </div>
      </div>
    `,
  };

  const confirmationMail = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Confirmation de réception de votre message',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; border-bottom: 3px solid #4F46E5; padding-bottom: 10px;">Merci pour votre message !</h2>
          
          <p style="color: #555; line-height: 1.6;">Bonjour ${name},</p>
          
          <p style="color: #555; line-height: 1.6;">
            J'ai bien reçu votre message concernant "<strong>${subject}</strong>". 
            Je vous répondrai dans les plus brefs délais.
          </p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #4F46E5; margin: 20px 0;">
            <p style="margin: 0; color: #888; font-size: 14px;"><strong>Votre message:</strong></p>
            <p style="margin: 10px 0 0 0; color: #555; line-height: 1.6;">${message}</p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">Cordialement,</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #888; font-size: 12px;">
            <p>Ceci est un message automatique, merci de ne pas y répondre.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(confirmationMail);
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw error;
  }
};

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Configuration email validée');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration email:', error);
    return false;
  }
};
