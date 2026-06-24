const API = 'http://localhost:3000';
const permissao = sessionStorage.getItem('permissao');
const ehAdmin   = permissao === 'admin';
const form = document.getElementById('reportForm');

// PÁGINA ocorrencia
// Formulário para registrar uma nova ocorrência

if (form) {
  // Carrega os laboratórios do banco no select
  async function carregarLabsSelect() {
    const r = await fetch(`${API}/laboratorios`);
    const labs = await r.json();
    const sel = document.getElementById('Laboratorio');
    sel.innerHTML = '<option value="">Selecione o laboratório</option>';
    labs.forEach(lab => {
      const opt = document.createElement('option');
      opt.value = lab.id;
      opt.textContent = lab.nome;
      sel.appendChild(opt);
    });
  }

  // Quando o laboratório muda, carrega os dispositivos daquele lab
  document.getElementById('Laboratorio').addEventListener('change', async function () {
    const labId = this.value;
    const sel = document.getElementById('dispositivo');
    sel.innerHTML = '<option value="">Selecione o dispositivo</option>';
    if (!labId) return;

    const r = await fetch(`${API}/dispositivos/${labId}`);
    const dispositivos = await r.json();
    dispositivos.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = `#${d.numero} — ${d.nome}`;
      sel.appendChild(opt);
    });
  });

  carregarLabsSelect();

  // Envia a ocorrência ao servidor e marca o dispositivo como com problema
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const selLab  = document.getElementById('Laboratorio');
    const selDisp = document.getElementById('dispositivo');
    const labId        = selLab.value;
    const dispositivoId = selDisp.value;
    const tipo         = document.getElementById('Problema').value;
    const descricao    = document.getElementById('problema').value;

    if (!labId || !dispositivoId) {
      alert('Selecione o laboratório e o dispositivo');
      return;
    }

    const r = await fetch(`${API}/ocorrencia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        laboratorio:    selLab.options[selLab.selectedIndex].text,
        dispositivo:    selDisp.options[selDisp.selectedIndex].text,
        dispositivo_id: dispositivoId,
        tipo_problema:  tipo,
        descricao:      descricao
      })
    });

    const resultado = await r.json();

    if (resultado.sucesso) {
      window.location.href = 'relatorios.html';
    } else {
      alert('Erro ao salvar: ' + resultado.erro);
    }
  });
}

// PÁGINA relatorios
// Lista e gerencia as ocorrências registradas

const lista = document.getElementById('reportList');
let todasOcorrencias = [];

if (lista) {
  carregarOcorrencias();
}

async function carregarOcorrencias() {
  const resposta = await fetch(`${API}/ocorrencias`);
  todasOcorrencias = await resposta.json();
  renderOcorrencias(todasOcorrencias);
}

// Filtra por status: todos | aberto | resolvido
function filtrar(tipo, btn) {
  document.querySelectorAll('.filtros button').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');

  const filtradas = tipo === 'todos'
    ? todasOcorrencias
    : tipo === 'aberto'
      ? todasOcorrencias.filter(oc => oc.resolvida == 0)
      : todasOcorrencias.filter(oc => oc.resolvida == 1);

  renderOcorrencias(filtradas);
}

function renderOcorrencias(ocorrencias) {
  lista.innerHTML = '';

  if (ocorrencias.length === 0) {
    lista.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px">Nenhuma ocorrência encontrada.</p>';
    return;
  }

  ocorrencias.forEach(oc => {
    const resolvida = oc.resolvida == 1;
    const card = document.createElement('div');
    card.className = 'report-item';
    card.style.borderLeft = `4px solid ${resolvida ? '#43A047' : '#E53935'}`;
    card.id = `card-${oc.id}`;

    card.innerHTML = `
      <div id="view-${oc.id}">
        <span style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:20px; color:white; background:${resolvida ? '#43A047' : '#E53935'}">
          ${resolvida ? 'Resolvida' : 'Em aberto'}
        </span>
        <br><br>
        <strong>Laboratório:</strong> ${oc.laboratorio}<br>
        <strong>Dispositivo:</strong> ${oc.dispositivo}<br>
        <strong>Tipo:</strong> ${oc.tipo_problema || '—'}<br>
        <strong>Descrição:</strong> ${oc.descricao || '—'}<br>
        <small style="color:#999">${new Date(oc.criado_em).toLocaleString('pt-BR')}</small>
        <br><br>
        ${ehAdmin ? `<div style="display:flex; gap:8px; flex-wrap:wrap">
          ${!resolvida ? `<button onclick="resolverOcorrencia(${oc.id}, ${oc.dispositivo_id})" style="background:#43A047;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">Marcar como resolvida</button>` : ''}
          <button onclick="abrirEdicao(${oc.id})" style="background:#1E88E5;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">Editar</button>
          <button onclick="excluir(${oc.id}, ${oc.dispositivo_id}, ${resolvida})" style="background:#E53935;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">Excluir</button>
        </div>` : ''}
      </div>

      <div id="edit-${oc.id}" style="display:none; margin-top:10px">
        <label>Laboratório:</label>
        <input id="edit-lab-${oc.id}"  value="${oc.laboratorio}" style="width:100%; margin:4px 0 8px; padding:6px; border:1px solid #ccc; border-radius:4px"><br>
        <label>Dispositivo:</label>
        <input id="edit-disp-${oc.id}" value="${oc.dispositivo}" style="width:100%; margin:4px 0 8px; padding:6px; border:1px solid #ccc; border-radius:4px"><br>
        <label>Tipo:</label>
        <input id="edit-tipo-${oc.id}" value="${oc.tipo_problema || ''}" style="width:100%; margin:4px 0 8px; padding:6px; border:1px solid #ccc; border-radius:4px"><br>
        <label>Descrição:</label>
        <textarea id="edit-desc-${oc.id}" rows="3" style="width:100%; margin:4px 0 8px; padding:6px; border:1px solid #ccc; border-radius:4px">${oc.descricao || ''}</textarea><br>
        <button onclick="salvarEdicao(${oc.id})" style="background:#43A047;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">Salvar</button>
        <button onclick="cancelarEdicao(${oc.id})" style="margin-left:8px;background:#90A4AE;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">Cancelar</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

// Marca a ocorrência como resolvida e restaura o dispositivo
async function resolverOcorrencia(id, dispositivoId) {
  const r = await fetch(`${API}/ocorrencia/${id}/resolver`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dispositivo_id: dispositivoId })
  });
  const resultado = await r.json();
  if (resultado.sucesso) carregarOcorrencias();
  else alert('Erro: ' + resultado.erro);
}

