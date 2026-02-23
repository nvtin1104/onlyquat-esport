import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Link as LinkIcon,
    Unlink,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
    Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback, useEffect } from 'react';

export interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Nhập đường dẫn URL:', previousUrl);

        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const IconButton = ({ icon: Icon, onClick, isActive, disabled = false, title }: any) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'p-1.5 rounded-sm flex items-center justify-center transition-colors cursor-pointer',
                isActive ? 'bg-accent-acid/10 text-accent-acid' : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        >
            <Icon className="w-4 h-4" />
        </button>
    );

    const Divider = () => <div className="w-[1px] h-4 bg-border-subtle mx-1" />;

    return (
        <div className="flex flex-wrap items-center gap-0.5 p-1 border-b border-border-subtle bg-bg-surface rounded-t-sm">
            <IconButton
                icon={Bold}
                title="Đậm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
            />
            <IconButton
                icon={Italic}
                title="Nghiêng"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
            />
            <IconButton
                icon={UnderlineIcon}
                title="Gạch dưới"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
            />
            <IconButton
                icon={Strikethrough}
                title="Gạch ngang"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
            />

            <Divider />

            <IconButton
                icon={Heading1}
                title="Tiêu đề 1"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
            />
            <IconButton
                icon={Heading2}
                title="Tiêu đề 2"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
            />
            <IconButton
                icon={Quote}
                title="Trích dẫn"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
            />

            <Divider />

            <IconButton
                icon={AlignLeft}
                title="Căn trái"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
            />
            <IconButton
                icon={AlignCenter}
                title="Căn giữa"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
            />
            <IconButton
                icon={AlignRight}
                title="Căn phải"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
            />

            <Divider />

            <IconButton
                icon={List}
                title="Danh sách"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
            />
            <IconButton
                icon={ListOrdered}
                title="Danh sách số"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
            />

            <Divider />

            <IconButton
                icon={LinkIcon}
                title="Thêm liên kết"
                onClick={setLink}
                isActive={editor.isActive('link')}
            />
            <IconButton
                icon={Unlink}
                title="Xóa liên kết"
                onClick={() => editor.chain().focus().unsetLink().run()}
                disabled={!editor.isActive('link')}
            />
        </div>
    );
};

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Nhập nội dung...',
    className,
    minHeight = '150px'
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-accent-acid hover:underline cursor-pointer',
                },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            // Tiptap returns <p></p> for empty content, we want empty string
            if (html === '<p></p>' || html === '') {
                onChange('');
            } else {
                onChange(html);
            }
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3',
                    // Tiptap placeholder styling
                    '[&_.tiptap.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap.is-editor-empty:first-child::before]:float-left [&_.tiptap.is-editor-empty:first-child::before]:text-text-dim [&_.tiptap.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap.is-editor-empty:first-child::before]:h-0'
                ),
                style: `min-height: ${minHeight};`,
            },
        },
    });

    // Update content if value changes from outside (e.g. form reset)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // handle edge case where value is empty but editor has <p></p>
            if (!value && editor.getHTML() === '<p></p>') return;
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className={cn('flex flex-col border border-border-subtle bg-bg-elevated rounded-sm overflow-hidden focus-within:border-accent-acid transition-colors', className)}>
            <MenuBar editor={editor} />
            <div className="flex-1 overflow-y-auto w-full [&>div]:h-full cursor-text" onClick={() => editor?.commands.focus()}>
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
}
