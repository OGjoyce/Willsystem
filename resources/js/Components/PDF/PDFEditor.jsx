import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Button from 'react-bootstrap/Button';
import { useReactToPrint } from "react-to-print";
import './PDFEditor.css'


const PDFEditor = ({ ContentComponent, datas }) => {
  var object_status = datas
  const [editorContent, setEditorContent] = useState('');
  const [documentVersions, setDocumentVersions] = useState({});

  const editor = useEditor({
    extensions: [StarterKit],
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

    console.log(updatedObjectStatus);
  }, [editorContent, documentVersions, object_status]);

  var componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: saveDocumentDOM
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
      <EditorContent editor={editor} />
      <Button variant="primary" onClick={handlePrint} className="mt-3">
        Download as PDF
      </Button>
      <div style={{ display: 'none' }}>
        <PrintComponent ref={componentRef} content={editorContent} />
      </div>
    </div>
  );
};

export default PDFEditor;