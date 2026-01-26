/* PharmaSurplus prototype (front-end only)
   - Single page with views: store, orders, profile
   - Filters + search + sorting on mock data
*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ---------- Mock data ---------- */
const listings = [
  {
    id: "PS-001",
    name: "Paracetamol 500mg (20 comp.)",
    category: "analgesicos",
    activeSubstance: "paracetamol",
    lab: "Genéricos Lx",
    price: 2.90,
    discountPct: 45,
    expiresInDays: 12,
    distanceKm: 3.2,
    seller: "Farmácia Luz",
    city: "Lisboa",
    stock: 18
  },
  {
    id: "PS-002",
    name: "Amoxicilina 500mg (16 cáps.)",
    category: "antibioticos",
    activeSubstance: "amoxicilina",
    lab: "BioPharma",
    price: 6.50,
    discountPct: 35,
    expiresInDays: 8,
    distanceKm: 7.4,
    seller: "Farmácia do Parque",
    city: "Oeiras",
    stock: 6
  },
  {
    id: "PS-003",
    name: "Vitamina C 1000mg (30 comp.)",
    category: "vitaminas",
    activeSubstance: "ácido ascórbico",
    lab: "VitaLabs",
    price: 4.20,
    discountPct: 50,
    expiresInDays: 40,
    distanceKm: 2.1,
    seller: "Farmácia Central",
    city: "Lisboa",
    stock: 22
  },
  {
    id: "PS-004",
    name: "Ibuprofeno 400mg (20 comp.)",
    category: "analgesicos",
    activeSubstance: "ibuprofeno",
    lab: "NovaGen",
    price: 3.80,
    discountPct: 30,
    expiresInDays: 5,
    distanceKm: 1.4,
    seller: "Farmácia Oriente",
    city: "Lisboa",
    stock: 10
  },
  {
    id: "PS-005",
    name: "Spray Nasal (15ml)",
    category: "gripe",
    activeSubstance: "solução salina",
    lab: "NasoCare",
    price: 5.10,
    discountPct: 40,
    expiresInDays: 18,
    distanceKm: 12.0,
    seller: "Farmácia Tejo",
    city: "Almada",
    stock: 9
  },
  {
    id: "PS-006",
    name: "Creme Hidratante Dermo (200ml)",
    category: "dermo",
    activeSubstance: "ureia",
    lab: "DermoPlus",
    price: 7.90,
    discountPct: 55,
    expiresInDays: 25,
    distanceKm: 6.1,
    seller: "Farmácia do Mar",
    city: "Cascais",
    stock: 5
  },
  {
    id: "PS-007",
    name: "Antigripal (10 saquetas)",
    category: "gripe",
    activeSubstance: "paracetamol + outros",
    lab: "ColdAway",
    price: 8.40,
    discountPct: 60,
    expiresInDays: 3,
    distanceKm: 4.8,
    seller: "Farmácia Saldanha",
    city: "Lisboa",
    stock: 7
  },
  {
    id: "PS-008",
    name: "Probiótico (14 cáps.)",
    category: "vitaminas",
    activeSubstance: "lactobacillus",
    lab: "GutCare",
    price: 9.20,
    discountPct: 35,
    expiresInDays: 60,
    distanceKm: 9.9,
    seller: "Farmácia Colinas",
    city: "Amadora",
    stock: 12
  }
];

let orders = [];

/* ---------- UI elements ---------- */
const sidebar = $("#sidebar");
const backdrop = $("#backdrop");
const cards = $("#cards");
const emptyState = $("#emptyState");
const resultCount = $("#resultCount");

const searchInput = $("#searchInput");
const clearSearchBtn = $("#clearSearchBtn");

const categorySelect = $("#categorySelect");
const priceMin = $("#priceMin");
const priceMax = $("#priceMax");
const distanceSelect = $("#distanceSelect");
const sortSelect = $("#sortSelect");

const resetBtn = $("#resetBtn");
const newListingBtn = $("#newListingBtn");

const notifBtn = $("#notifBtn");
const notifDot = $("#notifDot");
const userBtn = $("#userBtn");

const ordersList = $("#ordersList");

/* ---------- Helpers ---------- */
function showToast(msg) {
  const toast = $("#toast");
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => (toast.hidden = true), 2200);
}

