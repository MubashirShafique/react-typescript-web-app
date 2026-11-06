import { useEffect, useRef, useState } from 'react'
import type { ReactNode, FormEvent } from 'react'
import { profile, skills, projects, tech } from './data'
import Chatbot from './Chatbot'

function useTyping(words: string[]) {
  const [text, setText] = useState('')
  useEffect(() => {
    let w = 0
    let c = 0
    let del = false
    let t: number
    const tick = () => {
      const word = words[w]
      c += del ? -1 : 1
      setText(word.slice(0, c))
      let delay = del ? 40 : 80
      if (!del && c === word.length) {
        del = true
        delay = 1400
      } else if (del && c === 0) {
        del = false
        w = (w + 1) % words.length
        delay = 300
      }
      t = window.setTimeout(tick, delay)
    }
    t = window.setTimeout(tick, 300)
    return () => clearTimeout(t)
  }, [words])
  return text
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${show ? 'show' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

const links = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

export default function App() {
  const typed = useTyping(profile.roles)
  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0)
    }
    const onMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`
      }
      document.querySelectorAll<HTMLElement>('.card').forEach((c) => {
        const r = c.getBoundingClientRect()
        c.style.setProperty('--mx', `${e.clientX - r.left}px`)
        c.style.setProperty('--my', `${e.clientY - r.top}px`)
      })
    }
    window.addEventListener('scroll', onScroll)
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const subject = encodeURIComponent(`Portfolio message from ${f.get('name')}`)
    const body = encodeURIComponent(`${f.get('message')}\n\nFrom: ${f.get('email')}`)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
  }

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} />
      <div className="glow" ref={glowRef} />
      <div className="bg">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="grid-bg" />
      </div>

      <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <a href="#home" className="logo">
          {profile.name}<span>.</span>
        </a>
        <nav className={open ? 'open' : ''}>
          {links.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#contact" className="nav-cta" onClick={() => setOpen(false)}>Hire Me</a>
        </nav>
        <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? '✕' : '☰'}
        </button>
      </header>

      <main>
        <section id="home" className="hero">
          <span className="badge">
            <i /> Open to opportunities
          </span>
          <p className="hi">Hi, I'm</p>
          <h1>
            <span className="grad">{profile.name}</span>
          </h1>
          <h2 className="typing">
            {typed}
            <i className="cursor" />
          </h2>
          <p className="tagline">{profile.tagline}</p>
          <div className="cta">
            <a href="#projects" className="btn primary">View My Work</a>
            <a href="#contact" className="btn ghost">Get in Touch</a>
          </div>
          <div className="social">
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a href={`mailto:${profile.email}`}>Email</a>
          </div>
          <a href="#about" className="scroll-hint" aria-label="Scroll down">
            <span />
          </a>
        </section>

        <div className="marquee">
          <div className="track">
            {[...tech, ...tech].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        <section id="about" className="section">
          <Reveal>
            <p className="eyebrow">Who I am</p>
            <h3 className="title">About Me</h3>
          </Reveal>
          <div className="about">
            <Reveal delay={100}>
              <p className="about-text">{profile.about}</p>
              <p className="edu">🎓 {profile.education}</p>
            </Reveal>
            <Reveal delay={200}>
              <div className="stats">
                {profile.stats.map((s) => (
                  <div className="stat card" key={s.label}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="skills" className="section">
          <Reveal>
            <p className="eyebrow">What I do</p>
            <h3 className="title">Skills &amp; Expertise</h3>
          </Reveal>
          <div className="grid">
            {skills.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="card skill">
                  <div className="icon">{s.icon}</div>
                  <h4>{s.title}</h4>
                  <ul>
                    {s.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="projects" className="section">
          <Reveal>
            <p className="eyebrow">Selected work</p>
            <h3 className="title">Featured Projects</h3>
          </Reveal>
          <div className="grid projects">
            {projects.map((p, i) => (
              <Reveal key={p.title} delay={i * 120}>
                <a className="card project" href={p.link} target="_blank" rel="noreferrer">
                  <span className="num">0{i + 1}</span>
                  <h4>{p.title}</h4>
                  <p>{p.desc}</p>
                  <div className="tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <em>View project →</em>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="contact" className="section">
          <Reveal>
            <p className="eyebrow">Let's talk</p>
            <h3 className="title">Get in Touch</h3>
          </Reveal>
          <Reveal delay={100}>
            <form className="card form" onSubmit={onSubmit}>
              <input name="name" placeholder="Your name" required />
              <input name="email" type="email" placeholder="Your email" required />
              <textarea name="message" placeholder="Tell me about your project..." rows={5} required />
              <button className="btn primary" type="submit">Send Message</button>
            </form>
          </Reveal>
        </section>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} {profile.name}. Built with React &amp; TypeScript.
      </footer>

      <Chatbot />
    </>
  )
}