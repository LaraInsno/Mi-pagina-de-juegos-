// Declaramos la variable del intervalo de forma global...
let cuentaRegresivaInterval;
let baseDatosEnlaces = null; // NUEVO: Guardará los enlaces en memoria
const URL_EXTERNA = "https://api.npoint.io/3a3a2701bdffa5352a3b"; // NUEVO: URL disponible para todo el código

// =========================================================================
// OPTIMIZACIÓN: carga diferida del anuncio de A-Ads (banner fijo inferior).
// El reporte de PageSpeed mostraba ~2.6 MB descargados desde a-ads.com
// (formato "Adaptive", que trae varios creativos candidatos). Ahora:
//   1. El iframe no se inyecta hasta después del evento "load" de la página,
//      para que no compita por ancho de banda con el contenido real (LCP/FCP).
//   2. Se usa un tamaño fijo (468x60) en vez de "Adaptive" para evitar que el
//      anuncio descargue múltiples variantes de tamaño.
// =========================================================================
let anuncioCargado = false;
let anuncioCerrado = false; // NUEVO: recuerda si el usuario cerró el anuncio con la flecha
function cargarAnuncioFijo() {
    if (anuncioCargado) return;
    anuncioCargado = true;
    const frame = document.getElementById("frame");
    if (!frame) return;
    const iframe = document.createElement("iframe");
    iframe.setAttribute("data-aa", "2455198");
    iframe.src = "https://acceptable.a-ads.com/2455198/?size=468x60";
    iframe.loading = "lazy";
    iframe.style.cssText = "border:0;padding:0;width:100%;height:65px;overflow:hidden;display:block;margin:auto;max-width:468px;";
    frame.appendChild(iframe);
}
if ("requestIdleCallback" in window) {
    window.addEventListener("load", () => requestIdleCallback(cargarAnuncioFijo, { timeout: 3000 }));
} else {
    window.addEventListener("load", () => setTimeout(cargarAnuncioFijo, 2000));
}

function irAlEnlace(identificador, imagen) {
    const modal = document.getElementById("modal-descarga");
    const imgElement = document.getElementById("modal-img");
    const tituloElement = document.getElementById("modal-titulo");
    const contenedorEnlace = document.getElementById("modal-enlace");
    const contenedorRequisitos = document.getElementById("modal-requisitos");
    const contenedorPubli = document.getElementById("modal-publicidad");
    
    modal.style.display = "flex";
    modal.scrollTop = 0;
    document.body.classList.add("modal-abierto");
    tituloElement.textContent = identificador;
    contenedorEnlace.innerHTML = '<span class="contador-texto">Preparando la descarga...</span>';
    contenedorRequisitos.style.display = "none";

    // Asegura que el anuncio fijo esté visible y lo carga si aún no lo hizo
    // (por ejemplo, si el usuario abre el modal antes del evento "load").
    // NUEVO: si el usuario ya cerró el anuncio con la flecha, no lo volvemos a mostrar.
    if (!anuncioCerrado) {
        if (contenedorPubli) contenedorPubli.style.display = "flex";
        cargarAnuncioFijo();
    }

    if (imagen) {
        imgElement.src = imagen;
        imgElement.style.display = "block";
    } else {
        imgElement.style.display = "none";
    }
    
    fetch("requisitos.json")
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((datos) => {
            if (datos && datos[identificador]) {
                contenedorRequisitos.innerHTML = "<h3>Requisitos Mínimos:</h3>" + datos[identificador];
                contenedorRequisitos.style.display = "block";
            }
        })
        .catch((err) => console.error("Sin requisitos adicionales."));
        
    let enlaceReal = null;
    let errorCarga = false;
    let segundosRestantes = 4;
if (baseDatosEnlaces) {
        // Si los enlaces ya cargaron en segundo plano, la respuesta es instantánea
        enlaceReal = baseDatosEnlaces[identificador] || null;
        if (!enlaceReal) errorCarga = true;
    } else {
        // Como respaldo, si el usuario hace clic muy rápido, lo descargamos ahora
        fetch(URL_EXTERNA)
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((datos) => {
                baseDatosEnlaces = datos; // Guardamos en memoria para la próxima
                enlaceReal = datos[identificador] || null;
                if (!enlaceReal) errorCarga = true;
            })
            .catch(() => {
                errorCarga = true;
            });
    }
        
    // Limpiamos cualquier intervalo previo antes de iniciar uno nuevo
    clearInterval(cuentaRegresivaInterval);
    
    cuentaRegresivaInterval = setInterval(() => {
        segundosRestantes--;
        if (segundosRestantes > 0) {
            contenedorEnlace.innerHTML = `<span class="contador-texto">Tu enlace estará listo en ${segundosRestantes} segundos...</span>`;
        } else {
            clearInterval(cuentaRegresivaInterval);
            mostrarBoton();
        }
    }, 1000);
    
    function mostrarBoton() {
        if (enlaceReal) {
            const urlLower = enlaceReal.toLowerCase();
            let btnStr = "Ir al sitio oficial",
                clase = "btn-obtener rojo";
            if (urlLower.includes("mediafire.com")) {
                btnStr = `Descargar en <img src="img/mediafire.webp" alt="MediaFire" class="icon-servidor">`;
                clase = "btn-obtener";
            } else if (urlLower.includes("drive.google.com") || urlLower.includes("docs.google.com")) {
                btnStr = `Descargar en <img src="img/google driver.webp" alt="Drive" class="icon-servidor">`;
                clase = "btn-obtener google";
            } else if (urlLower.includes("pixeldrain.com")) {
                btnStr = `Descargar en <img src="img/pixeldrain.webp" alt="Pixeldrain" class="icon-servidor">`;
                clase = "btn-obtener pixeldrain";
            }
            contenedorEnlace.innerHTML = `<a href="${enlaceReal}" class="${clase}" rel="nofollow noopener noreferrer" target="_blank">${btnStr}</a>`;
        } else if (errorCarga) {
            contenedorEnlace.innerHTML =
                '<span style="color:var(--red-main); font-weight:bold;">Error: El enlace no existe o no tienes intenet. Conectate a internet y actualiza la pagina.</span>';
        } else {
            // Si el contador llegó a 0 pero la API aún responde, informamos visualmente al usuario
            contenedorEnlace.innerHTML = '<span class="contador-texto">Cargando enlace...</span>';
            setTimeout(mostrarBoton, 200);
        }
    }
}

