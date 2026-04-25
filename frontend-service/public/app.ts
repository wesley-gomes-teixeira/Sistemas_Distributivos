interface SessionData {
  name: string;
  email: string;
  role: "admin" | "analyst" | "viewer";
  token: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: SessionData["role"];
}

interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  userId: number | null;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  assetId: number | null;
}

interface ApiError extends Error {
  status?: number;
}

const gatewayBaseUrl = "http://localhost:3000/api";
const authBaseUrl = "http://localhost:3000/auth";
const sessionKey = "assetflow-session";

const textElement = (id: string) => document.getElementById(id) as HTMLElement;
const inputElement = (id: string) => document.getElementById(id) as HTMLInputElement;
const selectElement = (id: string) => document.getElementById(id) as HTMLSelectElement;
const textareaElement = (id: string) => document.getElementById(id) as HTMLTextAreaElement;
const buttonElement = (id: string) => document.getElementById(id) as HTMLButtonElement;
const formElement = (id: string) => document.getElementById(id) as HTMLFormElement;

const loginScreen = textElement("login-screen");
const appShell = textElement("app-shell");
const loginError = textElement("login-error");
const statusMessage = textElement("status-message");
const usersCount = textElement("users-count");
const assetsCount = textElement("assets-count");
const ticketsCount = textElement("tickets-count");
const coverageLabel = textElement("coverage-label");
const healthLabel = textElement("health-label");
const ticketHighlight = textElement("ticket-highlight");
const assetHighlight = textElement("asset-highlight");
const nextStep = textElement("next-step");
const sidebarStage = textElement("sidebar-stage");
const sidebarStageCopy = textElement("sidebar-stage-copy");
const currentUserName = textElement("current-user-name");
const currentUserEmail = textElement("current-user-email");
const currentUserRole = textElement("current-user-role");
const assetsLock = textElement("assets-lock");
const ticketsLock = textElement("tickets-lock");
const usersReadonly = textElement("users-readonly");
const assetsReadonly = textElement("assets-readonly");
const ticketsReadonly = textElement("tickets-readonly");

textElement("gateway-url").textContent = gatewayBaseUrl;
textElement("login-gateway-url").textContent = gatewayBaseUrl;

const roleLabels: Record<SessionData["role"], string> = {
  admin: "Administrador",
  analyst: "Analista",
  viewer: "Visualizador"
};

const cache: {
  users: User[];
  assets: Asset[];
  tickets: Ticket[];
} = {
  users: [],
  assets: [],
  tickets: []
};

let currentView = "dashboard";

function setStatus(message: string): void {
  statusMessage.textContent = message;
}

function saveSession(user: SessionData): void {
  localStorage.setItem(sessionKey, JSON.stringify(user));
}

function getSession(): SessionData | null {
  const raw = localStorage.getItem(sessionKey);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionData;
  } catch (_error) {
    localStorage.removeItem(sessionKey);
    return null;
  }
}

function getCurrentRole(): SessionData["role"] {
  return getSession()?.role || "viewer";
}

function canManageUsers(): boolean {
  return getCurrentRole() === "admin";
}

function canManageOperations(): boolean {
  return ["admin", "analyst"].includes(getCurrentRole());
}

function clearSession(): void {
  localStorage.removeItem(sessionKey);
}

function updateSessionUI(): void {
  const session = getSession();

  if (!session) {
    loginScreen.classList.remove("hidden");
    appShell.classList.add("hidden");
    return;
  }

  currentUserName.textContent = session.name;
  currentUserEmail.textContent = session.email;
  currentUserRole.textContent = `Perfil: ${roleLabels[session.role] || session.role}`;
  loginScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
}

function switchView(view: string): void {
  currentView = view;

  document.querySelectorAll<HTMLElement>(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `view-${view}`);
  });

  document.querySelectorAll<HTMLButtonElement>(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.getAttribute("data-view") === view);
  });

  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    users: "Usuarios",
    assets: "Ativos",
    tickets: "Chamados"
  };

  textElement("view-title").textContent = titles[view];
}

function getProgressStage(): { label: string; description: string } {
  if (cache.users.length === 0) {
    return {
      label: "Etapa 1: estruturar usuarios",
      description: "Cadastre ao menos um usuario para habilitar o modulo de ativos."
    };
  }

  if (cache.assets.length === 0) {
    return {
      label: "Etapa 2: estruturar ativos",
      description: "O ambiente ja esta apto a receber ativos vinculados aos usuarios cadastrados."
    };
  }

  if (cache.tickets.length === 0) {
    return {
      label: "Etapa 3: registrar chamados",
      description: "Com usuarios e ativos configurados, o fluxo de atendimento ja pode ser iniciado."
    };
  }

  return {
    label: "Fluxo operacional concluido",
    description: "Os tres modulos ja estao ativos. Continue atualizando os registros operacionais."
  };
}

