/* ====== Capa de guardado (localStorage) ====== */
const db = {
  leer(clave) {
    const dato = localStorage.getItem(clave);
    return dato ? JSON.parse(dato) : [];
  },
  guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
  },
  leerObjeto(clave, porDefecto) {
    const dato = localStorage.getItem(clave);
    return dato ? JSON.parse(dato) : porDefecto;
  }
};

const CLAVES = {
  inventario: "muebleria_inventario",
  compras: "muebleria_compras",
  ventas: "muebleria_ventas",
  saldo: "muebleria_saldo"
};

const SALDO_DEFAULT = { monto: 0, fecha: "2000-01-01" };

/* ====== Utilidades ====== */
/* Arma "Micro · Negro", o solo "Accesorio" si no hay color */
function subtitulo(material, color) {
  const partes = [material, color].filter(x => x && String(x).trim() !== "");
  return partes.length ? partes.join(" · ") : "Sin clasificar";
}

function formatearColones(n) {
  if (n === null || n === undefined || n === "") return "—";
  return "₡" + Number(n).toLocaleString("es-CR", { maximumFractionDigits: 2 });
}
function generarId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000);
}
function normalizar(txt) {
  return (txt || "").trim().toLowerCase();
}
function mismoMueble(a, b) {
  return normalizar(a.modelo) === normalizar(b.modelo)
      && a.material === b.material
      && normalizar(a.color) === normalizar(b.color);
}
function hoyLocal() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
function formatearFecha(iso) {
  if (!iso) return "—";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

/* ====== Íconos SVG (sin archivos externos) ====== */
const SVG = (d, relleno) =>
  `<svg viewBox="0 0 24 24" fill="${relleno ? "currentColor" : "none"}" stroke="${relleno ? "none" : "currentColor"}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const ICONOS = {
  sofa: SVG(`<path d="M6 6h12a2 2 0 0 1 2 2v3h-1.2a2 2 0 0 0-2 2v1H7.2v-1a2 2 0 0 0-2-2H4V8a2 2 0 0 1 2-2z"/><path d="M2.6 12.6a1.6 1.6 0 0 1 3.2 0V17h12.4v-4.4a1.6 1.6 0 0 1 3.2 0V18a1 1 0 0 1-1 1H3.6a1 1 0 0 1-1-1z"/>`, true),
  carrito: SVG(`<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.1a1 1 0 0 0 1-.8L21 7H6"/>`),
  caja: SVG(`<path d="M12 2.5l8.5 4.7v9.6L12 21.5 3.5 16.8V7.2z"/><path d="M3.5 7.2L12 12l8.5-4.8"/><path d="M12 12v9.5"/>`),
  camion: SVG(`<path d="M2.5 6.5h10.5v9H2.5z"/><path d="M13 9.5h3.6l4 4v2H13z"/><circle cx="6.6" cy="18" r="1.7"/><circle cx="17.4" cy="18" r="1.7"/>`),
  diesel: SVG(`<path d="M3.5 21V5a2 2 0 0 1 2-2h5.5a2 2 0 0 1 2 2v16"/><path d="M2 21h12.5"/><path d="M13 9.5h3a2 2 0 0 1 2 2v5.5a1.6 1.6 0 0 0 3.2 0V9.5l-2.8-2.8"/><path d="M6.5 8h3.5"/>`),
  bolsa: SVG(`<path d="M5.5 7.5h13l1 12.5h-15z"/><path d="M9 7.5V5.4a3 3 0 0 1 6 0v2.1"/>`),
  etiqueta: SVG(`<path d="M11.6 2.5H4.5a2 2 0 0 0-2 2v7.1L12.4 21.5l9.1-9.1z"/><circle cx="7.6" cy="7.6" r="1.3"/>`),
  grafico: SVG(`<path d="M4.5 20V11M10 20V4.5M15.5 20v-6.5M21 20V8.5"/><path d="M2.5 20.5h19"/>`),
  banco: SVG(`<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.6 3.6 2.9 8 2.9s8-1.3 8-2.9V6"/><path d="M4 12v6c0 1.6 3.6 2.9 8 2.9s8-1.3 8-2.9v-6"/>`),
  engrane: SVG(`<circle cx="12" cy="12" r="3.1"/><path d="M19.2 14.5a1.6 1.6 0 0 0 .32 1.77l.06.06a1.94 1.94 0 1 1-2.74 2.74l-.06-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-.97 1.46v.17a1.94 1.94 0 1 1-3.88 0v-.09a1.6 1.6 0 0 0-1.05-1.46 1.6 1.6 0 0 0-1.77.32l-.06.06a1.94 1.94 0 1 1-2.74-2.74l.06-.06a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.46-.97h-.17a1.94 1.94 0 1 1 0-3.88h.09a1.6 1.6 0 0 0 1.46-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.06a1.94 1.94 0 1 1 2.74-2.74l.06.06a1.6 1.6 0 0 0 1.77.32h.08a1.6 1.6 0 0 0 .97-1.46v-.17a1.94 1.94 0 1 1 3.88 0v.09a1.6 1.6 0 0 0 .97 1.46 1.6 1.6 0 0 0 1.77-.32l.06-.06a1.94 1.94 0 1 1 2.74 2.74l-.06.06a1.6 1.6 0 0 0-.32 1.77v.08a1.6 1.6 0 0 0 1.46.97h.17a1.94 1.94 0 1 1 0 3.88h-.09a1.6 1.6 0 0 0-1.46.97z"/>`)
};

