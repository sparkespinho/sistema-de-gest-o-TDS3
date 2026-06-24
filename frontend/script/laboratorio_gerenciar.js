const API = 'http://localhost:3000';
const permissao = sessionStorage.getItem('permissao');
const ehAdmin   = permissao === 'admin';

let labAtivo = null;

// INICIALIZAÇÃO 

async function carregarLabs() {

  if (!ehAdmin) {
    const bar = document.getElementById('add-lab-bar');
    if (bar) bar.style.display = 'none';
  }

  const resposta = await fetch(`${API}/laboratorios`);
  const labs = await resposta.json();
  document.getElementById('listaLabs').innerHTML = '';

  labs.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  labs.forEach(lab => renderBotaoLab(lab));
}

// LABORATÓRIOS 

async function adicionarLab() {
  const input = document.getElementById('novoLab');
  const nome = input.value.trim();
  if (!nome) return;

  const r = await fetch(`${API}/laboratorio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome })
  });
  const resultado = await r.json();

  if (resultado.sucesso) {
    input.value = '';
    renderBotaoLab({ id: resultado.id, nome, total: 0 });
  } else {
    alert('Erro: ' + resultado.erro);
  }
}

async function salvarEdicaoLab() {
  const nome = document.getElementById('edit-lab-nome').value.trim();
  if (!nome || !labAtivo) return;

  const r = await fetch(`${API}/laboratorio/${labAtivo}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome })
  });
  const resultado = await r.json();

  if (resultado.sucesso) {
    document.getElementById(`lab-btn-nome-${labAtivo}`).textContent = nome;
    document.getElementById('painel-titulo').childNodes[0].textContent = nome + ' ';
    fecharEdicaoLab();
  } else {
    alert('Erro: ' + resultado.erro);
  }
}

async function removerLab(id, event) {
  event.stopPropagation();
  confirmar(id, 'Remover este laboratório e todas as suas máquinas?', async () => {

  const r = await fetch(`${API}/laboratorio/${id}`, { method: 'DELETE' });
  const resultado = await r.json();

  if (resultado.sucesso) {
    document.getElementById(`lab-btn-${id}`).remove();
    if (labAtivo === id) {
      document.getElementById('painel').classList.remove('visivel');
      labAtivo = null;
    }
  } else {
    alert('Erro: ' + resultado.erro);
  }
  });
}

function abrirEdicaoLab(event) {
  event.stopPropagation();
  document.getElementById('edit-lab-nome').value =
    document.getElementById(`lab-btn-nome-${labAtivo}`).textContent;
  document.getElementById('lab-edit-row').style.display = 'flex';
}

function fecharEdicaoLab() {
  document.getElementById('lab-edit-row').style.display = 'none';
}

async function abrirPainel(lab) {
  if (labAtivo) {
    document.getElementById(`lab-btn-${labAtivo}`)?.classList.remove('ativo');
  }

  labAtivo = lab.id;
  document.getElementById(`lab-btn-${lab.id}`).classList.add('ativo');
  fecharEdicaoLab();

  // Só mostra botão de editar nome para admin
  document.getElementById('painel-titulo').innerHTML =
    `${lab.nome} ${ehAdmin ? `<button class="btn-edit btn-sm" onclick="abrirEdicaoLab(event)">Editar nome</button>` : ''}`;

  document.getElementById('maquinas-lista').innerHTML = '';
  const r = await fetch(`${API}/dispositivos/${lab.id}`);
  const maquinas = await r.json();
  maquinas.sort((a, b) => parseInt(a.numero) - parseInt(b.numero)); 
  maquinas.forEach(m => renderMaquina(m));

  // Mostra ou esconde o botão de adicionar máquina conforme permissão
  const addRow = document.getElementById('add-maquina-row');
  if (addRow) addRow.style.display = ehAdmin ? 'flex' : 'none';

  document.getElementById('painel').classList.add('visivel');
}

function atualizarContador(labId, valor, absoluto = false) {
  const el = document.getElementById(`contador-${labId}`);
  if (!el) return;
  el.textContent = absoluto ? valor : parseInt(el.textContent) + valor;
}

// DISPOSITIVOS 

