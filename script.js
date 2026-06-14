// =========================
// VARIABLES GLOBALES
// =========================

let cursos = [];

let aprobados =

JSON.parse(

    localStorage.getItem(
    "aprobados"

    )

)

|| [];


let popupMostrado =

JSON.parse(

    localStorage.getItem(

    "popupInternadoMostrado"

    )

)

|| false;


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


// =========================
// CARGAR DATA
// =========================

fetch(
"data.json"
)

.then(

response =>

response.json()

)

.then(

data => {

    cursos = data;


    crearSemestres();

    crearTarjetas();

    actualizarEstadoCursos();

    actualizarProgreso();

    actualizarProgresoSemestres();

    verificarInternados();

}

)

.catch(

error =>

console.error(

"Error al cargar data.json:",

error

)

);// =========================
// CREAR SEMESTRES
// =========================

function crearSemestres(){

    mallaContainer.innerHTML = "";

    ordenSemestres.forEach(semestre => {

        const columna =

        document.createElement(
        "div"
        );

        columna.classList.add(
        "semester"
        );

        columna.id =
        `semestre-${semestre}`;


        columna.innerHTML =

        `

        <div class="semester-title">

        ${
            semestre === "FG"
            ? "Formación General"
            : `${semestre}° Semestre`
        }

        </div>

        `;


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

        document.createElement(
        "div"
        );

        card.classList.add(
        "course"
        );

        card.dataset.codigo =
        curso.codigo;


        if(
            curso.prerequisitos.includes(
            "TODA_LA_CARRERA"
            )
        ){

            card.classList.add(
            "internado"
            );

        }


        card.innerHTML =

        `

        <div class="course-name">

            ${curso.nombre}

        </div>

        <div class="course-code">

            ${curso.codigo}

        </div>

        `;


        card.addEventListener(

            "click",

            () => manejarClick(
            curso
            )

        );


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

function obtenerCurso(codigo){

    return cursos.find(

        curso =>

        curso.codigo === codigo

    );

}


// =========================
// OBTENER DEPENDIENTES
// =========================

function obtenerDependientesRecursivos(
codigo
){

    let dependientes = [];


    cursos.forEach(curso => {

        if(

        curso.prerequisitos.includes(
        codigo
        )

        ){

            dependientes.push(
            curso
            );


            dependientes.push(

                ...obtenerDependientesRecursivos(

                curso.codigo

                )

            );

        }

    });


    return [

        ...new Map(

        dependientes.map(

            curso =>

            [

            curso.codigo,

            curso

            ]

        )

        ).values()

    ];

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

}// =========================
// CURSO DISPONIBLE
// =========================

function cursoDisponible(curso){

    if(
    curso.prerequisitos.includes(
    "TODA_LA_CARRERA"
    )
    ){

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

function actualizarEstadoCursos(){

    document

    .querySelectorAll(
    ".course"
    )

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


        if(

        aprobados.includes(
        codigo
        )

        ){

            card.classList.add(
            "approved"
            );

        }

        else if(

        cursoDisponible(
        curso
        )

        ){

            card.classList.add(
            "available"
            );

        }

        else{

            card.classList.add(
            "locked"
            );

        }

    });

}


// =========================
// TOOLTIP
// =========================

function mostrarTooltip(
evento,
curso
){

    if(
    curso.prerequisitos.length === 0
    ){

        tooltip.classList.remove(
        "visible"
        );

        return;

    }


    tooltipContent.innerHTML = "";


    curso.prerequisitos.forEach(

    codigo => {

        const linea =

        document.createElement(
        "div"
        );


        if(
        codigo ===
        "TODA_LA_CARRERA"
        ){

            linea.textContent =

            "🎓 Aprobar toda la carrera";

        }

        else{

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

    }

    );


    const margen = 20;

    let left =

    evento.clientX +
    margen;

    let top =

    evento.clientY +
    margen;


    const anchoTooltip = 280;

    const altoTooltip = 250;


    if(

    left + anchoTooltip >

    window.innerWidth

    ){

        left =

        evento.clientX -

        anchoTooltip -

        margen;

    }


    if(

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


    tooltip.classList.add(
    "visible"
    );

}


// =========================
// OCULTAR TOOLTIP
// =========================

function ocultarTooltip(){

    tooltip.classList.remove(
    "visible"
    );

}


// =========================
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

    else if(

    cursoDisponible(
    curso
    )

    ){

        aprobarCurso(
        curso
        );

    }

}// =========================
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
// GUARDAR PROGRESO
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

    const total =
    cursos.length;

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

    semesterProgressContainer.innerHTML = "";


    ordenSemestres.forEach(

    semestre => {

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


        semesterProgressContainer

        .appendChild(
        fila
        );

    });

}


// =========================
// POPUP INTERNADOS
// =========================

function verificarInternados(){

    if(

        todaLaCarreraAprobada()

        &&

        !popupMostrado

    ){

        internadoPopup.style.display =

        "block";


        popupMostrado = true;


        localStorage.setItem(

            "popupInternadoMostrado",

            JSON.stringify(
            true
            )

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
// MODO OSCURO
// =========================

const themeButton =
document.getElementById(
"theme-toggle"
);

if(

localStorage.getItem(
"darkMode"
)

===

"true"

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

    const confirmar =

    confirm(

    "¿Deseas reiniciar toda la malla?"

    );


    if(
    !confirmar
    ){

        return;

    }


    aprobados = [];


    guardarProgreso();

    reiniciarPopupInternado();

    actualizarEstadoCursos();

    actualizarProgreso();

    actualizarProgresoSemestres();

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


    if(
    !archivo
    ){

        return;

    }


    const lector =

    new FileReader();


    lector.onload =

    e => {

        const datos =

        JSON.parse(
        e.target.result
        );


        aprobados =

        datos.aprobados

        || [];


        guardarProgreso();


        if(

        datos.darkMode

        ){

            document.body.classList.add(
            "dark"
            );

        }

        else{

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


        actualizarEstadoCursos();

        actualizarProgreso();

        actualizarProgresoSemestres();

        verificarInternados();

    };


    lector.readAsText(
    archivo
    );

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

        top:0,

        behavior:"smooth"

    });

}

);
