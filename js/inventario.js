 let registros = [];
    let editIndex = -1;

    // ---------- LocalStorage ----------
    function guardarEnLocalStorage() {
      localStorage.setItem("registrosCRUD", JSON.stringify(registros));
    }

    function cargarDesdeLocalStorage() {
      const data = localStorage.getItem("registrosCRUD");
      if (data) {
        registros = JSON.parse(data);
        renderizarTabla();
      }
    }

    // ---------- CRUD ----------
    function limpiarCampos() {
      document.getElementById("activo").value = '';
      document.getElementById("detalles").value = '';
      document.getElementById("ubicacion").value = '';
      document.getElementById("caso").value = '';
      document.getElementById("enviado").value = 'Sí';
      document.getElementById("casoEnvio").value = '';
      editIndex = -1;
    }

    function agregarRegistro() {
      const activo = document.getElementById("activo").value;
      const detalles = document.getElementById("detalles").value;
      const ubicacion = document.getElementById("ubicacion").value;
      const caso = document.getElementById("caso").value;
      const enviado = document.getElementById("enviado").value;
      const casoEnvio = document.getElementById("casoEnvio").value;

      if (!activo || !detalles || !ubicacion || !caso || !casoEnvio) {
        alert("Por favor, complete todos los campos.");
        return;
      }

      const nuevo = { activo, detalles, ubicacion, caso, enviado, casoEnvio };

      if (editIndex === -1) {
        registros.push(nuevo);
      } else {
        registros[editIndex] = nuevo;
      }

      guardarEnLocalStorage();
      limpiarCampos();
      renderizarTabla();
    }

    function renderizarTabla() {
      const tbody = document.querySelector("#tabla tbody");
      tbody.innerHTML = "";

      registros.forEach((reg, i) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${reg.activo}</td>
          <td>${reg.detalles}</td>
          <td>${reg.ubicacion}</td>
          <td>${reg.caso}</td>
          <td>${reg.enviado}</td>
          <td>${reg.casoEnvio}</td>
          <td>
            <button class="action-btn edit-btn" onclick="editarRegistro(${i})">Editar</button>
            <button class="action-btn delete-btn" onclick="eliminarRegistro(${i})">Eliminar</button>
          </td>
        `;
        tbody.appendChild(fila);
      });
    }

    function editarRegistro(index) {
      const reg = registros[index];
      document.getElementById("activo").value = reg.activo;
      document.getElementById("detalles").value = reg.detalles;
      document.getElementById("ubicacion").value = reg.ubicacion;
      document.getElementById("caso").value = reg.caso;
      document.getElementById("enviado").value = reg.enviado;
      document.getElementById("casoEnvio").value = reg.casoEnvio;
      editIndex = index;
    }

    function eliminarRegistro(index) {
      if (confirm("¿Está seguro de eliminar este registro?")) {
        registros.splice(index, 1);
        guardarEnLocalStorage();
        renderizarTabla();
      }
    }

    // ---------- Excel ----------
    function exportarExcel() {
      if (registros.length === 0) {
        alert("No hay datos para exportar.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(registros);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");

      XLSX.writeFile(workbook, "registros.xlsx");
    }

    function importarExcel() {
      const fileInput = document.getElementById("archivoExcel");
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const dataJson = XLSX.utils.sheet_to_json(sheet);

        registros = dataJson.map(item => ({
          activo: item.activo || item.Activo || "",
          detalles: item.detalles || item.Detalles || "",
          ubicacion: item.ubicacion || item.Ubicacion || "",
          caso: item.caso || item.Caso || "",
          enviado: item.enviado || item.Enviado || "No",
          casoEnvio: item.casoEnvio || item["Caso de Envío"] || ""
        }));

        guardarEnLocalStorage();
        renderizarTabla();
        alert("Archivo importado correctamente.");
      };

      reader.readAsArrayBuffer(file);
    }

    // ---------- Cargar al iniciar ----------
    cargarDesdeLocalStorage();
  