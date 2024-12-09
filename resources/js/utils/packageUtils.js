   const packageDocuments = {
        'One will only': ['primaryWill'],
        'One will and one POA (property)': ['primaryWill', 'poaProperty'],
        'One will and one POA (health)': ['primaryWill', 'poaHealth'],
        'One will and two POAs': ['primaryWill', 'poaProperty', 'poaHealth'],
        'One will and one secondary will': ['primaryWill', 'secondaryWill'],
        'One will and one secondary will and one POA (property)': ['primaryWill', 'secondaryWill', 'poaProperty'],
        'One will and one secondary will and one POA (health)': ['primaryWill', 'secondaryWill', 'poaHealth'],
        'One will and one secondary will and two POAs': ['primaryWill', 'secondaryWill', 'poaProperty', 'poaHealth'],  // POAS?
        'Two spousal wills only': ['primaryWill', 'spousalWill'],
        'Two spousal wills and two POAs (property)': ['primaryWill', 'spousalWill', 'poaProperty', 'poaPropery'],
        'Two spousal wills and two POAs (health)': ['primaryWill', 'spousalWill', 'poaHealth', 'poaHealth'],
        'Two spousal wills and four POAs': ['primaryWill', 'spousalWill', 'poaProperty', 'poaProperty', 'poaHealth', 'poaHealth'],
        'Two spousal wills and one secondary will': ['primaryWill', 'spousalWill', 'secondaryWill'],
        'Two spousal wills and one secondary will and two POAs (property)': ['primaryWill', 'spousalWill', 'secondaryWill', 'poaProperty', 'poaProperty'], //POAS?
        'Two spousal wills and one secondary will and two POAs (health)': ['primaryWill', 'spousalWill', 'secondaryWill', 'poaHealth', 'poaHealth'], //POAS?
        'Two spousal wills and one secondary will and four POAs': ['primaryWill', 'spousalWill', 'secondaryWill', 'poaProperty', 'poaProperty', 'poaHealth', 'poaHealth'], // POAS?
        'Two spousal wills and two secondary wills': ['primaryWill', 'spousalWill', 'secondaryWill', 'secondaryWill'],
        'Two spousal wills and two secondary wills and two POAs (property)': ['primaryWill', 'spousalWill', 'secondaryWill', 'secondaryWill', 'poaProperty', 'poaProperty'], //POAS?
        'Two spousal wills and two secondary wills and two POAs (health)': ['primaryWill', 'spousalWill', 'secondaryWill', 'secondaryWill', 'poaHealth', 'poaHealth'], //POAS?
        'Two spousal wills and two secondary wills and four POAs': ['primaryWill', 'spousalWill', 'secondaryWill', 'secondaryWill', 'poaProperty', 'poaProperty', 'poaHealth', 'poaHealth'], //POAS?
        '1 X POA health only (no will)': ['poaHealth'],
        '1 X POA property only (no will)': ['poaProperty'],
        '1 X POA health and POA property (no will)': ['poaProperty', 'poaHealth'],
        '2 X POA health only (no will)': ['poaHealth', 'poaHealth'],
        '2 X POA property only (no will)': ['poaProperty', 'poaProperty'],
        '2 X POA health and POA property (no will)': ['poaProperty', 'poaProperty', 'poaHealth', 'poaHealth'],
    };
   const packageAssociations = {
        'One will only': false,
        'One will and one POA (property)': true,
        'One will and one POA (health)': true,
        'One will and two POAs': true,
        'One will and one secondary will': false,
        'One will and one secondary will and one POA (property)': false,
        'One will and one secondary will and one POA (health)': false,
        'One will and one secondary will and two POAs': false,
        'Two spousal wills only': false,
        'Two spousal wills and two POAs (property)': true,
        'Two spousal wills and two POAs (health)': true,
        'Two spousal wills and four POAs': true,
        'Two spousal wills and one secondary will': false,
        'Two spousal wills and one secondary will and two POAs (property)': false,
        'Two spousal wills and one secondary will and two POAs (health)': false,
        'Two spousal wills and one secondary will and four POAs': false,
        'Two spousal wills and two secondary wills': false,
        'Two spousal wills and two secondary wills and two POAs (property)': false,
        'Two spousal wills and two secondary wills and two POAs (health)': false,
        'Two spousal wills and two secondary wills and four POAs': false,
        '1 X POA health only (no will)': false,
        '1 X POA property only (no will)': false,
        '1 X POA health and POA property (no will)': false,
        '2 X POA health only (no will)': false,
        '2 X POA property only (no will)': false,
        '2 X POA health and POA property (no will)': false,
    };

        const distributePOAs = (wills, poas) => {
        const willAssignments = {};

        // Inicializar el objeto de asignación de POAs
        wills.forEach((will) => {
            willAssignments[will.willIdentifier] = {
                poaProperty: null,
                poaHealth: null,
            };
        });

        // Asignar cada POA al primer will que no tenga ese tipo de POA asignado aún
        poas.forEach((poa) => {
            for (let willIdentifier in willAssignments) {
                const assignment = willAssignments[willIdentifier];

                if (poa.docType === 'poaProperty' && assignment.poaProperty === null) {
                    assignment.poaProperty = poa;
                    poa.associatedWill = willIdentifier;
                    break;
                }

                if (poa.docType === 'poaHealth' && assignment.poaHealth === null) {
                    assignment.poaHealth = poa;
                    poa.associatedWill = willIdentifier;
                    break;
                }
            }
        });
    };



 const initializePackageDocuments = (availableDocuments, packageDescription) => {
        let willCounters = {};
        const willIdentifiers = [];

        const wills = [];
        const poas = [];

        // Verificar si el paquete seleccionado permite la distribución de POAs
        const distributePOAsAllowed = packageAssociations[packageDescription] === true;

        // Primer paso para recolectar Wills y POAs
        availableDocuments.forEach((docType, index) => {
            if (docType.toLowerCase().includes('will')) {
                willCounters[docType] = (willCounters[docType] || 0) + 1;
                const willIdentifier = `${docType}_${willCounters[docType]}`;
                willIdentifiers.push(willIdentifier);

                wills.push({
                    id: index + 1,
                    docType,
                    owner: 'unknown', // El propietario es desconocido hasta que se seleccione
                    dataStatus: 'incomplete',
                    willIdentifier,
                });
            } else if (docType.toLowerCase().includes('poa')) {
                poas.push({
                    id: index + 1,
                    docType,
                    owner: distributePOAsAllowed ? 'unknown' : 'unknown', // Si no se permite distribuir POAs, permanece como 'unknown'
                    dataStatus: 'incomplete',
                    associatedWill: distributePOAsAllowed ? null : 'unknown', // Solo distribuir si está permitido
                });
            }
        });

        // Si la distribución de POAs está permitida, procedemos a asignar POAs a Wills
        if (distributePOAsAllowed) {
            distributePOAs(wills, poas);
        }


        // Reconstruct the documents in original order
        let documents = [];
        let willIdx = 0;
        let poaIdx = 0;

        availableDocuments.forEach((docType) => {
            if (docType.toLowerCase().includes('will')) {
                documents.push(wills[willIdx]);
                willIdx++;
            } else if (docType.toLowerCase().includes('poa')) {
                documents.push(poas[poaIdx]); // Ahora usamos los POAs intercalados
                poaIdx++;
            } else {
                documents.push({
                    docType,
                    owner: 'unknown',
                    dataStatus: 'incomplete',
                });
            }
        });

        return documents;
    };


    export {
        packageDocuments,
        packageAssociations,
        initializePackageDocuments
    }