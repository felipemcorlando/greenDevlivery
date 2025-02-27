document.addEventListener("DOMContentLoaded", function () {
    const API_KEY = "AIzaSyBUb7Ee7AkGvlY75uxBxTGecHCpDoaaZok"; // Remplacez par votre clé API Google Maps.

    // Adresses des centres de départ
    const centres = {
        centre1: "34 Rue du Colonel Delorme, 93100 Montreuil",
        centre2: "4 Rue Paul Montrochet, 69002 Lyon",
    };

    // Modes de transport avec empreintes carbone (gCO2/km) et vitesses moyennes (km/h)
    const modes = [
        { type: "Camionnette", carbone: 200, vitesse: 50 }, // https://tolv-systems.com/actualite/emissions-ges-utilitaires#:~:text=Par%20kilom%C3%A8tre%20parcouru%2C%20un%20poids,CO2%20par%20km%20en%20moyenne
        { type: "Moto", carbone: 87, vitesse: 60 }, // https://youmatter.world/fr/categorie-economie-business/moto-scooter-impact-ecologique/#:~:text=Les%20r%C3%A9sultats%20montraient%20que%20les,130%20g%20de%20CO2%2Fkm
        { type: "Vélo", carbone: 0, vitesse: 20 }, 
        { type: "Piéton", carbone: 0, vitesse: 5 },
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
            // Calcul de la distance entre le centre de départ et l'adresse du client
            const { distance, duree } = await calculerDistances(adresseClient, centreDepart);
    
            transportContainer.innerHTML = "<h3>Modes de transport :</h3>"; // Efface l'ancien contenu
    
            // Vérifier si la distance dépasse 80 km
            if (distance > 80) {
                // Si la distance est supérieure à 80 km, utiliser un train
                const gareProche = await trouverGareProche(adresseClient);
                const distanceDernierKm = await calculerDistances(adresseClient, gareProche.adresse);
    
            // Calcul du temps et de l'empreinte carbone du trajet en train
            const vitesseTrain = 300; // Vitesse moyenne du train en km/h
            const carboneTrain = 1.7; // Empreinte carbone du train en gCO₂/km https://blog.helios.do/calculer-empreinte-carbone-train
            const tempsTrainHeures = distance / vitesseTrain; // Temps en heures
            const carboneTrainTotal = carboneTrain * distance; // Empreinte carbone totale pour le train

            const heuresTrain = Math.floor(tempsTrainHeures);

            // Affichage des informations du trajet en train
            const elementTrain = document.createElement("div");
            elementTrain.className = "mode-transport";

            //Si le temps est inférieur à 24, on affiche seulement les jours estimés
            if (heuresTrain <= 24){
                timeEstimated = `Temps estimé : <span>1 jour</span>`;
            }else{
                timeEstimated = `Temps estimé : <span>`+ heuresTrain % 24 +` jours</span>`;
            }

            elementTrain.innerHTML = `
                <div>
                    <strong>Train</strong> : Livraison jusqu'à la gare la plus proche (${gareProche.nom})<br>
                    Distance en train : <span>${distance.toFixed(2)}</span> km<br>
                    Empreinte carbone du train : <span style="color: green; font-weight: bold;">${carboneTrainTotal.toFixed(2)}</span> gCO₂<br>
                    Gare située à : <span>${distanceDernierKm.distance.toFixed(2)}</span> km de votre adresse.<br>
                    ${timeEstimated}<br>
                </div>
                <p>Choisissez un mode de transport pour les derniers kilomètres :</p>
            `;
            transportContainer.appendChild(elementTrain);
    
                // Proposer des modes de transport pour les derniers kilomètres
                modes.forEach((mode) => {
                    // Appliquer des conditions pour exclure certains modes de transport
                    if (mode.type === "Piéton" && distanceDernierKm.distance > 5) return;
                    if (mode.type === "Vélo" && distanceDernierKm.distance > 10) return;
                    if (mode.type === "Moto" && distanceDernierKm.distance > 70) return;
    
                    const tempsDernierKmHeures = distanceDernierKm.distance / mode.vitesse;
                    const heures = Math.floor(tempsDernierKmHeures);
                    var timeEstimated = ''

                    //Si le temps est inférieur à 24, on affiche seulement les jours estimés
                    if (heures <= 24){
                        timeEstimated = `Temps estimé : <span>1 jour</span> </label>`;
                    }else{
                        timeEstimated = `Temps estimé : <span>`+ heures % 24 +` jours</span> </label>`;
                    }
                    const carbone = (mode.carbone * distanceDernierKm.distance).toFixed(2);
                    const modeElement = document.createElement("div");
                    modeElement.className = "mode-transport";

                    //Si le mode de transport n'est ni camionnette ni moto, alors on met en exergue l'empreinte carbonne
                    var addGreen = '';
                    
                    
                    if (mode.type != 'Camionnette' && mode.type != 'Moto'){
                        addGreen = 'style="color: green; font-weight: bold;"';
                    }
                    var toInsert = `
                            <label>
                                <input type="radio" name="transport" value="${mode.type}" onclick="summerize(${carbone}, ${carboneTrainTotal})";>
                                <strong>${mode.type}</strong><br>
                                Distance : <span>${distanceDernierKm.distance.toFixed(2)}</span> km<br>
                                Empreinte carbone : <span ${addGreen}>${carbone}</span> gCO₂<br>
                    `;
                    modeElement.innerHTML = toInsert+timeEstimated;
                    transportContainer.appendChild(modeElement);
                });
            } else {
                // Si la distance est inférieure à 80 km, proposer les modes de transport normaux
                modes.forEach((mode) => {
                    // Appliquer des conditions pour exclure certains modes de transport
                    if (mode.type === "Piéton" && distance > 5) return;
                    if (mode.type === "Vélo" && distance > 10) return;
                    if (mode.type === "Moto" && distance > 70) return;
    
                    const tempsTotalHeures = distance / mode.vitesse;
                    const heures = Math.floor(tempsTotalHeures);
                    const minutes = Math.round((tempsTotalHeures - heures) * 60);
                    const carbone = (mode.carbone * distance).toFixed(2);
                    var timeEstimated = ''

                    //Si le temps est inférieur à 24, on affiche seulement les jours estimés
                    if (heures <= 24){
                        timeEstimated = `Temps estimé : <span>1 jour</span> </label>`;
                    }else{
                        timeEstimated = `Temps estimé : <span>`+ heures % 24 +` jours</span> </label>`;
                    }


                    //Si le mode de transport n'est ni camionnette ni moto, alors on met en exergue l'empreinte carbonne
                    var addGreen = '';
                    

                    if (mode.type != 'Camionnette' && mode.type != 'Moto'){
                        addGreen = 'style="color: green; font-weight: bold;"';
                    }
                    const element = document.createElement("div");
                    element.className = "mode-transport";
                    var toInsert = `
                        <label>
                            <input type="radio" name="transport" value="${mode.type}" onclick="summerize(${carbone});">
                            <strong>${mode.type}</strong><br>
                            Distance : <span>${distance.toFixed(2)}</span> km<br>
                            Empreinte carbone : <span ${addGreen}>${carbone}</span> gCO₂<br>
                        </label>
                    `;
                    element.innerHTML = toInsert+timeEstimated;
                    transportContainer.appendChild(element);
                });
            }
    
            // Affiche un message si aucun mode de transport n'est disponible
            if (transportContainer.innerHTML.trim() === "") {
                transportContainer.innerHTML = `<p>Aucun mode de transport disponible pour la distance : ${distance.toFixed(2)} km</p>`;
            }
        } catch (error) {
            transportContainer.innerHTML = `<p>Erreur : ${error.message}</p>`;
        }
    }
    // Fonction pour trouver la gare la plus proche
async function trouverGareProche(adresse) {
    const gares = [
        { nom: "Gare de Bordeaux Saint-Jean", adresse: "Rue Charles Domercq, 33800 Bordeaux" },
        { nom: "Gare de Lyon Part-Dieu", adresse: "5 Place Charles Béraudier, 69003 Lyon" },
        { nom: "Gare de Paris Montparnasse", adresse: "17 Boulevard de Vaugirard, 75015 Paris" },
        { nom: "Gare de Marseille Saint-Charles", adresse: "Square Narvik, 13001 Marseille" },
    ];

    let gareProche = null;
    let distanceMin = Infinity;

    for (const gare of gares) {
        const { distance } = await calculerDistances(adresse, gare.adresse);
        if (distance < distanceMin) {
            distanceMin = distance;
            gareProche = gare;
        }
    }

    if (gareProche) {
        return { nom: gareProche.nom, adresse: gareProche.adresse };
    } else {
        throw new Error("Aucune gare trouvée à proximité.");
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