function updateNavigationLocks(): void {
  const usersReady = cache.users.length > 0;
  const assetsReady = cache.assets.length > 0;
  const canOperate = canManageOperations();

  const assetsNav = document.querySelector<HTMLButtonElement>('[data-view="assets"]')!;
  const ticketsNav = document.querySelector<HTMLButtonElement>('[data-view="tickets"]')!;
  const usersFormButton = document.querySelector<HTMLButtonElement>("#users-form button[type='submit']")!;
  const assetsFormButton = document.querySelector<HTMLButtonElement>("#assets-form button[type='submit']")!;
  const ticketsFormButton = document.querySelector<HTMLButtonElement>("#tickets-form button[type='submit']")!;

  assetsNav.disabled = !usersReady;
  ticketsNav.disabled = !assetsReady;
  usersFormButton.disabled = !canManageUsers();
  assetsFormButton.disabled = !usersReady || !canOperate;
  ticketsFormButton.disabled = !assetsReady || !canOperate;

  usersReadonly.classList.toggle("hidden", canManageUsers());
  assetsReadonly.classList.toggle("hidden", canOperate);
  ticketsReadonly.classList.toggle("hidden", canOperate);
  assetsLock.classList.toggle("hidden", usersReady);
  ticketsLock.classList.toggle("hidden", assetsReady);

  selectElement("user-role").disabled = !canManageUsers();
  inputElement("user-name").disabled = !canManageUsers();
  inputElement("user-email").disabled = !canManageUsers();
  inputElement("user-password").disabled = !canManageUsers();

  inputElement("asset-name").disabled = !canOperate;
  inputElement("asset-type").disabled = !canOperate;
  selectElement("asset-status").disabled = !canOperate;
  inputElement("asset-user-id").disabled = !canOperate;

  inputElement("ticket-title").disabled = !canOperate;
  textareaElement("ticket-description").disabled = !canOperate;
  selectElement("ticket-status").disabled = !canOperate;
  inputElement("ticket-asset-id").disabled = !canOperate;

  if (!usersReady && currentView === "assets") {
    switchView("users");
  }

  if (!assetsReady && currentView === "tickets") {
    switchView(usersReady ? "assets" : "users");
  }
}

function refreshDashboard(): void {
  const { users, assets, tickets } = cache;

  usersCount.textContent = String(users.length);
  assetsCount.textContent = String(assets.length);
  ticketsCount.textContent = String(tickets.length);

  const assetsPerUser = users.length > 0 ? (assets.length / users.length).toFixed(1) : "0";
  coverageLabel.textContent = `${assetsPerUser} ativos por usuario`;

  if (users.length === 0 && assets.length === 0 && tickets.length === 0) {
    healthLabel.textContent = "Ambiente pronto para a configuracao inicial";
    ticketHighlight.textContent = "Nenhum chamado registrado";
    assetHighlight.textContent = "Nenhum ativo vinculado";
    nextStep.textContent = "Cadastre o primeiro usuario para iniciar a operacao.";
  } else {
    healthLabel.textContent = `${users.length + assets.length + tickets.length} registros ativos no ambiente`;
    ticketHighlight.textContent =
      tickets.length > 0 ? `${tickets.length} chamados em acompanhamento` : "Nao ha chamados em aberto";
    assetHighlight.textContent =
      assets.length > 0 ? `${assets.length} ativos registrados no inventario` : "Inventario ainda nao iniciado";

    if (users.length === 0) {
      nextStep.textContent = "Cadastre usuarios para habilitar a vinculacao de ativos.";
    } else if (assets.length === 0) {
      nextStep.textContent = "Cadastre ativos para associar equipamentos aos usuarios.";
    } else if (tickets.length === 0) {
      nextStep.textContent = "Registre chamados para acompanhar incidentes, solicitacoes e manutencoes.";
    } else {
      nextStep.textContent = "Estrutura inicial concluida. Continue atualizando os modulos conforme a operacao.";
    }
  }

  const stage = getProgressStage();
  sidebarStage.textContent = stage.label;
  sidebarStageCopy.textContent = stage.description;
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const session = getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string> | undefined) || {})
  };

  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(`${gatewayBaseUrl}${path}`, {
    headers,
    ...options
  });

  const data = await response.json();

  if (response.status === 401) {
    clearSession();
    updateSessionUI();
    throw Object.assign(new Error(data.message || "Sua sessao expirou. Faca login novamente."), {
      status: response.status
    }) as ApiError;
  }

  if (!response.ok) {
    throw Object.assign(new Error(data.message || "Falha na requisicao."), {
      status: response.status
    }) as ApiError;
  }

  return data;
}

