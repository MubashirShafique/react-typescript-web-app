import { useEffect, useRef, useState } from 'react'
import { profile, skills, projects } from './data'

type Msg = { from: 'bot' | 'user'; text: string }

const suggestions = [
  'What are your skills?',
  'Show me your projects',
  'Who are you?',
  'How can I contact you?',
]

function reply(q: string): string {
  const s = q.toLowerCase()
  const has = (...w: string[]) => w.some((x) => s.includes(x))

  if (/\b(hi|hello|hey|salam)\b/.test(s)) {
    return `Hi! I'm ${profile.name}'s assistant. Ask me about his skills, projects, education or how to contact him.`
  }

  const project = projects.find((p) => has(...p.keywords))
  if (project) {
    return `${project.title}: ${project.desc}\nTech: ${project.tags.join(', ')}.`
  }

  const skill = skills.find(
    (k) => s.includes(k.title.toLowerCase()) || k.items.some((i) => s.includes(i.toLowerCase())),
  )
  if (skill) {
    return `${skill.title} skills: ${skill.items.join(', ')}.`
  }

  if (has('project', 'built', 'work', 'portfolio')) {
    return `Featured projects:\n${projects.map((p) => `• ${p.title}: ${p.desc}`).join('\n')}`
  }
  if (has('skill', 'tech', 'stack', 'know', 'language', 'tool')) {
    return `Skills:\n${skills.map((k) => `• ${k.title}: ${k.items.join(', ')}`).join('\n')}`
  }
  if (has('who', 'about', 'yourself', 'introduce')) {
    return profile.about
  }
  if (has('study', 'education', 'university', 'degree', 'college', 'student')) {
    return profile.education
  }
  if (has('contact', 'email', 'reach', 'mail')) {
    return `Email: ${profile.email}\nGitHub: ${profile.github}\nLinkedIn: ${profile.linkedin}`
  }
  if (has('github', 'code', 'repo')) {
    return `GitHub: ${profile.github}`
  }
  if (has('linkedin')) {
    return `LinkedIn: ${profile.linkedin}`
  }
  if (has('hire', 'available', 'freelance', 'intern', 'job', 'opportunit')) {
    return profile.availability
  }
  if (has('thank')) {
    return "You're welcome! Anything else you'd like to know?"
  }
  return "I can answer questions about skills, projects, education and contact details. Try one of the suggestions below."
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'bot', text: `Hi! I'm ${profile.name}'s AI assistant. Ask me anything about his skills or projects.` },
  ])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs, typing, open])

  const send = (text: string) => {
    const q = text.trim()
    if (!q || typing) return
    setMsgs((m) => [...m, { from: 'user', text: q }])
    setInput('')
    setTyping(true)
    window.setTimeout(() => {
      setMsgs((m) => [...m, { from: 'bot', text: reply(q) }])
      setTyping(false)
    }, 700)
  }

  return (
    <>
      <button className="chat-fab" aria-label="Open chat" onClick={() => setOpen(!open)}>
        {open ? '✕' : '💬'}
        {!open && <span className="ping" />}
      </button>

      <div className={`chat-win ${open ? 'open' : ''}`}>
        <div className="chat-head">
          <div className="avatar">AI</div>
          <div>
            <strong>Portfolio Assistant</strong>
            <small>● Online</small>
          </div>
        </div>

        <div className="chat-body">
          {msgs.map((m, i) => (
            <div key={i} className={`bubble ${m.from}`}>
              {m.text}
            </div>
          ))}
          {typing && (
            <div className="bubble bot dots">
              <span /><span /><span />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="chips">
          {suggestions.map((s) => (
            <button key={s} onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>

        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about skills, projects..." />
          <button type="submit" aria-label="Send">➤</button>
        </form>
      </div>
    </>
  )
}