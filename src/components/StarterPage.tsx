import Layout from '@theme/Layout';
import StarterMessage from '@theme/StarterMessage';
import styles from './StarterPage.module.css';

type StarterData = {
  greeting: string;
  routePath: string;
};

type StarterPageProps = {
  readonly modules: {
    readonly starterData: StarterData;
  };
};

export default function StarterPage({ modules }: StarterPageProps) {
  const data = modules.starterData;

  return (
    <Layout title="Plugin Starter" description="Example route shipped by the starter plugin">
      <main className={styles.page}>
        <section className={styles.hero}>
          <h1>{data.greeting}</h1>
          <p>
            You are looking at the example route added by the starter plugin. Use it as a sandbox to
            experiment with creating pages, reading data, and wiring client behavior.
          </p>
        </section>

        <StarterMessage />

        <div className={styles.grid}>
          <article className={styles.card}>
            <h2>Inspect plugin data</h2>
            <p>
              Try editing <code>src/plugin.ts</code> to shape the data returned from{' '}
              <code>loadContent</code>. Anything you return becomes available to pages and the
              theme.
            </p>
            <a
              className={styles.cta}
              href="https://docusaurus.io/docs/api/plugin-methods/content-loaded"
            >
              Plugin lifecycle →
            </a>
          </article>

          <article className={styles.card}>
            <h2>Ship client code</h2>
            <p>
              Open <code>src/client/index.ts</code> to see how to register lightweight client
              modules. They run on every route change – perfect for analytics or UI enhancements.
            </p>
            <a
              className={styles.cta}
              href="https://docusaurus.io/docs/api/plugin-methods/get-client-modules"
            >
              Client modules guide →
            </a>
          </article>

          <article className={styles.card}>
            <h2>Start customising</h2>
            <p>
              Remove the example files once you are comfortable. The starter exists to be remixed
              into something unique for your project.
            </p>
            <a className={styles.cta} href="https://docusaurus.io/docs/using-plugins">
              Plugin architecture →
            </a>
          </article>
        </div>
      </main>
    </Layout>
  );
}
