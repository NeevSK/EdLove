export const metadata = { title: 'Notifications | Gurudevi Explore' };

export default function ExploreNotificationsPage() {
  return (
    <article data-domain="profile" aria-labelledby="explore-notifications-title">
      <header>
        <p>Explore · local workspace</p>
        <h1 id="explore-notifications-title">Notifications</h1>
        <p>There are no notifications in a private local exploration.</p>
      </header>
      <section aria-labelledby="notifications-availability-title">
        <h2 id="notifications-availability-title">Nothing is being withheld</h2>
        <p>
          Notifications require a chosen account or a shared relationship. Explore mode does not
          invent messages, reminders, or unread counts.
        </p>
      </section>
    </article>
  );
}
