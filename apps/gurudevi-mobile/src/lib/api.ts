/**
 * GURUDEVI API CLIENT - Legacy Export
 * 
 * This file maintains backward compatibility with existing imports.
 * The actual API modules are now organized in the ./api/ directory.
 * 
 * Usage:
 *   import { api } from "@/lib/api";
 *   const tasks = await api.tasks.getAll();
 */

// Re-export everything from the modular API structure
export * from "./api";
export { api as default } from "./api";
