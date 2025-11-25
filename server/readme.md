# 📦 Back end application RNB hackathon
*Back-end de l'application de consultation, vérification et modification des données des bâtimensts RNB réalisée durant le hackathon du 24 et 25 novemvre 2025*

---

## 🚀 Fonctionnalités
- Récupérer les adreeses réconciliées depuis une base de données sur le serveur VPS DDTM76 
- Lister les identifiants RNB liés à ces adresses  
- Récupérer les données de l'api RNB pour lier les données des bâtiments RNB à leurs adresses
- Route d'export des donées json (/data)

---

## 📚 Prérequis
- PHP ≥ 8.2
- Extensions PHP : curl, fileinfo, intl, mbstring, openssl, pgsql, pdopgsql
- Composer  
- Symfony CLI  (optionnel mais fortement conseillé)
- PostgreSQL 
- Créer un fichier .env.local dans server et y renseigner les 4 paramètres "connexion vps" du .env

---

## 🛠 Mode d'emploi
- Modifier le paramètre SQL LIMIT dans la fonction getDataReconciliees() de la classe Src/Service/PostgreSqlService pour indiquer combien d'adresses récupérer (attention aux limites d'appel par seconde de l'api RNB en conséquence)
- Appeler la route /data pour récupérer les données en JSON

---

## 🧪 Evolutions à apporter
- Utiliser l'export json des adresses sur front-ned situé sur le même repository (via appel AJAX probablement)
- Enregistrer les données dans une base de données pour éviter de rappeler l'api RNB à chaque fois
- script de mise à jour de toutes les adresses avec fractionnement (toutes les 10 adresses par exemple) pour mettre à jour toutes les informations en base de données sans dépasser la limite d'appels par seconde à l'api RNB
- CRUB des bâtiments RNB avec lien vers le front-end
- appels à l'api RNB à l'issue de CRUD pour modifier les informations des bâtiments RNB sur l'api

---