export function ajoutListenersAvis() {

  const piecesElements = document.querySelectorAll(".fiches article button");

  for (let i = 0; i < piecesElements.length; i++) {
    
    piecesElements[i].addEventListener("click", async function (event) {
    
      const id = event.target.dataset.id;
      const reponse = await fetch(`http://localhost:8081/pieces/${id}/avis`);
      const avis = await reponse.json()
      console.log("avis",avis)
      window.localStorage.setItem(`avis-pieces-${id}`, JSON.stringify(avis))
      const pieceElement = event.target.parentElement;
      
      // fonction bonus permettant d'afficher/masquer les avis
      let avisElement = pieceElement.querySelector(".avis"); // Récupérer l'élément s'il existe

      if (piecesElements[i].innerText === "Afficher les avis") {
        piecesElements[i].innerText = "Fermer les avis";

        if (!avisElement) {
          afficherAvis(pieceElement,avis)
        }

      } else {
        piecesElements[i].innerText = "Afficher les avis";
        if (avisElement) {
          avisElement.remove(); // Supprimer l'élément s'il existe
        }
      }
    });
  }
}

export function afficherAvis(pieceElement, avis){
  let avisElement = document.createElement("p");
  avisElement.classList.add("avis");
  for (let i = 0; i < avis.length; i++) {
    avisElement.innerHTML += `${avis[i].utilisateur}: ${avis[i].commentaire} <br>`;
  }
  pieceElement.appendChild(avisElement);
};


export function ajoutListenerEnvoyerAvis() {
  const formulaireAvis = document.querySelector(".formulaire-avis");
  formulaireAvis.addEventListener("submit", function (event) {
    // Désactivation du comportement par défaut du navigateur
    event.preventDefault();

    // Création de l’objet du nouvel avis.
    const avis = {
      pieceId: parseInt(event.target.querySelector("[name=piece-id]").value),
      utilisateur: event.target.querySelector("[name=utilisateur").value,
      commentaire: event.target.querySelector("[name=commentaire]").value,
      nbEtoiles: event.target.querySelector("[name=nbEtoiles]").value
    };

    // Création de la charge utile au format JSON
    const chargeUtile = JSON.stringify(avis);

    // Appel de la fonction fetch avec toutes les informations nécessaires
    fetch("http://localhost:8081/avis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: chargeUtile
    });
  });
}