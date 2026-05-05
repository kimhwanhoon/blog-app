"use client";

import {
  Plate,
  PlateContent,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
  type PlateElementProps,
  type PlateLeafProps,
} from "platejs/react";
import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import { LinkPlugin } from "@platejs/link/react";
import { ListPlugin } from "@platejs/list/react";

const initialEmpty = [{ type: "p", children: [{ text: "" }] }];

const elementByType: Record<
  string,
  (props: PlateElementProps) => React.ReactElement
> = {
  h1: (props) => (
    <PlateElement as="h1" {...props} className="mt-8 mb-4 text-3xl font-semibold tracking-tight" />
  ),
  h2: (props) => (
    <PlateElement as="h2" {...props} className="mt-6 mb-3 text-2xl font-semibold tracking-tight" />
  ),
  h3: (props) => (
    <PlateElement as="h3" {...props} className="mt-5 mb-2 text-xl font-semibold tracking-tight" />
  ),
  blockquote: (props) => (
    <PlateElement
      as="blockquote"
      {...props}
      className="my-4 border-l-2 border-border pl-4 italic text-muted-foreground"
    />
  ),
  ul: (props) => <PlateElement as="ul" {...props} className="my-3 ml-6 list-disc" />,
  ol: (props) => <PlateElement as="ol" {...props} className="my-3 ml-6 list-decimal" />,
  li: (props) => <PlateElement as="li" {...props} className="my-1" />,
  hr: (props) => (
    <PlateElement {...props}>
      <hr className="my-6 border-border" />
      {props.children}
    </PlateElement>
  ),
  a: (props) => (
    <PlateElement
      as="a"
      {...props}
      className="text-primary underline underline-offset-2"
      attributes={{
        ...props.attributes,
        href: (props.element.url as string) ?? "#",
        target: "_blank",
        rel: "nofollow noreferrer",
      }}
    />
  ),
  p: (props) => <PlateElement as="p" {...props} className="my-3 leading-7" />,
};

const leafByMark: Record<string, (props: PlateLeafProps) => React.ReactElement> = {
  bold: (props) => <PlateLeaf as="strong" {...props} />,
  italic: (props) => <PlateLeaf as="em" {...props} />,
  underline: (props) => <PlateLeaf as="u" {...props} />,
  strikethrough: (props) => <PlateLeaf as="s" {...props} />,
  code: (props) => (
    <PlateLeaf
      as="code"
      {...props}
      className="rounded bg-muted px-1 py-0.5 font-mono text-sm"
    />
  ),
};

export function PlateEditor({
  initialValue,
  onChange,
}: {
  initialValue: unknown;
  onChange: (value: unknown[]) => void;
}) {
  const editor = usePlateEditor({
    plugins: [
      H1Plugin.withComponent(elementByType.h1),
      H2Plugin.withComponent(elementByType.h2),
      H3Plugin.withComponent(elementByType.h3),
      BlockquotePlugin.withComponent(elementByType.blockquote),
      HorizontalRulePlugin.withComponent(elementByType.hr),
      LinkPlugin.withComponent(elementByType.a),
      ListPlugin,
      BoldPlugin.withComponent(leafByMark.bold),
      ItalicPlugin.withComponent(leafByMark.italic),
      UnderlinePlugin.withComponent(leafByMark.underline),
      StrikethroughPlugin.withComponent(leafByMark.strikethrough),
      CodePlugin.withComponent(leafByMark.code),
    ],
    value: (Array.isArray(initialValue) && initialValue.length > 0
      ? initialValue
      : initialEmpty) as never,
  });

  return (
    <Plate
      editor={editor}
      onValueChange={({ value }) => onChange(value as unknown[])}
    >
      <PlateContent
        className="min-h-[400px] outline-none prose prose-sm dark:prose-invert max-w-none"
        placeholder="Tell your story…"
      />
    </Plate>
  );
}
