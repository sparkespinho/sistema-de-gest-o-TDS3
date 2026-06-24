// ─────────────────────────────────────────────────────────────────
// UTILITÁRIO DE API
// Envia o token JWT automaticamente em todas as requisições
// ─────────────────────────────────────────────────────────────────

//const API = 'http://localhost:3000';

async function apiFetch(url, options = {}) {
  const token = sessionStorage.getItem('token');

  // Adiciona o token no cabeçalho de todas as requisições
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const resposta = await fetch(`${API}${url}`, { ...options, headers });

  // Se o token expirou ou é inválido, redireciona para o login
  if (resposta.status === 401) {
    sessionStorage.clear();
    alert('Sessão expirada. Faça login novamente.');
    window.location.href = 'login.html';
    return null;
  }

  return resposta;
}