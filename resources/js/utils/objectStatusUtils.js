import { handleProfileData } from "./profileUtils";
import { updateDataObject } from "@/Components/ObjStatusForm";

const getObjectStatus = (objectStatus, currentProfile) => {
    // Buscar en objectStatus el perfil que coincida con el currentProfile
    const profile = objectStatus.find(profileArray =>
        profileArray.some(dataObj => dataObj.personal?.email === currentProfile)
    );

    // Retornar el perfil encontrado o un array vacío si no se encuentra
    return profile || [];
};

const initializeObjectStructure = (objectStatus, currentProfile) => {
        const initialObjectStructure = [
                { name: 'marriedq', data: {} },
                { name: 'married', data: {} },
                { name: 'kidsq', data: {} },
                { name: 'kids', data: [] },
                { name: 'executors', data: [] },
                { name: 'relatives', data: [] },
                { name: 'bequests', data: {} },
                { name: 'residue', data: {} },
                { name: 'wipeout', data: {} },
                { name: 'trusting', data: {} },
                { name: 'guardians', data: {} },
                { name: 'pets', data: {} },
                { name: 'additional', data: {} },
                { name: 'poaProperty', data: {} },
                { name: 'poaHealth', data: {} },
                { name: 'finalDetails', data: {} },
                { name: 'documentDOM', data: {} }
            ];

            // Iterar sobre cada propiedad de la estructura inicial y enviarla una por una a handleProfileData
            let updatedObjectStatus = objectStatus; // Mantener el objectStatus actualizado
            initialObjectStructure.forEach(item => {
                updatedObjectStatus = handleProfileData(currentProfile, [item], updatedObjectStatus);
            });

            return updatedObjectStatus

}

const initializeSpousalWill = (objectStatus) => {

            const spouse = objectStatus[0].find(obj => obj.personal)?.personal // Tomar datos de personal del primer objeto

            const personal = objectStatus[0].find(obj => obj.married)?.married;

            const relatives = objectStatus[0].find(obj => obj.relatives)?.relatives || []

            const kidsq = objectStatus[0].find(obj => obj.kidsq)?.kidsq || []

            const kids = objectStatus[0].find(obj => obj.kids)?.kids || []

            const filteredKids = kids.filter(kid => kid.isIncludedOnSpousalWill)


            const spousalWillData = [{
                personal: {
                    step: 0,
                    title: "Personal Information",
                    city: personal.city,
                    province: personal.province,
                    country: personal.country,
                    telephone: personal.phone,
                    fullName: personal?.firstName + ' ' + personal?.middleName + ' ' + personal?.lastName,
                    email: personal.email,
                    timestamp: Date.now(),
                },
                owner: personal.email,
                packageInfo: {
                    undefined: "not an owner of any package"
                },

            },
            {
                "marriedq": {
                    "selection": "true",
                    "timestamp": Date.now()
                }
            },
            {
                "married": {
                    "firstName": spouse.fullName.split(' ')[0] || "",
                     "middleName": spouse.fullName.split(' ').length === 3 ? spouse.fullName.split(' ')[1] : "",
                     "lastName": spouse.fullName.split(' ').length > 1 ? spouse.fullName.split(' ')[spouse.fullName.split(' ').length - 1] : "",
                    "relative": "Spouse",
                    "email": spouse.email,
                    "phone": spouse.telephone,
                    "city": spouse.city,
                    "province": spouse.province,
                    "country": spouse.country,
                    "timestamp": Date.now()
                }
            },
            {
                "kidsq": kidsq
            },
            {
                "kids": filteredKids
            },
            {
                "executors": [],
                "relatives": relatives.filter(relative => relative.isIncludedOnSpousalRelatives === true)
            },
            {
                "relatives": []
            },
            {
                "bequests": []
            },
            {
                "residue": []
            },
            {
                "wipeout": []
            },
            {
                "trusting": []
            },
            {
                "guardians": []
            },
            {
                "pets": []
            },
            {
                "additional": []
            },
            {
                "poaProperty": []
            },
            {
                "poaHealth": []
            },
            {
                "finalDetails": []
            },
            {
                "documentDOM": []
            }
            ]
            return spousalWillData
}

