import React, { useState, useEffect, useCallback } from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Article from './Article';


import { exportData, deleteData, saveData } from '@/Components/__tests__/test_helper';

const WillEditor = ({ object_status }) => {
    const [editorContent, setEditorContent] = useState('');
    const [willVersions, setWillVersions] = useState({});

    useEffect(() => {
        try {
            const articleHtml = ReactDOMServer.renderToString(
                <Article props={{ data: { datas: object_status } }} />
            );
            setEditorContent(articleHtml);
        } catch (error) {
            console.error("Error rendering Article:", error);
            setEditorContent("");
        }
    }, [object_status]);

    useEffect(() => {
        const latestVersion = object_status[object_status.length - 1]?.willDOM;
        if (latestVersion) {
            setWillVersions(latestVersion);
        }
    }, [object_status]);

    const handleChange = useCallback((content) => {
        setEditorContent(content);
    }, []);

    const handleSaveWill = useCallback(() => {
        const timestamp = new Date().toISOString();
        const versionNumber = Object.keys(willVersions).length + 1;
        const newVersion = {
            [`v${versionNumber}`]: {
                content: editorContent,
                timestamp: timestamp
            }
        };

        const updatedWillVersions = { ...willVersions, ...newVersion };
        setWillVersions(updatedWillVersions);

        const updatedObjectStatus = [
            ...object_status.slice(0, -1),
            { ...object_status[object_status.length - 1], willDOM: updatedWillVersions }
        ];

        saveData(updatedObjectStatus);
        console.log("Updated object_status:", updatedObjectStatus);
    }, [editorContent, willVersions, object_status]);

    return (
        <div>
            <ReactQuill
                value={editorContent}
                onChange={handleChange}
                theme="snow"
                modules={{
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                    ],
                }}
            />
            <Button onClick={handleSaveWill} variant="primary">Save Will</Button>
        </div>
    );
};

export default WillEditor;