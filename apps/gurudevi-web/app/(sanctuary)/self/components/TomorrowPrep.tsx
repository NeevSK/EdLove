import React from 'react';
import { TodoView } from '../../components/TodoView';

interface TomorrowPrepProps {
  userId?: string;
}

export function TomorrowPrep({ userId = 'guest-explorer' }: Readonly<TomorrowPrepProps>) {
  return (
    <section aria-label="Tomorrow Preparation Practice">
      <TodoView
        listName="Tomorrow Prep"
        displayTitle="Tomorrow's Preparation"
        userId={userId}
      />
    </section>
  );
}
