-- ============================================================
-- Thuthimal Gift Notification Trigger
-- When a Thuthimal is inserted (gifted), notify the recipient.
-- ============================================================

CREATE OR REPLACE FUNCTION public.notify_on_thuthimal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_giver_name TEXT;
BEGIN
    SELECT full_name INTO v_giver_name
    FROM public.users
    WHERE id = NEW.giver_id;

    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        body,
        reference_id,
        reference_type,
        is_read
    ) VALUES (
        NEW.recipient_id,
        'thuthimal_received',
        'A Thuthimal arrived 🌸',
        COALESCE(v_giver_name, 'A colleague') || ' sent you a gift: "' || COALESCE(NEW.message, NEW.gift_type) || '"',
        NEW.id,
        'thuthimal',
        false
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_thuthimal ON public.thuthimal_gifts;
CREATE TRIGGER trg_notify_thuthimal
    AFTER INSERT ON public.thuthimal_gifts
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_thuthimal();

-- ============================================================
-- Impact Ripple Notification Trigger
-- When an impact_ripple is inserted, notify the recipient.
-- ============================================================

CREATE OR REPLACE FUNCTION public.notify_on_impact_ripple()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        body,
        reference_id,
        reference_type,
        is_read
    ) VALUES (
        NEW.recipient_user_id,
        'impact_ripple',
        'Your work rippled ✦',
        COALESCE(NEW.warm_message_en, 'Someone found value in your work.'),
        NEW.id,
        'impact_ripple',
        false
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_impact_ripple ON public.impact_ripples;
CREATE TRIGGER trg_notify_impact_ripple
    AFTER INSERT ON public.impact_ripples
    FOR EACH ROW EXECUTE FUNCTION public.notify_on_impact_ripple();
