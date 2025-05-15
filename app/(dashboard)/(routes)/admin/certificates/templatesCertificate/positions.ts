// app/(dashboard)/(routes)/admin/certificates/templatesCertificate/positions.ts

/**
 * Interfaces to customize element positions on the certificate template.
 * Coordinates are based on the original template resolution (623×440).
 */
export interface CertificatePositions {
  /** Position for the recipient name */
  name?: { x: number; y: number };
  /** Position for the certificate ID */
  certificate?: { x: number; y: number };
}
