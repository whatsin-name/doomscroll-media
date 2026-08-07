require('dotenv').config();
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const TO_EMAIL = process.env.SMTP_TO || 'hello@doomscrollmedia.in';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/send', async (req, res) => {
  const { name, email, type, company, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Name, email, and message are required.' });
  }

  try {
    await transporter.sendMail({
      from: `"Doomscroll Media Site" <${process.env.SMTP_USER}>`,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New lead: ${name}${company ? ' (' + company + ')' : ''}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Type: ${type || 'n/a'}`,
        `Company/handle: ${company || 'n/a'}`,
        '',
        message,
      ].join('\n'),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to send email:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to send message.' });
  }
});

app.listen(PORT, () => {
  console.log(`Doomscroll Media running on port ${PORT}`);
});
