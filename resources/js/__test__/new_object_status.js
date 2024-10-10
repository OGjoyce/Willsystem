const [objectStatus, setObjectStatus] = useState({
  owner: null,
  packageInfo: null,
  personInfo: {
    primary: {
      self: {},
      spouse: {},
      children: [],
    },
    secondary: {
      1: {
        self: {},
        spouse: {},
        children: [],
      }
    }, // For secondary wills or additional profiles
  },
  documents: {
    primaryWill: null,
    spousalWill: null,
    secondaryWills: [], // Array to support multiple secondary wills
    poaProperty: [], // Array to support multiple POA properties
    poaHealth: [], // Array to support multiple POA health documents
  },
});

const object_status = {
  owner: "user@example.com",
  packageInfo: {
    "id": 2,
    "name": "Summer Sale",
    "price": "$800",
    "campaign": "Facebook",
    "created_at": "2024-08-01T00:54:33.000000Z",
    "updated_at": "2024-08-01T00:55:35.000000Z",
    "description": "2 POAs and Will"
  },
  familyProfile: {
    primary: {
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
      relatives: [],
    },
    secondary: {
      1: {
        self: { /* User data */ },
        spouse: { /* Spouse data */ },
        children: [ /* Children data */ ],
        relatives: []
      },
      2: {
        self: { /* User data */ },
        spouse: { /* Spouse data */ },
        children: [ /* Children data */ ],
        relatives: []
      },
      // Additional profiles can be added here
    },
  },
  documents: {
    primaryWill: {
      profileKey: 'self',
      data: { 'executors': {}, 'bequest': {}, "etc": {} },
      documentDOM: { v1: {}, v2: {} },
    },
    spousalWill: {
      profileKey: 'spouse',
      data: { 'executors': {}, 'bequest': {}, "etc": {} },
      documentDOM: { v1: {}, v2: {} },
    },
    secondaryWill: [
      {
        profileKey: '1', // Reference to secondary profile 1
        data: { 'executors': {}, 'bequest': {}, "etc": {} },
        documentDOM: { v1: {}, v2: {} },
      },
      {
        profileKey: '2', // Reference to secondary profile 2
        data: { 'executors': {}, 'bequest': {}, "etc": {} },
        documentDOM: { v1: {}, v2: {} },
      },
      // Additional secondary wills can be added as needed
    ],
    poaProperty: [
      {
        profileKey: 'self', // Reference to self profile
        data: {},
        documentDOM: { v1: {}, v2: {} },
      },
      {
        profileKey: 'spouse', // Reference to spouse profile
        data: { /* POA Property data for spouse */ },
        documentDOM: { v1: {}, v2: {} },
      },
      {
        profileKey: '1', // Reference to secondary profile 1
        data: { /* POA Property data for secondary profile 1 */ },
        documentDOM: { v1: {}, v2: {} },
      },
      {
        profileKey: '2', // Reference to secondary profile 2
        data: { /* POA Property data for secondary profile 2 */ },
        documentDOM: { v1: {}, v2: {} },
      },
      // Additional POA Properties can be added as needed
    ],
    poaHealth: [
      {
        profileKey: 'self', // Reference to self profile
        data: { /* POA Health data for self */ },
        documentDOM: { v1: {}, v2: {} },
      },
      {
        profileKey: 'spouse', // Reference to spouse profile
        data: { /* POA Health data for spouse */ },
        documentDOM: { v1: {}, v2: {} },
      },
      {
        profileKey: '1', // Reference to secondary profile 1
        data: { /* POA Health data for secondary profile 1 */ },
        documentDOM: { v1: {}, v2: {} },
      },
       {
        profileKey: '2', // Reference to secondary profile 2
        data: { /* POA Health data for secondary profile 2 */ },
        documentDOM: { v1: {}, v2: {} },
      },
      // Additional POA Health documents can be added as needed
    ],
    // Other documents can be added as necessary
  },
};
