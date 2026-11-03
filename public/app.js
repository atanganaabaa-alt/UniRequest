const state = {
  token: localStorage.getItem("ur-token") || "",
  user: null,
  types: [],
  requetes: [],
  currentId: null,
};

const $ = (id) => document.getElementById(id);

function roleLibelle(role) {
  switch (role) {
    case "ETUDIANT":
      return "Étudiant";
    case "PERSONNEL":
      return "Personnel";
    case "AGENT":
      return "Agent de scolarité";
    case "CHEF":
      return "Chef de département";
    case "ADMIN":
      return "Administratrice";
    default: {
      const _exhaustive = role;
      return String(_exhaustive);
    }
  }
}

function actionLibelle(action) {
  switch (action) {
    case "SOUMETTRE":
      return "Soumettre";
    case "ASSIGNER":
      return "Prendre en charge";
    case "VALIDER":
      return "Valider";
    case "REJETER":
      return "Rejeter";
    case "DEMANDER_PIECE":
      return "Demander une pièce";
    case "ANNULER":
      return "Annuler";
    case "ARCHIVER":
      return "Archiver";
    case "CREER":
      return "Créer";
    default: {
      const _exhaustive = action;
      return String(_exhaustive);
    }
  }
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Erreur réseau");
  return data;
}

function showFlash(message, warn = false) {
  const el = $("flash");
  el.textContent = message;
  el.classList.toggle("hidden", !message);
  el.classList.toggle("warn", warn);
}

function setView(name) {
  for (const section of document.querySelectorAll("main section")) {
    section.classList.add("hidden");
  }
  const target = document.getElementById(`view-${name}`);
  if (target) target.classList.remove("hidden");
  for (const btn of document.querySelectorAll(".nav-btn")) {
    btn.classList.toggle("active", btn.dataset.view === name);
  }
}

function dateFr(iso) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

async function loadComptes() {
  const comptes = await api("/api/comptes");
  $("accounts").innerHTML = comptes
    .map(
      (c) => `<button class="account" data-email="${c.email}" data-password="${c.password}">
        <b>${c.nom}</b>
        <span>${c.titre}</span>
        <span>${c.email} · ${c.password}</span>
      </button>`
    )
    .join("");
}

