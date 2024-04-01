export function ajoutListenersAvis() {
  const piecesElements = document.querySelectorAll(".fiches article button");

  for (let i = 0; i < piecesElements.length; i++) {
      piecesElements[i].addEventListener("click", async function (event) {
          const id = event.target.dataset.id;
          const pieceElement = event.target.parentElement;
          
          if (piecesElements[i].innerText === "Afficher les avis") {
              let avisJSON = window.localStorage.getItem(`avis-piece-${id}`);
              if (!avisJSON) {
                  const reponse = await fetch("http://localhost:8081/pieces/" + id + "/avis");
                  const avis = await reponse.json();
                  window.localStorage.setItem(`avis-piece-${id}`, JSON.stringify(avis));
                  avisJSON = JSON.stringify(avis);
              }

              const avis = JSON.parse(avisJSON);
              
              if (avis) {
                  afficherAvis(pieceElement, avis);
                  piecesElements[i].innerText = "Fermer les avis";
              }
          } else {
              supprimerAvis(pieceElement); // Appel de la fonction pour supprimer l'avis
              piecesElements[i].innerText = "Afficher les avis";
          }
      });
  }
}


export function afficherAvis(pieceElement, avis) {
  const avisElement = document.createElement("p");
  avisElement.classList.add("avis"); // Ajoute une classe pour identifier les éléments d'avis
  for (let i = 0; i < avis.length; i++) {
      avisElement.innerHTML += `<b>${avis[i].utilisateur}:</b> ${avis[i].commentaire} <br>`;
  }
  pieceElement.appendChild(avisElement);
}

// Ajoute une nouvelle fonction pour supprimer l'élément d'avis
function supprimerAvis(pieceElement) {
  const avisElement = pieceElement.querySelector(".avis");
  if (avisElement) {
      avisElement.remove();
  }
}

export function ajoutListenerEnvoyerAvis() {
  const formulaireAvis = document.querySelector(".formulaire-avis");
  formulaireAvis.addEventListener("submit", function (event) {
      event.preventDefault();
      // Création de l’objet du nouvel avis.
      const avis = {
          pieceId: parseInt(event.target.querySelector("[name=piece-id]").value),
          utilisateur: event.target.querySelector("[name=utilisateur]").value,
          commentaire: event.target.querySelector("[name=commentaire]").value,
          nbEtoiles: parseInt(event.target.querySelector("[name=nbEtoiles]").value)
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

export async function afficherGraphiqueAvis() {
  // Calcul du nombre total de commentaires par quantité d'étoiles attribuées
  const avis = await fetch("http://localhost:8081/avis").then(avis => avis.json());
  const nb_commentaires = [0, 0, 0, 0, 0];

  for (let commentaire of avis) {
      nb_commentaires[commentaire.nbEtoiles - 1]++;
  }
  // Légende qui s'affichera sur la gauche à côté de la barre horizontale
  const labels = ["5", "4", "3", "2", "1"];
  // Données et personnalisation du graphique
  const data = {
      labels: labels,
      datasets: [{
          label: "Étoiles attribuées",
          data: nb_commentaires.reverse(),
          backgroundColor: "rgba(255, 230, 0, 1)", // couleur jaune
      }],
  };
  // Objet de configuration final
  const config = {
      type: "bar",
      data: data,
      options: {
          indexAxis: "y",
      },
  };
  // Rendu du graphique dans l'élément canvas
  const graphiqueAvis = new Chart(
      document.querySelector("#graphique-avis"),
      config,
  );

  // Récupération des pièces depuis le localStorage
  const piecesJSON = window.localStorage.getItem("pieces");

  // Vérification si piecesJSON est une chaîne JSON valide
  if (!piecesJSON) {
      console.error("Aucune donnée trouvée dans localStorage sous la clé 'pieces'.");
      return;
  }

  let pieces;

  try {
      pieces = JSON.parse(piecesJSON);
  } catch (error) {
      console.error("Erreur lors de la conversion de la chaîne JSON en objet JavaScript :", error);
      return;
  }

  // Vérification si pieces est bien un tableau
  if (!Array.isArray(pieces)) {
      console.error("Le contenu de localStorage 'pieces' n'est pas un tableau.");
      return;
  }


  // Calcul du nombre de commentaires
  let nbCommentairesDispo = 0;
  let nbCommentairesNonDispo = 0;

  for (let i = 0; i < avis.length; i++) {
    const piece = pieces.find(p => p.id === avis[i].pieceId);

    if (piece) {
        if (piece.disponibilite) {
            nbCommentairesDispo++;
        } else {
            nbCommentairesNonDispo++;
        }
    }
  }

  // Légende qui s'affichera sur la gauche à côté de la barre horizontale
  const labelsDispo = ["Dispo", "Non dispo"];
  // Données et personnalisation du graphique
  const dataDispo = {
    labels: labelsDispo,
    datasets: [{
        label: "Nb. de commentaires",
        data: [nbCommentairesDispo,nbCommentairesNonDispo],
        backgroundColor:"rgba(0,230,0,1)",
    }],
  };
  // Objet de configuration final
    const configDispo = {
      type: "bar",
      data: dataDispo,
  };
  // Rendu du graphique dans l'élément canvas
  const graphiqueDispo = new Chart(
      document.querySelector("#graphique-disponibilite"),
      configDispo,
  );



}
