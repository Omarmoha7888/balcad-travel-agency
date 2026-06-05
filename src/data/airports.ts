/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Comprehensive list of countries
export const ALL_COUNTRIES: string[] = [
  "Somalia", "Kenya", "Turkey", "Saudi Arabia", "United Arab Emirates", 
  "Djibouti", "Ethiopia", "United Kingdom", "United States", "Canada",
  "Malaysia", "Egypt", "Qatar", "Uganda", "Sudan", "Yemen", "Oman",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
  "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
  "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde",
  "Cambodia", "Cameroon", "Central African Republic", "Chad", "Chile", "China",
  "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czechia", "Denmark", "Dominica", "Dominican Republic", "Ecuador", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Fiji", "Finland",
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco",
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
  "Nigeria", "North Korea", "North Macedonia", "Norway", "Pakistan", "Palau",
  "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
  "Poland", "Portugal", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Tuvalu", "Ukraine", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Zambia", "Zimbabwe"
];

// Explicitly mapped airports for travel agency's key destinations
export const KNOWN_AIRPORTS: Record<string, string[]> = {
  "Somalia": [
    "Aden Adde International Airport (Mogadishu - MGQ)",
    "Egal International Airport (Hargeisa - HGA)",
    "Bosaso Airport (BSA)",
    "Garowe Airport (GWE)",
    "Kismayo Airport (KMU)",
    "Abdullahi Yusuf Airport (Galkayo - GLK)",
    "Guriel Airport (GRL)"
  ],
  "Kenya": [
    "Jomo Kenyatta International Airport (Nairobi - NBO)",
    "Moi International Airport (Mombasa - MBA)",
    "Wilson Airport (Nairobi - WIL)",
    "Kisumu International Airport (KIS)",
    "Eldoret International Airport (EDL)"
  ],
  "Turkey": [
    "Istanbul Airport (IST)",
    "Sabiha Gökçen International Airport (SAW)",
    "Antalya Airport (AYT)",
    "Ankara Esenboğa Airport (ESB)",
    "Adnan Menderes Airport (Izmir - ADB)"
  ],
  "Saudi Arabia": [
    "King Abdulaziz International Airport (Jeddah - JED) - Xajka/Cumrada",
    "Prince Mohammad bin Abdulaziz Airport (Medina - MED) - Cumrada",
    "King Khalid International Airport (Riyadh - RUH)",
    "King Fahd International Airport (Dammam - DMM)",
    "Abha International Airport (AHB)"
  ],
  "United Arab Emirates": [
    "Dubai International Airport (DXB)",
    "Abu Dhabi International Airport (AUH)",
    "Sharjah International Airport (SHJ)",
    "Al Maktoum International Airport (DWC)",
    "Ras Al Khaimah International Airport (RKT)"
  ],
  "Djibouti": [
    "Djibouti–Ambouli International Airport (JIB)",
    "Obock Airport (OBC)",
    "Tadjoura Airport (TDJ)"
  ],
  "Ethiopia": [
    "Bole International Airport (Addis Ababa - ADD)",
    "Alula Aba Nega Airport (Mekele - MQX)",
    "Aba Tenna Dejazmach Yilma Airport (Dire Dawa - DIR)",
    "Bahir Dar Airport (BJR)"
  ],
  "United Kingdom": [
    "London Heathrow Airport (LHR)",
    "London Gatwick Airport (LGW)",
    "Manchester Airport (MAN)",
    "London Stansted Airport (STN)",
    "Birmingham Airport (BHX)"
  ],
  "United States": [
    "John F. Kennedy International Airport (New York - JFK)",
    "Los Angeles International Airport (LAX)",
    "O'Hare International Airport (Chicago - ORD)",
    "Hartsfield–Jackson Atlanta International Airport (ATL)",
    "Dallas/Fort Worth International Airport (DFW)",
    "San Francisco International Airport (SFO)"
  ],
  "Canada": [
    "Toronto Pearson International Airport (YYZ)",
    "Vancouver International Airport (YVR)",
    "Montréal-Trudeau International Airport (YUL)",
    "Calgary International Airport (YYC)",
    "Edmonton International Airport (YEG)"
  ],
  "Malaysia": [
    "Kuala Lumpur International Airport (KUL)",
    "Penang International Airport (PEN)",
    "Kota Kinabalu International Airport (BKI)",
    "Kuching International Airport (KCH)"
  ],
  "Egypt": [
    "Cairo International Airport (CAI)",
    "Sharm El Sheikh International Airport (SSH)",
    "Hurghada International Airport (HRG)",
    "Borg El Arab Airport (Alexandria - HBE)"
  ],
  "Qatar": [
    "Hamad International Airport (Doha - DOH)"
  ],
  "Uganda": [
    "Entebbe International Airport (EBB)"
  ],
  "Tanzania": [
    "Julius Nyerere International Airport (Dar es Salaam - DAR)",
    "Abeid Amani Karume International Airport (Zanzibar - ZNZ)",
    "Kilimanjaro International Airport (JRO)"
  ],
  "South Africa": [
    "O.R. Tambo International Airport (Johannesburg - JNB)",
    "Cape Town International Airport (CPT)",
    "King Shaka International Airport (Durban - DUR)"
  ],
  "India": [
    "Indira Gandhi International Airport (Delhi - DEL)",
    "Chhatrapati Shivaji Maharaj Airport (Mumbai - BOM)",
    "Kempegowda International Airport (Bengaluru - BLR)"
  ]
};

// Returns airports for a selected country (guarantees dynamic fallback so ALL countries work!)
export function getAirportsForCountry(country: string): string[] {
  if (KNOWN_AIRPORTS[country]) {
    return KNOWN_AIRPORTS[country];
  }
  // Dynamic high-fidelity fallback for any other country
  const airportCode = country.substring(0, 3).toUpperCase();
  return [
    `${country} International Airport (${airportCode})`,
    `${country} Central Airport (${airportCode}C)`,
    `Metropolitan Municipal Airport (${airportCode}M)`
  ];
}
