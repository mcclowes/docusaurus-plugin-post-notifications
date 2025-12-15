import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './styles.module.css';

type StarterGlobalData = {
  greeting: string;
  routePath: string;
};

export default function StarterMessage() {
  const { siteConfig } = useDocusaurusContext();
  const pluginData = usePluginData('docusaurus-plugin-starter') as StarterGlobalData | undefined;

  if (!pluginData) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.icon} role="img" aria-label="sparkles">
        ✨
      </span>
      <div className={styles.content}>
        <h2>{pluginData.greeting}</h2>
        <p>
          The plugin is active for <strong>{siteConfig.title}</strong>. Update{' '}
          <code>src/theme/StarterMessage/index.tsx</code> or swizzle the component to change this
          UI.
        </p>
      </div>
    </div>
  );
}
