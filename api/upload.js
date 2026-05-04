// Vercel Serverless Function: receives a photo from the browser, uploads it
// to Vercel Blob using the server-side token, returns the public URL.
//
// The token comes from the BLOB_READ_WRITE_TOKEN environment variable, which
// Vercel injects automatically for any Blob store connected to this project.
// The browser never sees the token.

import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // we handle the raw stream ourselves
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const filename = req.query.filename || `photo-${Date.now()}`;
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    // Collect the raw request body into a Buffer.
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    if (buffer.length === 0) {
      res.status(400).json({ error: 'Empty body' });
      return;
    }

    const blob = await put(`nra2026/${Date.now()}-${filename}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
