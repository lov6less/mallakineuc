document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("data.json");
  const data = await response.json();
  const container = document.getElementById("malla-container");

  const ramos = {};
  const aprobados = new Set(JSON.parse(localStorage.getItem("aprobados")) || []);

  // Verifica si todos los ramos (excepto los de 9° y 10°) están aprobados
  function todosPreviosAprobados() {
    return Object.values(ramos)
      .filter(r => !r.codigo.startsWith("KIN5"))
      .every(r => aprobados.has(r.codigo));
  }

  // Revisa si se cumplen los prerrequisitos de un ramo
  function checkRequisitos(codigo) {
    const requisitos = ramos[codigo].requisitos;
    return requisitos.every(req => aprobados.has(req));
  }

  // Cambia los estilos según el estado del ramo
  function actualizarEstado() {
    for (const codigo in ramos) {
      const ramo = ramos[codigo];
      const div = ramo.elemento;

      if (aprobados.has(codigo)) {
        div.classList.add("aprobado");
        div.classList.remove("bloqueado");
      } else if (checkRequisitos(codigo) || (codigo.startsWith("KIN5") && todosPreviosAprobados())) {
        div.classList.remove("bloqueado");
        div.classList.remove("aprobado");
      } else {
        div.classList.add("bloqueado");
        div.classList.remove("aprobado");
      }
    }
  }

  // Marca o desmarca un ramo como aprobado
  function toggleAprobado(codigo) {
    const esInternado = codigo.startsWith("KIN5");
    if (!checkRequisitos(codigo) && !esInternado) return;
    if (esInternado && !todosPreviosAprobados()) return;

    if (aprobados.has(codigo)) {
      aprobados.delete(codigo);
    } else {
      aprobados.add(codigo);
    }

    localStorage.setItem("aprobados", JSON.stringify([...aprobados]));
    actualizarEstado();
  }

  // Construye visualmente la malla
  for (const [semestre, listaRamos] of Object.entries(data)) {
    const semDiv = document.createElement("div");
    semDiv.className = "semestre";
    semDiv.innerHTML = `<h2>${semestre}</h2>`;

    listaRamos.forEach(([nombre, codigo, requisitos]) => {
      const div = document.createElement("div");
      div.className = "ramo";
      div.textContent = `${codigo} - ${nombre}`;
      div.onclick = () => toggleAprobado(codigo);

      semDiv.appendChild(div);
      ramos[codigo] = { requisitos, elemento: div, codigo };
    });

    container.appendChild(semDiv);
  }

  actualizarEstado();
});
