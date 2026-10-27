BEGIN;

ALTER POLICY "Anyone can submit a response" ON public.form_responses
  WITH CHECK (
    (responder_id IS NULL OR responder_id = (SELECT public.get_my_id()))
    AND EXISTS (
      SELECT 1 FROM public.form_templates template
      WHERE template.id = form_responses.template_id AND template.is_published = true
    )
  );

COMMIT;
