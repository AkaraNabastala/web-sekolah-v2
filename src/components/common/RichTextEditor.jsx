import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import DOMPurify from 'dompurify';
import { Editor } from 'primereact/editor';
const escapeHtml = (text) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const markdownToEditorHtml = (value) => {
    if (/<(p|h[1-6]|ul|ol|li|strong|em|a|blockquote|br|div)\b/i.test(value))
        return value;
    const inline = (text) => escapeHtml(text)
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    const lines = value.replace(/\r/g, '').split('\n');
    const blocks = [];
    let index = 0;
    while (index < lines.length) {
        const line = lines[index];
        if (!line.trim()) {
            index += 1;
            continue;
        }
        const heading = line.match(/^(#{1,3}) (.*)$/);
        if (heading) {
            const level = heading[1].length;
            blocks.push(`<h${level}>${inline(heading[2])}</h${level}>`);
            index += 1;
            continue;
        }
        if (/^[-*] /.test(line)) {
            const items = [];
            while (index < lines.length && /^[-*] /.test(lines[index]))
                items.push(`<li>${inline(lines[index++].slice(2))}</li>`);
            blocks.push(`<ul>${items.join('')}</ul>`);
            continue;
        }
        if (/^\d+\. /.test(line)) {
            const items = [];
            while (index < lines.length && /^\d+\. /.test(lines[index]))
                items.push(`<li>${inline(lines[index++].replace(/^\d+\. /, ''))}</li>`);
            blocks.push(`<ol>${items.join('')}</ol>`);
            continue;
        }
        if (line.startsWith('> ')) {
            const items = [];
            while (index < lines.length && lines[index].startsWith('> '))
                items.push(inline(lines[index++].slice(2)));
            blocks.push(`<blockquote><p>${items.join('<br>')}</p></blockquote>`);
            continue;
        }
        const paragraph = [line];
        index += 1;
        while (index < lines.length && lines[index].trim() && !/^(#{1,3} |[-*] |\d+\. |> )/.test(lines[index]))
            paragraph.push(lines[index++]);
        blocks.push(`<p>${paragraph.map(inline).join('<br>')}</p>`);
    }
    return blocks.join('') || '<p><br></p>';
};
export const RichTextEditor = ({ value, onChange, rows = 6, placeholder }) => {
    const safeValue = value ?? '';
    const editorValue = DOMPurify.sanitize(markdownToEditorHtml(safeValue));
    const editorHeight = Math.max(5, rows) * 42;
    return (_jsx("div", { className: "school-rich-editor overflow-hidden rounded-xl border border-stone-200 bg-white focus-within:border-emerald-500", children: _jsx(Editor, { value: editorValue, onTextChange: (event) => onChange(event.htmlValue ?? ''), placeholder: placeholder || 'Tulis konten di sini...', style: { height: `${editorHeight}px` }, className: "w-full" }) }));
};
const inlineContent = (value) => {
    const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\))/g;
    return value.split(pattern).filter(Boolean).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return _jsx("strong", { children: part.slice(2, -2) }, index);
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return _jsx("em", { children: part.slice(1, -1) }, index);
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return _jsx("code", { className: "rounded bg-stone-100 px-1 py-0.5", children: part.slice(1, -1) }, index);
        }
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
        if (link) {
            return _jsx("a", { href: link[2], target: "_blank", rel: "noopener noreferrer", className: "text-emerald-700 underline", children: link[1] }, index);
        }
        return part;
    });
};
const isSpecialLine = (line) => /^(#{1,3} |[-*] |\d+\. |> )/.test(line);
export const RichTextContent = ({ value, className = '' }) => {
    const content = String(value || '');
    const containsHtml = /<(p|h[1-6]|ul|ol|li|strong|em|a|blockquote|br|span|div)\b/i.test(content);
    if (containsHtml) {
        const cleanHtml = DOMPurify.sanitize(content, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a', 'span', 'div'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
            FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form']
        });
        return _jsx("div", { className: className, dangerouslySetInnerHTML: { __html: cleanHtml } });
    }
    const lines = content.replace(/\r/g, '').split('\n');
    const blocks = [];
    let index = 0;
    while (index < lines.length) {
        const line = lines[index];
        if (!line.trim()) {
            index += 1;
            continue;
        }
        const heading = line.match(/^(#{1,3}) (.*)$/);
        if (heading) {
            const level = heading[1].length;
            const content = inlineContent(heading[2]);
            const key = `heading-${index}`;
            if (level === 1)
                blocks.push(_jsx("h2", { className: "mb-3 mt-5 text-2xl font-bold", children: content }, key));
            else if (level === 2)
                blocks.push(_jsx("h3", { className: "mb-2 mt-5 text-xl font-bold", children: content }, key));
            else
                blocks.push(_jsx("h4", { className: "mb-2 mt-4 text-lg font-semibold", children: content }, key));
            index += 1;
            continue;
        }
        if (/^[-*] /.test(line)) {
            const items = [];
            while (index < lines.length && /^[-*] /.test(lines[index])) {
                items.push(lines[index].slice(2));
                index += 1;
            }
            blocks.push(_jsx("ul", { className: "mb-3 list-disc space-y-1 pl-6", children: items.map((item, itemIndex) => _jsx("li", { children: inlineContent(item) }, itemIndex)) }, `ul-${index}`));
            continue;
        }
        if (/^\d+\. /.test(line)) {
            const items = [];
            while (index < lines.length && /^\d+\. /.test(lines[index])) {
                items.push(lines[index].replace(/^\d+\. /, ''));
                index += 1;
            }
            blocks.push(_jsx("ol", { className: "mb-3 list-decimal space-y-1 pl-6", children: items.map((item, itemIndex) => _jsx("li", { children: inlineContent(item) }, itemIndex)) }, `ol-${index}`));
            continue;
        }
        if (line.startsWith('> ')) {
            const quote = [];
            while (index < lines.length && lines[index].startsWith('> ')) {
                quote.push(lines[index].slice(2));
                index += 1;
            }
            blocks.push(_jsx("blockquote", { className: "my-4 border-l-4 border-emerald-200 pl-4 italic text-stone-600", children: quote.map((item, itemIndex) => _jsx("p", { children: inlineContent(item) }, itemIndex)) }, `quote-${index}`));
            continue;
        }
        const paragraph = [line];
        index += 1;
        while (index < lines.length && lines[index].trim() && !isSpecialLine(lines[index])) {
            paragraph.push(lines[index]);
            index += 1;
        }
        blocks.push(_jsx("p", { className: "mb-3 leading-7", children: inlineContent(paragraph.join(' ')) }, `p-${index}`));
    }
    return _jsx("div", { className: className, children: blocks });
};
