document.addEventListener("DOMContentLoaded", function () {
    const API_KEY = "CLE_GOOGLE"; // Remplacez par votre clé API Google Maps.

    // Adresses des centres de départ
    const centres = {
        centre1: "34 Rue du Colonel Delorme, 93100 Montreuil",
        centre2: "4 Rue Paul Montrochet, 69002 Lyon",
    };

    // Modes de transport avec empreintes carbone (gCO2/km) et vitesses moyennes (km/h)
    const modes = [
        { type: "Camionnette", carbone: 200, vitesse: 50 },
        { type: "Moto", carbone: 87, vitesse: 60 },
        { type: "Vélo", carbone: 0, vitesse: 20 },
        { type: "Robot autonome", carbone: 30, vitesse: 15 },
        { type: "Piéton", carbone: 0, vitesse: 5 },
        { type: "Drone", carbone: 20, vitesse: 70 },
    ];

    const transportContainer = document.getElementById("modes-transport");
    const form = document.getElementById("livraison-form");
    
    async function calculerDistances(adresseClient, centreDepart) {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
            centreDepart
        )}&destinations=${encodeURIComponent(adresseClient)}&key=${API_KEY}&units=metric`;
        const url_proxycors = "https://cors-anywhere.herokuapp.com/"
    
        console.log("Requête envoyée à l'API :", url);
    
        try {
            const response = await fetch(url_proxycors+url);
            const data = await response.json();
    
            console.log("Réponse API :", data);
    
            if (data.status === "OK") {
                if (data.rows[0].elements[0].status === "OK") {
                    return {
                        distance: data.rows[0].elements[0].distance.value / 1000, // en km
                        duree: data.rows[0].elements[0].duration.value / 3600,  // en heures
                    };
                } else {
                    console.error("Problème avec les adresses :", data.rows[0].elements[0].status);
                    throw new Error(data.rows[0].elements[0].status);
                }
            } else {
                console.error("Erreur générale API :", data.error_message || data.status);
                throw new Error(data.error_message || data.status);
            }
        } catch (error) {
            console.error("Erreur rencontrée :", error.message);
            throw error;
        }
    }
    
    
    

async function afficherModesTransport() {
    transportContainer.innerHTML = "<p>Calcul en cours...</p>";

    const adresseClient = document.getElementById("adresse").value;
    const centreDepart = centres[document.getElementById("depart").value];

    try {
        const { distance, duree } = await calculerDistances(adresseClient, centreDepart);

        transportContainer.innerHTML = ""; // Efface l'ancien contenu
        modes.forEach((mode) => {
            const tempsTotalHeures = distance / mode.vitesse; // Temps total en heures
            const heures = Math.floor(tempsTotalHeures); // Partie entière en heures
            const minutes = Math.round((tempsTotalHeures - heures) * 60); // Partie fractionnaire convertie en minutes
            const carbone = (mode.carbone * distance).toFixed(2); // en gCO₂

            const element = document.createElement("div");
            element.className = "mode-transport";
            element.innerHTML = `
                <label>
                    <input type="radio" name="transport" value="${mode.type}">
                    <strong>${mode.type}</strong><br>
                    Distance : <span>${distance.toFixed(2)}</span> km<br>
                    Empreinte carbone : <span>${carbone}</span> gCO₂<br>
                    Temps estimé : <span>${heures} heures ${minutes} minutes</span>
                </label>
            `;
            transportContainer.appendChild(element);
        });
    } catch (error) {
        transportContainer.innerHTML = `<p>Erreur : ${error.message}</p>`;
    }
}
async function afficherModesTransport() {
    transportContainer.innerHTML = "<p>Calcul en cours...</p>";

    const adresseClient = document.getElementById("adresse").value;
    const centreDepart = centres[document.getElementById("depart").value];

    try {
        const { distance, duree } = await calculerDistances(adresseClient, centreDepart);

        transportContainer.innerHTML = ""; // Efface l'ancien contenu
        modes.forEach((mode) => {
            const tempsTotalHeures = distance / mode.vitesse; // Temps total en heures
            const heures = Math.floor(tempsTotalHeures); // Partie entière en heures
            const minutes = Math.round((tempsTotalHeures - heures) * 60); // Partie fractionnaire convertie en minutes
            const carbone = (mode.carbone * distance).toFixed(2); // en gCO₂

            const element = document.createElement("div");
            element.className = "mode-transport";
            element.innerHTML = `
                <label>
                    <input type="radio" name="transport" value="${mode.type}">
                    <strong>${mode.type}</strong><br>
                    Distance : <span>${distance.toFixed(2)}</span> km<br>
                    Empreinte carbone : <span>${carbone}</span> gCO₂<br>
                    Temps estimé : <span>${heures} heures ${minutes} minutes</span>
                </label>
            `;
            transportContainer.appendChild(element);
        });
    } catch (error) {
        transportContainer.innerHTML = `<p>Erreur : ${error.message}</p>`;
    }
}

    

    // Afficher les modes de transport lorsque le formulaire est soumis
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Empêcher la soumission par défaut
        afficherModesTransport();
    });


    async function validerAdresse(adresse) {
        const API_KEY = "VOTRE_CLE_API_GOOGLE_MAPS";
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(adresse)}&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "OK") {
            return data.results[0].formatted_address; // Retourne l'adresse formatée
        } else {
            throw new Error("Adresse invalide ou introuvable.");
        }
    }
    
});