function cerrarModal() {
    document.getElementById("modal-descarga").style.display = "none"; 
    document.body.classList.remove("modal-abierto");
    clearInterval(cuentaRegresivaInterval);
    
    // Fuerza la actualización de los botones flotantes al cerrar el modal
    window.dispatchEvent(new Event("scroll"));
}

function configurarSeccionConPaginacion(
    inputId,
    btnId,
    gridId,
    noResultsId,
    itemsPorPagina = 30,
    nombreSeccion = "juegos"
) {
    const searchInput = document.getElementById(inputId);
    const btnBuscar = document.getElementById(btnId);
    const grid = document.getElementById(gridId);
    const noResults = document.getElementById(noResultsId);
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll(".card"));
    let paginaActual = 1;
    let terminoActual = "";
    const paginacionFlotante = document.createElement("div");
    paginacionFlotante.className = "paginacion-flotante";
    grid.parentNode.appendChild(paginacionFlotante);
    let sugerenciasBox = null;
    if (searchInput) {
        sugerenciasBox = document.createElement("div");
        sugerenciasBox.className = "sugerencias-box";
        searchInput.parentNode.appendChild(sugerenciasBox);
    }
    function renderizarPagina() {
        const tarjetasFiltradas = cards.filter((card) => {
            const name = (card.getAttribute("data-name") || "").toLowerCase();
            return terminoActual === "" || name.includes(terminoActual);
        });
        const totalTarjetas = tarjetasFiltradas.length;
        const totalPaginas = Math.ceil(totalTarjetas / itemsPorPagina) || 1;
        if (paginaActual > totalPaginas) paginaActual = totalPaginas;
        if (paginaActual < 1) paginaActual = 1;
        const inicio = (paginaActual - 1) * itemsPorPagina;
        const fin = inicio + itemsPorPagina;
        cards.forEach((card) => {
            const esDeBusqueda = tarjetasFiltradas.includes(card);
            const indexEnFiltradas = tarjetasFiltradas.indexOf(card);
            const enPaginaActual = indexEnFiltradas >= inicio && indexEnFiltradas < fin;
            if (esDeBusqueda && enPaginaActual) {
                card.classList.remove("oculto-busqueda", "oculto-pagina");
            } else {
                card.classList.add("oculto-pagina");
            }
        });
        if (noResults) {
            noResults.style.display = totalTarjetas === 0 ? "block" : "none";
        }
        renderizarControles(totalPaginas, totalTarjetas);
    }
    function renderizarControles(totalPaginas, totalTarjetas) {
        paginacionFlotante.innerHTML = "";
        if (totalPaginas <= 1 || totalTarjetas === 0) {
            paginacionFlotante.classList.remove("activa");
            return;
        }
        paginacionFlotante.classList.add("activa");
        const btnAnterior = document.createElement("button");
        btnAnterior.className = "btn-flotante-pag";
        btnAnterior.setAttribute("data-tooltip", "Ir atrás");
        btnAnterior.setAttribute("title", "Ir atrás");
        btnAnterior.setAttribute("aria-label", "Ir atrás");
        btnAnterior.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    `;
        const btnSiguiente = document.createElement("button");
        btnSiguiente.className = "btn-flotante-pag";
        btnSiguiente.setAttribute("data-tooltip", `Ver más ${nombreSeccion}`);
        btnSiguiente.setAttribute("title", `Ver más ${nombreSeccion}`);
        btnSiguiente.setAttribute("aria-label", `Ver más ${nombreSeccion}`);
        btnSiguiente.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    `;
        if (paginaActual <= 1) {
            btnAnterior.style.opacity = "0.3";
            btnAnterior.style.pointerEvents = "none";
        } else {
            btnAnterior.style.opacity = "1";
            btnAnterior.style.pointerEvents = "auto";
            btnAnterior.onclick = () => {
                paginaActual--;
                renderizarPagina();
                subirAlInicioGrid();
            };
        }
        paginacionFlotante.appendChild(btnAnterior);
        if (paginaActual >= totalPaginas) {
            btnSiguiente.style.opacity = "0.3";
            btnSiguiente.style.pointerEvents = "none";
        } else {
            btnSiguiente.style.opacity = "1";
            btnSiguiente.style.pointerEvents = "auto";
            btnSiguiente.onclick = () => {
                paginaActual++;
                renderizarPagina();
                subirAlInicioGrid();
            };
        }
        paginacionFlotante.appendChild(btnSiguiente);
    }
    function subirAlInicioGrid() {
        const rect = grid.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: scrollTop + rect.top - 80, behavior: "auto" });
    }
    function aplicarFiltro(termino) {
        terminoActual = termino.toLowerCase().trim();
        paginaActual = 1;
        renderizarPagina();
    }
    if (searchInput && sugerenciasBox) {
        let debounceTimeout;
        searchInput.addEventListener("input", () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const term = searchInput.value.toLowerCase().trim();
                sugerenciasBox.innerHTML = "";
                if (term === "") {
                    sugerenciasBox.style.display = "none";
                    aplicarFiltro("");
                    return;
                }
                let coincidenciasGuardadas = 0;
                const fragment = document.createDocumentFragment();
                cards.forEach((card) => {
                    const name = card.getAttribute("data-name") || "";
                    const nameLower = name.toLowerCase();
                    if (nameLower.includes(term) && coincidenciasGuardadas < 5) {
                        const divSugerencia = document.createElement("div");
                        divSugerencia.className = "sugerencia-item";
                        const regex = new RegExp(`(${term})`, "gi");
                        divSugerencia.innerHTML = name.replace(regex, "<strong style='color:#ef4444;'>$1</strong>");
                        divSugerencia.addEventListener("click", () => {
                            searchInput.value = name;
                            sugerenciasBox.style.display = "none";
                            aplicarFiltro(name);
                        });
                        fragment.appendChild(divSugerencia);
                        coincidenciasGuardadas++;
                    }
                });
                if (coincidenciasGuardadas > 0) {
                    sugerenciasBox.appendChild(fragment);
                    sugerenciasBox.style.display = "block";
                } else {
                    sugerenciasBox.style.display = "none";
                }
            }, 300);
        });
        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.keyCode === 13 || e.which === 13) {
                clearTimeout(debounceTimeout);
                sugerenciasBox.style.display = "none";
                aplicarFiltro(searchInput.value);
            }
        });
        if (btnBuscar) {
            btnBuscar.addEventListener("click", () => {
                clearTimeout(debounceTimeout);
                sugerenciasBox.style.display = "none";
                aplicarFiltro(searchInput.value);
            });
        }
        document.addEventListener("click", (e) => {
            if (e.target !== searchInput && e.target !== sugerenciasBox) {
                sugerenciasBox.style.display = "none";
            }
        });
    }
    renderizarPagina();
}

