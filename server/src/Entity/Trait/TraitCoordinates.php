<?php

declare(strict_types=1);

namespace App\Entity\Trait;

use Doctrine\ORM\Mapping as ORM;

trait TraitCoordinates
{
    #[ORM\Column(type: 'float', options: ['unsigned' => true])]
    private float $longitude;

    #[ORM\Column(type: 'float', options: ['unsigned' => true])]
    private float $latitude;

    public function setLongitude(float $longitude): void
    {
        $this->longitude = $longitude;
    }

    public function getLongitude(): float
    {
        return $this->longitude;
    }

    public function setLatitude(float $latitude): void
    {
        $this->latitude = $latitude;
    }

    public function getLatitude(): float
    {
        return $this->latitude;
    }
}