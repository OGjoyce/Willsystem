// Helper function to assign an owner to documents
const assignDocuments = (objectStatus, currentProfile, currentDocument) => {
    // Retrieve package information from the first entry in objectStatus, if it exists
    const packageInfo = objectStatus[0]?.[0]?.packageInfo;

    // Check if packageInfo contains any documents to process
    if (packageInfo && packageInfo.documents) {
        // Check if the specified document is already owned by the current profile
        const alreadyOwned = packageInfo.documents.some(
            (docObj) => docObj.docType === currentDocument && docObj.owner === currentProfile
        );

        // If the document is already owned by the current profile, exit the function
        if (alreadyOwned) return null;

        // Find a document that matches the type `currentDocument` and has an owner labeled as 'unknown'
        const documentIndex = packageInfo.documents.findIndex(
            (docObj) => docObj.docType === currentDocument && docObj.owner === 'unknown'
        );

        // If a matching document with 'unknown' as the owner is found
        if (documentIndex !== -1) {
            // Clone the objectStatus to avoid mutating the original state directly
            const updatedObjectStatus = [...objectStatus];

            // Clone the package information and its documents to maintain immutability
            const updatedPackageInfo = {
                ...packageInfo,
                documents: [...packageInfo.documents],
            };

            // Update the owner of the specific document to the current profile
            updatedPackageInfo.documents[documentIndex] = {
                ...updatedPackageInfo.documents[documentIndex],
                owner: currentProfile,
            };

            // Update packageInfo within updatedObjectStatus
            updatedObjectStatus[0][0] = {
                ...updatedObjectStatus[0][0],
                packageInfo: updatedPackageInfo,
            };

            // Return the updated objectStatus if changes were made
            return updatedObjectStatus;
        } else {
            // Return null if no document was available for update
            return null;
        }
    }
    // Return null if no package info or documents are available
    return null;
};

export { assignDocuments };