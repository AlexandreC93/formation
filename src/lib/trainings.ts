import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

export interface TrainingConfig {
  id: string;
  title: string;
  totalDays: number;
  segmentsPerDay: number;
  description: string;
}

export interface Segment {
  index: number;
  day: number;
  seg: number;
  slug: string;
  dayLabel: string;
  title: string;
}

export async function getTrainings(): Promise<TrainingConfig[]> {
  const trainingsDir = join(process.cwd(), 'content', 'trainings');
  try {
    const entries = await readdir(trainingsDir, { withFileTypes: true });
    const configs: TrainingConfig[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const configPath = join(trainingsDir, entry.name, 'training.config.json');
        try {
          const configContent = await readFile(configPath, 'utf-8');
          const config = JSON.parse(configContent) as TrainingConfig;
          // Sécurité : forcer l'ID à correspondre strictement au nom du dossier
          config.id = entry.name;
          configs.push(config);
        } catch {
          // Ignore if no config file or parsing error
        }
      }
    }
    return configs;
  } catch {
    return [];
  }
}

export async function getTraining(id: string): Promise<TrainingConfig | null> {
  const configPath = join(process.cwd(), 'content', 'trainings', id, 'training.config.json');
  try {
    const configContent = await readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent) as TrainingConfig;
    config.id = id;
    return config;
  } catch {
    return null;
  }
}

export async function generateSegments(config: TrainingConfig): Promise<Segment[]> {
  const segments: Segment[] = [];
  let index = 1;

  for (let day = 1; day <= config.totalDays; day++) {
    for (let seg = 1; seg <= config.segmentsPerDay; seg++) {
      const slug = `j${day}-s${seg}`;
      
      // Essayer de trouver le titre réel
      let realTitle = `Module ${index}`;
      try {
        const files = await resolveSegmentFiles(config.id, slug);
        if (files.cours.mdx) {
          // Extraire le titre du frontmatter ou du nom de fichier
          const filePath = join(process.cwd(), 'content', 'trainings', config.id, slug, files.cours.mdx);
          const raw = await readFile(filePath, 'utf-8');
          const titleMatch = raw.match(/^title:\s*(.*)$/m);
          if (titleMatch && titleMatch[1]) {
            realTitle = titleMatch[1].replace(/['"]/g, '').trim();
          } else {
            realTitle = files.cours.mdx
              .replace(/\.mdx?$/, '')
              .replace(/^\d+-/, '')
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase());
          }
        }
      } catch {
        // Fallback
      }

      segments.push({
        index,
        day,
        seg,
        slug,
        dayLabel: `Jour ${day}`,
        title: realTitle,
      });
      index++;
    }
  }

  return segments;
}

export async function getSegmentBySlug(config: TrainingConfig, dayStr: string, segStr: string): Promise<Segment | undefined> {
  const segments = await generateSegments(config);
  const slug = `j${dayStr}-s${segStr}`;
  return segments.find((s) => s.slug === slug);
}

export interface SegmentFiles {
  cours: { mdx: string | null; pdf: string | null };
  tp: { mdx: string | null; pdf: string | null };
  corrige: { mdx: string | null; pdf: string | null };
}

export async function resolveSegmentFiles(trainingId: string, segmentSlug: string): Promise<SegmentFiles> {
  const segmentPath = join(process.cwd(), 'content', 'trainings', trainingId, segmentSlug);
  const result: SegmentFiles = {
    cours: { mdx: null, pdf: null },
    tp: { mdx: null, pdf: null },
    corrige: { mdx: null, pdf: null },
  };

  try {
    const { readdir } = await import('fs/promises');
    const files = await readdir(segmentPath);

    for (const file of files) {
      const lower = file.toLowerCase();
      const isMdx = lower.endsWith('.mdx');
      const isPdf = lower.endsWith('.pdf');
      
      if (!isMdx && !isPdf) continue;

      let type: 'cours' | 'tp' | 'corrige' = 'cours';
      
      if (lower.includes('tp') || lower.includes('exercice') || lower.includes('lab')) {
        type = 'tp';
      } else if (lower.includes('corrige') || lower.includes('solution') || lower.includes('correction')) {
        type = 'corrige';
      }

      if (isMdx && !result[type].mdx) {
        result[type].mdx = file;
      } else if (isPdf && !result[type].pdf) {
        result[type].pdf = file;
      }
    }
  } catch {
    // Dossier inexistant ou erreur de lecture
  }

  return result;
}

export async function checkPdfExists(
  trainingId: string,
  segmentSlug: string,
  type: 'cours' | 'tp' | 'corrige'
): Promise<boolean> {
  const files = await resolveSegmentFiles(trainingId, segmentSlug);
  return files[type].pdf !== null;
}
