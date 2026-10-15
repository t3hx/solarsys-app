/**
 * @module windows/richText
 * @description Markdown (descriptions et faits des corps) → HTML assaini.
 */
import DOMPurify from 'dompurify'
import { marked } from 'marked'

export function renderRichText(markdown: string): string {
  const html = marked.parse(markdown, { async: false })
  return DOMPurify.sanitize(html, { ADD_ATTR: ['style'] })
}
