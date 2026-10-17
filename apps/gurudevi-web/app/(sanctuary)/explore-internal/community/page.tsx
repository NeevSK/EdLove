export const metadata = { title: 'Community | Gurudevi Explore' };

export default function ExploreCommunityPage() {
  return (
    <article data-domain="community" aria-labelledby="explore-community-title">
      <header>
        <p>Explore · local workspace</p>
        <h1 id="explore-community-title">Community</h1>
        <p>
          Community is a shared canvas. Exploring does not create a profile, join a group, or send
          activity to other people.
        </p>
      </header>
      <section aria-labelledby="community-availability-title">
        <h2 id="community-availability-title">Shared participation needs an account</h2>
        <p>
          Conversations, circles, invitations, and notifications become available only when a person
          chooses a durable account. This space will never pretend that local activity is shared.
        </p>
      </section>
    </article>
  );
}
