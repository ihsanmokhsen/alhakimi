(function () {
  "use strict";

  const API_ENDPOINT = "/api/coffee-consumptions";
  const THEME_KEY = "kopitrack:theme";
  const UNLOCK_KEY = "kopitrack:unlocked";
  const PASSCODE = "820037";
  const ROUTES = ["dashboard", "passcode", "tambah", "riwayat", "statistik"];
  const ROUTE_TITLES = {
    dashboard: "Dashboard",
    passcode: "Passcode",
    tambah: "Tambah Kopi",
    riwayat: "Riwayat",
    statistik: "Statistik"
  };

  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  });

  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium"
  });

  const state = {
    entries: [],
    pendingDeleteId: null,
    editingId: null,
    monthlyChart: null,
    brandChart: null
  };

  const elements = {
    pageTitle: document.getElementById("pageTitle"),
    loadingOverlay: document.getElementById("loadingOverlay"),
    toastStack: document.getElementById("toastStack"),
    menuButton: document.getElementById("menuButton"),
    sidebarBackdrop: document.getElementById("sidebarBackdrop"),
    themeButton: document.getElementById("themeButton"),
    unlockStatus: document.getElementById("unlockStatus"),
    totalExpense: document.getElementById("totalExpense"),
    totalPurchases: document.getElementById("totalPurchases"),
    favoriteBrand: document.getElementById("favoriteBrand"),
    averageExpense: document.getElementById("averageExpense"),
    dashboardHistoryBody: document.getElementById("dashboardHistoryBody"),
    dashboardEmpty: document.getElementById("dashboardEmpty"),
    passcodeForm: document.getElementById("passcodeForm"),
    passcodeInput: document.getElementById("passcodeInput"),
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
    const response = await fetch(path, {
      cache: "no-store",
      ...options,
      headers: {
        ...(options && options.headers ? options.headers : {})
      }
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.error || "Permintaan database gagal.");
    }

    return payload;
  }

  async function loadEntries() {
    const payload = await apiRequest(API_ENDPOINT);
    const entries = Array.isArray(payload.entries) ? payload.entries : [];

    return entries
      .map(normalizeEntry)
      .filter((entry) => entry.id && entry.brand && entry.variant && Number.isFinite(entry.price) && entry.price > 0 && isValidDate(entry.date));
  }

  async function refreshEntries() {
    state.entries = await loadEntries();
    renderAll();
  }

  function mutationHeaders() {
    return {
      "Content-Type": "application/json",
      "x-kopitrack-passcode": PASSCODE
    };
  }

  async function createEntry(entry) {
    const payload = await apiRequest(API_ENDPOINT, {
      method: "POST",
      headers: mutationHeaders(),
      body: JSON.stringify(entry)
    });

    return normalizeEntry(payload.entry);
  }

  async function updateEntry(id, entry) {
    const payload = await apiRequest(`${API_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: mutationHeaders(),
      body: JSON.stringify(entry)
    });

    return normalizeEntry(payload.entry);
  }

  async function deleteEntry(id) {
    await apiRequest(`${API_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: mutationHeaders()
    });
  }

  function todayValue() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  }

  function isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
  }

  function formatDate(value) {
    return dateFormatter.format(new Date(`${value}T00:00:00`));
  }

  function isUnlocked() {
    return sessionStorage.getItem(UNLOCK_KEY) === "true";
  }

  function setUnlocked(value) {
    if (value) {
      sessionStorage.setItem(UNLOCK_KEY, "true");
    } else {
      sessionStorage.removeItem(UNLOCK_KEY);
    }

    renderUnlockStatus();
  }

  function getRoute() {
    const route = window.location.hash.replace(/^#\/?/, "").trim();
    return ROUTES.includes(route) ? route : "dashboard";
  }

  function navigate(route) {
    window.location.hash = route;
  }

  function closeMobileNav() {
    document.body.classList.remove("nav-open");
    elements.sidebarBackdrop.hidden = true;
    elements.menuButton.setAttribute("aria-expanded", "false");
  }

  function openMobileNav() {
    document.body.classList.add("nav-open");
    elements.sidebarBackdrop.hidden = false;
    elements.menuButton.setAttribute("aria-expanded", "true");
  }

  function showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "is-error" : ""}`;
    toast.textContent = message;
    elements.toastStack.append(toast);

    window.setTimeout(() => {
      toast.remove();
    }, 3200);
  }

  function showLoading() {
    elements.loadingOverlay.hidden = false;
  }

  function hideLoading() {
    elements.loadingOverlay.hidden = true;
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function withLoading(work) {
    showLoading();

    try {
      await wait(180);
      return await work();
    } finally {
      hideLoading();
    }
  }

  function getErrorMessage(error, fallback) {
    return error instanceof Error ? error.message : fallback;
  }

  async function runDatabaseAction(work, fallback) {
    try {
      await withLoading(work);
    } catch (error) {
      showToast(getErrorMessage(error, fallback), "error");
    }
  }

  function validateEntry(input) {
    const brand = String(input.brand || "").trim();
    const variant = String(input.variant || "").trim();
    const price = Number(input.price);
    const date = String(input.date || "").trim();

    if (!brand || !variant || !date || input.price === "") {
      return { ok: false, message: "Semua field wajib diisi." };
    }

    if (!Number.isFinite(price) || price <= 0) {
      return { ok: false, message: "Harga harus angka positif." };
    }

    if (!isValidDate(date)) {
      return { ok: false, message: "Tanggal tidak valid." };
    }

    return {
      ok: true,
      value: {
        brand,
        variant,
        price: Math.round(price),
        date
      }
    };
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
    const nextEntries = [...entries];

    nextEntries.sort((a, b) => {
      if (sortValue === "date-asc") {
        return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
      }

      if (sortValue === "price-desc") {
        return b.price - a.price || b.date.localeCompare(a.date);
      }

      if (sortValue === "price-asc") {
        return a.price - b.price || b.date.localeCompare(a.date);
      }

      return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
    });

    return nextEntries;
  }

  function renderDashboard() {
    const total = state.entries.reduce((sum, entry) => sum + entry.price, 0);
    const favorite = getFavoriteBrand();

    elements.totalExpense.textContent = rupiah.format(total);
    elements.totalPurchases.textContent = String(state.entries.length);
    elements.favoriteBrand.textContent = favorite ? favorite.brand : "Belum ada";
    elements.averageExpense.textContent = state.entries.length ? rupiah.format(total / state.entries.length) : rupiah.format(0);

    elements.dashboardHistoryBody.replaceChildren();

    const latestEntries = sortEntries(state.entries, "date-desc").slice(0, 5);
    elements.dashboardEmpty.hidden = latestEntries.length !== 0;

    for (const entry of latestEntries) {
      const row = document.createElement("tr");
      const brand = document.createElement("td");
      const variant = document.createElement("td");
      const price = document.createElement("td");
      const date = document.createElement("td");

      brand.textContent = entry.brand;
      variant.textContent = entry.variant;
      price.textContent = rupiah.format(entry.price);
      date.textContent = formatDate(entry.date);

      row.append(brand, variant, price, date);
      elements.dashboardHistoryBody.append(row);
    }
  }

  function renderHistory() {
    const searchTerm = elements.searchInput.value.trim().toLocaleLowerCase("id-ID");
    const filtered = state.entries.filter((entry) => entry.brand.toLocaleLowerCase("id-ID").includes(searchTerm));
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
      const actionWrap = document.createElement("div");
      const editButton = document.createElement("button");
      const deleteButton = document.createElement("button");

      brand.textContent = entry.brand;
      variant.textContent = entry.variant;
      price.textContent = rupiah.format(entry.price);
      date.textContent = formatDate(entry.date);

      actionWrap.className = "table-actions";
      editButton.className = "text-button";
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.dataset.action = "edit";
      editButton.dataset.id = entry.id;

      deleteButton.className = "text-button is-danger";
      deleteButton.type = "button";
      deleteButton.textContent = "Hapus";
      deleteButton.dataset.action = "delete";
      deleteButton.dataset.id = entry.id;

      actionWrap.append(editButton, deleteButton);
      actions.append(actionWrap);
      row.append(brand, variant, price, date, actions);
      elements.historyBody.append(row);
    }
  }

  function getThemeColors() {
    const style = getComputedStyle(document.body);
    return {
      text: style.getPropertyValue("--text").trim(),
      muted: style.getPropertyValue("--muted").trim(),
      line: style.getPropertyValue("--line").trim(),
      surface: style.getPropertyValue("--surface").trim()
    };
  }

  function destroyCharts() {
    if (state.monthlyChart) {
      state.monthlyChart.destroy();
      state.monthlyChart = null;
    }

    if (state.brandChart) {
      state.brandChart.destroy();
      state.brandChart = null;
    }
  }

  function renderStats() {
    destroyCharts();

    if (state.entries.length === 0) {
      elements.statsEmpty.textContent = "Belum ada data untuk ditampilkan.";
      elements.statsEmpty.hidden = false;
      elements.statsCharts.hidden = true;
      return;
    }

    if (typeof window.Chart !== "function") {
      elements.statsEmpty.textContent = "Chart.js belum siap. Muat ulang halaman setelah koneksi stabil.";
      elements.statsEmpty.hidden = false;
      elements.statsCharts.hidden = true;
      return;
    }

    elements.statsEmpty.hidden = true;
    elements.statsCharts.hidden = false;

    const colors = getThemeColors();
    const chartPalette =
      document.body.dataset.theme === "dark"
        ? ["#f5f5f7", "#d1d1d6", "#a1a1a6", "#747477", "#4a4a4d", "#2c2c2e"]
        : ["#000000", "#343434", "#646464", "#8a8a8a", "#b0b0b0", "#d6d6d6"];
    const monthlyMap = new Map();
    const brandMap = new Map();

    for (const entry of state.entries) {
      const monthKey = entry.date.slice(0, 7);
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + entry.price);
      brandMap.set(entry.brand, (brandMap.get(entry.brand) || 0) + 1);
    }

    const monthKeys = Array.from(monthlyMap.keys()).sort();
    const monthlyLabels = monthKeys.map((key) => {
      const [year, month] = key.split("-").map(Number);
      return new Intl.DateTimeFormat("id-ID", {
        month: "short",
        year: "numeric"
      }).format(new Date(year, month - 1, 1));
    });

    const brandEntries = Array.from(brandMap.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "id-ID"));

    state.monthlyChart = new window.Chart(elements.monthlyChartCanvas, {
      type: "bar",
      data: {
        labels: monthlyLabels,
        datasets: [
          {
            label: "Pengeluaran",
            data: monthKeys.map((key) => monthlyMap.get(key)),
            backgroundColor: colors.text,
            borderRadius: 6
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                return rupiah.format(context.parsed.y || 0);
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: colors.muted },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: colors.muted,
              callback(value) {
                return rupiah.format(value);
              }
            },
            grid: { color: colors.line }
          }
        }
      }
    });

    state.brandChart = new window.Chart(elements.brandChartCanvas, {
      type: "doughnut",
      data: {
        labels: brandEntries.map(([brand]) => brand),
        datasets: [
          {
            data: brandEntries.map(([, count]) => count),
            backgroundColor: chartPalette,
            borderColor: colors.surface,
            borderWidth: 3
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: colors.text,
              boxWidth: 12,
              usePointStyle: true
            }
          }
        }
      }
    });
  }

  function renderUnlockStatus() {
    elements.unlockStatus.textContent = isUnlocked() ? "Unlocked" : "Terkunci";
  }

  function renderActiveNav(route) {
    document.querySelectorAll("[data-route]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.route === route);
    });
  }

  function renderRoute() {
    let route = getRoute();

    if (route === "tambah" && !isUnlocked()) {
      navigate("passcode");
      return;
    }

    document.querySelectorAll(".view").forEach((view) => {
      view.classList.toggle("is-active", view.dataset.view === route);
    });

    elements.pageTitle.textContent = ROUTE_TITLES[route];
    renderActiveNav(route);
    closeMobileNav();

    if (route === "dashboard") {
      renderDashboard();
    }

    if (route === "riwayat") {
      renderHistory();
    }

    if (route === "statistik") {
      renderStats();
    } else {
      destroyCharts();
    }

    if (route === "passcode") {
      window.setTimeout(() => elements.passcodeInput.focus(), 40);
    }
  }

  function renderAll() {
    renderDashboard();
    renderHistory();

    if (getRoute() === "statistik") {
      renderStats();
    }
  }

  function applyTheme(theme) {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.body.dataset.theme = nextTheme;
    localStorage.setItem(THEME_KEY, nextTheme);
    elements.themeButton.textContent = nextTheme === "dark" ? "Mode terang" : "Mode gelap";

    if (getRoute() === "statistik") {
      renderStats();
    }
  }

  function getFormEntry(form) {
    return validateEntry({
      brand: form.brand,
      variant: form.variant,
      price: form.price,
      date: form.date
    });
  }

  async function handleAddSubmit(event) {
    event.preventDefault();

    const result = getFormEntry({
      brand: elements.brandInput.value,
      variant: elements.variantInput.value,
      price: elements.priceInput.value,
      date: elements.dateInput.value
    });

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    await runDatabaseAction(async () => {
      await createEntry(result.value);
      await refreshEntries();
      elements.coffeeForm.reset();
      elements.dateInput.value = todayValue();
      showToast("Data kopi berhasil disimpan ke database.");
    }, "Gagal menyimpan data kopi ke database.");
  }

  async function handlePasscodeSubmit(event) {
    event.preventDefault();

    await withLoading(async () => {
      if (elements.passcodeInput.value.trim() !== PASSCODE) {
        showToast("Passcode salah.", "error");
        return;
      }

      setUnlocked(true);
      elements.passcodeInput.value = "";
      showToast("Tambah kopi sudah terbuka.");
      navigate("tambah");
    });
  }

  function openDeleteModal(id) {
    const entry = state.entries.find((item) => item.id === id);

    if (!entry) {
      showToast("Data tidak ditemukan.", "error");
      return;
    }

    state.pendingDeleteId = id;
    elements.deleteMessage.textContent = `${entry.brand} - ${entry.variant} akan dihapus dari riwayat.`;
    elements.deleteModal.hidden = false;
  }

  function closeDeleteModal() {
    state.pendingDeleteId = null;
    elements.deleteModal.hidden = true;
  }

  async function confirmDelete() {
    if (!state.pendingDeleteId) {
      closeDeleteModal();
      return;
    }

    await runDatabaseAction(async () => {
      await deleteEntry(state.pendingDeleteId);
      closeDeleteModal();
      await refreshEntries();
      showToast("Data kopi berhasil dihapus dari database.");
    }, "Gagal menghapus data kopi dari database.");
  }

  function openEditModal(id) {
    const entry = state.entries.find((item) => item.id === id);

    if (!entry) {
      showToast("Data tidak ditemukan.", "error");
      return;
    }

    state.editingId = id;
    elements.editBrandInput.value = entry.brand;
    elements.editVariantInput.value = entry.variant;
    elements.editPriceInput.value = String(entry.price);
    elements.editDateInput.value = entry.date;
    elements.editModal.hidden = false;
    window.setTimeout(() => elements.editBrandInput.focus(), 40);
  }

  function closeEditModal() {
    state.editingId = null;
    elements.editModal.hidden = true;
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    if (!state.editingId) {
      closeEditModal();
      return;
    }

    const result = getFormEntry({
      brand: elements.editBrandInput.value,
      variant: elements.editVariantInput.value,
      price: elements.editPriceInput.value,
      date: elements.editDateInput.value
    });

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    await runDatabaseAction(async () => {
      await updateEntry(state.editingId, result.value);
      closeEditModal();
      await refreshEntries();
      showToast("Data kopi berhasil diperbarui di database.");
    }, "Gagal memperbarui data kopi di database.");
  }

  function exportCsv() {
    if (state.entries.length === 0) {
      showToast("Belum ada data untuk diexport.", "error");
      return;
    }

    const headers = ["Brand", "Varian", "Harga", "Tanggal"];
    const rows = sortEntries(state.entries, "date-desc").map((entry) => [entry.brand, entry.variant, entry.price, entry.date]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value).replace(/"/g, '""');
            return `"${text}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kopitrack-${todayValue()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("CSV berhasil dibuat.");
  }

  function bindEvents() {
    window.addEventListener("hashchange", renderRoute);

    document.addEventListener("click", (event) => {
      const routeButton = event.target.closest("[data-route]");
      if (routeButton) {
        navigate(routeButton.dataset.route);
      }
    });

    elements.menuButton.addEventListener("click", () => {
      if (document.body.classList.contains("nav-open")) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    elements.sidebarBackdrop.addEventListener("click", closeMobileNav);
    elements.themeButton.addEventListener("click", () => {
      applyTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
      showToast("Mode tampilan diperbarui.");
    });

    elements.passcodeForm.addEventListener("submit", handlePasscodeSubmit);
    elements.coffeeForm.addEventListener("submit", handleAddSubmit);
    elements.lockButton.addEventListener("click", () => {
      setUnlocked(false);
      showToast("Halaman tambah kopi dikunci.");
      navigate("passcode");
    });

    elements.searchInput.addEventListener("input", renderHistory);
    elements.sortSelect.addEventListener("change", renderHistory);
    elements.exportCsvButton.addEventListener("click", () => {
      withLoading(async () => exportCsv());
    });

    elements.historyBody.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");

      if (!button) {
        return;
      }

      if (button.dataset.action === "edit") {
        openEditModal(button.dataset.id);
      }

      if (button.dataset.action === "delete") {
        openDeleteModal(button.dataset.id);
      }
    });

    elements.cancelDeleteButton.addEventListener("click", closeDeleteModal);
    elements.confirmDeleteButton.addEventListener("click", confirmDelete);
    elements.cancelEditButton.addEventListener("click", closeEditModal);
    elements.editForm.addEventListener("submit", handleEditSubmit);

    elements.deleteModal.addEventListener("click", (event) => {
      if (event.target === elements.deleteModal) {
        closeDeleteModal();
      }
    });

    elements.editModal.addEventListener("click", (event) => {
      if (event.target === elements.editModal) {
        closeEditModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      closeMobileNav();
      closeDeleteModal();
      closeEditModal();
    });
  }

  async function init() {
    applyTheme(localStorage.getItem(THEME_KEY));
    elements.dateInput.value = todayValue();
    bindEvents();
    renderUnlockStatus();
    renderAll();
    renderRoute();

    try {
      await withLoading(refreshEntries);
    } catch (error) {
      showToast(getErrorMessage(error, "Gagal memuat data kopi dari database."), "error");
    }
  }

  void init();
})();
