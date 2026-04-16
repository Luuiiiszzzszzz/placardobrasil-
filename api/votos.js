export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/votos?select=candidato,valor`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await response.json();
    const result = { lula: 0, bolsonaro: 0 };
    data.forEach(row => {
      if (row.candidato === 'lula') result.lula = row.valor;
      if (row.candidato === 'bolsonaro') result.bolsonaro = row.valor;
    });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
