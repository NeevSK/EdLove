import { AvatarDisplay, EditableItem } from '@repo/profile';
import { SkeletonCard } from '@repo/ui/components/SkeletonLoader';
import { useThemedColors } from '@repo/ui/hooks';
import { ArrowLeft, BookOpen, Clock, GraduationCap, Hash, User } from '@repo/ui/icons';
import { Icon } from '@repo/ui/primitives';
import { safeBack } from '@repo/ui/utils/navigation';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useClassroomProfile } from '../hooks/useClassroomProfile';

export default function ClassroomProfileScreenWeb({ classroomId }: { classroomId: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemedColors();
  const { classroom, loading, updateField, isEditable } = useClassroomProfile(classroomId);

  if (loading)
    return (
      <div style={{ padding: '40px' }}>
        <SkeletonCard />
      </div>
    );
  if (!classroom)
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: colors.textSecondary,
        }}
      >
        Classroom not found
      </div>
    );

  return (
    <div
      className="sub-view-container"
      style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <button
          onClick={() => safeBack('/workspace')}
          className="secondary-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            background: colors.tertiary,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            color: colors.text,
            cursor: 'pointer',
          }}
        >
          <Icon as={ArrowLeft} size={16} /> {t('common.back') || 'Back'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '32px',
        }}
      >
        <div>
          <div
            className="sanctuary-card"
            style={{
              padding: '40px',
              marginBottom: '24px',
              backgroundColor: colors.secondary,
              borderRadius: '24px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
              <div
                style={{
                  padding: '24px',
                  background: 'var(--accent-action-soft)',
                  borderRadius: '24px',
                }}
              >
                <Icon as={GraduationCap} size={48} color="var(--accent-action)" />
              </div>

              <div style={{ flex: 1 }}>
                <EditableItem
                  icon={Hash}
                  label="Classroom Name"
                  value={classroom.name}
                  field="name"
                  placeholder="Enter classroom name"
                  onSave={(field, val) => updateField(field as any, val)}
                  disabled={!isEditable}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: colors.textTertiary,
                    marginTop: '8px',
                  }}
                >
                  <Icon as={BookOpen} size={14} />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    {classroom.subject || 'General Studies'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="sanctuary-card"
            style={{
              padding: '32px',
              backgroundColor: colors.secondary,
              borderRadius: '24px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '800',
                marginBottom: '20px',
                color: colors.text,
              }}
            >
              Description
            </h3>
            <EditableItem
              icon={BookOpen}
              label="Classroom Description"
              value={classroom.description || ''}
              field="description"
              placeholder="Add a description for this classroom..."
              onSave={(field, val) => updateField(field as any, val)}
              disabled={!isEditable}
              multiline={true}
            />
          </div>
        </div>

        <div>
          <div
            className="sanctuary-card"
            style={{
              padding: '24px',
              marginBottom: '24px',
              backgroundColor: colors.secondary,
              borderRadius: '24px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <Icon as={User} size={16} color={colors.textTertiary} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: colors.textTertiary,
                }}
              >
                Teacher
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AvatarDisplay
                userId={classroom.teacher_id || 'unknown'}
                size={40}
                editable={false}
                peekable={true}
                peekType="user"
              />
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.text,
                }}
              >
                Teacher In Charge
              </div>
            </div>
          </div>

          <div
            className="sanctuary-card"
            style={{
              padding: '24px',
              backgroundColor: colors.tertiary,
              borderRadius: '24px',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <Icon as={Clock} size={16} color={colors.textTertiary} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: colors.textTertiary,
                }}
              >
                Academic Year
              </span>
            </div>
            <div style={{ fontSize: '14px', color: colors.textSecondary }}>
              {classroom.academic_year || 'Current'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
