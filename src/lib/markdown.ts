import { remark } from "remark";
import remarkHtml from "remark-html";

/**
 * Renders a markdown string to an HTML string.
 * Uses remark + remark-html with sanitize disabled so that
 * any existing HTML in the markdown is preserved.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  return result.toString();
}
