import React, { useState } from 'react';
import styles from './styles.module.css';

/**
 * GlossaryTerm component - displays an inline term with tooltip
 *
 * Usage:
 * import GlossaryTerm from '@theme/GlossaryTerm';
 *
 * <GlossaryTerm term="API" definition="Application Programming Interface" />
 * or
 * <GlossaryTerm term="API">custom display text</GlossaryTerm>
 *
 * @param {object} props
 * @param {string} props.term - The glossary term
 * @param {string} props.definition - The definition to show in tooltip
 * @param {React.ReactNode} props.children - Optional custom display text
 */
export default function GlossaryTerm({ term, definition, children }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const displayText = children || term;
  const termId = term.toLowerCase().replace(/\s+/g, '-');

  return (
    <span className={styles.glossaryTermWrapper}>
      <a
        href={`/glossary#${termId}`}
        className={styles.glossaryTerm}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-describedby={`tooltip-${termId}`}
      >
        {displayText}
      </a>
      {definition && (
        <span
          id={`tooltip-${termId}`}
          className={`${styles.tooltip} ${showTooltip ? styles.tooltipVisible : ''}`}
          role="tooltip"
        >
          <strong>{term}:</strong> {definition}
        </span>
      )}
    </span>
  );
}
