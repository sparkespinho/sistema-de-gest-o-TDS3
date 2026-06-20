const API = 'http://localhost:3000';
const btn = document.getElementById('btn');

btn.addEventListener('click', async function () {
  const email    = document.getElementById('email').value.trim();
  const senha    = document.getElementById('senha').value;
  const mensagem = document.getElementById('mensagem');

  if (!email || !senha) {
    mensagem.style.color = 'red';
    mensagem.innerHTML = 'Preencha todos os campos!';
    return;
  }

  const resposta = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });

  const dados = await resposta.json();

  if (dados.sucesso) {
    // Salva o token JWT e dados do usuário na sessão
    sessionStorage.setItem('token',         dados.token);
    sessionStorage.setItem('usuario_id',    dados.id);
    sessionStorage.setItem('usuario_nome',  dados.nome);
    sessionStorage.setItem('permissao',     dados.permissao);

    mensagem.style.color = 'green';
    mensagem.innerHTML = 'Login realizado com sucesso!';
    setTimeout(() => window.location.href = 'index.html', 800);
  } else {
    mensagem.style.color = 'red';
    mensagem.innerHTML = dados.erro;
  }
});