function icono(nombre) { return ICONOS[nombre] || ""; }

/* Poner los íconos del header y la nav al arrancar */
function pintarIconosFijos() {
  document.getElementById("btn-ajustes").innerHTML = icono("engrane");
  const iconosNav = { inventario: "sofa", compras: "bolsa", ventas: "etiqueta", resumen: "grafico" };
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.querySelector(".nav-icono").innerHTML = icono(iconosNav[btn.dataset.tab]);
  });
}

/* ====== Búsqueda ====== */
/* Quita tildes y pasa a minúsculas, para que "cafe" encuentre "Café" */
function limpiarTexto(txt) {
  return String(txt ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* Cada palabra escrita filtra un poco más, sin importar el orden */
function coincide(query, ...campos) {
  const q = limpiarTexto(query);
  if (!q) return true;
  const texto = campos.map(limpiarTexto).join(" ");
  return q.split(/\s+/).every(palabra => texto.includes(palabra));
}

/* Línea "Mostrando X de Y", solo cuando se está buscando */
function contadorHTML(mostrados, total, query) {
  if (!limpiarTexto(query)) return "";
  return `<div class="contador">Mostrando ${mostrados} de ${total}</div>`;
}

/* ====== Períodos ====== */
/* Devuelve "YYYY-MM" del mes actual desplazado por 'offset' meses */
function claveMes(offset) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function enPeriodo(fecha, periodo) {
  if (periodo === "todo") return true;
  if (!fecha) return false;
  if (periodo === "mes") return fecha.startsWith(claveMes(0));
  if (periodo === "mes-pasado") return fecha.startsWith(claveMes(-1));
  if (periodo === "anio") return fecha.startsWith(String(new Date().getFullYear()));
  return true;
}

const nombresPeriodo = {
  "mes": "este mes",
  "mes-pasado": "el mes pasado",
  "anio": "este año",
  "todo": "todo el tiempo"
};

/* ====== Navegación entre tabs ====== */
const titulosTab = {
  inventario: "Inventario",
  compras: "Compras",
  ventas: "Ventas",
  resumen: "Resumen"
};

function cambiarTab(nombre) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("activa"));
  document.getElementById("tab-" + nombre).classList.add("activa");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("activa"));
  document.querySelector(`.nav-btn[data-tab="${nombre}"]`).classList.add("activa");
  document.getElementById("titulo-tab").textContent = titulosTab[nombre];
  document.querySelector(".header-fondo").dataset.tab = nombre;
  if (nombre === "resumen") renderResumen();
}
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => cambiarTab(btn.dataset.tab));
});

/* Refresca todas las vistas de una */
function refrescar() {
  renderInventario();
  renderCompras();
  renderVentas();
  renderResumen();
}

/* ====== Modal de Ajustes ====== */
function abrirAjustes() {
  cargarFormSaldo();
  document.getElementById("modal-ajustes").classList.remove("oculto");
}
function cerrarAjustes() {
  document.getElementById("modal-ajustes").classList.add("oculto");
  resetFormMueble();
}
document.getElementById("btn-ajustes").addEventListener("click", abrirAjustes);
document.getElementById("btn-cerrar-ajustes").addEventListener("click", cerrarAjustes);
document.getElementById("modal-ajustes").addEventListener("click", (e) => {
  if (e.target.id === "modal-ajustes") cerrarAjustes();
});

/* ====== Inventario ====== */
let muebleEditandoId = null;

function renderInventario() {
  const todos = db.leer(CLAVES.inventario);
  const cont = document.getElementById("lista-inventario");
  const query = document.getElementById("q-inventario").value;

  document.getElementById("buscador-inventario")
    .classList.toggle("oculto", todos.length === 0);

  if (todos.length === 0) {
    cont.innerHTML = `<div class="vacio">Todavía no hay muebles. Abrí ⚙ Ajustes para cargar los que ya tenés, o registrá una compra.</div>`;
    return;
  }

  const lista = todos.filter(m => coincide(query, m.modelo, m.material, m.color));

  if (lista.length === 0) {
    cont.innerHTML = `<div class="vacio">Ningún mueble coincide con "${query}".</div>`;
    return;
  }

  cont.innerHTML = contadorHTML(lista.length, todos.length, query) + lista.map(m => `
    <div class="tarjeta">
      <div class="miniatura">${icono("sofa")}</div>
      <div class="tarjeta-info">
        <div class="tarjeta-titulo">${m.modelo}</div>
        <div class="tarjeta-sub">${subtitulo(m.material, m.color)}</div>
        <div class="tarjeta-precios">
          Compra: ${formatearColones(m.compra)} · Venta: ${formatearColones(m.venta)}
        </div>
      </div>
      <div class="tarjeta-derecha">
        <div class="cantidad-bloque">
          <span class="cantidad">${m.cantidad}</span>
          <span class="cantidad-label">En stock</span>
        </div>
        <div class="tarjeta-acciones">
          <button class="btn-editar" data-id="${m.id}">Editar</button>
          <button class="btn-borrar" data-id="${m.id}">Borrar</button>
        </div>
      </div>
    </div>
  `).join("");

  cont.querySelectorAll(".btn-borrar").forEach(btn => {
    btn.addEventListener("click", () => borrarMueble(btn.dataset.id));
  });
  cont.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => editarMueble(btn.dataset.id));
  });
}

