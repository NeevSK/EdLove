import styles from './community.module.css';

export default function CommunityLoading() {
  return (
    <main className={styles.floor} id="main-content">
      <section className={styles.state} role="status" aria-live="polite">
        <p className={styles.eyebrow}>Community</p>
        <h1>Your circles are gathering</h1>
        <p>Checking which shared spaces are available to your selected scope…</p>
      </section>
    </main>
  );
}
