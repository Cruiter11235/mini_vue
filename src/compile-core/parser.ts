import { NodeType } from "./ast";

const openDelimiter = "{{";
const closeDelimiter = "}}";
const enum TagTap {
  START = "start",
  END = "END",
}

/**
 * @description 解析content
 * @param content
 * @returns
 */
export function baseParser(content: string) {
  const context = createParserContent(content);
  return createRoot(parserChildren(context, []));
}
/**
 * @description 解析context.source ，获取nodes
 * @param context
 * @returns
 */
function parserChildren(context: Context, ancester: any[]) {
  const nodes: any[] = [];
  context.source = context.source.trim();

  while (!isEnd(context, ancester)) {
    const s = context.source;
    let node;
    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      if (/[a-zA-Z]/i.test(s[1])) {
        console.log("parse element");
        node = parseElement(context, ancester);
      }
    }

    if (!node) {
      node = parseText(context);
    }
    nodes.push(node);
  }
  return nodes;
}
/**
 * @description 解析context，获取content
 * @param context
 * @returns
 */
function parseInterpolation(context: Context) {
  // indexOf 结果是第一个匹配串的后面一个位置
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );
  context.source = context.source.slice(openDelimiter.length);
  const rawContentLength = closeIndex - closeDelimiter.length;

  //  解析后的变量
  const content = parseTextData(context, rawContentLength).trim();
  //   console.log("content.source", context.source);
  console.log("content", content);

  advanceTo(context, rawContentLength + closeDelimiter.length);
  return {
    type: NodeType.INTERPOLATION,
    content: {
      type: NodeType.SIMPLE_EXPRESSION,
      content,
    },
  };
}
/**
 * 将context.source的起始指针移动到bias
 * @param context
 * @param bias
 */
function advanceTo(context: Context, bias: number) {
  context.source = context.source.slice(bias);
}

function createRoot(children: any) {
  return {
    children,
  };
}
function createParserContent(content: string) {
  return {
    source: content,
  };
}
function parseElement(context: Context, ancester: any[]) {
  // match start
  const element: any = parseTag(context, TagTap.START);
  ancester.push(element);
  element.children = parserChildren(context, ancester);
  ancester.pop();
  //   match end
  if (startsWithEndTagOpen(context, element)) {
    parseTag(context, TagTap.END);
  } else {
    throw Error("tag不匹配");
  }
  console.log("context", context);
  return element;
}
function startsWithEndTagOpen(context: Context, element: any) {
  return (
    context.source.startsWith("</") &&
    context.source.slice(2, 2 + element.tag.length).toLowerCase() ===
      element.tag
  );
}

function parseTag(context: Context, type: TagTap) {
  const match = /^<\/?([a-zA-Z]*)/i.exec(context.source) || "";
  const tag = match[1];
  //   drop <div
  advanceTo(context, match[0].length);
  //   drop >
  advanceTo(context, 1);

  if (type === TagTap.END) {
    return;
  }
  return {
    type: NodeType.ELEMENT,
    tag,
  };
}
function parseText(context: Context): any {
  // get content
  // advance
  let endTokens = ["{{", "<"];
  let endIndex = context.source.length;
  //  如果有{{ ,reset endIndex
  for (const token of endTokens) {
    const newEndIndex = context.source.indexOf(token);
    if (newEndIndex !== -1) {
      endIndex = Math.min(endIndex, newEndIndex);
    }
  }
  const content = parseTextData(context, endIndex);
  console.log("content", content);
  advanceTo(context, content.length);
  return {
    type: NodeType.TEXT,
    content: content,
  };
}
function parseTextData(context: Context, len: number) {
  return context.source.slice(0, len);
}
// if context.source = ""?
function isEnd(context: Context, ancestor: any[]) {
  const s = context.source;
  // "end tag"
  if (s.startsWith(`</`)) {
    for (let i = ancestor.length - 1; i >= 0; i--) {
      const tag = ancestor[i].tag;
      if (startsWithEndTagOpen(context, ancestor[i])) {
        return true;
      }
    }
  }

  // ""
  return !context.source;
}
