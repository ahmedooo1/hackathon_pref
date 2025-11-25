<?php

declare(strict_types=1);

namespace App\Service;

use PDO;

class PostgreSqlService {

    public const BDD_NAME = 'hackathon_2025';
    public const BASE_TABLE = 'reconciliation_cstb_cerema'; //table où aller chercher les données réconciliées
    public const BASE_TABLE_PRIMARY_KEY = 'Code_bat_ter'; //clé primaire de la BASE_TABLE
    public const RNB_API_IDS_KEYS = 'cerema_cstb_rnb_ids'; //nom du champ dans BASE_TABLE où aller chercher les ids pour interroger l'api RNB
    private string $ipv4;
    private string $port;
    private string $user;
    private string $password;

    public function __construct (string $ipv4, string $port, string $user, string $password) {
        // variables d'environnement injectées par les fichiers de configuration à renseigner dans le fichier .env.local
        $this->ipv4 = $ipv4;
        $this->port = $port;
        $this->user = $user;
        $this->password = $password;
    }

    /** 
     * Création d'une connexion avec la base de données
     * Vérifier ques les extensions nécessaires de PHP soient activées dans le php.ini (ou Dockerfile)
     * 
     * @return PDO 
     */
    public function buildPdo(): PDO
    {
        $dsn = sprintf('pgsql:host=%s;port=%s;dbname=%s;', $this->ipv4, $this->port, self::BDD_NAME);
        return $pdo = new PDO($dsn, $this->user, $this->password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
    }

    /**
     * Exécute une requête SQL et retourne le résultat sous forme de tableau.
     *
     * @param PDO    $pdo         Connexion à la base de données, générée par la fonction buildPdo().
     * @param string $sql         Requête SQL à exécuter.
     * @param int    $fetchMethod Méthode de récupération des résultats (par défaut PDO::FETCH_ASSOC).
     *
     * @return array Résultats de la requête sous forme d'array.
     */
    public function executeQuery(PDO $pdo, string $sql, int $fetchMethod = PDO::FETCH_ASSOC): array
    {
        $stmt = $pdo->query($sql);
        return (array)$stmt->fetchAll($fetchMethod);
    }

    /** 
     * Récupère les données réconciliées
     *
     * @return array tableau des données réconciliées
     */
    public function getDataReconciliees(): array
    {
        $pdo = $this->buildPdo();
        return $this->executeQuery($pdo, sprintf('
            SELECT *
            FROM data_bat.%s
            LIMIT 10
        ', self::BASE_TABLE));
    }

    /**
     * Récupère tous les ids de l'api RNB à partir d'une adresse réconciliée.
     *
     * @param array $adresseReconciliee table d'adresse reconciliée de l'adresse voulue.
     *
     * @return array ids RNB sous forme d'array. Peut renvoyer un tableau vide si aucun id RNB correspondant
     */
    public function getRnbIds(array $adresseReconciliee): array
    {
        //transformation en json valide
        $rnbIdsRaw = $adresseReconciliee[self::RNB_API_IDS_KEYS];
        $rnbIdsJson = str_replace('\'', '"', $rnbIdsRaw);

        return json_decode($rnbIdsJson, true);
    }
}