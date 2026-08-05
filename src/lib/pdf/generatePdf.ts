import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import path from 'path'

export interface PdfData {
  document_type: string
  document_reference: string
  issue_date: string
  candidate_name: string
  candidate_email: string
  designation: string
  joining_date: string
  salary: string
  company_name: string
  certificate_id?: string
  verification_url?: string
}

export async function generatePdfBuffer(
  templateContent: string, 
  data: PdfData, 
  logoUrl?: string, 
  signatureUrl?: string
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const regularFontPath = path.join(process.cwd(), 'src/lib/pdf/fonts/Roboto-Regular.ttf')
      const boldFontPath = path.join(process.cwd(), 'src/lib/pdf/fonts/Roboto-Bold.ttf')

      const doc = new PDFDocument({ size: 'A4', margin: 50, font: regularFontPath })
      const chunks: Buffer[] = []

      doc.registerFont('Roboto', regularFontPath)
      doc.registerFont('Roboto-Bold', boldFontPath)

      // Start with Roboto
      doc.font('Roboto')

      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', (err) => reject(err))

      const isCertificate = data.document_type.includes('Certificate')

      // Draw Double Border for Certificates only
      if (isCertificate) {
        doc.rect(30, 30, 535, 782).strokeColor('#0F172A').lineWidth(6).stroke()
        doc.rect(36, 36, 523, 770).strokeColor('#3B82F6').lineWidth(1).stroke()
      }

      // 1. Render Logo if present
      if (logoUrl) {
        try {
          const res = await fetch(logoUrl)
          const logoBuffer = Buffer.from(await res.arrayBuffer())
          doc.image(logoBuffer, 50, 50, { height: 40 })
        } catch {
          // If fetch fails, draw company name text
          doc.fillColor('#0F172A').fontSize(18).font('Roboto-Bold').text(data.company_name, 50, 55)
        }
      } else {
        doc.fillColor('#0F172A').fontSize(18).font('Roboto-Bold').text(data.company_name, 50, 55)
      }

      // Add a horizontal divider line for non-certificates (or clean line for certificates)
      doc.moveTo(50, 105).lineTo(545, 105).strokeColor('#E5E7EB').lineWidth(1).stroke()

      // 2. Add metadata
      doc.fillColor('#6B7280').fontSize(9).font('Roboto')
      doc.text(`Reference: ${data.document_reference}`, 350, 120, { align: 'right', width: 195 })
      doc.text(`Date of Issue: ${data.issue_date}`, 350, 132, { align: 'right', width: 195 })

      // Document Title
      doc.fillColor('#111827').fontSize(22).font('Roboto-Bold')
      if (isCertificate) {
        doc.text(data.document_type.toUpperCase(), 50, 170, { align: 'center', width: 495 })
      } else {
        doc.text(data.document_type, 50, 120)
      }

      // Parse the template body text and replace placeholders
      let bodyText = templateContent
        .replace(/{{candidate_name}}/g, data.candidate_name)
        .replace(/{{candidate_email}}/g, data.candidate_email)
        .replace(/{{designation}}/g, data.designation)
        .replace(/{{joining_date}}/g, data.joining_date)
        .replace(/{{salary}}/g, data.salary)
        .replace(/{{company_name}}/g, data.company_name)
        .replace(/{{issue_date}}/g, data.issue_date)
        .replace(/{{certificate_id}}/g, data.certificate_id || '')

      doc.font('Roboto').fontSize(11).fillColor('#374151')
      
      const textYStart = isCertificate ? 250 : 180
      doc.text(bodyText, 50, textYStart, { width: 495, align: isCertificate ? 'center' : 'left', lineGap: 6 })

      // 3. Render QR Code for certificates
      if (isCertificate && data.certificate_id && data.verification_url) {
        try {
          const qrBuffer = await QRCode.toBuffer(data.verification_url, { margin: 1, width: 80 })
          doc.image(qrBuffer, 50, 680, { width: 70 })
          doc.fillColor('#6B7280').fontSize(8).font('Roboto')
          doc.text('Scan QR Code to verify.', 50, 755)
          doc.text(`ID: ${data.certificate_id}`, 50, 765)
        } catch {
          // If QR code generation fails, just write the certificate id
          doc.fillColor('#6B7280').fontSize(8).text(`Certificate ID: ${data.certificate_id}`, 50, 755)
        }
      }

      // 4. Render Signature
      const signatureYPos = 660
      if (signatureUrl) {
        try {
          const res = await fetch(signatureUrl)
          const sigBuffer = Buffer.from(await res.arrayBuffer())
          doc.image(sigBuffer, 380, signatureYPos - 45, { height: 40 })
        } catch {
          // Skip if fetch signature fails
        }
      }

      doc.moveTo(350, signatureYPos).lineTo(500, signatureYPos).strokeColor('#9CA3AF').lineWidth(1).stroke()
      doc.fillColor('#111827').font('Roboto-Bold').fontSize(10).text('Authorized Signatory', 350, signatureYPos + 6, { align: 'center', width: 150 })
      doc.fillColor('#6B7280').font('Roboto').fontSize(8).text('HireFlow HR Operations', 350, signatureYPos + 18, { align: 'center', width: 150 })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}
