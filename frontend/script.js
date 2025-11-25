// Funções de alternância entre chat e documentos
function switchToChat() {
  // Limpa o chat window e mostra o input de mensagens novamente
  const chatWindow = document.getElementById("chatWindow");
  chatWindow.innerHTML = "";
  addMessage("Você está no chat!", "bot");
  document.getElementById("inputContainer").classList.remove("hidden");
}

let currentPage = 1;
const pageSize = 10; // Número de fichas por página

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function switchToDocuments() {
  const chatWindow = document.getElementById("chatWindow");
  chatWindow.innerHTML = "";
  document.getElementById("inputContainer").classList.add("hidden");

  fetch(`http://localhost:3000/fichas?page=${currentPage}&size=${pageSize}`)
    .then((response) => response.json())
    .then((fichas) => {
      fichas.forEach((ficha) => {
        const fichaButton = document.createElement("button");
        fichaButton.classList.add("ficha-button");
        fichaButton.innerText = ficha.nomePersonagem;

        // Armazena o ID da ficha no botão usando data-id
        fichaButton.setAttribute("data-id", ficha.id);

        // Atribui a função de clique que usa o ID salvo
        fichaButton.onclick = () => {
          const fichaId = fichaButton.getAttribute("data-id");
          displayFichaDetails(fichaId);
        };

        chatWindow.appendChild(fichaButton);
      });

      // Criar o botão "Adicionar Ficha" ao final da lista
      const addFichaButton = document.createElement("button");
      addFichaButton.classList.add("ficha-button");
      addFichaButton.innerText = "Adicionar Ficha";
      addFichaButton.onclick = openAddFichaModal;
      chatWindow.appendChild(addFichaButton);
    })
    .catch((error) => {
      console.error("Erro ao carregar as fichas:", error);
      addMessage("Erro ao carregar as fichas.", "bot");
    });
}

async function enviarFicha(ficha) {
  try {
    // Fazendo a requisição POST para o servidor
    const response = await fetch("http://localhost:3000/fichas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Especifica que os dados enviados são em formato JSON
      },
      body: JSON.stringify(ficha), // Converte o objeto ficha em uma string JSON
    });

    // Verifica se a resposta foi bem-sucedida
    if (response.ok) {
      const data = await response.json(); // Converte a resposta JSON em um objeto
      console.log("Ficha enviada com sucesso:", data);
      return data;
    } else {
      const errorData = await response.json();
      console.error("Erro ao enviar a ficha:", errorData);
      return null;
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return null;
  }
}

// Função para enviar comandos e mensagens para o chat
async function sendCommand(command) {
  // Verifique se o comando é uma string válida
  if (typeof command !== "string" || command.trim() === "") {
    addMessage("", "user");
    return;
  }

  // Verifique se o comando começa com "/roll"
  if (command.startsWith("/roll")) {
    const rollRegex = /^\/roll (\d+)d(\d+)([+-]?\d*)$/; // Expressão regular para capturar xdy e o modificador opcional
    const match = command.match(rollRegex);

    if (match) {
      const numDice = parseInt(match[1]); // x
      const diceSides = parseInt(match[2]); // y
      const modifier = match[3] ? parseInt(match[3]) : 0; // z (pode ser positivo, negativo ou vazio)

      const rollResults = [];
      let total = 0;

      // Rolar os dados
      for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * diceSides) + 1; // Rolagem de dado
        rollResults.push(roll);
        total += roll;
      }

      // Aplicar o modificador
      total += modifier;

      // Exibir os resultados no chat
      const resultsMessage = `Rolando ${numDice}d${diceSides} com modificador ${modifier}:\nResultado: [${rollResults.join(
        ", "
      )}] Total: ${total}`;
      addMessage(resultsMessage, "bot");
    } else {
      addMessage("Comando inválido. Use o formato /roll xdy [+|-z].", "bot");
    }
  } else {
    // Tratar como uma mensagem comum e exibir no chat
    addMessage(command, "user");
  }
  document.getElementById("inputMessage").value = "";
}

// Função auxiliar para adicionar mensagens ao chat
function addMessage(text, sender) {
  const chatWindow = document.getElementById("chatWindow");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add(sender);
  messageDiv.innerText = text;
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight; // Scroll automático para última mensagem
}

