import { remark } from "remark";
import remarkHtml from "remark-html";

export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkHtml)
    .process(markdown);
  return result.toString();
}
