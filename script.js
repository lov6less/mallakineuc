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

}
