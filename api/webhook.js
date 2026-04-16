export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  console.log('Webhook recebido:', JSON.stringify(req.body));
  res.status(200).json({ ok: true });
}
