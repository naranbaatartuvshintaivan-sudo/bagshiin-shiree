import { Fragment } from "react"

type LessonContentProps = {
  content: string
}

export function LessonContent({ content }: LessonContentProps) {
  const blocks = splitBlocks(content)
  return (
    <div className="prose-content space-y-4 text-[var(--text-ink)] leading-relaxed">
      {blocks.map((b, i) => renderBlock(b, i))}
    </div>
  )
}

type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "list"; items: string[]; ordered: boolean }
  | { kind: "code"; text: string }
  | { kind: "paragraph"; text: string }

function splitBlocks(raw: string): Block[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("```")) {
      const buf: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i])
        i++
      }
      if (i < lines.length) i++
      blocks.push({ kind: "code", text: buf.join("\n") })
      continue
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
      })
      i++
      continue
    }

    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      const ordered = /^\s*\d+\.\s+/.test(line)
      const re = ordered ? /^\s*\d+\.\s+(.*)$/ : /^\s*[-*]\s+(.*)$/
      while (i < lines.length && re.test(lines[i])) {
        const m = re.exec(lines[i])!
        items.push(m[1])
        i++
      }
      blocks.push({ kind: "list", items, ordered })
      continue
    }

    if (line.trim() === "") {
      i++
      continue
    }

    const buf: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    if (buf.length) blocks.push({ kind: "paragraph", text: buf.join("\n") })
  }
  return blocks
}

function renderBlock(b: Block, key: number) {
  if (b.kind === "heading") {
    if (b.level === 1)
      return (
        <h1 key={key} className="text-2xl font-bold text-primary-deep">
          {renderInline(b.text)}
        </h1>
      )
    if (b.level === 2)
      return (
        <h2 key={key} className="text-xl font-semibold text-primary-deep">
          {renderInline(b.text)}
        </h2>
      )
    return (
      <h3 key={key} className="text-lg font-semibold text-primary-deep">
        {renderInline(b.text)}
      </h3>
    )
  }
  if (b.kind === "list") {
    const items = b.items.map((t, i) => (
      <li key={i} className="ml-1">
        {renderInline(t)}
      </li>
    ))
    return b.ordered ? (
      <ol key={key} className="list-decimal space-y-1 pl-6">
        {items}
      </ol>
    ) : (
      <ul key={key} className="list-disc space-y-1 pl-6">
        {items}
      </ul>
    )
  }
  if (b.kind === "code") {
    return (
      <pre
        key={key}
        className="overflow-x-auto rounded-lg bg-primary-soft/30 p-3 text-xs text-primary-deep"
      >
        <code>{b.text}</code>
      </pre>
    )
  }
  return (
    <p key={key} className="whitespace-pre-wrap">
      {renderInline(b.text)}
    </p>
  )
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let rest = text
  let k = 0
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/
  while (rest.length) {
    const m = re.exec(rest)
    if (!m) {
      parts.push(<Fragment key={k++}>{rest}</Fragment>)
      break
    }
    if (m.index > 0) parts.push(<Fragment key={k++}>{rest.slice(0, m.index)}</Fragment>)
    if (m[2]) parts.push(<strong key={k++}>{m[2]}</strong>)
    else if (m[3]) parts.push(<em key={k++}>{m[3]}</em>)
    else if (m[4])
      parts.push(
        <code key={k++} className="rounded bg-primary-soft/40 px-1 py-0.5 text-[0.85em]">
          {m[4]}
        </code>
      )
    else if (m[5] && m[6])
      parts.push(
        <a
          key={k++}
          href={m[6]}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          {m[5]}
        </a>
      )
    rest = rest.slice(m.index + m[0].length)
  }
  return parts
}
