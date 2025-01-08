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

            const relatives = objectStatus[0].find(obj => obj.relatives)?.relatives

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
                "kidsq": []
            },
            {
                "kids": []
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

function updateKidsOnPrimaryObjectStatus(objectStatus, newKids, backendId) {
    // Encuentra el índice del perfil del documento
    const ownerIndex = objectStatus.findIndex(profile =>
        profile[0]?.personal?.email
    );

    if (ownerIndex === -1) {
        console.error("Perfil no encontrado en el objectStatus.");
        return;
    }

    const profile = objectStatus[ownerIndex];

    // Obtén la lista actual de niños
    let kids = profile.find(item => item.kids)?.kids || [];

    // Agrega solo los nuevos niños que no están ya en la lista actual
    const updatedKids = [
        ...kids,
        ...newKids.filter(
            newKid =>
                !kids.some(
                    kid =>
                        kid.firstName === newKid.firstName &&
                        kid.lastName === newKid.lastName
                )
        )
    ];

    // Actualiza el objectStatus con la nueva lista de niños
    const kidsIndex = profile.findIndex(item => item.kids);
    if (kidsIndex !== -1) {
        profile[kidsIndex].kids = updatedKids;
    } else {
        profile.push({ kids: updatedKids });
    }

    // Filtrar niños incluidos en el testamento (isIncludedOnSpousalWill: true)
    const includedKids = updatedKids.filter(kid => kid.isIncludedOnSpousalWill);

    // Generar el HTML para la sección de niños
    const childrenHTML = includedKids
        .map(child =>
            `<li>${child.firstName.trim().toUpperCase()} ${child.lastName.trim().toUpperCase()}</li>`
        )
        .join("");

    // Obtén la última versión del documentoDOM
    const documentDOM = profile.find(item => item.documentDOM)?.documentDOM || {};
    const documentType = "primaryWill";
    const currentVersionKey = Object.keys(documentDOM[documentType] || {}).sort().pop(); // Última versión
    const currentContent = documentDOM[documentType]?.[currentVersionKey]?.content || "";

    if (!currentContent) {
        console.error("No se encontró contenido para la última versión.");
        return;
    }

    // Reemplaza la sección `Current Children` en el contenido existente
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

    // Crear una nueva versión del documento
    const timestamp = new Date().toISOString();
    const newVersionKey = `v${parseInt(currentVersionKey.slice(1)) + 1}`; // Incrementa el número de versión
    const newVersion = {
        [newVersionKey]: {
            content: updatedContent,
            timestamp: timestamp,
            status: "pending",
            changes: { requestedChanges: [] }
        }
    };

    // Actualiza el documentDOM con la nueva versión
    const updatedDocumentDOM = {
        ...documentDOM,
        [documentType]: {
            ...documentDOM[documentType],
            ...newVersion
        }
    };

    // Actualiza el profile en objectStatus
    profile[profile.length - 1].documentDOM = updatedDocumentDOM;

    // Guarda en el backend
    updateDataObject(objectStatus, backendId);
    console.log(`Nueva versión ${newVersionKey} creada y guardada.`);
}
function updateRelativesOnPrimaryObjectStatus(objectStatus, newRelatives, backendId) {
}



export {
    getObjectStatus,
    initializeObjectStructure,
    initializeSpousalWill,
    updateKidsOnPrimaryObjectStatus
}