function resetFormMueble() {
  const form = document.getElementById("form-mueble");
  form.reset();
  form.classList.add("oculto");
  muebleEditandoId = null;
  document.getElementById("titulo-form-mueble").textContent = "Cargar mueble";
}

function editarMueble(id) {
  const m = db.leer(CLAVES.inventario).find(x => x.id === id);
  if (!m) return;

  muebleEditandoId = id;
  document.getElementById("in-modelo").value = m.modelo;
  document.getElementById("in-material").value = m.material;
  document.getElementById("in-color").value = m.color;
  document.getElementById("in-cantidad").value = m.cantidad;
  document.getElementById("in-compra").value = m.compra ?? "";
  document.getElementById("in-venta").value = m.venta ?? "";
  document.getElementById("titulo-form-mueble").textContent = "Editar mueble";

  abrirAjustes();
  document.getElementById("form-mueble").classList.remove("oculto");
}

function guardarMueble(e) {
  e.preventDefault();

  const compraVal = document.getElementById("in-compra").value;
  const ventaVal = document.getElementById("in-venta").value;
  const datos = {
    modelo: document.getElementById("in-modelo").value.trim(),
    material: document.getElementById("in-material").value,
    color: document.getElementById("in-color").value.trim(),
    cantidad: Number(document.getElementById("in-cantidad").value),
    compra: compraVal !== "" ? Number(compraVal) : null,
    venta: ventaVal !== "" ? Number(ventaVal) : null
  };

  const lista = db.leer(CLAVES.inventario);
  if (muebleEditandoId) {
    const idx = lista.findIndex(m => m.id === muebleEditandoId);
    if (idx !== -1) lista[idx] = { id: muebleEditandoId, ...datos };
  } else {
    lista.push({ id: generarId(), ...datos });
  }

  db.guardar(CLAVES.inventario, lista);
  refrescar();
  cerrarAjustes();
}

function borrarMueble(id) {
  if (!confirm("¿Borrar este mueble?")) return;
  let lista = db.leer(CLAVES.inventario);
  lista = lista.filter(m => m.id !== id);
  db.guardar(CLAVES.inventario, lista);
  refrescar();
}

document.getElementById("btn-cargar-mueble").addEventListener("click", () => {
  const form = document.getElementById("form-mueble");
  if (form.classList.contains("oculto")) {
    resetFormMueble();
    form.classList.remove("oculto");
  } else {
    resetFormMueble();
  }
});
document.getElementById("btn-cancelar").addEventListener("click", resetFormMueble);
document.getElementById("form-mueble").addEventListener("submit", guardarMueble);

/* ====== Compras ====== */
let avisoCompraTO;
function mostrarAvisoCompra(msg) {
  const aviso = document.getElementById("aviso-compra");
  aviso.textContent = msg;
  aviso.classList.remove("oculto");
  clearTimeout(avisoCompraTO);
  avisoCompraTO = setTimeout(() => aviso.classList.add("oculto"), 4000);
}

function renderCompras() {
  const todas = db.leer(CLAVES.compras);
  const cont = document.getElementById("lista-compras");
  const query = document.getElementById("q-compras").value;

  document.getElementById("buscador-compras")
    .classList.toggle("oculto", todas.length === 0);

  if (todas.length === 0) {
    cont.innerHTML = `<div class="vacio">Todavía no hay compras registradas.</div>`;
    return;
  }

  const lista = [...todas].reverse()
    .filter(c => coincide(query, c.modelo, c.material, c.color));

  if (lista.length === 0) {
    cont.innerHTML = `<div class="vacio">Ninguna compra coincide con "${query}".</div>`;
    return;
  }

  cont.innerHTML = contadorHTML(lista.length, todas.length, query) + lista.map(c => `
    <div class="tarjeta">
      <div class="miniatura">${icono("sofa")}</div>
      <div class="tarjeta-info">
        <div class="tarjeta-titulo">${c.modelo}</div>
        <div class="tarjeta-sub">${subtitulo(c.material, c.color)}</div>
        <div class="tarjeta-precios">${formatearColones(c.precio)} c/u · ${formatearFecha(c.fecha)}</div>
      </div>
      <div class="tarjeta-derecha">
        <div class="cantidad-bloque">
          <span class="cantidad">${c.cantidad}</span>
          <span class="cantidad-label">Compradas</span>
        </div>
        <div class="tarjeta-acciones">
          <button class="btn-borrar" data-id="${c.id}">Borrar</button>
        </div>
      </div>
    </div>
  `).join("");

  cont.querySelectorAll(".btn-borrar").forEach(btn => {
    btn.addEventListener("click", () => borrarCompra(btn.dataset.id));
  });
}