const btnSubir = document.getElementById("btnSubir");
let scrollRendering = false;
function subirArriba() {
    window.scrollTo(0, 0);
}
window.addEventListener(
    "scroll",
    () => {
        if (!scrollRendering) {
            window.requestAnimationFrame(() => {
                const scrolled = window.scrollY > 200;
                
                // Solo ocultamos o mostramos el botón de subir
                if (btnSubir) {
                    btnSubir.style.display = scrolled ? "flex" : "none";
                }
                
                // NOTA: Se ha eliminado la lógica que forzaba ocultar la paginación flotante aquí.
                // Ahora, el CSS (.activa) y el estado de la pestaña se encargarán de mantenerla visible.
                
                scrollRendering = false;
            });
            scrollRendering = true;
        }
    },
    { passive: true }
);

document.addEventListener("DOMContentLoaded", () => {
    configurarSeccionConPaginacion(
        "searchProgramas",
        "btnSearchProgramas",
        "programas-grid",
        "noResultsProgramas",
        28,
        "programas"
    );
    configurarSeccionConPaginacion("searchJuegos", "btnSearchJuegos", "juegos-grid", "noResultsJuegos", 28, "juegos");
    configurarSeccionConPaginacion(
        "searchWindows",
        "btnSearchWindows",
        "windows-grid",
        "noResultsWindows",
        28,
        "Windows"
    );
});

