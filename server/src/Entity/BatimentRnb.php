<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Adresse;
use App\Entity\Point;
use App\Entity\Trait\TraitId;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class BatimentRnb
{
    use TraitId;

    #[ORM\Column(type: 'integer', unique: true, options: ['unsigned' => true])]
    private int $rndId;

    #[ORM\Column(type: 'string', length: 255)]
    private string $status;

    #[ORM\Column(type: 'boolean')]
    private bool $active;

    #[ORM\ManyToOne(targetEntity: Point::class, cascade: ['persist'])]
    private Point $point;

    #[ORM\OneToMany(targetEntity: Point::class, mappedBy: 'polygone', cascade: ['persist'])]
    private Collection $polygone;

    #[ORM\Column(type: 'json')]
    private array $adressesClesInterop = [];

    #[ORM\ManyToOne(targetEntity: Adresse::class, inversedBy: 'batimentsRnb')]
    private Adresse $adresse;

    public function getRndId(): int
    {
        return $this->rndId;
    }

    public function setRndId(int $rndId): void
    {
        $this->rndId = $rndId;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): void
    {
        $this->status = $status;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function setActive(bool $active): void
    {
        $this->active = $active;
    }

    public function getPoint(): Point
    {
        return $this->point;
    }

    public function setPoint(Point $point): void
    {
        $this->point = $point;
    }

    /**
     * @return Collection|Point[]
     */
    public function getPolygone(): Collection
    {
        return $this->polygone;
    }

    public function setPolygone(Collection $polygone): void
    {
        $this->polygone = $polygone;
    }

    public function addPolygonePoint(Point $point): void
    {
        if (!$this->polygone->contains($point)) {
            $this->polygone->add($point);
        }
    }

    public function removePolygonePoint(Point $point): void
    {
        $this->polygone->removeElement($point);
    }

    public function getAdressesClesInterop(): array
    {
        return $this->adressesClesInterop;
    }

    public function setAdressesClesInterop(array $adressesClesInterop): void
    {
        $this->adressesClesInterop = $adressesClesInterop;
    }

    public function getAdresse(): Adresse
    {
        return $this->adresse;
    }

    public function setAdresse(Adresse $adresse): void
    {
        $this->adresse = $adresse;
    }
}