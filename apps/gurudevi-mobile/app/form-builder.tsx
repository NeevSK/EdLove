import { PowerSyncFormsAdapter } from '@repo/core/powersync';
import { FormBuilderScreen } from '@repo/form-builder';
import type { FormSchema } from '@repo/form-builder/engine';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { useCallback, useMemo } from 'react';
import { useNavigator } from '@repo/ui/components/native/navigation';

export { RouteErrorBoundary as ErrorBoundary };

export default function FormBuilderRoute() {
  const router = useNavigator();
  const formsAdapter = useMemo(() => new PowerSyncFormsAdapter(), []);

  const handleSave = useCallback(
    async (schema: FormSchema) => {
      try {
        await formsAdapter.save(schema);
      } catch (err) {
        console.error('[FormBuilderRoute] Failed to save form template:', err);
      }
    },
    [formsAdapter],
  );

  const handlePublish = useCallback(
    async (schema: FormSchema) => {
      try {
        const published: FormSchema = {
          ...schema,
          settings: {
            ...schema.settings,
            isPublished: true,
          },
        };
        await formsAdapter.save(published);
        router.back();
      } catch (err) {
        console.error('[FormBuilderRoute] Failed to publish form template:', err);
      }
    },
    [formsAdapter, router],
  );

  return (
    <ErrorBoundary name="FormBuilderRoute">
      <FormBuilderScreen onSave={handleSave} onPublish={handlePublish} />
    </ErrorBoundary>
  );
}
