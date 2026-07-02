(function() {
"use strict";
const API_ENDPOINT = "/api/coffee-consumptions";
const VERIFY_ENDPOINT = "/api/kopitrack/verify-passcode";
const THEME_KEY = "kopitrack:theme";
const UNLOCK_KEY = "kopitrack:unlocked";
const PASSCODE_KEY = "kopitrack:passcode";
const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });
const state = { entries: [], pendingDeleteId: null, editingId: null, monthlyChart: null, brandChart: null };
const elements = {
  loadingOverlay: document.getElementById("loadingOverlay"),
  toastStack: document.getElementById("toastStack"),
  themeButton: document.getElementById("themeButton"),
  unlockStatus: document.getElementById("unlockStatus"),
  totalExpense: document.getElementById("totalExpense"),
  totalPurchases: document.getElementById("totalPurchases"),
  favoriteBrand: document.getElementById("favoriteBrand"),
  averageExpense: document.getElementById("averageExpense"),
  passcodeModal: document.getElementById("passcodeModal"),
  passcodeForm: document.getElementById("passcodeForm"),
  passcodeInput: document.getElementById("passcodeInput"),
  cancelPasscodeButton: document.getElementById("cancelPasscodeButton"),
  coffeeForm: document.getElementById("coffeeForm"),
  brandInput: document.getElementById("brandInput"),
  variantInput: document.getElementById("variantInput"),
  priceInput: document.getElementById("priceInput"),
  dateInput: document.getElementById("dateInput"),
  lockButton: document.getElementById("lockButton"),
  searchInput: document.getElementById("searchInput"),
  sortSelect: document.getElementById("sortSelect"),
  historyBody: document.getElementById("historyBody"),
  historyEmpty: document.getElementById("historyEmpty"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  statsEmpty: document.getElementById("statsEmpty"),
  statsCharts: document.getElementById("statsCharts"),
  monthlyChartCanvas: document.getElementById("monthlyChart"),
  brandChartCanvas: document.getElementById("brandChart"),
  deleteModal: document.getElementById("deleteModal"),
  deleteMessage: document.getElementById("deleteMessage"),
  cancelDeleteButton: document.getElementById("cancelDeleteButton"),
  confirmDeleteButton: document.getElementById("confirmDeleteButton"),
  editModal: document.getElementById("editModal"),
  editForm: document.getElementById("editForm"),
  editBrandInput: document.getElementById("editBrandInput"),
  editVariantInput: document.getElementById("editVariantInput"),
  editPriceInput: document.getElementById("editPriceInput"),
  editDateInput: document.getElementById("editDateInput"),
  cancelEditButton: document.getElementById("cancelEditButton")
};
function normalizeEntry(entry) {
  return {
    id: String(entry.id || ""),
    brand: String(entry.brand || "").trim(),
    variant: String(entry.variant || "").trim(),
    price: Number(entry.price),
    date: String(entry.date || ""),
    createdAt: String(entry.createdAt || new Date().toISOString()),
    updatedAt: String(entry.updatedAt || entry.createdAt || new Date().toISOString())
  };
}
async function apiRequest(path, options) {
  const response = await fetch(path, { cache: "no-store", ...options, headers: { ...(options && options.headers ? options.headers : {}) } });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || "Permintaan database gagal.");
  return payload;
}
async function loadEntries() {
  const payload = await apiRequest(API_ENDPOINT);
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  return entries.map(normalizeEntry).filter(e => e.id && e.brand && e.variant && Number.isFinite(e.price) && e.price > 0 && isValidDate(e.date));
}
async function refreshEntries() {
  state.entries = await loadEntries();
  renderAll();
}
function mutationHeaders() {
  return { "Content-Type": "application/json", "x-kopitrack-passcode": sessionStorage.getItem(PASSCODE_KEY) || "" };
}
async function createEntry(entry) {
  const payload = await apiRequest(API_ENDPOINT, { method: "POST", headers: mutationHeaders(), body: JSON.stringify(entry) });
  return normalizeEntry(payload.entry);
}
async function updateEntry(id, entry) {
  const payload = await apiRequest(`${API_ENDPOINT}/${encodeURIComponent(id)}`, { method: "PUT", headers: mutationHeaders(), body: JSON.stringify(entry) });
  return normalizeEntry(payload.entry);
}
async function deleteEntry(id) {
  await apiRequest(`${API_ENDPOINT}/${encodeURIComponent(id)}`, { method: "DELETE", headers: mutationHeaders() });
}
function todayValue() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}
function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value + "T00:00:00").getTime());
}
function formatDate(value) {
  return dateFormatter.format(new Date(value + "T00:00:00"));
}
function isUnlocked() {
  return sessionStorage.getItem(UNLOCK_KEY) === "true";
}
function setUnlocked(value) {
  if (value) { sessionStorage.setItem(UNLOCK_KEY, "true"); }
  else { sessionStorage.removeItem(UNLOCK_KEY); sessionStorage.removeItem(PASSCODE_KEY); }
  renderUnlockStatus();
}
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = "toast" + (type === "error" ? " is-error" : "");
  toast.textContent = message;
  elements.toastStack.append(toast);
  setTimeout(() => toast.remove(), 3200);
}
function showLoading() { elements.loadingOverlay.hidden = false; }
function hideLoading() { elements.loadingOverlay.hidden = true; }
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
async function withLoading(work) {
  showLoading();
  try { await wait(180); return await work(); }
  finally { hideLoading(); }
}
function getErrorMessage(error, fallback) { return error instanceof Error ? error.message : fallback; }
async function runDatabaseAction(work, fallback) {
  try { await withLoading(work); }
  catch (error) { showToast(getErrorMessage(error, fallback), "error"); }
}
function validateEntry(input) {
  const brand = String(input.brand || "").trim();
  const variant = String(input.variant || "").trim();
  const price = Number(input.price);
  const date = String(input.date || "").trim();
  if (!brand || !variant || !date || input.price === "") return { ok: false, message: "Semua field wajib diisi." };
  if (!Number.isFinite(price) || price <= 0) return { ok: false, message: "Harga harus angka positif." };
  if (!isValidDate(date)) return { ok: false, message: "Tanggal tidak valid." };
  return { ok: true, value: { brand, variant, price: Math.round(price), date } };
}
function getFavoriteBrand() {
  const totals = new Map();
  for (const entry of state.entries) {
    const current = totals.get(entry.brand) || { brand: entry.brand, count: 0, total: 0 };
    current.count += 1;
    current.total += entry.price;
    totals.set(entry.brand, current);
  }
  return Array.from(totals.values()).sort((a, b) => b.count - a.count || b.total - a.total || a.brand.localeCompare(b.brand, "id-ID"))[0];
}
function sortEntries(entries, sortValue) {
  const next = [...entries];
  next.sort((a, b) => {
    if (sortValue === "date-asc") return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
    if (sortValue === "price-desc") return b.price - a.price || b.date.localeCompare(a.date);
    if (sortValue === "price-asc") return a.price - b.price || b.date.localeCompare(a.date);
    return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
  });
  return next;
}
function renderStats() {
  const total = state.entries.reduce((s, e) => s + e.price, 0);
  const fav = getFavoriteBrand();
  elements.totalExpense.textContent = rupiah.format(total);
  elements.totalPurchases.textContent = String(state.entries.length);
  elements.favoriteBrand.textContent = fav ? fav.brand : "-";
  elements.averageExpense.textContent = state.entries.length ? rupiah.format(total / state.entries.length) : rupiah.format(0);
}
function renderHistory() {
  const term = elements.searchInput.value.trim().toLocaleLowerCase("id-ID");
  const filtered = term ? state.entries.filter(e => e.brand.toLocaleLowerCase("id-ID").includes(term)) : state.entries;
  const entries = sortEntries(filtered, elements.sortSelect.value);
  elements.historyBody.replaceChildren();
  elements.historyEmpty.hidden = entries.length !== 0;
  for (const entry of entries) {
    const row = document.createElement("tr");
    const brand = document.createElement("td");
    const variant = document.createElement("td");
    const price = document.createElement("td");
    const date = document.createElement("td");
    const actions = document.createElement("td");
    const wrap = document.createElement("div");
    const editBtn = document.createElement("button");
    const delBtn = document.createElement("button");
    brand.textContent = entry.brand;
    variant.textContent = entry.variant;
    price.textContent = rupiah.format(entry.price);
    date.textContent = formatDate(entry.date);
    wrap.className = "table-actions";
    editBtn.className = "text-button";
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.dataset.action = "edit";
    editBtn.dataset.id = entry.id;
    delBtn.className = "text-button is-danger";
    delBtn.type = "button";
    delBtn.textContent = "Hapus";
    delBtn.dataset.action = "delete";
    delBtn.dataset.id = entry.id;
    wrap.append(editBtn, delBtn);
    actions.append(wrap);
    row.append(brand, variant, price, date, actions);
    elements.historyBody.append(row);
  }
}
function getThemeColors() {
  const style = getComputedStyle(document.body);
  return { text: style.getPropertyValue("--text").trim(), muted: style.getPropertyValue("--muted").trim(), line: style.getPropertyValue("--line").trim(), surface: style.getPropertyValue("--surface").trim() };
}
function destroyCharts() {
  if (state.monthlyChart) { state.monthlyChart.destroy(); state.monthlyChart = null; }
  if (state.brandChart) { state.brandChart.destroy(); state.brandChart = null; }
}
function renderCharts() {
  destroyCharts();
  if (state.entries.length === 0) {
    elements.statsEmpty.hidden = false;
    elements.statsCharts.hidden = true;
    return;
  }
  if (typeof window.Chart !== "function") {
    elements.statsEmpty.textContent = "Chart.js belum siap.";
    elements.statsEmpty.hidden = false;
    elements.statsCharts.hidden = true;
    return;
  }
  elements.statsEmpty.hidden = true;
  elements.statsCharts.hidden = false;
  const colors = getThemeColors();
  const palette = document.body.dataset.theme === "dark"
    ? ["#f5f5f7", "#d1d1d6", "#a1a1a6", "#747477", "#4a4a4d", "#2c2c2e"]
    : ["#000000", "#343434", "#646464", "#8a8a8a", "#b0b0b0", "#d6d6d6"];
  const monthlyMap = new Map();
  const brandMap = new Map();
  for (const e of state.entries) {
    const mk = e.date.slice(0, 7);
    monthlyMap.set(mk, (monthlyMap.get(mk) || 0) + e.price);
    brandMap.set(e.brand, (brandMap.get(e.brand) || 0) + 1);
  }
  const monthKeys = Array.from(monthlyMap.keys()).sort();
  const monthlyLabels = monthKeys.map(k => {
    const [y, m] = k.split("-").map(Number);
    return new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric" }).format(new Date(y, m - 1, 1));
  });
  const brandEntries = Array.from(brandMap.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id-ID"));
  state.monthlyChart = new Chart(elements.monthlyChartCanvas, {
    type: "bar",
    data: { labels: monthlyLabels, datasets: [{ label: "Pengeluaran", data: monthKeys.map(k => monthlyMap.get(k)), backgroundColor: colors.text, borderRadius: 6 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label(ctx) { return rupiah.format(ctx.parsed.y || 0); } } } }, scales: { x: { ticks: { color: colors.muted }, grid: { display: false } }, y: { ticks: { color: colors.muted, callback(v) { return rupiah.format(v); } }, grid: { color: colors.line } } } }
  });
  state.brandChart = new Chart(elements.brandChartCanvas, {
    type: "doughnut",
    data: { labels: brandEntries.map(([b]) => b), datasets: [{ data: brandEntries.map(([, c]) => c), backgroundColor: palette, borderColor: colors.surface, borderWidth: 3 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: colors.text, boxWidth: 12, usePointStyle: true } } } }
  });
}
function renderUnlockStatus() {
  elements.unlockStatus.textContent = isUnlocked() ? "Terbuka" : "Terkunci";
}
function renderAll() {
  renderStats();
  renderHistory();
  renderCharts();
}
function applyTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  elements.themeButton.textContent = next === "dark" ? "Mode terang" : "Mode gelap";
  renderCharts();
}
function getFormEntry(form) {
  return validateEntry({ brand: form.brand, variant: form.variant, price: form.price, date: form.date });
}
async function handleAddSubmit(event) {
  event.preventDefault();
  if (!isUnlocked()) {
    elements.passcodeModal.hidden = false;
    setTimeout(() => elements.passcodeInput.focus(), 40);
    return;
  }
  const result = getFormEntry({ brand: elements.brandInput.value, variant: elements.variantInput.value, price: elements.priceInput.value, date: elements.dateInput.value });
  if (!result.ok) { showToast(result.message, "error"); return; }
  await runDatabaseAction(async () => {
    await createEntry(result.value);
    await refreshEntries();
    elements.coffeeForm.reset();
    elements.dateInput.value = todayValue();
    showToast("Data kopi berhasil disimpan.");
  }, "Gagal menyimpan data kopi.");
}
async function handlePasscodeSubmit(event) {
  event.preventDefault();
  await withLoading(async () => {
    const entered = elements.passcodeInput.value.trim();
    if (!entered) { showToast("Passcode wajib diisi.", "error"); return; }
    try {
      const response = await fetch(VERIFY_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passcode: entered }) });
      if (!response.ok) { const p = await response.json().catch(() => null); showToast(p?.error || "Passcode salah.", "error"); return; }
      sessionStorage.setItem(PASSCODE_KEY, entered);
      setUnlocked(true);
      elements.passcodeInput.value = "";
      elements.passcodeModal.hidden = true;
      showToast("Tambah kopi sudah terbuka.");
    } catch { showToast("Gagal memverifikasi passcode.", "error"); }
  });
}
function openDeleteModal(id) {
  const entry = state.entries.find(e => e.id === id);
  if (!entry) { showToast("Data tidak ditemukan.", "error"); return; }
  state.pendingDeleteId = id;
  elements.deleteMessage.textContent = entry.brand + " - " + entry.variant + " akan dihapus.";
  elements.deleteModal.hidden = false;
}
function closeDeleteModal() { state.pendingDeleteId = null; elements.deleteModal.hidden = true; }
async function confirmDelete() {
  if (!state.pendingDeleteId) { closeDeleteModal(); return; }
  await runDatabaseAction(async () => {
    await deleteEntry(state.pendingDeleteId);
    closeDeleteModal();
    await refreshEntries();
    showToast("Data berhasil dihapus.");
  }, "Gagal menghapus data.");
}
function openEditModal(id) {
  const entry = state.entries.find(e => e.id === id);
  if (!entry) { showToast("Data tidak ditemukan.", "error"); return; }
  state.editingId = id;
  elements.editBrandInput.value = entry.brand;
  elements.editVariantInput.value = entry.variant;
  elements.editPriceInput.value = String(entry.price);
  elements.editDateInput.value = entry.date;
  elements.editModal.hidden = false;
  setTimeout(() => elements.editBrandInput.focus(), 40);
}
function closeEditModal() { state.editingId = null; elements.editModal.hidden = true; }
async function handleEditSubmit(event) {
  event.preventDefault();
  if (!state.editingId) { closeEditModal(); return; }
  const result = getFormEntry({ brand: elements.editBrandInput.value, variant: elements.editVariantInput.value, price: elements.editPriceInput.value, date: elements.editDateInput.value });
  if (!result.ok) { showToast(result.message, "error"); return; }
  await runDatabaseAction(async () => {
    await updateEntry(state.editingId, result.value);
    closeEditModal();
    await refreshEntries();
    showToast("Data berhasil diperbarui.");
  }, "Gagal memperbarui data.");
}
function exportCsv() {
  if (state.entries.length === 0) { showToast("Belum ada data.", "error"); return; }
  const headers = ["Brand", "Varian", "Harga", "Tanggal"];
  const rows = sortEntries(state.entries, "date-desc").map(e => [e.brand, e.variant, e.price, e.date]);
  const csv = [headers, ...rows].map(row => row.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "kopitrack-" + todayValue() + ".csv";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("CSV berhasil dibuat.");
}
function bindEvents() {
  elements.themeButton.addEventListener("click", () => {
    applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
    showToast("Mode tampilan diperbarui.");
  });
  elements.coffeeForm.addEventListener("submit", handleAddSubmit);
  elements.lockButton.addEventListener("click", () => {
    setUnlocked(false);
    showToast("Tambah kopi dikunci.");
  });
  elements.passcodeForm.addEventListener("submit", handlePasscodeSubmit);
  elements.cancelPasscodeButton.addEventListener("click", () => { elements.passcodeModal.hidden = true; });
  elements.passcodeModal.addEventListener("click", (e) => { if (e.target === elements.passcodeModal) elements.passcodeModal.hidden = true; });
  elements.searchInput.addEventListener("input", renderHistory);
  elements.sortSelect.addEventListener("change", renderHistory);
  elements.exportCsvButton.addEventListener("click", () => { withLoading(exportCsv); });
  elements.historyBody.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;
    if (btn.dataset.action === "edit") openEditModal(btn.dataset.id);
    if (btn.dataset.action === "delete") openDeleteModal(btn.dataset.id);
  });
  elements.cancelDeleteButton.addEventListener("click", closeDeleteModal);
  elements.confirmDeleteButton.addEventListener("click", confirmDelete);
  elements.cancelEditButton.addEventListener("click", closeEditModal);
  elements.editForm.addEventListener("submit", handleEditSubmit);
  elements.deleteModal.addEventListener("click", (e) => { if (e.target === elements.deleteModal) closeDeleteModal(); });
  elements.editModal.addEventListener("click", (e) => { if (e.target === elements.editModal) closeEditModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeDeleteModal();
    closeEditModal();
    elements.passcodeModal.hidden = true;
  });
}
async function init() {
  applyTheme(localStorage.getItem(THEME_KEY));
  elements.dateInput.value = todayValue();
  bindEvents();
  renderUnlockStatus();
  renderAll();
  try { await withLoading(refreshEntries); }
  catch (error) { showToast(getErrorMessage(error, "Gagal memuat data."), "error"); }
}
void init();
})();