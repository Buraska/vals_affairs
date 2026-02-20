import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

type LexicalData = {
  root?: {
    type: string
    children: unknown[]
    [k: string]: unknown
  }
  [k: string]: unknown
}

export function lexicalToHtml(data: LexicalData | null | undefined): string {
  if (!data?.root?.children?.length) return ''
  return convertLexicalToHTML({
    data: data as Parameters<typeof convertLexicalToHTML>[0]['data'],
    disableContainer: true,
  })
}
