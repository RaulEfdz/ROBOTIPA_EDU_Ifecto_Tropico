import React from "react";

type DefaultCertificateTemplateProps = {
  studentName: string;
  courseName: string;
  issueDate: string;
  certificateCode: string;
  backgroundImageUrl: string;
  qrCodeDataUrl?: string;
};

const DefaultCertificateTemplate: React.FC<DefaultCertificateTemplateProps> = ({
  studentName,
  courseName,
  issueDate,
  certificateCode,
  backgroundImageUrl,
  qrCodeDataUrl,
}) => {
  return (
    <div
      style={{
        width: "1123px",
        height: "794px",
        position: "relative",
        fontFamily: "'Arial', sans-serif",
        color: "#222",
        background: `url('${backgroundImageUrl}') center center / cover no-repeat`,
        boxSizing: "border-box",
        padding: "60px 80px",
        border: "8px solid #e0e0e0",
        borderRadius: "24px",
      }}
    >
      <style>
        {`
          .certificate-title {
            font-size: 2.8rem;
            font-weight: bold;
            text-align: center;
            margin-bottom: 1.5rem;
            color: #1a237e;
            letter-spacing: 2px;
          }
          .certificate-body {
            font-size: 1.3rem;
            text-align: center;
            margin-bottom: 2.5rem;
          }
          .certificate-student {
            font-size: clamp(1.2rem, 2.1rem, 2.1rem);
            font-weight: bold;
            color: #1565c0;
            margin-bottom: 1.2rem;
            max-width: 90%;
            margin-left: auto;
            margin-right: auto;
            word-break: break-word;
            white-space: normal;
            text-align: center;
          }
          .certificate-footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            position: absolute;
            bottom: 40px;
            left: 80px;
            right: 80px;
            font-size: 1rem;
            color: #444;
          }
          .certificate-code {
            font-size: 1rem;
            color: #888;
            letter-spacing: 1px;
          }
          .certificate-qr {
            width: 90px;
            height: 90px;
            object-fit: contain;
            border: 1px solid #eee;
            border-radius: 8px;
            background: #fff;
            padding: 4px;
          }
        `}
      </style>
      <div className="certificate-title">Certificado de Finalización</div>
      <div className="certificate-body">
        Se otorga el presente certificado a
        <div className="certificate-student">{studentName}</div>
        por haber completado satisfactoriamente el curso
        <div
          style={{
            fontWeight: "bold",
            color: "#388e3c",
            fontSize: "1.5rem",
            margin: "0.7rem 0",
          }}
        >
          {courseName}
        </div>
        <div style={{ marginTop: "1.5rem", fontSize: "1.1rem" }}>
          Fecha de emisión: <b>{issueDate}</b>
        </div>
      </div>
      <div className="certificate-footer">
        <div className="certificate-code">Código: {certificateCode}</div>
        {qrCodeDataUrl && (
          <img src={qrCodeDataUrl} alt="QR Code" className="certificate-qr" />
        )}
      </div>
    </div>
  );
};

export default DefaultCertificateTemplate;
