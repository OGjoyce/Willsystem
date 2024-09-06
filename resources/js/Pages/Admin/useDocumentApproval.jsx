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
                const versionKeys = Object.keys(versions);
                if (versionKeys.length === 0) return null;

                const firstVersion = versionKeys.sort()[0];
                const lastVersion = versionKeys.sort().pop();
                const { timestamp: latestTimestamp } = versions[lastVersion];

                // Extract v1 data if available
                const v1 = versions['v1'] || {};
                const v1Timestamp = v1.timestamp;

                // Set createdAt and updatedAt based on the presence of v1 and versions
                const createdAt = v1Timestamp ? new Date(v1Timestamp).toLocaleDateString() : 'N/A';
                const updatedAt = latestTimestamp ? new Date(latestTimestamp).toLocaleDateString() : createdAt;

                // Ensure dates are not 'Invalid Date'
                const validCreatedAt = createdAt === 'N/A' || !isNaN(new Date(createdAt).getTime()) ? createdAt : 'N/A';
                const validUpdatedAt = updatedAt === 'N/A' || !isNaN(new Date(updatedAt).getTime()) ? updatedAt : 'N/A';

                const { status, changes, content } = versions[lastVersion];
                const owner = objectStatus.find(item => item.owner)?.owner || '';
                const packageName = objectStatus.find(item => item.packageInfo)?.packageInfo?.name || '';

                return {
                    id: type,
                    type,
                    latestVersion: lastVersion,
                    status: status.charAt(0).toUpperCase() + status.slice(1),
                    changeRequest: changes.requestedChanges.join(', '),
                    content,
                    createdAt: validCreatedAt,
                    updatedAt: validUpdatedAt,
                    owner,
                    package: packageName
                };
            }).filter(doc => doc !== null);  // Filter out any null values
    };

    const handleStatusChange = async (docId, newStatus, changeRequest = '') => {
        try {
            const currentDoc = documents.find(doc => doc.id === docId);

            if (!currentDoc) {
                throw new Error('Document not found');
            }

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
                                        ? [changeRequest]
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

            await fetchDocuments();

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
