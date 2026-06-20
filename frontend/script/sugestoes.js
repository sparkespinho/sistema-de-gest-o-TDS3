const API = 'http://localhost:3000';

const usuarioId   = sessionStorage.getItem('usuario_id');
const usuarioNome = sessionStorage.getItem('usuario_nome');
const permissao   = sessionStorage.getItem('permissao');

if (!usuarioId) window.location.href = 'login.html';

let todasSugestoes = [];

//  CARREGAR 

async function carregarSugestoes() {
  const r = await fetch(`${API}/sugestoes?usuario_id=${usuarioId}`);
  todasSugestoes = await r.json();
  renderLista(todasSugestoes);
}

function filtrar(status, btn) {
  document.querySelectorAll('.filtros button').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');
  const filtradas = status === 'todos'
    ? todasSugestoes
    : todasSugestoes.filter(s => s.status === status);
  renderLista(filtradas);
}

//  ENVIAR

async function enviarSugestao() {
  const titulo    = document.getElementById('titulo').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const mensagem  = document.getElementById('mensagem');

  if (!titulo || !descricao) {
    mensagem.style.color = 'red';
    mensagem.textContent = 'Preencha título e descrição';
    return;
  }

  const r = await fetch(`${API}/sugestao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo, descricao, usuario_id: usuarioId })
  });
  const resultado = await r.json();

  if (resultado.sucesso) {
    document.getElementById('titulo').value    = '';
    document.getElementById('descricao').value = '';
    mensagem.style.color = '#43A047';
    mensagem.textContent = 'Sugestão enviada!';
    setTimeout(() => mensagem.textContent = '', 2000);
    await carregarSugestoes();
  } else {
    mensagem.style.color = 'red';
    mensagem.textContent = 'Erro: ' + resultado.erro;
  }
}

//CURTIR 

async function curtir(sugestaoId) {
  const r = await fetch(`${API}/sugestao/${sugestaoId}/curtir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId })
  });
  const resultado = await r.json();

  if (resultado.sucesso) {
    const btn   = document.getElementById(`btn-curtir-${sugestaoId}`);
    const count = document.getElementById(`curtidas-${sugestaoId}`);
    if (resultado.curtido) {
      btn.classList.add('curtido');
      count.textContent = parseInt(count.textContent) + 1;
    } else {
      btn.classList.remove('curtido');
      count.textContent = parseInt(count.textContent) - 1;
    }
  }
}

// COMENTÁRIOS 

function toggleComentarios(id) {
  document.getElementById(`comentarios-${id}`).classList.toggle('aberto');
}

async function comentar(sugestaoId) {
  const input = document.getElementById(`input-comentario-${sugestaoId}`);
  const texto = input.value.trim();
  if (!texto) return;

  const r = await fetch(`${API}/sugestao/${sugestaoId}/comentario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto, usuario_id: usuarioId })
  });
  const resultado = await r.json();

  if (resultado.sucesso) {
    input.value = '';
    adicionarComentarioNaTela(sugestaoId, {
      id: resultado.id, texto, usuario_nome: usuarioNome, usuario_id: usuarioId
    });
  }
}

async function excluirComentario(comentarioId) {
  confirmar(comentarioId, 'Excluir este comentário?', async () => {

  const r = await fetch(`${API}/comentario/${comentarioId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId })
  });
  const resultado = await r.json();
  if (resultado.sucesso) {
    document.getElementById(`comentario-${comentarioId}`).remove();
  } else {
    alert('Erro: ' + resultado.erro);
  }
  });
}

function adicionarComentarioNaTela(sugestaoId, c) {
  const lista = document.getElementById(`lista-comentarios-${sugestaoId}`);
  const div = document.createElement('div');
  div.className = 'comentario-item';
  div.id = `comentario-${c.id}`;
  div.innerHTML = `
    <div class="comentario-autor">${c.usuario_nome}</div>
    <div class="comentario-texto">${c.texto}</div>
    ${String(c.usuario_id) === String(usuarioId) ? `
    <div class="comentario-acoes">
      <button class="btn-remover" onclick="excluirComentario(${c.id})">Excluir</button>
    </div>` : ''}
  `;
  lista.appendChild(div);
}

