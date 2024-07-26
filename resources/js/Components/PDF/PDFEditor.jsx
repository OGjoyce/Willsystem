import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Container, Row, Col, Button, Toast, ToastContainer } from 'react-bootstrap';
import Toolbar from './Toolbar'
import { useReactToPrint } from "react-to-print";
import { updateDataObject } from '../ObjStatusForm';

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



const PDFEditor = ({ ContentComponent, datas, documentType, errors, backendId }) => {
  var object_status = datas;
  var id = backendId
  var latestDocumentDOM = null

  //SET DOCUMENT DOM IF EXISTS
  if (object_status) {

    const data = object_status.reduce((acc, item) => ({ ...acc, ...item }), {});
    let documentVersions = data.documentDOM[documentType];
    let latestVersion = null;

    if (documentVersions) {
      let latestVersionKey = Object.keys(documentVersions).reduce((a, b) =>
        parseInt(a) > parseInt(b) ? a : b
      );
      latestVersion = documentVersions[latestVersionKey];
      latestDocumentDOM = latestVersion.content;
    }
  }

  const [editorContent, setEditorContent] = useState('');
  const [documentVersions, setDocumentVersions] = useState({});
  const [validationErrors, setValidationErrors] = useState(errors)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    setValidationErrors(errors)
  }, [errors])

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
    setShowToast(true)
    setValidationErrors({})
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
    updateDataObject(updatedObjectStatus, id)
    console.log(`Document ${documentType} saved. Version: v${versionNumber}`);

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
        <ContentComponent
          ref={ref}
          props={{
            datas,
            latestDocumentDOM
          }}
        />
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
    <Container className="editor">
      <Row className="toolbar-container">
        <Col>
          <Toolbar editor={editor} />
        </Col>
      </Row>
      <Row>
        <Col>
          <EditorContent editor={editor} className="editor-content" />
        </Col>
      </Row>
      <Row className="button-row justify-content-center mt-3 mb-3">
        <Col xs={12} sm={6} md={4} lg={3}>
          <Button variant="primary" onClick={handlePrint} className="btn-block w-100 mb-2">
            <i style={{ marginRight: 12 }} class="bi bi-download"></i>
            Download
          </Button>
        </Col>
        <Col xs={12} sm={6} md={4} lg={3}>
          <Button variant="success" onClick={saveDocumentDOM} className="btn-block w-100 mb-2">
            <i style={{ marginRight: 12 }} class="bi bi-floppy"></i>
            Save
          </Button>
        </Col>
        {validationErrors?.documentDOM && <p className="mt-2 text-sm text-center text-red-600">{validationErrors?.documentDOM}</p>}
      </Row>
      <Row className="button-row justify-content-center mt-3 mb-3">
        <Col xs={12} sm={6} md={4} lg={3} className="align-items-center">

        </Col>
      </Row>



      <div style={{ display: 'none' }}>
        <PrintComponent ref={componentRef} content={editorContent} />
      </div>

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{
          zIndex: 1000,
          position: 'fixed',
          top: '1rem',
          right: '1rem'
        }}
      >
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          className="custom-toast"
        >
          <Toast.Header className="bg-success text-white">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong className="me-auto">Success</strong>
            <small>just now</small>
          </Toast.Header>
          <Toast.Body className="bg-success-light">
            Your {documentType ? documentType : 'Document'} has been saved Successfully!
          </Toast.Body>
        </Toast>
      </ToastContainer>

    </Container>

  );
};

export default PDFEditor;
