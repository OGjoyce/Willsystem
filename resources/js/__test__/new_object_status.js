const [objectStatu, setObjectStatus] = useState({
  owner: null,
  packageInfo: null,
  profiles: {
    self: {},
    spouse: {},
    children: [],
    others: {}, // For secondary wills or additional profiles
  },
  documents: {
    primaryWill: null,
    spousalWill: null,
    secondaryWills: [], // Array to support multiple secondary wills
    poaProperty: [], // Array to support multiple poaProperty
    poaHealth: [], // Array to support multiple poaHealth
  },
});


const objectStatus = {
  owner: "user@example.com",
  packageInfo: {
    "id": 2,
    "name": "Summer Sale",
    "price": "$800",
    "campaign": "Facebook",
    "created_at": "2024-08-01T00:54:33.000000Z",
    "updated_at": "2024-08-01T00:55:35.000000Z",
    "description": "2 POAS and Will"
  },
  profiles: {
    self: {
        "city": "Toronto",
        "step": 0,
        "email": "janedoe@email.com",
        "title": "Please insert the personal information",
        "fullName": "Jane Doe",
        "province": "Ontario",
        "telephone": "+1 (111) 111-1111",
        "timestamp": 1725655298320
    },
    spouse: {
         "city": "Toronto",
          "email": "jeny@email.com",
          "phone": "+1 (111) 111-1111",
          "country": "Canada",
          "lastName": "Doe",
          "province": "Ontario",
          "relative": "Spouse",
          "firstName": "Jeny",
          "timestamp": 1725655352589,
          "middleName": ""
    },
    children: [
         {
            "id": 1,
            "city": "Toronto",
            "country": "Canada",
            "lastName": "Doe",
            "province": "Ontario",
            "relative": "Child",
            "firstName": "Junior"
          },
          {
            "id": 2,
            "city": "Toronto",
            "country": "Canada",
            "lastName": "Doe",
            "province": "Ontario",
            "relative": "Child",
            "firstName": "Helen"
          }
    ],
    relatives: [

    ],
    others: {
      1: {
        self: { /* Datos del usuario */ },
        spouse: { /* Datos del cónyuge */ },
        children: [ /* Datos de los hijos */ ],
        relatives: []
      },
      2: {
        self: { /* Datos del usuario */ },
        spouse: { /* Datos del cónyuge */ },
        children: [ /* Datos de los hijos */ ],
        relatives: []
      },
      // ...
    },
  },
  documents: {
    primaryWill: {
        profileKey: 'self',
        data: {'executors': {},'bequest': {}, "etc":{} },
        documentDOM: { v1: {}, v2:{}},
    },
    spousalWill: {
        profileKey: 'spouse',
        data: {'executors': {},'bequest': {}, "etc":{} },
        documentDOM: { v1: {}, v2:{}},
    },
    secondaryWills: [
      {
        profileKey: '1', // Referencia a profiles.others[1]
        data: {'executors': {},'bequest': {}, "etc":{} },
        documentDOM: { v1: {}, v2:{}},
      },
      {
        profileKey: '2', // Referencia a profiles.others[2]
        data: {'executors': {},'bequest': {}, "etc":{} },
        documentDOM: { v1: {}, v2:{}},
      },
      // Añadir más secondaryWills según sea necesario
    ],
    poaProperty: [
      {
        profileKey: 'self', // Referencia a profiles.self
        data: { },
        documentDOM: { v1: {}, v2:{}},
      },
      {
        profileKey: 'spouse', // Referencia a profiles.spouse
        data: { /* Datos del POA Property para spouse */ },
        documentDOM: { v1: {}, v2:{}},
      },
      // Añadir más POA Properties según sea necesario
    ],
    poaHealth: [
      {
        profileKey: 'self', // Referencia a profiles.self
        data: { /* Datos del POA Health para self */ },
        documentDOM: { v1: {}, v2:{}},
      },
      {
        profileKey: 'spouse', // Referencia a profiles.spouse
        data: { /* Datos del POA Health para spouse */ },
       documentDOM: { v1: {}, v2:{}},
      },
      {
        profileKey: '1', // Referencia a profiles.others[1]
        data: { /* Datos del POA Health para spouse */ },
        documentDOM: { v1: {}, v2:{}},
      },
      // Añadir más POA Healths según sea necesario
    ],
    // Otros documentos si es necesario
  },
};
