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


// =========================
// AGREGAR EVENTOS
// =========================

document

.querySelectorAll(".course")

.forEach(card => {

    const curso =

    obtenerCurso(
        card.dataset.codigo
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
