import { handleProfileData } from "./profileUtils";

export const getObjectStatus = (objectStatus, currentProfile) => {
    // Buscar en objectStatus el perfil que coincida con el currentProfile
    const profile = objectStatus.find(profileArray =>
        profileArray.some(dataObj => dataObj.personal?.email === currentProfile)
    );

    // Retornar el perfil encontrado o un array vacío si no se encuentra
    return profile || [];
};

export const initializeObjectStructure = (objectStatus, currentProfile) => {
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

export const initializeSpousalWill = (objectStatus) => {

            const spouse = objectStatus[0].find(obj => obj.personal)?.personal // Tomar datos de personal del primer objeto

            const personal = objectStatus[0].find(obj => obj.married)?.married;

            const spousalWillData = [{
                personal: {
                    step: 0,
                    title: "Personal Information",
                    city: personal.city,
                    province: personal.province,
                    country: personal.country,
                    telephone: personal.phone,
                    fullName: personal.firstName + ' ' + personal.lastName,
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
                    "firstName": spouse.fullName.split(' ')[0],
                    "middleName": "",
                    "lastName": spouse.fullName.split(' ').slice(1).join(' '),
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
                "executors": []
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