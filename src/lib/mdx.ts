import { compileMDX } from 'next-mdx-remote/rsc';
import { readFile } from 'fs/promises';
import { join } from 'path';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import type { JSX } from 'react';

export type MdxType = 'cours' | 'tp' | 'corrige';

export interface MdxResult {
  content?: JSX.Element;
  frontmatter?: Record<string, unknown>;
  error?: string;
}

const rehypePrettyCodeOptions = {
  theme: 'one-dark-pro',
  keepBackground: true,
  defaultLang: 'bash',
};

export async function loadMDX(
  trainingId: string,
  segmentSlug: string,
  type: MdxType
): Promise<MdxResult | null> {
  const filePath = join(
    process.cwd(),
    'content',
    'trainings',
    trainingId,
    segmentSlug,
    `${type}.mdx`
  );
  try {
    const { existsSync } = await import('fs');
    if (!existsSync(filePath)) {
      return null;
    }
    const raw = await readFile(filePath, 'utf-8');
    const { content, frontmatter } = await compileMDX<Record<string, unknown>>({
      source: raw,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode as never, rehypePrettyCodeOptions]],
          format: 'md', // force markdown parsing to avoid JSX tags crashes like <IP_SERVEUR>
        },
      },
    });
    return { content, frontmatter };
  } catch (error) {
    console.error(`[MDX Render Error on ${segmentSlug} - ${type}]:`, error);
    return {
      error: `Erreur de compilation du document : ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    };
  }
}
