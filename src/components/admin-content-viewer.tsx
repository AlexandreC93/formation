'use client';

import { useState, useTransition, useCallback } from 'react';
import {
  BookOpen,
  FlaskConical,
  CheckCircle,
  ChevronRight,
  Pencil,
  Save,
  RotateCcw,
  Eye,
  Loader2,
  AlertTriangle,
  X,
  Database,
} from 'lucide-react';
import type { TrainingConfig } from '@/lib/trainings';
import type { MdxType } from '@/lib/mdx';
import { saveMdxOverride, resetMdxToOriginal } from '@/app/actions/editor';

interface Segment {
  index: number;
  day: number;
  seg: number;
  slug: string;
  dayLabel: string;
  title: string;
}

interface ContentData {
  rawContent: string | null;
  isOverridden: boolean;
  error: string | null;
  title: string | null;
}

interface ViewerState {
  trainingId: string;
  segment: Segment;
  tab: MdxType;
  data: ContentData;
}

interface AdminContentViewerProps {
  trainings: TrainingConfig[];
}

const TAB_CFG: Record<MdxType, { label: string; icon: typeof BookOpen; color: string }> = {
  cours: { label: 'Cours', icon: BookOpen, color: 'text-indigo-500' },
  tp: { label: 'TP', icon: FlaskConical, color: 'text-amber-500' },
  corrige: { label: 'Corrigé', icon: CheckCircle, color: 'text-emerald-500' },
};

