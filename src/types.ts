export type PluginStarterOptions = {
  /**
   * Example option to demonstrate typed configuration. Replace or extend as needed.
   */
  enabled?: boolean;
  /**
   * Demonstrates passing a string option that could drive plugin behavior.
   */
  greetingMessage?: string;
  /**
   * Demonstrates adding a custom route via `addRoute`.
   */
  routePath?: string;
};

export type StarterPluginContent = {
  greeting: string;
  routePath: string;
};
