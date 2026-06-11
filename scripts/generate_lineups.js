const fs = require('fs');
const path = require('path');

// Dictionary of top real players for key teams
const realStars = {
  "1": [ // Mexico (ID 1)
    { name: "G. Ochoa", pos: "GK" },
    { name: "C. Montes", pos: "DF" },
    { name: "J. Vasquez", pos: "DF" },
    { name: "J. Sanchez", pos: "DF" },
    { name: "J. Gallardo", pos: "DF" },
    { name: "E. Alvarez", pos: "MF" },
    { name: "L. Chavez", pos: "MF" },
    { name: "O. Pineda", pos: "MF" },
    { name: "S. Gimenez", pos: "FW" },
    { name: "H. Lozano", pos: "FW" },
    { name: "U. Antuna", pos: "FW" }
  ],
  "3": [ // South Korea (ID 3)
    { name: "Jo Hyeon-woo", pos: "GK" },
    { name: "Kim Min-jae", pos: "DF" },
    { name: "Kim Young-gwon", pos: "DF" },
    { name: "Seol Young-woo", pos: "DF" },
    { name: "Kim Jin-su", pos: "DF" },
    { name: "Hwang In-beom", pos: "MF" },
    { name: "Lee Jae-sung", pos: "MF" },
    { name: "Lee Kang-in", pos: "MF" },
    { name: "Son Heung-min", pos: "FW" },
    { name: "Hwang Hee-chan", pos: "FW" },
    { name: "Cho Gue-sung", pos: "FW" }
  ],
  "5": [ // Canada (ID 5)
    { name: "M. Crepeau", pos: "GK" },
    { name: "A. Johnston", pos: "DF" },
    { name: "K. Miller", pos: "DF" },
    { name: "D. Cornelius", pos: "DF" },
    { name: "A. Davies", pos: "DF" },
    { name: "S. Eustaquio", pos: "MF" },
    { name: "I. Kone", pos: "MF" },
    { name: "J. Shaffelburg", pos: "MF" },
    { name: "J. David", pos: "FW" },
    { name: "C. Larin", pos: "FW" },
    { name: "T. Buchanan", pos: "FW" }
  ],
  "8": [ // Switzerland (ID 8)
    { name: "Y. Sommer", pos: "GK" },
    { name: "M. Akanji", pos: "DF" },
    { name: "N. Elvedi", pos: "DF" },
    { name: "R. Rodriguez", pos: "DF" },
    { name: "S. Widmer", pos: "DF" },
    { name: "G. Xhaka", pos: "MF" },
    { name: "R. Freuler", pos: "MF" },
    { name: "D. Sow", pos: "MF" },
    { name: "X. Shaqiri", pos: "FW" },
    { name: "B. Embolo", pos: "FW" },
    { name: "Z. Amdouni", pos: "FW" }
  ],
  "9": [ // Brazil (ID 9)
    { name: "Alisson Becker", pos: "GK" },
    { name: "Marquinhos", pos: "DF" },
    { name: "Gabriel Magalhaes", pos: "DF" },
    { name: "Danilo", pos: "DF" },
    { name: "Yan Couto", pos: "DF" },
    { name: "Bruno Guimaraes", pos: "MF" },
    { name: "Douglas Luiz", pos: "MF" },
    { name: "Lucas Paqueta", pos: "MF" },
    { name: "Vinicius Jr", pos: "FW" },
    { name: "Rodrygo Goes", pos: "FW" },
    { name: "Raphinha", pos: "FW" }
  ],
  "10": [ // Morocco (ID 10)
    { name: "Yassine Bounou", pos: "GK" },
    { name: "Achraf Hakimi", pos: "DF" },
    { name: "Nayef Aguerd", pos: "DF" },
    { name: "Romain Saiss", pos: "DF" },
    { name: "Noussair Mazraoui", pos: "DF" },
    { name: "Sofyan Amrabat", pos: "MF" },
    { name: "Azzedine Ounahi", pos: "MF" },
    { name: "Selim Amallah", pos: "MF" },
    { name: "Hakim Ziyech", pos: "FW" },
    { name: "Youssef En-Nesyri", pos: "FW" },
    { name: "Amine Adli", pos: "FW" }
  ],
  "13": [ // United States (ID 13)
    { name: "Matt Turner", pos: "GK" },
    { name: "Tim Ream", pos: "DF" },
    { name: "Chris Richards", pos: "DF" },
    { name: "Antonee Robinson", pos: "DF" },
    { name: "Sergino Dest", pos: "DF" },
    { name: "Tyler Adams", pos: "MF" },
    { name: "Weston McKennie", pos: "MF" },
    { name: "Yunus Musah", pos: "MF" },
    { name: "Christian Pulisic", pos: "FW" },
    { name: "Folarin Balogun", pos: "FW" },
    { name: "Timothy Weah", pos: "FW" }
  ],
  "15": [ // Australia (ID 15)
    { name: "Mathew Ryan", pos: "GK" },
    { name: "Harry Souttar", pos: "DF" },
    { name: "Kye Rowles", pos: "DF" },
    { name: "Aziz Behich", pos: "DF" },
    { name: "Gethin Jones", pos: "DF" },
    { name: "Jackson Irvine", pos: "MF" },
    { name: "Keanu Baccus", pos: "MF" },
    { name: "Connor Metcalfe", pos: "MF" },
    { name: "Mitchell Duke", pos: "FW" },
    { name: "Craig Goodwin", pos: "FW" },
    { name: "Martin Boyle", pos: "FW" }
  ],
  "16": [ // Turkey (ID 16)
    { name: "Altay Bayindir", pos: "GK" },
    { name: "Merih Demiral", pos: "DF" },
    { name: "Abdulkerim Bardakci", pos: "DF" },
    { name: "Ferdi Kadioglu", pos: "DF" },
    { name: "Zeki Celik", pos: "DF" },
    { name: "Hakan Calhanoglu", pos: "MF" },
    { name: "Salih Ozcan", pos: "MF" },
    { name: "Orkun Kokcu", pos: "MF" },
    { name: "Kenan Yildiz", pos: "FW" },
    { name: "Arda Guler", pos: "FW" },
    { name: "Baris Alper Yilmaz", pos: "FW" }
  ],
  "17": [ // Germany (ID 17)
    { name: "Manuel Neuer", pos: "GK" },
    { name: "Antonio Rudiger", pos: "DF" },
    { name: "Jonathan Tah", pos: "DF" },
    { name: "Joshua Kimmich", pos: "DF" },
    { name: "David Raum", pos: "DF" },
    { name: "Robert Andrich", pos: "MF" },
    { name: "Toni Kroos", pos: "MF" },
    { name: "Ilkay Gundogan", pos: "MF" },
    { name: "Jamal Musiala", pos: "FW" },
    { name: "Florian Wirtz", pos: "FW" },
    { name: "Kai Havertz", pos: "FW" }
  ],
  "21": [ // Netherlands (ID 21)
    { name: "Bart Verbruggen", pos: "GK" },
    { name: "Virgil van Dijk", pos: "DF" },
    { name: "Nathan Ake", pos: "DF" },
    { name: "Stefan de Vrij", pos: "DF" },
    { name: "Denzel Dumfries", pos: "DF" },
    { name: "Jerdy Schouten", pos: "MF" },
    { name: "Tijjani Reijnders", pos: "MF" },
    { name: "Joey Veerman", pos: "MF" },
    { name: "Cody Gakpo", pos: "FW" },
    { name: "Memphis Depay", pos: "FW" },
    { name: "Xavi Simons", pos: "FW" }
  ],
  "22": [ // Japan (ID 22)
    { name: "Zion Suzuki", pos: "GK" },
    { name: "Ko Itakura", pos: "DF" },
    { name: "Takehiro Tomiyasu", pos: "DF" },
    { name: "Yukinari Sugawara", pos: "DF" },
    { name: "Hiroki Ito", pos: "DF" },
    { name: "Wataru Endo", pos: "MF" },
    { name: "Hidemasa Morita", pos: "MF" },
    { name: "Daichi Kamada", pos: "MF" },
    { name: "Takefusa Kubo", pos: "FW" },
    { name: "Kaoru Mitoma", pos: "FW" },
    { name: "Takumi Minamino", pos: "FW" }
  ],
  "25": [ // Belgium (ID 25)
    { name: "Koen Casteels", pos: "GK" },
    { name: "Jan Vertonghen", pos: "DF" },
    { name: "Wout Faes", pos: "DF" },
    { name: "Timothy Castagne", pos: "DF" },
    { name: "Arthur Theate", pos: "DF" },
    { name: "Amadou Onana", pos: "MF" },
    { name: "Orel Mangala", pos: "MF" },
    { name: "Kevin De Bruyne", pos: "MF" },
    { name: "Jeremy Doku", pos: "FW" },
    { name: "Romelu Lukaku", pos: "FW" },
    { name: "Leandro Trossard", pos: "FW" }
  ],
  "26": [ // Egypt (ID 26)
    { name: "M. El Shenawy", pos: "GK" },
    { name: "M. Abdelmonem", pos: "DF" },
    { name: "Ahmed Hegazi", pos: "DF" },
    { name: "Mohamed Hany", pos: "DF" },
    { name: "Mohamed Hamdy", pos: "DF" },
    { name: "Mohamed Elneny", pos: "MF" },
    { name: "Hamdi Fathi", pos: "MF" },
    { name: "Marwan Attia", pos: "MF" },
    { name: "Mohamed Salah", pos: "FW" },
    { name: "Omar Marmoush", pos: "FW" },
    { name: "Mostafa Mohamed", pos: "FW" }
  ],
  "27": [ // Iran (ID 27)
    { name: "Alireza Beiranvand", pos: "GK" },
    { name: "Shojae Khalilzadeh", pos: "DF" },
    { name: "Hossein Kanaanizadegan", pos: "DF" },
    { name: "Ramin Rezaeian", pos: "DF" },
    { name: "Milad Mohammadi", pos: "DF" },
    { name: "Saeid Ezatolahi", pos: "MF" },
    { name: "Saman Ghoddos", pos: "MF" },
    { name: "Alireza Jahanbakhsh", pos: "MF" },
    { name: "Mehdi Taremi", pos: "FW" },
    { name: "Sardar Azmoun", pos: "FW" },
    { name: "Ali Gholizadeh", pos: "FW" }
  ],
  "29": [ // Spain (ID 29)
    { name: "Unai Simon", pos: "GK" },
    { name: "Robin Le Normand", pos: "DF" },
    { name: "Aymeric Laporte", pos: "DF" },
    { name: "Dani Carvajal", pos: "DF" },
    { name: "Marc Cucurella", pos: "DF" },
    { name: "Rodri Hernandez", pos: "MF" },
    { name: "Fabian Ruiz", pos: "MF" },
    { name: "Pedri Gonzalez", pos: "MF" },
    { name: "Lamine Yamal", pos: "FW" },
    { name: "Nico Williams", pos: "FW" },
    { name: "Alvaro Morata", pos: "FW" }
  ],
  "32": [ // Uruguay (ID 32)
    { name: "Sergio Rochet", pos: "GK" },
    { name: "Ronald Araujo", pos: "DF" },
    { name: "Jose Maria Gimenez", pos: "DF" },
    { name: "Matias Vina", pos: "DF" },
    { name: "Mathias Olivera", pos: "DF" },
    { name: "Federico Valverde", pos: "MF" },
    { name: "Manuel Ugarte", pos: "MF" },
    { name: "Nicolas de la Cruz", pos: "MF" },
    { name: "Darwin Nunez", pos: "FW" },
    { name: "Facundo Pellistri", pos: "FW" },
    { name: "Luis Suarez", pos: "FW" }
  ],
  "33": [ // France (ID 33)
    { name: "Mike Maignan", pos: "GK" },
    { name: "Dayot Upamecano", pos: "DF" },
    { name: "William Saliba", pos: "DF" },
    { name: "Jules Kounde", pos: "DF" },
    { name: "Theo Hernandez", pos: "DF" },
    { name: "Aurelien Tchouameni", pos: "MF" },
    { name: "N'Golo Kante", pos: "MF" },
    { name: "Adrien Rabiot", pos: "MF" },
    { name: "Antoine Griezmann", pos: "FW" },
    { name: "Kylian Mbappe", pos: "FW" },
    { name: "Ousmane Dembele", pos: "FW" }
  ],
  "34": [ // Senegal (ID 34)
    { name: "Edouard Mendy", pos: "GK" },
    { name: "Kalidou Koulibaly", pos: "DF" },
    { name: "Abdou Diallo", pos: "DF" },
    { name: "Youssouf Sabaly", pos: "DF" },
    { name: "Ismail Jakobs", pos: "DF" },
    { name: "Idrissa Gueye", pos: "MF" },
    { name: "Nampalys Mendy", pos: "MF" },
    { name: "Pape Sarr", pos: "MF" },
    { name: "Sadio Mane", pos: "FW" },
    { name: "Ismaila Sarr", pos: "FW" },
    { name: "Nicolas Jackson", pos: "FW" }
  ],
  "36": [ // Norway (ID 36)
    { name: "Orjan Nyland", pos: "GK" },
    { name: "Leo Ostigard", pos: "DF" },
    { name: "Kristoffer Ajer", pos: "DF" },
    { name: "Julian Ryerson", pos: "DF" },
    { name: "Fredrik Bjorkan", pos: "DF" },
    { name: "Martin Odegaard", pos: "MF" },
    { name: "Sander Berge", pos: "MF" },
    { name: "Patrick Berg", pos: "MF" },
    { name: "Erling Haaland", pos: "FW" },
    { name: "Alexander Sorloth", pos: "FW" },
    { name: "Oscar Bobb", pos: "FW" }
  ],
  "37": [ // Argentina (ID 37)
    { name: "Emiliano Martinez", pos: "GK" },
    { name: "Cristian Romero", pos: "DF" },
    { name: "Nicolas Otamendi", pos: "DF" },
    { name: "Nahuel Molina", pos: "DF" },
    { name: "Nicolas Tagliafico", pos: "DF" },
    { name: "Rodrigo De Paul", pos: "MF" },
    { name: "Alexis Mac Allister", pos: "MF" },
    { name: "Enzo Fernandez", pos: "MF" },
    { name: "Lionel Messi", pos: "FW" },
    { name: "Julian Alvarez", pos: "FW" },
    { name: "Angel Di Maria", pos: "FW" }
  ],
  "41": [ // Portugal (ID 41)
    { name: "Diogo Costa", pos: "GK" },
    { name: "Ruben Dias", pos: "DF" },
    { name: "Pepe", pos: "DF" },
    { name: "Joao Cancelo", pos: "DF" },
    { name: "Nuno Mendes", pos: "DF" },
    { name: "Joao Palhinha", pos: "MF" },
    { name: "Bruno Fernandes", pos: "MF" },
    { name: "Vitinha", pos: "MF" },
    { name: "Cristiano Ronaldo", pos: "FW" },
    { name: "Bernardo Silva", pos: "FW" },
    { name: "Rafael Leao", pos: "FW" }
  ],
  "44": [ // Colombia (ID 44)
    { name: "Camilo Vargas", pos: "GK" },
    { name: "Davinson Sanchez", pos: "DF" },
    { name: "Carlos Cuesta", pos: "DF" },
    { name: "Daniel Munoz", pos: "DF" },
    { name: "Johan Mojica", pos: "DF" },
    { name: "Jefferson Lerma", pos: "MF" },
    { name: "Richard Rios", pos: "MF" },
    { name: "Jhon Arias", pos: "MF" },
    { name: "James Rodriguez", pos: "FW" },
    { name: "Luis Diaz", pos: "FW" },
    { name: "Jhon Duran", pos: "FW" }
  ],
  "45": [ // England (ID 45)
    { name: "Jordan Pickford", pos: "GK" },
    { name: "John Stones", pos: "DF" },
    { name: "Marc Guehi", pos: "DF" },
    { name: "Kyle Walker", pos: "DF" },
    { name: "Kieran Trippier", pos: "DF" },
    { name: "Declan Rice", pos: "MF" },
    { name: "Kobbie Mainoo", pos: "MF" },
    { name: "Jude Bellingham", pos: "MF" },
    { name: "Bukayo Saka", pos: "FW" },
    { name: "Phil Foden", pos: "FW" },
    { name: "Harry Kane", pos: "FW" }
  ],
  "46": [ // Croatia (ID 46)
    { name: "Dominik Livakovic", pos: "GK" },
    { name: "Josko Gvardiol", pos: "DF" },
    { name: "Josip Sutalo", pos: "DF" },
    { name: "Josip Stanisic", pos: "DF" },
    { name: "Marin Pongracic", pos: "DF" },
    { name: "Luka Modric", pos: "MF" },
    { name: "Mateo Kovacic", pos: "MF" },
    { name: "Marcelo Brozovic", pos: "MF" },
    { name: "Andrej Kramaric", pos: "FW" },
    { name: "Ivan Perisic", pos: "FW" },
    { name: "Ante Budimir", pos: "FW" }
  ]
};

