"use strict";

/*
 * TVLEGAL - LG webOS
 * Reproductor IPTV / HLS
 */

const CLIENTE_ID = "cliente050";

const URL_CLIENTES =
    "https://raw.githubusercontent.com/sanchezjoseraul770-hash/tvlegal-control/main/clientes.json";

const URL_LISTA =
    "https://raw.githubusercontent.com/sanchezjoseraul770-hash/Nombre-TVLEGAL-LG/main/LISTA-TV-LG.m3u8";

let canales = [];
let canalSeleccionado = "";
let indiceFoco = 0;

let volumen = 100;
let temporizadorVolumen = null;

const pantallaCarga =
    document.getElementById("pantallaCarga");

const pantallaSuspendida =
    document.getElementById("pantallaSuspendida");

const pantallaSinInternet =
    document.getElementById("pantallaSinInternet");

const pantallaInicio =
    document.getElementById("pantallaInicio");

const pantallaPlayer =
    document.getElementById("pantallaPlayer");

const videoPlayer =
    document.getElementById("videoPlayer");

const buscador =
    document.getElementById("buscador");

const canalesContainer =
    document.getElementById("canalesContainer");

const contadorCanales =
    document.getElementById("contadorCanales");


/* =========================================================
   PANTALLAS
   ========================================================= */

function mostrarSolo(elemento) {

    [
        pantallaCarga,
        pantallaSuspendida,
        pantallaSinInternet,
        pantallaInicio,
        pantallaPlayer
    ].forEach(p => {

        if (p) {
            p.classList.add("oculto");
        }

    });

    if (elemento) {
        elemento.classList.remove("oculto");
    }
}


/* =========================================================
   INTERNET
   ========================================================= */

async function descargarTexto(url) {

    const respuesta = await fetch(url, {
        method: "GET",
        cache: "no-store"
    });

    if (!respuesta.ok) {
        throw new Error(
            "HTTP " + respuesta.status
        );
    }

    return await respuesta.text();
}


/* =========================================================
   CLIENTE
   ========================================================= */

async function validarCliente() {

    const texto =
        await descargarTexto(URL_CLIENTES);

    const objeto =
        JSON.parse(texto);

    if (!objeto ||
        !Array.isArray(objeto.clientes)) {

        return false;
    }

    const cliente =
        objeto.clientes.find(
            item =>
                item.id === CLIENTE_ID
        );

    if (!cliente) {
        return false;
    }

    return cliente.activo === true;
}


/* =========================================================
   M3U
   ========================================================= */

function obtenerCanalesM3U(texto) {

    const resultado = [];

    let nombre = "";
    let logo = "";

    const lineas =
        texto.split(/\r?\n/);

    for (const lineaOriginal of lineas) {

        const linea =
            lineaOriginal.trim();

        if (!linea) {
            continue;
        }


        /*
         * Información del canal
         */
        if (
            linea
                .toUpperCase()
                .startsWith("#EXTINF")
        ) {

            nombre =
                linea
                    .substring(
                        linea.indexOf(",") + 1
                    )
                    .trim();


            /*
             * tvg-logo
             */
            const logoInicio =
                linea.indexOf(
                    'tvg-logo="'
                );

            if (logoInicio >= 0) {

                const inicio =
                    logoInicio +
                    'tvg-logo="'.length;

                logo =
                    linea
                        .substring(inicio)
                        .split('"')[0]
                        .trim();

            } else {

                logo = "";
            }

            continue;
        }


        /*
         * URL del canal
         */
        if (
            linea
                .toLowerCase()
                .startsWith("http://") ||

            linea
                .toLowerCase()
                .startsWith("https://")
        ) {

            resultado.push({

                nombre:
                    nombre ||
                    `Canal ${resultado.length + 1}`,

                url: linea,

                logo: logo
            });

            nombre = "";
            logo = "";
        }
    }

    return resultado;
}


/* =========================================================
   CARGAR CANALES
   ========================================================= */

