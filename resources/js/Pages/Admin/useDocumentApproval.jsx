import { useState, useEffect } from 'react';
import axios from 'axios';
import { updateDataObject } from '@/Components/ObjStatusForm';

const useDocumentApproval = (initialDocId) => {
    const [documents, setDocuments] = useState([]);
    const [objectStatus, setObjectStatus] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/obj-status/search', { params: { id: initialDocId } });

            if (response.data && response.data.length > 0) {
                const parsedObjectStatus = parseObjectStatus(response.data[0].information);
                if (parsedObjectStatus) {
                    setObjectStatus(parsedObjectStatus);
                    const formattedDocuments = formatDocuments(parsedObjectStatus);
                    setDocuments(formattedDocuments);
                } else {
                    setError('No document data found in response');
                }
            } else {
                setError('No data received from server');
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError('Error fetching data from server');
        } finally {
            setLoading(false);
        }
    };

    const parseObjectStatus = (information) => {
        if (typeof information === 'string') {
            try {
                return JSON.parse(information);
            } catch (e) {
                console.error('Error parsing information:', e);
                return null;
            }
        } else if (typeof information === 'object') {
            return information;
        }
        console.error('Unexpected information type:', typeof information);
        return null;
    };

    const formatDocuments = (objectStatus) => {
        const documentDOM = objectStatus.find(item => item.documentDOM)?.documentDOM;
        if (!documentDOM) return [];

        return Object.entries(documentDOM)
            .filter(([key]) => key !== 'timestamp')
            .map(([type, versions]) => {
                const latestVersion = Object.keys(versions).sort().pop();
                const { status, changes, content } = versions[latestVersion];
                return {
                    id: type,
                    type,
                    latestVersion,
                    status: status.charAt(0).toUpperCase() + status.slice(1),
                    changeRequest: changes.requestedChanges.join(', '),
                    content
                };
            });
    };

    const handleStatusChange = async (docId, newStatus, changeRequest = '') => {
        try {
            const currentDoc = documents.find(doc => doc.id === docId);

            const updatedObjectStatus = objectStatus.map(item => {
                if (item.documentDOM) {
                    const currentDocumentDOM = item.documentDOM[currentDoc.type][currentDoc.latestVersion];
                    const updatedDocumentDOM = {
                        ...item.documentDOM,
                        [currentDoc.type]: {
                            ...item.documentDOM[currentDoc.type],
                            [currentDoc.latestVersion]: {
                                ...currentDocumentDOM,
                                status: newStatus.toLowerCase(),
                                changes: {
                                    requestedChanges: newStatus === 'Changes Requested'
                                        ? [changeRequest]  // Solo el nuevo cambio, reemplaza los anteriores
                                        : []
                                },
                                content: currentDoc.content
                            }
                        }
                    };
                    return { ...item, documentDOM: updatedDocumentDOM };
                }
                return item;
            });

            await updateDataObject(updatedObjectStatus, initialDocId);

            setObjectStatus(updatedObjectStatus);
            setDocuments(formatDocuments(updatedObjectStatus));
        } catch (error) {
            console.error('Error updating document status:', error);
            throw new Error('Failed to update document status');
        }
    };

    return {
        documents,
        error,
        loading,
        handleStatusChange
    };
};

export default useDocumentApproval;
