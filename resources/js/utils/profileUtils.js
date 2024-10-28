// Helper function to update or create properties in objectStatus
let updateOrCreateProperty = (prevStatus, propertiesAndData) => {
    const newStatus = [...prevStatus];
    const existingIndex = newStatus.findIndex((obj) =>
        propertiesAndData.some((prop) => obj.hasOwnProperty(prop.name))
    );

    if (existingIndex !== -1) {
        // Update existing object
        propertiesAndData.forEach((prop) => {
            newStatus[existingIndex][prop.name] = prop.data;
        });
    } else {
        // Add new object
        const newObject = {};
        propertiesAndData.forEach((prop) => {
            newObject[prop.name] = prop.data;
        });
        newStatus.push(newObject);
    }

    return newStatus;
};

const handleProfileData = (currentProfile, propertiesAndData, prevStatus) => {
    // Clonamos el estado anterior para no modificarlo directamente
    const newStatus = [...prevStatus];

    // Buscamos si existe un perfil que coincida con el currentProfile (en el campo personal.email)
    const existingProfileIndex = newStatus.findIndex(profile => {
        return profile.some(dataObj => dataObj.personal?.email === currentProfile);
    });

    if (existingProfileIndex !== -1) {
        // Si encontramos un perfil existente, actualizamos sus datos con updateOrCreateProperty
        const updatedProfile = updateOrCreateProperty(newStatus[existingProfileIndex], propertiesAndData);
        newStatus[existingProfileIndex] = updatedProfile;
    } else {
        // Si no encontramos un perfil, creamos un nuevo perfil
        const newProfile = updateOrCreateProperty([], propertiesAndData);
        newStatus.push(newProfile);
    }

    return newStatus;
};

    const handleSelectProfile = (objectStatus, email, currentProfile) => {
        const updatedObjectStatus = objectStatus.map((profileArray) => {
            return profileArray.map((dataObj) => {
                // Verifica si este es el perfil actual
                if (dataObj.packageInfo && dataObj.packageInfo.documents && dataObj.personal?.email === currentProfile) {
                    let documentUpdated = false; // Indicador de si ya se actualizó un documento

                    const updatedDocuments = dataObj.packageInfo.documents.map((docObj) => {
                        if (!documentUpdated && docObj.docType === selectedDoc && docObj.owner === 'unknown') {
                            documentUpdated = true; // Marcamos que ya se actualizó un documento
                            return { ...docObj, owner: email };
                        }
                        return docObj;
                    });

                    return {
                        ...dataObj,
                        packageInfo: {
                            ...dataObj.packageInfo,
                            documents: updatedDocuments,
                        },
                    };
                }
                return dataObj;
            });
        });

        return updatedObjectStatus
    };



export {
    handleProfileData,
    handleSelectProfile
}