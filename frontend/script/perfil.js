const API = 'http://localhost:3000';

// Pega o id do usuário logado salvo no sessionStorage pelo login
const usuarioId   = sessionStorage.getItem('usuario_id');
const usuarioNome = sessionStorage.getItem('usuario_nome');

if (!usuarioId) {
  window.location.href = 'login.html';
}

// CARREGAR DADOS 

async function carregarPerfil() {
  // Busca dados do usuário com o perfil junto
  const r = await apiFetch(`/usuario/${usuarioId}`);
  const u = await r.json();

  // Preenche o avatar com a inicial do nome
  document.getElementById('avatar').textContent = u.nome?.charAt(0).toUpperCase() || '👤';
  document.getElementById('usuario-nome').textContent  = u.nome;
  document.getElementById('usuario-email').textContent = u.email;

  // Informações somente leitura
  document.getElementById('info-telefone').textContent = u.telefone || '—';
  document.getElementById('info-cargo').textContent    = u.cargo    || '—';

  // Badge de permissão colorido
  const permissao = u.permissao || 'visualizador';
  const badgeClass = {
    admin:        'badge-admin',
    tecnico:      'badge-tecnico',
    visualizador: 'badge-visualizador'
  }[permissao] || 'badge-visualizador';

  const badgeTexto = {
    admin:        'Administrador',
    tecnico:      'Técnico',
    visualizador: 'Visualizador'
  }[permissao] || 'Visualizador';

  document.getElementById('info-permissao').innerHTML =
    `<span class="badge-permissao ${badgeClass}">${badgeTexto}</span>`;

  // Preenche campos editáveis com os valores atuais
  document.getElementById('perfil-cargo').value       = u.cargo_perfil   || '';
  document.getElementById('perfil-departamento').value = u.departamento  || '';
  document.getElementById('perfil-permissao').value   = permissao;
}

//SALVAR PERFIL

async function salvarPerfil() {
  const cargo       = document.getElementById('perfil-cargo').value.trim();
  const departamento = document.getElementById('perfil-departamento').value.trim();
  const permissao   = document.getElementById('perfil-permissao').value;
  const mensagem    = document.getElementById('mensagem');

 const r = await apiFetch(`/perfil/${usuarioId}`, {
  method: 'PUT',
  body: JSON.stringify({ cargo, departamento, permissao })
});

  const resultado = await r.json();

  if (resultado.sucesso) {
    mensagem.style.color = '#91ff83';
    mensagem.textContent = 'Perfil atualizado com sucesso!';
    // Recarrega para refletir as mudanças
    await carregarPerfil();
  } else {
    mensagem.style.color = 'red';
    mensagem.textContent = 'Erro: ' + resultado.erro;
  }
}
function deslogar() {
  sessionStorage.clear();
  window.location.href = 'login.html';
}
carregarPerfil();