// Generic name generators for rest of teams to guarantee high quality localized names
const nameBanks = {
  spanish: {
    GK: ["A. Rodriguez", "M. Lopez", "F. Gomez", "J. Hernandez"],
    DF: ["C. Martinez", "D. Perez", "J. Silva", "M. Sanchez", "A. Torres", "J. Diaz", "F. Morales", "E. Ruiz"],
    MF: ["G. Ramirez", "L. Gonzalez", "E. Ortiz", "C. Castro", "D. Mendoza", "H. Suarez", "M. Cardona"],
    FW: ["J. Rojas", "S. Cordoba", "A. Valencia", "M. Moreno", "G. Guerrero", "J. Quintero", "E. Valencia"]
  },
  english: {
    GK: ["J. Smith", "D. Henderson", "C. Wood"],
    DF: ["M. Keane", "T. Davies", "B. White", "C. Carter", "S. Morrison", "J. Miller", "D. Ward"],
    MF: ["C. Jones", "R. Watson", "L. Evans", "H. Macdonald", "M. Allen", "O. Cooper"],
    FW: ["T. Taylor", "J. Brown", "K. Marshall", "A. Campbell", "B. Mckay", "S. Reid"]
  },
  french: {
    GK: ["J. Samba", "M. Diallo", "F. Ondoa"],
    DF: ["S. Bailly", "D. Dakonam", "C. Mbemba", "B. Manga", "K. Kouassi", "J. Moukoudi", "A. Toure"],
    MF: ["I. Sangare", "M. Aguissa", "G. Imbula", "Y. Moutoussamy", "S. Moutoussamy", "C. Doukoure"],
    FW: ["S. Haller", "Y. Wissa", "M. Elia", "C. Bakambu", "J. Krasso", "F. Diedhiou"]
  },
  arabic: {
    GK: ["M. Al-Owais", "A. Al-Saeed", "H. Hassan"],
    DF: ["A. Al-Bulayhi", "Y. Al-Shahrani", "S. Abdulhamid", "H. Tambakti", "M. Al-Breik", "A. Madibo"],
    MF: ["A. Otayf", "M. Kanno", "S. Al-Faraj", "A. Al-Malki", "H. Al-Harbi", "B. Al-Ahbabi"],
    FW: ["S. Al-Dawsari", "F. Al-Buraikan", "A. Ghareeb", "M. Al-Muwallad", "A. Afif"]
  },
  slavic: {
    GK: ["I. Sehic", "N. Vasilj"],
    DF: ["S. Kolasinac", "A. Ahmedhodzic", "D. Hadzikadunic", "J. Gazibegovic", "N. Milenkovic", "S. Pavlovic"],
    MF: ["M. Pjanic", "A. Krunic", "G. Cimirot", "S. Milinkovic-Savic", "D. Tadic", "N. Gudelj"],
    FW: ["E. Dzeko", "H. Tabakovic", "A. Mitrovic", "D. Vlahovic", "L. Jovic"]
  },
  asian: {
    GK: ["S. Taseer", "M. Al-Hooti", "J. Kim"],
    DF: ["K. Al-Rushaidi", "M. Al-Habsi", "A. Al-Busaidi", "F. Al-Ghabri", "K. Min", "S. Young"],
    MF: ["J. Al-Yahmadi", "A. Al-Saadi", "H. Al-Alawi", "W. Al-Subhi", "H. Beom"],
    FW: ["A. Al-Ghassani", "K. Al-Yajiki", "M. Al-Sabhi", "S. Min", "H. Chan"]
  }
};

