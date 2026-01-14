<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class DataController extends AbstractController
{
    private string $dataPath;

    public function __construct(#[Autowire('%kernel.project_dir%')] string $projectDir)
    {
        $this->dataPath = dirname($projectDir) . '/client/src/data.json';
    }

    #[Route('/api/items', name: 'app_api_items', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $items = $this->readDataFile();

        return $this->json($items, 200, $this->corsHeaders());
    }

    #[Route('/api/items', name: 'app_api_items_options', methods: ['OPTIONS'])]
    public function options(): JsonResponse
    {
        return new JsonResponse(null, 204, $this->corsHeaders());
    }

    #[Route('/api/items/{id}', name: 'app_api_items_update', methods: ['PATCH'])]
    public function update(string $id, Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        if (!
            is_array($payload)
        ) {
            return $this->json(['message' => 'Payload invalide'], 400);
        }

        $items = $this->readDataFile();
        $updated = false;

        foreach ($items as &$item) {
            if ((string) $item['Code_bat_ter'] === (string) $id) {
                if (isset($payload['name'])) {
                    $item['Libelle_bat_ter'] = $payload['name'];
                }
                if (isset($payload['address'])) {
                    $item['Adresse'] = $payload['address'];
                    $item['die_adresse'] = $payload['address'];
                }
                if (isset($payload['surface'])) {
                    $item['Surface_de_plancher'] = is_numeric($payload['surface']) ? (float) $payload['surface'] : $payload['surface'];
                }
                if (isset($payload['usage'])) {
                    $item['Usage_detaille_du_bien'] = $payload['usage'];
                }
                if (isset($payload['gestionnaire'])) {
                    $item['Gestionnaire'] = $payload['gestionnaire'];
                }
                if (array_key_exists('rnbIds', $payload)) {
                    $rnbIds = $payload['rnbIds'];
                    $validRnbIds = is_array($rnbIds) ? array_values($rnbIds) : [];
                    $item['contre_proposition_rnb_ids'] = json_encode($validRnbIds, JSON_UNESCAPED_UNICODE);
                }

                $item['last_update_source'] = 'DetailPanel editable-form';
                $item['last_update_date'] = (new \DateTime())->format('Y-m-d');

                $updated = true;
                break;
            }
        }
        unset($item);

        if (!$updated) {
            return $this->json(['message' => 'Element introuvable'], 404);
        }

        $this->saveDataFile($items);

        return $this->json($payload, 200, $this->corsHeaders());
    }

    private function readDataFile(): array
    {
        $content = file_get_contents($this->dataPath);
        if (false === $content) {
            throw new \RuntimeException('Impossible de lire le fichier data.json');
        }

        return json_decode($content, true, 512, JSON_THROW_ON_ERROR);
    }

    private function saveDataFile(array $items): void
    {
        $encoded = json_encode($items, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        if (false === $encoded) {
            throw new \RuntimeException('Impossible de sérialiser les données.');
        }

        file_put_contents($this->dataPath, $encoded);
    }

    private function corsHeaders(): array
    {
        return [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET,PATCH,OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type',
        ];
    }
}