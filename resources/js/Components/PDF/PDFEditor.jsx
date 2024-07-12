import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Button from 'react-bootstrap/Button';
import { useReactToPrint } from "react-to-print";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold, faItalic, faUnderline, faHeading, faListUl, faListOl, faQuoteRight, faUndo, faRedo, faSave
} from '@fortawesome/free-solid-svg-icons';
import './PDFEditor.css';
import '@/Components/PDF/Content/content.css';

const contentcss = `
.document-container ol {
    list-style-type: decimal;
    margin-left: 48px;
}

.document-container ul {
    list-style-type: disc;
    margin-left: 48px;
}

.align-center {
    text-align: center;
}

body {
    font-family: 'Times New Roman', Times, serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

h1 {
    text-align: center;
    font-size: 24px;
    margin-bottom: 30px;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
}

h2 {
    font-size: 18px;
    margin-top: 30px;
    margin-bottom: 15px;
    border-bottom: 1px solid #999;
    padding-bottom: 5px;
}

h3 {
    font-size: 16px;
    margin-top: 20px;
    margin-bottom: 10px;
}

p,
ul,
ol {
    margin-bottom: 15px;
}

ul,
ol {
    padding-left: 30px;
}

.document-header {
    text-align: right;
    font-size: 8px;
    font-weight: 600;
}

.signature-line {
    border-top: 1px solid #333;
    width: 50%;
    margin-top: 50px;
}

@media print {
    body {
        font-size: 12pt;
    }

    h1 {
        font-size: 18pt;
    }

    h2 {
        font-size: 14pt;
    }

    h3 {
        font-size: 12pt;
    }

    .page-break {
        page-break-before: always;
    }
}`;

var updatedObjectStatus = [];

export function getDocumentDOMInfo() {
  return updatedObjectStatus[updatedObjectStatus.length - 1]?.documentDOM;
}

const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
      >
        <FontAwesomeIcon icon={faBold} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
      >
        <FontAwesomeIcon icon={faItalic} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
        title="Underline"
      >
        <FontAwesomeIcon icon={faUnderline} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        title="Heading 1"
      >
        <FontAwesomeIcon icon={faHeading} /> 1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        title="Heading 2"
      >
        <FontAwesomeIcon icon={faHeading} /> 2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title="Bullet List"
      >
        <FontAwesomeIcon icon={faListUl} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        title="Ordered List"
      >
        <FontAwesomeIcon icon={faListOl} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
        title="Blockquote"
      >
        <FontAwesomeIcon icon={faQuoteRight} />
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <FontAwesomeIcon icon={faUndo} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <FontAwesomeIcon icon={faRedo} />
      </button>
    </div>
  );
};

const PDFEditor = ({ ContentComponent, datas, documentType }) => {
  var object_status = datas;

  const [editorContent, setEditorContent] = useState('');
  const [documentVersions, setDocumentVersions] = useState({});


  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
    },
  });

  const saveDocumentDOM = useCallback(() => {
    const timestamp = new Date().toISOString();
    const currentVersions = documentVersions[documentType] || {};
    const versionNumber = Object.keys(currentVersions).length + 1;
    const newVersion = {
      [`v${versionNumber}`]: {
        content: editorContent,
        timestamp: timestamp
      }
    };

    const updatedDocumentVersions = {
      ...documentVersions,
      [documentType]: {
        ...currentVersions,
        ...newVersion
      }
    };

    setDocumentVersions(updatedDocumentVersions);

    const lastObjectIndex = object_status.length - 1;
    const updatedLastObject = {
      ...object_status[lastObjectIndex],
      documentDOM: updatedDocumentVersions
    };

    updatedObjectStatus = [
      ...object_status.slice(0, lastObjectIndex),
      updatedLastObject
    ];

    object_status = updatedObjectStatus;

    console.log(`Document ${documentType} saved. Version: v${versionNumber}`);
    console.log(object_status)
  }, [editorContent, documentVersions, documentType, object_status]);

  var componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: saveDocumentDOM,
    documentTitle: documentType,
    pageStyle: contentcss
  });

  const PrintComponent = React.forwardRef((props, ref) => {
    return (
      <div ref={ref} dangerouslySetInnerHTML={{ __html: props.content }} />
    );
  });

  useEffect(() => {
    try {
      const ContentComponentWithRef = React.forwardRef((props, ref) => (
        <ContentComponent ref={ref} props={{ datas }} />
      ));

      const documentHtml = ReactDOMServer.renderToString(
        <ContentComponentWithRef />
      );
      setEditorContent(documentHtml);
      if (editor) {
        editor.commands.setContent(documentHtml);
      }


    } catch (error) {
      console.error("ERROR while rendering document:", error);
      setEditorContent("No content to show");
    }
  }, [object_status, ContentComponent, editor]);

  useEffect(() => {
    const latestVersion = object_status[object_status.length - 1]?.documentDOM;
    if (latestVersion) {
      setDocumentVersions(latestVersion);
    }
  }, [object_status]);

  return (
    <div className="editor">
      <div className="toolbar-container">
        <Toolbar editor={editor} />
      </div>
      <EditorContent editor={editor} className="editor-content" />

      <div style={{ display: 'none' }}>
        <PrintComponent ref={componentRef} content={editorContent} />
      </div>
      <Button variant="primary" onClick={handlePrint} className="mt-3 mb-3 mr-2">
        Download as PDF
      </Button>
      <Button variant="success" onClick={saveDocumentDOM} className="mt-3 mb-3">
        <FontAwesomeIcon icon={faSave} /> Save Document
      </Button>
    </div>
  );
};

export default PDFEditor;
