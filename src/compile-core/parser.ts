import { NodeType } from "./ast";
interface Context {
  source: string;
}
enum TagType {
  Start = "start",
  End = "end",
}

/**
 * 字符串解析入口函数
 * @param content
 */
export function baseParse(content: string) {
  // 初始化上下文
  let context = createParseContent(content);
  // 返回ast的root节点
  return createRoot(parseChildren(context, []));
}
function createParseContent(content: string) {
  return {
    source: content,
  };
}
//
function parseChildren(context: Context, ancestors: any[]): any[] {
  let nodes: any[] = [];
  while (!isEnd(context, ancestors)) {
    const source = context.source;
    if (source.startsWith("{{")) {
      const node = parseInterpolation(context);
      nodes.push(node);
    } else if (source[0] == "<") {
      if (/[a-z]/i.test(source[1])) {
        const node = parseElement(context, ancestors);
        nodes.push(node);
      }
    } else {
      const node = parseText(context);
      nodes.push(node);
    }
  }
  return nodes;
}

// 解析插值语句
function parseInterpolation(context: Context) {
  const openDelimiter = "{{";
  const closeDelimiter = "}}";

  // remove begin '{{'
  advanceBy(context, openDelimiter.length);
  const closeIndex = context.source.indexOf(closeDelimiter);
  const rawContentLength = closeIndex;
  // get content and advance
  const content = parseTextData(context, rawContentLength).trim();
  // advance end delimiter
  advanceBy(context, closeDelimiter.length);
  return {
    type: NodeType.INTERPOLATION,
    content: {
      type: NodeType.SIMPLE_EXPRESSION,
      content,
    },
  };
}
/**
 *
 * @param context
 * @param ancestors 开始标签
 * @returns
 */
function parseElement(context: Context, ancestors: any[]) {
  // parse a tag
  const element: any = parseTag(context, TagType.Start); // parse start tag get tagName
  ancestors.push(element);
  element.children = parseChildren(context, ancestors); // parse children to elementNode
  ancestors.pop();
  if (startWithEndTagOpen(context, element)) {
    parseTag(context, TagType.End);
  } else {
    throw new Error("缺少结束标签");
  }
  return element;
}
function startWithEndTagOpen(context: Context, element: any) {
  return context.source.slice(2, 2 + element.tag.length) === element.tag;
}

function parseTag(context: Context, tagType: TagType) {
  const match = /^<\/?([a-z]+)>/i.exec(context.source)!;
  const tag = match[1]; // tagName
  advanceBy(context, match[0].length);
  if (tagType === TagType.End) return; // return if end tag
  return {
    type: NodeType.ELEMENT,
    tag,
  };
}
function parseText(context: Context) {
  let endIndex = context.source.length;
  let endTokens = ["{{", "<"];
  for (let i = 0; i < endTokens.length; i++) {
    const endTokenIndex = context.source.indexOf(endTokens[i]);
    if (endTokenIndex !== -1 && endIndex > endTokenIndex) {
      endIndex = endTokenIndex;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    type: NodeType.TEXT,
    content,
  };
}
function parseTextData(context: Context, length: number) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);
  return content;
}
/**
 * 创建根节点
 * @param children
 * @returns
 */
function createRoot(children: any) {
  return {
    children,
  };
}
/**
 * 移进context
 * @param context
 * @param length
 */
function advanceBy(context: Context, length: number) {
  context.source = context.source.slice(length);
}
function isEnd(context: Context, ancestors: any[]): boolean {
  const s = context.source;
  if (s.startsWith("</")) {
    if (
      ancestors.some((ancestor) => {
        return s.startsWith(`</${ancestor.tag}>`);
      })
    ) {
      return true;
    }
  }
  return !s;
}
