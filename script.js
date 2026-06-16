// =========================
// VARIABLES GLOBALES
// =========================

let cursos = [];

let aprobados =
JSON.parse(
    localStorage.getItem(
        "aprobados"
    )
) || [];

let popupMostrado =
JSON.parse(
    localStorage.getItem(
        "popupInternadoMostrado"
    )
) || false;


// =========================
// ORDEN DE LOS SEMESTRES
// =========================

const ordenSemestres = [

    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    "FG",
    9,
    10

];


// =========================
// ELEMENTOS HTML
// =========================

const mallaContainer =
document.getElementById(
    "malla-container"
);

const tooltip =
document.getElementById(
    "tooltip"
);

const tooltipContent =
document.getElementById(
    "tooltip-content"
);

const internadoPopup =
document.getElementById(
    "internado-popup"
);

const semesterProgressContainer =
document.getElementById(
    "semester-progress-container"
);

const progressBar =
document.getElementById(
    "progress-bar"
);


// =========================
// CARGAR DATA.JSON
// =========================

fetch(
    "data.json"
)

.then(
    response => response.json()
)

.then(
    data => {

        cursos = data;

        iniciarMalla();

    }
)

.catch(
    error => {

        console.error(
            "Error cargando data.json:",
            error
        );

    }
);


// =========================
// INICIAR
// =========================

function iniciarMalla(){

    crearSemestres();

    crearTarjetas();

    actualizarEstados();

    actualizarProgreso();

    actualizarProgresoSemestres();

}// =========================
// CREAR SEMESTRES
// =========================

function crearSemestres() {

    mallaContainer.innerHTML = "";

    ordenSemestres.forEach(semestre => {

        const columna = document.createElement("div");

        columna.className = "semester";

        columna.id = `semestre-${semestre}`;

        columna.innerHTML = `

            <div class="semester-title">

                ${
                    semestre === "FG"
                    ? "Formación General"
                    : `${semestre}° Semestre`
                }

            </div>

        `;

        mallaContainer.appendChild(columna);

    });

}


// =========================
// CREAR TARJETAS
// =========================

function crearTarjetas() {

    cursos.forEach(curso => {

        const card = document.createElement("div");

        card.className = "course";

        card.dataset.codigo = curso.codigo;


        if (

            curso.prerequisitos.includes(
                "TODA_LA_CARRERA"
            )

        ) {

            card.classList.add(
                "internado"
            );

        }


        card.innerHTML = `

            <div class="course-name">

                ${curso.nombre}

            </div>

            <div class="course-code">

                ${curso.codigo}

            </div>

        `;


        document

            .getElementById(
                `semestre-${curso.semestre}`
            )

            .appendChild(
                card
            );
card.addEventListener(

    "click",

    () =>

    cambiarEstado(
        curso
    )

);

card.addEventListener(

    "mousemove",

    e =>

    mostrarTooltip(
        e,
        curso
    )

);

card.addEventListener(

    "mouseleave",

    ocultarTooltip

);
    });

}


// =========================
// BUSCAR CURSO
// =========================

function obtenerCurso(codigo) {

    return cursos.find(

        curso =>

        curso.codigo === codigo

    );

}


// =========================
// OBTENER DEPENDIENTES
// =========================

function obtenerDependientes(codigo) {

    return cursos.filter(

        curso =>

        curso.prerequisitos.includes(
            codigo
        )

    );

}


// =========================
// TODA LA CARRERA APROBADA
// =========================

function todaLaCarreraAprobada() {

    return cursos

    .filter(

        curso =>

        !curso.prerequisitos.includes(
            "TODA_LA_CARRERA"
        )

    )

    .every(

        curso =>

        aprobados.includes(
            curso.codigo
        )

    );

}// =========================
// CURSO DISPONIBLE
// =========================

function cursoDisponible(curso) {

    if (
        curso.prerequisitos.includes(
            "TODA_LA_CARRERA"
        )
    ) {

        return todaLaCarreraAprobada();

    }

    return curso.prerequisitos.every(

        codigo =>

        aprobados.includes(
            codigo
        )

    );

}


// =========================
// ACTUALIZAR ESTADOS
// =========================

