const objectStatus = {
  owner: "user@example.com",
  packageInfo: {
    id: 2,
    name: "Premium Package",
    price: "$800",
    campaign: "Facebook",
    created_at: "2024-08-01T00:54:33.000Z",
    updated_at: "2024-08-01T00:55:35.000Z",
    description: "Two Spousal Wills and Two POAs",
  },
  profiles: {
    self: {
      fullName: "John Doe",
      email: "john.doe@example.com",
      telephone: "+1 (111) 111-1111",
      city: "Toronto",
      province: "Ontario",
      country: "Canada",
      timestamp: 1725655298320,
    },
    spouse: {
      firstName: "Jane",
      middleName: "",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phone: "+1 (222) 222-2222",
      city: "Toronto",
      province: "Ontario",
      country: "Canada",
      relative: "Spouse",
      timestamp: 1725655352589,
    },
    children: [
      {
        id: 1,
        firstName: "Jack",
        lastName: "Doe",
        city: "Toronto",
        province: "Ontario",
        country: "Canada",
        relative: "Child",
      },
      {
        id: 2,
        firstName: "Jill",
        lastName: "Doe",
        city: "Toronto",
        province: "Ontario",
        country: "Canada",
        relative: "Child",
      },
    ],
    others: {
      // For secondary wills
      1: {
        self: {
          fullName: "John Doe",
          email: "john.doe@example.com",
          telephone: "+1 (111) 111-1111",
          city: "Toronto",
          province: "Ontario",
          country: "Canada",
          timestamp: 1725655298320,
        },
        spouse: {
          firstName: "Jane",
          middleName: "",
          lastName: "Doe",
          email: "jane.doe@example.com",
          phone: "+1 (222) 222-2222",
          city: "Toronto",
          province: "Ontario",
          country: "Canada",
          relative: "Spouse",
          timestamp: 1725655352589,
        },
        children: [
          {
            id: 1,
            firstName: "Jack",
            lastName: "Doe",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
            relative: "Child",
          },
          {
            id: 2,
            firstName: "Jill",
            lastName: "Doe",
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
            relative: "Child",
          },
        ],
      },
      // Add more entries if there are additional secondary wills
    },
  },
  documents: {
    primaryWill: {
      profileKey: 'self', // Refers to profiles.self
      data: {
        // Specific data for the primary will
        executors: [
          {
            id: 1,
            name: "Jane Doe",
            relationship: "Spouse",
            priority: 1,
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
          },
          {
            id: 2,
            name: "Jack Doe",
            relationship: "Child",
            priority: 2,
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
          },
        ],
        bequests: [
          {
            id: 1,
            item: "Family Heirloom Watch",
            beneficiary: "Jack Doe",
            share: "100%",
          },
        ],
        residue: {
          beneficiaries: ["Jack Doe", "Jill Doe"],
          share: "50% each",
        },
        guardians: ["Jane Doe"],
        pets: [
          {
            id: 1,
            name: "Buddy",
            type: "Dog",
            caretaker: "Jane Doe",
            amount: 1000,
          },
        ],
        additionalInstructions: "I wish to be cremated.",
      },
      documentDOM: {
        versions: {
          v1: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your primary will content here...</div>",
            timestamp: "2024-09-06T20:44:29.125Z",
          },
        },
      },
    },
    spousalWill: {
      profileKey: 'spouse', // Refers to profiles.spouse
      data: {
        // Specific data for the spousal will
        executors: [
          {
            id: 1,
            name: "John Doe",
            relationship: "Spouse",
            priority: 1,
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
          },
          {
            id: 2,
            name: "Jill Doe",
            relationship: "Child",
            priority: 2,
            city: "Toronto",
            province: "Ontario",
            country: "Canada",
          },
        ],
        bequests: [
          {
            id: 1,
            item: "Diamond Necklace",
            beneficiary: "Jill Doe",
            share: "100%",
          },
        ],
        residue: {
          beneficiaries: ["Jack Doe", "Jill Doe"],
          share: "50% each",
        },
        guardians: ["John Doe"],
        pets: [
          {
            id: 1,
            name: "Whiskers",
            type: "Cat",
            caretaker: "John Doe",
            amount: 500,
          },
        ],
        additionalInstructions: "I wish to be buried.",
      },
      documentDOM: {
        versions: {
          v1: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your spousal will content here...</div>",
            timestamp: "2024-09-06T20:44:30.000Z",
          },
        },
      },
    },
    secondaryWills: [
      {
        profileKey: 'others1', // Refers to profiles.others[1]
        data: {
          // Specific data for the secondary will
          executors: [
            {
              id: 1,
              name: "Jane Doe",
              relationship: "Spouse",
              priority: 1,
              city: "Toronto",
              province: "Ontario",
              country: "Canada",
            },
          ],
          bequests: [
            {
              id: 1,
              item: "Vintage Car",
              beneficiary: "Jack Doe",
              share: "100%",
            },
          ],
          residue: {
            beneficiaries: ["Jill Doe"],
            share: "100%",
          },
        },
        documentDOM: {
          versions: {
            v1: {
              status: "pending",
              changes: {
                requestedChanges: [],
              },
              content: "<div>Your secondary will content here...</div>",
              timestamp: "2024-09-06T20:44:31.000Z",
            },
          },
        },
      },
      // Add more entries if there are additional secondary wills
    ],
    poaProperty: {
      profileKey: 'self',
      data: {
        attorney: "Jane Doe",
        backups: ["Jack Doe"],
        restrictions: "No restrictions",
      },
      documentDOM: {
        versions: {
          v1: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your POA Property content here...</div>",
            timestamp: "2024-09-06T20:44:32.810Z",
          },
        },
      },
    },
    poaPropertySpouse: {
      profileKey: 'spouse',
      data: {
        attorney: "John Doe",
        backups: ["Jill Doe"],
        restrictions: "No restrictions",
      },
      documentDOM: {
        versions: {
          v1: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your spouse's POA Property content here...</div>",
            timestamp: "2024-09-06T20:44:33.500Z",
          },
        },
      },
    },
    poaHealth: {
      profileKey: 'self',
      data: {
        attorney: "Jane Doe",
        backups: ["Jack Doe"],
        instructions: "I do not wish to be resuscitated.",
        organDonation: false,
      },
      documentDOM: {
        versions: {
          v1: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your POA Health content here...</div>",
            timestamp: "2024-09-06T20:44:35.616Z",
          },
        },
      },
    },
    poaHealthSpouse: {
      profileKey: 'spouse',
      data: {
        attorney: "John Doe",
        backups: ["Jill Doe"],
        instructions: "I wish to be an organ donor.",
        organDonation: true,
      },
      documentDOM: {
        versions: {
          v1: {
            status: "approved",
            changes: {
              requestedChanges: [],
            },
            content: "<div>Your spouse's POA Health content here...</div>",
            timestamp: "2024-09-06T20:44:36.200Z",
          },
        },
      },
    },
    // Add other documents if necessary
  },
};
