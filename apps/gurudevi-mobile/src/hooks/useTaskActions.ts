import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useTaskActions() {
    const queryClient = useQueryClient();

    const addTask = useMutation({
        mutationFn: async (title: string) => {
            const { error } = await supabase.from('tasks').insert([{ title }]);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    const toggleTask = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
            const { error } = await supabase.from('tasks').update({ is_completed: status }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    const deleteTask = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('tasks').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    return { addTask, toggleTask, deleteTask };
}