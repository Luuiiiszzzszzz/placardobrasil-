export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  try {
    const [votosRes, transacoesRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/votos?select=candidato,valor`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      }),
      fetch(`${SUPABASE_URL}/rest/v1/transacoes?select=*&order=created_at.desc&limit=100`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
    ]);

    const votos = await votosRes.json();
    const transacoes = await transacoesRes.json();

    const result = { lula: 0, bolsonaro: 0, arrecadado: 0, transacoes: [] };

    votos.forEach(row => {
      if (row.candidato === 'lula') result.lula = row.valor;
      if (row.candidato === 'bolsonaro') result.bolsonaro = row.valor;
    });

    result.arrecadado = result.lula + result.bolsonaro;

    if (Array.isArray(transacoes)) {
      result.transacoes = transacoes;
    }

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
