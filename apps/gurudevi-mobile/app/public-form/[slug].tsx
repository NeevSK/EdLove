import { View } from 'react-native';
import { PowerSyncFormsAdapter, getDrizzleDB } from '@repo/core/powersync';
import { formTemplates } from '@repo/core/adapters/powersync/schema';
import { PublicFormScreenWeb } from '@repo/form-builder';
import { BrandPulse } from '@repo/ui';
import ErrorBoundary, { RouteErrorBoundary } from '@repo/ui/components/ErrorBoundary';
import { eq } from 'drizzle-orm';
import { Suspense, useMemo } from 'react';

export { RouteErrorBoundary as ErrorBoundary };

function Fallback() {
  return (
    <View className="items-center justify-center flex-1">
      <BrandPulse accessibilityLabel="Loading form" />
    </View>
  );
}

export default function PublicFormRoute() {
  const formsAdapter = useMemo(() => new PowerSyncFormsAdapter(), []);

  const services = useMemo(
    () => ({
      loadFormBySlug: async (slug: string) => {
        const db = getDrizzleDB();
        const results = await db
          .select()
          .from(formTemplates)
          .where(eq(formTemplates.slug, slug))
          .limit(1);

        const template = results[0];
        if (!template) {
          throw new Error(`Form not found for slug: ${slug}`);
        }

        const parsed = JSON.parse(template.config);
        const pages = Array.isArray(parsed) ? parsed : parsed.pages || [];
        const flatFields = pages.flatMap((p: any) => p.fields || []);

        return {
          id: template.id,
          title: template.title,
          description: template.description ?? undefined,
          config: flatFields,
        };
      },
      submitResponse: async ({
        templateId,
        data,
      }: {
        templateId: string;
        data: Record<string, unknown>;
      }) => {
        const id =
          typeof globalThis.crypto?.randomUUID === 'function'
            ? globalThis.crypto.randomUUID()
            : `resp-${Date.now()}`;

        await formsAdapter.record(templateId, {
          id,
          formId: templateId,
          tenantId: 'anonymous',
          data,
          submittedAt: new Date().toISOString(),
        });
      },
    }),
    [formsAdapter],
  );

  return (
    <ErrorBoundary name="PublicFormRoute">
      <Suspense fallback={<Fallback />}>
        <PublicFormScreenWeb services={services} />
      </Suspense>
    </ErrorBoundary>
  );
}
