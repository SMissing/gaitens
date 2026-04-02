interface BlogBodyProps {
  text: string
}

/** Renders plain-text body with preserved line breaks (React escapes HTML). */
export function BlogBody({ text }: BlogBodyProps) {
  return (
    <div className="text-foreground/90 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
      {text}
    </div>
  )
}