const teamLanguageMapping = {
  // Group A
  "1": "mexico", // Real
  "2": "french", // South Africa (approx french/african)
  "3": "korea", // Real
  "4": "slavic", // Czech
  // Group B
  "5": "canada", // Real
  "6": "slavic", // Bosnia
  "7": "arabic", // Qatar
  "8": "swiss", // Real
  // Group C
  "9": "brazil", // Real
  "10": "morocco", // Real
  "11": "french", // Haiti
  "12": "english", // Scotland
  // Group D
  "13": "usa", // Real
  "14": "spanish", // Paraguay
  "15": "australia", // Real
  "16": "turkey", // Real
  // Group E
  "17": "germany", // Real
  "18": "spanish", // Curacao (dutch/spanish names)
  "19": "french", // Ivory Coast
  "20": "spanish", // Ecuador
  // Group F
  "21": "netherlands", // Real
  "22": "japan", // Real
  "23": "english", // Sweden (using english bank for simple mock names)
  "24": "arabic", // Tunisia
  // Group G
  "25": "belgium", // Real
  "26": "egypt", // Real
  "27": "iran", // Real
  "28": "english", // New Zealand
  // Group H
  "29": "spain", // Real
  "30": "french", // Cape Verde (portuguese/french names)
  "31": "arabic", // Saudi Arabia
  "32": "uruguay", // Real
  // Group I
  "33": "france", // Real
  "34": "senegal", // Real
  "35": "arabic", // Iraq
  "36": "norway", // Real
  // Group J
  "37": "argentina", // Real
  "38": "arabic", // Algeria
  "39": "english", // Austria
  "40": "arabic", // Jordan
  // Group K
  "41": "portugal", // Real
  "42": "french", // DR Congo
  "43": "asian", // Uzbekistan
  "44": "colombia", // Real
  // Group L
  "45": "england", // Real
  "46": "croatia", // Real
  "47": "french", // Ghana
  "48": "spanish" // Panama
};

