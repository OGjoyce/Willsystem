// FormHandlers.js

// Importamos las funciones de sus componentes originales
import { getFormData } from '@/Components/FormCity';
import { getMarriedData } from '@/Components/Married';
import { getRelatives, getExecutors } from '@/Components/HumanTable';
import { getBequestArrObj } from '@/Components/Bequest';
import { getHumanData } from '@/Components/AddHuman';
import { getWipeoutData } from '@/Components/Wipeout';
import { getTableData } from '@/Components/Trusting';
import { getChildRelatives } from '@/Components/AddRelative';
import { getOptObject } from '@/Components/Residue';
import { getGuardiansForMinors } from '@/Components/GuardianForMinors';
import { getPetInfo } from '@/Components/Pets';
import { getAdditionalInformation } from '@/Components/Additional';
import { getPoa } from '@/Components/Poa';
import { getFinalDetails } from '@/Components/FinalDetails';
import { getDocumentDOMInfo } from '@/Components/PDF/PDFEditor';

// Exportamos todas las funciones
export {
    getFormData,
    getMarriedData,
    getRelatives,
    getExecutors,
    getBequestArrObj,
    getHumanData,
    getWipeoutData,
    getTableData,
    getChildRelatives,
    getOptObject,
    getGuardiansForMinors,
    getPetInfo,
    getAdditionalInformation,
    getPoa,
    getFinalDetails,
    getDocumentDOMInfo,
};
