<?php

declare(strict_types=1);

namespace App\Service;

use Throwable;
use LogicException;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Component\HttpFoundation\Request;

class RnbApiService
{
    private HttpClientInterface $rnbApiClient;

    public function __construct(HttpClientInterface $rnbApiClient) {
        $this->rnbApiClient = $rnbApiClient;
    }

    /**
     * Récupère les données des bâtiments RNB à partir de son ID.
     *
     * @param array $rnbId ID RNB.
     *
     * @return array toutes les informations des bâtiments RNB
     */
    public function getRnbData(string $rnbId): array
    {
        $endPoint = sprintf('/api/alpha/buildings/%s/', $rnbId);
        
        $response = $this->rnbApiClient->request(Request::METHOD_GET, $endPoint);

        return $response->toArray();
    }
}