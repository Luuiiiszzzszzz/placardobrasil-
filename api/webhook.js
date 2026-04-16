export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  try {
    const body = req.body || {};
    const type = body.type;
    const data = body.data;

    if (type === 'payment' && data?.id) {
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const payment = await mpRes.json();

      if (payment.status === 'approved') {
        const ref = payment.external_reference;
        if (ref && ref.includes('|')) {
          const [candidato, valor] = ref.split('|');

          await fetch(`${SUPABASE_URL}/rest/v1/rpc/incrementar_votos`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_candidato: candidato, p_valor: Number(valor) })
          });

          await fetch(`${SUPABASE_URL}/rest/v1/transacoes`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              candidato,
              valor: Number(valor),
              payment_id: String(data.id)
            })
          });
        }
      }
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: true });
  }
}
