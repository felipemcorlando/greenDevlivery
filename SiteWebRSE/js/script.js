document.addEventListener("DOMContentLoaded", function () {
    const API_KEY = "VOTRE_CLE_API_GOOGLE_MAPS"; // Remplacez par votre clé API Google Maps.

    // Adresses des centres de départ
    const centres = {
        centre1: "34 Rue du Colonel Delorme, 93100 Montreuil",
        centre2: "4 Rue Paul Montrochet, 69002 Lyon",
    };

    // Modes de transport avec empreintes carbone (gCO2/km) et vitesses moyennes (km/h)
    const modes = [
        { type: "Camionnette", carbone: 200, vitesse: 50 },
        { type: "Moto", carbone: 100, vitesse: 60 },
        { type: "Vélo", carbone: 20, vitesse: 20 },
        { type: "Robot autonome", carbone: 30, vitesse: 15 },
        { type: "Piéton", carbone: 5, vitesse: 5 },
        { type: "Drone", carbone: 50, vitesse: 70 },
    ];

    const transportContainer = document.getElementById("modes-transport");
    const form = document.getElementById("livraison-form");

    async function calculerDistances(adresseClient, centreDepart) {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
            centreDepart
        )}&destinations=${encodeURIComponent(adresseClient)}&key=${API_KEY}&units=metric`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
            const distance = data.rows[0].elements[0].distance.value / 1000; // Convertir en km
            const duree = data.rows[0].elements[0].duration.value / 3600; // Convertir en heures
            return { distance, duree };
        } else {
            throw new Error("Erreur lors du calcul de la distance.");
        }
    }

    async function afficherModesTransport() {
        transportContainer.innerHTML = "<p>Calcul en cours...</p>";

        const adresseClient = document.getElementById("adresse").value;
        const centreDepart = centres[document.getElementById("depart").value];

        try {
            const { distance, duree } = await calculerDistances(adresseClient, centreDepart);

            transportContainer.innerHTML = ""; // Réinitialiser
            modes.forEach((mode) => {
                const temps = (distance / mode.vitesse).toFixed(2); // Temps en heures
                const carbone = (mode.carbone * distance).toFixed(2); // Empreinte carbone en gCO2
                const element = document.createElement("div");
                element.className = "mode-transport";
                element.innerHTML = `
                    <label>
                        <input type="radio" name="transport" value="${mode.type}">
                        <strong>${mode.type}</strong><br>
                        Distance : <span>${distance.toFixed(2)}</span> km<br>
                        Empreinte carbone : <span>${carbone}</span> gCO₂<br>
                        Temps estimé : <span>${temps}</span> heures
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
});
