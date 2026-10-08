import { useEffect, useRef, useState } from 'react'
import { templates, uploadBoxes } from './templates'
import { drawMeme } from './meme'
import './App.css'

const defaultStyle = {
  font: 'Impact, Arial Black, sans-serif',
  fontSize: 32,
  color: '#000000',
  outline: false,
  uppercase: true,
}
const initialTemplate = templates[0]

function AnimatedImage({ src, alt, motion, className = '' }) {
  const [still, setStill] = useState('')
  useEffect(() => {
    const image = new Image()
    let active = true
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      canvas.getContext('2d').drawImage(image, 0, 0)
      if (active) setStill(canvas.toDataURL())
    }
    image.src = src
    return () => {
      active = false
    }
  }, [src])
  return (
    <img
      className={className}
      src={motion ? src : still || undefined}
      alt={alt}
    />
  )
}

function App() {
  const [template, setTemplate] = useState(initialTemplate)
  const [captions, setCaptions] = useState(initialTemplate.captions)
  const [style, setStyle] = useState(defaultStyle)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [motion, setMotion] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [loadedImage, setLoadedImage] = useState({
    src: '',
    image: null,
    error: '',
  })
  const ready = loadedImage.src === template.src && !!loadedImage.image
  const error = loadedImage.src === template.src ? loadedImage.error : ''
  const [notice, setNotice] = useState('')
  const [saved, setSaved] = useState([])
  const [gallery, setGallery] = useState(false)
  const canvasRef = useRef(null)
  const uploadRef = useRef(null)
  const uploadUrlRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const image = new Image()
    image.onload = () => {
      if (!cancelled) setLoadedImage({ src: template.src, image, error: '' })
    }
    image.onerror = () => {
      if (!cancelled)
        setLoadedImage({
          src: template.src,
          image: null,
          error:
            'This image could not load. Pick another template or upload an image.',
        })
    }
    image.src = template.src
    return () => {
      cancelled = true
    }
  }, [template.src])
  useEffect(() => {
    if (ready)
      drawMeme(canvasRef.current, loadedImage.image, template, captions, style)
  }, [ready, loadedImage, template, captions, style])
  useEffect(
    () => () => {
      if (uploadUrlRef.current) URL.revokeObjectURL(uploadUrlRef.current)
    },
    [],
  )

  function choose(next) {
    setTemplate(next)
    setCaptions([...next.captions])
    setStyle({
      ...defaultStyle,
      color: next.color || '#ffffff',
      outline: next.outline ?? true,
    })
    setNotice('')
  }
  function surprise() {
    const alternatives = templates.filter((item) => item.id !== template.id)
    choose(alternatives[Math.floor(Math.random() * alternatives.length)])
    setNotice('A fresh template. A fresh terrible joke. Ur welcome :p')
  }
  async function upload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setNotice('Please choose a JPG, PNG or WebP image.')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      setNotice('That image is too big. Please keep it under 15 MB.')
      return
    }
    const url = URL.createObjectURL(file)
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      if (image.naturalWidth * image.naturalHeight > 40_000_000)
        throw new Error('size')
      if (uploadUrlRef.current) URL.revokeObjectURL(uploadUrlRef.current)
      uploadUrlRef.current = url
      choose({
        id: 'upload',
        name: file.name,
        src: url,
        captions: ['Your top text here', 'Your bottom text here'],
        boxes: uploadBoxes,
      })
      setNotice('Your image is ready. Make it legendary.')
    } catch (err) {
      URL.revokeObjectURL(url)
      setNotice(
        err.message === 'size'
          ? 'Please use an image smaller than 40 megapixels.'
          : 'We could not read that image. Try another JPG, PNG or WebP.',
      )
    }
  }
  function download() {
    if (!ready || error) return
    const name = template.name
    const snapshot = canvasRef.current.toDataURL()
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        setNotice('The download failed. Please try again.')
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-meme.png`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setSaved((items) =>
        [{ id: crypto.randomUUID(), name, src: snapshot }, ...items].slice(
          0,
          6,
        ),
      )
      setNotice(
        'Downloaded! Your meme is also in "My memes" for this visit. <3',
      )
    }, 'image/png')
  }
  const filtered = templates.filter(
    (item) =>
      (category === 'All' || item.category === category) &&
      item.name.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <>
      <div className="web-status">
        <span>★ BEST VIEWED WITH A SENSE OF HUMOR ★</span>
        <button onClick={() => setMotion(!motion)} aria-pressed={motion}>
          {motion ? 'Ⅱ Pause GIFs' : '▶ Play GIFs'}
        </button>
      </div>
      <main className="newsletter">
        <header className="newsletter-title">
          <span className="title-star">✦</span>
          <h1>
            THE EXTREMELY OFFICIAL
            <br className="mobile-break" /> MEME MACHINE!!! :p
          </h1>
          <span className="title-star">✦</span>
        </header>
        <div className="dance-title">
          ♪♫ OFFICIAL NEVER-ENDING HAMPSTER DANCE ♫♪
        </div>
        <div className="hamster-banner">
          <div className="hamsters">
            {Array.from({ length: 8 }, (_, index) => (
              <AnimatedImage
                key={index}
                src={`${import.meta.env.BASE_URL}assets/hamster.gif`}
                alt={index === 0 ? 'Original 1997 dancing hamster' : ''}
                motion={motion}
              />
            ))}
          </div>
          <p>THEY ARE DANCING BECAUSE UR ABOUT TO MAKE A VERY GOOD MEME...</p>
        </div>
        <section className="greeting">
          <div className="welcome-stamp">
            ★ EST. 1999* &nbsp; / &nbsp; 100% FREE &nbsp; / &nbsp; 0% SERIOUS ★
          </div>
          <h2>OMG WAZZUP MEME LORDZ?!?!?!</h2>
          <p>
            ur receiving this highly exclusive invitation to{' '}
            <strong>make the internet worse.</strong> &lt;3
          </p>
          <p>
            pick a classic. add ur genius words. download teh masterpiece.
            <br />
            <span className="pink-text">
              no signups. no watermarks. just immaculate 90s energy.
            </span>
          </p>
        </section>
        <section className="instructions" aria-labelledby="instructions-title">
          <h2 id="instructions-title">
            🚨 EXTREMELY IMPORTANT INSTRUCTIONS 🚨
          </h2>
          <ol>
            <li>
              <strong>Pick ur template.</strong>
              <span>The classics never die.</span>
            </li>
            <li>
              <strong>Type something funny.</strong>
              <span>Or just something. We don't judge.</span>
            </li>
            <li>
              <strong>SMASH download.</strong>
              <span>Inflict it on the group chat.</span>
            </li>
          </ol>
        </section>
        <section className="machine" aria-labelledby="machine-title">
          <div className="section-title">
            <h2 id="machine-title">★ TEH MEME-MAKING ZONE ★</h2>
            <span>UNDER CONSTRUCTION? NEVER.</span>
          </div>
          <div className="template-heading">
            <h3>01. PICK A CLASSIC</h3>
            <button className="small-button" onClick={surprise}>
              ⚄ Surprise me
            </button>
          </div>
          <div className="template-tools">
            <div className="category-tabs" aria-label="Template category">
              {['All', 'Classics', 'Reactions'].map((item) => (
                <button
                  key={item}
                  aria-pressed={category === item && !gallery}
                  onClick={() => {
                    setCategory(item)
                    setGallery(false)
                  }}
                >
                  {item}
                </button>
              ))}
              <button aria-pressed={gallery} onClick={() => setGallery(true)}>
                My memes ({saved.length})
              </button>
            </div>
            <label className="search">
              <span className="sr-only">Search meme templates</span>
              <span aria-hidden="true">⌕</span>
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setGallery(false)
                }}
                placeholder="Find ur favorite..."
                type="search"
              />
            </label>
          </div>
          {gallery ? (
            <div className="saved-grid">
              {saved.length ? (
                saved.map((item) => (
                  <a
                    className="template-card"
                    key={item.id}
                    href={item.src}
                    download="my-meme.png"
                  >
                    <img
                      src={item.src}
                      alt={`Download your ${item.name} meme`}
                    />
                    <span>{item.name}</span>
                  </a>
                ))
              ) : (
                <p className="empty-state">
                  No masterpieces yet! Download a meme and it will appear here
                  for this visit.
                </p>
              )}
            </div>
          ) : (
            <div className="template-grid">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  className={`template-card ${template.id === item.id ? 'selected' : ''}`}
                  onClick={() => choose(item)}
                  aria-pressed={template.id === item.id}
                  title={item.name}
                >
                  <img src={item.src} alt="" loading="lazy" />
                  <span>{item.short}</span>
                  {template.id === item.id && (
                    <span className="selected-mark" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              ))}
              {!filtered.length && (
                <p className="empty-state">
                  No templates found. Try "Drake" or upload your own below!
                </p>
              )}
            </div>
          )}
          <div className="workspace">
            <section className="preview-panel" aria-labelledby="preview-title">
              <div className="panel-heading">
                <h3 id="preview-title">02. BEHOLD UR MASTERPIECE</h3>
                <span className="live-label">● LIVE</span>
              </div>
              <div className="canvas-stage">
                {error ? (
                  <p className="image-error" role="alert">
                    {error}
                  </p>
                ) : (
                  <>
                    <canvas
                      ref={canvasRef}
                      role="img"
                      aria-label={`Meme preview: ${template.name}. ${captions.join('. ')}`}
                      hidden={!ready}
                    />
                    {!ready && <p>Loading teh masterpiece...</p>}
                  </>
                )}
              </div>
              <div className="preview-meta">
                <span>{template.name}</span>
                <span>PNG • NO WATERMARK</span>
              </div>
            </section>
            <section className="caption-panel" aria-labelledby="caption-title">
              <div className="panel-heading">
                <h3 id="caption-title">03. ADD UR GENIUS</h3>
                <span>✎</span>
              </div>
              <div className="caption-controls">
                {captions.map((caption, index) => (
                  <label
                    className="caption-field"
                    key={`${template.id}-${index}`}
                  >
                    <span>
                      {captions.length === 2
                        ? index === 0
                          ? 'TOP / FIRST TEXT'
                          : 'BOTTOM / SECOND TEXT'
                        : `TEXT ${index + 1}`}
                      <small>{caption.length}/200</small>
                    </span>
                    <textarea
                      value={caption}
                      maxLength={200}
                      rows={2}
                      onChange={(event) =>
                        setCaptions((values) =>
                          values.map((value, i) =>
                            i === index ? event.target.value : value,
                          ),
                        )
                      }
                      placeholder="ur hilarious words go here..."
                    />
                  </label>
                ))}
                <div className="style-label">~ MAKE IT UR OWN ~</div>
                <label className="font-field">
                  Font
                  <select
                    aria-label="Font"
                    value={style.font}
                    onChange={(event) =>
                      setStyle({ ...style, font: event.target.value })
                    }
                  >
                    <option value="Impact, Arial Black, sans-serif">
                      Classic meme (Impact)
                    </option>
                    <option value="'Comic Sans MS', cursive">
                      Comic Sans, obviously
                    </option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Courier New', monospace">
                      Terminal / Courier
                    </option>
                  </select>
                </label>
                <label className="size-field">
                  <span>
                    Text size <strong>{style.fontSize}px</strong>
                  </span>
                  <input
                    aria-label="Text size"
                    type="range"
                    min="16"
                    max="64"
                    value={style.fontSize}
                    onChange={(event) =>
                      setStyle({
                        ...style,
                        fontSize: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <div className="color-field">
                  <span>Text color</span>
                  <div>
                    {[
                      '#ffffff',
                      '#000000',
                      '#ffff00',
                      '#ff00ff',
                      '#00ffff',
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`${{ '#ffffff': 'White', '#000000': 'Black', '#ffff00': 'Yellow', '#ff00ff': 'Magenta', '#00ffff': 'Cyan' }[color]} text`}
                        aria-pressed={style.color === color}
                        style={{ backgroundColor: color }}
                        onClick={() => setStyle({ ...style, color })}
                      >
                        {style.color === color ? (
                          <span
                            style={{
                              color:
                                color === '#000000' ? '#ffffff' : '#000000',
                            }}
                          >
                            ✓
                          </span>
                        ) : (
                          ''
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="check-fields">
                  <label>
                    <input
                      type="checkbox"
                      checked={style.uppercase}
                      onChange={(event) =>
                        setStyle({ ...style, uppercase: event.target.checked })
                      }
                    />{' '}
                    ALL CAPS
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={style.outline}
                      onChange={(event) =>
                        setStyle({ ...style, outline: event.target.checked })
                      }
                    />{' '}
                    Text outline
                  </label>
                </div>
                <div className="editor-actions">
                  <button
                    className="small-button"
                    onClick={() => choose(template)}
                  >
                    ↺ Reset
                  </button>
                  <button
                    className="small-button"
                    onClick={() => uploadRef.current.click()}
                  >
                    ↑ Upload ur own
                  </button>
                  <input
                    className="sr-only"
                    ref={uploadRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={upload}
                    aria-label="Upload your own image"
                  />
                </div>
                <p className="upload-hint">
                  JPG, PNG or WebP · up to 15 MB
                  <br />
                  Your image stays in your browser.
                </p>
              </div>
            </section>
          </div>
        </section>
        <section className="download-section">
          <div className="baby-card">
            <AnimatedImage
              src={`${import.meta.env.BASE_URL}assets/dancing-baby.gif`}
              alt="Original classic dancing baby GIF"
              motion={motion}
            />
            <p>
              THIS BABY HAS ALREADY
              <br />
              MADE A MEME.
              <br />
              HAVE YOU??
            </p>
          </div>
          <div className="download-copy">
            <h2>DO NOT IGNORE THIS BUTTON!!</h2>
            <p>ur masterpiece deserves to leave this website.</p>
            <button
              className="download-button"
              disabled={!ready || !!error}
              onClick={download}
            >
              <AnimatedImage
                className="button-gif"
                src={`${import.meta.env.BASE_URL}assets/retro-button.gif`}
                alt=""
                motion={motion}
              />
              <span>
                CLICK HERE TO
                <br />
                DOWNLOAD UR MEME ↓
              </span>
            </button>
            <p className="download-detail">
              Full-resolution PNG. Yours to keep. Forever and ever.
            </p>
            <p className="notice" aria-live="polite" role="status">
              {notice}
            </p>
          </div>
        </section>
        <p className="testimonial">
          “i made one meme and now i'm the funniest person in the group chat :D”
          <small>— anonymous and definitely real internet user</small>
        </p>
        <section className="breaking-news" aria-labelledby="news-title">
          <h2 id="news-title">★☆ BREAKING NEWZ 24/8 ☆★</h2>
          <div className="news-grid">
            <article>
              <span>WORLD NEWS</span>
              <h3>LOCAL HAMSTERS REFUSE TO STOP DANCING</h3>
              <p>“the vibes are simply too good,” says spokesperson</p>
            </article>
            <article>
              <span>SHOCKING NEW STUDY</span>
              <h3>COMIC SANS MAKES MEMES 67% MORE POWERFUL</h3>
              <p>the other 21% remain under investigation</p>
            </article>
            <article>
              <span>DEVELOPING STORY</span>
              <h3>“JUST ONE MORE MEME” ENTERS ITS THIRD HOUR</h3>
              <p>productivity unavailable for comment</p>
            </article>
            <article>
              <span>EXCLUSIVE</span>
              <h3>YOUR GROUP CHAT IS NOT READY FOR THIS</h3>
              <p>scientists recommend clicking download immediately</p>
            </article>
          </div>
        </section>
        <footer className="computer-footer">
          &lt;&lt;&lt; SENT FROM MEMEBOOK &gt;&gt;&gt;
          <br />
          <span>Please respond using extremely funny pictures.</span>
          <a
            href="https://github.com/mathnasiumlakeland/email"
            target="_blank"
            rel="noreferrer"
          >
            Original email vibes courtesy of Max ♡
          </a>
        </footer>
      </main>
      <p className="footnote">
        * uhhh, yeahh... it's not really 1999. but spiritually? absolutely.
        <br />
        Template images via{' '}
        <a
          href="https://imgflip.com/memetemplates"
          target="_blank"
          rel="noreferrer"
        >
          Imgflip
        </a>{' '}
        · GIFs from the original newsletter · Made with React + Vite
      </p>
    </>
  )
}
export default App
