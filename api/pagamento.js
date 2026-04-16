export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { candidato, valor } = req.body;
  if (!candidato || !valor || valor < 1 || valor > 10000) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
  const BASE_URL = process.env.BASE_URL || 'https://project-ua5yo.vercel.app';

  const nome = candidato === 'lula' ? 'Lula' : 'Bolsonaro';

  const preference = {
    items: [{
      title: `Voto para ${nome}`,
      quantity: 1,
      currency_id: 'BRL',
      unit_price: Number(valor)
    }],
    back_urls: {
      success: `${BASE_URL}/sucesso.html?cand=${candidato}&val=${valor}`,
      failure: `${BASE_URL}`,
      pending: `${BASE_URL}`
    },
    auto_return: 'approved',
    external_reference: `${candidato}|${valor}`,
    notification_url: 'https://project-ua5yo.vercel.app/api/webhook'
  };

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(preference)
    });
    const mpData = await mpRes.json();
    if (mpData.init_point) {
      return res.status(200).json({ url: mpData.init_point });
    }
    return res.status(500).json({ error: 'Erro MP', detail: mpData });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
