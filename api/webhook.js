export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  try {
    const { type, data } = req.body;
    if (type === 'payment' && data?.id) {
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const payment = await mpRes.json();

      if (payment.status === 'approved') {
        const candidato = payment.metadata?.candidato;
        const valor = payment.metadata?.valor;

        if (candidato && valor) {
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
              'Content-Type': 'application/json'
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
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
