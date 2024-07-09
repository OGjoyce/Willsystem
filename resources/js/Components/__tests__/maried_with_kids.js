const object_status = [
    {
        "personal": {
            "step": 0,
            "title": "Please insert the personal information",
            "city": "Guatemala",
            "telephone": "+1",
            "province": "Ontario",
            "fullName": "Henry Veliz",
            "timestamp": 1720433920827
        }
    },
    {
        "marriedq": {
            "selection": "true",
            "timestamp": 1720433927978
        }
    },
    {
        "married": {
            "firstName": "Jennifer",
            "middleName": "Tatiana",
            "lastName": "Salguero",
            "relative": "Spouse",
            "email": "e@e.com",
            "phone": "+1",
            "city": "Poptun",
            "province": "Peten",
            "country": "Guatemala",
            "timestamp": 1720433992957
        }
    },
    {
        "kidsq": {
            "selection": "true"
        }
    },
    {
        "kids": {
            "0": {
                "id": 1,
                "firstName": "Eddie",
                "lastName": "Véliz",
                "relative": "Children",
                "city": "Poptun",
                "country": "Guatemala",
                "province": "Peten"
            },
            "1": {
                "id": 2,
                "firstName": "Helen",
                "lastName": "Veliz",
                "relative": "Children",
                "city": "Poptun",
                "country": "Guatemala",
                "province": "Peten"
            }
        }
    },
    {
        "relatives": {
            "0": {
                "firstName": "Hector",
                "middleName": "Abraham",
                "lastName": "Veliz",
                "relative": "Father",
                "email": "e@e.com",
                "phone": "+1",
                "city": "Poptun",
                "province": "Peten",
                "country": "Guatemala"
            }
        },
        "executors": {
            "0": {
                "id": 1,
                "firstName": "Hector",
                "lastName": "Veliz",
                "relative": "Father",
                "country": "Guatemala",
                "city": "Poptun",
                "province": "Peten"
            },
            "1": {
                "id": 2,
                "firstName": "Helen",
                "lastName": "Veliz",
                "relative": "Children",
                "country": "Guatemala",
                "city": "Poptun",
                "province": "Peten"
            }
        }
    },
    {
        "bequests": {
            "0": {
                "id": 1,
                "names": "Jennifer Salguero",
                "shares": "100",
                "bequest": "Gold Chain"
            },
            "1": {
                "id": 3,
                "names": "Eddie Véliz",
                "shares": "50",
                "bequest": "Silver Chain"
            },
            "2": {
                "id": 4,
                "names": "Helen Veliz",
                "shares": "50",
                "bequest": "Silver Chain"
            },
            "3": {
                "id": 6,
                "names": "Hector Veliz",
                "shares": "100",
                "bequest": "Bronce Chain"
            },
            "4": {
                "id":7,
                "names":"",
                "shares":"100",
                "bequest":"I leave to my dauther Stefany Ross  a brand new car and $1000 a month for grocerys",
                "isCustom":true
            },
            "timestamp": 1720434130834
        }
    },
    {
        "residue": {
            "selected": "Specific Beneficiaries",
            "beneficiary": [
                {
                    "id": 1,
                    "beneficiary": "Jennifer Salguero",
                    "backup": "Hector Veliz",
                    "type": "Per Capita",
                    "shares": 50
                },
                {
                    "id": 2,
                    "beneficiary": "Eddie Véliz",
                    "backup": "Helen Veliz",
                    "type": "Per Capita",
                    "shares": 50
                }
            ],
            "timestamp": 1720434202243
        }
    },
    {
        "wipeout": {
            "wipeout": [
                {
                    "id": 0,
                    "names": "Jennifer Salguero",
                    "shares": "50",
                    "backup": "Per Capita"
                },
                {
                    "id": 1,
                    "names": "Hector Veliz",
                    "shares": "50",
                    "backup": "Per Capita"
                }
            ],
            "timestamp": 1720434310716
        }
    },
    {
        "trusting": {
            "0": {
                "id": 2,
                "age": "25",
                "shares": "50"
            },
            "1": {
                "id": 3,
                "age": "20",
                "shares": "25"
            },
            "2": {
                "id": 4,
                "age": "18",
                "shares": "25"
            },
            "timestamp": 1720434365209
        }
    },
    {
        "guardians": {
            "0": {
                "id": 1,
                "guardian": "Jennifer Salguero",
                "position": "1"
            },
            "1": {
                "id": 2,
                "guardian": "Hector Veliz",
                "position": "2"
            },
            "timestamp": 1720434380791
        },
        "pets": {
            "timestamp": 1720434380791
        }
    },
    {
        "pets": {
            "0": {
                "id": 1,
                "guardian": "Eddie Véliz",
                "backup": "Helen Veliz",
                "amount": 1000
            },
            "timestamp": 1720434391669
        }
    },
    {
        "additional": {
            "0": {
                "Master": "standard",
                "Slave": {
                    "organdonation": true,
                    "cremation": true,
                    "buried": true
                }
            },
            "1": {
                "Master": "otherWishes",
                "customClause": "Bury my dog next to me when he dies"
            },
            "2": {
                "blendedFamily": true
            },
            "timestamp": 1720434424355
        }
    },
    {
        "poa": {
            "0": "Helen Veliz",
            "1": "Jennifer Salguero",
            "2": "Eddie Véliz",
            "3": "Hector Veliz",
            "5": "Eddie Véliz",
            "6": "Hector Veliz",
            "7": "Eddie Véliz",
            "8": "Hector Veliz",
            "timestamp": 1720434450655
        }
    },
    {}
]

export default object_status