async function cargarCanales() {

    const inicioCargando =
        document.getElementById(
            "inicioCargando"
        );

    const inicioError =
        document.getElementById(
            "inicioError"
        );

    const btnEntrar =
        document.getElementById(
            "btnEntrar"
        );


    if (inicioCargando) {
        inicioCargando.classList.remove(
            "oculto"
        );
    }

    if (inicioError) {
        inicioError.classList.add(
            "oculto"
        );
    }

    if (btnEntrar) {
        btnEntrar.classList.add(
            "oculto"
        );
    }


    try {

        const texto =
            await descargarTexto(URL_LISTA);

        canales =
            obtenerCanalesM3U(texto);


        if (!canales.length) {
            throw new Error(
                "Lista M3U vacía"
            );
        }


        if (inicioCargando) {
            inicioCargando.classList.add(
                "oculto"
            );
        }

        if (btnEntrar) {
            btnEntrar.classList.remove(
                "oculto"
            );
        }

    } catch (error) {

        console.error(
            "Error cargando M3U:",
            error
        );

        if (inicioCargando) {
            inicioCargando.classList.add(
                "oculto"
            );
        }

        if (inicioError) {
            inicioError.classList.remove(
                "oculto"
            );
        }

        const textoError =
            document.getElementById(
                "textoError"
            );

        if (textoError) {

            textoError.textContent =
                "No fue posible cargar la lista de canales.";
        }
    }
}


/* =========================================================
   LOGOS LOCALES
   ========================================================= */

function obtenerLogoLocal(nombre) {

    const logos = {

        "ESPN HD": "img_11.png",
        "ESPN PREMIUM": "img_12.png",
        "ESPN 2": "img_13.png",
        "ESPN 3": "img_14.png",
        "ESPN 4": "img_15.png",
        "ESPN 5": "img_16.png",
        "ESPN 6": "img_17.png",
        "ESPN 7": "img_18.png",

        "TNT HD": "img_19.png",
        "TNT SERIE": "img_20.png",
        "TNT NOVELAS": "img_21.png",
        "TNT SPORT": "img_22.png",
        "TNT SPORT PREMIUM": "img_23.png",

        "SONY CHANNEL": "img_24.png",

        "SPACE HD": "img_25.png",
        "SPACE SD": "img_25.png",

        "TLNOVELAS": "img_26.png",

        "SONY ONE NOVELAS": "img_27.png",

        "STUDIO UNIVERSAL HD": "img_28.png",

        "HBO FAMILY HD": "img_4.png",
        "HBO2 HD": "img_5.png",
        "HBO HD": "img_6.png",
        "HBO MAS": "img_7.png",
        "HBO XTREME HD": "img_8.png",

        "HBO MUNDI SD INGLES":
            "img_9.png",

        "HBO MUNDI SD ESPANOL":
            "img_10.png",

        "HBO SIGNATURE SD":
            "img_30.png",

        "HBO PLUS HD":
            "img_31.png",

        "HBO POP HD":
            "img_32.png",

        "WARNER CHANNEL HD":
            "img_33.png",

        "CINECANAL HD":
            "img_34.png",

        "MULTIPREMIER SD":
            "img_35.png",

        "STAR CHANNEL SD":
            "img_36.png",

        "FX SD":
            "img_37.png",

        "AXN HD":
            "img_38.png",

        "WN SPORT HD":
            "img_39.png",

        "WN SPORT+ HD":
            "img_40.png"
    };


    const original =
        String(nombre || "")
            .trim()
            .toUpperCase();


    if (logos[original]) {
        return logos[original];
    }


    /*
     * Quitar [OPC.1], [OPC.2], etc.
     */
    const limpio =
        original
            .replace(
                /\s*\[OPC\.\d+\]/gi,
                ""
            )
            .trim();


    if (logos[limpio]) {
        return logos[limpio];
    }


    /*
     * Buscar coincidencias parciales.
     */
    const clave =
        Object.keys(logos).find(
            key =>
                limpio.includes(key) ||
                key.includes(limpio)
        );


    return clave
        ? logos[clave]
        : null;
}


/* =========================================================
   FILTRO DE CANALES
   ========================================================= */

