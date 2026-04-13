'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, CheckCircle2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateFlashcardsModal } from '@/components/studio/CreateFlashcardsModal';
import { UploadLoader } from '@/components/ui/CueMathLoader';
import type { CardCountPreset } from '@/lib/gemini';

const MAX_BYTES = 12 * 1024 * 1024;

/** Translate scary API errors into child-friendly messages */
function friendlyError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('429') || lower.includes('quota') || lower.includes('rate'))
    return 'Oops! Our brain helper is taking a little break. Try again in a minute! ☕';
  if (lower.includes('timeout') || lower.includes('timed out'))
    return 'That took too long — our helpers got tired! Try a smaller PDF or try again. ⏳';
  if (lower.includes('connection') || lower.includes('network') || lower.includes('fetch'))
    return 'Hmm, we lost connection for a second. Check your internet and try again! 📡';
  if (lower.includes('too few') || lower.includes('not enough') || lower.includes('extract enough') || lower.includes('extracted only') || lower.includes('image-only') || lower.includes('image only'))
    return `We couldn’t find enough text in that PDF. Try a different file with more words! 📝 (${raw.slice(0, 120)})`;
  if (lower.includes('encrypted') || lower.includes('could not read'))
    return 'This PDF is locked or has only pictures. Try one with regular text! 🔒';
  if (lower.includes('sign in') || lower.includes('onboarding') || lower.includes('401'))
    return 'You need to sign in first! Go to the home page and click Get Started. 🚀';
  if (lower.includes('json') || lower.includes('generation failed'))
    return 'Our card maker got a little confused. Try uploading again! 🔄';
  // fallback — still keep it friendly
  return 'Something didn\u2019t work quite right. Give it another try! 💪';
}

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

    const stages = ['Uploading PDF…', 'Extracting text…', 'Redirecting to your deck…'];
    let i = 0;
    const tick = setInterval(() => {
      i = Math.min(i + 1, stages.length - 1);
      setProgress(stages[i]);
    }, 1500);

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

        // Phase 1 done - deck created, cards ready in background.
        onSuccess?.();
        router.push(`/studio/deck/${data.deck.id}?preset=${preset}`);
      } catch (err) {
        const raw = err instanceof Error ? err.message : 'Upload failed';
        setError(friendlyError(raw));
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
          <UploadLoader stage={progress} fileName={uploadLabel ?? undefined} />
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
        <div className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5 text-center">
          <p className="text-3xl">😅</p>
          <p className="mt-2 text-base font-bold text-amber-800">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="mt-3 rounded-full bg-amber-200 px-4 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-300 transition"
          >
            Okay, got it!
          </button>
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