function createCard(
  title: string,
  typeLabel: string,
  lines: string[],
  onEdit: () => void,
  onDelete: () => Promise<void>,
  canEdit: boolean
): HTMLDivElement {
  const card = document.createElement("div");
  card.className = `card${canEdit ? "" : " readonly"}`;

  const header = document.createElement("div");
  header.className = "card-header";

  const heading = document.createElement("strong");
  heading.textContent = title;

  const pill = document.createElement("span");
  pill.className = "entity-pill";
  pill.textContent = typeLabel;

  header.appendChild(heading);
  header.appendChild(pill);
  card.appendChild(header);

  lines.forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    card.appendChild(paragraph);
  });

  if (canEdit) {
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.addEventListener("click", onEdit);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Excluir";
    deleteButton.addEventListener("click", () => {
      onDelete().catch((error: ApiError) => {
        setStatus(error.message);
      });
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    card.appendChild(actions);
  }

  return card;
}

function renderEmptyState(container: HTMLElement, message: string): void {
  container.innerHTML = `<div class="empty-state">${message}</div>`;
}

function clearUserForm(): void {
  inputElement("user-id").value = "";
  inputElement("user-name").value = "";
  inputElement("user-email").value = "";
  inputElement("user-password").value = "";
  selectElement("user-role").value = "analyst";
}

function clearAssetForm(): void {
  inputElement("asset-id").value = "";
  inputElement("asset-name").value = "";
  inputElement("asset-type").value = "";
  selectElement("asset-status").value = "disponivel";
  inputElement("asset-user-id").value = "";
}

function clearTicketForm(): void {
  inputElement("ticket-id").value = "";
  inputElement("ticket-title").value = "";
  textareaElement("ticket-description").value = "";
  selectElement("ticket-status").value = "aberto";
  inputElement("ticket-asset-id").value = "";
}

function filterUsers(users: User[]): User[] {
  const term = inputElement("users-search").value.trim().toLowerCase();

  return users.filter((user) => {
    const haystack = `${user.name} ${user.email} ${roleLabels[user.role] || user.role}`.toLowerCase();
    return haystack.includes(term);
  });
}

function filterAssets(assets: Asset[]): Asset[] {
  const term = inputElement("assets-search").value.trim().toLowerCase();
  const status = selectElement("assets-filter-status").value;

  return assets.filter((asset) => {
    const haystack = `${asset.name} ${asset.type} ${asset.userId ?? ""}`.toLowerCase();
    const matchesTerm = haystack.includes(term);
    const matchesStatus = !status || asset.status === status;
    return matchesTerm && matchesStatus;
  });
}

function filterTickets(tickets: Ticket[]): Ticket[] {
  const term = inputElement("tickets-search").value.trim().toLowerCase();
  const status = selectElement("tickets-filter-status").value;

  return tickets.filter((ticket) => {
    const haystack = `${ticket.title} ${ticket.description} ${ticket.assetId ?? ""}`.toLowerCase();
    const matchesTerm = haystack.includes(term);
    const matchesStatus = !status || ticket.status === status;
    return matchesTerm && matchesStatus;
  });
}

async function deleteWithImpact(path: string, impactMessage: string, successMessage: string): Promise<void> {
  try {
    await request(path, { method: "DELETE" });
    await reloadEverything(successMessage);
  } catch (error) {
    const apiError = error as ApiError;

    if (apiError.status === 409 && window.confirm(`${impactMessage}\n\nDeseja prosseguir mesmo assim?`)) {
      await request(`${path}?force=true`, { method: "DELETE" });
      await reloadEverything(successMessage);
      return;
    }

    throw apiError;
  }
}

async function loadUsers(): Promise<void> {
  const users = (await request("/users")) as User[];
  cache.users = users;

  const filteredUsers = filterUsers(users);
  const container = textElement("users-list");
  container.innerHTML = "";

  if (filteredUsers.length === 0) {
    renderEmptyState(container, "Nenhum usuario encontrado para os filtros informados.");
    return;
  }

  filteredUsers.forEach((user) => {
    container.appendChild(
      createCard(
        `${user.name} (#${user.id})`,
        roleLabels[user.role] || user.role,
        [`Email: ${user.email}`],
        () => {
          inputElement("user-id").value = String(user.id);
          inputElement("user-name").value = user.name;
          inputElement("user-email").value = user.email;
          selectElement("user-role").value = user.role;
          setStatus(`Edicao do usuario #${user.id} carregada com sucesso.`);
          switchView("users");
        },
        async () => {
          await deleteWithImpact(
            `/users/${user.id}`,
            "Este usuario possui ativos vinculados que serao reclassificados automaticamente.",
            "Usuario removido com sucesso."
          );
        },
        canManageUsers()
      )
    );
  });
}

async function loadAssets(): Promise<void> {
  const assets = (await request("/assets")) as Asset[];
  cache.assets = assets;

  const filteredAssets = filterAssets(assets);
  const container = textElement("assets-list");
  container.innerHTML = "";

  if (filteredAssets.length === 0) {
    renderEmptyState(container, "Nenhum ativo encontrado para os filtros informados.");
    return;
  }

  filteredAssets.forEach((asset) => {
    container.appendChild(
      createCard(
        `${asset.name} (#${asset.id})`,
        asset.status,
        [
          `Tipo: ${asset.type}`,
          `Status: ${asset.status}`,
          `Usuario responsavel: ${asset.userId ?? "nao vinculado"}`
        ],
        () => {
          inputElement("asset-id").value = String(asset.id);
          inputElement("asset-name").value = asset.name;
          inputElement("asset-type").value = asset.type;
          selectElement("asset-status").value = asset.status;
          inputElement("asset-user-id").value = asset.userId === null ? "" : String(asset.userId);
          setStatus(`Edicao do ativo #${asset.id} carregada com sucesso.`);
          switchView("assets");
        },
        async () => {
          await deleteWithImpact(
            `/assets/${asset.id}`,
            "Este ativo possui chamados vinculados que serao atualizados para aguardando ativo.",
            "Ativo removido com sucesso."
          );
        },
        canManageOperations()
      )
    );
  });
}

async function loadTickets(): Promise<void> {
  const tickets = (await request("/tickets")) as Ticket[];
  cache.tickets = tickets;

  const filteredTickets = filterTickets(tickets);
  const container = textElement("tickets-list");
  container.innerHTML = "";

  if (filteredTickets.length === 0) {
    renderEmptyState(container, "Nenhum chamado encontrado para os filtros informados.");
    return;
  }

  filteredTickets.forEach((ticket) => {
    container.appendChild(
      createCard(
        `${ticket.title} (#${ticket.id})`,
        ticket.status,
        [
          `Descricao: ${ticket.description}`,
          `Status: ${ticket.status}`,
          `Ativo relacionado: ${ticket.assetId ?? "indisponivel"}`
        ],
        () => {
          inputElement("ticket-id").value = String(ticket.id);
          inputElement("ticket-title").value = ticket.title;
          textareaElement("ticket-description").value = ticket.description;
          selectElement("ticket-status").value = ticket.status;
          inputElement("ticket-asset-id").value = ticket.assetId === null ? "" : String(ticket.assetId);
          setStatus(`Edicao do chamado #${ticket.id} carregada com sucesso.`);
          switchView("tickets");
        },
        async () => {
          await request(`/tickets/${ticket.id}`, { method: "DELETE" });
          await reloadEverything("Chamado removido com sucesso.");
        },
        canManageOperations()
      )
    );
  });
}

async function reloadEverything(successMessage?: string): Promise<void> {
  await Promise.all([loadUsers(), loadAssets(), loadTickets()]);
  refreshDashboard();
  updateNavigationLocks();

  if (successMessage) {
    setStatus(successMessage);
  }
}

async function loadAll(): Promise<void> {
  try {
    await reloadEverything("Dados carregados com sucesso.");
  } catch (error) {
    setStatus((error as ApiError).message);
  }
}

formElement("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = inputElement("login-name").value.trim();
  const email = inputElement("login-email").value.trim();
  const password = inputElement("login-password").value.trim();

  if (!name || !email || password.length < 4) {
    loginError.textContent = "Informe nome, email e uma senha com no minimo 4 caracteres.";
    return;
  }

  try {
    const response = await fetch(`${authBaseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Nao foi possivel realizar o login.");
    }

    saveSession({
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      token: data.token
    });
    loginError.textContent = "";
    updateSessionUI();
    switchView("dashboard");
    await loadAll();
  } catch (error) {
    loginError.textContent = (error as Error).message;
  }
});

buttonElement("register-button").addEventListener("click", async () => {
  const name = inputElement("login-name").value.trim();
  const email = inputElement("login-email").value.trim();
  const password = inputElement("login-password").value.trim();

  if (!name || !email || password.length < 4) {
    loginError.textContent = "Informe nome, email e uma senha com no minimo 4 caracteres.";
    return;
  }

  try {
    const response = await fetch(`${authBaseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Nao foi possivel concluir o cadastro.");
    }

    saveSession({
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      token: data.token
    });
    loginError.textContent = "";
    updateSessionUI();
    switchView("dashboard");
    await loadAll();
  } catch (error) {
    loginError.textContent = (error as Error).message;
  }
});

buttonElement("logout-button").addEventListener("click", () => {
  clearSession();
  updateSessionUI();
  setStatus("Sessao encerrada com sucesso.");
});

document.querySelectorAll<HTMLButtonElement>(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (!button.disabled) {
      switchView(button.getAttribute("data-view") || "dashboard");
    }
  });
});

