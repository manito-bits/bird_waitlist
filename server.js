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

// ── Email signature (shared) ──
const signature = `
  <table cellpadding="0" cellspacing="0" style="width: 100%; max-width: 500px; border-collapse: collapse;">
    <tr>
      <td>
        <img src="https://birdandcompany.de/email-signature.png" alt="Tristan Kurt — BiRD — hello@birdandcompany.de — birdandcompany.de" width="500" style="width: 100%; max-width: 500px; height: auto; display: block; border: 0;">
      </td>
    </tr>
  </table>
`;

// ── Email templates ──
const emailTemplates = {
  de: (name) => ({
    subject: 'Du bist dabei — BiRD',
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; background: #ffffff;">
        <div style="background: #E8E8E8; padding: 32px 36px; text-align: left;">
          <img src="https://birdandcompany.de/email-logo.png" alt="BiRD" height="28" style="height: 28px; width: auto;">
        </div>
        <div style="height: 3px; background: #0000DB;"></div>
        <div style="padding: 36px 36px 20px;">
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 16px;">Hey ${name},</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 16px;">Killer, dass du dich angemeldet hast!</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 16px;">Wir bauen gemeinsam etwas, das allen Artists Kontrolle &uuml;ber ihre Musik zur&uuml;ckgeben soll &mdash; und daf&uuml;r sorgt, dass dein Geld da landet, wo es hingeh&ouml;rt: Bei dir!</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 16px;">Wir melden uns pers&ouml;nlich bei dir, sobald der Zugang bereit ist.</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 28px 0 16px;">In der Zwischenzeit &mdash; <strong>mach Mukke.</strong></p>
          <p style="font-size: 14px; line-height: 1.7; color: #999; margin: 28px 0 0;">Dein BiRD Team</p>
        </div>
        <div style="padding: 0 36px 24px;">${signature}</div>
        <div style="background: #E8E8E8; padding: 16px 36px; font-size: 10px; color: #999; line-height: 1.6;">
          Diese E-Mail wurde automatisch versendet.
          <a href="https://birdandcompany.de/datenschutz.html" style="color: #666; text-decoration: underline;">Datenschutz</a> &middot;
          <a href="https://birdandcompany.de/impressum.html" style="color: #666; text-decoration: underline;">Impressum</a>
        </div>
      </div>
    `,
  }),
  en: (name) => ({
    subject: "You're in — BiRD",
    html: `
      <div style="font-family: Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a; background: #ffffff;">
        <div style="background: #E8E8E8; padding: 32px 36px; text-align: left;">
          <img src="https://birdandcompany.de/email-logo.png" alt="BiRD" height="28" style="height: 28px; width: auto;">
        </div>
        <div style="height: 3px; background: #0000DB;"></div>
        <div style="padding: 36px 36px 20px;">
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 16px;">Hey ${name},</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 16px;">Amazing that you signed up!</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 16px;">We're building something that gives every artist control over their music back &mdash; and makes sure your money ends up where it belongs: With you!</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 0 0 16px;">We'll reach out personally once access is ready.</p>
          <p style="font-size: 15px; line-height: 1.7; color: #333; margin: 28px 0 16px;">Until then &mdash; <strong>make music.</strong></p>
          <p style="font-size: 14px; line-height: 1.7; color: #999; margin: 28px 0 0;">Your BiRD Team</p>
        </div>
        <div style="padding: 0 36px 24px;">${signature}</div>
        <div style="background: #E8E8E8; padding: 16px 36px; font-size: 10px; color: #999; line-height: 1.6;">
          This email was sent automatically.
          <a href="https://birdandcompany.de/datenschutz.html" style="color: #666; text-decoration: underline;">Privacy</a> &middot;
          <a href="https://birdandcompany.de/impressum.html" style="color: #666; text-decoration: underline;">Imprint</a>
        </div>
      </div>
    `,
  }),
};

// ── API endpoint: Waitlist signup ──
app.post('/api/waitlist', async (req, res) => {
  const { APPS_SCRIPT_URL } = process.env;

  if (!APPS_SCRIPT_URL) {
    console.error('APPS_SCRIPT_URL not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const f = req.body.fields;

    // 1. Save to Google Sheet via Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        row: [
          f['Artist Name'],
          f['VORNAME'],
          f['NACHNAME'],
          f['E-MAIL'],
          f['Catalogue Size'],
          f['GEMA Status'],
          f['Distributor'],
          f['Other Distributor (if selected)'] || '',
          f['Label'] || '',
          f['Signup Date'],
        ]
      }),
    });

    if (!response.ok) throw new Error(`Apps Script error: ${response.status}`);

    // 2. Send confirmation email (non-blocking)
    const mailer = getMailer();
    if (mailer && f['E-MAIL']) {
      const lang = req.body.lang === 'en' ? 'en' : 'de';
      const name = f['VORNAME'] || 'du';
      const template = emailTemplates[lang](name);

      mailer.sendMail({
        from: `BiRD <${process.env.GMAIL_USER}>`,
        to: f['E-MAIL'],
        subject: template.subject,
        html: template.html,
      }).catch(err => console.error('Email error (non-blocking):', err.message));
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BiRD running on port ${PORT}`));
