// app/(dashboard)/(routes)/admin/certificates/PageCert.tsx
import React from "react";
import DynamicCert from "./templatesCertificate/dinamic";
import { CertificatePositions } from "./templatesCertificate/positions";

const testData = [
  { name: "Juan Pérez", certificateId: "cert-001" },
  { name: "María Gómez", certificateId: "cert-002" },
  { name: "Carlos Rodríguez", certificateId: "cert-003" },
];

// Posiciones por defecto (basadas en resolución original 623×440)
const defaultPositions: CertificatePositions = {
  name: { x: 300, y: 240 },
  certificate: { x: 300, y: 300 },
};

const PageCert: React.FC = () => (
  <main
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "2rem",
      background: "#f3f4f6",
      padding: "2rem",
    }}
  >
    {testData.map(({ name, certificateId }) => (
      <DynamicCert
        key={certificateId}
        name={name}
        certificateId={certificateId}
        unit="px"
        positions={defaultPositions}
      />
    ))}
  </main>
);

export default PageCert;
