export interface Destination {
    slug: string;
    name: string;
    region: string;
    description: string;
    longDescription: string;
    image: string;
    rating: number;
    priceStart: string;
    attractions: { name: string; image: string }[];
    features: string[];
}

export const destinations: Destination[] = [
    // North India
    {
        slug: "jammu-kashmir",
        name: "Jammu & Kashmir",
        region: "North India",
        description:
            "Paradise on Earth, known for its scenic splendor, snow-capped mountains, and plentiful wildlife.",
        longDescription:
            "Jammu & Kashmir is often referred to as 'Paradise on Earth' due to its breathtaking landscapes. From the Shikara rides in Dal Lake to the snow-covered slopes of Gulmarg, it offers a surreal experience. The region is rich in culture, handicrafts, and diverse flora.",
        image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1920",
        rating: 4.9,
        priceStart: "₹15,000",
        attractions: [
            {
                name: "Dal Lake",
                image: "https://images.unsplash.com/photo-1564329494258-3f72215ba175?q=80&w=600",
            },
            {
                name: "Gulmarg",
                image: "https://images.unsplash.com/photo-1568889753852-196c487a536e?q=80&w=600",
            },
            {
                name: "Pahalgam",
                image: "https://images.unsplash.com/photo-1646204892016-711ed35535ec?q=80&w=600",
            },
            {
                name: "Sonamarg",
                image: "https://images.unsplash.com/photo-1688562167973-18d8b64624d1?q=80&w=600",
            },
        ],
        features: ["Houseboats", "Skiing", "Mughal Gardens"],
    },
    {
        slug: "ladakh",
        name: "Ladakh",
        region: "North India",
        description:
            "A land of high passes, rugged mountains, and serene monasteries.",
        longDescription:
            "Ladakh is a region of high mountain passes, crystal clear lakes, and ancient Buddhist monasteries. Known for its unique culture and stunning landscapes like Pangong Lake and Magnetic Hill, it is a haven for adventure seekers and peace lovers alike.",
        image: "https://images.unsplash.com/photo-1617824077360-7a77db40aae1?q=80&w=1920",
        rating: 4.8,
        priceStart: "₹25,000",
        attractions: [
            {
                name: "Pangong Lake",
                image: "https://images.unsplash.com/photo-1606857090627-27ca46667290?q=80&w=600",
            },
            {
                name: "Nubra Valley",
                image: "https://images.unsplash.com/photo-1641599592732-0028d03116bf?q=80&w=600",
            },
            {
                name: "Thiksey Monastery",
                image: "https://images.unsplash.com/photo-1708945124506-e1b2baeb2dd7?q=80&w=600",
            },
            {
                name: "Magnetic Hill",
                image: "https://images.unsplash.com/photo-1641319626759-cc9ea5b18107?q=80&w=600",
            },
        ],
        features: ["Adventure Biking", "Monastery Tours", "Stargazing"],
    },
    {
        slug: "himachal-pradesh",
        name: "Himachal Pradesh",
        region: "North India",
        description:
            "A state in the Himalayas known for its trekking, climbing, and skiing resorts.",
        longDescription:
            "Himachal Pradesh is famed for its scenic mountain towns and resorts such as Shimla, Manali, and Dharamshala. It offers a perfect blend of adventure and relaxation with its apple orchards, colonial architecture, and spiritual centers.",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1920",
        rating: 4.7,
        priceStart: "₹12,000",
        attractions: [
            {
                name: "Shimla",
                image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=600",
            },
            {
                name: "Manali",
                image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?q=80&w=600",
            },
            {
                name: "Kasol",
                image: "https://images.unsplash.com/photo-1581791534721-e599df4417f7?q=80&w=600",
            },
            {
                name: "Spiti Valley",
                image: "https://images.unsplash.com/photo-1617159156637-dfb8655c9f95?q=80&w=600",
            },
        ],
        features: ["Trekking", "Paragliding", "Hot Springs"],
    },
    {
        slug: "uttarakhand",
        name: "Uttarakhand",
        region: "North India",
        description:
            "Known for its Hindu pilgrimage sites and the yoga study center, Rishikesh.",
        longDescription:
            "Uttarakhand, the 'Land of Gods', is home to the Himalayas and the holy river Ganges. It is a major pilgrimage center with the Char Dham Yatra and also a hub for yoga and adventure sports like river rafting in Rishikesh.",
        image: "https://images.unsplash.com/photo-1601821139990-9fc929db79ce?q=80&w=1920",
        rating: 4.6,
        priceStart: "₹10,000",
        attractions: [
            {
                name: "Rishikesh",
                image: "https://images.unsplash.com/photo-1720819029162-8500607ae232?q=80&w=600",
            },
            {
                name: "Nainital",
                image: "https://images.unsplash.com/photo-1610715936287-6c2ad208cdbf?q=80&w=600",
            },
            {
                name: "Mussoorie",
                image: "https://images.unsplash.com/photo-1634804246495-0b77a9e9834f?q=80&w=600",
            },
            {
                name: "Jim Corbett",
                image: "https://images.unsplash.com/photo-1611409518513-f062779abeeb?q=80&w=600",
            },
        ],
        features: ["River Rafting", "Yoga Retreats", "Tiger Safari"],
    },
    {
        slug: "punjab",
        name: "Punjab",
        region: "North India",
        description:
            "The land of five rivers, famous for its Golden Temple and vibrant culture.",
        longDescription:
            "Punjab is the heart of India's Sikh community, famous for its warm hospitality, delicious cuisine, and the stunning Golden Temple in Amritsar. The state is agricultural yet vibrant with music, dance, and festivals.",
        image: "https://images.unsplash.com/photo-1703978407720-7f5eb452195f?q=80&w=1920",
        rating: 4.5,
        priceStart: "₹8,000",
        attractions: [
            {
                name: "Golden Temple",
                image: "https://images.unsplash.com/photo-1623059508779-2542c6e83753?q=80&w=600",
            },
            {
                name: "Wagah Border",
                image: "https://images.unsplash.com/photo-1651910031211-42aaa52b87cc?q=80&w=600",
            },
            {
                name: "Jallianwala Bagh",
                image: "https://images.unsplash.com/photo-1730620775685-811aadc9ebdc?q=80&w=600",
            },
            {
                name: "Rock Garden",
                image: "https://images.unsplash.com/photo-1672799768719-c2d41c309bef?q=80&w=600",
            },
        ],
        features: ["Cultural Food", "Historical Sites", "Farm Stays"],
    },

    // South India
    {
        slug: "kerala",
        name: "Kerala",
        region: "South India",
        description:
            "God's Own Country, famous for its backwaters, tea plantations, and beaches.",
        longDescription:
            "Kerala is renowned for its palm-lined beaches, tranquil backwaters, and network of canals. Inland are the Western Ghats, mountains whose slopes support tea, coffee and spice plantations as well as wildlife. It is also known for its Ayurvedic treatments.",
        image: "https://images.unsplash.com/photo-1593872356907-d67e8587d0f9?q=80&w=1920",
        rating: 4.9,
        priceStart: "₹18,000",
        attractions: [
            {
                name: "Alleppey Houseboats",
                image: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?q=80&w=600",
            },
            {
                name: "Munnar Tea Gardens",
                image: "https://images.unsplash.com/photo-1711192702535-eac61a78ecb0?q=80&w=600",
            },
            {
                name: "Wayanad",
                image: "https://images.unsplash.com/photo-1723709431768-d749b0d814b9?q=80&w=600",
            },
            {
                name: "Varkala Beach",
                image: "https://images.unsplash.com/photo-1719299948942-d6bcf2769bd2?q=80&w=600",
            },
        ],
        features: ["Ayurveda", "Backwater Cruises", "Wildlife Sanctuaries"],
    },
    {
        slug: "tamil-nadu",
        name: "Tamil Nadu",
        region: "South India",
        description:
            "A state known for its Dravidian-style Hindu temples and classical dance.",
        longDescription:
            "Tamil Nadu is famous for its towering Dravidian-style temples, vibrant festivals, and the classical dance form of Bharatanatyam. Cities like Chennai, Madurai, and Mahabalipuram are rich in history and culture.",
        image: "https://images.unsplash.com/photo-1617777854432-2c66c79f970a?q=80&w=1920",
        rating: 4.6,
        priceStart: "₹10,000",
        attractions: [
            {
                name: "Meenakshi Temple",
                image: "https://images.unsplash.com/photo-1692173248120-59547c3d4653?q=80&w=600",
            },
            {
                name: "Mahabalipuram",
                image: "https://images.unsplash.com/photo-1563715493579-e0b3e0493b60?q=80&w=600",
            },
            {
                name: "Ooty",
                image: "https://images.unsplash.com/photo-1707655315272-33a54a771068?q=80&w=600",
            },
            {
                name: "Rameswaram",
                image: "https://images.unsplash.com/photo-1733805569204-41768c7d8c0f?q=80&w=600",
            },
        ],
        features: ["Temple Architecture", "Hill Stations", "Coastal Cuisine"],
    },
    {
        slug: "karnataka",
        name: "Karnataka",
        region: "South India",
        description: "Home to the tech hub Bengaluru and the ruins of Hampi.",
        longDescription:
            "Karnataka offers a diverse mix of modern cities, ancient ruins like Hampi, and lush green forests in Coorg. It is also home to Mysore, known for its opulent palace and Dasara festival.",
        image: "https://images.unsplash.com/photo-1596018382916-56d2e341d784?q=80&w=1920",
        rating: 4.7,
        priceStart: "₹14,000",
        attractions: [
            {
                name: "Hampi",
                image: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?q=80&w=600",
            },
            {
                name: "Mysore Palace",
                image: "https://images.unsplash.com/photo-1657856855186-7cf4909a4f78?q=80&w=600",
            },
            {
                name: "Coorg",
                image: "https://images.unsplash.com/photo-1655128633542-b6b7e86e93b4?q=80&w=600",
            },
            {
                name: "Gokarna",
                image: "https://images.unsplash.com/photo-1580713127239-6954a0a33279?q=80&w=600",
            },
        ],
        features: ["Heritage Sites", "Coffee Plantations", "Beaches"],
    },
    {
        slug: "andhra-pradesh",
        name: "Andhra Pradesh",
        region: "South India",
        description:
            "Known for the Tirumala Venkateswara Temple and Araku Valley.",
        longDescription:
            "Andhra Pradesh is a state bordering India's southeastern coast. It defines the region's culture with its distinct cuisine and the Tirumala Venkateswara Temple, a major pilgrimage site.",
        image: "https://images.unsplash.com/photo-1566237242515-8540394e1993?q=80&w=1920",
        rating: 4.5,
        priceStart: "₹9,000",
        attractions: [
            {
                name: "Tirupati",
                image: "https://images.unsplash.com/photo-1705723116788-d11fa6e3f415?q=80&w=600",
            },
            {
                name: "Araku Valley",
                image: "https://images.unsplash.com/photo-1704916902292-2d9eae6cd667?q=80&w=600",
            },
            {
                name: "Visakhapatnam",
                image: "https://images.unsplash.com/photo-1594313059730-8d0a02f44847?q=80&w=600",
            },
            {
                name: "Srisailam",
                image: "https://images.unsplash.com/photo-1585658973682-59e109ba9568?q=80&w=600",
            },
        ],
        features: ["Pilgrimage", "Hill Valleys", "Beaches"],
    },
    {
        slug: "telangana",
        name: "Telangana",
        region: "South India",
        description:
            "Home to the historic Charminar and the tech city of Hyderabad.",
        longDescription:
            "Telangana features the capital of Hyderabad, the 'Pearl City', known for the Charminar, Golconda Fort, and its IT hubs. It has a rich history of the Nizams giving it a unique cultural blend.",
        image: "https://images.unsplash.com/photo-1657981630164-769503f3a9a8?q=80&w=1920",
        rating: 4.6,
        priceStart: "₹11,000",
        attractions: [
            {
                name: "Charminar",
                image: "https://images.unsplash.com/photo-1657981630164-769503f3a9a8?q=80&w=600",
            },
            {
                name: "Golconda Fort",
                image: "https://images.unsplash.com/photo-1470075446540-4391a96ec621?q=80&w=600",
            },
            {
                name: "Ramoji Film City",
                image: "https://images.unsplash.com/photo-1562041524-748f3fbde03b?q=80&w=600",
            },
            {
                name: "Hussain Sagar",
                image: "https://images.unsplash.com/photo-1712422813106-dfb845a8a7ed?q=80&w=600",
            },
        ],
        features: ["Biryani", "History", "Film City Tours"],
    },

    // West & Central
    {
        slug: "goa",
        name: "Goa",
        region: "West & Central",
        description:
            "Famous for its sandy beaches, nightlife, and Portuguese architecture.",
        longDescription:
            "Goa is India's smallest state by area and is visited by large numbers of international and domestic tourists each year for its white sand beaches, nightlife, places of worship and World Heritage-listed architecture.",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1920",
        rating: 4.8,
        priceStart: "₹15,000",
        attractions: [
            {
                name: "Baga Beach",
                image: "https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?q=80&w=600",
            },
            {
                name: "Basilica of Bom Jesus",
                image: "https://images.unsplash.com/photo-1706940119676-957a79a61248?q=80&w=600",
            },
            {
                name: "Dudhsagar Falls",
                image: "https://images.unsplash.com/photo-1667760334198-d3958029a08b?q=80&w=600",
            },
            {
                name: "Fort Aguada",
                image: "https://images.unsplash.com/photo-1702890761067-4d6fdb0abced?q=80&w=600",
            },
        ],
        features: ["Beach Parties", "Water Sports", "Seafood"],
    },
    {
        slug: "rajasthan",
        name: "Rajasthan",
        region: "West & Central",
        description:
            "The Land of Kings, featuring palaces, forts, and the Thar Desert.",
        longDescription:
            "Rajasthan is a northern Indian state bordering Pakistan. Its palaces and forts are reminders of the many kingdoms that historically vied for the region. It includes the 'Pink City' Jaipur, the 'Blue City' Jodhpur, and the 'City of Lakes' Udaipur.",
        image: "https://images.unsplash.com/photo-1534758607507-754e582adfa4?q=80&w=1920",
        rating: 4.8,
        priceStart: "₹20,000",
        attractions: [
            {
                name: "Jaipur City Palace",
                image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=600",
            },
            {
                name: "Udaipur Lake Palace",
                image: "https://images.unsplash.com/photo-1718812771168-3b3dc283cc78?q=80&w=600",
            },
            {
                name: "Jaisalmer Fort",
                image: "https://images.unsplash.com/photo-1732022648903-737e66c18b08?q=80&w=600",
            },
            {
                name: "Ranthambore",
                image: "https://images.unsplash.com/photo-1597085097507-9549c0b3049b?q=80&w=600",
            },
        ],
        features: ["Royal Palaces", "Desert Safaris", "Folk Culture"],
    },
    {
        slug: "gujarat",
        name: "Gujarat",
        region: "West & Central",
        description: "Home to the Rann of Kutch and the Asiatic Lions.",
        longDescription:
            "Gujarat is a state on the western coast of India. It is known for the Rann of Kutch, a vast salt marsh, and Gir National Park, the only home of Asiatic lions. The state also has significant Gandhi heritage sites.",
        image: "https://images.unsplash.com/photo-1642841819300-20ed449c02a1?q=80&w=1920",
        rating: 4.5,
        priceStart: "₹12,000",
        attractions: [
            {
                name: "Rann of Kutch",
                image: "https://images.unsplash.com/photo-1669015881702-951de590db31?q=80&w=600",
            },
            {
                name: "Gir National Park",
                image: "https://images.unsplash.com/photo-1730998373355-06625ff334bf?q=80&w=600",
            },
            {
                name: "Statue of Unity",
                image: "https://images.unsplash.com/photo-1615033321768-6eaef881fc81?q=80&w=600",
            },
            {
                name: "Somnath Temple",
                image: "https://images.unsplash.com/photo-1735192683815-d8918aad53dc?q=80&w=600",
            },
        ],
        features: ["White Desert", "Lion Safari", "Handicrafts"],
    },
    {
        slug: "maharashtra",
        name: "Maharashtra",
        region: "West & Central",
        description:
            "Home to Mumbai, the Gateway of India, and Ajanta-Ellora caves.",
        longDescription:
            "Maharashtra stretches across the western peninsular region of India. It features Mumbai, the financial capital, and ancient cave temples at Ajanta and Ellora. The Western Ghats provide scenic hill stations like Lonavala and Mahabaleshwar.",
        image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=1920",
        rating: 4.6,
        priceStart: "₹14,000",
        attractions: [
            {
                name: "Gateway of India",
                image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=600",
            },
            {
                name: "Ajanta & Ellora Caves",
                image: "https://images.unsplash.com/photo-1625731226721-b4d51ae70e20?q=80&w=600",
            },
            {
                name: "Lonavala",
                image: "https://images.unsplash.com/photo-1620558601903-9f2441730121?q=80&w=600",
            },
            {
                name: "Shirdi",
                image: "https://images.unsplash.com/photo-1707733580929-19bf89c7ede6?q=80&w=600",
            },
        ],
        features: ["Cave Temples", "Bollywood", "Hill Stations"],
    },
    {
        slug: "madhya-pradesh",
        name: "Madhya Pradesh",
        region: "West & Central",
        description:
            "The Heart of India, known for Khajuraho temples and tiger reserves.",
        longDescription:
            "Madhya Pradesh, a large state in central India, boasts landmarks from eras throughout Indian history. Famous for the erotic sculptures of Khajuraho and wildlife sanctuaries like Kanha and Bandhavgarh.",
        image: "https://images.unsplash.com/photo-1608181017892-cc4a542570d5?q=80&w=1920",
        rating: 4.6,
        priceStart: "₹13,000",
        attractions: [
            {
                name: "Khajuraho",
                image: "https://images.unsplash.com/photo-1629640890590-7836d69c5237?q=80&w=600",
            },
            {
                name: "Kanha National Park",
                image: "https://images.unsplash.com/photo-1606298855672-3efb63017be8?q=80&w=600",
            },
            {
                name: "Sanchi Stupa",
                image: "https://images.unsplash.com/photo-1590514526581-bf7feaee0217?q=80&w=600",
            },
            {
                name: "Gwalior Fort",
                image: "https://images.unsplash.com/photo-1585744945554-5df801d2b680?q=80&w=600",
            },
        ],
        features: ["Wildlife", "Ancient Temples", "History"],
    },

    // East & North East
    {
        slug: "west-bengal",
        name: "West Bengal",
        region: "East & North East",
        description:
            "From the Himalayas to the Bay of Bengal, famous for Sundarbans.",
        longDescription:
            "West Bengal is an eastern Indian state between the Himalayas and the Bay of Bengal. Its capital, Kolkata (formerly Calcutta), retains architectural remnants of its time as the capital of the British Raj. It is also home to the Royal Bengal Tigers in the Sundarbans.",
        image: "https://images.unsplash.com/photo-1597220397294-0d95abb2031c?q=80&w=1920",
        rating: 4.7,
        priceStart: "₹11,000",
        attractions: [
            {
                name: "Victoria Memorial",
                image: "https://images.unsplash.com/photo-1600080077823-a44592513861?q=80&w=600",
            },
            {
                name: "Darjeeling",
                image: "https://images.unsplash.com/photo-1622308644420-b20142dc993c?q=80&w=600",
            },
            {
                name: "Sundarbans",
                image: "https://images.unsplash.com/photo-1551615577-1c7e180a77ac?q=80&w=600",
            },
            {
                name: "Howrah Bridge",
                image: "https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?q=80&w=600",
            },
        ],
        features: ["Tea Estates", "Mangrove Forests", "Colonial History"],
    },
    {
        slug: "sikkim",
        name: "Sikkim",
        region: "East & North East",
        description: "A small state in the Himalayas, home to Kanchenjunga.",
        longDescription:
            "Sikkim is a state in northeast India, bordered by Bhutan, Tibet and Nepal. Part of the Himalayas, the area has a dramatic landscape that includes India’s highest mountain, 8,586m Kangchenjunga. It is also home to glaciers, alpine meadows and thousands of varieties of wildflowers.",
        image: "https://images.unsplash.com/photo-1573398643956-2b9e6ade3456?q=80&w=1920",
        rating: 4.9,
        priceStart: "₹18,000",
        attractions: [
            {
                name: "Nathula Pass",
                image: "https://images.unsplash.com/photo-1697561832430-daebcb737292?q=80&w=600",
            },
            {
                name: "Tsomgo Lake",
                image: "https://images.unsplash.com/photo-1632726823875-43dd9adad495?q=80&w=600",
            }, // Reusing mountains if specific fails
            {
                name: "Gangtok",
                image: "https://images.unsplash.com/photo-1641233122088-9562e3ef0105?q=80&w=600",
            },
            {
                name: "Pelling",
                image: "https://images.unsplash.com/photo-1721884487052-8fb79415772c?q=80&w=600",
            },
        ],
        features: ["High Altitude", "Organic State", "Monasteries"],
    },
    {
        slug: "meghalaya",
        name: "Meghalaya",
        region: "East & North East",
        description:
            "The Abode of Clouds, known for its high rainfall and living root bridges.",
        longDescription:
            "Meghalaya is a state in northeast India. The name means 'the abode of clouds' in Sanskrit. It is famous for its high rainfall, subtropical forests and biodiversity. The root bridges in Cherrapunji are a unique attraction.",
        image: "https://images.unsplash.com/photo-1608884941702-37653a75a725?q=80&w=1920",
        rating: 4.8,
        priceStart: "₹16,000",
        attractions: [
            {
                name: "Cherrapunji",
                image: "https://images.unsplash.com/photo-1608884941702-37653a75a725?q=80&w=600",
            },
            {
                name: "Dawki River",
                image: "https://images.unsplash.com/photo-1534483877780-a284a3fa7fc2?q=80&w=600",
            },
            {
                name: "Shillong",
                image: "https://images.unsplash.com/photo-1609276804051-8c5e906cc430?q=80&w=600",
            },
            {
                name: "Double Decker Root Bridge",
                image: "https://images.unsplash.com/photo-1698429358246-807d8972da9a?q=80&w=600",
            },
        ],
        features: ["Waterfalls", "Caves", "Nature Walks"],
    },
    {
        slug: "assam",
        name: "Assam",
        region: "East & North East",
        description:
            "Known for its tea plantations and Kaziranga National Park.",
        longDescription:
            "Assam is a state in northeastern India known for its wildlife and expansive tea plantations. Kaziranga National Park is home to the vast majority of the world's one-horned rhinoceroses. The Brahmaputra River defines the landscape.",
        image: "https://images.unsplash.com/photo-1589882485484-c073e3742e60?q=80&w=1920",
        rating: 4.6,
        priceStart: "₹14,000",
        attractions: [
            {
                name: "Kaziranga National Park",
                image: "https://images.unsplash.com/photo-1709008503790-2461d8762a45?q=80&w=600",
            },
            {
                name: "Kamakhya Temple",
                image: "https://images.unsplash.com/photo-1642866575552-9dcade23f139?q=80&w=600",
            },
            {
                name: "Majuli Island",
                image: "https://images.unsplash.com/photo-1759738102800-0af1fc5cca5e?q=80&w=600",
            },
            {
                name: "Manas National Park",
                image: "https://images.unsplash.com/photo-1735543724864-7e6271ad6239?q=80&w=600",
            },
        ],
        features: ["One-horned Rhino", "Tea Gardens", "River Cruises"],
    },
    {
        slug: "arunachal-pradesh",
        name: "Arunachal Pradesh",
        region: "East & North East",
        description:
            "The Land of Dawn-Lit Mountains, known for Tawang Monastery.",
        longDescription:
            "Arunachal Pradesh is the northeastern-most state of India. It borders China, Bhutan, and Myanmar. It is known for its pristine beauty, lush green forests, and the Tawang Monastery, the largest monastery in India.",
        image: "https://images.unsplash.com/photo-1639134956623-0d094b12b0dc?q=80&w=1920",
        rating: 4.7,
        priceStart: "₹20,000",
        attractions: [
            {
                name: "Tawang Monastery",
                image: "https://images.unsplash.com/photo-1628443266300-e8490ee38875?q=80&w=600",
            },
            {
                name: "Ziro Valley",
                image: "https://images.unsplash.com/photo-1531252582519-2d7e6795be96?q=80&w=600",
            },
            {
                name: "Sela Pass",
                image: "https://images.unsplash.com/photo-1626761627604-f27d98885f4b?q=80&w=600",
            },
            {
                name: "Namdapha National Park",
                image: "https://images.unsplash.com/photo-1740478870995-43b6e78ecf91?q=80&w=600",
            },
        ],
        features: ["Buddhist Culture", "Trekking", "Tribal Festivals"],
    },
];

export function getDestination(slug: string): Destination | undefined {
    return destinations.find(
        (d) => d.slug.toLowerCase() === slug.toLowerCase(),
    );
}