// modal

// Função para abrir a modal
function openAddFichaModal() {
  document.getElementById("addFichaModal").classList.remove("hidden");
}

// Função para fechar a modal
function closeAddFichaModal() {
  document.getElementById("addFichaModal").classList.add("hidden");
}

// Funções para adicionar campos dinâmicos
function addMovimento() {
  const container = document.getElementById("movimentosContainer");
  const movimentoNome = document.createElement("input");
  movimentoNome.name = "movimentoNome";
  movimentoNome.placeholder = "Nome do movimento";
  const movimentoDesc = document.createElement("textarea");
  movimentoDesc.name = "movimentoDesc";
  movimentoDesc.placeholder = "Descrição do movimento";
  container.appendChild(movimentoNome);
  container.appendChild(movimentoDesc);
}

function addVinculo() {
  const container = document.getElementById("vinculosContainer");
  const vinculo = document.createElement("input");
  vinculo.name = "vinculo";
  vinculo.placeholder = "Vínculo";
  container.appendChild(vinculo);
}

function addInventario() {
  const container = document.getElementById("inventarioContainer");
  const item = document.createElement("input");
  item.name = "inventarioItem";
  item.placeholder = "Item";
  container.appendChild(item);
}

async function saveFicha() {
  const form = document.getElementById("fichaForm");
  const formData = new FormData(form);

  // Obtém o ID da ficha do campo oculto (se existir)
  const fichaId = formData.get("fichaId") || null;

  const ficha = {
    id: fichaId || generateUUID(), // Usa o ID existente ou gera um novo
    nomePersonagem: formData.get("nomePersonagem"),
    classe: formData.get("classe") || "", // Permite classe vazia
    Aparencia: formData.get("aparencia") || "", // Permite aparência vazia
    raça: formData.get("raca") || "", // Permite raça vazia
    Alinhamento: formData.get("alinhamento") || "", // Permite alinhamento vazio
    dadoDano: formData.get("dadoDano") || "", // Permite dado de dano vazio
    armadura: formData.get("armadura") || "", // Permite armadura vazia
    pontosVida: formData.get("pontosVida") || "", // Permite pontos de vida vazios
    maxpontosVida: formData.get("maxpontosVida") || "", // Permite max pontos de vida vazios
    nivel: formData.get("nivel") || "", // Permite nível vazio
    xp: formData.get("xp") || "", // Permite XP vazio
    moedas: formData.get("moedas") || "", // Permite moedas vazias
    carga: formData.get("carga") || "", // Permite carga vazia
    maxCarga: formData.get("maxCarga") || "", // Permite carga máxima vazia
    notas: formData.get("notas") || "", // Permite notas vazias
    Movimentos: {},
    Vinculos: [],
    inventario: [],
  };

  // // Movimentos
  // const movimentosNomes = formData.getAll("movimentoNome");
  // const movimentosDescricoes = formData.getAll("movimentoDesc");
  // movimentosNomes.forEach((nome, index) => {
  //   ficha.Movimentos[nome] = movimentosDescricoes[index];
  // });

  // Vinculos
  ficha.Vinculos = formData.getAll("vinculo");

  // Inventário
  ficha.inventario = formData.getAll("inventarioItem");

  console.log(ficha); // Verifique o objeto ficha antes de enviar

  // Enviar ficha para o servidor ou exibir no console
  if (ficha.id) {
    const fichaExistente = await verificarFichaExistente(ficha.id);
    if (fichaExistente) {
      editarFicha(ficha); // Editar a ficha
    } else {
      console.log(
        "Ficha não encontrada para edição. Criando uma nova ficha..."
      );
      enviarFicha(ficha); // Criar uma nova ficha
    }
  } else {
    // Ficha sem ID (nova), logo cria uma nova
    enviarFicha(ficha); // Criar uma nova ficha
  }

  closeAddFichaModal();
  switchToChat();
  switchToDocuments();
}

