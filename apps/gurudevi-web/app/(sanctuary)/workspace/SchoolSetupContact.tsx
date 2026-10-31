'use client';

import { useState } from 'react';

export function SchoolSetupContact({ phone }: Readonly<{ phone: string }>) {
  const [principal, setPrincipal] = useState('');
  const [school, setSchool] = useState('');
  const [contact, setContact] = useState('');
  const [opened, setOpened] = useState(false);
  const message = [
    'Hello, I would like help connecting a school to Gurudevi.',
    principal.trim() && `Principal: ${principal.trim()}`,
    school.trim() && `School: ${school.trim()}`,
    contact.trim() && `Contact number: ${contact.trim()}`,
  ].filter(Boolean).join('\n');
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <details>
      <summary>Contact us on WhatsApp</summary>
      <p>Share any details you wish. You can review and send the message in WhatsApp.</p>
      <label>Principal’s name <input value={principal} onChange={(event) => setPrincipal(event.target.value)} maxLength={120} /></label>
      <label>School name <input value={school} onChange={(event) => setSchool(event.target.value)} maxLength={160} /></label>
      <label>Contact number <input type="tel" value={contact} onChange={(event) => setContact(event.target.value)} maxLength={40} /></label>
      <p><a href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpened(true)}>Open WhatsApp</a></p>
      {opened && <p role="status">Send the message in WhatsApp to contact us.</p>}
    </details>
  );
}