// REMOVER SUGESTÃO 
async function removerSugestao(id) {
  confirmar(id, 'Remover esta sugestão?', async () => {

  const r = await fetch(`${API}/sugestao/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario_id: usuarioId })
  });
  const resultado = await r.json();
  if (resultado.sucesso) carregarSugestoes();
  else alert('Erro: ' + resultado.erro);
  });
}

//MUDAR STATUS 

async function mudarStatus(id, status) {
  const r = await fetch(`${API}/sugestao/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, usuario_id: usuarioId })
  });
  const resultado = await r.json();
  if (resultado.sucesso) carregarSugestoes();
  else alert('Erro: ' + resultado.erro);
}

//RENDERIZAÇÃO 

function renderLista(lista) {
  const container = document.getElementById('listaSugestoes');
  container.innerHTML = '';

  if (lista.length === 0) {
    container.innerHTML = '<div class="vazio">Nenhuma sugestão encontrada.</div>';
    return;
  }

  lista.forEach(s => {
    const card      = document.createElement('div');
    card.className  = `sug-card ${s.status}`;
    const badgeClass = { pendente: 'badge-pendente', implementada: 'badge-implementada', recusada: 'badge-recusada' }[s.status];
    const badgeTexto = { pendente: 'Pendente', implementada: 'Implementada', recusada: 'Recusada' }[s.status];
    const jaCurtiu  = s.ja_curtiu == 1;
    const ehAutor   = String(s.usuario_id) === String(usuarioId);
    const data      = new Date(s.criado_em).toLocaleString('pt-BR');

    card.innerHTML = `
      <div class="sug-header">
        <span class="sug-titulo">${s.titulo}</span>
        <span class="badge ${badgeClass}">${badgeTexto}</span>
      </div>
      <div class="sug-meta">Por ${s.usuario_nome || 'Usuário'} · ${data}</div>
      <div class="sug-desc">${s.descricao}</div>

      <div class="sug-acoes">
        <button class="btn-curtir ${jaCurtiu ? 'curtido' : ''}" id="btn-curtir-${s.id}" onclick="curtir(${s.id})">
          ♥ <span id="curtidas-${s.id}">${s.curtidas}</span>
        </button>
        <button class="btn-comentar" onclick="toggleComentarios(${s.id})">
          💬 ${s.total_comentarios} comentário${s.total_comentarios != 1 ? 's' : ''}
        </button>
        ${ehAutor ? `<button class="btn-remover" onclick="removerSugestao(${s.id})">Remover</button>` : ''}
        ${permissao === 'admin' ? `
        <select onchange="mudarStatus(${s.id}, this.value)" style="font-size:12px; padding:4px 8px; border-radius:6px; border:1px solid #ccc">
          <option value="pendente"     ${s.status === 'pendente'     ? 'selected' : ''}>Pendente</option>
          <option value="implementada" ${s.status === 'implementada' ? 'selected' : ''}>Implementada</option>
          <option value="recusada"     ${s.status === 'recusada'     ? 'selected' : ''}>Recusada</option>
        </select>` : ''}
      </div>

      <div class="comentarios" id="comentarios-${s.id}">
        <div id="lista-comentarios-${s.id}">
          ${(s.comentarios || []).map(c => `
            <div class="comentario-item" id="comentario-${c.id}">
              <div class="comentario-autor">${c.usuario_nome}</div>
              <div class="comentario-texto">${c.texto}</div>
              ${String(c.usuario_id) === String(usuarioId) ? `
              <div class="comentario-acoes">
                <button class="btn-remover" onclick="excluirComentario(${c.id})">Excluir</button>
              </div>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="add-comentario">
          <input id="input-comentario-${s.id}" type="text" placeholder="Escreva um comentário...">
          <button class="btn-save" onclick="comentar(${s.id})">Enviar</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

carregarSugestoes();