<?php

namespace App\Controller;

use App\Service\PostgreSqlService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/data', name: 'data')]
final class DataController extends AbstractController
{
    #[Route('', name: '', methods: ['GET', 'POST'])]
    public function index(PostgreSqlService $postgreSqlService): Response
    {
        $datasReconciliees = $postgreSqlService->getDataReconciliees();

        foreach ($datasReconciliees as $adresseReconcilieeKey => $adresseReconciliee) {
            if (array_key_exists(PostgreSqlService::RNB_API_IDS_KEYS, $adresseReconciliee)) {
                $datasReconciliees[$adresseReconcilieeKey][PostgreSqlService::RNB_API_IDS_KEYS] = $postgreSqlService->getRnbIds($adresseReconciliee);
            };
        }

        dump($datasReconciliees);
        return $this->render('data/index.html.twig', [
            'controller_name' => 'DataController',
        ]);
    }
}
