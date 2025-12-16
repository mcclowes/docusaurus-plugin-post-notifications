# docusaurus-plugin-new-post-toast

A Docusaurus plugin that shows toast notifications for new blog posts based on the user's last visit timestamp stored in localStorage.

## Features

- **No backend required** - Works entirely client-side using localStorage
- **Automatic detection** - Compares user's last visit with blog post dates
- **Customizable appearance** - Position, duration, styling options
- **Dismissable toasts** - Users can dismiss notifications permanently
- **Multiple toast support** - Show multiple new post notifications
- **Dark mode support** - Respects Docusaurus theme
- **Accessibility** - Includes ARIA attributes and reduced motion support

## Installation

```bash
npm install docusaurus-plugin-new-post-toast
```

## Basic Usage

Add the plugin to your `docusaurus.config.js`:

```javascript
module.exports = {
  plugins: ['docusaurus-plugin-new-post-toast'],
};
```

That's it! The plugin will automatically show toast notifications for blog posts published since the user's last visit.

## Configuration

```javascript
module.exports = {
  plugins: [
    [
      'docusaurus-plugin-new-post-toast',
      {
        // Enable/disable the plugin (default: true)
        enabled: true,

        // Toast appearance
        toast: {
          position: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center' | 'top-center'
          duration: 8000, // Auto-dismiss after ms (0 = no auto-dismiss)
          maxToasts: 3, // Max toasts to show at once
          showDescription: true, // Show post description
          showDate: true, // Show post date
          showImage: false, // Show post thumbnail if available
        },

        // Behavior
        behavior: {
          showOnFirstVisit: false, // Show toasts on first-ever visit
          maxAgeDays: 30, // Only show posts from last N days
          excludePaths: [], // Don't show toasts on these paths
          onlyOnBlogPages: false, // Only show on /blog/* pages
          delay: 1000, // Delay before showing toast (ms)
        },

        // Storage
        storage: {
          key: 'docusaurus-new-post-toast', // localStorage key prefix
          trackDismissed: true, // Remember dismissed posts
        },

        // Blog integration
        blog: {
          pluginId: 'default', // If using multiple blog instances
          path: '/blog', // Blog path
        },
      },
    ],
  ],
};
```

## How It Works

1. **Build Time**: The plugin hooks into Docusaurus's blog plugin to extract post metadata (title, date, permalink, description)

2. **Runtime**: When a user visits your site:
   - Reads `lastVisit` timestamp from localStorage
   - Compares it against blog post dates
   - Shows toast notifications for posts published since last visit
   - Updates `lastVisit` to current time

3. **User Interaction**:
   - Clicking "Read now" navigates to the post
   - Clicking the dismiss button (×) removes the toast and stores the post ID as dismissed
   - Toasts auto-dismiss after the configured duration

## localStorage Schema

The plugin stores data in localStorage with the following structure:

```json
{
  "lastVisit": "2025-01-14T15:30:00.000Z",
  "dismissedPosts": ["2025-01-10-post-slug", "2024-12-25-holiday-post"],
  "version": 1
}
```

## Multiple Blog Instances

If you have multiple blog instances, specify the `pluginId`:

```javascript
module.exports = {
  plugins: [
    [
      'docusaurus-plugin-new-post-toast',
      {
        blog: {
          pluginId: 'engineering-blog',
          path: '/engineering',
        },
      },
    ],
  ],
};
```

## Styling

The toast component uses CSS modules and respects Docusaurus CSS variables. You can customize the appearance by overriding CSS variables:

```css
:root {
  --ifm-color-primary: #your-color;
  --ifm-background-surface-color: #your-bg;
}
```

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Run tests
npm test

# Start example site
npm run example:start
```

## File Structure

```
src/
├── index.ts           # Main export
├── plugin.ts          # Plugin implementation
├── types.ts           # TypeScript interfaces
├── options.ts         # Option validation & defaults
├── client/
│   ├── index.ts       # Client module (lifecycle hooks)
│   ├── storage.ts     # localStorage utilities
│   └── comparison.ts  # Post date comparison logic
└── theme/
    ├── NewPostToast/  # Toast component
    └── Root/          # Root wrapper for toast container
```

## License

MIT
