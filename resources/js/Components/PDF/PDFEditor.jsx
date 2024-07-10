import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Button from 'react-bootstrap/Button';
import { useReactToPrint } from "react-to-print";
import jsPDF from 'jspdf';
import 'jspdf-autotable';  // Importamos jspdf-autotable para manejar múltiples páginas
import './PDFEditor.css';

const PDFEditor = ({ ContentComponent, datas }) => {
  var object_status = datas;
  const downloadPdf = (object_status) => {
    const documentDOM = object_status.find(item => item.documentDOM)?.documentDOM;
    if (!documentDOM || !documentDOM.v1 || !documentDOM.v1.content) {
      console.error("No se encontró contenido del documento");
      return;
    }

    const content = documentDOM.v1.content;

    const pdf = new jsPDF('p', 'mm', 'a4');

    // Configurar la fuente
    pdf.setFont("times", "normal");
    pdf.setFontSize(12);

    // Definir márgenes (en mm)
    const margin = 25;
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    // Agregar el contenido al PDF
    pdf.html(content, {
      callback: function (pdf) {
        // Agregar números de página
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
        pdf.save('testamento.pdf');
      },
      x: margin,
      y: margin,
      width: pageWidth - 2 * margin,
      windowWidth: 794,
      html2canvas: {
        scale: 2,
        letterRendering: true,
      }
    });
  };;

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

    object_status = updatedObjectStatus;
    downloadPdf(object_status);
    console.log(object_status);
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
      <Button variant="primary" onClick={handlePrint} className="mt-3 mb-3">
        Download as PDF
      </Button>
      <EditorContent editor={editor} className="editor-content" />
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