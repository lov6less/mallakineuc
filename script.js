// =========================
// VARIABLES
// =========================

let cursos = [];

const mallaContainer =

document.getElementById(
    "malla-container"
);


// =========================
// CARGAR JSON
// =========================

fetch("data.json")

.then(

    response => response.json()

)

.then(

    data => {

        cursos = data;

        crearSemestres();

        crearTarjetas();
        actualizarEstados();
    }

)

.catch(

    error => {

        console.error(
            error
        );

    }
// =========================
// CREAR SEMESTRES
// =========================

function crearSemestres(){

    const semestres =

    [

        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        "FG"

    ];


    semestres.forEach(

        semestre => {

            const columna =

            document.createElement(
                "section"
            );


            columna.className =
            "semester";


            columna.id =

            `semestre-${semestre}`;


            columna.innerHTML =

            `

            <h2>

            ${

            semestre === "FG"

            ?

            "Formación General"

            :

            `${semestre}° semestre`

            }

            </h2>

            `;


            mallaContainer.appendChild(
                columna
            );

        }

    );

}// =========================
// CREAR TARJETAS
// =========================

function crearTarjetas(){

    cursos.forEach(

        curso => {

            const card =

            document.createElement(
                "div"
            );


            card.className =
            "course";


            card.dataset.codigo =
            curso.codigo;


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

    () => {

        if(

            aprobados.includes(
                curso.codigo
            )

        ){

            aprobados =

            aprobados.filter(

                codigo =>

                codigo !== curso.codigo

            );

        }

        else if(

            cursoDisponible(
                curso
            )

        ){

            aprobados.push(
                curso.codigo
            );

        }


        actualizarEstados();

    }

);
            document

            .getElementById(

                `semestre-${curso.semestre}`

            )

            .appendChild(
                card
            );

        }

    );

}
);// =========================
// APROBADOS
// =========================

let aprobados = [];


// =========================
// OBTENER CURSO
// =========================

function obtenerCurso(codigo){

    return cursos.find(

        curso =>

        curso.codigo === codigo

    );

}


// =========================
// CURSO DISPONIBLE
// =========================

function cursoDisponible(curso){

    if(

        !curso.prerrequisitos ||

        curso.prerrequisitos.length === 0

    ){

        return true;

    }


    return curso.prerrequisitos.every(

        requisito =>

        aprobados.includes(
            requisito
        )

    );

}// =========================
// ACTUALIZAR ESTADOS
// =========================

function actualizarEstados(){

    document

    .querySelectorAll(".course")

    .forEach(

        card => {

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

        }

    );

}
