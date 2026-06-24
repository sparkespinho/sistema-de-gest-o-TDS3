const API = 'http://localhost:3000';
const permissao = sessionStorage.getItem('permissao');
const usuarioLogadoId = sessionStorage.getItem('usuario_id');

// Só admin pode acessar essa página
if (permissao !== 'admin') {
  alert('Acesso restrito a administradores.');
  window.location.href = 'paginainicial.html';
}

let todosUsuarios = [];

//CARREGAR 

async function carregarUsuarios() {
  const r = await apiFetch('/usuarios');
  todosUsuarios = await r.json();
  renderLista(todosUsuarios);
}

function filtrarBusca() {
  const termo = document.getElementById('busca').value.toLowerCase();
  const filtrados = todosUsuarios.filter(u =>
    u.nome.toLowerCase().includes(termo) ||
    u.email.toLowerCase().includes(termo)
  );
  renderLista(filtrados);
}

// AÇÕES

async function ativar(id) {
  await alterarStatus(id, 1);
}

async function inativar(id) {
  await alterarStatus(id, 0);
}

async function alterarStatus(id, ativo) {
  const r = await apiFetch(`/usuario/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ ativo })
});
  const resultado = await r.json();
  if (resultado.sucesso) carregarUsuarios();
  else alert('Erro: ' + resultado.erro);
}

async function excluir(id, nome) {
  confirmar(id, `Excluir o usuário "${nome}" permanentemente? Esta ação não pode ser desfeita.`, async () => {
  const r = await apiFetch(`/usuario/${id}`, {
  method: 'DELETE'
});
  const resultado = await r.json();
  if (resultado.sucesso) carregarUsuarios();
  else alert('Erro: ' + resultado.erro);
  });
}

function abrirEdicaoPermissao(id) {
  document.getElementById(`permissao-edit-${id}`).style.display = 'flex';
}

function cancelarEdicaoPermissao(id) {
  document.getElementById(`permissao-edit-${id}`).style.display = 'none';
}

async function salvarPermissao(id) {
  const permissao = document.getElementById(`select-permissao-${id}`).value;

  const r = await fetch(`${API}/perfil/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permissao, admin_id: usuarioLogadoId })
  });
  const resultado = await r.json();
  if (resultado.sucesso) carregarUsuarios();
  else alert('Erro: ' + resultado.erro);
}

//RENDERIZAÇÃO 

function renderLista(lista) {
  const container = document.getElementById('lista-usuarios');
  container.innerHTML = '';

  if (lista.length === 0) {
    container.innerHTML = '<div class="vazio">Nenhum usuário encontrado.</div>';
    return;
  }

  lista.forEach(u => {
    const ativo     = u.ativo != 0;
    const ehEuMesmo = String(u.id) === String(usuarioLogadoId);

    const permissaoTexto = { admin: 'Admin', tecnico: 'Técnico', visualizador: 'Visualizador' }[u.permissao] || 'Visualizador';
    const permissaoClass = { admin: 'badge-admin', tecnico: 'badge-tecnico', visualizador: 'badge-visualizador' }[u.permissao] || 'badge-visualizador';

    const card = document.createElement('div');
    card.className = `usuario-card ${ativo ? '' : 'inativo'}`;
    card.innerHTML = `
      <div class="usuario-header">
        <div class="usuario-info">
          <div class="usuario-nome">
            ${u.nome}
            <span class="badge ${ativo ? 'badge-ativo' : 'badge-inativo'}">${ativo ? 'Ativo' : 'Inativo'}</span>
            <span class="badge ${permissaoClass}">${permissaoTexto}</span>
            ${ehEuMesmo ? '<span class="badge" style="background:#263238">Você</span>' : ''}
          </div>
          <div class="usuario-email">${u.email}</div>
        </div>

        ${!ehEuMesmo ? `
        <div class="usuario-acoes">
          ${ativo
            ? `<button class="btn-inativar" onclick="inativar(${u.id})">Inativar</button>`
            : `<button class="btn-ativar"   onclick="ativar(${u.id})">Ativar</button>`
          }
          <button onclick="abrirEdicaoPermissao(${u.id})">Permissão</button>
          <button class="btn-excluir" onclick="excluir(${u.id}, '${u.nome.replace(/'/g, "\\'")}')">Excluir</button>
        </div>` : ''}
      </div>

      <div class="usuario-detalhes">
        ${u.telefone ? `<span>📞 ${u.telefone}</span>` : ''}
        ${u.cargo    ? `<span>💼 ${u.cargo}</span>`    : ''}
        ${u.departamento ? `<span>🏢 ${u.departamento}</span>` : ''}
        <span>Cadastrado em ${new Date(u.criado_em).toLocaleDateString('pt-BR')}</span>
      </div>

      ${!ehEuMesmo ? `
      <div class="permissao-edit" id="permissao-edit-${u.id}">
        <span style="font-size:13px; font-weight:600; color:#546E7A">Permissão:</span>
        <select id="select-permissao-${u.id}">
          <option value="visualizador" ${u.permissao === 'visualizador' ? 'selected' : ''}>Visualizador</option>
          <option value="tecnico"      ${u.permissao === 'tecnico'      ? 'selected' : ''}>Técnico</option>
          <option value="admin"        ${u.permissao === 'admin'        ? 'selected' : ''}>Administrador</option>
        </select>
        <button class="btn-salvar"   onclick="salvarPermissao(${u.id})">Salvar</button>
        <button class="btn-cancelar" onclick="cancelarEdicaoPermissao(${u.id})">Cancelar</button>
      </div>` : ''}
    `;
    container.appendChild(card);
  });
}

carregarUsuarios();