# Gurudevi National OS - System Philosophy (v4.0)

## Current Paradigm: Intent-Driven & Durable Execution
We are moving beyond the passive request-response cycle. The system must not just "react" but "intend" and "persist" until the intent is fulfilled.

## Core Principle: Workflows, Not Scripts
We do not write "scripts" that might fail silently or leave the system in an inconsistent state; we define **Workflows** that cannot fail. Every critical business operation must be a durable execution.

## The Stack:
- **Frontend**: React Native (Expo) - The Sensing Layer.
- **Backend**: Astro SSR (Node runtime) - The Orchestration Layer.
- **Persistence**: Supabase - The Memory (Standardizing on **UUID v7** for B-Tree efficiency).
- **Durability**: Inngest - The Will.
- **Security**: **Asynchronous SHA-256** (WebCrypto) - The Identity Seal.

## Future Intent: Autopoietic Healing
We are evolving toward a system that monitors its own health (database integrity, performance metrics, usage patterns) and automatically evolves—suggesting schema migrations and optimizations without manual intervention.
