'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ProfileHeaderProps {
  avatar: string;
  gradient: string;
  firstName: string;
  username?: string;
  displayName: string;
  childName: string | null;
  grade: string | null;
  motivationalBanner?: React.ReactNode;
}

/** The profile card — gradient header, avatar, chips, optional motivational banner. */
export function ProfileHeader({
  avatar,
  gradient,
  firstName,
  username,
  displayName,
  childName,
  grade,
  motivationalBanner,
}: ProfileHeaderProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-lab-line/80 bg-white/95 shadow-md">
      {/* gradient strip */}
      <div className={`h-24 bg-gradient-to-r ${gradient} sm:h-28`} />

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        {/* avatar + name */}
        <div className="-mt-9 mb-3 flex items-end gap-3 sm:-mt-10 sm:gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-white text-3xl shadow-lg sm:h-20 sm:w-20 sm:text-4xl">
            {avatar}
          </div>
          <div className="mb-1 min-w-0">
            <h1 className="font-display text-xl font-bold tracking-tight text-lab-teal-dark sm:text-2xl">
              {firstName}
            </h1>
            {username && (
              <p className="truncate text-sm font-semibold text-lab-teal">@{username}</p>
            )}
          </div>
        </div>

        {/* chips */}
        <div className="flex flex-wrap gap-2 text-sm">
          {childName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 font-medium text-violet-700">
              🧒 {childName}
            </span>
          )}
          {grade && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
              📚 Grade {grade}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
            👤 {displayName || 'Learner'}
          </span>
        </div>

        {/* optional motivational banner (zero-state only) */}
        {motivationalBanner}

        <Link
          href="/studio"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-lab-teal hover:text-lab-teal-dark hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to studio
        </Link>
      </div>
    </div>
  );
}
