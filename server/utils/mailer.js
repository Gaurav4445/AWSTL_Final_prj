let transporterPromise = null;

const isEmailEnabled = () =>
  process.env.EMAIL_ENABLED === 'true' &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_APP_PASSWORD;

const getTransporter = async () => {
  if (!isEmailEnabled()) return null;
  if (!transporterPromise) {
    transporterPromise = import('nodemailer').then(({ default: nodemailer }) =>
      nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      })
    );
  }
  return transporterPromise;
};

const sendReminderEmail = async ({ to, subject, text }) => {
  const transporter = await getTransporter();
  if (!transporter || !to) return false;

  await transporter.sendMail({
    from: `"GharSeva" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
  return true;
};

module.exports = {
  isEmailEnabled,
  sendReminderEmail,
};
