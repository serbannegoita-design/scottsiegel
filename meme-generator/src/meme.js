function wrapText(ctx, text, maxWidth) {
  const lines = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(/\s+/)) {
      if (!word) continue
      if (ctx.measureText(word).width > maxWidth) {
        if (line) lines.push(line)
        line = ''
        for (const character of word) {
          if (line && ctx.measureText(line + character).width > maxWidth) {
            lines.push(line)
            line = ''
          }
          line += character
        }
      } else if (line && ctx.measureText(`${line} ${word}`).width > maxWidth) {
        lines.push(line)
        line = word
      } else line = line ? `${line} ${word}` : word
    }
    lines.push(line)
  }
  return lines
}
export function drawMeme(canvas, image, template, captions, style) {
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.fillStyle = style.color
  ctx.strokeStyle = style.color === '#000000' ? '#ffffff' : '#000000'
  template.boxes.forEach(([x, y, width, height], index) => {
    const text = style.uppercase
      ? (captions[index] || '').toUpperCase()
      : captions[index] || ''
    const boxWidth = width * canvas.width,
      boxHeight = height * canvas.height
    let fontSize = (style.fontSize * canvas.width) / 600,
      lines
    do {
      ctx.font = `bold ${fontSize}px ${style.font}`
      lines = wrapText(ctx, text, boxWidth - 8)
      if (lines.length * fontSize * 1.2 <= boxHeight) break
      fontSize -= 1
    } while (fontSize > 8)
    const lineHeight = fontSize * 1.2
    const centerX = (x + width / 2) * canvas.width,
      centerY = (y + height / 2) * canvas.height
    ctx.lineWidth = Math.max(2, fontSize / 13)
    ctx.save()
    ctx.beginPath()
    ctx.rect(x * canvas.width, y * canvas.height, boxWidth, boxHeight)
    ctx.clip()
    lines.forEach((line, lineIndex) => {
      const lineY = centerY + (lineIndex - (lines.length - 1) / 2) * lineHeight
      if (style.outline) ctx.strokeText(line, centerX, lineY, boxWidth)
      ctx.fillText(line, centerX, lineY, boxWidth)
    })
    ctx.restore()
  })
}
