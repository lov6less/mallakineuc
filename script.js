// ==========================
// VARIABLES
// ==========================

let cursos = [];
let aprobados = JSON.parse(localStorage.getItem("aprobados")) || [];

const mallaContainer = document.getElementById("malla-container");


// ==========================
// CARGAR JSON
// ==========================

fetch("data.json")
    .then(res => res.json())
    .then(data => {

        cursos = data;

        renderizarMalla();

        actualizarTodo();

    });


// ==========================
// CREAR MALLA
// ==========================

function renderizarMalla() {

    mallaContainer.innerHTML = "";

    const semestres = [...new Set(cursos.map(c => c.semestre))];

    semestres.forEach(semestre => {

        const section = document.createElement("section");

        section.classList.add("semester");

        section.innerHTML = `
            <h2>${obtenerTituloSemestre(semestre)}</h2>
            <div class="course-grid" id="sem-${semestre}"></div>
        `;

        mallaContainer.appendChild(section);

        const grid = document.getElementById(`sem-${semestre}`);

        cursos
            .filter(curso => curso.semestre === semestre)
            .forEach(curso => {

                const div = document.createElement("div");

                div.classList.add("course");

                div.id = curso.codigo;

                div.innerHTML = `
                    <h4>${curso.nombre}</h4>
                    <p>${curso.codigo}</p>
                `;

                div.addEventListener("click", () => toggleCurso(curso));

                div.addEventListener("mouseenter", e => mostrarTooltip(e, curso));

                div.addEventListener("mouseleave", ocultarTooltip);

                grid.appendChild(div);

            });

    });

}


// ==========================
// TITULOS
// ==========================

function obtenerTituloSemestre(semestre){

    if(semestre === "FG") return "🌸 Formación General";

    return `${semestre}° Semestre`;

}


// ==========================
// APROBAR RAMO
// ==========================

function toggleCurso(curso){

    if(!cursoDisponible(curso)) return;

    if(aprobados.includes(curso.codigo)){

        aprobados = aprobados.filter(c => c !== curso.codigo);

    }else{

        aprobados.push(curso.codigo);

    }

    localStorage.setItem(
        "aprobados",
        JSON.stringify(aprobados)
    );

    actualizarTodo();

}


// ==========================
// DISPONIBILIDAD
// ==========================

function cursoDisponible(curso){

    if(curso.prerequisitos.length === 0)
        return true;


    // INTERNADOS

    if(curso.prerequisitos.includes("TODA_LA_CARRERA")){

        return cursos
            .filter(c => c.semestre !== 9 && c.semestre !== 10)
            .every(c => aprobados.includes(c.codigo));

    }

    return curso.prerequisitos.every(
        p => aprobados.includes(p)
    );

}


// ==========================
// ACTUALIZAR COLORES
// ==========================

function actualizarTodo(){

    let disponibles = 0;

    cursos.forEach(curso => {

        const div = document.getElementById(curso.codigo);

        div.classList.remove(
            "locked",
            "available",
            "completed"
        );

        if(aprobados.includes(curso.codigo)){

            div.classList.add("completed");

        }
        else if(cursoDisponible(curso)){

            div.classList.add("available");

            disponibles++;

        }
        else{

            div.classList.add("locked");

        }

    });

    actualizarEstadisticas(disponibles);

    actualizarProgresoSemestres();

    verificarInternados();

}


// ==========================
// ESTADISTICAS
// ==========================

function actualizarEstadisticas(disponibles){

    const total = cursos.length;

    const porcentaje =
        Math.round(
            (aprobados.length / total) * 100
        );

    document.getElementById("aprobados").textContent =
        aprobados.length;

    document.getElementById("disponibles").textContent =
        disponibles;

    document.getElementById("bloqueados").textContent =
        total - disponibles - aprobados.length;

    document.getElementById("contador-ramos").textContent =
        `${aprobados.length} / ${total} ramos aprobados`;

    document.getElementById("porcentaje-total").textContent =
        `${porcentaje}%`;

    document.getElementById("progress-bar").style.width =
        porcentaje + "%";

}


// ==========================
// PROGRESO SEMESTRES
// ==========================

function actualizarProgresoSemestres(){

    const contenedor =
        document.getElementById(
            "semester-progress-container"
        );

    contenedor.innerHTML = "";

    const semestres =
        [...new Set(cursos.map(c => c.semestre))];

    semestres.forEach(semestre => {

        const cursosSem =
            cursos.filter(
                c => c.semestre === semestre
            );

        const aprobadosSem =
            cursosSem.filter(
                c => aprobados.includes(c.codigo)
            ).length;

        const porcentaje =
            Math.round(
                aprobadosSem / cursosSem.length * 100
            );

        contenedor.innerHTML += `

        <div class="semester-progress-item">

            <strong>
                ${obtenerTituloSemestre(semestre)}
                (${aprobadosSem}/${cursosSem.length})
            </strong>

            <div class="semester-progress-bar">

                <div
                    class="semester-progress-fill"
                    style="width:${porcentaje}%"
                ></div>

            </div>

        </div>

        `;

    });

}


// ==========================
// TOOLTIP
// ==========================

function mostrarTooltip(evento, curso){

    const tooltip =
        document.getElementById("tooltip");

    tooltip.style.display = "block";

    tooltip.style.left =
        evento.pageX + 20 + "px";

    tooltip.style.top =
        evento.pageY + "px";

    let texto = "";

    if(curso.prerequisitos.length === 0){

        texto =
            "Sin prerrequisitos";

    }
    else{

        curso.prerequisitos.forEach(pr => {

            if(pr === "TODA_LA_CARRERA"){

                texto +=
                    "✓ Aprobar toda la carrera<br>";

            }
            else{

                const ramo =
                    cursos.find(
                        c => c.codigo === pr
                    );

                const check =
                    aprobados.includes(pr)
                        ? "✓"
                        : "✗";

                texto +=
                    `${check} ${ramo.nombre}<br>`;

            }

        });

    }

    document.getElementById(
        "tooltip-content"
    ).innerHTML = texto;

}

function ocultarTooltip(){

    document.getElementById(
        "tooltip"
    ).style.display = "none";

}


// ==========================
// MODO OSCURO
// ==========================

const themeBtn =
    document.getElementById(
        "theme-toggle"
    );

if(
    localStorage.getItem("modoOscuro")
    === "true"
){

    document.body.classList.add(
        "dark-mode"
    );

}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle(
        "dark-mode"
    );

    localStorage.setItem(
        "modoOscuro",
        document.body.classList.contains(
            "dark-mode"
        )
    );

});


// ==========================
// REINICIAR
// ==========================

document.getElementById(
    "reset-btn"
).addEventListener("click", () => {

    if(
        confirm(
            "¿Reiniciar toda la malla?"
        )
    ){

        localStorage.removeItem(
            "aprobados"
        );

        location.reload();

    }

});


// ==========================
// POPUP INTERNADOS
// ==========================

function verificarInternados(){

    const desbloqueados =
        cursos
        .filter(c =>
            c.prerequisitos.includes(
                "TODA_LA_CARRERA"
            )
        )
        .every(c =>
            cursoDisponible(c)
        );

    if(
        desbloqueados &&
        !localStorage.getItem(
            "popupInternados"
        )
    ){

        document.getElementById(
            "internado-popup"
        ).style.display = "block";

        setTimeout(() => {

            document.getElementById(
                "internado-popup"
            ).style.display = "none";

        },5000);

        localStorage.setItem(
            "popupInternados",
            true
        );

    }

}
