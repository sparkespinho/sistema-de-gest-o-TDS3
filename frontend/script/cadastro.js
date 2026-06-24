const API = 'http://localhost:3000';
const botao = document.getElementById('botao');

botao.addEventListener('click', async function () {
  const nome     = document.getElementById('nome').value.trim();
  const email    = document.getElementById('email').value.trim();
  const senha    = document.getElementById('senha').value;
  const telefone = document.getElementById('telefone').value.trim();
  //const cargo    = document.getElementById('cargo').value.trim();
  const mensagem = document.getElementById('mensagem');

  // Validação básica
  if (!nome || !email || !senha) {
    mensagem.style.color = 'red';
    mensagem.innerHTML = 'Preencha os campos obrigatórios (*)';
    return;
  }

  if (senha.length < 6) {
    mensagem.style.color = 'red';
    mensagem.innerHTML = 'A senha deve ter pelo menos 6 caracteres';
    return;
  }

  // Envia para o servidor
  const resposta = await fetch(`${API}/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha, telefone })
  });

  const dados = await resposta.json();

  if (dados.sucesso) {
    mensagem.style.color = '#91ff83';
    mensagem.innerHTML = 'Cadastro realizado com sucesso!';
    setTimeout(() => window.location.href = 'login.html', 1000);
  } else {
    mensagem.style.color = 'red';
    mensagem.innerHTML = dados.erro;
  }
});