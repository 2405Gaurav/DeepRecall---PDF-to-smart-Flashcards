'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateFlashcardsModal } from '@/components/studio/CreateFlashcardsModal';
import type { CardCountPreset } from '@/lib/gemini';

const MAX_BYTES = 12 * 1024 * 1024;

interface StudioUploadFormProps {
  onSuccess?: () => void;
}

export function StudioUploadForm({ onSuccess }: StudioUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const validateFile = (f: File): string | null => {
    if (f.type !== 'application/pdf') return 'Only PDF files are supported';
    if (f.size > MAX_BYTES) return 'File size must be under 12MB';
    return null;
  };

  const pickFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
    setError(null);
    setModalOpen(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    pickFile(dropped);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    pickFile(selected);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setModalOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleModalConfirm = (preset: CardCountPreset) => {
    const f = file;
    if (!f) return;

    setModalOpen(false);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setUploadLabel(f.name);
    setIsUploading(true);
    setError(null);
    setSuccess(null);
    setProgress('Reading PDF…');

    const stages = ['Reading PDF…', 'AI is building cards…', 'Saving your deck…'];
    let i = 0;
    const tick = setInterval(() => {
      i = Math.min(i + 1, stages.length - 1);
      setProgress(stages[i]);
    }, 7000);

    const run = async () => {
      try {
        const formData = new FormData();
        formData.append('file', f);
        formData.append('cardPreset', preset);
        const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
        const data = await res.json();
        if (res.status === 401) {
          throw new Error(
            data.error || 'Please finish Get started on the home page, then open Studio again.'
          );
        }
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        const count = data.deck?.flashcards?.length ?? 0;
        const title = data.deck?.title ?? 'your deck';
        setSuccess(`${count} cards from “${title}”`);

        onSuccess?.();
        router.push(`/studio/deck/${data.deck.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        clearInterval(tick);
        setIsUploading(false);
        setProgress('');
        setUploadLabel(null);
      }
    };

    void run();
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && !isUploading && fileInputRef.current?.click()}
        className={cnShell(isDragging, !!file, isUploading)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {file && !isUploading ? (
          <div className="flex items-center gap-4 px-1 sm:px-2">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-100">
              <FileText className="h-6 w-6 text-violet-700" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-base font-semibold text-zinc-900">{file.name}</p>
              <p className="text-sm text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-zinc-100"
            >
              <X className="h-5 w-5 text-zinc-500" />
            </button>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2 px-2 py-4 text-center sm:py-5">
            <div className="flex items-center gap-3 text-base font-medium text-violet-800">
              <Loader2 className="h-6 w-6 shrink-0 animate-spin" />
              <span>{progress || 'Working…'}</span>
            </div>
            {uploadLabel && (
              <p className="text-sm text-zinc-500">
                <span className="font-medium text-zinc-700">{uploadLabel}</span>
              </p>
            )}
            <p className="max-w-sm text-xs text-zinc-400">Keep this tab open — creation runs on the studio screen.</p>
          </div>
        ) : (
          <div className="py-4 text-center sm:py-5">
            <p className="text-base text-zinc-700 sm:text-lg">
              Drop a file or{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-sm font-bold text-zinc-800 shadow-sm"
              >
                <Upload className="h-4 w-4" />
                upload
              </button>
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-center text-sm text-zinc-500">
        <kbd className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-xs">Ctrl</kbd>{' '}
        +{' '}
        <kbd className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-xs">V</kbd>{' '}
        to paste text or links — <span className="text-zinc-400">PDF upload only for now</span>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-800">{success}</p>
        </div>
      )}

      <CreateFlashcardsModal
        open={modalOpen && !!file}
        onOpenChange={(o) => {
          setModalOpen(o);
          if (!o) setFile(null);
        }}
        fileName={file?.name ?? ''}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}

function cnShell(drag: boolean, hasFile: boolean, busy: boolean) {
  if (busy) {
    return 'cursor-wait rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/40 px-5 py-8';
  }
  if (hasFile) {
    return 'cursor-default rounded-2xl border-2 border-violet-200 bg-white px-5 py-5 shadow-sm';
  }
  return [
    'cursor-pointer rounded-2xl border-2 border-dashed px-5 py-10 transition-colors sm:py-12',
    drag ? 'border-violet-400 bg-violet-50' : 'border-violet-200 bg-white hover:border-violet-300 hover:bg-violet-50/30',
  ].join(' ');
}
