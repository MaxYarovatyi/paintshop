// Content for the home page, editable without touching components.
// Texts marked PLACEHOLDER are not final copy.

export interface HomeLine {
  key: string;
  title: string;
  text: string;
  href: string;
  linkLabel: string;
  /** Storage path in the "paintings" bucket. Null shows a neutral placeholder. */
  imagePath: string | null;
}

export const HOME_LINES: HomeLine[] = [
  {
    key: "paintings",
    title: "Paintings",
    text: "PLACEHOLDER: Original works on canvas and paper.",
    href: "/gallery",
    linkLabel: "View paintings",
    imagePath: null,
  },
  {
    key: "objects",
    title: "Objects",
    text: "PLACEHOLDER: Small works and objects for living spaces.",
    href: "/contact",
    linkLabel: "Ask about objects",
    imagePath: null,
  },
  {
    key: "murals",
    title: "Murals and commissions",
    text: "PLACEHOLDER: Murals and works made for a specific place.",
    href: "/contact",
    linkLabel: "Discuss a project",
    imagePath: null,
  },
];

export const HOME_DESIGNERS = {
  eyebrow: "For designers and venues",
  heading: "PLACEHOLDER: Works for specific interiors",
  lines: [
    "PLACEHOLDER: Works can be made for a specific interior, including murals.",
    "PLACEHOLDER: Separate terms apply for interior designers.",
    "PLACEHOLDER: Works can be lent for interior photography, with credit.",
  ],
  linkLabel: "Request the lookbook",
  href: "/contact#designers",
};

export const HOME_ABOUT = {
  statement:
    "PLACEHOLDER: A short statement on the work, written or approved by the artist.",
  /** Storage path of the portrait. Null shows a neutral placeholder. */
  portraitPath: null as string | null,
};
