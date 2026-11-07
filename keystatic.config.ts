import { block, wrapper } from "@keystatic/core/content-components";
import { collection, config, fields, singleton } from "@keystatic/core";

/**
 * Keystatic schema: the source of truth for `content/`. The shapes the site
 * reads are in `src/content/`, the only importer of Keystatic's reader.
 *
 * Every collection keeps its slug in a field of its own (`slug`), never the
 * title, so editing a title cannot rename the entry folder or change its URL.
 *
 * Storage: GitHub mode on Vercel (VERCEL is set at build and runtime), local mode
 * everywhere else, so CI and `next start` builds need no secrets.
 * GitHub mode reads KEYSTATIC_GITHUB_CLIENT_ID, KEYSTATIC_GITHUB_CLIENT_SECRET
 * and KEYSTATIC_SECRET from the environment; see .env.example.
 */

const REPO = { owner: "defaultdave", name: "defaultdave" } as const;

const ISO_MONTH_MESSAGE = "Use an ISO month, like 2026-03";
const isoMonth = {
  regex: /^\d{4}-(0[1-9]|1[0-2])$/,
  message: ISO_MONTH_MESSAGE,
};
/** Same, but an empty value is allowed (an ongoing period has no end). */
const optionalIsoMonth = {
  regex: /^(\d{4}-(0[1-9]|1[0-2]))?$/,
  message: ISO_MONTH_MESSAGE,
};

const slugField = fields.slug({
  name: {
    label: "Slug",
    description:
      "The URL and folder name. Set once and leave alone; it is separate from the title on purpose.",
    validation: { length: { min: 1 } },
  },
});

const link = fields.object(
  {
    label: fields.text({ label: "Label", validation: { isRequired: true } }),
    href: fields.url({ label: "URL", validation: { isRequired: true } }),
  },
  { label: "Link" },
);

const optionalImage = (directory: string) =>
  fields.object(
    {
      src: fields.image({
        label: "Image",
        directory: `public/images/${directory}`,
        publicPath: `/images/${directory}/`,
      }),
      alt: fields.text({
        label: "Alt text",
        description: "Required when an image is set.",
      }),
    },
    { label: "Image" },
  );

/** Editor-side definitions of the MDX components registered in src/components/mdx. */
const mdxComponents = {
  Callout: wrapper({
    label: "Callout",
    schema: {
      tone: fields.select({
        label: "Tone",
        options: [
          { label: "Note", value: "note" },
          { label: "Warning", value: "warning" },
        ],
        defaultValue: "note",
      }),
    },
  }),
  Metric: block({
    label: "Metric",
    schema: {
      label: fields.text({ label: "Label", validation: { isRequired: true } }),
      value: fields.text({ label: "Value", validation: { isRequired: true } }),
      note: fields.text({ label: "Note" }),
    },
  }),
  Figure: block({
    label: "Figure",
    schema: {
      src: fields.image({
        label: "Image",
        directory: "public/images/figures",
        publicPath: "/images/figures/",
        validation: { isRequired: true },
      }),
      alt: fields.text({ label: "Alt text", validation: { isRequired: true } }),
      caption: fields.text({ label: "Caption" }),
    },
  }),
};

const body = (label: string) =>
  fields.mdx({ label, extension: "mdx", components: mdxComponents });

const postSchema = {
  slug: slugField,
  title: fields.text({ label: "Title", validation: { isRequired: true } }),
  summary: fields.text({
    label: "Summary",
    multiline: true,
    validation: { isRequired: true },
  }),
  publishedAt: fields.date({
    label: "Published",
    validation: { isRequired: true },
  }),
  updatedAt: fields.date({ label: "Updated" }),
  canonicalUrl: fields.url({
    label: "Canonical URL",
    description: "Set when the piece was first published elsewhere.",
  }),
  body: body("Body"),
};