function filtrarCanales() {

    if (!buscador ||
        !canalesContainer) {

        return;
    }


    const texto =
        buscador.value
            .trim()
            .toUpperCase();


    const filtrados =
        canales.filter(
            canal =>
                canal.nombre
                    .toUpperCase()
                    .includes(texto)
        );


    if (contadorCanales) {

        contadorCanales.textContent =
            `${filtrados.length} canal(es)`;
    }


    canalesContainer.innerHTML = "";


    filtrados.forEach(
        (canal, indice) => {

            const tarjeta =
                document.createElement(
                    "button"
                );


            tarjeta.className =
                "canal-card";

            tarjeta.type =
                "button";

            tarjeta.tabIndex = 0;


            /*
             * Canal actualmente seleccionado
             */
            if (
                canal.url ===
                canalSeleccionado
            ) {

                tarjeta.classList.add(
                    "seleccionado"
                );
            }


            /*
             * Logo
             */
            const logo =
                obtenerLogoLocal(
                    canal.nombre
                );


            const contenedorLogo =
                document.createElement(
                    "div"
                );

            contenedorLogo.className =
                "logo-canal";


            if (logo) {

                const imagen =
                    document.createElement(
                        "img"
                    );

                imagen.src =
                    logo;

                imagen.alt =
                    canal.nombre;

                imagen.loading =
                    "eager";

                contenedorLogo.appendChild(
                    imagen
                );

            } else if (canal.logo) {

                const imagen =
                    document.createElement(
                        "img"
                    );

                imagen.src =
                    canal.logo;

                imagen.alt =
                    canal.nombre;

                imagen.loading =
                    "eager";

                contenedorLogo.appendChild(
                    imagen
                );

            } else {

                contenedorLogo.textContent =
                    canal.nombre;
            }


            /*
             * Nombre
             */
            const nombre =
                document.createElement(
                    "div"
                );

            nombre.className =
                "nombre-canal";

            nombre.textContent =
                canal.nombre;


            tarjeta.appendChild(
                contenedorLogo
            );

            tarjeta.appendChild(
                nombre
            );


            /*
             * Click
             */
            tarjeta.addEventListener(
                "click",
                () => {

                    seleccionarCanal(
                        canal
                    );
                }
            );


            /*
             * Focus
             */
            tarjeta.addEventListener(
                "focus",
                () => {

                    indiceFoco =
                        indice;
                }
            );


            canalesContainer.appendChild(
                tarjeta
            );
        }
    );
}


/* =========================================================
   REPRODUCTOR
   ========================================================= */

function limpiarReproductor() {

    try {

        videoPlayer.pause();

    } catch (error) {
        console.warn(error);
    }


    videoPlayer.removeAttribute(
        "src"
    );

    videoPlayer.load();
}


/* =========================================================
   SELECCIONAR CANAL
   ========================================================= */

function seleccionarCanal(canal) {

    if (!canal ||
        !canal.url) {

        return;
    }


    canalSeleccionado =
        canal.url;


    limpiarReproductor();


    /*
     * Asignamos directamente la URL.
     *
     * webOS utiliza el reproductor HTML5
     * para streams compatibles como HLS.
     */
    videoPlayer.src =
        canal.url;


    /*
     * Volumen
     */
    videoPlayer.volume =
        Math.min(
            volumen,
            100
        ) / 100;


    /*
     * Intentar reproducir.
     */
    const promesa =
        videoPlayer.play();


    if (promesa &&
        typeof promesa.catch === "function") {

        promesa.catch(
            error => {

                console.warn(
                    "No se pudo iniciar reproducción:",
                    error
                );
            }
        );
    }


    cerrarLista();

    actualizarTarjetas();
}


/* =========================================================
   ACTUALIZAR TARJETAS
   ========================================================= */

function actualizarTarjetas() {

    document
        .querySelectorAll(
            ".canal-card"
        )
        .forEach(
            tarjeta => {

                tarjeta.classList.remove(
                    "seleccionado"
                );


                const nombre =
                    tarjeta
                        .querySelector(
                            ".nombre-canal"
                        )
                        ?.textContent;


                const canal =
                    canales.find(
                        c =>
                            c.nombre ===
                            nombre
                    );


                if (
                    canal &&
                    canal.url ===
                    canalSeleccionado
                ) {

                    tarjeta.classList.add(
                        "seleccionado"
                    );
                }
            }
        );
}


/* =========================================================
   LISTA
   ========================================================= */

function abrirLista() {

    const lista =
        document.getElementById(
            "listaCanales"
        );


    if (!lista) {
        return;
    }


    lista.classList.remove(
        "oculto"
    );


    filtrarCanales();


    setTimeout(
        () => {

            if (buscador) {
                buscador.focus();
            }

        },
        100
    );
}


function cerrarLista() {

    const lista =
        document.getElementById(
            "listaCanales"
        );


    if (lista) {

        lista.classList.add(
            "oculto"
        );
    }


    if (buscador) {
        buscador.value = "";
    }
}


/* =========================================================
   VOLUMEN
   ========================================================= */

