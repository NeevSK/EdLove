---
title: "Platform Identity & Authentication Architecture"
status: "active"
created: 2026-03-08
updated: 2026-03-08
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Platform Identity & Authentication Architecture

Version 1.0

## 1. Purpose

This document defines the architectural design of the platform's
identity and authentication system.

The objective is to ensure: - clean separation between authentication
and application identity - provider‑agnostic login architecture -
extensibility for future features such as teams, permissions, AI
assistants, and billing - ability to replace authentication providers
without breaking application logic

This document serves as the authoritative reference for implementing
identity and authentication within the platform.

------------------------------------------------------------------------

## 2. Core Philosophy

Authentication and identity are different concerns and must remain
separated.

Authentication answers: "Can this person prove ownership of this
account?"

Identity answers: "Who is this person inside our system?"

External authentication providers verify identity, but the application
defines identity.

The application's database is the canonical source of user identity.
Supabase Auth acts only as an authentication broker.

------------------------------------------------------------------------

## 3. Architectural Principles

### Principle 1 --- Identity Ownership

The platform owns the canonical user identity.

### Principle 2 --- Provider Independence

Authentication providers must remain replaceable without changing
application logic.

Possible providers: - Google - Email Magic Link - Apple - GitHub -
Microsoft

### Principle 3 --- Multiple Login Methods per User

A single user may authenticate through multiple providers.

Example: User A → Google login + Email login

### Principle 4 --- Internal Identity First

All application logic must reference `users.id`, not the Supabase auth
user id.

### Principle 5 --- Replaceable Infrastructure

If Supabase is replaced later, the application identity model should
remain unchanged.

------------------------------------------------------------------------

## 4. Identity System Layers

### Layer 1 --- Identity Providers

External services verifying identity. Examples: Google, Apple, Email.

### Layer 2 --- Authentication Broker

Supabase Auth manages OAuth flows and sessions.

### Layer 3 --- Application Identity Layer

Canonical representation of users stored in the platform database.

### Layer 4 --- Domain Systems

Systems depending on identity: - teams - permissions - AI assistants -
billing - activity logs

------------------------------------------------------------------------

## 5. Data Model

### users table

Canonical user identity.

Fields:

  Field        Description
  ------------ ---------------
  id (uuid)    Primary key
  email        user email
  name         display name
  avatar_url   profile image
  created_at   timestamp
  updated_at   timestamp

### auth_identities table

Maps authentication providers to users.

  Field              Description
  ------------------ ----------------------
  id                 uuid
  user_id            references users.id
  provider           google / email / etc
  provider_user_id   provider identifier
  created_at         timestamp

Example:

  user_id   provider   provider_user_id
  --------- ---------- ------------------
  u123      google     1048394834
  u123      email      neev@email.com

------------------------------------------------------------------------

## 6. Authentication Flow

1.  User opens application login page.
2.  User selects login provider.
3.  Supabase performs authentication.
4.  Supabase returns authenticated identity.
5.  System extracts provider + provider_user_id.
6.  System checks `auth_identities` table.

If identity exists: → fetch associated user.

If not: → create new user and mapping.

7.  Start session using internal user identity.

------------------------------------------------------------------------

## 7. User Creation Logic

Pseudo‑flow:

    if identity_exists(provider, provider_user_id):
        user = get_existing_user()
    else:
        user = create_user()
        create_auth_identity_mapping()

------------------------------------------------------------------------

## 8. Session Usage

After authentication the system must use:

`users.id`

Example relationships:

    projects.owner_id → users.id
    teams.member_id → users.id
    assistants.owner_id → users.id

------------------------------------------------------------------------

## 9. Domain Integration

### Teams

Tables: - teams - team_members

Relationship: `team_members.user_id → users.id`

### Permissions

Tables: - roles - permissions - role_assignments

### AI Assistants

Tables: - assistants - assistant_owners

### Billing

Tables: - subscriptions - payments

------------------------------------------------------------------------

## 10. Authentication UI Architecture

The application should provide its own login interface.

Example:

Welcome to the Platform

\[ Continue with Google \] \[ Continue with Email \]

Users should perceive authentication as belonging to the platform.

------------------------------------------------------------------------

## 11. Security Considerations

The system must enforce: - secure OAuth redirect URLs - proper session
validation - secure token handling - strict row‑level security

Supabase RLS may reference `auth.uid()` but domain logic must reference
`users.id`.

------------------------------------------------------------------------

## 12. Future Extensibility

This architecture supports:

-   organization systems
-   multi‑tenant SaaS
-   AI agent ownership
-   external integrations
-   advanced permission models

------------------------------------------------------------------------

## 13. Migration Safety

Because the application owns identity:

Authentication providers can change without breaking user data.

Example:

Supabase → Auth0\
Supabase → Self‑hosted auth

The `users` table remains unchanged.

------------------------------------------------------------------------

## 14. Implementation Requirements

Implementation must ensure:

1.  Supabase used only for authentication.
2.  Application database owns canonical user identity.
3.  All domain entities reference `users.id`.
4.  Multiple login providers supported.
5.  Identity mapping handled via `auth_identities`.

------------------------------------------------------------------------

## 15. Architecture Summary

    Identity Provider
          ↓
    Supabase Auth
          ↓
    auth_identities mapping
          ↓
    users table
          ↓
    Application systems
