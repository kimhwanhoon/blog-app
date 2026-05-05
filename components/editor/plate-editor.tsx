"use client";

import { useCallback, useMemo, useRef } from "react";
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
    <PlateElement
      as="h1"
      {...props}
      className="mt-10 mb-4 font-heading text-3xl font-medium tracking-tight"
    />
  ),
  h2: (props) => (
    <PlateElement
      as="h2"
      {...props}
      className="mt-8 mb-3 font-heading text-2xl font-medium tracking-tight"
    />
  ),
  h3: (props) => (
    <PlateElement
      as="h3"
      {...props}
      className="mt-6 mb-2 font-heading text-xl font-medium tracking-tight"
    />
  ),
  blockquote: (props) => (
    <PlateElement
      as="blockquote"
      {...props}
      className="my-5 border-l border-border pl-4 italic text-muted-foreground"
    />
  ),
  ul: (props) => <PlateElement as="ul" {...props} className="my-4 ml-6 list-disc" />,
  ol: (props) => <PlateElement as="ol" {...props} className="my-4 ml-6 list-decimal" />,
  li: (props) => <PlateElement as="li" {...props} className="my-1" />,
  hr: (props) => (
    <PlateElement {...props}>
      <hr className="my-8 border-border/70" />
      {props.children}
    </PlateElement>
  ),
  a: (props) => (
    <PlateElement
      as="a"
      {...props}
      className="text-foreground underline underline-offset-4"
      attributes={{
        ...props.attributes,
        href: (props.element.url as string) ?? "#",
        target: "_blank",
        rel: "nofollow noreferrer",
      }}
    />
  ),
  p: (props) => (
    <PlateElement as="p" {...props} className="my-4 leading-7" />
  ),
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

function buildPlugins() {
  return [
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
  ];
}

export function PlateEditor({
  initialValue,
  onChange,
}: {
  initialValue: unknown;
  onChange: (value: unknown[]) => void;
}) {
  // Stabilize the onChange callback: Plate reads it during onValueChange,
  // and we don't want changes to the parent's identity to recreate handlers.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Compute the initial value exactly once. usePlateEditor only reads `value`
  // on initial mount, so we don't want it to depend on a re-rendered prop.
  const initial = useMemo(
    () =>
      (Array.isArray(initialValue) && initialValue.length > 0
        ? initialValue
        : initialEmpty) as never,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const editor = usePlateEditor({
    plugins: useMemo(() => buildPlugins(), []),
    value: initial,
  });

  const handleValueChange = useCallback(
    ({ value }: { value: unknown }) => {
      onChangeRef.current(value as unknown[]);
    },
    [],
  );

  return (
    <Plate editor={editor} onValueChange={handleValueChange}>
      <PlateContent
        className="min-h-[400px] outline-none text-base leading-7"
        placeholder="Tell your story…"
      />
    </Plate>
  );
}