async function adicionarMaquina() {
  if (!labAtivo) return;
  const numero = document.getElementById('nova-maquina-numero').value.trim();
  const nome   = document.getElementById('nova-maquina-nome').value.trim();
  if (!numero || !nome) { alert('Preencha número e nome da máquina'); return; }

  const r = await fetch(`${API}/dispositivo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numero, nome, laboratorio_id: labAtivo, funcionando: 1 })
  });
  const resultado = await r.json();

  if (resultado.sucesso) {
    document.getElementById('nova-maquina-numero').value = '';
    document.getElementById('nova-maquina-nome').value = '';
    renderMaquina({ id: resultado.id, numero, nome, funcionando: 1 });
    atualizarContador(labAtivo, 1);
  } else {
    alert('Erro: ' + resultado.erro);
  }
}

async function salvarEdicaoMaquina(id) {
  const numero      = document.getElementById(`edit-maq-numero-${id}`).value.trim();
  const nome        = document.getElementById(`edit-maq-nome-${id}`).value.trim();
  const funcionando = document.getElementById(`edit-maq-status-${id}`).value;
  if (!numero || !nome) return;

  const r = await fetch(`${API}/dispositivo/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numero, nome, funcionando })
  });
  const resultado = await r.json();

  if (resultado.sucesso) {
    document.getElementById(`maq-numero-${id}`).textContent = '#' + numero;
    document.getElementById(`maq-nome-${id}`).textContent = nome;
    atualizarBadge(id, funcionando == 1);
    fecharEdicaoMaquina(id);
  } else {
    alert('Erro: ' + resultado.erro);
  }
}

async function removerMaquina(id) {
  confirmar(id, 'Remover esta máquina?', async () => {

  const r = await fetch(`${API}/dispositivo/${id}`, { method: 'DELETE' });
  const resultado = await r.json();

  if (resultado.sucesso) {
    document.getElementById(`maq-item-${id}`).remove();
    document.getElementById(`maq-edit-row-${id}`).remove();
    atualizarContador(labAtivo, -1);
  } else {
    alert('Erro: ' + resultado.erro);
  }
  });
}

function abrirEdicaoMaquina(id) {
  document.getElementById(`maq-item-${id}`).style.display = 'none';
  document.getElementById(`maq-edit-row-${id}`).style.display = 'flex';
}

function fecharEdicaoMaquina(id) {
  document.getElementById(`maq-edit-row-${id}`).style.display = 'none';
  document.getElementById(`maq-item-${id}`).style.display = 'flex';
}

function atualizarBadge(id, funcionando) {
  const badge = document.getElementById(`maq-badge-${id}`);
  badge.textContent = funcionando ? 'OK' : 'Problema';
  badge.className   = 'badge ' + (funcionando ? 'badge-ok' : 'badge-problema');
}

// RENDERIZAÇÃO

function renderBotaoLab(lab) {
  const grid = document.getElementById('listaLabs');

  const btn = document.createElement('button');
  btn.className = 'lab-btn';
  btn.id = `lab-btn-${lab.id}`;
  btn.onclick = () => abrirPainel(lab);
  btn.innerHTML = `
    <span id="lab-btn-nome-${lab.id}">${lab.nome}</span>
    <span class="contador" id="contador-${lab.id}">${lab.total ?? 0}</span>
    <div class="lab-btn-acoes">
      ${ehAdmin ? `<button onclick="removerLab(${lab.id}, event)">Remover</button>` : ''}
    </div>
  `;

  grid.appendChild(btn);
}

function renderMaquina(maq) {
  const lista = document.getElementById('maquinas-lista');
  const ok = maq.funcionando == 1;

  // Linha de edição — só criada para admin
  if (ehAdmin) {
    const editRow = document.createElement('div');
    editRow.className = 'maquina-edit-row';
    editRow.id = `maq-edit-row-${maq.id}`;
    editRow.innerHTML = `
      <input type="text" id="edit-maq-numero-${maq.id}" value="${maq.numero}" placeholder="Nº" style="width:60px; flex:none">
      <input type="text" id="edit-maq-nome-${maq.id}"   value="${maq.nome}"   placeholder="Nome">
      <select id="edit-maq-status-${maq.id}">
        <option value="1" ${ok ? 'selected' : ''}>Funcionando</option>
        <option value="0" ${!ok ? 'selected' : ''}>Com problema</option>
      </select>
      <button class="btn-save btn-sm"   onclick="salvarEdicaoMaquina(${maq.id})">Salvar</button>
      <button class="btn-cancel btn-sm" onclick="fecharEdicaoMaquina(${maq.id})">Cancelar</button>
    `;
    lista.appendChild(editRow);
  }

  const item = document.createElement('div');
  item.className = 'maquina-item';
  item.id = `maq-item-${maq.id}`;
  item.innerHTML = `
    <div class="maquina-info">
      <span class="maquina-numero" id="maq-numero-${maq.id}">#${maq.numero}</span>
      <span class="maquina-nome"   id="maq-nome-${maq.id}">${maq.nome}</span>
      <span class="badge ${ok ? 'badge-ok' : 'badge-problema'}" id="maq-badge-${maq.id}">${ok ? 'OK' : 'Problema'}</span>
    </div>
    <div class="maquina-acoes">
      ${ehAdmin ? `<button class="btn-edit btn-sm" onclick="abrirEdicaoMaquina(${maq.id})">Editar</button>` : ''}
      ${ehAdmin ? `<button class="btn-remove btn-sm" onclick="removerMaquina(${maq.id})">Remover</button>` : ''}
    </div>
  `;

  lista.appendChild(item);
}

carregarLabs();