formElement("users-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!canManageUsers()) {
    setStatus("Seu perfil nao possui permissao para gerenciar usuarios.");
    return;
  }

  const id = inputElement("user-id").value;
  const payload: Record<string, string> = {
    name: inputElement("user-name").value,
    email: inputElement("user-email").value,
    role: selectElement("user-role").value
  };

  const password = inputElement("user-password").value.trim();

  if (!id && password.length < 4) {
    setStatus("Informe uma senha com no minimo 4 caracteres para concluir o cadastro do usuario.");
    return;
  }

  if (password) {
    payload.password = password;
  }

  try {
    await request(id ? `/users/${id}` : "/users", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    clearUserForm();
    await reloadEverything(id ? "Usuario atualizado com sucesso." : "Usuario criado com sucesso.");
  } catch (error) {
    setStatus((error as ApiError).message);
  }
});

formElement("assets-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!canManageOperations()) {
    setStatus("Seu perfil possui acesso somente leitura ao modulo de ativos.");
    return;
  }

  if (cache.users.length === 0) {
    setStatus("Cadastre ao menos um usuario antes de registrar ativos.");
    switchView("users");
    return;
  }

  const id = inputElement("asset-id").value;
  const payload = {
    name: inputElement("asset-name").value,
    type: inputElement("asset-type").value,
    status: selectElement("asset-status").value,
    userId: Number(inputElement("asset-user-id").value)
  };

  try {
    await request(id ? `/assets/${id}` : "/assets", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    clearAssetForm();
    await reloadEverything(id ? "Ativo atualizado com sucesso." : "Ativo criado com sucesso.");
  } catch (error) {
    setStatus((error as ApiError).message);
  }
});