export function AdminContentViewer({ trainings }: AdminContentViewerProps) {
  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saveMessage, setSaveMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [previewKey, setPreviewKey] = useState(0); // force iframe reload

  const loadTraining = useCallback(async (trainingId: string) => {
    setSelectedTraining(trainingId);
    setViewer(null);
    setIsEditing(false);
    setSaveMessage(null);
    setSegments([]);
    setLoadingSegments(true);
    try {
      const res = await fetch(`/api/admin/segments?trainingId=${encodeURIComponent(trainingId)}`);
      const data = await res.json();
      setSegments(data.segments ?? []);
    } catch {
      setSegments([]);
    } finally {
      setLoadingSegments(false);
    }
  }, []);

  const loadContent = useCallback(async (trainingId: string, segment: Segment, tab: MdxType) => {
    setLoadingContent(true);
    setIsEditing(false);
    setSaveMessage(null);
    try {
      const res = await fetch(
        `/api/admin/content?trainingId=${encodeURIComponent(trainingId)}&slug=${encodeURIComponent(segment.slug)}&tab=${tab}`
      );
      const data: ContentData = await res.json();
      setViewer({ trainingId, segment, tab, data });
      setPreviewKey(k => k + 1);
    } catch {
      setViewer({
        trainingId, segment, tab,
        data: { rawContent: null, isOverridden: false, error: 'Erreur de chargement.', title: null },
      });
    } finally {
      setLoadingContent(false);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(viewer?.data?.rawContent ?? '');
    setSaveMessage(null);
  };

  const handleSave = () => {
    if (!viewer) return;
    startTransition(async () => {
      const result = await saveMdxOverride(viewer.trainingId, viewer.segment.slug, viewer.tab, editContent);
      if (result.success) {
        setSaveMessage({ type: 'ok', text: 'Sauvegardé dans Redis ✓ — Les apprenants voient cette version.' });
        // Refresh metadata
        const res = await fetch(
          `/api/admin/content?trainingId=${encodeURIComponent(viewer.trainingId)}&slug=${encodeURIComponent(viewer.segment.slug)}&tab=${viewer.tab}`
        );
        const data: ContentData = await res.json();
        setViewer(v => v ? { ...v, data } : v);
        setIsEditing(false);
        setPreviewKey(k => k + 1);
      } else {
        setSaveMessage({ type: 'err', text: result.error ?? 'Erreur lors de la sauvegarde.' });
      }
    });
  };

  const handleReset = () => {
    if (!viewer) return;
    startTransition(async () => {
      const result = await resetMdxToOriginal(viewer.trainingId, viewer.segment.slug, viewer.tab);
      if (result.success) {
        setSaveMessage({ type: 'ok', text: 'Fichier original restauré depuis le dépôt ✓' });
        const res = await fetch(
          `/api/admin/content?trainingId=${encodeURIComponent(viewer.trainingId)}&slug=${encodeURIComponent(viewer.segment.slug)}&tab=${viewer.tab}`
        );
        const data: ContentData = await res.json();
        setViewer(v => v ? { ...v, data } : v);
        setIsEditing(false);
        setPreviewKey(k => k + 1);
      } else {
        setSaveMessage({ type: 'err', text: result.error ?? 'Erreur.' });
      }
    });
  };

  const training = trainings.find(t => t.id === selectedTraining);
  const days = training ? Array.from({ length: training.totalDays }, (_, i) => i + 1) : [];

  const previewUrl = viewer
    ? `/admin/preview/${encodeURIComponent(viewer.trainingId)}/${encodeURIComponent(viewer.segment.slug)}/${viewer.tab}`
    : null;

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
        <Eye className="w-5 h-5 text-indigo-500" />
        <div>
          <h2 className="text-slate-900 dark:text-white font-semibold text-sm">
            Visualiseur &amp; Éditeur de Contenus
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Accès total formateur — Les modifications sont sauvegardées dans Redis et servent de surcharge au dépôt Git
          </p>
        </div>
      </div>

      <div className="flex" style={{ minHeight: '680px' }}>

        {/* Sidebar */}
        <div className="w-60 shrink-0 border-r border-slate-200 dark:border-white/5 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30 flex flex-col">
          <div className="p-3 border-b border-slate-200 dark:border-white/5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Formation</p>
            {trainings.map(t => (
              <button
                key={t.id}
                onClick={() => loadTraining(t.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-0.5 ${
                  selectedTraining === t.id
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingSegments && (
              <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement…
              </div>
            )}
            {!loadingSegments && segments.length > 0 && days.map(day => (
              <div key={day}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1">
                  Jour {day}
                </p>
                {segments.filter(s => s.day === day).map(seg => (
                  <button
                    key={seg.slug}
                    onClick={() => loadContent(selectedTraining!, seg, 'cours')}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors text-xs ${
                      viewer?.segment.slug === seg.slug && viewer.trainingId === selectedTraining
                        ? 'bg-white dark:bg-white/5 text-slate-900 dark:text-white font-semibold border-r-2 border-indigo-500'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <ChevronRight className="w-3 h-3 shrink-0 opacity-40" />
                    <span className="truncate">{seg.title}</span>
                  </button>
                ))}
              </div>
            ))}
            {!loadingSegments && !selectedTraining && (
              <p className="px-4 py-6 text-center text-xs text-slate-400">
                Sélectionnez une formation
              </p>
            )}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {!viewer && !loadingContent && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <Eye className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Cliquez sur un segment pour l&apos;afficher</p>
              </div>
            </div>
          )}

          {loadingContent && (
            <div className="flex-1 flex items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Chargement…</span>
            </div>
          )}

          {viewer && !loadingContent && (
            <>
              {/* Toolbar */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between gap-3 flex-wrap bg-white/50 dark:bg-slate-900/20 shrink-0">
                <div className="flex items-center gap-1">
                  {(Object.keys(TAB_CFG) as MdxType[]).map(tab => {
                    const { label, icon: Icon, color } = TAB_CFG[tab];
                    return (
                      <button
                        key={tab}
                        onClick={() => loadContent(viewer.trainingId, viewer.segment, tab)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          viewer.tab === tab
                            ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                        {label}
                      </button>
                    );
                  })}
                  {viewer.data.isOverridden && (
                    <span className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 whitespace-nowrap">
                      <Database className="w-2.5 h-2.5" />
                      Surchargé (Redis)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); setSaveMessage(null); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/10 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Annuler
                      </button>
                      {viewer.data.isOverridden && (
                        <button
                          onClick={handleReset}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                          Restaurer l&apos;original
                        </button>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-colors disabled:opacity-50"
                      >
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {isPending ? 'Sauvegarde…' : 'Sauvegarder dans Redis'}
                      </button>
                    </>
                  ) : (
                    <>
                      {viewer.data.isOverridden && (
                        <button
                          onClick={handleReset}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                          Restaurer l&apos;original
                        </button>
                      )}
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Éditer ce document
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Feedback */}
              {saveMessage && (
                <div className={`mx-4 mt-3 shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  saveMessage.type === 'ok'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                }`}>
                  {saveMessage.type === 'ok' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  {saveMessage.text}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
                {isEditing ? (
                  <div className="p-4 h-full flex flex-col gap-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                      Éditez le Markdown/MDX ci-dessous. La version sauvegardée dans Redis remplace le fichier du dépôt pour tous les apprenants.
                    </p>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      className="flex-1 w-full font-mono text-sm bg-slate-950 text-slate-100 p-4 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                ) : viewer.data.error && !previewUrl ? (
                  <div className="p-5">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-700 dark:text-amber-300 font-semibold text-sm">Document indisponible</p>
                        <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">{viewer.data.error}</p>
                        <p className="text-slate-500 text-xs mt-2">Vous pouvez créer ce document en cliquant sur &quot;Éditer ce document&quot;.</p>
                      </div>
                    </div>
                  </div>
                ) : previewUrl ? (
                  <iframe
                    key={`${previewUrl}-${previewKey}`}
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Prévisualisation du document"
                    style={{ minHeight: '560px' }}
                  />
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
