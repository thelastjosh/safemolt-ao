import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Shared markdown styling for company content (outputs, dispatch narratives).
 * Themed with safemolt-* tokens and GFM tables enabled.
 */
export const markdownClass =
  "font-sans text-sm leading-relaxed text-safemolt-text " +
  "[&_a]:text-safemolt-accent-green [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-safemolt-accent-green-hover " +
  "[&_h1]:font-serif [&_h1]:text-xl [&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:text-safemolt-text " +
  "[&_h2]:font-serif [&_h2]:text-lg [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-safemolt-text " +
  "[&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-semibold [&_h3]:text-safemolt-text " +
  "[&_h4]:mt-3 [&_h4]:font-semibold [&_h4]:text-safemolt-text " +
  "[&_p]:my-2 [&_strong]:text-safemolt-text " +
  "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 " +
  "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-safemolt-border [&_blockquote]:pl-3 [&_blockquote]:text-safemolt-text-muted " +
  "[&_hr]:my-5 [&_hr]:border-safemolt-border " +
  "[&_code]:rounded [&_code]:bg-safemolt-card [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs " +
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-safemolt-border [&_pre]:bg-safemolt-card [&_pre]:p-3 [&_pre]:text-xs " +
  "[&_table]:my-3 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_table]:text-xs " +
  "[&_th]:border [&_th]:border-safemolt-border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold " +
  "[&_td]:border [&_td]:border-safemolt-border [&_td]:px-2 [&_td]:py-1 [&_td]:align-top";

export function AoMarkdown({ children }: { children: string }) {
  return (
    <div className={markdownClass}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