// Load teams
const teamsPath = path.join(__dirname, '../src/data/football.teams.json');
const teams = JSON.parse(fs.readFileSync(teamsPath, 'utf-8'));

const finalLineups = {};

teams.forEach(team => {
  const teamId = team.id;
  
  // If we have hand-crafted real stars, use them!
  if (realStars[teamId]) {
    finalLineups[teamId] = realStars[teamId];
    return;
  }

  // Otherwise generate high quality list dynamically based on language mapping
  const lang = teamLanguageMapping[teamId] || "english";
  const bank = nameBanks[lang] || nameBanks["english"];

  const gks = bank.GK;
  const dfs = bank.DF;
  const mfs = bank.MF;
  const fws = bank.FW;

  // Helper to pull random unique name from bank category
  const selectUnique = (arr, used) => {
    let attempts = 0;
    while (attempts < 100) {
      const idx = Math.floor(Math.random() * arr.length);
      const name = arr[idx];
      if (!used.has(name)) {
        used.add(name);
        return name;
      }
      attempts++;
    }
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const usedNames = new Set();
  const lineup = [
    { name: selectUnique(gks, usedNames), pos: "GK" },
    
    { name: selectUnique(dfs, usedNames), pos: "DF" },
    { name: selectUnique(dfs, usedNames), pos: "DF" },
    { name: selectUnique(dfs, usedNames), pos: "DF" },
    { name: selectUnique(dfs, usedNames), pos: "DF" },

    { name: selectUnique(mfs, usedNames), pos: "MF" },
    { name: selectUnique(mfs, usedNames), pos: "MF" },
    { name: selectUnique(mfs, usedNames), pos: "MF" },

    { name: selectUnique(fws, usedNames), pos: "FW" },
    { name: selectUnique(fws, usedNames), pos: "FW" },
    { name: selectUnique(fws, usedNames), pos: "FW" }
  ];

  finalLineups[teamId] = lineup;
});

// Write JSON output file
const outputPath = path.join(__dirname, '../src/data/football.lineups.json');
fs.writeFileSync(outputPath, JSON.stringify(finalLineups, null, 2), 'utf-8');
console.log('Successfully generated football.lineups.json!');
