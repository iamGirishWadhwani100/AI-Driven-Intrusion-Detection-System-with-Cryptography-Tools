// A simple backend to securely send alerts from your dashboard.
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // For calling the Telegram API
const sgMail = require('@sendgrid/mail'); // For sending email via SendGrid
const cors = require('cors'); // To allow requests from your HTML file

const app = express();
app.use(cors()); // This allows your index.html to talk to this server
app.use(bodyParser.json());

// --- IMPORTANT: Replace these with your actual credentials ---
// It's best practice to load these from environment variables, not hard-code them.
const TELEGRAM_BOT_TOKEN = '7088223846:AAEZ8R2C2SWC1xdoOPXIUCfkPnJJJbdL_ak';
const TELEGRAM_CHAT_ID = '-4901854697'; 
const SENDGRID_API_KEY = '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';
const FROM_EMAIL = 'thedevildanger100@gmail.com'; // A verified sender email in SendGrid

sgMail.setApiKey(SENDGRID_API_KEY);

// This is the endpoint that your index.html file will call
app.post('/send-alert', async (req, res) => {
    const { recipientEmail, summaryText } = req.body;

    if (!summaryText) {
        return res.status(400).json({ message: 'Summary text is required.' });
    }

    // --- 1. Send Telegram Alert ---
    try {
        const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(telegramUrl, {
            chat_id: TELEGRAM_CHAT_ID,
            text: `*Cyber Security Scan Alert*\n\n\`\`\`\n${summaryText}\n\`\`\``,
            parse_mode: 'Markdown'
        });
        console.log('Telegram alert sent successfully.');
    } catch (error) {
        console.error('Failed to send Telegram alert:', error.response ? error.response.data : error.message);
    }

    // --- 2. Send Email Alert ---
    if (recipientEmail) {
         const msg = {
            to: recipientEmail,
            from: FROM_EMAIL,
            subject: 'Cyber Security Scan Alert',
            text: `A new threat scan has completed. Here is the summary:\n\n${summaryText}`,
            html: `<p>A new threat scan has completed. Here is the summary:</p><pre>${summaryText}</pre>`,
        };
        try {
            await sgMail.send(msg);
            console.log('Email alert sent successfully to:', recipientEmail);
        } catch (error) {
            console.error('Failed to send email alert:', error.response ? error.response.body : error.message);
        }
    }

    res.status(200).json({ message: 'Alerts processed.' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Alert server is running on http://localhost:${PORT}`);
    console.log('Waiting for requests from your dashboard...');
});