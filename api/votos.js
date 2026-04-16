const votos = { lula: 0, bolsonaro: 0 };
export default function handler(req, res) {
  res.status(200).json(votos);
}
