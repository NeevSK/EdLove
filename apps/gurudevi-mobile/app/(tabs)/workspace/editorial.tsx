import {
  type EditorialAuthorProfileSummary,
  type EditorialClient,
  type EditorialDeliverySummary,
  type EditorialEventInput,
  type EditorialRightsAgreementSummary,
  type EditorialSubmissionSummary,
  editorialSubmissionSummarySchema,
} from '@repo/core/api/editorial.contract';
import { orpcClient } from '@repo/core/api/orpcClient';
import { storage } from '@repo/core/lib/storage';
import { usePermissions } from '@repo/core/logic';
import { BrandedEmptyState } from '@repo/ui/components/BrandedEmptyState';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { Pressable } from '@repo/ui/primitives';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {
  EnrichedMarkdownText,
  EnrichedMarkdownTextInput,
  type EnrichedMarkdownTextInputInstance,
} from 'react-native-enriched-markdown';
import { FlashList } from '@shopify/flash-list';

const accent = '#B96D3A';
const ink = '#302A24';
const muted = '#6F655B';

const initialForm = {
  publication: 'gurudevi' as const,
  contentKind: 'original' as const,
  title: '',
  summary: '',
  body: '',
  language: 'en' as const,
  sourceUrl: '',
  rightsAgreementId: '',
  translationOfVersionId: '',
};
type SubmissionForm = {
  publication: 'gurudevi' | 'edlove';
  contentKind: 'original' | 'curated' | 'licensed' | 'guest' | 'translation';
  title: string;
  summary: string;
  body: string;
  language: 'en' | 'si' | 'ta';
  sourceUrl: string;
  rightsAgreementId: string;
  translationOfVersionId: string;
};

const editorialClient = orpcClient as typeof orpcClient & { editorial: EditorialClient };

const initialRightsAgreement = {
  id: '',
  rightsHolder: '',
  license: '',
  evidenceReference: '',
  takedownContact: '',
  expiresAt: '',
};
type RightsAgreementForm = typeof initialRightsAgreement;

const initialAuthorProfile = {
  id: '',
  displayName: '',
  biography: '',
  attributionName: '',
  websiteUrl: '',
};
type AuthorProfileForm = typeof initialAuthorProfile;

const isSubmissionForm = (value: unknown): value is SubmissionForm => {
  if (typeof value !== 'object' || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    (draft.publication === 'gurudevi' || draft.publication === 'edlove') &&
    ['original', 'curated', 'licensed', 'guest', 'translation'].includes(
      String(draft.contentKind),
    ) &&
    typeof draft.title === 'string' &&
    typeof draft.summary === 'string' &&
    typeof draft.body === 'string' &&
    (draft.language === 'en' || draft.language === 'si' || draft.language === 'ta') &&
    typeof draft.sourceUrl === 'string' &&
    typeof draft.rightsAgreementId === 'string' &&
    typeof draft.translationOfVersionId === 'string'
  );
};

