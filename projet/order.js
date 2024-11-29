import { todayDeal } from "./todayDeal.js";

// Récupérer l'ID du produit depuis l'URL
const params = new URLSearchParams(window.location.search);
const productId = parseInt(params.get("id"));

// Trouver le produit correspondant
const product = todayDeal.find(item => item.id === productId);

if (product) {
    // Insérer les détails du produit dans l'HTML
    const productDetailsEl = document.getElementById("product-details");
    productDetailsEl.innerHTML = `
        <div class="col-md-4">
            <img src="${product.img}" alt="${product.desc}" class="img-fluid">
        </div>
        <div class="col-md-8">
            <h2>${product.desc}</h2>
            <p>Réduction : ${product.discount}%</p>
            <button class="btn btn-success">Commander maintenant</button>
        </div>
    `;
}

// Gérer les options de livraison
document.getElementById("check-delivery").addEventListener("click", () => {
    const postalCode = document.getElementById("postal-code").value;
    const deliveryResultEl = document.getElementById("delivery-result");

    if (postalCode) {
        // Simulation d'une estimation de livraison
        deliveryResultEl.innerHTML = `
            <p>Livraison possible à ${postalCode}.</p>
            <p>Estimation : 2-3 jours ouvrables.</p>
        `;
    } else {
        deliveryResultEl.innerHTML = `<p>Veuillez entrer un code postal valide.</p>`;
    }
});
