import { compileMDX } from 'next-mdx-remote/rsc';
import { readFile } from 'fs/promises';
import { join } from 'path';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import type { JSX } from 'react';

export type MdxType = 'cours' | 'tp' | 'corrige';

export interface MdxResult {
  content: JSX.Element;
  frontmatter: Record<string, unknown>;
}

const rehypePrettyCodeOptions = {
  theme: 'one-dark-pro',
  keepBackground: true,
  defaultLang: 'bash',
};

export async function loadMDX(
  segmentSlug: string,
  type: MdxType
): Promise<MdxResult | null> {
  const filePath = join(
    process.cwd(),
    'content',
    segmentSlug,
    `${type}.mdx`
  );
  try {
    const raw = await readFile(filePath, 'utf-8');
    const { content, frontmatter } = await compileMDX<Record<string, unknown>>({
      source: raw,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode as never, rehypePrettyCodeOptions]],
        },
      },
    });
    return { content, frontmatter };
  } catch {
    return null;
  }
}
