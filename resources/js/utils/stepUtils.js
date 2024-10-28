import { handleProfileData } from '@/utils/profileUtils';
import { storeDataObject, updateDataObject } from '@/Components/ObjStatusForm';
import { getObjectStatus } from './objectStatusUtils';
import { validate } from '@/Components/Validations';


const stepper = [
        { step: 0, title: 'Personal Information' },
        { step: 1, title: 'Married Status' },
        { step: 2, title: "Spouse's Information" },
        { step: 3, title: 'Children' },
        { step: 4, title: 'Children Information' },
        { step: 5, title: 'Will Executors' },
        { step: 6, title: 'Bequest Information' },
        { step: 7, title: 'Select Residue' },
        { step: 8, title: 'Wipeout Information' },
        { step: 9, title: 'Testamentary Trust' },
        { step: 10, title: 'Guardian For Minors' },
        { step: 11, title: 'Guardian For Pets' },
        { step: 12, title: 'Power Of Attorney Property' },
        { step: 13, title: 'Power Of Attorney Health' },
        { step: 14, title: 'Additional Information' },
        { step: 15, title: 'Final Details' },
        { step: 16, title: 'Review, Edit and Download your Documents' },
    ];

 const getVisibleSteps = (objectStatusToUse, currentDocument) => {
        const hasSpouse = objectStatusToUse.some(
            (obj) => obj.marriedq && (obj.marriedq.selection === 'true' || obj.marriedq.selection === 'soso')
        );
        const hasKids = objectStatusToUse.some((obj) => obj.kidsq && obj.kidsq.selection === 'true');

        return stepper.filter((step, index) => {

            if (index != 0 && currentDocument == null) return false
            // Ocultar pasos basados en la información de spouse y kids
            if (index === 2 && !hasSpouse) return false; // Spouse Information
            if (index === 4 && !hasKids) return false; // Children Information
            if (index === 10 && !hasKids) return false; // Guardian For Minors

            // Lógica basada en currentDocument
            if (currentDocument === 'primaryWill' || currentDocument === 'spousalWill' || currentDocument === 'secondaryWill') {
                // Ocultar pasos 12 (POA Property) y 13 (POA Health) si es un primaryWill
                if (index === 12 || index === 13) return false;
            } else if (currentDocument === 'poaProperty') {
                // Ocultar todos menos el paso 12 para POA Property
                if (index === 5 || index === 6 || index === 7 || index === 8 || index === 9 ||
                    index === 10 || index === 11 || index === 13 || index === 14 || index === 15) {
                    return false;
                }
            } else if (currentDocument === 'poaHealth') {
                if (index === 5 || index === 6 || index === 7 || index === 8 || index === 9 ||
                    index === 10 || index === 11 || index === 12 || index === 14 || index === 15) {
                    return false;
                }
            }

            return true;
        });
    };

      const isStepClickable = (objectStatus, currentProfile, index) => {
        // Si el índice es 0, siempre permitimos hacer clic
        if (index === 0) return true;

        // Verificamos si el paso 0 tiene datos completos
        const step0Data = getObjectStatus(objectStatus, currentProfile).find(obj => obj.hasOwnProperty('personal'));
        const step1Data = getObjectStatus(objectStatus, currentProfile).find(obj => obj.hasOwnProperty('marriedq'));

        // Si no existe step0Data o falta el nombre completo o el correo electrónico, no se puede hacer clic en otros pasos
        if (!step0Data || !step0Data.personal.fullName || !step0Data.personal.email || !step1Data?.marriedq?.selection) {
            return false;
        }

        // Si el paso 0 está completo, permitimos hacer clic en otros pasos
        return true;
    };

        const findFirstIncompleteStep = (objectStatus, currentProfile, visibleSteps) => {
        for (let i = 0; i < visibleSteps.length; i++) {
            if (!stepHasData(objectStatus, currentProfile, visibleSteps[i].step)) {
                return visibleSteps[i].step;
            }
        }
        return null; // All steps are complete
    };

    // utils/stepHelper.js

