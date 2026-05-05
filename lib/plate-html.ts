type Node =
  | { type: string; children: Node[]; [key: string]: unknown }
  | (Leaf & { text: string });

type Leaf = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function serializeLeaf(leaf: Leaf): string {
  let html = escapeHtml(leaf.text).replace(/\n/g, "<br/>");
  if (leaf.code) html = `<code>${html}</code>`;
  if (leaf.bold) html = `<strong>${html}</strong>`;
  if (leaf.italic) html = `<em>${html}</em>`;
  if (leaf.underline) html = `<u>${html}</u>`;
  if (leaf.strikethrough) html = `<s>${html}</s>`;
  return html;
}

function serializeNode(node: Node): string {
  if ("text" in node) return serializeLeaf(node as Leaf);

  const children = (node.children ?? []).map(serializeNode).join("");
  switch (node.type) {
    case "h1":
      return `<h1>${children}</h1>`;
    case "h2":
      return `<h2>${children}</h2>`;
    case "h3":
      return `<h3>${children}</h3>`;
    case "blockquote":
      return `<blockquote>${children}</blockquote>`;
    case "code_block": {
      return `<pre><code>${children}</code></pre>`;
    }
    case "code_line":
      return `${children}\n`;
    case "ul":
      return `<ul>${children}</ul>`;
    case "ol":
      return `<ol>${children}</ol>`;
    case "li":
      return `<li>${children}</li>`;
    case "lic":
      return children;
    case "hr":
      return `<hr/>`;
    case "a": {
      const url = typeof node.url === "string" ? node.url : "#";
      return `<a href="${escapeHtml(url)}" rel="nofollow noreferrer" target="_blank">${children}</a>`;
    }
    case "img": {
      const url = typeof node.url === "string" ? node.url : "";
      const alt = typeof node.alt === "string" ? node.alt : "";
      return url
        ? `<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}"/></figure>`
        : "";
    }
    case "p":
    default:
      return `<p>${children}</p>`;
  }
}

export function plateToHtml(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return (value as Node[]).map(serializeNode).join("");
}

export function plateToExcerpt(value: unknown, max = 200): string {
  if (!Array.isArray(value)) return "";
  const out: string[] = [];
  const walk = (n: Node) => {
    if ("text" in n) out.push((n as Leaf).text);
    else (n.children ?? []).forEach(walk);
  };
  (value as Node[]).forEach(walk);
  const text = out.join(" ").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
