import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CFormInput } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilPencil, cilTrash } from "@coreui/icons";
import { GridToolbar } from "@mui/x-data-grid";
import jsPDF from "jspdf";

const rows = [
  {
    id: 1,
    supplierId: "SUP-001",
    name: "Supplier A",
    email: "supplierA@example.com",
    phone: "123-456-7890",
    rawItems: "Steel, Iron",
  },
  {
    id: 2,
    supplierId: "SUP-002",
    name: "Supplier B",
    email: "supplierB@example.com",
    phone: "987-654-3210",
    rawItems: "Copper, Aluminum",
  },
  {
    id: 3,
    supplierId: "SUP-003",
    name: "Supplier C",
    email: "supplierC@example.com",
    phone: "456-789-1234",
    rawItems: "Plastic, Rubber",
  },
  {
    id: 4,
    supplierId: "SUP-004",
    name: "Supplier D",
    email: "supplierD@example.com",
    phone: "654-321-9876",
    rawItems: "Wood, Glass",
  },
];

const columns = [
  { field: "supplierId", headerName: "Supplier ID", flex: 1 },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "email", headerName: "Email", flex: 1 },
  { field: "phone", headerName: "Phone Number", flex: 1 },
  { field: "rawItems", headerName: "Raw Items", flex: 1 },
  {
    field: "actions",
    headerName: "Actions",
    flex: 1,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <div style={{ display: "flex", gap: "10px" }}>
        <CButton
          color="secondary"
          size="sm"
          onClick={() => handleEdit(params.row)}
        >
          <CIcon icon={cilPencil} />
        </CButton>
        <CButton
          color="danger"
          size="sm"
          onClick={() => handleDelete(params.row)}
        >
          <CIcon icon={cilTrash} />
        </CButton>
      </div>
    ),
  },
];

const handleEdit = (row) => {
  alert(`Edit Supplier: ${JSON.stringify(row)}`);
};

const handleDelete = (row) => {
  alert(`Delete Supplier: ${row.name}`);
};

const exportToCSV = () => {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    ["Supplier ID,Name,Email,Phone Number,Raw Items"].join(",") +
    "\n" +
    rows
      .map((row) =>
        [row.supplierId, row.name, row.email, row.phone, row.rawItems].join(",")
      )
      .join("\n");
  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = "suppliers.csv";
  link.click();
};

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text("Suppliers Management", 10, 10);
  const tableColumn = ["Supplier ID", "Name", "Email", "Phone Number", "Raw Items"];
  const tableRows = rows.map((row) => [row.supplierId, row.name, row.email, row.phone, row.rawItems]);
  doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
  doc.save("suppliers.pdf");
};

export default function Supplier() {
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rawItems: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveSupplier = () => {
    alert(`Supplier Added: ${JSON.stringify(formData)}`);
    setModalVisible(false);
    setFormData({ name: "", email: "", phone: "", rawItems: "" });
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Suppliers</h2>
        <CButton color="primary" onClick={() => setModalVisible(true)}>
          Add Supplier
        </CButton>
      </div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <CButton color="info" onClick={exportToCSV}>
          Export to CSV
        </CButton>
        <CButton color="secondary" onClick={exportToPDF}>
          Export to PDF
        </CButton>
      </div>
      <div style={{ height: "auto", width: "100%", backgroundColor: "white" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          components={{
            Toolbar: GridToolbar,
          }}
          disableSelectionOnClick
          autoHeight
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              fontSize: "1.1rem",
            },
            "& .MuiDataGrid-toolbarContainer": {
              justifyContent: "flex-end",
            },
            "& .MuiDataGrid-root": {
              fontSize: "1rem",
            },
          }}
        />
      </div>

      {/* Modal for Adding Suppliers */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)} centered>
        <CModalHeader>
          <CModalTitle>Add Supplier</CModalTitle>
          
        </CModalHeader>
        <CModalBody>
          <CFormInput
            className="mb-3"
            placeholder="Supplier Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <CFormInput
            className="mb-3"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <CFormInput
            className="mb-3"
            placeholder="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <CFormInput
            className="mb-3"
            placeholder="Raw Item"
            name="rawItems"
            value={formData.rawItems}
            onChange={handleChange}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSaveSupplier}>
            Save Supplier
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
}