function actualizarEstados() {

    document

    .querySelectorAll(".course")

    .forEach(card => {

        const codigo =

        card.dataset.codigo;


        const curso =

        obtenerCurso(
            codigo
        );


        card.classList.remove(

            "approved",
            "available",
            "locked"

        );


        if (

            aprobados.includes(
                codigo
            )

        ) {

            card.classList.add(
                "approved"
            );

        }

        else if (

            cursoDisponible(
                curso
            )

        ) {

            card.classList.add(
                "available"
            );

        }

        else {

            card.classList.add(
                "locked"
            );

        }

    });

}


// =========================
// TOOLTIP
// =========================

function mostrarTooltip(evento, curso) {

    if (
        curso.prerequisitos.length === 0
    ) {

        tooltip.classList.remove(
            "visible"
        );

        return;

    }

    tooltipContent.innerHTML = "";


    curso.prerequisitos.forEach(codigo => {

        const linea =

        document.createElement(
            "div"
        );


        if (
            codigo ===
            "TODA_LA_CARRERA"
        ) {

            linea.textContent =
                "🎓 Aprobar toda la carrera";

        }

        else {

            const prerreq =

            obtenerCurso(
                codigo
            );


            linea.textContent =

                (

                    aprobados.includes(
                        codigo
                    )

                    ? "✅ "

                    : "❌ "

                )

                +

                prerreq.nombre;

        }


        tooltipContent.appendChild(
            linea
        );

    });


    tooltip.style.left =

        `${evento.clientX + 15}px`;


    tooltip.style.top =

        `${evento.clientY + 15}px`;


    tooltip.classList.add(
        "visible"
    );

}


// =========================
// OCULTAR TOOLTIP
// =========================

function ocultarTooltip() {

    tooltip.classList.remove(
        "visible"
    );

}


// =========================
// APROBAR Y DESAPROBAR
// =========================

function cambiarEstado(curso) {

    if (

        aprobados.includes(
            curso.codigo
        )

    ) {

        desaprobarCurso(
            curso
        );

    }

    else if (

        cursoDisponible(
            curso
        )

    ) {

        aprobarCurso(
            curso
        );

    }

}


});// =========================
// APROBAR CURSO
// =========================

function aprobarCurso(curso) {

    aprobados.push(
        curso.codigo
    );

    guardarProgreso();

    actualizarEstados();

    actualizarProgreso();

    actualizarProgresoSemestres();

    verificarInternados();

}


// =========================
// DESAPROBAR CURSO
// =========================

function desaprobarCurso(curso) {

    const eliminar = [
        curso.codigo
    ];


    let pendientes = [
        curso.codigo
    ];


    while (
        pendientes.length > 0
    ) {

        const actual =

            pendientes.pop();


        obtenerDependientes(actual)

        .forEach(dep => {

            if (

                !eliminar.includes(
                    dep.codigo
                )

            ) {

                eliminar.push(
                    dep.codigo
                );

                pendientes.push(
                    dep.codigo
                );

            }

        });

    }


    aprobados =

    aprobados.filter(

        codigo =>

        !eliminar.includes(
            codigo
        )

    );


    guardarProgreso();

    actualizarEstados();

    actualizarProgreso();

    actualizarProgresoSemestres();

}


// =========================
// GUARDAR PROGRESO
// =========================

function guardarProgreso() {

    localStorage.setItem(

        "aprobados",

        JSON.stringify(
            aprobados
        )

    );

}


// =========================
// BARRA DE PROGRESO
// =========================

function actualizarProgreso() {

    const porcentaje =

        Math.round(

            aprobados.length

            /

            cursos.length

            *

            100

        );


    progressBar.style.width =

        `${porcentaje}%`;


    document

    .getElementById(
        "contador-ramos"
    )

    .textContent =

        `${aprobados.length} / ${cursos.length} ramos aprobados`;


    document

    .getElementById(
        "porcentaje-total"
    )

    .textContent =

        `${porcentaje}%`;


    actualizarEstadisticas();

}


// =========================
// ESTADÍSTICAS
// =========================

function actualizarEstadisticas() {

    let disponibles = 0;

    let bloqueados = 0;


    cursos.forEach(curso => {

        if (

            aprobados.includes(
                curso.codigo
            )

        ) {

            return;

        }


        if (

            cursoDisponible(
                curso
            )

        ) {

            disponibles++;

        }

        else {

            bloqueados++;

        }

    });


    document

    .getElementById(
        "aprobados"
    )

    .textContent =

        aprobados.length;


    document

    .getElementById(
        "disponibles"
    )

    .textContent =

        disponibles;


    document

    .getElementById(
        "bloqueados"
    )

    .textContent =

        bloqueados;

}


