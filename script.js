// =========================
// VARIABLES
// =========================

let cursos = [];

let aprobados =
JSON.parse(
localStorage.getItem("aprobados")
) || [];

let popupMostrado =
JSON.parse(
localStorage.getItem("popupInternadoMostrado")
) || false;


// =========================
// CONTENEDORES
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


// =========================
// CARGAR DATA
// =========================

fetch("data.json")

.then(response => response.json())

.then(data => {

    cursos = data;

    crearSemestres();

    crearTarjetas();

    actualizarEstadoCursos();

    actualizarProgreso();

    actualizarProgresoSemestres();

})

.catch(error => {

    console.error(
    "Error cargando data.json:",
    error
    );

});


// =========================
// SEMESTRES
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
// CREAR COLUMNAS
// =========================

function crearSemestres(){

    mallaContainer.innerHTML = "";

    ordenSemestres.forEach(semestre => {

        const columna =
        document.createElement("div");

        columna.classList.add(
        "semester"
        );

        const titulo =
        document.createElement("h2");

        titulo.classList.add(
        "semester-title"
        );

        titulo.textContent =
        semestre === "FG"
        ? "Formación General"
        : `${semestre}° semestre`;

        columna.appendChild(
        titulo
        );

        columna.id =
        `semestre-${semestre}`;

        mallaContainer.appendChild(
        columna
        );

    });

}


// =========================
// CREAR TARJETAS
// =========================

function crearTarjetas(){

    cursos.forEach(curso => {

        const card =
        document.createElement("div");

        card.classList.add(
        "course"
        );

        card.dataset.codigo =
        curso.codigo;


        // Internados

        if(
        curso.prerequisitos.includes(
        "TODA_LA_CARRERA"
        )
        ){

            card.classList.add(
            "internado"
            );

        }


        // Nombre

        const nombre =
        document.createElement("div");

        nombre.classList.add(
        "course-name"
        );

        nombre.textContent =
        curso.nombre;


        // Código

        const codigo =
        document.createElement("div");

        codigo.classList.add(
        "course-code"
        );

        codigo.textContent =
        curso.codigo;


        card.appendChild(
        nombre
        );

        card.appendChild(
        codigo
        );


        // Click

        card.addEventListener(
        "click",
        () => manejarClick(curso)
        );


        // Tooltip

        card.addEventListener(
        "mousemove",
        e => mostrarTooltip(
        e,
        curso
        )
        );

        card.addEventListener(
        "mouseleave",
        ocultarTooltip
        );


        // Agregar a semestre

        document
        .getElementById(
        `semestre-${curso.semestre}`
        )
        .appendChild(
        card
        );

    });

}// =========================
// VERIFICAR SI UN CURSO
// ESTÁ DESBLOQUEADO
// =========================

function cursoDisponible(curso){

    // Internados

    if(
        curso.prerequisitos.includes(
        "TODA_LA_CARRERA"
        )
    ){

        return todaLaCarreraAprobada();

    }


    return curso.prerequisitos.every(
        codigo =>
        aprobados.includes(codigo)
    );

}


// =========================
// TODA LA CARRERA
// =========================