function agregarCompra(e) {
  e.preventDefault();
  const ventaVal = document.getElementById("co-venta").value;

  const compra = {
    id: generarId(),
    modelo: document.getElementById("co-modelo").value.trim(),
    material: document.getElementById("co-material").value,
    color: document.getElementById("co-color").value.trim(),
    cantidad: Number(document.getElementById("co-cantidad").value),
    precio: Number(document.getElementById("co-precio").value),
    fecha: document.getElementById("co-fecha").value
  };
  const ventaCompra = ventaVal !== "" ? Number(ventaVal) : null;

  const compras = db.leer(CLAVES.compras);
  compras.push(compra);
  db.guardar(CLAVES.compras, compras);

  const inventario = db.leer(CLAVES.inventario);
  const existente = inventario.find(m => mismoMueble(m, compra));
  if (existente) {
    existente.cantidad += compra.cantidad;
    existente.compra = compra.precio;
    if (ventaCompra !== null) existente.venta = ventaCompra;
  } else {
    inventario.push({
      id: generarId(),
      modelo: compra.modelo,
      material: compra.material,
      color: compra.color,
      cantidad: compra.cantidad,
      compra: compra.precio,
      venta: ventaCompra
    });
  }
  db.guardar(CLAVES.inventario, inventario);

  const form = document.getElementById("form-compra");
  form.reset();
  document.getElementById("co-fecha").value = hoyLocal();
  form.classList.add("oculto");

  refrescar();
  mostrarAvisoCompra(existente
    ? `✓ Compra registrada. Se sumaron ${compra.cantidad} al inventario.`
    : `✓ Compra registrada. Se creó el mueble en el inventario.`);
}

function borrarCompra(id) {
  if (!confirm("¿Borrar esta compra? Se le va a restar la cantidad al inventario.")) return;
  const compras = db.leer(CLAVES.compras);
  const compra = compras.find(c => c.id === id);
  if (!compra) return;

  const inventario = db.leer(CLAVES.inventario);
  const existente = inventario.find(m => mismoMueble(m, compra));
  if (existente) {
    existente.cantidad = Math.max(0, existente.cantidad - compra.cantidad);
    db.guardar(CLAVES.inventario, inventario);
  }

  db.guardar(CLAVES.compras, compras.filter(c => c.id !== id));
  refrescar();
}

document.getElementById("btn-nueva-compra").addEventListener("click", () => {
  const form = document.getElementById("form-compra");
  if (form.classList.contains("oculto")) {
    document.getElementById("co-fecha").value = hoyLocal();
  }
  form.classList.toggle("oculto");
});
document.getElementById("btn-cancelar-compra").addEventListener("click", () => {
  const form = document.getElementById("form-compra");
  form.reset();
  form.classList.add("oculto");
});
document.getElementById("form-compra").addEventListener("submit", agregarCompra);

/* ====== Ventas ====== */
let avisoVentaTO;
function mostrarAvisoVenta(msg) {
  const aviso = document.getElementById("aviso-venta");
  aviso.textContent = msg;
  aviso.classList.remove("oculto");
  clearTimeout(avisoVentaTO);
  avisoVentaTO = setTimeout(() => aviso.classList.add("oculto"), 4000);
}

function poblarSelectVenta() {
  const inventario = db.leer(CLAVES.inventario);
  const select = document.getElementById("ve-item");
  const enStock = inventario.filter(m => m.cantidad > 0);

  const opciones = enStock.map(m =>
    `<option value="${m.id}">${m.modelo} — ${subtitulo(m.material, m.color)} (quedan ${m.cantidad})</option>`
  ).join("");

  select.innerHTML =
    `<option value="">Elegí qué se vendió...</option>` +
    opciones +
    `<option value="otro">Otro (venta libre)</option>`;
}

function alElegirItemVenta() {
  const val = document.getElementById("ve-item").value;
  const descripcion = document.getElementById("ve-descripcion");
  const hint = document.getElementById("ve-hint");
  const precio = document.getElementById("ve-precio");
  const cantidad = document.getElementById("ve-cantidad");

  if (val === "otro") {
    descripcion.classList.remove("oculto");
    descripcion.required = true;
    hint.classList.add("oculto");
    precio.value = "";
    cantidad.removeAttribute("max");
  } else if (val === "") {
    descripcion.classList.add("oculto");
    descripcion.required = false;
    hint.classList.add("oculto");
  } else {
    const m = db.leer(CLAVES.inventario).find(x => x.id === val);
    descripcion.classList.add("oculto");
    descripcion.required = false;
    if (m) {
      hint.textContent = `Quedan ${m.cantidad} en stock. Costo: ${formatearColones(m.compra)}. Precio de venta sugerido: ${formatearColones(m.venta)}.`;
      hint.classList.remove("oculto");
      precio.value = m.venta ?? "";
      cantidad.setAttribute("max", m.cantidad);
    }
  }
}
document.getElementById("ve-item").addEventListener("change", alElegirItemVenta);