formElement("tickets-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!canManageOperations()) {
    setStatus("Seu perfil possui acesso somente leitura ao modulo de chamados.");
    return;
  }

  if (cache.assets.length === 0) {
    setStatus("Cadastre ao menos um ativo antes de registrar chamados.");
    switchView(cache.users.length > 0 ? "assets" : "users");
    return;
  }

  const id = inputElement("ticket-id").value;
  const payload = {
    title: inputElement("ticket-title").value,
    description: textareaElement("ticket-description").value,
    status: selectElement("ticket-status").value,
    assetId: Number(inputElement("ticket-asset-id").value)
  };

  try {
    await request(id ? `/tickets/${id}` : "/tickets", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    clearTicketForm();
    await reloadEverything(id ? "Chamado atualizado com sucesso." : "Chamado criado com sucesso.");
  } catch (error) {
    setStatus((error as ApiError).message);
  }
});

document.querySelectorAll<HTMLElement>("[data-clear]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.getAttribute("data-clear");

    if (type === "users") {
      clearUserForm();
    }

    if (type === "assets") {
      clearAssetForm();
    }

    if (type === "tickets") {
      clearTicketForm();
    }

    setStatus("Campos redefinidos com sucesso.");
  });
});

["users-search", "assets-search", "assets-filter-status", "tickets-search", "tickets-filter-status"].forEach(
  (id) => {
    const element = textElement(id);
    element.addEventListener("input", () => {
      reloadEverything().catch((error: ApiError) => {
        setStatus(error.message);
      });
    });
    element.addEventListener("change", () => {
      reloadEverything().catch((error: ApiError) => {
        setStatus(error.message);
      });
    });
  }
);

updateSessionUI();

if (getSession()) {
  switchView("dashboard");
  loadAll();
}
