const fs = require('fs');
const https = require('https');

const code = `graph TD
    classDef pu fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#0f172a
    classDef au fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0f172a
    classDef sa fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#0f172a
    classDef ad fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#0f172a
    classDef us fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#0f172a
    classDef gu fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#0f172a

    Root((Start App)):::pu --> LP[Landing Page]:::pu
    LP --> Auth[Login / Register]:::au

    Auth --> Reg[Register & OTP]:::au
    Reg --> Login[Login Verification]:::au
    Auth --> Login

    Login --> AccessCheck{Role Mapping}:::au

    AccessCheck -->|SuperAdmin| SADash[SuperAdmin Dash]:::sa
    AccessCheck -->|Admin| AdminDash[Society Admin Dash]:::ad
    AccessCheck -->|Resident| UserDash[Resident App]:::us
    AccessCheck -->|Guard| GuardDash[Guard Tablet]:::gu

    SADash --> S1[Platform Analytics]:::sa
    SADash --> S2[Manage Societies]:::sa

    AdminDash --> A1[Analytics Overview]:::ad
    AdminDash --> A2[Live Feed Stream]:::ad
    AdminDash --> A3[Resident Approvals]:::ad
    AdminDash --> A4[Financials & Bills]:::ad
    AdminDash --> A5[Smart Parking]:::ad
    AdminDash --> A6[Duty Guards]:::ad

    UserDash --> U1[Activity Feed]:::us
    UserDash --> U2[Visitor Actions]:::us
    UserDash --> U3[Pay Maintenance]:::us
    UserDash --> U4[My Vehicles]:::us

    GuardDash --> G1[Scan Entry QR]:::gu
    GuardDash --> G2[Manual Entry]:::gu
    GuardDash --> G3[SOS / Alert]:::gu
`;

const state = {
    code: code,
    mermaid: { theme: 'default' }
};

const base64Str = Buffer.from(JSON.stringify(state)).toString('base64Url');
const url = `https://mermaid.ink/img/${base64Str}`;

const outputPath = "C:\\Users\\RRU_PROGRAMMER\\.gemini\\antigravity\\brain\\23d96a4f-b010-40d1-8ab5-466702f8b2be\\artifacts\\navigation_chart_image.png";

const file = fs.createWriteStream(outputPath);
https.get(url, function(response) {
  if(response.statusCode === 200) {
      response.pipe(file);
      file.on("finish", () => {
          file.close();
          console.log("Image saved successfully to " + outputPath);
      });
  } else {
      console.log("Failed to download image: " + response.statusCode);
  }
}).on('error', (e) => {
    console.log("Network Error: " + e.message);
});