function displayFichaDetails(id) {
  // Limpa qualquer dado anterior
  const form = document.getElementById("fichaForm");
  form.reset(); // Resetando o formulário, caso já tenha dados de uma ficha anterior

  // Fazer uma requisição GET para buscar a ficha pelo ID
  fetch(`http://localhost:3000/fichas/${id}`)
    .then((response) => response.json())
    .then((ficha) => {
      if (ficha) {
        // Função para preencher o campo se ele existir
        const preencherCampo = (nomeCampo, valor) => {
          const campo = form.querySelector(`[name="${nomeCampo}"]`);
          if (campo) {
            campo.value = valor || ""; // Preenche o valor ou define como vazio
          }
        };

        // Preencher os campos do formulário com os dados da ficha
        preencherCampo("fichaId", ficha.id);
        preencherCampo("nomePersonagem", ficha.nomePersonagem);
        preencherCampo("classe", ficha.classe);
        preencherCampo("aparencia", ficha.Aparencia);
        preencherCampo("raca", ficha.raça);
        preencherCampo("alinhamento", ficha.Alinhamento);
        preencherCampo("dadoDano", ficha.dadoDano);
        preencherCampo("armadura", ficha.armadura);
        preencherCampo("pontosVida", ficha.pontosVida);
        preencherCampo("maxpontosVida", ficha.maxpontosVida);
        preencherCampo("nivel", ficha.nivel);
        preencherCampo("xp", ficha.xp);
        preencherCampo("moedas", ficha.moedas);
        preencherCampo("carga", ficha.carga);
        preencherCampo("maxCarga", ficha.maxCarga);
        preencherCampo("notas", ficha.notas);

        // Preencher os movimentos, vínculos e inventário (presumivelmente campos dinâmicos)
        preencherCamposDinamicos(ficha);
        openAddFichaModal(); // Abrir a modal com os dados preenchidos
      } else {
        console.error("Ficha não encontrada!");
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar ficha:", error);
      addMessage("Erro ao carregar os detalhes da ficha.", "bot");
    });
}

function preencherCamposDinamicos(ficha) {
  // Limpar campos existentes
  document.getElementById("movimentosContainer").innerHTML = "";
  document.getElementById("vinculosContainer").innerHTML = "";
  document.getElementById("inventarioContainer").innerHTML = "";

  // Preencher movimentos
  if (ficha.Movimentos) {
    Object.keys(ficha.Movimentos).forEach((nome) => {
      addMovimento(nome, ficha.Movimentos[nome]);
    });
  }

  // Preencher vínculos
  if (ficha.Vinculos) {
    ficha.Vinculos.forEach((vinculo) => {
      addVinculo(vinculo);
    });
  }

  // Preencher inventário
  if (ficha.inventario) {
    ficha.inventario.forEach((item) => {
      addInventario(item);
    });
  }
}
async function editarFicha(ficha) {
  try {
    const response = await fetch(`http://localhost:3000/fichas/${ficha.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ficha),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Ficha editada com sucesso:", data);
      return data;
    } else {
      const errorData = await response.json();
      console.error("Erro ao editar a ficha:", errorData);
      return null;
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    return null;
  }
}

async function verificarFichaExistente(id) {
  try {
    const response = await fetch(`http://localhost:3000/fichas/${id}`);
    if (response.ok) {
      // Ficha encontrada
      return true;
    } else {
      // Ficha não encontrada
      return false;
    }
  } catch (error) {
    console.error("Erro ao verificar a ficha:", error);
    return false;
  }
}

function deleteFicha() {
  const form = document.getElementById("fichaForm");
  const formData = new FormData(form);
  // Obtém o ID da ficha do campo oculto (se existir)
  const id = formData.get("fichaId");

  if (confirm("Tem certeza de que deseja deletar esta ficha?")) {
    fetch(`http://localhost:3000/fichas/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          alert("Ficha deletada com sucesso!");
          // Atualize a lista de fichas após deletar
          document.getElementById(id).remove();
        } else {
          alert("Erro ao deletar a ficha. Tente novamente.");
        }
      })
      .catch((error) => {
        console.error("Erro ao deletar ficha:", error);
      });
  }
  closeAddFichaModal();
  switchToChat();
  switchToChat();
  switchToDocuments();
}

function closeAddFichaModal() {
  const modal = document.getElementById("addFichaModal");
  modal.classList.add("hidden"); // Garante que a classe "hidden" seja aplicada
}
