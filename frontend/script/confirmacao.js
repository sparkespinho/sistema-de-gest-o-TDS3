
// Cria o elemento de confirmação na tela
function confirmar(id, mensagem, callback) {
  // Remove qualquer confirmação anterior aberta
  const anterior = document.getElementById('confirmacao-global');
  if (anterior) anterior.remove();

  const box = document.createElement('div');
  box.id = 'confirmacao-global';
  box.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 10px;
    padding: 24px 28px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    z-index: 9999;
    max-width: 360px;
    width: 90%;
    text-align: center;
  `;

  box.innerHTML = `
    <p style="font-size:15px; color:#263238; margin-bottom:20px; line-height:1.5">${mensagem}</p>
    <div style="display:flex; gap:10px; justify-content:center">
      <button id="btn-confirmar-sim" style="
        background:#E53935; color:white; border:none; border-radius:6px;
        padding:10px 24px; font-size:14px; font-weight:600; cursor:pointer
      ">Confirmar</button>
      <button id="btn-confirmar-nao" style="
        background:#90A4AE; color:white; border:none; border-radius:6px;
        padding:10px 24px; font-size:14px; font-weight:600; cursor:pointer
      ">Cancelar</button>
    </div>
  `;

  // Fundo escurecido
  const overlay = document.createElement('div');
  overlay.id = 'confirmacao-overlay';
  overlay.style.cssText = `
    position: fixed; top:0; left:0; width:100%; height:100%;
    background: rgba(0,0,0,0.4); z-index: 9998;
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(box);

  // Confirmar
  document.getElementById('btn-confirmar-sim').addEventListener('click', () => {
    fecharConfirmacao();
    callback();
  });

  // Cancelar
  document.getElementById('btn-confirmar-nao').addEventListener('click', fecharConfirmacao);
  overlay.addEventListener('click', fecharConfirmacao);
}

function fecharConfirmacao() {
  const box     = document.getElementById('confirmacao-global');
  const overlay = document.getElementById('confirmacao-overlay');
  if (box)     box.remove();
  if (overlay) overlay.remove();
}