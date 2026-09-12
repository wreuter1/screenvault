let csrf = "";
let me = null;

const $ = (id) => document.getElementById(id);

async function api(url, options = {}) {
  options.headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json"
  };

  if (options.method && options.method !== "GET") {
    options.headers["x-csrf-token"] = csrf;
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

async function login() {
  try {
    const data = await api("/api/login", {
      method: "POST",
      body: JSON.stringify({
        email: $("email").value,
        password: $("pw").value
      })
    });

    csrf = data.csrf;
    me = data.user;

    $("login").hidden = true;
    $("dash").hidden = false;

    render();
  } catch (error) {
    $("err").textContent = error.message;
  }
}

async function render() {
  $("who").innerHTML =
    `<b>${me.name}</b> <span class="tag">${me.role}</span>`;

  $("identity").textContent =
    me.verified ? "✓ VERIFIED" : "UNVERIFIED";

  if (me.role !== "ACTOR") {
    $("casting").hidden = false;
    $("auditbox").hidden = false;
  }

  refresh();
}

async function refresh() {
  try {
    const [productions, auditions] = await Promise.all([
      api("/api/productions"),
      api("/api/auditions")
    ]);

    $("pc").textContent = productions.length;
    $("ac").textContent = auditions.length;

    $("prods").innerHTML =
      productions.map((production) => `
        <div class="card">
          #${production.id}
          <b>${esc(production.name)}</b>
          <span class="tag">${production.classification}</span>
        </div>
      `).join("") || "None";

    $("aud").innerHTML =
      auditions.map((audition) => `
        <div class="card">
          #${audition.id}
          <b>${esc(audition.title)}</b>
          — ${esc(audition.production)}
          <span class="tag">${audition.status}</span>
          <br>
          <button type="button"
            data-action="media"
            data-id="${audition.id}">
            Protected media
          </button>

          <button type="button"
            data-action="prov"
            data-id="${audition.id}">
            Provenance
          </button>
        </div>
      `).join("") || "None";

    if (me.role !== "ACTOR") {
      const logs = await api("/api/audit");
      $("logs").textContent = JSON.stringify(logs, null, 2);
    }
  } catch (error) {
    console.error(error);
  }
}

async function prod() {
  try {
    await api("/api/productions", {
      method: "POST",
      body: JSON.stringify({
        name: $("pn").value,
        classification: $("cls").value
      })
    });

    $("pn").value = "";
    refresh();
  } catch (error) {
    alert(error.message);
  }
}

async function invite() {
  try {
    await api("/api/auditions", {
      method: "POST",
      body: JSON.stringify({
        productionId: Number($("pid").value),
        actorId: Number($("aid").value),
        title: $("at").value
      })
    });

    refresh();
  } catch (error) {
    alert(error.message);
  }
}

async function media(id) {
  try {
    const data = await api(`/api/auditions/${id}/media-url`);

    alert(
      "Authorized. Signed URL expires in 60 seconds.\n" +
      location.origin +
      data.url
    );
  } catch (error) {
    alert(error.message);
  }
}

async function prov(id) {
  try {
    const data = await api(`/api/provenance/${id}`);

    alert(
      `SHA-256: ${data.sha256}\n` +
      `Watermark: ${data.watermark}\n` +
      `AI risk: ${data.ai_risk}`
    );
  } catch (error) {
    alert(error.message);
  }
}

async function loadPolicy() {
  try {
    const data = await api(
      `/api/likeness/${Number($("lpid").value)}`
    );

    const permissions = [
      "feature_film",
      "tv",
      "promotion",
      "ai_training",
      "synthetic_performance",
      "synthetic_voice",
      "posthumous_replication"
    ];

    $("policy").innerHTML =
      permissions.map((permission) => `
        <label>
          ${permission.replaceAll("_", " ")}
          <input
            type="checkbox"
            id="p_${permission}"
            ${data[permission] ? "checked" : ""}
          >
        </label>
      `).join("") +
      `<button id="savePolicyBtn" type="button">
        Save permissions
      </button>`;
  } catch (error) {
    alert(error.message);
  }
}

async function savePolicy() {
  const permissions = [
    "feature_film",
    "tv",
    "promotion",
    "ai_training",
    "synthetic_performance",
    "synthetic_voice",
    "posthumous_replication"
  ];

  const body = Object.fromEntries(
    permissions.map((permission) => [
      permission,
      $(`p_${permission}`).checked
    ])
  );

  try {
    await api(
      `/api/likeness/${Number($("lpid").value)}`,
      {
        method: "PUT",
        body: JSON.stringify(body)
      }
    );

    alert("Saved");
  } catch (error) {
    alert(error.message);
  }
}

async function logout() {
  try {
    await api("/api/logout", {
      method: "POST"
    });
  } finally {
    location.reload();
  }
}

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character])
  );
}

document.addEventListener("DOMContentLoaded", () => {
  $("loginBtn").addEventListener("click", login);
  $("prodBtn").addEventListener("click", prod);
  $("inviteBtn").addEventListener("click", invite);
  $("loadPolicyBtn").addEventListener("click", loadPolicy);
  $("logoutBtn").addEventListener("click", logout);

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    if (button.id === "savePolicyBtn") {
      savePolicy();
      return;
    }

    if (!button.dataset.action) return;

    const id = Number(button.dataset.id);

    if (button.dataset.action === "media") {
      media(id);
    }

    if (button.dataset.action === "prov") {
      prov(id);
    }
  });
});