function badgeForExpiry(days) {
  if (days <= 7) return { cls: "badge--bad", text: `Expira em ${days} dias` };
  if (days <= 21) return { cls: "badge--warn", text: `Expira em ${days} dias` };
  return { cls: "badge--good", text: `Expira em ${days} dias` };
}

function formatEur(v) {
  return v.toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

function normalize(str) {
  return (str || "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/* ---------- Rendering ---------- */
function renderCards(items) {
  cards.innerHTML = "";
  if (!items.length) {
    emptyState.hidden = false;
    resultCount.textContent = "0 anúncios";
    return;
  }

  emptyState.hidden = true;
  resultCount.textContent = `${items.length} anúncio(s)`;

  for (const it of items) {
    const b = badgeForExpiry(it.expiresInDays);

    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div class="card__media">
        <div class="badge ${b.cls}">${b.text}</div>
      </div>
      <div class="card__body">
        <div class="card__title">${it.name}</div>
        <div class="card__sub">
          ${it.seller} • ${it.city} • ${it.distanceKm.toFixed(1)} km • Stock: ${it.stock}
        </div>
        <div class="pills">
          <span class="pill">${labelCategory(it.category)}</span>
          <span class="pill">${it.discountPct}% desconto</span>
          <span class="pill">${it.lab}</span>
        </div>
      </div>
      <div class="card__footer">
        <div>
          <div class="price">${formatEur(it.price)}</div>
          <div class="small">ID: ${it.id}</div>
        </div>
        <div class="card__cta">
          <button class="btn" data-action="details" data-id="${it.id}">Ver</button>
          <button class="btn btn--primary" data-action="order" data-id="${it.id}">Pedir</button>
        </div>
      </div>
    `;

    cards.appendChild(el);
  }
}

function labelCategory(cat) {
  const map = {
    analgesicos: "Analgésicos",
    antibioticos: "Antibióticos",
    dermo: "Dermo",
    gripe: "Gripe & Constipação",
    vitaminas: "Vitaminas"
  };
  return map[cat] || "Outros";
}

/* ---------- Filtering / Sorting ---------- */
function applyFilters() {
  const q = normalize(searchInput.value.trim());
  const cat = categorySelect.value;
  const dMax = Number(distanceSelect.value);
  const pMin = priceMin.value === "" ? null : Number(priceMin.value);
  const pMax = priceMax.value === "" ? null : Number(priceMax.value);

  let items = listings.slice();

  if (q) {
    items = items.filter((it) => {
      const hay = normalize(`${it.name} ${it.activeSubstance} ${it.lab} ${it.seller} ${it.city}`);
      return hay.includes(q);
    });
  }

  if (cat !== "all") items = items.filter((it) => it.category === cat);

  if (!Number.isNaN(dMax)) items = items.filter((it) => it.distanceKm <= dMax);

  if (pMin !== null && !Number.isNaN(pMin)) items = items.filter((it) => it.price >= pMin);
  if (pMax !== null && !Number.isNaN(pMax)) items = items.filter((it) => it.price <= pMax);

  items = applySort(items, sortSelect.value, q);

  renderCards(items);
}

function applySort(items, mode, query) {
  const arr = items.slice();

  if (mode === "price_asc") arr.sort((a, b) => a.price - b.price);
  else if (mode === "price_desc") arr.sort((a, b) => b.price - a.price);
  else if (mode === "expiry_asc") arr.sort((a, b) => a.expiresInDays - b.expiresInDays);
  else if (mode === "distance_asc") arr.sort((a, b) => a.distanceKm - b.distanceKm);
  else {
    // relevance: simple scoring
    const q = normalize(query || "");
    if (!q) return arr;
    const score = (it) => {
      const name = normalize(it.name);
      const sub = normalize(it.activeSubstance);
      const lab = normalize(it.lab);
      let s = 0;
      if (name.includes(q)) s += 3;
      if (sub.includes(q)) s += 2;
      if (lab.includes(q)) s += 1;
      // prefer near expiry a little, and closer
      s += Math.max(0, (30 - it.expiresInDays)) / 30;
      s += Math.max(0, (10 - it.distanceKm)) / 10;
      return s;
    };
    arr.sort((a, b) => score(b) - score(a));
  }
  return arr;
}

/* ---------- Navigation / Views ---------- */
function setView(view) {
  $$(".view").forEach((v) => v.classList.remove("is-visible"));
  $(`#view-${view}`).classList.add("is-visible");

  $$(".nav-item").forEach((b) => b.classList.remove("is-active"));
  const btn = $(`.nav-item[data-view="${view}"]`);
  if (btn) btn.classList.add("is-active");

  closeSidebar();
}

function openSidebar() {
  sidebar.classList.add("is-open");
  sidebar.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
}
function closeSidebar() {
  sidebar.classList.remove("is-open");
  sidebar.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
}

/* ---------- Orders (mock) ---------- */
function addOrderFromListing(listingId) {
  const it = listings.find((x) => x.id === listingId);
  if (!it) return;

  const order = {
    id: `ORD-${Math.floor(Math.random() * 9000 + 1000)}`,
    itemName: it.name,
    seller: it.seller,
    status: "Enviado",
    createdAt: new Date().toLocaleString("pt-PT"),
    total: it.price
  };
  orders.unshift(order);
  renderOrders();
  showToast(`Pedido criado: ${order.id}`);
  setView("orders");
}

function renderOrders() {
  if (!orders.length) {
    ordersList.innerHTML = `
      <div class="empty" style="margin-top:10px">
        <div class="empty__title">Sem pedidos ainda</div>
        <div class="empty__text">Volta à loja e clica em “Pedir” num anúncio.</div>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = orders.map((o) => `
    <div class="list-item">
      <div class="list-item__left">
        <div style="font-weight:900">${o.id} • ${o.status}</div>
        <div style="color:rgba(255,255,255,0.72); font-size:12px">
          ${o.itemName} — ${o.seller}
        </div>
      </div>
      <div class="list-item__right">
        <div>${formatEur(o.total)}</div>
        <div>${o.createdAt}</div>
      </div>
    </div>
  `).join("");
}

function seedOrders() {
  orders = [
    { id: "ORD-1842", itemName: "Ibuprofeno 400mg (20 comp.)", seller: "Farmácia Oriente", status: "Aceite", createdAt: "25/01/2026 16:12", total: 3.80 },
    { id: "ORD-9011", itemName: "Spray Nasal (15ml)", seller: "Farmácia Tejo", status: "Enviado", createdAt: "25/01/2026 11:03", total: 5.10 }
  ];
  renderOrders();
  showToast("Pedidos de exemplo gerados");
}

/* ---------- Events ---------- */
$("#menuBtn").addEventListener("click", openSidebar);
$("#closeSidebarBtn").addEventListener("click", closeSidebar);
backdrop.addEventListener("click", closeSidebar);

$$(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => setView(btn.dataset.view));
});

$("#goStoreBtn").addEventListener("click", () => setView("store"));

notifBtn.addEventListener("click", () => {
  // For prototype: toggle dot and show toast
  const isOn = !notifDot.hidden;
  notifDot.hidden = isOn;
  showToast(isOn ? "Notificações marcadas como vistas" : "Tens novas notificações (demo)");
});

userBtn.addEventListener("click", () => setView("profile"));

searchInput.addEventListener("input", () => {
  clearSearchBtn.hidden = searchInput.value.trim().length === 0;
  applyFilters();
});
clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearSearchBtn.hidden = true;
  applyFilters();
});

[categorySelect, priceMin, priceMax, distanceSelect, sortSelect].forEach((el) => {
  el.addEventListener("input", applyFilters);
  el.addEventListener("change", applyFilters);
});

resetBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearSearchBtn.hidden = true;
  categorySelect.value = "all";
  priceMin.value = "";
  priceMax.value = "";
  distanceSelect.value = "9999";
  sortSelect.value = "relevance";
  applyFilters();
  showToast("Filtros limpos");
});

newListingBtn.addEventListener("click", () => {
  showToast("Demo: criar anúncio (próximo passo)");
});

$("#seedOrdersBtn").addEventListener("click", seedOrders);

cards.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "details") {
    const it = listings.find((x) => x.id === id);
    if (!it) return;
    showToast(`${it.name} — ${formatEur(it.price)} — ${it.seller}`);
  } else if (action === "order") {
    addOrderFromListing(id);
  }
});

/* ---------- Init ---------- */
renderOrders();
applyFilters();
setView("store");