function renderVentas() {
  const todas = db.leer(CLAVES.ventas);
  const cont = document.getElementById("lista-ventas");
  const query = document.getElementById("q-ventas").value;

  document.getElementById("buscador-ventas")
    .classList.toggle("oculto", todas.length === 0);

  if (todas.length === 0) {
    cont.innerHTML = `<div class="vacio">Todavía no hay ventas registradas.</div>`;
    return;
  }

  const lista = [...todas].reverse()
    .filter(v => coincide(query, v.modelo, v.material, v.color,
                          v.tipo === "libre" ? "venta libre" : ""));

  if (lista.length === 0) {
    cont.innerHTML = `<div class="vacio">Ninguna venta coincide con "${query}".</div>`;
    return;
  }

  cont.innerHTML = contadorHTML(lista.length, todas.length, query) + lista.map(v => {
    const sub = v.tipo === "libre" ? "Venta libre" : subtitulo(v.material, v.color);
    const extras = [];
    if (v.flete) extras.push(`Flete: ${formatearColones(v.flete)}`);
    if (v.diesel) extras.push(`Diesel: ${formatearColones(v.diesel)}`);
    const lineaExtra = extras.length ? `<div class="tarjeta-precios">${extras.join(" · ")}</div>` : "";

    const g = (v.precio || 0) * (v.cantidad || 0)
            - (v.costo || 0) * (v.cantidad || 0)
            - (v.flete || 0) - (v.diesel || 0);
    const claseG = g >= 0 ? "positivo" : "negativo";
    const textoG = (g < 0 ? "−" : "") + formatearColones(Math.abs(g));

    return `
      <div class="tarjeta">
        <div class="miniatura">${icono("sofa")}</div>
        <div class="tarjeta-info">
          <div class="tarjeta-titulo">${v.modelo}</div>
          <div class="tarjeta-sub">${sub}</div>
          <div class="tarjeta-precios">${formatearColones(v.precio)} c/u · ${formatearFecha(v.fecha)}</div>
          ${lineaExtra}
          <div class="tarjeta-precios">Ganancia: <strong class="${claseG}">${textoG}</strong></div>
        </div>
        <div class="tarjeta-derecha">
          <div class="cantidad-bloque">
            <span class="cantidad">${v.cantidad}</span>
            <span class="cantidad-label">Vendidas</span>
          </div>
          <div class="tarjeta-acciones">
            <button class="btn-borrar" data-id="${v.id}">Borrar</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  cont.querySelectorAll(".btn-borrar").forEach(btn => {
    btn.addEventListener("click", () => borrarVenta(btn.dataset.id));
  });
}

function agregarVenta(e) {
  e.preventDefault();

  const val = document.getElementById("ve-item").value;
  const cantidad = Number(document.getElementById("ve-cantidad").value);
  const precio = Number(document.getElementById("ve-precio").value);
  const fleteVal = document.getElementById("ve-flete").value;
  const dieselVal = document.getElementById("ve-diesel").value;

  let venta = {
    id: generarId(),
    cantidad,
    precio,
    flete: fleteVal !== "" ? Number(fleteVal) : null,
    diesel: dieselVal !== "" ? Number(dieselVal) : null,
    fecha: document.getElementById("ve-fecha").value
  };

  if (val === "otro") {
    venta.tipo = "libre";
    venta.modelo = document.getElementById("ve-descripcion").value.trim();
    venta.material = "";
    venta.color = "";
    venta.costo = 0;
  } else {
    const inventario = db.leer(CLAVES.inventario);
    const m = inventario.find(x => x.id === val);
    if (!m) { alert("Ese mueble ya no está en el inventario."); return; }
    if (cantidad > m.cantidad) {
      alert(`Solo quedan ${m.cantidad} en stock. No podés vender ${cantidad}.`);
      return;
    }
    venta.tipo = "mueble";
    venta.modelo = m.modelo;
    venta.material = m.material;
    venta.color = m.color;
    venta.costo = m.compra ?? 0;   // ← foto del costo al momento de vender

    m.cantidad -= cantidad;
    db.guardar(CLAVES.inventario, inventario);
  }

  const ventas = db.leer(CLAVES.ventas);
  ventas.push(venta);
  db.guardar(CLAVES.ventas, ventas);

  const form = document.getElementById("form-venta");
  form.reset();
  document.getElementById("ve-cantidad").value = 1;
  document.getElementById("ve-descripcion").classList.add("oculto");
  document.getElementById("ve-hint").classList.add("oculto");
  document.getElementById("ve-fecha").value = hoyLocal();
  form.classList.add("oculto");

  refrescar();
  mostrarAvisoVenta(venta.tipo === "mueble"
    ? `✓ Venta registrada. Se restaron ${cantidad} del inventario.`
    : `✓ Venta libre registrada.`);
}

function borrarVenta(id) {
  const ventas = db.leer(CLAVES.ventas);
  const venta = ventas.find(v => v.id === id);
  if (!venta) return;

  const msg = venta.tipo === "mueble"
    ? "¿Borrar esta venta? Se le va a devolver la cantidad al inventario."
    : "¿Borrar esta venta libre?";
  if (!confirm(msg)) return;

  if (venta.tipo === "mueble") {
    const inventario = db.leer(CLAVES.inventario);
    const existente = inventario.find(m => mismoMueble(m, venta));
    if (existente) {
      existente.cantidad += venta.cantidad;
      db.guardar(CLAVES.inventario, inventario);
    }
  }

  db.guardar(CLAVES.ventas, ventas.filter(v => v.id !== id));
  refrescar();
}

document.getElementById("btn-nueva-venta").addEventListener("click", () => {
  const form = document.getElementById("form-venta");
  if (form.classList.contains("oculto")) {
    poblarSelectVenta();
    document.getElementById("ve-fecha").value = hoyLocal();
    document.getElementById("ve-cantidad").value = 1;
  }
  form.classList.toggle("oculto");
});
document.getElementById("btn-cancelar-venta").addEventListener("click", () => {
  const form = document.getElementById("form-venta");
  form.reset();
  document.getElementById("ve-descripcion").classList.add("oculto");
  document.getElementById("ve-hint").classList.add("oculto");
  form.classList.add("oculto");
});
document.getElementById("form-venta").addEventListener("submit", agregarVenta);

/* ====== Saldo del banco ====== */
function cargarFormSaldo() {
  const s = db.leerObjeto(CLAVES.saldo, SALDO_DEFAULT);
  document.getElementById("sa-monto").value = s.monto;
  document.getElementById("sa-fecha").value =
    s.fecha === SALDO_DEFAULT.fecha ? hoyLocal() : s.fecha;
}

document.getElementById("form-saldo").addEventListener("submit", (e) => {
  e.preventDefault();
  const cfg = {
    monto: Number(document.getElementById("sa-monto").value),
    fecha: document.getElementById("sa-fecha").value
  };
  db.guardar(CLAVES.saldo, cfg);
  refrescar();
  alert("✓ Saldo guardado.");
});

function calcularSaldo() {
  const cfg = db.leerObjeto(CLAVES.saldo, SALDO_DEFAULT);
  let movimientos = 0;

  db.leer(CLAVES.ventas).forEach(v => {
    if (v.fecha && v.fecha >= cfg.fecha) {
      movimientos += (v.precio || 0) * (v.cantidad || 0) - (v.flete || 0) - (v.diesel || 0);
    }
  });
  db.leer(CLAVES.compras).forEach(c => {
    if (c.fecha && c.fecha >= cfg.fecha) {
      movimientos -= (c.precio || 0) * (c.cantidad || 0);
    }
  });

  return { ...cfg, movimientos, saldo: cfg.monto + movimientos };
}

/* ====== Resumen ====== */
function calcularResumen(periodo) {
  const compras = db.leer(CLAVES.compras).filter(c => enPeriodo(c.fecha, periodo));
  const ventas = db.leer(CLAVES.ventas).filter(v => enPeriodo(v.fecha, periodo));

  let totalVentas = 0, costoVendido = 0, fletes = 0, diesel = 0, unidadesVendidas = 0;
  ventas.forEach(v => {
    const cant = v.cantidad || 0;
    totalVentas += (v.precio || 0) * cant;
    costoVendido += (v.costo || 0) * cant;
    fletes += v.flete || 0;
    diesel += v.diesel || 0;
    unidadesVendidas += cant;
  });

  let totalCompras = 0, unidadesCompradas = 0;
  compras.forEach(c => {
    totalCompras += (c.precio || 0) * (c.cantidad || 0);
    unidadesCompradas += c.cantidad || 0;
  });

  return {
    totalVentas, costoVendido, fletes, diesel,
    ganancia: totalVentas - costoVendido - fletes - diesel,
    totalCompras,
    flujo: totalVentas - totalCompras - fletes - diesel,
    unidadesVendidas, unidadesCompradas,
    hayMovimientos: ventas.length > 0 || compras.length > 0
  };
}

function calcularBodega() {
  const inv = db.leer(CLAVES.inventario);
  let unidades = 0, valorCompra = 0, valorVenta = 0;
  let compraComparable = 0, ventaComparable = 0;
  const incompletos = [];

  inv.forEach(m => {
    const c = m.cantidad || 0;
    unidades += c;
    if (m.compra != null) valorCompra += m.compra * c;
    if (m.venta != null) valorVenta += m.venta * c;

    if (c > 0) {
      if (m.compra != null && m.venta != null) {
        // Solo estos entran en la ganancia potencial, para comparar parejo
        compraComparable += m.compra * c;
        ventaComparable += m.venta * c;
      } else {
        incompletos.push(`${m.modelo} (${m.material} · ${m.color})`);
      }
    }
  });

  return {
    unidades,
    valorCompra,
    valorVenta,
    potencial: ventaComparable - compraComparable,
    incompletos
  };
}

function fila(etiqueta, monto, negativo = false, nombreIcono = "") {
  const texto = (negativo ? "−" : "") + formatearColones(Math.abs(monto));
  const ic = nombreIcono ? `<span class="fila-icono">${icono(nombreIcono)}</span>` : "";
  const clase = negativo ? "negativo" : "";
  return `<div class="fila">${ic}<span class="fila-etiqueta">${etiqueta}</span><span class="val ${clase}">${texto}</span></div>`;
}
function filaTotal(etiqueta, monto) {
  const clase = monto >= 0 ? "positivo" : "negativo";
  const texto = (monto < 0 ? "−" : "") + formatearColones(Math.abs(monto));
  return `<div class="fila total"><span class="fila-etiqueta">${etiqueta}</span><span class="val ${clase}">${texto}</span></div>`;
}

function renderResumen() {
  const cont = document.getElementById("contenido-resumen");
  if (!cont) return;

  const periodo = document.getElementById("re-periodo").value;
  const r = calcularResumen(periodo);
  const b = calcularBodega();
  const s = calcularSaldo();

  const nombreP = nombresPeriodo[periodo];

  const saldoTexto = (s.saldo < 0 ? "−" : "") + formatearColones(Math.abs(s.saldo));
  const movTexto = (s.movimientos < 0 ? "−" : "+") + formatearColones(Math.abs(s.movimientos));

cont.innerHTML = `
    <div class="panel panel-saldo">
      <div class="panel-titulo">Saldo estimado del banco</div>
      <div class="saldo-monto">${saldoTexto}</div>
      <div class="saldo-nota">
        Base: ${formatearColones(s.monto)} al ${formatearFecha(s.fecha)} · Movimientos: ${movTexto}
      </div>
    </div>

    <div class="panel">
      <div class="panel-titulo">Ganancia — ${nombreP}</div>
      ${fila("Ventas", r.totalVentas, false, "carrito")}
      ${fila("Costo de lo vendido", r.costoVendido, true, "caja")}
      ${fila("Fletes", r.fletes, true, "camion")}
      ${fila("Diesel", r.diesel, true, "diesel")}
      ${filaTotal("GANANCIA", r.ganancia)}
    </div>

    <div class="panel">
      <div class="panel-titulo">Flujo de caja — ${nombreP}</div>
      ${fila("Ventas", r.totalVentas, false, "carrito")}
      ${fila("Compras", r.totalCompras, true, "bolsa")}
      ${fila("Fletes y diesel", r.fletes + r.diesel, true, "camion")}
      ${filaTotal("ENTRÓ / SALIÓ", r.flujo)}
      <div class="nota" style="margin:12px 0 0">
        Un flujo negativo no es pérdida: puede ser plata que se convirtió en muebles.
      </div>
    </div>

    <div class="panel">
      <div class="panel-titulo">Movimiento — ${nombreP}</div>
      <div class="fila"><span class="fila-icono">${icono("etiqueta")}</span><span class="fila-etiqueta">Unidades vendidas</span><span class="val">${r.unidadesVendidas}</span></div>
      <div class="fila"><span class="fila-icono">${icono("bolsa")}</span><span class="fila-etiqueta">Unidades compradas</span><span class="val">${r.unidadesCompradas}</span></div>
    </div>

    <div class="panel">
      <div class="panel-titulo">Valor de la bodega (hoy)</div>
      <div class="fila"><span class="fila-icono">${icono("sofa")}</span><span class="fila-etiqueta">Unidades en stock</span><span class="val">${b.unidades}</span></div>
      ${fila("Invertido (a precio de compra)", b.valorCompra, false, "caja")}
      ${fila("Si se vendiera todo", b.valorVenta, false, "banco")}
      ${filaTotal(
        b.incompletos.length > 0 ? "GANANCIA POTENCIAL (parcial)" : "GANANCIA POTENCIAL",
        b.potencial
      )}
      ${b.incompletos.length > 0
        ? `<div class="nota" style="margin:12px 0 0">
             Estos no entran en la ganancia potencial porque les falta el precio de compra o el de venta:
             <strong>${b.incompletos.join(", ")}</strong>. Ponéselos con "Editar" en Inventario.
           </div>`
        : ""}
    </div>

    ${!r.hayMovimientos ? `<div class="vacio">No hubo compras ni ventas en ${nombreP}.</div>` : ""}
  `;
}

document.getElementById("re-periodo").addEventListener("change", renderResumen);

/* ====== Respaldo: Exportar / Importar CSV ====== */
function escaparCSV(valor) {
  if (valor === null || valor === undefined) return "";
  const s = String(valor);
  if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function filaCSV(campos) {
  return campos.map(escaparCSV).join(",");
}

function generarRespaldoCSV() {
  const inventario = db.leer(CLAVES.inventario);
  const compras = db.leer(CLAVES.compras);
  const ventas = db.leer(CLAVES.ventas);
  const saldo = db.leerObjeto(CLAVES.saldo, SALDO_DEFAULT);

  const filas = ["Lista,Modelo,Material,Color,Cantidad,Compra,Venta,Precio,Flete,Diesel,TipoVenta,Fecha"];

  inventario.forEach(m => {
    filas.push(filaCSV(["Inventario", m.modelo, m.material, m.color, m.cantidad, m.compra, m.venta, "", "", "", "", ""]));
  });
  compras.forEach(c => {
    filas.push(filaCSV(["Compra", c.modelo, c.material, c.color, c.cantidad, "", "", c.precio, "", "", "", c.fecha]));
  });
  ventas.forEach(v => {
    // En las ventas, la columna "Compra" guarda el costo del mueble al momento de venderlo
    filas.push(filaCSV(["Venta", v.modelo, v.material, v.color, v.cantidad, v.costo, "", v.precio, v.flete, v.diesel, v.tipo, v.fecha]));
  });
  filas.push(filaCSV(["Saldo", "", "", "", "", "", "", saldo.monto, "", "", "", saldo.fecha]));

  return "\uFEFF" + filas.join("\r\n");
}

async function exportarRespaldo() {
  const csv = generarRespaldoCSV();
  const nombre = `muebleria_respaldo_${hoyLocal()}.csv`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  if (navigator.canShare) {
    const archivo = new File([blob], nombre, { type: "text/csv" });
    if (navigator.canShare({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: "Respaldo Mueblería" });
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }
  }

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}

function parsearCSV(texto) {
  if (texto.charCodeAt(0) === 0xFEFF) texto = texto.slice(1);

  const filas = [];
  let campo = "", fila = [], dentroComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (dentroComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') { campo += '"'; i++; }
        else dentroComillas = false;
      } else campo += c;
    } else {
      if (c === '"') dentroComillas = true;
      else if (c === ",") { fila.push(campo); campo = ""; }
      else if (c === "\n") { fila.push(campo); filas.push(fila); campo = ""; fila = []; }
      else if (c === "\r") { /* ignorar */ }
      else campo += c;
    }
  }
  if (campo !== "" || fila.length > 0) { fila.push(campo); filas.push(fila); }
  return filas;
}

function numONull(v) {
  if (v === undefined || v === null || String(v).trim() === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function importarRespaldo(texto) {
  const filas = parsearCSV(texto).filter(f => f.some(x => x.trim() !== ""));
  if (filas.length === 0) { alert("El archivo está vacío."); return; }

  const encabezado = filas[0].map(x => x.trim().toLowerCase());
  if (encabezado[0] !== "lista") {
    alert("Este no parece un archivo de respaldo válido de la app.");
    return;
  }

  const inventario = [], compras = [], ventas = [];
  let saldo = { ...SALDO_DEFAULT };

  for (let i = 1; i < filas.length; i++) {
    const f = filas[i];
    const lista = (f[0] || "").trim().toLowerCase();
    // 0 Lista,1 Modelo,2 Material,3 Color,4 Cantidad,5 Compra,6 Venta,7 Precio,8 Flete,9 Diesel,10 TipoVenta,11 Fecha

    if (lista === "inventario") {
      inventario.push({
        id: generarId(),
        modelo: (f[1] || "").trim(),
        material: (f[2] || "").trim(),
        color: (f[3] || "").trim(),
        cantidad: numONull(f[4]) ?? 0,
        compra: numONull(f[5]),
        venta: numONull(f[6])
      });
    } else if (lista === "compra") {
      compras.push({
        id: generarId(),
        modelo: (f[1] || "").trim(),
        material: (f[2] || "").trim(),
        color: (f[3] || "").trim(),
        cantidad: numONull(f[4]) ?? 0,
        precio: numONull(f[7]) ?? 0,
        fecha: (f[11] || "").trim()
      });
    } else if (lista === "venta") {
      ventas.push({
        id: generarId(),
        tipo: ((f[10] || "").trim() || "mueble"),
        modelo: (f[1] || "").trim(),
        material: (f[2] || "").trim(),
        color: (f[3] || "").trim(),
        cantidad: numONull(f[4]) ?? 0,
        costo: numONull(f[5]) ?? 0,
        precio: numONull(f[7]) ?? 0,
        flete: numONull(f[8]),
        diesel: numONull(f[9]),
        fecha: (f[11] || "").trim()
      });
    } else if (lista === "saldo") {
      saldo = {
        monto: numONull(f[7]) ?? 0,
        fecha: (f[11] || "").trim() || SALDO_DEFAULT.fecha
      };
    }
  }

  db.guardar(CLAVES.inventario, inventario);
  db.guardar(CLAVES.compras, compras);
  db.guardar(CLAVES.ventas, ventas);
  db.guardar(CLAVES.saldo, saldo);

  refrescar();
}

document.getElementById("btn-exportar").addEventListener("click", exportarRespaldo);
document.getElementById("btn-importar").addEventListener("click", () => {
  document.getElementById("input-importar").click();
});
document.getElementById("input-importar").addEventListener("change", (e) => {
  const archivo = e.target.files[0];
  if (!archivo) return;

  if (!confirm("Importar va a REEMPLAZAR todos los datos actuales con los del archivo. ¿Seguro?")) {
    e.target.value = "";
    return;
  }

  const lector = new FileReader();
  lector.onload = (ev) => {
    try {
      importarRespaldo(ev.target.result);
      alert("✓ Datos importados correctamente.");
      cerrarAjustes();
    } catch (err) {
      alert("Hubo un error leyendo el archivo. Revisá que sea un respaldo válido.");
      console.error(err);
    }
    e.target.value = "";
  };
  lector.onerror = () => { alert("No se pudo leer el archivo."); e.target.value = ""; };
  lector.readAsText(archivo);
});

/* ====== Enganchar los buscadores ====== */
document.getElementById("q-inventario").addEventListener("input", renderInventario);
document.getElementById("q-compras").addEventListener("input", renderCompras);
document.getElementById("q-ventas").addEventListener("input", renderVentas);

/* ====== Borrar todos los datos ====== */
async function borrarTodo() {
  const inv = db.leer(CLAVES.inventario).length;
  const com = db.leer(CLAVES.compras).length;
  const ven = db.leer(CLAVES.ventas).length;

  if (inv + com + ven === 0) {
    alert("No hay datos que borrar.");
    return;
  }

  // 1) Mostrar exactamente qué se va a perder
  const resumen =
    `Vas a borrar TODO:\n\n` +
    `• ${inv} artículo(s) del inventario\n` +
    `• ${com} compra(s)\n` +
    `• ${ven} venta(s)\n` +
    `• El saldo del banco\n\n` +
    `Esto NO se puede deshacer.\n\n¿Continuar?`;
  if (!confirm(resumen)) return;

  // 2) Ofrecer respaldo antes
  if (confirm("¿Querés exportar un respaldo antes de borrar?")) {
    await exportarRespaldo();
    if (!confirm("¿Ya guardaste el respaldo? Si aceptás, seguimos con el borrado.")) return;
  }

  // 3) Confirmación escrita
  const escrito = prompt('Para confirmar, escribí BORRAR en mayúsculas:');
  if (escrito !== "BORRAR") {
    alert("Cancelado. No se borró nada.");
    return;
  }

  db.guardar(CLAVES.inventario, []);
  db.guardar(CLAVES.compras, []);
  db.guardar(CLAVES.ventas, []);
  db.guardar(CLAVES.saldo, SALDO_DEFAULT);

  // Limpiar también los buscadores, para no quedar filtrando sobre nada
  document.getElementById("q-inventario").value = "";
  document.getElementById("q-compras").value = "";
  document.getElementById("q-ventas").value = "";

  refrescar();
  cerrarAjustes();
  alert("✓ Listo. Todos los datos fueron borrados.");
}

document.getElementById("btn-borrar-todo").addEventListener("click", borrarTodo);

/* ====== Inicio ====== */
pintarIconosFijos();
refrescar();