const initializeSecondaryWill = (objectStatus, email, currentDocument) => {
    // Buscar el índice del objeto que contiene la dirección de correo electrónico.
    const targetIndex = objectStatus.findIndex(obj => obj[0].personal?.email === email);

    // Verificar si el índice encontrado es válido
    if (targetIndex === -1) return objectStatus;  // Si no se encuentra el índice, retornar el objectStatus tal como está.

    // Desestructuración de los objetos `personal`, `married` y `relatives`
   const personal = objectStatus[targetIndex].find(obj => obj.personal)?.personal // Tomar datos de personal del primer objeto

    const married = objectStatus[targetIndex].find(obj => obj.married)?.married;

    const kids = objectStatus[targetIndex].find(obj => obj.kids)?.kids;

    const relatives = objectStatus[targetIndex].find(obj => obj.relatives)?.relatives || []

    // Verificar si los objetos necesarios existen
    if (!personal) return objectStatus;  // Si no hay información personal, retornar el objectStatus tal como está.

    const { fullName, city, province, country, phone } = personal;
    const { firstName, middleName, lastName, telephone } = married || {};
    const currentTimestamp = Date.now();

    // Crear el nuevo perfil a agregar
    const newProfile = [
        {
            personal: {
                step: 0,
                title: "Personal Information",
                city,
                province,
                country,
                telephone: phone,
                fullName,
                email: `${personal.email}*${currentDocument}`,
                timestamp: currentTimestamp,
            },
            owner: `${personal.email}*${currentDocument}`,
            packageInfo: {
                undefined: "not an owner of any package",
            },
        },
        {
            marriedq: {
                selection: "true",
                timestamp: currentTimestamp,
            },
        },
        {
            married: married ? {
                firstName,
                middleName,
                lastName,
                relative: "Spouse",
                email: married.email,
                phone: telephone,
                city: married.city,
                province: married.province,
                country: married.country,
                timestamp: currentTimestamp,
            } : {},
        },
        {
            kidsq: [],
        },
        {
            kids: kids || [],
        },
        {
            executors: [],
            relatives: relatives || [],
        },
        {
            relatives: [],
        },
        {
            bequests: [],
        },
        {
            residue: [],
        },
        {
            wipeout: [],
        },
        {
            trusting: [],
        },
        {
            guardians: [],
        },
        {
            pets: [],
        },
        {
            additional: [],
        },
        {
            poaProperty: [],
        },
        {
            poaHealth: [],
        },
        {
            finalDetails: [],
        },
        {
            documentDOM: [],
        },
    ];

    const newObject = [...objectStatus, [...newProfile]]
console.log("updated",newObject)
    // Devolver objectStatus original junto con el nuevo perfil
    return newObject;
};



