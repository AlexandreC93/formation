export interface Segment {
  index: number; // 1 à 20
  day: number;   // 1 à 5
  seg: number;   // 1 à 4
  slug: string;  // ex: 'j1-s1'
  dayLabel: string;
  title: string;
}

export const SEGMENTS: Segment[] = [
  // Jour 1 — Administration Système Linux
  { index: 1,  day: 1, seg: 1, slug: 'j1-s1', dayLabel: 'Jour 1', title: 'Architecture Linux & Arborescence' },
  { index: 2,  day: 1, seg: 2, slug: 'j1-s2', dayLabel: 'Jour 1', title: 'Gestion des Utilisateurs & Permissions' },
  { index: 3,  day: 1, seg: 3, slug: 'j1-s3', dayLabel: 'Jour 1', title: 'Processus & Supervision Système' },
  { index: 4,  day: 1, seg: 4, slug: 'j1-s4', dayLabel: 'Jour 1', title: 'Gestion des Paquets & Compilation' },
  // Jour 2 — Réseau & Sécurité Périmétrique
  { index: 5,  day: 2, seg: 1, slug: 'j2-s1', dayLabel: 'Jour 2', title: 'Modèle TCP/IP & Outils Réseau' },
  { index: 6,  day: 2, seg: 2, slug: 'j2-s2', dayLabel: 'Jour 2', title: 'Firewall iptables & nftables' },
  { index: 7,  day: 2, seg: 3, slug: 'j2-s3', dayLabel: 'Jour 2', title: 'VPN & Tunnels Chiffrés (OpenVPN/WireGuard)' },
  { index: 8,  day: 2, seg: 4, slug: 'j2-s4', dayLabel: 'Jour 2', title: 'Analyse de Trafic & Détection d\'Intrusion' },
  // Jour 3 — Cryptographie Appliquée
  { index: 9,  day: 3, seg: 1, slug: 'j3-s1', dayLabel: 'Jour 3', title: 'Fondamentaux Cryptographiques' },
  { index: 10, day: 3, seg: 2, slug: 'j3-s2', dayLabel: 'Jour 3', title: 'PKI & Gestion des Certificats X.509' },
  { index: 11, day: 3, seg: 3, slug: 'j3-s3', dayLabel: 'Jour 3', title: 'SSH Avancé & Authentification par Clé' },
  { index: 12, day: 3, seg: 4, slug: 'j3-s4', dayLabel: 'Jour 3', title: 'Chiffrement de Partitions & Données au Repos' },
  // Jour 4 — Durcissement & Conformité
  { index: 13, day: 4, seg: 1, slug: 'j4-s1', dayLabel: 'Jour 4', title: 'Durcissement SELinux & AppArmor' },
  { index: 14, day: 4, seg: 2, slug: 'j4-s2', dayLabel: 'Jour 4', title: 'Audit Système & Journalisation (auditd)' },
  { index: 15, day: 4, seg: 3, slug: 'j4-s3', dayLabel: 'Jour 4', title: 'Politiques de Sécurité CIS Benchmark' },
  { index: 16, day: 4, seg: 4, slug: 'j4-s4', dayLabel: 'Jour 4', title: 'Scan de Vulnérabilités (OpenVAS/Nessus)' },
  // Jour 5 — Conteneurisation & Infrastructure
  { index: 17, day: 5, seg: 1, slug: 'j5-s1', dayLabel: 'Jour 5', title: 'Docker & Sécurité des Conteneurs' },
  { index: 18, day: 5, seg: 2, slug: 'j5-s2', dayLabel: 'Jour 5', title: 'Orchestration Kubernetes (k8s Basics)' },
  { index: 19, day: 5, seg: 3, slug: 'j5-s3', dayLabel: 'Jour 5', title: 'CI/CD Sécurisé & DevSecOps' },
  { index: 20, day: 5, seg: 4, slug: 'j5-s4', dayLabel: 'Jour 5', title: 'Réponse à Incident & Forensique Linux' },
];

export function getSegmentBySlug(day: string, seg: string): Segment | undefined {
  const slug = `j${day}-s${seg}`;
  return SEGMENTS.find((s) => s.slug === slug);
}

export function getSegmentByIndex(index: number): Segment | undefined {
  return SEGMENTS.find((s) => s.index === index);
}

export function getSegmentsByDay(day: number): Segment[] {
  return SEGMENTS.filter((s) => s.day === day);
}

export const DAYS = [1, 2, 3, 4, 5];
export const DAY_TITLES: Record<number, string> = {
  1: 'Administration Système Linux',
  2: 'Réseau & Sécurité Périmétrique',
  3: 'Cryptographie Appliquée',
  4: 'Durcissement & Conformité',
  5: 'Conteneurisation & Infrastructure',
};
