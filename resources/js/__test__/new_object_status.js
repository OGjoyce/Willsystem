/*
const [objectStatus, setObjectStatus] = useState({
  owner: null,
  packageInfo: null,
  personInfo: {
  //FOR PRIMARY WILL AND SPOUSAL WILL
    primary: {
      self: {},
      spouse: {},
      children: [],
    },
    FOR SECONDARY WILLS
    secondary: {
      1: {
        self: {},
        spouse: {},
        children: [],
      },
      2: {
        self: {},
        spouse: {},
        children: [],
      }
    },
  },
  documents: {
    primaryWill:[HERE GOES THE DATA AND THE DOCUMENT DOM],
    spousalWill: [],
    secondaryWills: [], // Array to support multiple secondary wills
    poaProperty: [], // Array to support multiple POA properties
    poaHealth: [], // Array to support multiple POA health documents
  },
});
*/



const [objectStatus, setObjectStatus] = useState({
  owner: "user@example.com", // Email of the primary owner/user
  packageInfo: {
    id: 2,
    name: "Premium Package",
    price: "$800",
    campaign: "Facebook",
    created_at: "2024-08-01T00:54:33.000Z",
    updated_at: "2024-08-01T00:55:35.000Z",
    description: "Two Spousal Wills and Two Secondary Wills and Four POAs",
  },
  personInfo: {
    primary: { // Information for the primary profile
      self: {
        city: "Toronto",
        step: 0,
        email: "janedoe@example.com",
        title: "Please insert the personal information",
        fullName: "Jane Doe",
        province: "Ontario",
        telephone: "+1 (111) 111-1111",
        timestamp: 1725655298320,
      },
      spouse: {
        firstName: "John",
        middleName: "",
        lastName: "Doe",
        email: "johndoe@example.com",
        phone: "+1 (222) 222-2222",
        city: "Toronto",
        province: "Ontario",
        country: "Canada",
        relative: "Spouse",
        timestamp: 1725655352589,
      },
      children: [ // List of children for the primary profile
        {
          id: 1,
          firstName: "Junior",
          lastName: "Doe",
          city: "Toronto",
          province: "Ontario",
          country: "Canada",
          relative: "Child",
        },
        {
          id: 2,
          firstName: "Helen",
          lastName: "Doe",
          city: "Toronto",
          province: "Ontario",
          country: "Canada",
          relative: "Child",
        },
      ],
      relatives: [ //relatives associated with the primary and spousal will
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          city: "Toronto",
          province: "Ontario",
          country: "Canada",
          email: "johndoe@example.com",
          phone: "+1 (222) 222-2222",
          relative: "Uncle",
        },
        {
          id: 2,
          firstName: "Junior",
          lastName: "Doe",
          city: "Toronto",
          province: "Ontario",
          country: "Canada",
          email: "johndoe@example.com",
          phone: "+1 (222) 222-2222",
          relative: "Brother"

        },
      ],
    },
    secondary: { // Information for secondary profiles (secondary wills)
      1: { // First secondary will profile
        self: {
          city: "Toronto",
          step: 0,
          email: "janedoe_secondary1@example.com",
          title: "Please insert the personal information for Secondary Will 1",
          fullName: "Jane Doe Secondary 1",
          province: "Ontario",
          telephone: "+1 (333) 333-3333",
          timestamp: 1725655298321,
        },
        spouse: {
          firstName: "Jeny",
          middleName: "",
          lastName: "Doe",
          email: "jeny@example.com",
          phone: "+1 (333) 333-3333",
          city: "Toronto",
          province: "Ontario",
          country: "Canada",
          relative: "Spouse",
          timestamp: 1725655352590,
        },
        children: [ // Children for the first secondary will
          {
            id: 1,
            firstName: "Junior",
            lastName: "Doe",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
            relative: "Child",
          },
          {
            id: 2,
            firstName: "Helen",
            lastName: "Doe",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
            relative: "Child",
          },
        ],
        relatives: [ // Executors and relatives for the first secondary will
          {
            id: 1,
            firstName: "Jeny",
            lastName: "Doe",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
            email: "jeny@example.com",
            phone: "+1 (333) 333-3333",
            relative: "Sister",

          },
          {
            id: 2,
            firstName: "Junior",
            lastName: "Doe",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
            email: "jeny@example.com",
            phone: "+1 (333) 333-3333",
            relative: "Sister",
          },
        ],
      },
      2: { // Second secondary will profile
        self: {
          city: "Toronto",
          step: 0,
          email: "janedoe_secondary2@example.com",
          title: "Please insert the personal information for Secondary Will 2",
          fullName: "Jane Doe Secondary 2",
          province: "Ontario",
          telephone: "+1 (444) 444-4444",
          timestamp: 1725655298322,
        },
        spouse: {
          firstName: "Jenny",
          middleName: "",
          lastName: "Doe",
          email: "jenny@example.com",
          phone: "+1 (444) 444-4444",
          city: "Toronto",
          province: "Ontario",
          country: "Canada",
          relative: "Spouse",
          timestamp: 1725655352591,
        },
        children: [ // Children for the second secondary will
          {
            id: 1,
            firstName: "Junior",
            lastName: "Doe",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
            relative: "Child",
          },
          {
            id: 2,
            firstName: "Helen",
            lastName: "Doe",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
            relative: "Child",
          },
        ],
        relatives: [ //relatives for the second secondary will
          {
            id: 1,
            firstName: "Jenny",
            lastName: "Doe",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
            email: "jenny@example.com",
            phone: "+1 (444) 444-4444",
            relative: "Sister",
            priority: 1,
            timestamp: 1725655352591,
            middleName: "",
          },
          {
            id: 2,
            firstName: "Junior",
            lastName: "Doe",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
             email: "jenny@example.com",
            phone: "+1 (444) 444-4444",
            relative: "Uncle"
          },
        ],
      },
    },
  },
  documents: { // Associated legal documents
    primaryWill: { // Primary Will
      profileKey: 'self', // References the primary profile
      data: [ // Specific data for the primary will
        {
          executors: [ // Executors of the primary will
            {
              id: 1,
              name: "Jeny Doe",
              relationship: "Spouse",
              priority: 1,
              city: "Toronto",
              province: "Ontario",
              country: "Canada",
              email: "jeny@example.com",
              phone: "+1 (333) 333-3333",
              lastName: "Doe",
              firstName: "Jeny",
              timestamp: 1725655352589,
              middleName: "",
            },
            {
              id: 2,
              name: "Junior Doe",
              relationship: "Child",
              priority: 2,
              city: "Toronto",
              province: "Ontario",
              country: "Canada",
              uuid: 1, // Unique identifier
            },
          ],
        },
        {
          bequests: { // Bequests in the primary will
            "0": {
              id: 1,
              names: "Junior Doe",
              backup: "Helen Doe",
              shares: "100",
              bequest: "Gold Chain",
              isCustom: false,
              shared_uuid: 0,
            },
            timestamp: 1725655405603,
          },
        },
        {
          residue: { // Residue distribution in the primary will
            selected: "Have the residue go to parents then siblings per stirpes",
            timestamp: 1725655408743,
          },
        },
        {
          wipeout: { // Wipeout details 
            wipeout: {
              custom: false,
              selectedOption: null,
              availableShares: 100,
              selectedCategory: "50% to siblings and 50% to siblings of spouse",
              table_dataBequest: [],
            },
            timestamp: 1725655410515,
          },
        },
        {
          trusting: { // Trusting details (e.g., trusts established)
            "0": {
              id: 1,
              age: "21",
              shares: "100",
            },
            timestamp: 1725655416515,
          },
        },
        {
          guardians: { // Guardians for minors
            "0": {
              id: 1,
              guardian: "Helen Doe",
              position: 1,
            },
            "1": {
              id: 2,
              guardian: "Junior Doe",
              position: 1,
            },
            timestamp: 1725655423984,
          },
        },
        {
          pets: { // Pet care instructions
            "0": {
              id: 4,
              amount: 1000,
              backup: "Jeny Doe",
              guardian: "Junior Doe",
            },
            timestamp: 1725655431757,
          },
        },
        {
          additional: { // Additional instructions
            standard: {
              Slave: {
                buried: true,
                cremation: true,
                organdonation: true,
              },
              Master: "standard",
            },
            timestamp: 1725655436616,
          },
        },
      ],
      documentDOM: { // Document Object Model (versions) for PDF generation
        v1: {
          status: "pending",
          changes: {
            requestedChanges: [],
          },
          content: "html for pdf editor goes here", // Placeholder HTML content
          timestamp: "2024-09-06T20:44:29.125Z",
        },
        v2: {
          status: "pending",
          changes: {
            requestedChanges: [],
          },
          content: "html for pdf editor goes here",
          timestamp: "2024-09-06T20:44:30.000Z",
        },
      },
    },
    spousalWill: { // Spousal Will
      profileKey: 'spouse', // References the spouse profile
      data: [ // Specific data for the spousal will
        {
          executors: [ // Executors of the spousal will
            {
              id: 1,
              name: "Jane Doe",
              relationship: "Spouse",
              priority: 1,
              city: "Toronto",
              province: "Ontario",
              country: "Canada",
              email: "janedoe@example.com",
              phone: "+1 (333) 333-3333",
              lastName: "Doe",
              firstName: "Jane",
              timestamp: 1725655352589,
              middleName: "",
            },
            {
              id: 2,
              name: "Junior Doe",
              relationship: "Child",
              priority: 2,
              city: "Toronto",
              province: "Ontario",
              country: "Canada",
              uuid: 1,
            },
          ],
        },
        {
          bequests: { // Bequests in the spousal will
            "0": {
              id: 1,
              names: "Junior Doe",
              backup: "Helen Doe",
              shares: "100",
              bequest: "Gold Chain",
              isCustom: false,
              shared_uuid: 0,
            },
            timestamp: 1725655405603,
          },
        },
        {
          residue: { // Residue distribution in the spousal will
            selected: "Have the residue go to parents then siblings per stirpes",
            timestamp: 1725655408743,
          },
        },
        {
          wipeout: { // Wipeout details for the spousal will
            wipeout: {
              custom: false,
              selectedOption: null,
              availableShares: 100,
              selectedCategory: "50% to siblings and 50% to siblings of spouse",
              table_dataBequest: [],
            },
            timestamp: 1725655410515,
          },
        },
        {
          trusting: { // Trusting details for the spousal will
            "0": {
              id: 1,
              age: "21",
              shares: "100",
            },
            timestamp: 1725655416515,
          },
        },
        {
          guardians: { // Guardians for minors in the spousal will
            "0": {
              id: 1,
              guardian: "Helen Doe",
              position: 1,
            },
            "1": {
              id: 2,
              guardian: "Junior Doe",
              position: 1,
            },
            timestamp: 1725655423984,
          },
        },
        {
          pets: { // Pet care instructions in the spousal will
            "0": {
              id: 4,
              amount: 1000,
              backup: "Jeny Doe",
              guardian: "Junior Doe",
            },
            timestamp: 1725655431757,
          },
        },
        {
          additional: { // Additional instructions in the spousal will
            standard: {
              Slave: {
                buried: true,
                cremation: true,
                organdonation: true,
              },
              Master: "standard",
            },
            timestamp: 1725655436616,
          },
        },
      ],
      documentDOM: { // Document Object Model (versions) for PDF generation
        v1: {
          status: "pending",
          changes: {
            requestedChanges: [],
          },
          content: "html for pdf editor goes here",
          timestamp: "2024-09-06T20:44:33.500Z",
        },
        v2: {
          status: "pending",
          changes: {
            requestedChanges: [],
          },
          content: "html for pdf editor goes here",
          timestamp: "2024-09-06T20:44:34.000Z",
        },
      },
    },
    secondaryWill: [ // Array of Secondary Wills
      {
        profileKey: '1', // References the first secondary profile
        data: [ // Specific data for the first secondary will
          {
            executors: [ // Executors for the first secondary will
              {
                id: 1,
                name: "Jeny Doe",
                relationship: "Spouse",
                priority: 1,
                city: "Toronto",
                province: "Ontario",
                country: "Canada",
                email: "jeny@example.com",
                phone: "+1 (333) 333-3333",
                lastName: "Doe",
                firstName: "Jeny",
                timestamp: 1725655352589,
                middleName: "",
              },
              {
                id: 2,
                name: "Junior Doe",
                relationship: "Child",
                priority: 2,
                city: "Toronto",
                province: "Ontario",
                country: "Canada",
                uuid: 1,
              },
            ],
          },
          {
            bequests: { // Bequests in the first secondary will
              "0": {
                id: 1,
                names: "Junior Doe",
                backup: "Helen Doe",
                shares: "100",
                bequest: "Gold Chain",
                isCustom: false,
                shared_uuid: 0,
              },
              timestamp: 1725655405603,
            },
          },
          {
            residue: { // Residue distribution in the first secondary will
              selected: "Have the residue go to parents then siblings per stirpes",
              timestamp: 1725655408743,
            },
          },
          {
            wipeout: { // Wipeout details for the first secondary will
              wipeout: {
                custom: false,
                selectedOption: null,
                availableShares: 100,
                selectedCategory: "50% to siblings and 50% to siblings of spouse",
                table_dataBequest: [],
              },
              timestamp: 1725655410515,
            },
          },
          {
            trusting: { // Trusting details for the first secondary will
              "0": {
                id: 1,
                age: "21",
                shares: "100",
              },
              timestamp: 1725655416515,
            },
          },
          {
            guardians: { // Guardians for minors in the first secondary will
              "0": {
                id: 1,
                guardian: "Helen Doe",
                position: 1,
              },
              "1": {
                id: 2,
                guardian: "Junior Doe",
                position: 1,
              },
              timestamp: 1725655423984,
            },
          },
          {
            pets: { // Pet care instructions in the first secondary will
              "0": {
                id: 4,
                amount: 1000,
                backup: "Jeny Doe",
                guardian: "Junior Doe",
              },
              timestamp: 1725655431757,
            },
          },
          {
            additional: { // Additional instructions in the first secondary will
              standard: {
                Slave: {
                  buried: true,
                  cremation: true,
                  organdonation: true,
                },
                Master: "standard",
              },
              timestamp: 1725655436616,
            },
          },
        ],
        documentDOM: { // Document Object Model (versions) for the first secondary will
          v1: {
            status: "pending",
            changes: {
              requestedChanges: [],
            },
            content: "html for secondary will 1 pdf editor goes here",
            timestamp: "2024-09-06T20:44:35.000Z",
          },
          v2: {
            status: "pending",
            changes: {
              requestedChanges: [],
            },
            content: "html for secondary will 1 pdf editor goes here",
            timestamp: "2024-09-06T20:44:36.000Z",
          },
        },
      },
      {
        profileKey: '2', // References the second secondary profile
        data: [ // Specific data for the second secondary will
          {
            executors: [ // Executors for the second secondary will
              {
                id: 1,
                name: "Jenny Doe",
                relationship: "Spouse",
                priority: 1,
                city: "Toronto",
                province: "Ontario",
                country: "Canada",
                email: "jenny@example.com",
                phone: "+1 (444) 444-4444",
                lastName: "Doe",
                firstName: "Jenny",
                timestamp: 1725655352589,
                middleName: "",
              },
              {
                id: 2,
                name: "Junior Doe",
                relationship: "Child",
                priority: 2,
                city: "Toronto",
                province: "Ontario",
                country: "Canada",
                uuid: 2,
              },
            ],
          },
          {
            bequests: { // Bequests in the second secondary will
              "0": {
                id: 1,
                names: "Junior Doe",
                backup: "Helen Doe",
                shares: "100",
                bequest: "Vintage Car",
                isCustom: false,
                shared_uuid: 0,
              },
              timestamp: 1725655405604,
            },
          },
          {
            residue: { // Residue distribution in the second secondary will
              selected: "Have the residue go to parents then siblings per stirpes",
              timestamp: 1725655408744,
            },
          },
          {
            wipeout: { // Wipeout details for the second secondary will
              wipeout: {
                custom: false,
                selectedOption: null,
                availableShares: 100,
                selectedCategory: "50% to siblings and 50% to siblings of spouse",
                table_dataBequest: [],
              },
              timestamp: 1725655410516,
            },
          },
          {
            trusting: { // Trusting details for the second secondary will
              "0": {
                id: 1,
                age: "21",
                shares: "100",
              },
              timestamp: 1725655416516,
            },
          },
          {
            guardians: { // Guardians for minors in the second secondary will
              "0": {
                id: 1,
                guardian: "Helen Doe",
                position: 1,
              },
              "1": {
                id: 2,
                guardian: "Junior Doe",
                position: 1,
              },
              timestamp: 1725655423985,
            },
          },
          {
            pets: { // Pet care instructions in the second secondary will
              "0": {
                id: 4,
                amount: 1000,
                backup: "Jenny Doe",
                guardian: "Junior Doe",
              },
              timestamp: 1725655431758,
            },
          },
          {
            additional: { // Additional instructions in the second secondary will
              standard: {
                Slave: {
                  buried: true,
                  cremation: true,
                  organdonation: true,
                },
                Master: "standard",
              },
              timestamp: 1725655436617,
            },
          },
        ],
        documentDOM: { // Document Object Model (versions) for the second secondary will
          v1: {
            status: "pending",
            changes: {
              requestedChanges: [],
            },
            content: "html for secondary will 2 pdf editor goes here",
            timestamp: "2024-09-06T20:44:37.000Z",
          },
          v2: {
            status: "pending",
            changes: {
              requestedChanges: [],
            },
            content: "html for secondary will 2 pdf editor goes here",
            timestamp: "2024-09-06T20:44:38.000Z",
          },
        },
      },
      // Additional secondary wills can be added here as needed
    ],
    poaProperty: [ // Power of Attorney for Property (POA Property)
      {
        profileKey: 'self', // References the primary profile
        data: {
          attorney: "Junior Doe",
          backups: ["Helen Doe"],
          restrictions: "No restrictions",
        },
        documentDOM: { // Document versions for POA Property of self
          v1: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your POA Property content for self here...</div>",
            timestamp: "2024-09-06T20:44:32.810Z",
          },
          v2: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your POA Property content for self here...</div>",
            timestamp: "2024-09-06T20:44:33.000Z",
          },
        },
      },
      {
        profileKey: 'spouse', // References the spouse profile
        data: {
          attorney: "Jeny Doe",
          backups: ["Junior Doe"],
          restrictions: "No restrictions",
        },
        documentDOM: { // Document versions for POA Property of spouse
          v1: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your spouse's POA Property content here...</div>",
            timestamp: "2024-09-06T20:44:34.500Z",
          },
          v2: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your spouse's POA Property content here...</div>",
            timestamp: "2024-09-06T20:44:35.000Z",
          },
        },
      },
      // Additional POA Property entries can be added here as needed
    ],
    poaHealth: [ // Power of Attorney for Health (POA Health)
      {
        profileKey: 'self', // References the primary profile
        data: {
          attorney: "Junior Doe",
          backups: ["Helen Doe"],
          instructions: "I do not wish to be resuscitated.",
          organDonation: false,
        },
        documentDOM: { // Document versions for POA Health of self
          v1: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your POA Health content for self here...</div>",
            timestamp: "2024-09-06T20:44:35.616Z",
          },
          v2: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your POA Health content for self here...</div>",
            timestamp: "2024-09-06T20:44:36.200Z",
          },
        },
      },
      {
        profileKey: 'spouse', // References the spouse profile
        data: {
          attorney: "Jeny Doe",
          backups: ["Junior Doe"],
          instructions: "I wish to be an organ donor.",
          organDonation: true,
        },
        documentDOM: { // Document versions for POA Health of spouse
          v1: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your spouse's POA Health content here...</div>",
            timestamp: "2024-09-06T20:44:37.200Z",
          },
          v2: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your spouse's POA Health content here...</div>",
            timestamp: "2024-09-06T20:44:38.000Z",
          },
        },
      },
      // Additional POA Health entries can be added here as needed
    ],
    // Other documents can be added here if necessary
  },
});