async function login(email, password) {
  const result = await api("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  state.token = result.token;
  state.user = result.user;
  localStorage.setItem("ur-token", result.token);
  await enterApp();
}

async function enterApp() {
  $("login").classList.add("hidden");
  $("app").classList.remove("hidden");
  $("who").innerHTML = `<b>${state.user.nom}</b><br>${roleLibelle(state.user.role)} · ${state.user.departement}`;
  $("nav-new").classList.toggle("hidden", !["ETUDIANT", "PERSONNEL", "ADMIN"].includes(state.user.role));
  state.types = await api("/api/types");
  await refreshListe();
  renderDashboard();
  setView("dashboard");
}

async function refreshListe() {
  state.requetes = await api("/api/requetes");
}

function renderDashboard() {
  const r = state.requetes;
  const count = (etat) => r.filter((x) => x.etat === etat).length;
  $("view-dashboard").innerHTML = `
    <div class="toprow">
      <div>
        <h2>Tableau de bord</h2>
        <p class="muted">Suivi des dossiers visibles pour ${state.user.nom}.</p>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><span>Dossiers</span><b>${r.length}</b></div>
      <div class="stat"><span>Soumises</span><b>${count("SOUMISE")}</b></div>
      <div class="stat"><span>En cours</span><b>${count("EN_COURS")}</b></div>
      <div class="stat"><span>Pièce manquante</span><b>${count("INCOMPLETE")}</b></div>
      <div class="stat"><span>Validées</span><b>${count("VALIDEE")}</b></div>
    </div>
    ${renderTable(r.slice(0, 8), "Dernières requêtes")}`;
}

function renderTable(liste, titre) {
  if (!liste.length) return `<p class="muted">Aucune requête pour le moment.</p>`;
  return `<div class="card">
    <h3>${titre}</h3>
    <table>
      <thead><tr><th>N°</th><th>Type</th><th>Demandeur</th><th>État</th><th>Mise à jour</th></tr></thead>
      <tbody>
        ${liste
          .map(
            (r) => `<tr class="clickable" data-id="${r.id}">
              <td>${r.id}</td>
              <td>${r.type?.libelle || r.typeCode}</td>
              <td>${r.demandeur?.nom || ""}</td>
              <td><span class="badge ${r.etat}">${r.etatLibelle}</span></td>
              <td>${dateFr(r.updatedAt)}</td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>`;
}

function renderListe() {
  $("view-liste").innerHTML = `
    <div class="toprow">
      <div>
        <h2>Requêtes</h2>
        <p class="muted">Cliquez une ligne pour ouvrir le dossier et son historique.</p>
      </div>
    </div>
    <div class="filters">
      <select id="filtre-etat">
        <option value="">Tous les états</option>
        ${[...new Set(state.requetes.map((r) => r.etat))]
          .map((e) => `<option value="${e}">${state.requetes.find((r) => r.etat === e).etatLibelle}</option>`)
          .join("")}
      </select>
    </div>
    <div id="table-wrap">${renderTable(state.requetes, "File")}</div>`;
  $("filtre-etat").onchange = (ev) => {
    const val = ev.target.value;
    const liste = val ? state.requetes.filter((r) => r.etat === val) : state.requetes;
    $("table-wrap").innerHTML = renderTable(liste, "File");
  };
}

function renderNouvelle() {
  $("view-nouvelle").innerHTML = `
    <h2>Nouvelle requête</h2>
    <p class="muted">Le dossier reste en brouillon jusqu’à la soumission, qui exige au moins une pièce.</p>
    <form id="form-new" class="card" style="max-width:640px">
      <label class="field">Type
        <select name="typeCode" required>
          ${state.types.map((t) => `<option value="${t.code}">${t.libelle} · ${t.service} (${t.delaiJours} j)</option>`).join("")}
        </select>
      </label>
      <label class="field">Motif
        <textarea name="motif" required placeholder="Expliquez la demande, le délai, le contexte."></textarea>
      </label>
      <label class="field">Pièce jointe (nom du fichier)
        <input name="piece" placeholder="carte-etudiant.pdf">
      </label>
      <button class="btn" type="submit">Enregistrer le brouillon</button>
    </form>`;
  $("form-new").onsubmit = async (ev) => {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const pieceNom = String(fd.get("piece") || "").trim();
    try {
      const created = await api("/api/requetes", {
        method: "POST",
        body: JSON.stringify({
          typeCode: fd.get("typeCode"),
          motif: fd.get("motif"),
          pieces: pieceNom ? [{ nom: pieceNom, type: "application/pdf", tailleKo: 120 }] : [],
        }),
      });
      showFlash(`${created.id} créé en brouillon.`);
      await refreshListe();
      openDetail(created.id);
    } catch (err) {
      showFlash(err.message, true);
    }
  };
}

function renderAide() {
  $("view-aide").innerHTML = `
    <h2>Aide</h2>
    <div class="grid2">
      <div class="card">
        <h3>Étudiant</h3>
        <p>Déposez une requête, joignez une pièce, suivez l’état. Si le service demande un complément, resoumettez.</p>
        <h3>Agent</h3>
        <p>Prenez un dossier en charge, demandez une pièce, validez ou rejetez. L’auto-validation est interdite.</p>
        <h3>Chef de département</h3>
        <p>Vous ne voyez que les recours de notes.</p>
      </div>
      <div class="card">
        <h3>Équipe projet</h3>
        <p>Atangana Sara, Neh Ngapouh, Maffo Daniel, Sibefeu Luc, Wome Franck, Emma Nkot.</p>
        <p class="muted">Building Team Project · sessions 1 à 6 · UniRequest.</p>
      </div>
    </div>`;
}

async function openDetail(id) {
  const r = await api(`/api/requetes/${id}`);
  state.currentId = id;
  const actions = r.actions
    .map((a) => {
      const danger = a === "REJETER" || a === "ANNULER";
      return `<button class="btn ${danger ? "danger" : ""}" data-action="${a}">${actionLibelle(a)}</button>`;
    })
    .join(" ");
  $("view-detail").innerHTML = `
    <div class="toprow">
      <div>
        <h2>${r.id} · ${r.type.libelle}</h2>
        <p><span class="badge ${r.etat}">${r.etatLibelle}</span> · ${r.demandeur.nom} · ${r.demandeur.departement}</p>
      </div>
      <button class="btn secondary" id="back-list">Retour à la liste</button>
    </div>
    <div class="grid2">
      <div class="card">
        <p><b>Motif</b><br>${r.motif}</p>
        <p><b>Assigné à</b><br>${r.assigne ? r.assigne.nom : "Personne encore"}</p>
        <p><b>Pièces</b><br>${(r.pieces || []).map((p) => p.nom).join(", ") || "Aucune"}</p>
        <label class="field">Commentaire d’action
          <textarea id="commentaire" placeholder="Motif de décision, pièce manquante…"></textarea>
        </label>
        <label class="field">Ajouter une pièce (nom)
          <input id="piece-plus" placeholder="complement.pdf">
        </label>
        <div class="filters">${actions || "<span class='muted'>Aucune action disponible pour votre rôle.</span>"}</div>
      </div>
      <div class="card">
        <h3>Historique</h3>
        <ul class="timeline">
          ${r.evenements
            .map(
              (e) => `<li>
                <b>${actionLibelle(e.action)}</b> → ${e.etatLibelle}<br>
                <span class="muted">${e.acteur?.nom || ""} · ${dateFr(e.at)}</span>
                ${e.commentaire ? `<div>${e.commentaire}</div>` : ""}
              </li>`
            )
            .join("")}
        </ul>
      </div>
    </div>`;
  $("back-list").onclick = () => setView("liste");
  $("view-detail").onclick = async (ev) => {
    const btn = ev.target.closest("[data-action]");
    if (!btn) return;
    try {
      const pieceNom = $("piece-plus").value.trim();
      await api(`/api/requetes/${id}/actions`, {
        method: "POST",
        body: JSON.stringify({
          action: btn.dataset.action,
          commentaire: $("commentaire").value,
          piece: pieceNom ? { nom: pieceNom, type: "application/pdf", tailleKo: 90 } : undefined,
        }),
      });
      showFlash("Action enregistrée. L’audit a été mis à jour.");
      await refreshListe();
      await openDetail(id);
    } catch (err) {
      showFlash(err.message, true);
    }
  };
  setView("detail");
}

function onTableClick(ev) {
  const row = ev.target.closest("tr.clickable");
  if (row) openDetail(row.dataset.id);
}

$("login-form").onsubmit = async (ev) => {
  ev.preventDefault();
  const fd = new FormData(ev.target);
  $("login-error").textContent = "";
  try {
    await login(fd.get("email"), fd.get("password"));
  } catch (err) {
    $("login-error").textContent = err.message;
  }
};

$("accounts").onclick = async (ev) => {
  const btn = ev.target.closest(".account");
  if (!btn) return;
  $("login-error").textContent = "";
  try {
    await login(btn.dataset.email, btn.dataset.password);
  } catch (err) {
    $("login-error").textContent = err.message;
  }
};

$("logout").onclick = async () => {
  try {
    await api("/api/logout", { method: "POST" });
  } catch {
    /* session already gone */
  }
  state.token = "";
  localStorage.removeItem("ur-token");
  $("app").classList.add("hidden");
  $("login").classList.remove("hidden");
};

for (const btn of document.querySelectorAll(".nav-btn")) {
  btn.onclick = async () => {
    showFlash("");
    if (btn.dataset.view === "dashboard") {
      await refreshListe();
      renderDashboard();
    }
    if (btn.dataset.view === "liste") {
      await refreshListe();
      renderListe();
    }
    if (btn.dataset.view === "nouvelle") renderNouvelle();
    if (btn.dataset.view === "aide") renderAide();
    setView(btn.dataset.view);
  };
}

document.querySelector("main").addEventListener("click", onTableClick);

(async function boot() {
  try {
    await loadComptes();
  } catch (err) {
    $("login-error").textContent = err.message;
  }
  if (!state.token) return;
  try {
    const me = await api("/api/me");
    state.user = me.user;
    await enterApp();
  } catch {
    localStorage.removeItem("ur-token");
    state.token = "";
  }
})();
