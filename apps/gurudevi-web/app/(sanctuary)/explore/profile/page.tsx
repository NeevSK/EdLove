export const metadata = { title: 'Profile — Explore | Gurudevi Sanctuary' };

export default function ExploreProfilePage() {
  return (
    <article data-domain="profile" aria-labelledby="explore-profile-title">
      <header>
        <p>Explore · local workspace</p>
        <h1 id="explore-profile-title">Private exploration</h1>
        <p>
          You are not signed in. Your exploration is private to this browser and does not create a
          cloud identity.
        </p>
      </header>
      <section aria-labelledby="profile-availability-title">
        <h2 id="profile-availability-title">A durable identity is optional</h2>
        <p>
          Profile details and account editing become available when you decide to keep or sync your
          work. There is no profile to edit in local Explore mode.
        </p>
      </section>
    </article>
  );
}