function mostrarVolumen() {

    const panel =
        document.getElementById(
            "panelVolumen"
        );


    if (!panel) {
        return;
    }


    panel.classList.remove(
        "oculto"
    );


    actualizarVolumen();


    clearTimeout(
        temporizadorVolumen
    );


    temporizadorVolumen =
        setTimeout(
            () => {

                panel.classList.add(
                    "oculto"
                );

            },
            3000
        );
}


function actualizarVolumen() {

    if (!videoPlayer) {
        return;
    }


    const porcentaje =
        Math.max(
            0,
            Math.min(
                volumen,
                100
            )
        );


    videoPlayer.volume =
        porcentaje / 100;


    const nivelVolumen =
        document.getElementById(
            "nivelVolumen"
        );


    if (nivelVolumen) {

        nivelVolumen.style.height =
            porcentaje + "%";
    }


    const textoVolumen =
        document.getElementById(
            "textoVolumen"
        );


    if (textoVolumen) {

        textoVolumen.textContent =
            volumen + "%";
    }


    const iconoVolumen =
        document.getElementById(
            "iconoVolumen"
        );


    if (iconoVolumen) {

        iconoVolumen.textContent =
            volumen > 0
                ? "🔊"
                : "🔇";
    }
}


function cambiarVolumen(cantidad) {

    volumen =
        Math.max(
            0,
            Math.min(
                100,
                volumen + cantidad
            )
        );


    actualizarVolumen();

    mostrarVolumen();
}


/* =========================================================
   RELOJ
   ========================================================= */

function actualizarReloj() {

    const reloj =
        document.getElementById(
            "reloj"
        );


    if (!reloj) {
        return;
    }


    const ahora =
        new Date();


    reloj.textContent =
        ahora.toLocaleTimeString(
            [],
            {
                hour12: false
            }
        );
}


/* =========================================================
   ERRORES DE VIDEO
   ========================================================= */

videoPlayer.addEventListener(
    "error",
    () => {

        console.error(
            "Error del reproductor:",
            videoPlayer.error
        );
    }
);


videoPlayer.addEventListener(
    "loadedmetadata",
    () => {

        console.log(
            "Stream cargado:",
            canalSeleccionado
        );

        actualizarVolumen();
    }
);


videoPlayer.addEventListener(
    "playing",
    () => {

        console.log(
            "Reproduciendo:",
            canalSeleccionado
        );
    }
);


/* =========================================================
   INICIO
   ========================================================= */

async function iniciar() {

    mostrarSolo(
        pantallaCarga
    );


    try {

        const autorizado =
            await validarCliente();


        if (!autorizado) {

            mostrarSolo(
                pantallaSuspendida
            );

            return;
        }


        mostrarSolo(
            pantallaInicio
        );


        await cargarCanales();


    } catch (error) {

        console.error(
            "Error de conexión:",
            error
        );


        mostrarSolo(
            pantallaSinInternet
        );
    }
}


/* =========================================================
   BOTÓN ENTRAR
   ========================================================= */

const btnEntrar =
    document.getElementById(
        "btnEntrar"
    );


if (btnEntrar) {

    btnEntrar.addEventListener(
        "click",
        () => {

            if (!canales.length) {
                return;
            }


            seleccionarCanal(
                canales[0]
            );


            mostrarSolo(
                pantallaPlayer
            );
        }
    );
}


/* =========================================================
   MENÚ
   ========================================================= */

const btnMenu =
    document.getElementById(
        "btnMenu"
    );


if (btnMenu) {

    btnMenu.addEventListener(
        "click",
        () => {

            const lista =
                document.getElementById(
                    "listaCanales"
                );


            if (!lista) {
                return;
            }


            if (
                lista.classList.contains(
                    "oculto"
                )
            ) {

                abrirLista();

            } else {

                cerrarLista();
            }
        }
    );
}


/* =========================================================
   VOLUMEN -
   ========================================================= */

const btnVolumenMenos =
    document.getElementById(
        "btnVolumenMenos"
    );


if (btnVolumenMenos) {

    btnVolumenMenos.addEventListener(
        "click",
        () => {

            cambiarVolumen(-10);
        }
    );
}


/* =========================================================
   VOLUMEN +
   ========================================================= */

const btnVolumenMas =
    document.getElementById(
        "btnVolumenMas"
    );


if (btnVolumenMas) {

    btnVolumenMas.addEventListener(
        "click",
        () => {

            cambiarVolumen(10);
        }
    );
}


/* =========================================================
   REINTENTAR INTERNET
   ========================================================= */

