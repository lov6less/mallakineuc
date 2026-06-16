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
);
