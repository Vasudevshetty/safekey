import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';

export async function processMarkdown(content: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: {
        className: ['heading-link'],
        ariaLabel: 'Link to this heading',
      },
    })
    .use(rehypeHighlight, {
      detect: true,
      subset: ['javascript', 'typescript', 'bash', 'json', 'yaml', 'markdown'],
    })
    .use(rehypeStringify);

  const result = await processor.process(content);
  return result.toString();
}
