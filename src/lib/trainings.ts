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

export function generateSegments(config: TrainingConfig): Segment[] {
  const segments: Segment[] = [];
  let index = 1;

  for (let day = 1; day <= config.totalDays; day++) {
    for (let seg = 1; seg <= config.segmentsPerDay; seg++) {
      segments.push({
        index,
        day,
        seg,
        slug: `j${day}-s${seg}`,
        dayLabel: `Jour ${day}`,
        title: `Module ${index}`, // This will be overriden by MDX frontmatter if needed, or we just rely on generic title here and fetch MDX for real title if necessary.
      });
      index++;
    }
  }

  return segments;
}

export function getSegmentBySlug(config: TrainingConfig, dayStr: string, segStr: string): Segment | undefined {
  const segments = generateSegments(config);
  const slug = `j${dayStr}-s${segStr}`;
  return segments.find((s) => s.slug === slug);
}

export async function checkPdfExists(
  trainingId: string,
  segmentSlug: string,
  type: 'cours' | 'tp' | 'corrige'
): Promise<boolean> {
  const filePath = join(process.cwd(), 'content', 'trainings', trainingId, segmentSlug, `${type}.pdf`);
  try {
    const { access } = await import('fs/promises');
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
