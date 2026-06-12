// ======================
// VARIABLES GLOBALES
// ======================

let cursos = [];
let aprobados = JSON.parse(localStorage.getItem("ramosAprobados")) || [];

const mallaContainer = document.getElementById("malla-container");

const ordenSemestres = [
    1,2,3,4,5,6,7,8,"FG",9,10
];

const nombresSemestres = {
    1: "1° Semestre",
    2: "2° Semestre",
    3: "3° Semestre",
    4: "4° Semestre",
    5: "5° Semestre",
    6: "6° Semestre",
    7: "7° Semestre",
    8: "8° Semestre",
    "FG": "Formación General",
    9: "9° Semestre",
    10: "10° Semestre"
};

// ======================
// CARGAR DATA.JSON
// ======================

fetch("data.json")
    .then(response => response.json())
    .then(data => {

        cursos = data;

        crearMalla();

        actualizarEstadoCursos();

        actualizarProgreso();

        actualizarEstadisticas();

        actualizarProgresoSemestres();

    });


// ======================
// CREAR MALLA
// ======================

function crearMalla(){

    mallaContainer.innerHTML = "";

    ordenSemestres.forEach(semestre => {

        const columna = document.createElement("div");
        columna.classList.add("semester");

        columna.innerHTML = `
            <h2>${nombresSemestres[semestre]}</h2>
            <div class="course-grid"></div>
        `;

        const grid = columna.querySelector(".course-grid");

        cursos
            .filter(curso => curso.semestre === semestre)
            .forEach(curso => {

                const tarjeta = document.createElement("div");

                tarjeta.classList.add("course");

                tarjeta.dataset.codigo = curso.codigo;

                tarjeta.innerHTML = `
                    <h4>${curso.nombre}</h4>
                    <p>${curso.codigo}</p>
                `;

                tarjeta.addEventListener("click", () => {

                    toggleCurso(curso.codigo);

                });

                grid.appendChild(tarjeta);

            });

        mallaContainer.appendChild(columna);

    });

}


// ======================
// OBTENER TARJETA
// ======================

function obtenerTarjeta(codigo){

    return document.querySelector(
        `[data-codigo="${codigo}"]`
    );

}


// ======================
// GUARDAR PROGRESO
// ======================

function guardarProgreso(){

    localStorage.setItem(
        "ramosAprobados",
        JSON.stringify(aprobados)
    );

}


// ======================
// RESETEAR PROGRESO
// ======================

document
    .getElementById("reset-btn")
    .addEventListener("click", () => {

        if(confirm("¿Reiniciar toda la malla?")){

            aprobados = [];

            guardarProgreso();

            actualizarEstadoCursos();

            actualizarProgreso();

            actualizarEstadisticas();

            actualizarProgresoSemestres();

        }

    });// ======================
// ¿CUMPLE PRERREQUISITOS?
// ======================

function cumplePrerequisitos(curso){

    // Caso especial internados
    if(curso.prerequisitos.includes("TODA_LA_CARRERA")){

        const cursosPrevios = cursos.filter(c =>
            c.semestre !== 9 &&
            c.semestre !== 10
        );

        return cursosPrevios.every(c =>
            aprobados.includes(c.codigo)
        );
    }

    return curso.prerequisitos.every(pr =>
        aprobados.includes(pr)
    );

}


// ======================
// APROBAR / DESAPROBAR
// ======================

function toggleCurso(codigo){

    const curso = cursos.find(c =>
        c.codigo === codigo
    );

    const tarjeta = obtenerTarjeta(codigo);

    // Si ya está aprobado → desaprobar
    if(aprobados.includes(codigo)){

        desaprobarCurso(codigo);

        return;

    }

    // Si está bloqueado no hace nada
    if(!cumplePrerequisitos(curso)){

        return;

    }

    aprobados.push(codigo);

    tarjeta.classList.add("completed");

    guardarProgreso();

    actualizarEstadoCursos();

    actualizarProgreso();

    actualizarEstadisticas();

    actualizarProgresoSemestres();

    verificarInternados();

}


// ======================
// DESAPROBAR
// ======================

function desaprobarCurso(codigo){

    aprobados = aprobados.filter(c =>
        c !== codigo
    );

    guardarProgreso();

    actualizarEstadoCursos();

    actualizarProgreso();

    actualizarEstadisticas();

    actualizarProgresoSemestres();

}


// ======================
// ACTUALIZAR ESTADOS
// ======================

function actualizarEstadoCursos(){

    cursos.forEach(curso => {

        const tarjeta = obtenerTarjeta(
            curso.codigo
        );

        tarjeta.classList.remove(
            "completed",
            "available",
            "locked"
        );

        // Aprobado
        if(aprobados.includes(curso.codigo)){

            tarjeta.classList.add(
                "completed"
            );

        }

        // Disponible
        else if(cumplePrerequisitos(curso)){

            tarjeta.classList.add(
                "available"
            );

        }

        // Bloqueado
        else{

            tarjeta.classList.add(
                "locked"
            );

        }

    });

}


// ======================
// INTERNADOS
// ======================

let popupMostrado = false;

function verificarInternados(){

    const desbloqueados = cursos
        .filter(c =>
            c.prerequisitos.includes(
                "TODA_LA_CARRERA"
            )
        )
        .every(c =>
            cumplePrerequisitos(c)
        );

    if(
        desbloqueados &&
        !popupMostrado
    ){

        popupMostrado = true;

        const popup = document.getElementById(
            "internado-popup"
        );

        popup.style.display = "block";

        setTimeout(() => {

            popup.style.display = "none";

        }, 5000);

    }

}// ======================
// BARRA DE PROGRESO
// ======================