function updateKidsOnObjectStatus(objectStatus, newKids, currentProfile, backendId) {
    const isSecondary = currentProfile.includes("*secondaryWill");
    const baseEmail = isSecondary ? currentProfile.replace("*secondaryWill", "") : currentProfile;
    const secondaryEmail = `${baseEmail}*secondaryWill`;

    // Identificar los perfiles relevantes
    const primaryProfile = objectStatus[0]; // Siempre el primer perfil es el primary
    const primaryEmail = primaryProfile[0]?.personal?.email;
    const primarySecondaryEmail = `${primaryEmail}*secondaryWill`;

    const spousalEmail = primaryProfile.find(item => item.married)?.married?.email || "";
    const spousalSecondaryEmail = `${spousalEmail}*secondaryWill`;

    const primaryIndex = objectStatus.findIndex(profile => profile[0]?.personal?.email === primaryEmail);
    const primarySecondaryIndex = objectStatus.findIndex(profile => profile[0]?.personal?.email === primarySecondaryEmail);
    const spousalIndex = objectStatus.findIndex(profile => profile[0]?.personal?.email === spousalEmail);
    const spousalSecondaryIndex = objectStatus.findIndex(profile => profile[0]?.personal?.email === spousalSecondaryEmail);

    function updateKids(profileIndex, kidsToAdd) {
        if (profileIndex === -1 || kidsToAdd.length === 0) return;
        const profile = objectStatus[profileIndex];
        let kids = profile.find(item => item.kids)?.kids || [];
        const updatedKids = [...kids, ...kidsToAdd.filter(newKid => !kids.some(kid => kid.firstName === newKid.firstName && kid.lastName === newKid.lastName))];
        const kidsIndex = profile.findIndex(item => item.kids);

        if (kidsIndex !== -1) {
            profile[kidsIndex].kids = updatedKids;
        } else {
            profile.push({ kids: updatedKids });
        }
        updateDocumentDOM(profile, updatedKids);
    }

    function updateDocumentDOM(profile, updatedKids) {
        const includedKids = updatedKids.filter(kid => kid.isIncludedOnSpousalWill);
        const childrenHTML = includedKids.map(child => `<li>${child.firstName.trim().toUpperCase()} ${child.lastName.trim().toUpperCase()}</li>`).join("");
        const documentDOM = profile.find(item => item.documentDOM)?.documentDOM || {};
        const documentType = "primaryWill";
        const currentVersionKey = Object.keys(documentDOM[documentType] || {}).sort().pop();
        const currentContent = documentDOM[documentType]?.[currentVersionKey]?.content || "";
        if (!currentContent) return;
        const updatedContent = currentContent.replace(
            /<p><strong><u>Current Children<\/u><\/strong><\/p><ol>.*?<\/ol>/s,
            `
            <p><strong><u>Current Children</u></strong></p>
            <ol>
                <li>I have the following living children:</li>
                <ul>
                    ${childrenHTML}
                </ul>
                <li>The term "child" or "children" as used in this my Will includes the above listed children and any children of mine that are subsequently born or legally adopted.</li>
            </ol>
            `
        );
        const timestamp = new Date().toISOString();
        const newVersionKey = `v${parseInt(currentVersionKey.slice(1)) + 1}`;
        const newVersion = {
            [newVersionKey]: {
                content: updatedContent,
                timestamp: timestamp,
                status: "pending",
                changes: { requestedChanges: [] }
            }
        };
        profile[profile.length - 1].documentDOM = {
            ...documentDOM,
            [documentType]: {
                ...documentDOM[documentType],
                ...newVersion
            }
        };
    }

    if (currentProfile === primaryEmail || currentProfile === primarySecondaryEmail) {
        updateKids(primaryIndex, newKids);
        updateKids(primarySecondaryIndex, newKids);
        const spousalKids = newKids.filter(kid => kid.isIncludedOnSpousalWill);
        updateKids(spousalIndex, spousalKids);
        updateKids(spousalSecondaryIndex, spousalKids);
    } else if (currentProfile === spousalEmail || currentProfile === spousalSecondaryEmail) {
        updateKids(spousalIndex, newKids);
        updateKids(spousalSecondaryIndex, newKids);
        const primaryKids = newKids.filter(kid => kid.isIncludedOnSpousalWill);
        updateKids(primaryIndex, primaryKids);
        updateKids(primarySecondaryIndex, primaryKids);
    }

    updateDataObject(objectStatus, backendId);
    console.log("Kids data synchronized across relevant profiles and documentDOM updated.");
}

