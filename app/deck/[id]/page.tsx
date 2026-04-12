import { redirect } from 'next/navigation';

/** Legacy URL: deck hub now lives under /studio/deck */
export default async function DeckLegacyRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/studio/deck/${id}`);
}
