<?php

declare(strict_types=1);

namespace App\Controller\Data;

use App\Service\PostgreSqlService;
use App\Service\RnbApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/data/import', name: 'data_import_')]
final class ImportController extends AbstractController
{

    #[Route('', name: 'load', methods: ['GET', 'POST'])]
    public function load(PostgreSqlService $postgreSqlService, RnbApiService $rnbApiService): Response
    {
        $datasReconciliees = $postgreSqlService->getDataReconciliees();

        foreach ($datasReconciliees as $adresseReconcilieeKey => $adresseReconciliee) {
            // conversion des ids RNB pour les rendre exploitables et récupération des données RNB
            if (array_key_exists(PostgreSqlService::RNB_API_IDS_KEYS, $adresseReconciliee)) {
                $ids = $postgreSqlService->getRnbIds($adresseReconciliee);
                $datasReconciliees[$adresseReconcilieeKey][PostgreSqlService::RNB_API_IDS_KEYS] = $ids;

                foreach ($ids as $rnbId) {
                    $datasReconciliees[$adresseReconcilieeKey]['batimentsRnb'][$rnbId] = $rnbApiService->getRnbData($rnbId);
                }
            }

            //enregistrement en base de données
            $adresseEntity = $postgreSqlService->registerAdresse($datasReconciliees[$adresseReconcilieeKey]);
        }

        //return $this->json($datasReconciliees);
        return $this->render('data/index.html.twig', [
            'controller_name' => 'DataController',
        ]);

        //changer de return pour visualiser le dump des données
    }
}