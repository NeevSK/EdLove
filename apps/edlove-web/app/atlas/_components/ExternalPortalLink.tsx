import React from 'react';

export function ExternalPortalLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="pt-1 flex justify-end">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-[#a85022] hover:underline font-semibold flex items-center gap-1"
      >
        <span>{label}</span>
        <span>↗</span>
      </a>
    </div>
  );
}
