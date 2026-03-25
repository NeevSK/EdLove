import React from 'react';
import { Intent, usePermissions } from '@repo/core';
import { WebScreenHeader } from '@repo/ui';

/**
 * SelfScreenWeb — declarative entry point for the user's sanctuary on Web.
 * Resolves to the correct Vow (Student/Teacher/etc.) via ProtocolRegistry.
 */
export default function SelfScreenWeb() {
  const { can } = usePermissions();

  const getHeaderDetails = () => {
    if (can('manage', 'StudentDashboard')) {
      return { title: 'Mastery Hub', note: 'Personal Growth Stream' };
    }
    if (can('manage', 'PrincipalDashboard')) {
       return { title: 'Sadhana', note: "Principal's Inner Sanctuary" };
    }
    if (can('platform.observe.all')) {
       return { title: 'Sadhana', note: "Founder's Vision Lab" };
    }
    return { title: 'Sadhana', note: 'Personal Growth Stream' };
  };

  const { title, note } = getHeaderDetails();

  return (
    <div className="sanctuary-screen">
      <div className="sanctuary-container">
        <WebScreenHeader
          title={title}
          note={note}
          showPersonalizedGreeting
        />
        <div style={{ marginTop: 24 }}>
            <Intent intent="identity.self.view" />
        </div>
      </div>
    </div>
  );
}
