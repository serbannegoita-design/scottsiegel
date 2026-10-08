import { test, expect } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'

test('loads the newsletter skeleton and all local assets without runtime errors', async ({
  page,
}) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`)
  })
  await page.goto('./')
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.locator('.template-card')).toHaveCount(12)
  await expect(page.locator('.hamsters img')).toHaveCount(8)
  await page.locator('.computer-footer').scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      page
        .locator('img')
        .evaluateAll((images) =>
          images.every((image) => image.complete && image.naturalWidth > 0),
        ),
    )
    .toBe(true)
  expect(errors).toEqual([])
  await page.screenshot({
    path: 'test-results/review-desktop.png',
    fullPage: true,
  })
})

test('template search, filters and every caption layout work', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('searchbox').fill('drake')
  await expect(page.locator('.template-card')).toHaveCount(1)
  await page.getByRole('searchbox').fill('no such meme')
  await expect(
    page.getByText('No templates found.', { exact: false }),
  ).toBeVisible()
  await page.getByRole('searchbox').fill('')
  await page.getByRole('button', { name: 'Classics', exact: true }).click()
  await expect(page.locator('.template-card')).toHaveCount(6)
  await page.getByRole('button', { name: 'All', exact: true }).click()
  const cases = [
    ['Drake', 2],
    ['Distracted Boyfriend', 3],
    ['Two Buttons', 3],
    ['Disaster Girl', 2],
    ['Woman Yelling at Cat', 2],
    ['Change My Mind', 1],
    ['One Does Not Simply', 2],
    ['Ancient Aliens', 2],
    ['Expanding Brain', 4],
    ['Doge vs. Cheems', 4],
    ['Mocking SpongeBob', 2],
    ['Epic Handshake', 3],
  ]
  for (const [name, count] of cases) {
    await page.getByRole('button', { name, exact: true }).click()
    await expect(page.locator('textarea')).toHaveCount(count)
    await expect(page.locator('canvas')).toBeVisible()
    const pixels = await page
      .locator('canvas')
      .evaluate((canvas) => canvas.toDataURL())
    expect(pixels.length).toBeGreaterThan(10000)
    await expect(
      page.locator('.template-card.selected > span:not(.selected-mark)'),
    ).toHaveText(name)
  }
})

test('caption and style changes render immediately; reset and shuffle work', async ({
  page,
}) => {
  await page.goto('./')
  await expect(page.locator('canvas')).toBeVisible()
  const before = await page
    .locator('canvas')
    .evaluate((canvas) => canvas.toDataURL())
  await page.locator('textarea').first().fill('This is my review meme')
  await expect
    .poll(() => page.locator('canvas').evaluate((canvas) => canvas.toDataURL()))
    .not.toBe(before)
  await page.getByRole('button', { name: 'Magenta text', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Magenta text', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page
    .getByLabel('Font', { exact: true })
    .selectOption('Arial, sans-serif')
  await page.getByLabel('Text outline', { exact: true }).check()
  await page.getByLabel('ALL CAPS', { exact: true }).uncheck()
  await page.getByRole('button', { name: 'Reset', exact: false }).click()
  await expect(page.locator('textarea').first()).toHaveValue(
    'Another boring email',
  )
  await expect(page.locator('canvas')).toHaveAttribute('aria-label', /Drake/)
  await page.getByRole('button', { name: 'Surprise me', exact: false }).click()
  await expect(page.locator('canvas')).not.toHaveAttribute(
    'aria-label',
    /Drake/,
  )
})

test('PNG download contains full-resolution pixels and populates recent memes', async ({
  page,
}) => {
  await page.goto('./')
  await expect(page.locator('canvas')).toBeVisible()
  const downloading = page.waitForEvent('download')
  await page
    .getByRole('button', { name: /CLICK HERE TO DOWNLOAD UR MEME/ })
    .click()
  const downloaded = await downloading
  expect(downloaded.suggestedFilename()).toBe('drake-hotline-bling-meme.png')
  const bytes = await fs.readFile(await downloaded.path())
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10])
  expect(bytes.readUInt32BE(16)).toBe(1200)
  expect(bytes.readUInt32BE(20)).toBe(1200)
  await page.getByRole('button', { name: 'My memes (1)', exact: true }).click()
  await expect(page.locator('.saved-grid a')).toHaveCount(1)
  await expect(page.getByRole('status')).toContainText('Downloaded!')
})

test('image uploads are validated and can be captioned and exported', async ({
  page,
}) => {
  await page.goto('./')
  const fileInput = page.getByLabel('Upload your own image', { exact: true })
  await fileInput.setInputFiles({
    name: 'broken.png',
    mimeType: 'image/png',
    buffer: Buffer.from('not an image'),
  })
  await expect(page.getByRole('status')).toContainText('could not read')
  await fileInput.setInputFiles({
    name: 'test.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg/>'),
  })
  await expect(page.getByRole('status')).toContainText('JPG, PNG or WebP')
  await fileInput.setInputFiles(path.resolve('public/assets/97984.jpg'))
  await expect(page.locator('canvas')).toHaveAttribute(
    'aria-label',
    /97984.jpg/,
  )
  await expect(page.locator('canvas')).toBeVisible()
  await expect(page.locator('textarea')).toHaveCount(2)
  await page.locator('textarea').first().fill('My own image')
  const downloading = page.waitForEvent('download')
  await page
    .getByRole('button', { name: /CLICK HERE TO DOWNLOAD UR MEME/ })
    .click()
  const bytes = await fs.readFile(await (await downloading).path())
  expect(bytes.readUInt32BE(16)).toBe(500)
  expect(bytes.readUInt32BE(20)).toBe(375)
})

test('GIF pause uses static frames and reduced motion is respected', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto('./')
  await page.getByRole('button', { name: /Pause GIFs/ }).click()
  await expect
    .poll(() => page.locator('.hamsters img').first().getAttribute('src'))
    .toMatch(/^data:image\/png/)
  await expect
    .poll(() => page.locator('.baby-card img').getAttribute('src'))
    .toMatch(/^data:image\/png/)
  await page.getByRole('button', { name: /Play GIFs/ }).click()
  await expect(page.locator('.hamsters img').first()).toHaveAttribute(
    'src',
    /\/assets\/hamster\.gif$/,
  )
  const reduced = await browser.newContext({ reducedMotion: 'reduce' })
  const reducedPage = await reduced.newPage()
  await reducedPage.goto(baseURL)
  await expect(
    reducedPage.getByRole('button', { name: /Play GIFs/ }),
  ).toBeVisible()
  await expect
    .poll(() =>
      reducedPage.locator('.hamsters img').first().getAttribute('src'),
    )
    .toMatch(/^data:image\/png/)
  await reduced.close()
})

test('mobile layout fits the viewport and preserves the generator', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('./')
  await expect(page.locator('canvas')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page
    .getByRole('button', { name: 'Expanding Brain', exact: true })
    .click()
  await expect(page.locator('textarea')).toHaveCount(4)
  await expect(page.locator('canvas')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.getByRole('button', { name: 'Drake', exact: true }).click()
  await expect(page.locator('canvas')).toBeVisible()
  await page.screenshot({
    path: 'test-results/review-mobile.png',
    fullPage: true,
  })
})
