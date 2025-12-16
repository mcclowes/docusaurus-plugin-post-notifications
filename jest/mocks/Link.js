import React from 'react';

export default function Link({ children, to, ...props }) {
  return React.createElement('a', { href: to, ...props }, children);
}
