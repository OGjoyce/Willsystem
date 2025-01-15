import { updateDataObject } from "@/Components/ObjStatusForm";

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
// Función para actualizar la fecha de envío en el objeto package
const setDocumentsSentDate = (objectStatus, currIdObjDB) => {
  const updatedObjectStatus = objectStatus;
  if (updatedObjectStatus[0] && updatedObjectStatus[0][0] && updatedObjectStatus[0][0].packageInfo) {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    updatedObjectStatus[0][0].packageInfo.documents_sent_at = formattedDate;
  } else {
    console.error("Error: invalid data structure");
  }
  updateDataObject(objectStatus, currIdObjDB);
};
  



async function sendDocumentsForApproval(objectStatus, currIdObjDB) {
  setDocumentsSentDate(objectStatus, currIdObjDB);
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
  
  // Función para procesar cada envío individual
  const sendEmail = async (userInfo) => {
    try {
      // Validar email y obtener contraseña
      const validateEmailResponse = await axios.post(
        "https://willsystemapp.com/api/validate-email",
        {
          email: userInfo.email,
          name: userInfo.fullName
        }
      );
      const password = validateEmailResponse.data.password;
  
      // Generar token
      const generateTokenResponse = await axios.post(
        "https://willsystemapp.com/api/generate-token",
        {
          email: userInfo.email,
          id: idForToken
        }
      );
      const token = generateTokenResponse.data.token;
  
      // Construir mensaje HTML
      const message = `
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
            ${
              password
                ? `<tr>
                    <td style="padding: 20px; color: #555; font-size: 16px; line-height: 1.6;">
                      <p>Your temporary password is:</p>
                      <p style="font-weight: bold; color: #333;">${password}</p>
                    </td>
                  </tr>`
                : ""
            }
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
      </html>`;
  
      // Enviar email
      await axios.post("https://willsystemapp.com:5000/send-email", {
        to_email: userInfo.email,
        subject: "Please review and approve your documents",
        message: message,
        is_html: true
      });
    } catch (error) {
      console.error(`Error processing ${userInfo.email}:`, error);
      // Se lanza el error para que se capture en el allSettled
      throw new Error(`Error sending email to ${userInfo.email}`);
    }
  };
  
  // Procesar todas las peticiones en paralelo y esperar a que terminen
  const emailPromises = userInfoForToken.map(userInfo => sendEmail(userInfo));
  const results = await Promise.allSettled(emailPromises);
  
  // Revisar si hubo errores
  const failed = results.filter(result => result.status === "rejected");
  if (failed.length > 0) {
    // Se puede lanzar un error global o simplemente registrarlo
    console.error("Some emails failed:", failed);
    throw new Error("One or more emails failed to send.");
  }
}
// Enviar correos con PDFs adjuntos
async function sendDocumentsAsPDF(objectStatus, currIdObjDB) {
  setDocumentsSentDate(objectStatus, currIdObjDB);
  
  // Funciones auxiliares para numeración y combinación de contenido
  function calculateLineCount(htmlContent, lineHeightPx) {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.visibility = "hidden";
    container.style.width = "600px";
    container.style.lineHeight = `${lineHeightPx}px`;
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    const contentHeight = container.offsetHeight;
    const lineCount = Math.ceil(contentHeight / lineHeightPx);
    document.body.removeChild(container);
    return lineCount;
  }
  
  function generateLineNumbers(maxLines, startLine = 1) {
    const lineNumbers = [];
    for (let i = startLine; i < startLine + maxLines; i++) {
      lineNumbers.push(
        `<div style="
          text-align: right;
          font-family: 'Times New Roman', Times, serif;
          font-size: 10px;
          color: #666;
          line-height: 1.3;
          height: 1.3em;
        ">${i}</div>`
      );
    }
    return `<div style="
      position: absolute;
      top: 0;
      left: 0;
      width: 40px;
      height: 100%;
    ">${lineNumbers.join('')}</div>`;
  }
  
  // En este ejemplo combinamos el contenido con la numeración
  function combineContentWithLineNumbers(htmlContent, maxLines) {
    const lineNumbersHTML = generateLineNumbers(maxLines);
    return `
      <div style="position: relative; font-family: 'Times New Roman', Times, serif; font-size: 10px; line-height: 1.6;">
        ${lineNumbersHTML}
        <div style="margin-left: 50px; white-space: pre-wrap; word-wrap: break-word;">
          ${htmlContent}
        </div>
      </div>
    `;
  }
  
  // Procesar cada conjunto de documentos para cada usuario
  for (const userSet of objectStatus) {
    const personalInfo = userSet.find(item => item.personal);
    const documentData = userSet.find(item => item.documentDOM);
  
    if (!personalInfo || !documentData) {
      console.error("Required information not found for this user.");
      continue;
    }
  
    const { fullName } = personalInfo.personal;
    const email = personalInfo.owner;
    const documentDOM = documentData.documentDOM;
  
    if (!email) {
      console.error(`Missing email for ${fullName}.`);
      continue;
    }
  
    try {
      // Recopilar PDFs adjuntos
      let attachments = [];
  
      for (const [documentType, docVersion] of Object.entries(documentDOM)) {
        const documentContent = docVersion?.v1?.content;
        if (!documentContent) {
          console.warn(`No content found for document type ${documentType} for ${fullName}.`);
          continue;
        }
  
        // Calcular líneas y combinar contenido
        const lineHeightPx = 18;
        const lineCount = calculateLineCount(documentContent, lineHeightPx);
        const combinedContent = combineContentWithLineNumbers(documentContent, lineCount);
  
        // Generar PDF vía llamada al servidor y obtenerlo en base64
        const response = await axios.post(
          "https://willsystemapp.com:5050/generate-pdf",
          {
            htmlContent: combinedContent,
            fileName: `${fullName}-${documentType}.pdf`
          }
        );
        const pdfBase64 = response.data.pdfBase64;
        attachments.push({
          filename: `${fullName}-${documentType}.pdf`,
          content: pdfBase64
        });
      }
  
      if (attachments.length === 0) {
        console.error(`No documents to attach for ${fullName}.`);
        continue;
      }
  
      // Construir cuerpo del mensaje HTML
      const message = `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <h2 style="color: #333; font-size: 24px; margin: 0;">Hello, ${fullName}</h2>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; color: #555; font-size: 16px; line-height: 1.6;">
                <p>We hope this message finds you well. Attached to this email, you will find the PDF files you requested.</p>
                <p>If you have any questions, feel free to reach out to us.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px; color: #888; font-size: 14px; line-height: 1.6;">
                <p>Thank you for your time.</p>
                <p style="margin: 0;">Warm regards,</p>
                <p style="margin: 0;">Barret Tax Law Team</p>
              </td>
            </tr>
          </table>
        </body>
      </html>`;
  
      const data = {
        to_email: email,
        subject: "Please review and approve your documents",
        message: message,
        is_html: true,
        attachments: attachments
      };
  
      // Enviar el email con adjuntos
      await axios.post("https://willsystemapp.com:5000/send-email", JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      console.log(`Email with all documents sent successfully to ${fullName} (${email}).`);
  
    } catch (error) {
      console.error(`Error processing ${email}:`, error);
      // Continuar con el siguiente usuario en caso de error
      continue;
    }
  }
  console.log("All documents processed and emails sent.");
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

    const addNewDocumentToPackage = (objectStatus, newDocument) => {
    // Realiza una copia profunda del objectStatus para evitar mutaciones
    const newObjectStatus = objectStatus.map(innerArray => innerArray.map(item => ({ ...item })));

    // Accede al primer elemento donde se agregará el nuevo documento
    const firstItem = newObjectStatus[0][0];

    // Clona packageInfo y documents para mantener la inmutabilidad
    firstItem.packageInfo = { ...firstItem.packageInfo };
    firstItem.packageInfo.documents = [...firstItem.packageInfo.documents];

    const documents = firstItem.packageInfo.documents;

    // Determina el siguiente ID disponible
    const nextId = documents.reduce((maxId, doc) => Math.max(maxId, doc.id), 0) + 1;

    // Crea una copia del nuevo documento y asigna el ID
    const newDoc = { id: nextId, docType: newDocument,  owner: 'unknown', dataStatus: 'incomplete' };

    // Asigna campos adicionales según el tipo de documento
    if (newDoc.docType === 'secondaryWill') {
        const existingSecondaryWills = documents.filter(doc => doc.docType === 'secondaryWill');
        const willNumber = existingSecondaryWills.length + 1;
        newDoc.willIdentifier = `secondaryWill_${willNumber}`;
    } else if (newDoc.docType === 'poaProperty' || newDoc.docType === 'poaHealth') {
        newDoc.associatedWill = 'unknown';
    }

    // Agrega el nuevo documento a la lista
    documents.push(newDoc);

    return newObjectStatus;
}


export { 
    assignDocuments,
    sendDocumentsForApproval,
    sendDocumentsAsPDF,
    getDocumentOwner,
    areAllDocumentsUnlocked,
    isDocumentUnlocked,
    getLastUnlockedDocument,
    addNewDocumentToPackage
 };