function todaLaCarreraAprobada(){

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


// =========================
// ACTUALIZAR ESTADO VISUAL
// =========================

function actualizarEstadoCursos(){

    cursos.forEach(curso => {

        const card =
        document.querySelector(
        `[data-codigo="${curso.codigo}"]`
        );

        card.classList.remove(
            "locked",
            "available",
            "completed"
        );


        // Aprobado

        if(
            aprobados.includes(
            curso.codigo
            )
        ){

            card.classList.add(
            "completed"
            );

        }

        // Disponible

        else if(
            cursoDisponible(
            curso
            )
        ){

            card.classList.add(
            "available"
            );

        }

        // Bloqueado

        else{

            card.classList.add(
            "locked"
            );

        }

    });

}


// =========================
// OBTENER CURSO POR CÓDIGO
// =========================

function obtenerCurso(codigo){

    return cursos.find(
        curso =>
        curso.codigo === codigo
    );

}


// =========================
// CURSOS DEPENDIENTES
// =========================

function obtenerDependientes(codigo){

    return cursos.filter(

        curso =>

        curso.prerequisitos.includes(
            codigo
        )

    );

}


// =========================
// DEPENDIENTES RECURSIVOS
// =========================

function obtenerDependientesRecursivos(
codigo,
visitados = new Set()
){

    const dependientes =
    obtenerDependientes(
    codigo
    );

    let resultado = [];

    dependientes.forEach(curso => {

        if(
        !visitados.has(
        curso.codigo
        )
        ){

            visitados.add(
            curso.codigo
            );

            resultado.push(
            curso
            );

            resultado = [

                ...resultado,

                ...obtenerDependientesRecursivos(
                    curso.codigo,
                    visitados
                )

            ];

        }

    });

    return resultado;

}// =========================
// MANEJAR CLICK
// =========================

function manejarClick(curso){

    if(
        aprobados.includes(
        curso.codigo
        )
    ){

        desaprobarCurso(
        curso
        );

    }

    else{

        if(
        cursoDisponible(
        curso
        )
        ){

            aprobarCurso(
            curso
            );

        }

    }

}


// =========================
// APROBAR CURSO
// =========================

function aprobarCurso(curso){

    aprobados.push(
    curso.codigo
    );

    guardarProgreso();

    actualizarEstadoCursos();

    actualizarProgreso();

    actualizarProgresoSemestres();

    verificarInternados();

}


// =========================
// DESAPROBAR CURSO
// =========================

function desaprobarCurso(curso){

    const afectados =

    obtenerDependientesRecursivos(
    curso.codigo
    );


    if(
    afectados.length > 0
    ){

        const nombres =

        afectados

        .map(
        curso =>
        `• ${curso.nombre}`
        )

        .join("\n");


        const confirmar =

        confirm(

`⚠️ Desaprobar "${curso.nombre}" también desaprobará:

${nombres}

¿Deseas continuar?`

        );


        if(
        !confirmar
        ){

            return;

        }

    }


    const eliminar = [

        curso.codigo,

        ...afectados.map(
        curso =>
        curso.codigo
        )

    ];


    aprobados =

    aprobados.filter(

        codigo =>

        !eliminar.includes(
        codigo
        )

    );


    guardarProgreso();

    actualizarEstadoCursos();

    actualizarProgreso();

    actualizarProgresoSemestres();

}


// =========================
// GUARDAR
// =========================

function guardarProgreso(){

    localStorage.setItem(

        "aprobados",

        JSON.stringify(
        aprobados
        )

    );

}


// =========================
// REINICIAR POPUP
// =========================

function reiniciarPopupInternado(){

    popupMostrado = false;

    localStorage.setItem(

        "popupInternadoMostrado",

        JSON.stringify(
        false
        )

    );

}// =========================
// PROGRESO GENERAL
// =========================

function actualizarProgreso(){

    const total = cursos.length;

    const completados =
    aprobados.length;

    const porcentaje =
    Math.round(
        completados /
        total *
        100
    );


    document
    .getElementById(
    "contador-ramos"
    )
    .textContent =

    `${completados} / ${total} ramos aprobados`;


    document
    .getElementById(
    "progress-bar"
    )
    .style.width =

    `${porcentaje}%`;


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

function actualizarEstadisticas(){

    let disponibles = 0;

    let bloqueados = 0;


    cursos.forEach(curso => {

        if(
        aprobados.includes(
        curso.codigo
        )
        ){

            return;

        }


        if(
        cursoDisponible(
        curso
        )
        ){

            disponibles++;

        }

        else{

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
// PROGRESO POR SEMESTRE
// =========================

function actualizarProgresoSemestres(){

    const container =

    document.getElementById(
    "semester-progress-container"
    );

    container.innerHTML = "";


    ordenSemestres.forEach(semestre => {

        const cursosSemestre =

        cursos.filter(
        curso =>
        curso.semestre === semestre
        );


        if(
        cursosSemestre.length === 0
        ){

            return;

        }


        const total =

        cursosSemestre.length;


        const completados =

        cursosSemestre.filter(
        curso =>
        aprobados.includes(
        curso.codigo
        )
        ).length;


        const porcentaje =

        Math.round(
            completados /
            total *
            100
        );


        const fila =
        document.createElement(
        "div"
        );

        fila.classList.add(
        "sem-progress"
        );


        fila.innerHTML =

        `

        <div class="sem-label">

        ${
        semestre === "FG"

        ? "FG"

        : `${semestre}° semestre`
        }

        </div>

        <div class="sem-bar-container">

            <div
            class="sem-bar"
            style="
            width:${porcentaje}%"
            >

            </div>

        </div>

        <div class="sem-percent">

            ${porcentaje}%

        </div>

        `;


        container.appendChild(
        fila
        );

    });

}// =========================
// TOOLTIP
// =========================

function mostrarTooltip(evento, curso){

    if(curso.prerequisitos.length === 0){

        tooltip.classList.remove("visible");
        return;

    }

    tooltipContent.innerHTML = "";

    curso.prerequisitos.forEach(codigo => {

        const linea = document.createElement("div");

        if(codigo === "TODA_LA_CARRERA"){

            linea.textContent =
            "🎓 Aprobar toda la carrera";

        }

        else{

            const prerreq = obtenerCurso(codigo);

            linea.textContent =
            (aprobados.includes(codigo) ? "✅ " : "❌ ")
            +
            prerreq.nombre;

        }

        tooltipContent.appendChild(linea);

    });

    const margen = 20;

let left = evento.clientX + margen;
let top = evento.clientY + margen;

const anchoTooltip = 320;
const altoTooltip = 250;


// Evitar que salga por la derecha

if (
left + anchoTooltip >
window.innerWidth
){

    left =
    evento.clientX -
    anchoTooltip -
    margen;

}


// Evitar que salga por abajo

if (
top + altoTooltip >
window.innerHeight
){

    top =
    evento.clientY -
    altoTooltip -
    margen;

}


tooltip.style.left =
`${left}px`;

tooltip.style.top =
`${top}px`;

    tooltip.classList.add("visible");

}


function ocultarTooltip(){

    tooltip.classList.remove("visible");

}


// =========================
// INTERNADOS
// =========================

function verificarInternados(){

    if(
        todaLaCarreraAprobada()
        &&
        !popupMostrado
    ){

        document.getElementById(
        "internado-popup"
        ).style.display = "block";

        popupMostrado = true;

        localStorage.setItem(
            "popupInternadoMostrado",
            JSON.stringify(true)
        );

        setTimeout(() => {

            document.getElementById(
            "internado-popup"
            ).style.display = "none";

        }, 4000);

    }

}


// =========================
// MODO OSCURO
// =========================

const themeButton =
document.getElementById(
"theme-toggle"
);

if(
localStorage.getItem("darkMode")
=== "true"
){

    document.body.classList.add(
    "dark"
    );

}

themeButton.addEventListener(
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

});


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

        top:0,

        behavior:"smooth"

    });

});// =========================
// REINICIAR MALLA
// =========================

document
const resetButton =
document.getElementById(
"reset-button"
);

console.log(resetButton);

resetButton?.addEventListener(
"click",
() => {

    alert("Botón funcionando 🎉");

});

    const confirmar = confirm(

`⚠️ ¿Seguro que deseas reiniciar la malla?

Se perderán todos los ramos aprobados.`

    );

    if(!confirmar){

        return;

    }

    aprobados = [];

    popupMostrado = false;

    localStorage.removeItem(
    "aprobados"
    );

    localStorage.removeItem(
    "popupInternadoMostrado"
    );

    actualizarEstadoCursos();

    actualizarProgreso();

    actualizarProgresoSemestres();

});
