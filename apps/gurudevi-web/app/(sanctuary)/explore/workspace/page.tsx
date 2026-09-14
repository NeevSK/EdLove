export const metadata = { title: 'Workspace — Explore | Gurudevi Sanctuary' };

export default function ExploreWorkspacePage() {
  return (
    <article data-domain="workspace" aria-labelledby="explore-workspace-title">
      <header>
        <p>Explore · local workspace</p>
        <h1 id="explore-workspace-title">Workspace</h1>
        <p>
          This is your private workspace canvas. Work created while exploring stays on this device
          until you choose to keep it in an account.
        </p>
      </header>
      <section aria-labelledby="workspace-availability-title">
        <h2 id="workspace-availability-title">Workspace tools are arriving</h2>
        <p>
          Collaborative workspaces, role-based tools, and shared records require durable account and
          browser contracts. They are not simulated here.
        </p>
      </section>
    </article>
  );
}
