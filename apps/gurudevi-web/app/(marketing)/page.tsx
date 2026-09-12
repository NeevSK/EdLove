import Link from 'next/link';

const workspaces = [
  ['01', 'For teachers', 'The teacher sanctuary', 'A calm, private place for planning, reflection, and the work that rarely fits inside a timetable.'],
  ['02', 'For learners', 'The learner garden', 'A space to make progress visible while leaving room for curiosity, voice, and a life beyond performance.'],
  ['03', 'For schools', 'The school commons', 'Shared coordination for leaders and teams, designed around the real conditions of Sri Lankan schools.'],
  ['04', 'For families', 'The family bridge', 'Respectful connection between home and school, without flattening relationships into notifications.'],
] as const;

export default function MarketingPage() {
  return (
    <main id="main-content">
      <section className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden bg-ink px-4 py-16 text-paper-light sm:px-8 lg:px-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_44%,rgb(193_225_213_/_0.34),transparent_28%),radial-gradient(circle_at_90%_90%,rgb(212_132_58_/_0.22),transparent_35%)]" />
        <div className="mx-auto grid min-h-[calc(100svh-8rem)] w-full max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] lg:gap-20">
          <div className="max-w-3xl">
            <p className="mb-5 font-sans text-sm font-semibold tracking-[0.04em] text-water">An education ecology</p>
            <h1 className="max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.06em] text-paper-light sm:text-7xl lg:text-8xl">Make room for the people inside education.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-paper-light/75 sm:text-xl">Gurudevi is a respectful education ecology for the people who make learning possible—teachers, learners, schools, and families.</p>
            <div className="mt-9 flex flex-wrap items-center gap-5 font-sans text-sm font-bold">
              <Link className="inline-flex min-h-12 items-center rounded-full bg-lotus px-6 text-ink transition hover:bg-paper-light focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-lotus" href="/sanctuary">Enter the sanctuary <span aria-hidden="true" className="ml-2">↘</span></Link>
              <Link className="text-paper-light/80 underline decoration-paper-light/30 underline-offset-8 transition hover:text-paper-light" href="#workspaces">Explore the four spaces <span aria-hidden="true">↓</span></Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm lg:max-w-md" aria-hidden="true">
            <svg className="h-auto w-full" viewBox="0 0 400 400" role="presentation">
              <circle cx="200" cy="200" r="150" fill="none" stroke="rgb(193 225 213 / .18)" strokeWidth="1" />
              <circle cx="200" cy="200" r="112" fill="none" stroke="rgb(193 225 213 / .22)" strokeWidth="1" strokeDasharray="2 10" />
              <path d="M200 200C145 168 132 96 200 54c68 42 55 114 0 146Z" fill="rgb(193 225 213 / .8)" />
              <path d="M200 200C232 145 304 132 346 200c-42 68-114 55-146 0Z" fill="rgb(212 132 58 / .75)" />
              <path d="M200 200C255 232 268 304 200 346c-68-42-55-114 0-146Z" fill="rgb(111 148 169 / .7)" />
              <path d="M200 200C168 255 96 268 54 200c42-68 114-55 146 0Z" fill="rgb(245 237 214 / .76)" />
              <circle cx="200" cy="200" r="26" fill="rgb(212 132 58)" />
              <path d="M187 201c7-12 18-12 26 0-8 14-19 14-26 0Z" fill="rgb(31 45 61)" />
            </svg>
          </div>
        </div>
        <p className="mx-auto mt-10 flex w-full max-w-7xl justify-between border-t border-paper-light/20 pt-4 font-sans text-xs uppercase tracking-[0.12em] text-paper-light/55"><span>Built around the people who make learning possible in Sri Lanka.</span><span aria-hidden="true">↓</span></p>
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-20 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-16 lg:py-32" id="ecology">
        <p className="font-sans text-sm font-semibold tracking-[0.04em] text-lotus">The reality</p>
        <div className="max-w-3xl"><h2 className="text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-6xl">Education is held together by people carrying too much alone.</h2><p className="mt-7 max-w-2xl text-lg leading-8 text-ink-soft">Gurudevi exists to make the relationships around learning easier to see, easier to support, and worthy of care—replacing administrative exhaustion with calm, sovereign spaces.</p></div>
      </section>
      <section className="border-y border-line bg-paper-light px-4 py-20 sm:px-8 lg:px-16 lg:py-28" id="workspaces" aria-labelledby="workspaces-title">
        <div className="mx-auto max-w-7xl"><div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]"><div><p className="font-sans text-sm font-semibold tracking-[0.04em] text-lotus">The living ecology</p><h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl" id="workspaces-title">Four spaces, one connected system.</h2></div><p className="max-w-md text-lg leading-8 text-ink-soft">Each space gives teachers, students, leaders, and families a dignified home—without surveillance or role flattening.</p></div>
          <div className="mt-14 divide-y divide-line border-t border-line">{workspaces.map(([number, role, name, body]) => <article className="grid gap-4 py-7 sm:grid-cols-[4rem_1fr_1fr] sm:items-start" key={number}><span className="font-sans text-sm text-lotus">{number}</span><div><p className="font-sans text-sm font-semibold tracking-[0.04em] text-ink-soft">{role}</p><h3 className="mt-2 text-2xl font-medium">{name}</h3></div><p className="max-w-md leading-7 text-ink-soft">{body}</p></article>)}</div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-16 lg:py-32"><div className="flex h-24 w-24 items-center justify-center rounded-full border border-lotus/40 text-4xl text-lotus">✦</div><div><p className="font-sans text-sm font-semibold tracking-[0.04em] text-lotus">The promise</p><h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Support should never become surveillance.</h2><p className="mt-7 max-w-2xl text-lg leading-8 text-ink-soft">Gurudevi is engineered with local-first privacy: enough shared coordination to support an entire school, with absolute cryptographic privacy for educators and learners.</p><Link className="mt-7 inline-block font-sans text-sm font-bold underline decoration-lotus underline-offset-8" href="/about">Read our epistemic foundation and research grounding ↗</Link></div></section>
      <section className="bg-ink px-4 py-20 text-paper-light sm:px-8 lg:px-16 lg:py-28" id="launch"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"><div><p className="font-sans text-sm font-semibold tracking-[0.04em] text-water">The first opening · Alpha Genesis</p><h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Gurudevi Alpha opens on October 6, 2026.</h2><p className="mt-7 max-w-2xl text-lg leading-8 text-paper-light/70">We are preparing a public home for a more humane education ecology. Follow the opening, or speak with us about bringing pilot cohorts to your school.</p></div><div className="border-t border-paper-light/20 pt-6"><p className="font-sans text-2xl text-paper-light">Preparing the sanctuary…</p><p className="mt-2 font-sans text-sm tracking-[0.04em] text-paper-light/50">Sri Lanka Standard Time · Alpha</p><Link className="mt-8 inline-flex min-h-12 items-center rounded-full bg-paper px-6 font-sans text-sm font-bold text-ink hover:bg-lotus" href="/sanctuary">Open the platform ↗</Link></div></div></section>
    </main>
  );
}
