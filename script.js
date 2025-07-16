document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("data.json");
  const data = await response.json();
  const container = document.getElementById("malla-container");

  const ramos = {};
  const aprobados = new Set(JSON.parse(localStorage.getItem("aprobados")) || []);

  function checkRequisitos(codigo) {
    const reqs = ramos[codigo].requisitos;
    return reqs.every(req => aprobados.has(req));
  }

  function actualizarEstado() {
    for (const codigo in ramos) {
      const ramo = ramos[codigo];
      const div = ramo.elemento;
      if (aprobados.has(codigo)) {
        div.classList.add("aprobado");
        div.classList.remove("bloqueado");
      } else if (checkRequisitos(codigo)) {
        div.classList.remove("bloqueado");
      } else {
        div.classList.add("bloqueado");
      }
    }

    const todosPrevios = Object.values(ramos)
      .filter(r => !r.codigo.startsWith("KIN5"))
      .every(r => aprobados.has(r.codigo));

    if (todosPrevios) {
      Object.values(ramos)
        .filter(r => r.codigo.startsWith("KIN5"))
        .forEach(r => r.elemento.classList.remove("bloqueado"));
    }
  }

  function toggleAprobado(codigo) {
    if (!checkRequisitos(codigo) && !codigo.startsWith("KIN5")) return;
    if (aprobados.has(codigo)) {
      aprobados.delete(codigo);
    } else {
      aprobados.add(codigo);
    }
    localStorage.setItem("aprobados", JSON.stringify([...aprobados]));
    actualizarEstado();
  }

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
