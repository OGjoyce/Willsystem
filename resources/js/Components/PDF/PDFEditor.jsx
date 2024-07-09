import React, { useState, useEffect, useCallback } from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Button from 'react-bootstrap/Button';

const PDFEditor = ({ ContentComponent, object_status }) => {
  const [editorContent, setEditorContent] = useState('');
  const [documentVersions, setDocumentVersions] = useState({});

  useEffect(() => {
    try {
      const documentHtml = ReactDOMServer.renderToString(
        <ContentComponent props={{ data: { datas: object_status } }} />
      );
      setEditorContent(documentHtml);
    } catch (error) {
      console.error("ERROR while rendering document:", error);
      setEditorContent("No content to show");
    }
  }, [object_status]);

  useEffect(() => {
    const latestVersion = object_status[object_status.length - 1]?.documentDOM;
    if (latestVersion) {
      setDocumentVersions(latestVersion);
    }
  }, [object_status]);

  const handleChange = useCallback((content) => {
    setEditorContent(content);
  }, []);

  const handleSaveDocument = useCallback(() => {
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

    saveData(updatedObjectStatus);
    console.log("Updated object_status:", updatedObjectStatus);
  }, [editorContent, documentVersions, object_status]);

  return (
    <div>


      <ReactQuill
        value={editorContent}
        onChange={handleChange}
        theme="snow"
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['clean'],
            ['link', 'image', 'video'],
          ],
        }}
      />
      <Button onClick={handleSaveDocument} variant="primary">Save Document</Button>
    </div>
  );
};

export default PDFEditor