setTimeout(() => {
    // Pre-cargar requisitos
    fetch("requisitos.json")
        .then((res) => {
            if (res.ok) console.log("Archivo requisitos.json pre-cargado con éxito.");
        })
        .catch((err) => console.error("Error al pre-cargar requisitos.json:", err));

    // NUEVO: Pre-cargar los enlaces externos para evitar errores en datos móviles
    fetch(URL_EXTERNA)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((datos) => {
            baseDatosEnlaces = datos;
            console.log("Enlaces pre-cargados con éxito para conexiones móviles.");
        })
        .catch((err) => console.error("Error al pre-cargar enlaces:", err));
}, 1000); // Lo reducimos a 2 segundos para asegurar que estén listos mucho antes

document.addEventListener("DOMContentLoaded", () => {
    if (typeof emailjs !== "undefined") {
        emailjs.init("-KWe4DI0nHuj1pnXE");
    }
    const form = document.getElementById("contact-form");
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const status = document.getElementById("form-status");
            const btnSubmit = form.querySelector('button[type="submit"]');
            status.textContent = "Enviando mensaje...";
            status.style.color = "var(--text-muted)";
            btnSubmit.disabled = true;
            btnSubmit.style.opacity = "0.7";
            emailjs.sendForm("service_tezwr3b", "template_wnk66vc", this).then(
                () => {
                    status.textContent = "¡Mensaje enviado con éxito!";
                    status.style.color = "#0f9d58";
                    form.reset();
                    btnSubmit.disabled = false;
                    btnSubmit.style.opacity = "1";
                },
                (error) => {
                    status.textContent = "Hubo un error al enviar el mensaje.";
                    status.style.color = "var(--red-main)";
                    btnSubmit.disabled = false;
                    btnSubmit.style.opacity = "1";
                    console.error("Error EmailJS:", error);
                }
            );
        });
    }
});

function cerrarAnuncio() {
    // NUEVO: marcamos que el usuario cerró el anuncio para que no vuelva a aparecer
    // (ni la barra roja ni la barra negra) al abrir/cerrar el modal de descarga.
    anuncioCerrado = true;

    // 1. Ocultamos el anuncio fijo que sale en la base de la pantalla
    const anuncioFijo = document.querySelector(".contenedor-ads-fijo");
    if (anuncioFijo) {
        anuncioFijo.style.display = "none";
    }
    
    // 2. Ocultamos el anuncio que está dentro del modal (verificando primero que exista para evitar errores)
    const contenedorPubli = document.getElementById("modal-publicidad");
    if (contenedorPubli) {
        contenedorPubli.innerHTML = "";
        contenedorPubli.style.display = "none";
    }
}
