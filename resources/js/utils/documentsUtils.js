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

   async function sendDocumentsForApproval(objectStatus, currIdObjDB) {
        const idForToken = currIdObjDB;
        let userInfoForToken = [];

        // Recolectar emails y nombres
        objectStatus.forEach(innerList => {
            innerList.forEach(item => {
                if (item.owner && item.personal?.fullName) {
                    userInfoForToken.push({
                        email: item.owner,
                        fullName: item.personal.fullName
                    });
                }
            });
        });

        let tokensByEmail = {};

        // Hacer la petición POST por cada email y nombre
        for (let userInfo of userInfoForToken) {
            try {
                // 1. Validar el email y obtener la contraseña si es un nuevo usuario
                const validateEmailResponse = await axios.post('https://willsystemapp.com/api/validate-email', {
                    email: userInfo.email,
                    name: userInfo.fullName
                });

                const password = validateEmailResponse.data.password;

                // 2. Generar el token para el usuario
                const generateTokenResponse = await axios.post('https://willsystemapp.com/api/generate-token', {
                    email: userInfo.email,
                    id: idForToken
                });

                // Asume que el token viene en `response.data.token`
                const token = generateTokenResponse.data.token;
                tokensByEmail[userInfo.email] = {
                    token: token,
                    fullName: userInfo.fullName
                };

                // 3. Construir el mensaje en formato HTML
                let message = `
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);">
                <tr>
                    <td align="center" style="padding: 20px 0;">
                        <h2 style="color: #333; font-size: 24px; margin: 0;">Hello, ${userInfo.fullName}</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px; color: #555; font-size: 16px; line-height: 1.6;">
                        <p>We’re reaching out to request your review and approval of important documents. Please follow the link below to securely access them:</p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding: 20px;">
                        <a href="https://willsystemapp.com/documents-approval?token=${token}" 
                           style="display: inline-block; padding: 12px 24px; background-color: #198754; color: white; 
                                  text-decoration: none; font-size: 16px; border-radius: 5px;">
                            Review Documents
                        </a>
                    </td>
                </tr>
                  ${password ? `
                <tr>
                    <td style="padding: 20px; color: #555; font-size: 16px; line-height: 1.6;">
                        <p>Your temporary password is:</p>
                        <p style="font-weight: bold; color: #333;">${password}</p>
                    </td>
                </tr>` : ''}
                <tr>
                    <td style="padding: 20px; color: #555; font-size: 16px; line-height: 1.6;">
                        <p>If the button above doesn't work, you can also access your documents using this link:</p>
                        <p><a href="https://willsystemapp.com/documents-approval?token=${token}" 
                              style="color: #198754; word-break: break-all;">click here...</a></p>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px; color: #888; font-size: 14px; line-height: 1.6;">
                        <p>Thank you for your prompt attention.</p>
                        <p style="margin: 0;">Warm regards,</p>
                        <p style="margin: 0;">Barret Tax Law Team</p>
                    </td>
                </tr>
            </table>
        </body>
    </html>
`;


                // 4. Enviar el correo electrónico en formato HTML
                await axios.post('https://willsystemapp.com:5000/send-email', {
                    to_email: userInfo.email,
                    subject: 'Please review and approve your documents',
                    message: message, // Este será el cuerpo en HTML
                    is_html: true     // Agrega un flag para indicar que el contenido es HTML
                });

            } catch (error) {
                console.error(`Error processing ${userInfo.email}:`, error);
                throw error; // Lanza el error para que sea manejado en el try-catch de `handleSendDocuments`
            }
        }

        console.log(tokensByEmail);
    }
      const isDocumentUnlocked = (objectStatus, index) => {
        if (index === 0) return true; // El primer documento siempre está desbloqueado

        const previousDoc = objectStatus[0]?.[0]?.packageInfo?.documents?.[index - 1];

        const ownerProfile = objectStatus.find(profileArray =>
            profileArray.some(dataObj => dataObj.personal?.email === previousDoc?.owner)
        );

        if (!ownerProfile) {
            return false; // Si no se encuentra el perfil del dueño, bloqueamos el documento
        }

        const ownerDocumentDOM = ownerProfile[ownerProfile.length - 1]?.documentDOM || {};
        return ownerDocumentDOM[previousDoc?.docType]?.v1?.content ? true : false
    };

     const areAllDocumentsUnlocked = (objectStatus) => {
        const documents = objectStatus[0]?.[0]?.packageInfo?.documents || [];
        return documents.every((_, index) => isDocumentUnlocked(objectStatus, index + 1));
    };

        const getLastUnlockedDocument = (objectStatus) => {
        const documents = objectStatus[0]?.[0]?.packageInfo?.documents || [];
        for (let i = documents.length - 1; i >= 0; i--) {
            if (isDocumentUnlocked(objectStatus, i)) {
                return documents[i];
            }
        }
        return null;
    };

        const getDocumentOwner = (ObjectStatus, index) => {
        const document = objectStatus[0]?.[0]?.packageInfo?.documents?.[index];
        return document?.owner || 'unknown';
    };

export { 
    assignDocuments,
    sendDocumentsForApproval,
    getDocumentOwner,
    areAllDocumentsUnlocked,
    isDocumentUnlocked,
    getLastUnlockedDocument
 };