const fs = require('fs');
const path = require('path');

const staffListPath = path.join(__dirname, '../src/components/StaffList.jsx');
const consultarPath = path.join(__dirname, '../src/components/ConsultarDocentes.jsx');

const staffList = fs.readFileSync(staffListPath, 'utf8');
const consultar = fs.readFileSync(consultarPath, 'utf8');

// Extract the modal from StaffList.jsx
const modalStartStr = "{/* Modal para VALIDAR Y CARGAR MATERIAS (Jefe de Dpto) */}";
const modalEndStr = "      )}";
const modalStartIndex = staffList.indexOf(modalStartStr);
const modalEndIndex = staffList.indexOf(modalEndStr, modalStartIndex) + modalEndStr.length;

if (modalStartIndex === -1 || modalEndIndex === -1) {
  console.error("Could not find modal in StaffList");
  process.exit(1);
}

const modalContent = staffList.substring(modalStartIndex, modalEndIndex);

// Insert it into ConsultarDocentes.jsx
const insertTarget = "    </div>\r\n  );\r\n};\r\n\r\nexport default ConsultarDocentes;";
const insertTarget2 = "    </div>\n  );\n};\n\nexport default ConsultarDocentes;";

let newConsultar = consultar.replace(insertTarget, "\n      " + modalContent + "\n\n" + insertTarget);
if (newConsultar === consultar) {
  newConsultar = consultar.replace(insertTarget2, "\n      " + modalContent + "\n\n" + insertTarget2);
}

fs.writeFileSync(consultarPath, newConsultar);
console.log("Successfully copied modal to ConsultarDocentes.jsx");
