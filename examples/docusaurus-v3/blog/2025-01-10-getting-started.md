---
slug: getting-started
title: Getting Started with New Post Toast
authors: [demo]
tags: [tutorial, guide]
description: Learn how to install and configure the new post toast plugin for your Docusaurus site.
---

This guide walks you through setting up the new post toast plugin.

<!-- truncate -->

## Installation

```bash
npm install docusaurus-plugin-new-post-toast
```

## Configuration

Add the plugin to your `docusaurus.config.js`:

```javascript
module.exports = {
  plugins: [
    [
      'docusaurus-plugin-new-post-toast',
      {
        toast: {
          position: 'bottom-right',
          duration: 8000,
        },
      },
    ],
  ],
};
```

That's it! The plugin will now show toast notifications for new blog posts.
