import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { Container, Row, Col, Button } from 'react-bootstrap';
import CustomToast from '../AdditionalComponents/CustomToast';
import Toolbar from './Toolbar';
import { useReactToPrint } from "react-to-print";
import { updateDataObject } from '../ObjStatusForm';
import { getObjectStatus } from '@/utils/objectStatusUtils';
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
}
`;

export function getDocumentDOMInfo() {
    return updatedObjectStatus[updatedObjectStatus.length - 1]?.documentDOM;
}

function getDocumentContent(object_status, documentType, version) {
    return object_status
        .find(obj => obj.documentDOM && obj.documentDOM[documentType])
        ?.documentDOM[documentType][version]?.content || null;
}

const PDFEditor = ({ ContentComponent, documentType, errors, backendId, version, onBack, objectStatus, documentOwner }) => {
    const [editorContent, setEditorContent] = useState('');
    const [documentVersions, setDocumentVersions] = useState({});
    const [validationErrors, setValidationErrors] = useState(errors);
    const [showToast, setShowToast] = useState(false);
    const [selectedDOMVersion, setSelectedDOMVersion] = useState(null);
    const [isIncludedSecondaryWill, setISIncludedSecondaryWill] = useState(false)
    const datas = getObjectStatus(objectStatus, documentOwner)



    const updatedObjectStatusRef = useRef([]);
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

    useEffect(() => {
        setISIncludedSecondaryWill(objectStatus[0][0]?.packageInfo?.documents?.some(document => document.docType == "secondaryWill"))

    }, [objectStatus])

    useEffect(() => {
        setValidationErrors(errors);
    }, [errors]);

    useEffect(() => {
        setSelectedDOMVersion(getDocumentContent(datas, documentType, version));
    }, [documentType, version, datas]);

    const saveDocumentDOM = useCallback(() => {
        setShowToast(true);
        setValidationErrors({});
        const timestamp = new Date().toISOString();

        // Crear nueva versión del documento
        const currentVersions = documentVersions[documentType] || {};
        const versionNumber = Object.keys(currentVersions).length + 1;
        const newVersion = {
            [`v${versionNumber}`]: {
                content: editorContent,
                timestamp: timestamp,
                status: "pending",
                changes: {
                    "requestedChanges": []
                }
            }
        };

        // Actualizar las versiones del documento
        const updatedDocumentVersions = {
            ...documentVersions,
            [documentType]: {
                ...currentVersions,
                ...newVersion
            }
        };

        setDocumentVersions(updatedDocumentVersions);

        // Encontrar el índice del perfil correspondiente a documentOwner
        const ownerIndex = objectStatus.findIndex(profile =>
            profile[0]?.personal?.email === documentOwner
        );


        if (ownerIndex !== -1) {
            // Verificar que el `documentDOM` está al final de la estructura del perfil
            const lastElementIndex = objectStatus[ownerIndex].length - 1;
            const currentDocumentDOM = objectStatus[ownerIndex][lastElementIndex]?.documentDOM || {};

            // Fusionar el `documentDOM` actualizado con el existente
            const updatedDocumentDOM = {
                ...currentDocumentDOM,
                [documentType]: updatedDocumentVersions[documentType] // Actualizar solo el documento actual
            };

            // Actualizar el `documentDOM` en la posición correcta (al final del array)
            objectStatus[ownerIndex][lastElementIndex].documentDOM = updatedDocumentDOM;

            // Guardar el estado actualizado
            const updatedObjectStatus = [...objectStatus];
            updatedObjectStatusRef.current = updatedObjectStatus;
            updateDataObject(updatedObjectStatus, backendId); // Enviar los datos actualizados al backend

            console.log(`Document ${documentType} saved. Version: v${versionNumber}`);
        } else {
            console.error("Profile not found for documentOwner:", documentOwner);
        }

    }, [editorContent, documentVersions, documentType, objectStatus, backendId, documentOwner]);

    const componentRef = useRef();

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
                        documentType,
                        selectedDOMVersion,
                        isIncludedSecondaryWill
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
    }, [datas, ContentComponent, editor]);

    useEffect(() => {
        const latestVersion = datas[datas.length - 1]?.documentDOM;
        if (latestVersion) {
            setDocumentVersions(latestVersion);
        }
    }, [datas]);

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
                    <Button variant="secondary" onClick={onBack} className="btn-block w-100 mb-2">
                        <i style={{ marginRight: 12 }} className="bi bi-arrow-left"></i>
                        Back
                    </Button>
                </Col>
                <Col xs={12} sm={6} md={4} lg={3}>
                    <Button variant="primary" onClick={handlePrint} className="btn-block w-100 mb-2">
                        <i style={{ marginRight: 12 }} className="bi bi-download"></i>
                        Download
                    </Button>
                </Col>
                <Col xs={12} sm={6} md={4} lg={3}>
                    <Button variant="success" onClick={saveDocumentDOM} className="btn-block w-100 mb-2">
                        <i style={{ marginRight: 12 }} className="bi bi-floppy"></i>
                        Save
                    </Button>
                </Col>
            </Row>
            {validationErrors?.documentDOM && (
                <Row className="justify-content-center">
                    <Col xs={12} className="text-center">
                        <p className="mt-2 text-sm text-red-600">{validationErrors?.documentDOM}</p>
                    </Col>
                </Row>
            )}
            <div style={{ display: 'none' }}>
                <PrintComponent ref={componentRef} content={editorContent} />
            </div>
            <CustomToast
                show={showToast}
                onClose={() => setShowToast(false)}
                message={`Your ${documentType ? documentType : 'Document'} has been saved successfully!`}
            />
        </Container>
    );
};

export default PDFEditor;
