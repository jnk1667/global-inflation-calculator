"use client"
import type React from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n")
    const elements: React.JSX.Element[] = []
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Handle headings
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={key++} className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
            {parseInlineFormatting(line.substring(3))}
          </h2>,
        )
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={key++} className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-white">
            {parseInlineFormatting(line.substring(4))}
          </h3>,
        )
      } else if (line.trim() === "") {
        // Empty line - add spacing
        elements.push(<div key={key++} className="h-4" />)
      } else {
        // Regular paragraph
        elements.push(
          <p key={key++} className="mb-4 leading-relaxed">
            {parseInlineFormatting(line)}
          </p>,
        )
      }
    }

    return elements
  }

  const parseInlineFormatting = (text: string) => {
    const parts: (string | React.JSX.Element)[] = []
    let currentIndex = 0
    let key = 0

    // Regex patterns for bold, italic, and underline
    // **bold** or __bold__ for bold
    // *italic* or _italic_ for italic (but not if it's part of __)
    // ~~underline~~ for underline
    const patterns = [
      { regex: /\*\*(.+?)\*\*/g, tag: "strong" }, // **bold**
      { regex: /__(.+?)__/g, tag: "u" }, // __underline__
      { regex: /\*(.+?)\*/g, tag: "em" }, // *italic*
      { regex: /_(.+?)_/g, tag: "em" }, // _italic_
      { regex: /~~(.+?)~~/g, tag: "u" }, // ~~underline~~
    ]

    // Find all matches for all patterns
    const matches: Array<{ start: number; end: number; content: string; tag: string }> = []

    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex)
      let match

      while ((match = regex.exec(text)) !== null) {
        // Skip if this match overlaps with an existing match
        const overlaps = matches.some(
          (m) =>
            (match.index >= m.start && match.index < m.end) || (regex.lastIndex > m.start && regex.lastIndex <= m.end),
        )

        if (!overlaps) {
          matches.push({
            start: match.index,
            end: regex.lastIndex,
            content: match[1],
            tag: pattern.tag,
          })
        }
      }
    }

    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start)

    // Build the result
    for (const match of matches) {
      // Add text before the match
      if (currentIndex < match.start) {
        parts.push(text.substring(currentIndex, match.start))
      }

      // Add the formatted element
      const Tag = match.tag as keyof React.JSX.IntrinsicElements
      parts.push(
        <Tag key={key++} className={match.tag === "strong" ? "font-bold" : match.tag === "u" ? "underline" : "italic"}>
          {match.content}
        </Tag>,
      )

      currentIndex = match.end
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex))
    }

    return parts.length > 0 ? parts : text
  }

  return <div className={className}>{parseMarkdown(content)}</div>
}
