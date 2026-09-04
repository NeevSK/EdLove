import { api } from '@repo/core/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useTaskActions() {
  const queryClient = useQueryClient();

  const addTask = useMutation({
    mutationFn: async ({ title, teacherId }: { title: string; teacherId: string }) => {
      return api.tasks.create(title, teacherId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      return api.tasks.updateStatus(id, status);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      return api.tasks.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return { addTask, toggleTask, deleteTask };
}
