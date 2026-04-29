const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── Email transporter (Gmail / Google Workspace) ──
function getMailer() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });
}

// ── Email templates ──
const emailTemplates = {
  de: (name) => ({
    subject: 'Du bist dabei — BiRD',
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <div style="padding: 32px 0 24px; border-bottom: 1px solid #e0e0e0;">
          <strong style="font-size: 18px; letter-spacing: 0.02em;">BiRD</strong>
        </div>
        <div style="padding: 32px 0;">
          <p style="font-size: 15px; line-height: 1.7; color: #333;">Hey ${name},</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333;">Killer, dass du dich angemeldet hast.</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333;">Wir bauen gemeinsam etwas, das allen Artists ihre Rechte zur&uuml;ckgibt &mdash; und daf&uuml;r sorgt, dass dein Geld da landet, wo es hingeh&ouml;rt: bei dir.</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333;">Wir melden uns pers&ouml;nlich bei dir, sobald dein Zugang bereit ist.</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin-top: 24px;">In der Zwischenzeit &mdash; <strong>mach Mukke.</strong></p>
          <p style="font-size: 14px; line-height: 1.7; color: #999; margin-top: 32px;">Dein BiRD Team</p>
        </div>
        <div style="padding: 24px 0; border-top: 1px solid #e0e0e0;">
          <table cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif;">
            <tr>
              <td style="padding-right: 20px; border-right: 2px solid #0000DB;">
                <strong style="font-size: 14px; color: #000; letter-spacing: 0.03em;">BiRD</strong>
              </td>
              <td style="padding-left: 20px;">
                <span style="font-size: 12px; color: #666;">Your System. Your Sound. Your Rights.</span><br>
                <a href="https://birdandcompany.de" style="font-size: 12px; color: #0000DB; text-decoration: none;">birdandcompany.de</a>
                <span style="font-size: 12px; color: #ccc;"> &middot; </span>
                <a href="mailto:hello@birdandcompany.de" style="font-size: 12px; color: #0000DB; text-decoration: none;">hello@birdandcompany.de</a>
              </td>
            </tr>
          </table>
        </div>
        <div style="padding: 16px 0 0; font-size: 10px; color: #bbb; line-height: 1.5;">
          Diese E-Mail wurde automatisch versendet. <a href="https://birdandcompany.de/datenschutz.html" style="color:#999;text-decoration:underline;">Datenschutz</a> &middot; <a href="https://birdandcompany.de/impressum.html" style="color:#999;text-decoration:underline;">Impressum</a>
        </div>
      </div>
    `,
  }),
  en: (name) => ({
    subject: "You're in — BiRD",
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <div style="padding: 32px 0 24px; border-bottom: 1px solid #e0e0e0;">
          <strong style="font-size: 18px; letter-spacing: 0.02em;">BiRD</strong>
        </div>
        <div style="padding: 32px 0;">
          <p style="font-size: 15px; line-height: 1.7; color: #333;">Hey ${name},</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333;">Amazing that you signed up.</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333;">We're building something that gives every artist their rights back &mdash; and makes sure your money ends up where it belongs: with you.</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333;">We'll reach out personally once your access is ready.</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin-top: 24px;">Until then &mdash; <strong>make music.</strong></p>
          <p style="font-size: 14px; line-height: 1.7; color: #999; margin-top: 32px;">Your BiRD Team</p>
        </div>
        <div style="padding: 24px 0; border-top: 1px solid #e0e0e0;">
          <table cellpadding="0" cellspacing="0" style="font-family: Helvetica, Arial, sans-serif;">
            <tr>
              <td style="padding-right: 20px; border-right: 2px solid #0000DB;">
                <strong style="font-size: 14px; color: #000; letter-spacing: 0.03em;">BiRD</strong>
              </td>
              <td style="padding-left: 20px;">
                <span style="font-size: 12px; color: #666;">Your System. Your Sound. Your Rights.</span><br>
                <a href="https://birdandcompany.de" style="font-size: 12px; color: #0000DB; text-decoration: none;">birdandcompany.de</a>
                <span style="font-size: 12px; color: #ccc;"> &middot; </span>
                <a href="mailto:hello@birdandcompany.de" style="font-size: 12px; color: #0000DB; text-decoration: none;">hello@birdandcompany.de</a>
              </td>
            </tr>
          </table>
        </div>
        <div style="padding: 16px 0 0; font-size: 10px; color: #bbb; line-height: 1.5;">
          This email was sent automatically. <a href="https://birdandcompany.de/datenschutz.html" style="color:#999;text-decoration:underline;">Privacy</a> &middot; <a href="https://birdandcompany.de/impressum.html" style="color:#999;text-decoration:underline;">Imprint</a>
        </div>
      </div>
    `,
  }),
};

// ── API endpoint: Waitlist signup ──
app.post('/api/waitlist', async (req, res) => {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE } = process.env;

  if (!AIRTABLE_TOKEN) {
    console.error('AIRTABLE_TOKEN not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // 1. Save to Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields: req.body.fields }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Airtable error:', JSON.stringify(err, null, 2));
      return res.status(response.status).json({ error: 'Airtable error', details: err });
    }

    const data = await response.json();

    // 2. Send confirmation email (non-blocking)
    const mailer = getMailer();
    if (mailer && req.body.fields['E-MAIL']) {
      const lang = req.body.lang === 'en' ? 'en' : 'de';
      const name = req.body.fields['VORNAME'] || 'du';
      const template = emailTemplates[lang](name);

      mailer.sendMail({
        from: `BiRD <${process.env.GMAIL_USER}>`,
        to: req.body.fields['E-MAIL'],
        subject: template.subject,
        html: template.html,
      }).catch(err => console.error('Email error (non-blocking):', err.message));
    }

    res.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BiRD running on port ${PORT}`));
