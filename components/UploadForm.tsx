'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const MAX_BYTES = 12 * 1024 * 1024;

interface UploadFormProps {
  onSuccess?: () => void;
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (!dropped) return;
    const err = validateFile(dropped);
    if (err) {
      setError(err);
      return;
    }
    setFile(dropped);
    setError(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const err = validateFile(selected);
    if (err) {
      setError(err);
      return;
    }
    setFile(selected);
    setError(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const stages = [
      'Extracting text from PDF…',
      'Analyzing content with AI…',
      'Generating flashcards…',
      'Saving to database…',
    ];
    let stageIndex = 0;
    setProgress(stages[stageIndex]);
    const interval = setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, stages.length - 1);
      setProgress(stages[stageIndex]);
    }, 8000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      setProgress('Extracting text from PDF…');
      const res = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
      const data = await res.json();
      if (res.status === 401) {
        throw new Error(
          data.error ||
            'Please complete Get started on the home page, then open Your studio to upload PDFs.'
        );
      }
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const count = data.deck?.flashcards?.length ?? 0;
      const title = data.deck?.title ?? 'your deck';
      setSuccess(`${count} flashcards created from "${title}"`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        onSuccess?.();
        router.push(`/studio/deck/${data.deck.id}`);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setProgress('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <p className="text-xs text-slate-500 mb-3 text-center">
        PDFs are parsed on this server with unpdf (pdfjs-dist based), then flashcards are generated with CuemathsAI and stored in
        PostgreSQL (Neon).
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200
          ${file ? 'border-slate-300 bg-slate-50 cursor-default' : 'cursor-pointer'}
          ${isDragging ? 'border-blue-400 bg-blue-50 scale-[1.01]' : !file ? 'border-slate-200 hover:border-blue-300 hover:bg-slate-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-slate-800 truncate">{file.name}</p>
              <p className="text-sm text-slate-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-slate-700 mb-1">Drop your PDF here</p>
            <p className="text-sm text-slate-400">
              or <span className="text-blue-500 font-medium">browse files</span> &middot; Max 12MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}

      {file && !isUploading && (
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-5 w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <Upload className="w-4 h-4" />
          Generate Flashcards
        </button>
      )}

      {isUploading && (
        <div className="mt-5 w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-3 shadow-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">{progress || 'Processing…'}</span>
        </div>
      )}
    </div>
  );
}
