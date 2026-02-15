
import { api } from '../api';
import { supabase } from '../supabase';

/**
 * Mutation Registry
 * 
 * Maps serializable string keys (e.g. 'createPost') to actual async functions.
 * This allows us to rehydrate and execute queued actions from the persistent store.
 */

type MutationFunction = (variables: any) => Promise<any>;

export const MUTATION_REGISTRY: Record<string, MutationFunction> = {
    // Community
    'createPost': async (vars) => {
        // We need to reconstruct the call. 
        // Note: In a real app we might need to store author_id in vars if it's dynamic
        // For now, assuming current user context or passed vars context
        return api.community.createPost(vars, vars.author_id, vars.role, vars.school_id);
    },

    // Inventory
    'createInventoryRequest': async (vars) => {
        return api.inventory.createRequest(vars);
    },

    // Resources
    'createResource': async (vars) => {
        return api.resources.create(vars);
    },
    'toggleResourcePin': async (vars) => {
        return api.resources.togglePin(vars.id, vars.isPinned);
    },
    'deleteResource': async (vars) => {
        return api.resources.delete(vars); // vars is just id string here
    },

    // Self/Wellbeing (Example pattern)
    'saveJournalEntry': async (vars) => {
        const { error } = await supabase.from('journal_entries').insert(vars);
        if (error) throw error;
        return true;
    },
    'saveDecision': async (vars) => { // Adding the one we used in Phase 6
        const { error } = await supabase.from('decision_journals').insert(vars);
        if (error) throw error;
        return true;
    }
};