function updateRelativesOnObjectStatus(objectStatus, newRelatives, currentProfile, backendId) {
    const isSecondary = currentProfile.includes("*secondaryWill");
    const baseEmail = isSecondary ? currentProfile.replace("*secondaryWill", "") : currentProfile;
    const secondaryEmail = `${baseEmail}*secondaryWill`;

    // Identificar los perfiles relevantes
    const primaryProfile = objectStatus[0]; // Siempre el primer perfil es el primary
    const primaryEmail = primaryProfile[0]?.personal?.email;
    const primarySecondaryEmail = `${primaryEmail}*secondaryWill`;

    const spousalEmail = primaryProfile.find(item => item.married)?.married?.email || "";
    const spousalSecondaryEmail = `${spousalEmail}*secondaryWill`;

    const primaryIndex = objectStatus.findIndex(profile => profile[0]?.personal?.email === primaryEmail);
    const primarySecondaryIndex = objectStatus.findIndex(profile => profile[0]?.personal?.email === primarySecondaryEmail);
    const spousalIndex = objectStatus.findIndex(profile => profile[0]?.personal?.email === spousalEmail);
    const spousalSecondaryIndex = objectStatus.findIndex(profile => profile[0]?.personal?.email === spousalSecondaryEmail);

    function updateRelatives(profileIndex, relativesToAdd) {
        if (profileIndex === -1 || relativesToAdd.length === 0) return;
        const profile = objectStatus[profileIndex];
        let relatives = profile.find(item => item.relatives)?.relatives || [];
        const updatedRelatives = [...relatives, ...relativesToAdd.filter(newRelative => !relatives.some(relative => relative.firstName === newRelative.firstName && relative.lastName === newRelative.lastName))];
        const relativesIndex = profile.findIndex(item => item.relatives);

        if (relativesIndex !== -1) {
            profile[relativesIndex].relatives = updatedRelatives;
        } else {
            profile.push({ relatives: updatedRelatives });
        }
    }

    // Manejo de sincronización entre primary y secondary
    if (currentProfile === primaryEmail || currentProfile === primarySecondaryEmail) {
        updateRelatives(primaryIndex, newRelatives);
        updateRelatives(primarySecondaryIndex, newRelatives);
        const spousalRelatives = newRelatives.filter(relative => relative.isIncludedOnSpousalRelatives);
        updateRelatives(spousalIndex, spousalRelatives);
        updateRelatives(spousalSecondaryIndex, spousalRelatives);
    }
    // Manejo de sincronización entre spousal y secondary
    else if (currentProfile === spousalEmail || currentProfile === spousalSecondaryEmail) {
        updateRelatives(spousalIndex, newRelatives);
        updateRelatives(spousalSecondaryIndex, newRelatives);
        const primaryRelatives = newRelatives.filter(relative => relative.isIncludedOnSpousalRelatives);
        updateRelatives(primaryIndex, primaryRelatives);
        updateRelatives(primarySecondaryIndex, primaryRelatives);
    }

    updateDataObject(objectStatus, backendId);
    console.log("Relatives data synchronized across relevant profiles.");
}



/**
 * Función general para extraer datos de un array de objetos estandarizados (datas).
 * @param {Array} datas - El array de objetos con la estructura estándar.
 * @param {string} key - La clave principal que se desea buscar en los objetos.
 * @param {string} [subKey=null] - (Opcional) La clave anidada dentro del objeto principal.
 * @param {*} [defaultValue=null] - (Opcional) Valor por defecto si no se encuentra la clave o subclave.
 * @returns {*} - El valor encontrado o el valor por defecto.
 */
function extractData(datas, key, subKey = null, defaultValue = null) {
    for (const data of datas) {
        if (data[key]) {
            // Si hay una subclave especificada, intenta devolver su valor.
            if (subKey && typeof data[key] === "object") {
                return data[key][subKey] !== undefined ? data[key][subKey] : defaultValue;
            }
            // Si no hay subclave, retorna el valor asociado a la clave principal.
            return data[key];
        }
    }
    // Si no se encuentra nada, retorna el valor por defecto.
    return defaultValue;
}



export {
    getObjectStatus,
    initializeObjectStructure,
    initializeSpousalWill,
    updateKidsOnObjectStatus,
    updateRelativesOnObjectStatus,
    initializeSecondaryWill,
    extractData
}
