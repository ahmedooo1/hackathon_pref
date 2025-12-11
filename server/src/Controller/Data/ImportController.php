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
        dump($datasReconciliees);

        foreach ($datasReconciliees as $adresseReconcilieeKey => $adresseReconciliee) {
            // conversion des ibs RNB pour les rendre exploitables
            if (array_key_exists(PostgreSqlService::RNB_API_IDS_KEYS, $adresseReconciliee)) {
                $datasReconciliees[$adresseReconcilieeKey][PostgreSqlService::RNB_API_IDS_KEYS] = $postgreSqlService->getRnbIds($adresseReconciliee);
            };
        }

        foreach ($datasReconciliees as $adresseReconcilieeKey => $adresseReconciliee) {
            if (array_key_exists(PostgreSqlService::RNB_API_IDS_KEYS, $adresseReconciliee)) {
                foreach ($adresseReconciliee[PostgreSqlService::RNB_API_IDS_KEYS] as $rnbId) {
                    $datasReconciliees[$adresseReconcilieeKey]['BatimentsRnb'][$rnbId] = $rnbApiService->getRnbData($rnbId);
                }
            };
        }

        dump($datasReconciliees);
        //return $this->json($datasReconciliees);
        return $this->render('data/index.html.twig', [
            'controller_name' => 'DataController',
        ]);

        //changer de return pour visualiser le dump des données
    }
}