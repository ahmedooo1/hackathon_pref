<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Adresse;
use App\Entity\BatimentRnb;
use App\Entity\Point;
use Doctrine\ORM\EntityManagerInterface;
use InvalidArgumentException;
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
    private EntityManagerInterface $entityManager;

    public function __construct (string $ipv4, string $port, string $user, string $password, EntityManagerInterface $entityManager) {
        // variables d'environnement injectées par les fichiers de configuration à renseigner dans le fichier .env.local
        $this->ipv4 = $ipv4;
        $this->port = $port;
        $this->user = $user;
        $this->password = $password;

        $this->entityManager = $entityManager;
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
        //TODO: retirer LIMIT 10 pour récupérer toutes les adresses
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

    /**
     * Enregistre une adresse réconciliée et ses bâtiments RNB associés en base de données.
     * 
     * @param array $adresseData données récupérées depuis la bdd d'adresse reconciliée et l'api rnb.
     * 
     * @throws InvalidArgumentException si les données minimales nécessaires pour l'enregistrement sont manquantes.
     * 
     * @return Adresse l'entité Adresse enregistrée.
     */
    public function registerAdresse(array $adresseData): Adresse
    {
        $adresse = new Adresse();
        //vérification des données obligatoires
        if (
            !array_key_exists('Code_bat_ter', $adresseData) ||
            !array_key_exists('région', $adresseData) ||
            !array_key_exists('département', $adresseData) ||
            !array_key_exists('meilleure_adresse_score_levenshtein', $adresseData) || 
            !array_key_exists('fiabilite_adresse', $adresseData) ||
            !array_key_exists('Définition.du.cas', $adresseData) ||
            !array_key_exists('fiabilite_rnb_die_vs_cerema', $adresseData) ||
            !array_key_exists('fiabilite', $adresseData) ||
            !array_key_exists('cerema_cstb_rnb_ids', $adresseData) ||
            !array_key_exists('geom', $adresseData)
        ) {
            Throw new InvalidArgumentException('Données d\'adresse obligatoires manquantes pour l\'enregistrement.');
        }

        //insertion des données de l'adresse
        $adresse->setCodeBatTer((int)$adresseData['Code_bat_ter']);
        $adresse->setRegion($adresseData['région']);
        $adresse->setDepartement((int)$adresseData['département']);
        if (array_key_exists('die_adresse', $adresseData)) {
            $adresse->setDieAdresse($adresseData['DIE_adresse']);
        }
        if (array_key_exists('meilleure_adresse_rnb', $adresseData)) {
            $adresse->setMeilleureAdresseRnb($adresseData['meilleure_adresse_rnb']);
        }
        $adresse->setScoreLevenshtein((float)$adresseData['meilleure_adresse_score_levenshtein']);
        $adresse->setFiabiliteAdresse($adresseData['fiabilite_adresse']);
        if (array_key_exists('Cas_adresse', $adresseData)) {
            $adresse->setCasAdresse($adresseData['Cas_adresse']);
        }
        $adresse->setDefinitionCas($adresseData['Définition.du.cas']);
        $adresse->setFiabiliteRnbDieVsCerema($adresseData['fiabilite_rnb_die_vs_cerema']);
        $adresse->setFiabilite($adresseData['fiabilite']);
        if (array_key_exists('source', $adresseData)) {
            $adresse->setSource($adresseData['source']);
        }
        $adresse->setRnbIds($adresseData['cerema_cstb_rnb_ids']);
        $adresse->setGeometry($adresseData['geom']);

        //insertion des données des bâtiments
        if (array_key_exists('BatimentsRnb', $adresseData)) {
            foreach ($adresseData['BatimentsRnb'] as $batimentRnbData) {
                $batimentRnb = new BatimentRnb();
                //vérification des données
                if (
                    !array_key_exists('rnb_id', $batimentRnbData) ||
                    !array_key_exists('status', $batimentRnbData) ||
                    !array_key_exists('is_active', $batimentRnbData) ||
                    !array_key_exists('point', $batimentRnbData) ||
                    !array_key_exists('shape', $batimentRnbData) ||
                    !array_key_exists('adresses', $batimentRnbData)
                ) {
                    continue;
                }

                $batimentRnb->setRnbId((int)$batimentRnbData['rnb_id']);
                $batimentRnb->setStatus($batimentRnbData['status']);
                $batimentRnb->setActive((bool)$batimentRnbData['is_active']);
                $point = new Point();
                $point->setLongitude((float)$batimentRnbData['point']['coordinates'][0]);
                $point->setLatitude((float)$batimentRnbData['point']['coordinates'][1]);
                $batimentRnb->setPoint($point);
                foreach ($batimentRnbData['shape']['coordinates'][0] as $polygonePointData) {
                    $polygonePoint = new Point();
                    $polygonePoint->setLongitude((float)$polygonePointData[0]);
                    $polygonePoint->setLatitude((float)$polygonePointData[1]);
                    $batimentRnb->addPolygonePoint($polygonePoint);
                }
                foreach ($batimentRnbData['adresses'] as $adresseRnb) {
                    $adressesClesInterop[] = $adresseRnb['id'];
                }

                $adresse->addBatimentRnb($batimentRnb);
            }
            $this->entityManager->persist($adresse);
            $this->entityManager->flush();
        }

        return $adresse;
    }
}