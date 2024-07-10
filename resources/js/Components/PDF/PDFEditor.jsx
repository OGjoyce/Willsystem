import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Button from 'react-bootstrap/Button';
import { useReactToPrint } from "react-to-print";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import './PDFEditor.css';
import './content.css';

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

const PDFEditor = ({ ContentComponent, datas }) => {
  var object_status = datas;

  const [editorContent, setEditorContent] = useState('');
  const [documentVersions, setDocumentVersions] = useState({});
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
    },
  });

  const saveDocumentDOM = useCallback(() => {
    const timestamp = new Date().toISOString();
    const versionNumber = Object.keys(documentVersions).length + 1;
    const newVersion = {
      [`v${versionNumber}`]: {
        content: editorContent,
        timestamp: timestamp
      }
    };

    const updatedDocumentVersions = { ...documentVersions, ...newVersion };
    setDocumentVersions(updatedDocumentVersions);

    const updatedObjectStatus = [
      ...object_status.slice(0, -1),
      { ...object_status[object_status.length - 1], documentDOM: updatedDocumentVersions }
    ];

    object_status = updatedObjectStatus;
    console.log(object_status);
  }, [editorContent, documentVersions, object_status]);

  var componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: saveDocumentDOM,
    documentTitle: 'Document',
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
      <Button variant="primary" onClick={handlePrint} className="mt-3 mb-3">
        Download as PDF
      </Button>
      <EditorContent editor={editor} className="editor-content" />
      <div style={{ display: 'none' }}>
        <PrintComponent ref={componentRef} content={editorContent} />
      </div>
    </div>
  );
};

export default PDFEditor;
