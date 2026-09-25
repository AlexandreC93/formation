import { compileMDX } from 'next-mdx-remote/rsc';
import { readFile } from 'fs/promises';
import { join } from 'path';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import { resolveSegmentFiles, sanitizeTitle } from './trainings';
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
  const cleanName = filename
    .replace(/\.(cours|tp|corrige)\.mdx?$/, '')
    .replace(/\.pdf$/, '')
    .replace(/\.mdx?$/, '')
    .replace(/^(\d+[\s_-]*)+/, '')
    .replace(/[-_]/g, ' ');
  return sanitizeTitle(cleanName);
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
    // Extraction du titre H1 si présent (mais sans le supprimer du flux)
    const h1Match = raw.match(/^\s*#\s+(.*)$/m);
    if (h1Match && h1Match[1]) {
      h1Title = sanitizeTitle(h1Match[1]);
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
