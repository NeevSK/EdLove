export const metadata = { title: 'Settings | Gurudevi Explore' };

export default function ExploreSettingsPage() {
  return (
    <article data-domain="profile" aria-labelledby="explore-settings-title">
      <header>
        <p>Explore · local workspace</p>
        <h1 id="explore-settings-title">Explore settings</h1>
        <p>
          Account, notification, and privacy preferences need a durable identity. Explore mode does
          not present settings it cannot honor.
        </p>
      </header>
      <section aria-labelledby="settings-availability-title">
        <h2 id="settings-availability-title">Local data stays local</h2>
        <p>
          Your browser manages this exploration’s local storage. A later reset and account-transfer
          flow will be explicit before either changes or moves your work.
        </p>
      </section>
    </article>
  );
}
