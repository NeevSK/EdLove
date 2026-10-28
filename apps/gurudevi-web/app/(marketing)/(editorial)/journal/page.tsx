import type { Metadata } from 'next';
import { journalEntries } from '../content';
import { JournalClient } from './JournalClient';

export const metadata: Metadata = {
  title: 'Journal | Gurudevi',
  description:
    'Stories, practice notes, and reflections for the people who make learning possible.',
};

export default function JournalPage() {
  const entries = [...journalEntries].sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return <JournalClient entries={entries} />;
}
