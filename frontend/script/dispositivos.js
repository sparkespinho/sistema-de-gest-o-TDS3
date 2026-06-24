const lista = document.getElementById('lista');
const botao = document.getElementById('addbtn');

// Carregar dispositivos do banco ao abrir a página
async function carregarDispositivos() {
  const resposta = await fetch('http://localhost:3000/dispositivos');
  const dispositivos = await resposta.json();

  lista.innerHTML = '';
  dispositivos.forEach(d => adicionarNaTela(d.id, d.nome));
}

// Adiciona o item na tela
function adicionarNaTela(id, nome) {
  const item = document.createElement('li');
  item.textContent = nome;

  const removerItem = document.createElement('button');
  removerItem.textContent = 'remover';
  removerItem.style.marginLeft = '8px';

  removerItem.addEventListener('click', async () => {
    await fetch('http://localhost:3000/dispositivo/' + id, { method: 'DELETE' });
    item.remove();
    removerItem.remove();
  });

  item.appendChild(removerItem);
  lista.appendChild(item);
}

// Salva no banco e adiciona na tela
botao.addEventListener('click', async function (event) {
  event.preventDefault();

  const itemConteudo = document.getElementById('item');
  const nome = itemConteudo.value.trim();

  if (!nome) return;

  const resposta = await fetch('http://localhost:3000/dispositivo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome })
  });

  const resultado = await resposta.json();

  if (resultado.sucesso) {
    adicionarNaTela(resultado.id, nome);
    itemConteudo.value = '';
  } else {
    alert('Erro ao salvar: ' + resultado.erro);
  }
});

carregarDispositivos();