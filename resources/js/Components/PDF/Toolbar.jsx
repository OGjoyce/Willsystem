import Button from 'react-bootstrap/Button';

const Toolbar = ({ editor }) => {
    if (!editor) {
        return null;
    }


    return (
        <div className="toolbar">
            <div className="toolbar-inner">
                <div className="toolbar-group">
                    <Button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        variant={editor.isActive('bold') ? 'primary' : 'light'}
                        title="Bold"
                    >
                        <i className="bi bi-type-bold"></i>
                    </Button>
                    <Button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        variant={editor.isActive('italic') ? 'primary' : 'light'}
                        title="Italic"
                    >
                        <i className="bi bi-type-italic"></i>
                    </Button>
                    <Button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        variant={editor.isActive('underline') ? 'primary' : 'light'}
                        title="Underline"
                    >
                        <i className="bi bi-type-underline"></i>
                    </Button>
                </div>
                <div className="toolbar-group">
                    <Button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        variant={editor.isActive('heading', { level: 1 }) ? 'primary' : 'light'}
                        title="Heading 1"
                    >
                        <i className="bi bi-type-h1"></i>
                    </Button>
                    <Button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        variant={editor.isActive('heading', { level: 2 }) ? 'primary' : 'light'}
                        title="Heading 2"
                    >
                        <i className="bi bi-type-h2"></i>
                    </Button>
                </div>
                <div className="toolbar-group">
                    <Button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        variant={editor.isActive('bulletList') ? 'primary' : 'light'}
                        title="Bullet List"
                    >
                        <i className="bi bi-list-ul"></i>
                    </Button>
                    <Button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        variant={editor.isActive('orderedList') ? 'primary' : 'light'}
                        title="Ordered List"
                    >
                        <i className="bi bi-list-ol"></i>
                    </Button>
                </div>
                <div className="toolbar-group">
                    <Button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        variant={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'light'}
                        title="Align Left"
                    >
                        <i className="bi bi-text-left"></i>
                    </Button>
                    <Button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        variant={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'light'}
                        title="Align Center"
                    >
                        <i className="bi bi-text-center"></i>
                    </Button>
                    <Button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        variant={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'light'}
                        title="Align Right"
                    >
                        <i className="bi bi-text-right"></i>
                    </Button>
                    <Button
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        variant={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'light'}
                        title="Justify"
                    >
                        <i className="bi bi-justify"></i>
                    </Button>
                </div>
                <div className="toolbar-group">
                    <Button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        variant="light"
                        title="Undo"
                    >
                        <i className="bi bi-arrow-counterclockwise"></i>
                    </Button>
                    <Button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        variant="light"
                        title="Redo"
                    >
                        <i className="bi bi-arrow-clockwise"></i>
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default Toolbar