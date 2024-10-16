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

export const handleProfileData = (currentProfile, propertiesAndData, prevStatus) => {
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

export const getObjectStatus = (objectStatus, currentProfile) => {
    // Buscar en objectStatus el perfil que coincida con el currentProfile
    const profile = objectStatus.find(profileArray =>
        profileArray.some(dataObj => dataObj.personal?.email === currentProfile)
    );

    // Retornar el perfil encontrado o un array vacío si no se encuentra
    return profile || [];
};