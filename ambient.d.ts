// Ambient type declarations for CSS modules
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Ambient type declarations for Docusaurus theme components and hooks
declare module '@theme/Layout' {
  export interface Props {
    children?: React.ReactNode;
    title?: string;
    description?: string;
  }
  export default function Layout(props: Props): JSX.Element;
}

declare module '@theme/StarterMessage' {
  export default function StarterMessage(): JSX.Element | null;
}

declare module '@docusaurus/useDocusaurusContext' {
  export interface DocusaurusContext {
    siteConfig: {
      title: string;
      tagline: string;
      url: string;
      baseUrl: string;
      [key: string]: any;
    };
    [key: string]: any;
  }
  export default function useDocusaurusContext(): DocusaurusContext;
}

declare module '@docusaurus/useGlobalData' {
  export default function useGlobalData(): {
    [pluginName: string]: {
      [pluginId: string]: any;
    };
  };
  export function usePluginData(pluginName: string, pluginId?: string): any;
}
