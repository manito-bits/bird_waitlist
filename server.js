const express = require('express');
const path = require('path');
const app = express();

// ── Serve static files (index.html, fonts, etc.) ──
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ── API endpoint: Waitlist signup ──
// Frontend calls this instead of Airtable directly.
// The Airtable token stays on the server, never visible to users.
app.post('/api/waitlist', async (req, res) => {
  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE } = process.env;

  if (!AIRTABLE_TOKEN) {
    console.error('AIRTABLE_TOKEN not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
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
    res.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Start ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`BiRD running on port ${PORT}`));
