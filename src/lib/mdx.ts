import { compileMDX } from 'next-mdx-remote/rsc';
import { readFile } from 'fs/promises';
import { join } from 'path';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import { resolveSegmentFiles } from './trainings';
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

function cleanFilenameToTitle(filename: string): string {
  return filename
    .replace(/\.(cours|tp|corrige)\.mdx?$/, '')
    .replace(/\.pdf$/, '')
    .replace(/\.mdx?$/, '') // Enlever l'extension
    .replace(/^(\d+[\s_-]*)+/, '') // Enlever le préfixe (ex: '01 - ' ou '01_')
    .replace(/[-_]/g, ' ')  // Remplacer tirets par espaces
    .trim();
}

export async function loadMDX(
  trainingId: string,
  segmentSlug: string,
  type: MdxType
): Promise<MdxResult | null> {
  const files = await resolveSegmentFiles(trainingId, segmentSlug);
  const mdxFilename = files[type].mdx;

  if (!mdxFilename) {
    return null;
  }

  const filePath = join(
    process.cwd(),
    'content',
    'trainings',
    trainingId,
    segmentSlug,
    mdxFilename
  );

  try {
    let raw = await readFile(filePath, 'utf-8');
    
    let h1Title = '';
    // Extraction et suppression du titre H1 si présent
    const h1Match = raw.match(/^\s*#\s+(.*)$/m);
    if (h1Match && h1Match[1]) {
      h1Title = h1Match[1].trim();
      raw = raw.replace(/^\s*#\s+.*$/m, '');
    }

    const { content, frontmatter } = await compileMDX<Record<string, unknown>>({
      source: raw,
      options: {
        parseFrontmatter: true,
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode as never, rehypePrettyCodeOptions]],
          format: 'md',
        },
      },
    });
    
    // Assurer qu'il y a un titre
    if (h1Title) {
      frontmatter.title = h1Title;
    } else if (!frontmatter.title) {
      frontmatter.title = cleanFilenameToTitle(mdxFilename);
    }

    return { content, frontmatter };
  } catch (error) {
    console.error(`[MDX Render Error on ${segmentSlug} - ${type}]:`, error);
    return {
      error: `Erreur de compilation du document : ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    };
  }
}
