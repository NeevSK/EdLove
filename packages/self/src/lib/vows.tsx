import React from 'react';
import { protocolRegistry } from '@repo/core';
import { 
    StudentSelfView, 
    TeacherSelfView, 
    PrincipalSelfView, 
    FounderSelfView, 
    AdminSelfView 
} from '../screens/self';

/**
 * Self Package Vows
 * Registers the UI implementation for common intents within the Self sanctuary.
 */
export function registerSelfVows() {
  // Intent: identity.self.view
  // Resolves to the appropriate dashboard based on user authority.

  protocolRegistry.register({
    intent: 'identity.self.view',
    providerId: 'self.view.student',
    component: StudentSelfView,
    priority: 10,
    authorize: (context) => ({ 
      allowed: context.schoolAuthority === 'student', 
      capability: 'sanctuary.self.view' 
    })
  });

  protocolRegistry.register({
    intent: 'identity.self.view',
    providerId: 'self.view.teacher',
    component: TeacherSelfView,
    priority: 10,
    authorize: (context) => ({ 
      allowed: context.schoolAuthority === 'teacher', 
      capability: 'sanctuary.self.view' 
    })
  });

  protocolRegistry.register({
    intent: 'identity.self.view',
    providerId: 'self.view.principal',
    component: PrincipalSelfView,
    priority: 10,
    authorize: (context) => ({ 
      allowed: context.schoolAuthority === 'principal', 
      capability: 'sanctuary.self.view' 
    })
  });

  protocolRegistry.register({
    intent: 'identity.self.view',
    providerId: 'self.view.founder',
    component: FounderSelfView,
    priority: 10,
    authorize: (context) => ({ 
      allowed: context.platformAuthorities.includes('founder'), 
      capability: 'sanctuary.self.view' 
    })
  });

  protocolRegistry.register({
    intent: 'identity.self.view',
    providerId: 'self.view.admin',
    component: AdminSelfView,
    priority: 10,
    authorize: (context) => ({ 
      allowed: context.platformAuthorities.includes('platform_admin') || context.platformAuthorities.includes('developer'), 
      capability: 'sanctuary.self.view' 
    })
  });
}