function abrirEdicao(id) {
  document.getElementById('view-' + id).style.display = 'none';
  document.getElementById('edit-' + id).style.display = 'block';
}

function cancelarEdicao(id) {
  document.getElementById('edit-' + id).style.display = 'none';
  document.getElementById('view-' + id).style.display = 'block';
}

async function salvarEdicao(id) {
  const r = await fetch(`${API}/ocorrencia/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      laboratorio:   document.getElementById('edit-lab-'  + id).value,
      dispositivo:   document.getElementById('edit-disp-' + id).value,
      tipo_problema: document.getElementById('edit-tipo-' + id).value,
      descricao:     document.getElementById('edit-desc-' + id).value
    })
  });
  const resultado = await r.json();
  if (resultado.sucesso) carregarOcorrencias();
  else alert('Erro ao editar: ' + resultado.erro);
}

// Exclui a ocorrência e restaura o dispositivo se ainda estava em aberto
async function excluir(id, dispositivoId, jaResolvida) {
  confirmar(id, 'Excluir esta ocorrência?', async () => {

  const r = await fetch(`${API}/ocorrencia/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dispositivo_id: dispositivoId, ja_resolvida: jaResolvida })
  });
  const resultado = await r.json();
  if (resultado.sucesso) carregarOcorrencias();
  else alert('Erro ao excluir: ' + resultado.erro);
  });
}