export default config({
  storage: process.env.VERCEL
    ? { kind: "github", repo: REPO }
    : { kind: "local" },
  collections: {
    work: collection({
      label: "Work",
      path: "content/work/*/",
      slugField: "slug",
      format: { contentField: "body" },
      schema: {
        slug: slugField,
        title: fields.text({
          label: "Title",
          validation: { isRequired: true },
        }),
        kind: fields.select({
          label: "Kind",
          description: "Case studies get a detail page; cards do not.",
          options: [
            { label: "Case study", value: "case-study" },
            { label: "Card", value: "card" },
          ],
          defaultValue: "card",
        }),
        summary: fields.text({
          label: "Summary",
          multiline: true,
          validation: { isRequired: true },
        }),
        role: fields.text({ label: "Role", validation: { isRequired: true } }),
        period: fields.object(
          {
            from: fields.text({
              label: "From",
              validation: { isRequired: true, pattern: isoMonth },
            }),
            to: fields.text({
              label: "To",
              description: "Leave empty for ongoing.",
              validation: { pattern: optionalIsoMonth },
            }),
          },
          { label: "Period" },
        ),
        stack: fields.array(fields.text({ label: "Technology" }), {
          label: "Stack",
          itemLabel: (props) => props.value,
        }),
        links: fields.array(link, {
          label: "Links",
          itemLabel: (props) => props.fields.label.value,
        }),
        featured: fields.checkbox({ label: "Featured", defaultValue: false }),
        order: fields.integer({
          label: "Order",
          description: "Lower comes first within featured and non-featured.",
          defaultValue: 100,
          validation: { isRequired: true },
        }),
        cover: optionalImage("work"),
        metrics: fields.array(
          fields.object({
            label: fields.text({
              label: "Label",
              validation: { isRequired: true },
            }),
            value: fields.text({
              label: "Value",
              validation: { isRequired: true },
            }),
            note: fields.text({ label: "Note" }),
          }),
          { label: "Metrics", itemLabel: (props) => props.fields.label.value },
        ),
        body: body("Case study body"),
      },
    }),
    articles: collection({
      label: "Articles",
      path: "content/articles/*/",
      slugField: "slug",
      format: { contentField: "body" },
      schema: postSchema,
    }),
    musings: collection({
      label: "Musings",
      path: "content/musings/*/",
      slugField: "slug",
      format: { contentField: "body" },
      schema: postSchema,
    }),
    music: collection({
      label: "Music",
      path: "content/music/*/",
      slugField: "slug",
      format: { contentField: "notes" },
      schema: {
        slug: slugField,
        title: fields.text({
          label: "Title",
          validation: { isRequired: true },
        }),
        year: fields.integer({
          label: "Year",
          validation: { isRequired: true, min: 1990, max: 2100 },
        }),
        host: fields.select({
          label: "Host",
          options: [
            { label: "Bandcamp", value: "bandcamp" },
            { label: "SoundCloud", value: "soundcloud" },
            { label: "Spotify", value: "spotify" },
            { label: "YouTube", value: "youtube" },
          ],
          defaultValue: "bandcamp",
        }),
        embedUrl: fields.url({
          label: "Embed URL",
          validation: { isRequired: true },
        }),
        aspect: fields.select({
          label: "Aspect",
          options: [
            { label: "16:9", value: "16:9" },
            { label: "1:1", value: "1:1" },
            { label: "Auto", value: "auto" },
          ],
          defaultValue: "1:1",
        }),
        notes: body("Release notes"),
      },
    }),
  },
  singletons: {
    home: singleton({
      label: "Home",
      path: "content/home/",
      format: { contentField: "intro" },
      schema: {
        headline: fields.text({
          label: "Headline",
          validation: { isRequired: true },
        }),
        featuredWork: fields.array(
          fields.relationship({ label: "Work entry", collection: "work" }),
          { label: "Featured work", itemLabel: (props) => props.value ?? "" },
        ),
        intro: body("Intro"),
      },
    }),
    about: singleton({
      label: "About",
      path: "content/about/",
      format: { contentField: "bio" },
      schema: {
        headshot: optionalImage("about"),
        links: fields.array(link, {
          label: "Links",
          itemLabel: (props) => props.fields.label.value,
        }),
        bio: body("Bio"),
      },
    }),
  },
});