// Función para retroceder paso
export const backStep = (pointer, objectStatus, currentProfile, visibleSteps, setPointer) => {
    const firstIncompleteStep = findFirstIncompleteStep(objectStatus, currentProfile, visibleSteps);

    if (firstIncompleteStep !== null) {
        setPointer(firstIncompleteStep);
        localStorage.setItem('currentPointer', firstIncompleteStep.toString());
    } else {
        const currentIndex = visibleSteps.findIndex(step => step.step === pointer);
        if (currentIndex > 0) {
            const previousStep = visibleSteps[currentIndex - 1].step;
            setPointer(previousStep);
            localStorage.setItem('currentPointer', previousStep.toString());
        } else {
            console.log('Already at the first step.');
        }
    }

    return true;
};



  const stepHasData = (objectStatus, currentProfile, step) => {
        const stepDataMap = {
            0: {
                key: 'personal',
                check: (data) => data && data.fullName && data.fullName.trim() !== '' && data.email && data.email.trim() !== '',
            },
            1: {
                key: 'marriedq',
                check: (data) => data && data.selection && data.selection.trim() !== '',
            },
            2: {
                key: 'married',
                check: (data) => data && data.firstName && data.firstName.trim() !== '',
            },
            3: {
                key: 'kidsq',
                check: (data) => data && data.selection && data.selection.trim() !== '',
            },
            4: {
                key: 'kids',
                check: (data) => data && Array.isArray(data) && data.length > 0,
            },
            5: {
                key: 'executors',
                check: (data) => data && Array.isArray(data) && data.length > 0,
            },
            6: {
                key: 'bequests',
                check: (data) => {
                    if (data && typeof data === 'object') {
                        const keys = Object.keys(data).filter(k => k !== 'timestamp');
                        return keys.length > 0;
                    }
                    return false;
                },
            },
            7: {
                key: 'residue',
                check: (data) => data && data.selected && data.selected.trim() !== '',
            },
            8: {
                key: 'wipeout',
                check: (data) => data && data.wipeout && Object.keys(data.wipeout).length > 0,
            },
            9: {
                key: 'trusting',
                check: (data) => {
                    if (data && typeof data === 'object') {
                        const keys = Object.keys(data).filter(k => k !== 'timestamp');
                        return keys.length > 0;
                    }
                    return false;
                },
            },
            10: {
                key: 'guardians',
                check: (data) => {
                    if (data && typeof data === 'object') {
                        const keys = Object.keys(data).filter(k => k !== 'timestamp');
                        return keys.length > 0;
                    }
                    return false;
                },
            },
            11: {
                key: 'pets',
                check: (data) => {
                    if (data && typeof data === 'object') {
                        const keys = Object.keys(data).filter(k => k !== 'timestamp');
                        return keys.length > 0;
                    }
                    return false;
                },
            },
            12: {
                key: 'poaProperty',
                check: (data) => data && Object.keys(data).length > 0,
            },
            13: {
                key: 'poaHealth',
                check: (data) => data && Object.keys(data).length > 0,
            },
            14: {
                key: 'additional',
                check: (data) => {
                    return data &&
                        (
                            (data.customClauseText && data.customClauseText.trim().length > 0) ||
                            (data.otherWishes && data.otherWishes.trim().length > 0) ||
                            Object.values(data.checkboxes || {}).some(value => value === true)
                        );
                },
            },

            15: {
                key: 'finalDetails',
                check: (data) => data && Object.keys(data).length > 0,
            },
            16: {
                key: 'documentDOM',
                check: (data) => true,
            },
        };

        // Usar getObjectStatus para obtener los datos del perfil correcto
        const profileData = getObjectStatus(objectStatus, currentProfile);

        const { key, check } = stepDataMap[step] || {};
        if (!key || !check) return false;

        // Buscar los datos en el perfil correspondiente
        for (const obj of profileData) {
            if (obj.hasOwnProperty(key)) {
                const data = obj[key];
                if (check(data)) {
                    return true;
                } 
            }
        }
        return false;
    };

    export {
        isStepClickable,
        stepHasData,
        findFirstIncompleteStep,
        getVisibleSteps
    }