<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\BatimentRnb;
use App\Entity\Trait\TraitCoordinates;
use App\Entity\Trait\TraitId;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Point
{
    use TraitId;
    use TraitCoordinates;

    #[ORM\ManyToOne(targetEntity: BatimentRnb::class, inversedBy: 'polygone')]
    private ?BatimentRnb $polygone = null;

    public function getBatimentRNBPolygone(): ?BatimentRnb
    {
        return $this->polygone;
    }

    public function setBatimentRNBPolygone(?BatimentRnb $polygone): void
    {
        $this->polygone = $polygone;
    }

    public function getType(): string
    {
        return $this->polygone ? 'MultiPolygon' : 'Point';
    }
}