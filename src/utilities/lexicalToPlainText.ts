type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
  [k: string]: unknown
}

function collectText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.children)) {
    return node.children.map(collectText).join('')
  }
  return ''
}

/**
 * Извлекает обычный текст из Lexical richText (для превью, мета и т.д.)
 */
export function lexicalToPlainText(data: { root?: { children?: LexicalNode[] } } | null | undefined): string {
  const children = data?.root?.children
  if (!Array.isArray(children)) return ''
  return children.map(collectText).join(' ').replace(/\s+/g, ' ').trim()
}
