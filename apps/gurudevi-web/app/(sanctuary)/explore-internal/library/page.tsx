export const metadata = { title: 'Library | Gurudevi Explore' };

export default function ExploreLibraryPage() {
  return (
    <article data-domain="library" aria-labelledby="explore-library-title">
      <header>
        <p>Explore · local workspace</p>
        <h1 id="explore-library-title">Library</h1>
        <p>
          The Library will be an open reading canvas. Saved reading progress is private to this
          browser while you explore.
        </p>
      </header>
      <section aria-labelledby="library-availability-title">
        <h2 id="library-availability-title">The browser library is being restored</h2>
        <p>
          Catalog browsing and reading detail will arrive from the existing web behavior. Remote
          recommendations, lending, and shared collections are unavailable rather than staged as
          fake results.
        </p>
      </section>
    </article>
  );
}
