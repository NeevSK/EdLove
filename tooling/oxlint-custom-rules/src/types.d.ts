// Minimal types for Oxlint JS plugin development
// Based on oxlint/plugins-dev.d.ts (types not exported, so we redeclare)

interface Position {
  line: number;
  column: number;
}

interface Range {
  start: number;
  end: number;
}

interface SourceLocation {
  start: Position;
  end: Position;
}

interface Node {
  type: string;
  range?: Range;
  loc?: SourceLocation;
  parent?: Node;
  [key: string]: any;
}

interface CommentType {
  type: "Line" | "Block";
  value: string;
  range: Range;
  loc: SourceLocation;
}

interface Token {
  type: string;
  value: string;
  range: Range;
  loc: SourceLocation;
}

interface RuleContext {
  filename: string;
  physicalFilename: string;
  cwd: string;
  sourceCode: any;
  getScope: (node: Node) => any;
  getDeclaredVariables: (node: Node) => any;
  markVariableAsUsed: (name: string, refNode?: Node) => boolean;
  getAllComments: () => CommentType[];
  getCommentsBefore: (nodeOrToken: Node) => CommentType[];
  getCommentsAfter: (nodeOrToken: Node) => CommentType[];
  getCommentsInside: (node: Node) => CommentType[];
  commentsExistBetween: (nodeOrToken1: Node, nodeOrToken2: Node) => boolean;
  getJSDocComment: (node: Node) => CommentType | null;
  getTokens: (node: Node, countOptions?: any, afterCount?: number) => Token[];
  getFirstToken: (node: Node, skipOptions?: any) => Token | null;
  getFirstTokens: (node: Node, countOptions?: any) => Token[];
  getLastToken: (node: Node, skipOptions?: any) => Token | null;
  getLastTokens: (node: Node, countOptions?: any) => Token[];
  getTokenBefore: (nodeOrToken: Node, skipOptions?: any) => Token | null;
  getTokenOrCommentBefore: (nodeOrToken: Node, skip?: number) => Token | CommentType | null;
  getTokensBefore: (nodeOrToken: Node, countOptions?: any) => Token[];
  getTokenAfter: (nodeOrToken: Node, skipOptions?: any) => Token | null;
  getTokenOrCommentAfter: (nodeOrToken: Node, skip?: number) => Token | CommentType | null;
  getTokensAfter: (nodeOrToken: Node, countOptions?: any) => Token[];
  getTokensBetween: (left: Node, right: Node, countOptions?: any) => Token[];
  getFirstTokenBetween: (left: Node, right: Node, skipOptions?: any) => Token | null;
  getFirstTokensBetween: (left: Node, right: Node, countOptions?: any) => Token[];
  getLastTokenBetween: (left: Node, right: Node, skipOptions?: any) => Token | null;
  getLastTokensBetween: (left: Node, right: Node, countOptions?: any) => Token[];
  getTokenByRangeStart: (offset: number, rangeOptions?: any) => Token | null;
  report: (descriptor: ReportDescriptor) => void;
  options: any[];
  parserServices: any;
  parserPath: string;
  settings: any;
}

interface ReportDescriptor {
  messageId?: string;
  message?: string;
  node?: Node;
  loc?: SourceLocation | { start: Position; end: Position };
  data?: Record<string, string | number>;
  fix?: (fixer: RuleFixer) => Fix | Fix[] | null | undefined;
  suggest?: SuggestionDescriptor[];
}

interface RuleFixer {
  insertTextAfter: (nodeOrToken: Node, text: string) => Fix;
  insertTextAfterRange: (range: Range, text: string) => Fix;
  insertTextBefore: (nodeOrToken: Node, text: string) => Fix;
  insertTextBeforeRange: (range: Range, text: string) => Fix;
  remove: (nodeOrToken: Node) => Fix;
  removeRange: (range: Range) => Fix;
  replaceText: (nodeOrToken: Node, text: string) => Fix;
  replaceTextRange: (range: Range, text: string) => Fix;
}

interface Fix {
  range: Range;
  text: string;
}

interface SuggestionDescriptor {
  messageId?: string;
  message?: string;
  fix?: (fixer: RuleFixer) => Fix | Fix[];
  data?: Record<string, string | number>;
}

type RuleListener = Record<string, (node: Node) => void>;

interface RuleMeta {
  type?: "problem" | "suggestion" | "layout";
  docs?: {
    description: string;
    recommended?: boolean;
    url?: string;
  };
  messages: Record<string, string>;
  schema?: any;
  fixable?: "code" | "whitespace";
  hasSuggestions?: boolean;
  deprecated?: boolean | {
    message: string;
    url?: string;
    replacedBy?: { plugin?: string; rule?: string }[];
  };
}

interface Rule {
  name: string;
  meta?: RuleMeta;
  create: (context: RuleContext) => RuleListener;
}

export type { RuleContext, RuleListener, Rule, RuleMeta, Node, SourceLocation, Position, Range };