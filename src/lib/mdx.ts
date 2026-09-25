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

// Nettoie un nom de fichier pour en faire un titre (ex: "01-haute-disponibilite.mdx" -> "Haute Disponibilite")
function cleanFilenameToTitle(filename: string): string {
  return filename
    .replace(/\.mdx?$/, '') // Enlever l'extension
    .replace(/^\d+-/, '')   // Enlever le préfixe numérique
    .replace(/[-_]/g, ' ')  // Remplacer tirets par espaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Majuscules
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
    const raw = await readFile(filePath, 'utf-8');
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
    if (!frontmatter.title) {
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
