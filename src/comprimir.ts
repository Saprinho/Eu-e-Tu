export async function comprimir(f: File, max = 800): Promise<Blob> {
  const img = await createImageBitmap(f)
  const escala = Math.min(1, max / Math.max(img.width, img.height))
  const w = Math.round(img.width * escala)
  const h = Math.round(img.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(img, 0, 0, w, h)
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/jpeg', 0.8)
  )
}