export default function EditorialScreen() {
  const { context } = usePermissions();
  const isAdmin = context.activeBond?.capacity === 'admin' || context.primaryCapacity === 'admin';
  const [form, setForm] = useState<SubmissionForm>(initialForm);
  const [submissions, setSubmissions] = useState<EditorialSubmissionSummary[]>([]);
  const [rightsAgreements, setRightsAgreements] = useState<EditorialRightsAgreementSummary[]>([]);
  const [authorProfiles, setAuthorProfiles] = useState<EditorialAuthorProfileSummary[]>([]);
  const [assignedAuthorIds, setAssignedAuthorIds] = useState<Record<string, string>>({});
  const [deliveries, setDeliveries] = useState<EditorialDeliverySummary[]>([]);
  const [events, setEvents] = useState<EditorialEventInput[]>([]);
  const [rightsForm, setRightsForm] = useState<RightsAgreementForm>(initialRightsAgreement);
  const [authorForm, setAuthorForm] = useState<AuthorProfileForm>(initialAuthorProfile);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [draftReady, setDraftReady] = useState(false);
  const [draftRecovered, setDraftRecovered] = useState(false);
  const editorRef = useRef<EnrichedMarkdownTextInputInstance>(null);
  const draftKey = context.userId ? `editorial-draft:${context.userId}` : null;

  const loadSubmissions = useCallback(async () => {
    setBusy(true);
    setMessage('');
    try {
      const [response, agreements, deliveryRows, eventRows, authors] = await Promise.all([
        isAdmin
          ? editorialClient.editorial.listForReview({ query: { limit: 50 } })
          : editorialClient.editorial.listMine({ query: { limit: 25 } }),
        isAdmin
          ? editorialClient.editorial.listRightsAgreements({ query: { limit: 50 } })
          : Promise.resolve([]),
        isAdmin
          ? editorialClient.editorial.listDeliveries({ query: { limit: 100 } })
          : Promise.resolve([]),
        isAdmin
          ? editorialClient.editorial.listEvents({ query: { limit: 100 } })
          : Promise.resolve([]),
        isAdmin
          ? editorialClient.editorial.listAuthorProfiles({ query: { limit: 50 } })
          : Promise.resolve([]),
      ]);
      setSubmissions(editorialSubmissionSummarySchema.array().parse(response));
      setRightsAgreements(agreements);
      setDeliveries(deliveryRows);
      setEvents(eventRows);
      setAuthorProfiles(authors);
    } catch {
      setMessage('Editorial submissions are unavailable right now. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    setDraftReady(false);
    setDraftRecovered(false);
    if (!draftKey || isAdmin) {
      setDraftReady(true);
      return;
    }

    let active = true;
    void storage
      .getStringAsync(draftKey)
      .then((raw) => {
        if (!active || !raw) return;
        try {
          const parsed: unknown = JSON.parse(raw);
          if (!isSubmissionForm(parsed)) return;
          setForm(parsed);
          editorRef.current?.setValue(parsed.body);
          setDraftRecovered(true);
        } catch {
          storage.delete(draftKey);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setDraftReady(true);
      });

    return () => {
      active = false;
    };
  }, [draftKey, isAdmin]);

  useEffect(() => {
    if (!draftReady || !draftKey || isAdmin) return;
    const hasDraft = Boolean(form.title.trim() || form.summary.trim() || form.body.trim());
    if (!hasDraft) {
      storage.delete(draftKey);
      return;
    }
    const timer = setTimeout(() => {
      storage.set(draftKey, JSON.stringify(form));
    }, 500);
    return () => clearTimeout(timer);
  }, [draftKey, draftReady, form, isAdmin]);

  const updateForm = <K extends keyof SubmissionForm>(field: K, value: SubmissionForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    if (
      form.title.trim().length < 3 ||
      form.summary.trim().length < 10 ||
      form.body.trim().length < 50
    ) {
      setMessage('Please add a title, a useful summary, and at least 50 characters of writing.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await editorialClient.editorial.submit({
        body: {
          ...form,
          sourceUrl: form.sourceUrl.trim() || undefined,
          rightsAgreementId: form.rightsAgreementId.trim() || undefined,
          translationOfVersionId: form.translationOfVersionId.trim() || undefined,
        },
      });
      setForm(initialForm);
      editorRef.current?.setValue('');
      if (draftKey) storage.delete(draftKey);
      setDraftRecovered(false);
      setMessage('Submitted for editorial review.');
      await loadSubmissions();
    } catch {
      setMessage('Submission could not be saved. Please try again.');
      setBusy(false);
    }
  };

  const discardDraft = () => {
    setForm(initialForm);
    editorRef.current?.setValue('');
    if (draftKey) storage.delete(draftKey);
    setDraftRecovered(false);
    setMessage('Local draft discarded.');
  };

  const updateRightsForm = <K extends keyof RightsAgreementForm>(
    field: K,
    value: RightsAgreementForm[K],
  ) => {
    setRightsForm((current) => ({ ...current, [field]: value }));
  };

  const createRightsAgreement = async () => {
    if (
      !rightsForm.id.trim() ||
      !rightsForm.rightsHolder.trim() ||
      !rightsForm.license.trim() ||
      !rightsForm.evidenceReference.trim() ||
      !rightsForm.takedownContact.trim()
    ) {
      setMessage('Complete all rights agreement fields before saving.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await editorialClient.editorial.createRightsAgreement({
        body: {
          id: rightsForm.id.trim(),
          rightsHolder: rightsForm.rightsHolder.trim(),
          license: rightsForm.license.trim(),
          permittedPublications: ['gurudevi', 'edlove'],
          permittedChannels: ['linkedin', 'medium', 'substack', 'meta', 'rss'],
          evidenceReference: rightsForm.evidenceReference.trim(),
          expiresAt: rightsForm.expiresAt.trim() || undefined,
          takedownContact: rightsForm.takedownContact.trim(),
        },
      });
      setRightsForm(initialRightsAgreement);
      setMessage('Rights agreement saved.');
      await loadSubmissions();
    } catch {
      setMessage('Rights agreement could not be saved. Check its ID and expiry date.');
      setBusy(false);
    }
  };

  const updateAuthorForm = <K extends keyof AuthorProfileForm>(
    field: K,
    value: AuthorProfileForm[K],
  ) => {
    setAuthorForm((current) => ({ ...current, [field]: value }));
  };

  const createAuthorProfile = async () => {
    if (!authorForm.id.trim() || !authorForm.displayName.trim()) {
      setMessage('An author ID and display name are required.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await editorialClient.editorial.createAuthorProfile({
        body: {
          id: authorForm.id.trim(),
          displayName: authorForm.displayName.trim(),
          biography: authorForm.biography.trim(),
          websiteUrl: authorForm.websiteUrl.trim() || undefined,
          socialLinks: [],
          attributionName: authorForm.attributionName.trim() || undefined,
        },
      });
      setAuthorForm(initialAuthorProfile);
      setMessage('Author profile saved.');
      await loadSubmissions();
    } catch {
      setMessage('Author profile could not be saved. Check the ID and website URL.');
      setBusy(false);
    }
  };

  const review = async (
    submission: EditorialSubmissionSummary,
    status: 'in_review' | 'rights_review' | 'approved' | 'rejected' | 'withdrawn',
  ) => {
    setBusy(true);
    setMessage('');
    try {
      await editorialClient.editorial.reviewSubmission({
        params: { id: submission.id },
        body: assignedAuthorIds[submission.id]
          ? { status, authorProfileId: assignedAuthorIds[submission.id] }
          : { status },
      });
      await loadSubmissions();
    } catch {
      setMessage('That review transition could not be applied.');
      setBusy(false);
    }
  };

  const renderSubmissionItem = ({ item: submission }: { item: EditorialSubmissionSummary }) => (
    <View key={submission.id} style={styles.card}>
      <Text style={styles.meta}>
        {submission.publication} · {submission.language} · {submission.status}
      </Text>
      <Text style={styles.cardTitle}>{submission.title}</Text>
      <Text style={styles.summary}>{submission.summary}</Text>
      <View style={styles.preview}>
        <Text style={styles.previewLabel}>Markdown submission</Text>
        <EnrichedMarkdownText
          markdown={submission.body}
          selectable
          markdownStyle={{
            h1: { color: ink, fontSize: 26, fontWeight: '800' },
            h2: { color: ink, fontSize: 21, fontWeight: '800' },
            link: { color: accent, underline: true },
          }}
        />
      </View>
      {submission.sourceUrl ? (
        <Text style={styles.evidence}>Source: {submission.sourceUrl}</Text>
      ) : null}
      {submission.rightsAgreementId ? (
        <Text style={styles.evidence}>Rights agreement: {submission.rightsAgreementId}</Text>
      ) : null}
      {submission.translationOfVersionId ? (
        <Text style={styles.evidence}>
          Translation of version: {submission.translationOfVersionId}
        </Text>
      ) : null}
      {isAdmin && authorProfiles.length ? (
        <View style={styles.assignmentBlock}>
          <Text style={styles.previewLabel}>Author attribution</Text>
          <View style={styles.options}>
            {authorProfiles.map((author) => (
              <Pressable
                key={author.id}
                onPress={() =>
                  setAssignedAuthorIds((current) => ({
                    ...current,
                    [submission.id]: author.id,
                  }))
                }
                style={[
                  styles.option,
                  assignedAuthorIds[submission.id] === author.id && styles.optionSelected,
                ]}
              >
                <Text
                  style={
                    assignedAuthorIds[submission.id] === author.id
                      ? styles.optionTextSelected
                      : styles.optionText
                  }
                >
                  {author.displayName}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      {isAdmin && submission.status !== 'approved' && submission.status !== 'withdrawn' ? (
        <View style={styles.actions}>
          <Pressable
            disabled={busy}
            onPress={() => void review(submission, 'in_review')}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>Review</Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={() => void review(submission, 'rights_review')}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>Rights</Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={() => void review(submission, 'approved')}
            style={styles.primarySmall}
          >
            <Text style={styles.primaryText}>Approve</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  return (
    <FlashList
      data={submissions}
      keyExtractor={(item) => item.id}
      renderItem={renderSubmissionItem}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <Text style={styles.eyebrow}>{isAdmin ? 'EDITORIAL DESK' : 'CONTRIBUTOR SPACE'}</Text>
      <Text style={styles.title}>
        {isAdmin ? 'Review the work people bring.' : 'Bring a piece of thinking.'}
      </Text>
      <Text style={styles.lede}>
        {isAdmin
          ? 'Submissions stay private until editorial and rights review are complete.'
          : 'Your work enters a review queue. It is never published automatically.'}
      </Text>

      {!isAdmin && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>New submission</Text>
          <Text style={styles.helper}>
            Write in Markdown. The formatting is saved as the canonical source for editorial review.
          </Text>
          {draftRecovered ? (
            <View style={styles.recoveredDraft}>
              <Text style={styles.recoveredText}>Recovered an unsent draft from this device.</Text>
              <Pressable onPress={discardDraft}>
                <Text style={styles.discardText}>Discard draft</Text>
              </Pressable>
            </View>
          ) : null}
          <Text style={styles.label}>Publication</Text>
          <View style={styles.options}>
            {(['gurudevi', 'edlove'] as const).map((publication) => (
              <Pressable
                key={publication}
                onPress={() => updateForm('publication', publication)}
                style={[styles.option, form.publication === publication && styles.optionSelected]}
              >
                <Text
                  style={
                    form.publication === publication ? styles.optionTextSelected : styles.optionText
                  }
                >
                  {publication === 'gurudevi' ? 'GuruDevi' : 'EdLove'}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Contribution type</Text>
          <View style={styles.options}>
            {(['original', 'guest', 'curated', 'licensed', 'translation'] as const).map(
              (contentKind) => (
                <Pressable
                  key={contentKind}
                  onPress={() => updateForm('contentKind', contentKind)}
                  style={[styles.option, form.contentKind === contentKind && styles.optionSelected]}
                >
                  <Text
                    style={
                      form.contentKind === contentKind
                        ? styles.optionTextSelected
                        : styles.optionText
                    }
                  >
                    {contentKind}
                  </Text>
                </Pressable>
              ),
            )}
          </View>
          <Text style={styles.label}>Language</Text>
          <View style={styles.options}>
            {(['en', 'si', 'ta'] as const).map((language) => (
              <Pressable
                key={language}
                onPress={() => updateForm('language', language)}
                style={[styles.option, form.language === language && styles.optionSelected]}
              >
                <Text
                  style={form.language === language ? styles.optionTextSelected : styles.optionText}
                >
                  {language === 'en' ? 'English' : language === 'si' ? 'සිංහල' : 'தமிழ்'}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={form.title}
            onChangeText={(value) => updateForm('title', value)}
            placeholder="Title"
            placeholderTextColor="#9B9188"
            style={styles.input}
          />
          <TextInput
            value={form.summary}
            onChangeText={(value) => updateForm('summary', value)}
            placeholder="Short summary"
            placeholderTextColor="#9B9188"
            style={styles.input}
            multiline
          />
          <EnrichedMarkdownTextInput
            ref={editorRef}
            defaultValue={form.body}
            onChangeMarkdown={(value) => updateForm('body', value)}
            placeholder="Your writing — use headings, lists, links, bold, and italics"
            placeholderTextColor="#9B9188"
            style={{ ...styles.input, ...styles.body }}
            multiline
            markdownStyle={{
              h1: { color: ink, fontSize: 28, fontWeight: '800' },
              h2: { color: ink, fontSize: 22, fontWeight: '800' },
              link: { color: accent, underline: true },
            }}
          />
          {form.contentKind !== 'original' ? (
            <>
              <TextInput
                value={form.sourceUrl}
                onChangeText={(value) => updateForm('sourceUrl', value)}
                placeholder="Source URL (required for curated, licensed, or translated work)"
                placeholderTextColor="#9B9188"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="url"
              />
              {form.contentKind === 'licensed' ? (
                <TextInput
                  value={form.rightsAgreementId}
                  onChangeText={(value) => updateForm('rightsAgreementId', value)}
                  placeholder="Rights agreement reference"
                  placeholderTextColor="#9B9188"
                  style={styles.input}
                  autoCapitalize="none"
                />
              ) : null}
              {form.contentKind === 'translation' ? (
                <TextInput
                  value={form.translationOfVersionId}
                  onChangeText={(value) => updateForm('translationOfVersionId', value)}
                  placeholder="Source editorial version ID"
                  placeholderTextColor="#9B9188"
                  style={styles.input}
                  autoCapitalize="none"
                />
              ) : null}
            </>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void submit()}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>{busy ? 'Saving…' : 'Submit for review'}</Text>
          </Pressable>
        </View>
      )}

      {isAdmin ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Author profiles</Text>
          <Text style={styles.helper}>
            Give contributors, translators, curators, and editors a stable public attribution.
          </Text>
          <TextInput
            value={authorForm.id}
            onChangeText={(value) => updateAuthorForm('id', value)}
            placeholder="Author ID"
            placeholderTextColor="#9B9188"
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            value={authorForm.displayName}
            onChangeText={(value) => updateAuthorForm('displayName', value)}
            placeholder="Display name"
            placeholderTextColor="#9B9188"
            style={styles.input}
          />
          <TextInput
            value={authorForm.biography}
            onChangeText={(value) => updateAuthorForm('biography', value)}
            placeholder="Short biography"
            placeholderTextColor="#9B9188"
            style={styles.input}
            multiline
          />
          <TextInput
            value={authorForm.attributionName}
            onChangeText={(value) => updateAuthorForm('attributionName', value)}
            placeholder="Attribution name (optional)"
            placeholderTextColor="#9B9188"
            style={styles.input}
          />
          <TextInput
            value={authorForm.websiteUrl}
            onChangeText={(value) => updateAuthorForm('websiteUrl', value)}
            placeholder="Website URL (optional)"
            placeholderTextColor="#9B9188"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void createAuthorProfile()}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>{busy ? 'Saving…' : 'Save author profile'}</Text>
          </Pressable>
          {authorProfiles.map((author) => (
            <View key={author.id} style={styles.agreementRow}>
              <Text style={styles.cardTitle}>{author.displayName}</Text>
              <Text style={styles.evidence}>
                {author.id}
                {author.attributionName ? ` · ${author.attributionName}` : ''}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {isAdmin ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Publishing events</Text>
          <Text style={styles.helper}>
            Canonical publication events are the parent record for downstream distribution.
          </Text>
          {events.length ? (
            events.map((event) => (
              <View key={event.eventId} style={styles.agreementRow}>
                <Text style={styles.cardTitle}>{event.eventType}</Text>
                <Text style={styles.evidence}>
                  {event.eventId} · Work {event.workId} · Version {event.versionId}
                </Text>
                <Text style={styles.evidence}>{event.occurredAt}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.summary}>No publishing events recorded yet.</Text>
          )}
        </View>
      ) : null}

      {isAdmin ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rights agreements</Text>
          <Text style={styles.helper}>
            Create a reusable permission record before approving licensed work.
          </Text>
          <TextInput
            value={rightsForm.id}
            onChangeText={(value) => updateRightsForm('id', value)}
            placeholder="Agreement ID"
            placeholderTextColor="#9B9188"
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            value={rightsForm.rightsHolder}
            onChangeText={(value) => updateRightsForm('rightsHolder', value)}
            placeholder="Rights holder"
            placeholderTextColor="#9B9188"
            style={styles.input}
          />
          <TextInput
            value={rightsForm.license}
            onChangeText={(value) => updateRightsForm('license', value)}
            placeholder="License or permission terms"
            placeholderTextColor="#9B9188"
            style={styles.input}
          />
          <TextInput
            value={rightsForm.evidenceReference}
            onChangeText={(value) => updateRightsForm('evidenceReference', value)}
            placeholder="Evidence reference (URL or archive ID)"
            placeholderTextColor="#9B9188"
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            value={rightsForm.takedownContact}
            onChangeText={(value) => updateRightsForm('takedownContact', value)}
            placeholder="Takedown contact"
            placeholderTextColor="#9B9188"
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            value={rightsForm.expiresAt}
            onChangeText={(value) => updateRightsForm('expiresAt', value)}
            placeholder="Expiry (ISO date-time, optional)"
            placeholderTextColor="#9B9188"
            style={styles.input}
            autoCapitalize="none"
          />
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void createRightsAgreement()}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>{busy ? 'Saving…' : 'Save rights agreement'}</Text>
          </Pressable>
          {rightsAgreements.map((agreement) => (
            <View key={agreement.id} style={styles.agreementRow}>
              <Text style={styles.cardTitle}>{agreement.id}</Text>
              <Text style={styles.summary}>
                {agreement.rightsHolder} · {agreement.license}
              </Text>
              <Text style={styles.evidence}>
                Channels: {agreement.permittedChannels.join(', ')}
                {agreement.expiresAt ? ` · Expires ${agreement.expiresAt}` : ''}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {isAdmin ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Distribution ledger</Text>
          <Text style={styles.helper}>
            Every channel attempt is idempotent and remains visible here, including failures.
          </Text>
          {deliveries.length ? (
            deliveries.map((delivery) => (
              <View key={delivery.idempotencyKey} style={styles.agreementRow}>
                <Text style={styles.cardTitle}>
                  {delivery.channel} · {delivery.status}
                </Text>
                <Text style={styles.evidence}>
                  Attempts: {delivery.attempts} · Account: {delivery.accountId}
                </Text>
                {delivery.lastError ? (
                  <Text style={styles.errorEvidence}>{delivery.lastError}</Text>
                ) : null}
                {delivery.externalUrl ? (
                  <Text style={styles.evidence}>{delivery.externalUrl}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.summary}>No distribution deliveries recorded yet.</Text>
          )}
        </View>
      ) : null}

          {message ? <Text style={styles.message}>{message}</Text> : null}
          {busy && !submissions.length ? <BrandPulse size={28} tintColor={accent} /> : null}
        </View>
      }
      ListFooterComponent={
        !busy && !submissions.length && !message ? (
          <BrandedEmptyState
            title="No submissions yet"
            message="The first contribution is waiting to be written."
          />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#F7F1E8' },
  headerContainer: { gap: 16, marginBottom: 16 },
  eyebrow: { color: accent, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: ink, fontSize: 34, fontWeight: '800', lineHeight: 40, maxWidth: 620 },
  lede: { color: muted, fontSize: 17, lineHeight: 25, maxWidth: 620 },
  helper: { color: muted, fontSize: 14, lineHeight: 20 },
  recoveredDraft: {
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F2DFCF',
  },
  recoveredText: { color: ink, fontSize: 14 },
  discardText: { color: accent, fontWeight: '800' },
  label: {
    color: ink,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D8C8B6',
  },
  optionSelected: { backgroundColor: '#F2DFCF', borderColor: accent },
  optionText: { color: muted, fontWeight: '700' },
  optionTextSelected: { color: accent, fontWeight: '800' },
  card: {
    gap: 12,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2D4C3',
    backgroundColor: '#FFFDF9',
    maxWidth: 720,
  },
  cardTitle: { color: ink, fontSize: 22, fontWeight: '800' },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8C8B6',
    color: ink,
    fontSize: 16,
    backgroundColor: '#FFFEFC',
  },
  body: { minHeight: 180 },
  primary: { alignItems: 'center', padding: 14, borderRadius: 999, backgroundColor: accent },
  primarySmall: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: accent,
  },
  primaryText: { color: '#FFFDF9', fontWeight: '800' },
  secondary: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: accent,
  },
  secondaryText: { color: accent, fontWeight: '800' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: {
    color: accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summary: { color: muted, fontSize: 16, lineHeight: 23 },
  preview: { gap: 8, padding: 14, borderRadius: 12, backgroundColor: '#F7F1E8' },
  previewLabel: {
    color: accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  evidence: { color: muted, fontSize: 13, lineHeight: 19 },
  errorEvidence: { color: '#9B3D2E', fontSize: 13, lineHeight: 19 },
  assignmentBlock: { gap: 8, paddingTop: 8 },
  agreementRow: { gap: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2D4C3' },
  message: { color: accent, fontWeight: '700' },
});
