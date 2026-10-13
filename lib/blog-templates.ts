/**
 * Premade blog templates.
 *
 * Each template provides a starter HTML body, a default excerpt, and a
 * short description shown on the picker card. When the user picks one we
 * seed the editor + excerpt with these values, then they edit freely.
 *
 * Content is plain HTML (matches what the TipTap editor consumes via
 * `editor.commands.setContent(html)` and stores via `editor.getHTML()`).
 */

export type BlogTemplateId = "standard" | "story" | "insights";

export interface BlogTemplate {
  id: BlogTemplateId;
  name: string;
  description: string;
  /** Accent color for the picker card dot. */
  accent: string;
  /** Starter HTML content the editor opens with. */
  defaultContent: string;
  /** Default excerpt used when the template is selected. */
  defaultExcerpt: string;
}

export const BLOG_TEMPLATES: BlogTemplate[] = [
  {
    id: "standard",
    name: "Standard Article",
    description:
      "A clean, single-column layout. Best for announcements, news, and general posts.",
    accent: "#8bb22e",
    defaultExcerpt:
      "A short summary of your article that appears in listings and previews.",
    defaultContent: `<h2>Introduction</h2>
<p>Start with a strong opening that hooks the reader and sets up the topic.</p>

<h2>Main Section</h2>
<p>Develop your key points here. Use clear paragraphs and keep sentences tight.</p>

<h2>Conclusion</h2>
<p>Wrap up with the takeaway and, if relevant, a call to action.</p>`,
  },
  {
    id: "story",
    name: "Storyteller",
    description:
      "A narrative-driven layout with a hero pull-quote. Best for founder stories, case studies, and features.",
    accent: "#f0601d",
    defaultExcerpt:
      "Open with the moment that defines the story — what happened and why it matters.",
    defaultContent: `<blockquote>"Open with the quote or moment that anchors your story."</blockquote>

<p>Set the scene. Where did this happen, who was involved, and what was at stake?</p>

<h2>The Journey</h2>
<p>Walk the reader through the key beats. Focus on people and decisions, not just facts.</p>

<h2>What We Learned</h2>
<p>Close on the lesson and how it shapes what comes next.</p>`,
  },
  {
    id: "insights",
    name: "Insights & Data",
    description:
      "A structured layout with sectioned takeaways. Best for analysis, reports, and thought leadership.",
    accent: "#4a8fe0",
    defaultExcerpt:
      "A one-line summary of the insight, backed by the data or examples in the post.",
    defaultContent: `<h2>TL;DR</h2>
<p>Lead with the headline insight in one or two sentences.</p>

<h2>Key Findings</h2>
<ul>
  <li><strong>Finding one.</strong> What the data shows and why it matters.</li>
  <li><strong>Finding two.</strong> What the data shows and why it matters.</li>
  <li><strong>Finding three.</strong> What the data shows and why it matters.</li>
</ul>

<h2>What It Means</h2>
<p>Translate the findings into action for the reader.</p>`,
  },
];