function actualizarProgreso(){

    const total = cursos.length;

    const porcentaje =
        (aprobados.length / total) * 100;

    document.getElementById(
        "contador-ramos"
    ).textContent =
        `${aprobados.length} / ${total} ramos aprobados`;

    document.getElementById(
        "progress-bar"
    ).style.width =
        porcentaje + "%";

    document.getElementById(
        "porcentaje-total"
    ).textContent =
        porcentaje.toFixed(1) + "%";

}


// ======================
// ESTADÍSTICAS
// ======================

function actualizarEstadisticas(){

    let disponibles = 0;
    let bloqueados = 0;

    cursos.forEach(curso => {

        if(aprobados.includes(curso.codigo)){

            return;

        }

        if(cumplePrerequisitos(curso)){

            disponibles++;

        }
        else{

            bloqueados++;

        }

    });

    document.getElementById(
        "aprobados"
    ).textContent =
        aprobados.length;

    document.getElementById(
        "disponibles"
    ).textContent =
        disponibles;

    document.getElementById(
        "bloqueados"
    ).textContent =
        bloqueados;

}


// ======================
// PROGRESO POR SEMESTRE
// ======================

function actualizarProgresoSemestres(){

    const container =
        document.getElementById(
            "semester-progress-container"
        );

    container.innerHTML = "";

    ordenSemestres.forEach(semestre => {

        const cursosSemestre =
            cursos.filter(
                c => c.semestre === semestre
            );

        if(cursosSemestre.length === 0){

            return;

        }

        const aprobadosSemestre =
            cursosSemestre.filter(
                c => aprobados.includes(c.codigo)
            ).length;

        const porcentaje =
            (aprobadosSemestre /
            cursosSemestre.length) * 100;

        const item =
            document.createElement("div");

        item.classList.add(
            "semester-progress-item"
        );

        item.innerHTML = `

            <strong>

                ${nombresSemestres[semestre]}

            </strong>

            <div class="semester-progress-bar">

                <div
                    class="semester-progress-fill"
                    style="width:${porcentaje}%"
                ></div>

            </div>

            <p>

                ${aprobadosSemestre}
                /
                ${cursosSemestre.length}
                (${porcentaje.toFixed(0)}%)

            </p>

        `;

        container.appendChild(item);

    });

}


// ======================
// BUSCADOR
// ======================

const searchInput =
document.getElementById(
    "search-input"
);

searchInput.addEventListener(
    "input",
    buscarCursos
);


function buscarCursos(){

    const texto =
        searchInput.value
        .toLowerCase()
        .trim();

    document
        .querySelectorAll(".course")
        .forEach(tarjeta => {

            const contenido =
                tarjeta.innerText
                .toLowerCase();

            tarjeta.style.border = "";

            if(
                texto !== "" &&
                contenido.includes(texto)
            ){

                tarjeta.style.border =
                    "3px solid #ff8ec0";

            }

        });

}// ======================
// MODO OSCURO
// ======================

const themeButton =
    document.getElementById(
        "theme-toggle"
    );

if(
    localStorage.getItem(
        "darkMode"
    ) === "true"
){

    document.body.classList.add(
        "dark-mode"
    );

}

themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );

        localStorage.setItem(
            "darkMode",
            document.body.classList.contains(
                "dark-mode"
            )
        );

    }
);


// ======================
// TOOLTIP
// ======================

const tooltip =
    document.getElementById(
        "tooltip"
    );

const tooltipContent =
    document.getElementById(
        "tooltip-content"
    );


document.addEventListener(
    "mouseover",
    e => {

        const tarjeta =
            e.target.closest(
                ".course"
            );

        if(!tarjeta){

            tooltip.style.display =
                "none";

            return;

        }

        const codigo =
            tarjeta.dataset.codigo;

        const curso =
            cursos.find(
                c =>
                c.codigo === codigo
            );

        if(!curso){

            return;

        }

        if(
            curso.prerequisitos.length === 0
        ){

            tooltipContent.innerHTML =
                "<p>Sin prerrequisitos</p>";

        }
        else{

            tooltipContent.innerHTML =
                curso.prerequisitos
                .map(pr => {

                    if(pr === "TODA_LA_CARRERA"){

                        return `
                        <p>
                        🎓 Aprobar toda la carrera
                        </p>
                        `;

                    }

                    const aprobado =
                        aprobados.includes(pr);

                    return `
                    <p>

                    ${aprobado ? "✅" : "❌"}

                    ${pr}

                    </p>
                    `;

                })
                .join("");

        }

        tooltip.style.display =
            "block";

    }
);


document.addEventListener(
    "mousemove",
    e => {

        tooltip.style.left =
            e.pageX + 15 + "px";

        tooltip.style.top =
            e.pageY + 15 + "px";

    }
);


document.addEventListener(
    "mouseout",
    e => {

        if(
            e.target.closest(".course")
        ){

            tooltip.style.display =
                "none";

        }

    }
);


// ======================
// BOTÓN VOLVER ARRIBA
// ======================

const backButton =
    document.getElementById(
        "back-to-top"
    );


window.addEventListener(
    "scroll",
    () => {

        if(
            window.scrollY > 400
        ){

            backButton.style.display =
                "block";

        }
        else{

            backButton.style.display =
                "none";

        }

    }
);


backButton.addEventListener(
    "click",
    () => {

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    }
);


// ======================
// CERRAR POPUP
// ======================

document.addEventListener(
    "click",
    e => {

        const popup =
            document.getElementById(
                "internado-popup"
            );

        if(
            popup.style.display ===
            "block"
        ){

            popup.style.display =
                "none";

        }

    }
);


// ======================
// EVENTOS FINALES
// ======================

window.addEventListener(
    "load",
    () => {

        actualizarEstadoCursos();

        actualizarProgreso();

        actualizarEstadisticas();

        actualizarProgresoSemestres();

    }
);
