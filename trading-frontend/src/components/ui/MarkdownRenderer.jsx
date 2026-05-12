import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function MarkdownRenderer({ content = "" }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-black prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300 prose-table:text-sm prose-th:border prose-th:border-white/10 prose-th:bg-white/[0.06] prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-4 mt-0 text-3xl font-black text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-7 text-2xl font-black text-cyan-200">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-6 text-xl font-black text-white">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="my-3 leading-7 text-slate-300">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-4 space-y-2 pl-5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 space-y-2 pl-5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="leading-7 text-slate-300">{children}</li>
          ),
          table: ({ children }) => (
            <div className="my-5 overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          code: ({ inline, children }) =>
            inline ? (
              <code className="rounded-md bg-cyan-400/10 px-1.5 py-0.5 text-cyan-200">
                {children}
              </code>
            ) : (
              <pre className="my-4 overflow-auto rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm text-slate-300">
                <code>{children}</code>
              </pre>
            ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 rounded-2xl border-l-4 border-cyan-400 bg-cyan-400/10 p-4 text-slate-200">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}