const btnReintentar =
    document.getElementById(
        "btnReintentar"
    );


if (btnReintentar) {

    btnReintentar.addEventListener(
        "click",
        iniciar
    );
}


/* =========================================================
   REINTENTAR CANALES
   ========================================================= */

const btnReintentarCanales =
    document.getElementById(
        "btnReintentarCanales"
    );


if (btnReintentarCanales) {

    btnReintentarCanales.addEventListener(
        "click",
        cargarCanales
    );
}


/* =========================================================
   BUSCADOR
   ========================================================= */

if (buscador) {

    buscador.addEventListener(
        "input",
        filtrarCanales
    );
}


/* =========================================================
   CONTROL REMOTO
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const tecla =
            event.key;


        /*
         * Evitar comportamiento
         * predeterminado de navegador.
         */
        if (
            tecla === "ArrowUp" ||
            tecla === "ArrowDown" ||
            tecla === "ArrowLeft" ||
            tecla === "ArrowRight" ||
            tecla === "Enter"
        ) {

            event.preventDefault();
        }


        /*
         * BACK / ESC
         */
        if (
            tecla === "Escape" ||
            tecla === "Backspace"
        ) {

            const lista =
                document.getElementById(
                    "listaCanales"
                );


            if (
                lista &&
                !lista.classList.contains(
                    "oculto"
                )
            ) {

                cerrarLista();

                return;
            }


            /*
             * Si el menú está cerrado,
             * no hacemos nada.
             */
            return;
        }


        /*
         * IZQUIERDA = abrir menú
         */
        if (
            tecla === "ArrowLeft"
        ) {

            const lista =
                document.getElementById(
                    "listaCanales"
                );


            if (
                lista &&
                lista.classList.contains(
                    "oculto"
                )
            ) {

                abrirLista();
            }


            return;
        }


        /*
         * DERECHA = cerrar menú
         */
        if (
            tecla === "ArrowRight"
        ) {

            const lista =
                document.getElementById(
                    "listaCanales"
                );


            if (
                lista &&
                !lista.classList.contains(
                    "oculto"
                )
            ) {

                cerrarLista();
            }


            return;
        }


        /*
         * ABAJO
         */
        if (
            tecla === "ArrowDown"
        ) {

            const activo =
                document.activeElement;


            /*
             * Desde buscador:
             * pasar al primer canal.
             */
            if (
                activo === buscador
            ) {

                const primera =
                    canalesContainer
                        ?.querySelector(
                            ".canal-card"
                        );


                if (primera) {
                    primera.focus();
                }


                return;
            }


            /*
             * Dentro de canales:
             * siguiente canal.
             */
            if (
                activo &&
                activo.classList &&
                activo.classList.contains(
                    "canal-card"
                )
            ) {

                const tarjetas =
                    [
                        ...document.querySelectorAll(
                            ".canal-card"
                        )
                    ];


                const posicion =
                    tarjetas.indexOf(
                        activo
                    );


                if (
                    posicion >= 0 &&
                    posicion <
                        tarjetas.length - 1
                ) {

                    tarjetas[
                        posicion + 1
                    ].focus();
                }


                return;
            }
        }


        /*
         * ARRIBA
         */
        if (
            tecla === "ArrowUp"
        ) {

            const activo =
                document.activeElement;


            if (
                activo &&
                activo.classList &&
                activo.classList.contains(
                    "canal-card"
                )
            ) {

                const tarjetas =
                    [
                        ...document.querySelectorAll(
                            ".canal-card"
                        )
                    ];


                const posicion =
                    tarjetas.indexOf(
                        activo
                    );


                if (posicion > 0) {

                    tarjetas[
                        posicion - 1
                    ].focus();

                } else if (buscador) {

                    buscador.focus();
                }


                return;
            }
        }


        /*
         * ENTER
         */
        if (
            tecla === "Enter"
        ) {

            const activo =
                document.activeElement;


            if (
                activo &&
                activo.classList &&
                activo.classList.contains(
                    "canal-card"
                )
            ) {

                activo.click();
            }
        }
    }
);


/* =========================================================
   RELOJ
   ========================================================= */

setInterval(
    actualizarReloj,
    1000
);

actualizarReloj();


/* =========================================================
   VOLUMEN INICIAL
   ========================================================= */

actualizarVolumen();


/* =========================================================
   INICIAR TVLEGAL
   ========================================================= */

iniciar();