// =========================
// POPUP INTERNADOS
// =========================

function verificarInternados() {

    if (

        todaLaCarreraAprobada()

        &&

        !popupMostrado

    ) {

        internadoPopup.style.display =

            "block";


        popupMostrado = true;


        localStorage.setItem(

            "popupInternadoMostrado",

            true

        );


        setTimeout(

            () => {

                internadoPopup.style.display =

                    "none";

            },

            4000

        );

    }

}// =========================
// PROGRESO POR SEMESTRE
// =========================

function actualizarProgresoSemestres() {

    semesterProgressContainer.innerHTML = "";

    ordenSemestres.forEach(semestre => {

        const cursosSemestre =

        cursos.filter(

            curso =>

            curso.semestre === semestre

        );


        if (cursosSemestre.length === 0) {

            return;

        }


        const completados =

        cursosSemestre.filter(

            curso =>

            aprobados.includes(
                curso.codigo
            )

        ).length;


        const porcentaje =

        Math.round(

            completados

            /

            cursosSemestre.length

            *

            100

        );


        const fila =

        document.createElement(
            "div"
        );


        fila.className =
        "sem-progress";


        fila.innerHTML =

        `

        <div class="sem-label">

        ${

        semestre === "FG"

        ?

        "FG"

        :

        `${semestre}° semestre`

        }

        </div>

        <div class="sem-bar-container">

            <div

            class="sem-bar"

            style="width:${porcentaje}%">

            </div>

        </div>

        <div class="sem-percent">

            ${porcentaje}%

        </div>

        `;


        semesterProgressContainer.appendChild(
            fila
        );

    });

}


// =========================
// MODO OSCURO
// =========================

if (

    localStorage.getItem(
        "darkMode"
    )

    ===

    "true"

) {

    document.body.classList.add(
        "dark"
    );

}


document

.getElementById(
    "theme-toggle"
)

.addEventListener(

    "click",

    () => {

        document.body.classList.toggle(
            "dark"
        );


        localStorage.setItem(

            "darkMode",

            document.body.classList.contains(
                "dark"
            )

        );

    }

);


// =========================
// REINICIAR MALLA
// =========================

document

.getElementById(
    "reset-button"
)

.addEventListener(

    "click",

    () => {

        if (

            confirm(
                "¿Reiniciar toda la malla?"
            )

        ) {

            aprobados = [];

            popupMostrado = false;

            guardarProgreso();

            localStorage.setItem(

                "popupInternadoMostrado",

                false

            );

            actualizarEstados();

            actualizarProgreso();

            actualizarProgresoSemestres();

        }

    }

);


// =========================
// VOLVER ARRIBA
// =========================

document

.getElementById(
    "back-to-top"
)

.addEventListener(

    "click",

    () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

);


// =========================
// EXPORTAR PROGRESO
// =========================

document

.getElementById(
    "export-button"
)

.addEventListener(

    "click",

    () => {

        const datos = {

            aprobados,

            darkMode:

            document.body.classList.contains(
                "dark"
            )

        };


        const blob =

        new Blob(

            [

                JSON.stringify(
                    datos,
                    null,
                    2
                )

            ],

            {

                type:

                "application/json"

            }

        );


        const enlace =

        document.createElement(
            "a"
        );


        enlace.href =

        URL.createObjectURL(
            blob
        );


        enlace.download =

        "progreso-malla.json";


        enlace.click();

    }

);


// =========================
// IMPORTAR PROGRESO
// =========================

document

.getElementById(
    "import-file"
)

.addEventListener(

    "change",

    evento => {

        const archivo =

        evento.target.files[0];


        if (!archivo) {

            return;

        }


        const lector =

        new FileReader();


        lector.onload = e => {

            const datos =

            JSON.parse(
                e.target.result
            );


            aprobados =

            datos.aprobados

            || [];


            guardarProgreso();


            if (

                datos.darkMode

            ) {

                document.body.classList.add(
                    "dark"
                );

            }

            else {

                document.body.classList.remove(
                    "dark"
                );

            }


            localStorage.setItem(

                "darkMode",

                document.body.classList.contains(
                    "dark"
                )

            );


            actualizarEstados();

            actualizarProgreso();

            actualizarProgresoSemestres();

        };


        lector.readAsText(
            archivo
        );

    }

);
