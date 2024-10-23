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
                // Iteramos sobre todos los elementos en response.data[0].information
                setObjectStatus(response.data[0].information)

                const allParsedDocuments = response.data[0].information.flatMap(information => {

                    const parsedObjectStatus = parseObjectStatus(information);
                    if (parsedObjectStatus) {
                        return formatDocuments(parsedObjectStatus);
                    }
                    return [];
                });

                if (allParsedDocuments.length > 0) {
                    setDocuments(allParsedDocuments);
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
            }).filter(doc => doc !== null); // Filtrar valores nulos
    };

    const handleStatusChange = async (owner, docId, newStatus, changeRequest = '') => {
        try {
            // Buscar el documento actual basado en el docId y el owner
            const currentDoc = documents.find(doc => doc.id === docId && doc.owner === owner);

            if (!currentDoc) {
                throw new Error('Document not found');
            }

            // Actualizamos solo el documentDOM manteniendo la estructura del resto de item
            const updatedObjectStatus = objectStatus.map(item => {
                if (item[0].owner === owner && item[item.length - 1].documentDOM) {
                    const documentDOM = item[item.length - 1].documentDOM;
                    const documentType = documentDOM[currentDoc.type];

                    if (documentType && documentType[currentDoc.latestVersion]) {
                        const currentDocumentDOM = documentType[currentDoc.latestVersion];

                        // Actualizamos únicamente el documento correspondiente sin alterar el resto del item
                        const updatedDocumentDOM = {
                            ...documentDOM,
                            [currentDoc.type]: {
                                ...documentType,
                                [currentDoc.latestVersion]: {
                                    ...currentDocumentDOM,
                                    status: newStatus.toLowerCase(),
                                    changes: {
                                        requestedChanges: newStatus === 'Changes Requested' ? [changeRequest] : []
                                    },
                                    content: currentDoc.content
                                }
                            }
                        };

                        // Retornamos el item con documentDOM actualizado y dejamos todo lo demás intacto
                        return {
                            ...item,
                            [item.length - 1]: {
                                ...item[item.length - 1],
                                documentDOM: updatedDocumentDOM
                            }
                        };
                    }
                }
                return item; // Retornamos el item sin cambios si no es el documento que queremos actualizar
            });

            console.log('Updated Object Status:', updatedObjectStatus);

            // Realiza las actualizaciones necesarias
            await updateDataObject(updatedObjectStatus, initialDocId);

            // Recarga los documentos
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
