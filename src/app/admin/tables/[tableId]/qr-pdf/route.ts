import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'

import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const sanitized = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : normalized

  const value = Number.parseInt(sanitized, 16)

  if (Number.isNaN(value)) {
    return rgb(0.91, 0.42, 0.09)
  }

  return rgb(
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255
  )
}

async function embedRemoteImage(pdfDoc: PDFDocument, imageUrl: string | null) {
  if (!imageUrl) return null

  try {
    const response = await fetch(imageUrl)
    if (!response.ok) return null

    const contentType = response.headers.get('content-type') || ''
    const bytes = await response.arrayBuffer()

    if (contentType.includes('png')) {
      return pdfDoc.embedPng(bytes)
    }

    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      return pdfDoc.embedJpg(bytes)
    }
  } catch {
    return null
  }

  return null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  const { tableId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.tenant_id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, name, slug, description, address, primary_color, logo_url')
    .eq('id', profile.tenant_id)
    .single()

  if (tenantError || !tenant?.slug) {
    return new NextResponse('Tenant not found', { status: 404 })
  }

  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('id, name')
    .eq('tenant_id', profile.tenant_id)
    .eq('id', tableId)
    .single()

  if (tableError || !table) {
    return new NextResponse('Table not found', { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
  const qrUrl = `${appUrl}/${tenant.slug}/${table.id}`
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 900,
    margin: 1,
    color: {
      dark: '#111111',
      light: '#F6EDD9',
    },
  })

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89])
  const width = page.getWidth()
  const height = page.getHeight()
  const brandOrange = hexToRgb(tenant.primary_color || '#ea6a17')
  const cream = rgb(0.965, 0.929, 0.851)
  const black = rgb(0.08, 0.06, 0.05)
  const muted = rgb(0.36, 0.31, 0.27)

  const displayFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const qrImage = await pdfDoc.embedPng(qrDataUrl)
  const logoImage = await embedRemoteImage(pdfDoc, tenant.logo_url || null)

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: brandOrange,
  })

  page.drawRectangle({
    x: 46,
    y: 46,
    width: width - 92,
    height: height - 92,
    color: cream,
    borderColor: black,
    borderWidth: 3,
  })

  page.drawText(tenant.name.toUpperCase(), {
    x: 70,
    y: height - 110,
    size: 26,
    font: displayFont,
    color: black,
  })

  page.drawText('COMANDA QR DE MESA', {
    x: 70,
    y: height - 138,
    size: 12,
    font: displayFont,
    color: muted,
  })

  if (tenant.description) {
    page.drawText(tenant.description, {
      x: 70,
      y: height - 162,
      size: 11,
      font: bodyFont,
      color: muted,
    })
  }

  if (tenant.address) {
    page.drawText(tenant.address, {
      x: 70,
      y: height - 180,
      size: 10,
      font: bodyFont,
      color: muted,
    })
  }

  if (logoImage) {
    const logoSize = 58
    page.drawImage(logoImage, {
      x: width - 70 - logoSize,
      y: height - 150,
      width: logoSize,
      height: logoSize,
    })
  }

  page.drawRectangle({
    x: 70,
    y: height - 295,
    width: width - 140,
    height: 84,
    color: brandOrange,
    borderColor: black,
    borderWidth: 3,
  })

  page.drawText('ESCANEA Y ABRE ESTA MESA', {
    x: 94,
    y: height - 246,
    size: 12,
    font: displayFont,
    color: cream,
  })

  page.drawText(table.name, {
    x: 92,
    y: height - 278,
    size: 34,
    font: displayFont,
    color: cream,
  })

  const qrSize = 270
  page.drawRectangle({
    x: (width - qrSize) / 2 - 18,
    y: 250,
    width: qrSize + 36,
    height: qrSize + 36,
    color: cream,
    borderColor: black,
    borderWidth: 3,
  })

  page.drawImage(qrImage, {
    x: (width - qrSize) / 2,
    y: 268,
    width: qrSize,
    height: qrSize,
  })

  page.drawText('Ideal para imprimir y colocar sobre la mesa.', {
    x: 70,
    y: 210,
    size: 12,
    font: bodyFont,
    color: muted,
  })

  page.drawText('Si el cliente prefiere, el mozo también puede tomar el pedido desde COMANDA.', {
    x: 70,
    y: 192,
    size: 10,
    font: bodyFont,
    color: muted,
  })

  page.drawText(qrUrl, {
    x: 70,
    y: 96,
    size: 9,
    font: bodyFont,
    color: muted,
  })

  page.drawText('comandaapp', {
    x: 70,
    y: 72,
    size: 12,
    font: displayFont,
    color: black,
  })

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="qr-${table.name.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
