<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\BatimentRnb;
use App\Entity\Trait\TraitCreatedAt;
use App\Entity\Trait\TraitId;
use App\Entity\Trait\TraitUpdatedAt;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Adresse
{
    use TraitId;
    use TraitCreatedAt;
    use TraitUpdatedAt;

    #[ORM\Column(type: 'integer', unique: true, options: ['unsigned' => true])]
    private int $codeBatTer;

    #[ORM\Column(type: 'string', length: 255)]
    private string $region;

    #[ORM\Column(type: 'integer', options: ['unsigned' => true])]
    private int $departement;

    #[ORM\Column(type: 'string', length: 1020, nullable: true)]
    private ?string $dieAdresse = null;

    #[ORM\Column(type: 'string', length: 1020, nullable: true)]
    private ?string $meilleureAdresseRnb = null;

    #[ORM\Column(type: 'float', options: ['unsigned' => true])]
    private float $scoreLevenshtein;

    #[ORM\Column(type: 'string', length: 255)]
    private string $fiabiliteAdresse;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $casAdresse = null;

    #[ORM\Column(type: 'string', length: 255)]
    private string $definitionCas;

    #[ORM\Column(type: 'string', length: 255)]
    private string $fiabiliteRnbDieVsCerema;

    #[ORM\Column(type: 'string', length: 255)]
    private string $fiabilite;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $source = null;

    #[ORM\Column(type: 'json')]
    public array $rnbIds = [];

    #[ORM\Column(type: 'string', length: 5100)]
    private string $geometry;

    #[ORM\OneToMany(mappedBy: 'adresse', targetEntity: BatimentRnb::class, cascade: ['persist'])]
    private Collection $batimentsRnb;

    public function __construct()
    {
        $this->batimentsRnb = new ArrayCollection();
    }
    public function getCodeBatTer(): int
    {
        return $this->codeBatTer;
    }

    public function setCodeBatTer(int $codeBatTer): void
    {
        $this->codeBatTer = $codeBatTer;
    }

    public function getRegion(): string
    {
        return $this->region;
    }

    public function setRegion(string $region): void
    {
        $this->region = $region;
    }

    public function getDepartement(): int
    {
        return $this->departement;
    }

    public function setDepartement(int $departement): void
    {
        $this->departement = $departement;
    }

    public function getDieAdresse(): ?string
    {
        return $this->dieAdresse;
    }

    public function setDieAdresse(?string $dieAdresse): void
    {
        $this->dieAdresse = $dieAdresse;
    }

    public function getMeilleureAdresseRnb(): ?string
    {
        return $this->meilleureAdresseRnb;
    }

    public function setMeilleureAdresseRnb(?string $meilleureAdresseRnb): void
    {
        $this->meilleureAdresseRnb = $meilleureAdresseRnb;
    }

    public function getScoreLevenshtein(): float
    {
        return $this->scoreLevenshtein;
    }

    public function setScoreLevenshtein(float $scoreLevenshtein): void
    {
        $this->scoreLevenshtein = $scoreLevenshtein;
    }

    public function getFiabiliteAdresse(): string
    {
        return $this->fiabiliteAdresse;
    }

    public function setFiabiliteAdresse(string $fiabiliteAdresse): void
    {
        $this->fiabiliteAdresse = $fiabiliteAdresse;
    }

    public function getCasAdresse(): ?string
    {
        return $this->casAdresse;
    }

    public function setCasAdresse(?string $casAdresse): void
    {
        $this->casAdresse = $casAdresse;
    }

    public function getDefinitionCas(): string
    {
        return $this->definitionCas;
    }

    public function setDefinitionCas(string $definitionCas): void
    {
        $this->definitionCas = $definitionCas;
    }

    public function getFiabiliteRnbDieVsCerema(): string
    {
        return $this->fiabiliteRnbDieVsCerema;
    }

    public function setFiabiliteRnbDieVsCerema(string $fiabiliteRnbDieVsCerema): void
    {
        $this->fiabiliteRnbDieVsCerema = $fiabiliteRnbDieVsCerema;
    }

    public function getFiabilite(): string
    {
        return $this->fiabilite;
    }

    public function setFiabilite(string $fiabilite): void
    {
        $this->fiabilite = $fiabilite;
    }

    /** @returns array<string> */
    public function getRnbIds(): array
    {
        return $this->rnbIds;
    }

    /** @param array<string> $rnbIds */
    public function setRnbIds(array $rnbIds): void
    {
        $this->rnbIds = $rnbIds;
    }

    public function getSource(): ?string
    {
        return $this->source;
    }

    public function setSource(?string $source): void
    {
        $this->source = $source;
    }

    public function getGeometry(): string
    {
        return $this->geometry;
    }

    public function setGeometry(string $geometry): void
    {
        $this->geometry = $geometry;
    }

    /**
     * @return Collection|BatimentRnb[]
     */
    public function getBatimentsRnb(): Collection
    {
        return $this->batimentsRnb;
    }

    public function setBatimentsRnb(ArrayCollection $batimentsRnb): void
    {
        $this->batimentsRnb = $batimentsRnb;
    }

    public function addBatimentRnb(BatimentRnb $batiment): void
    {
        if (!$this->batimentsRnb->contains($batiment)) {
            $this->batimentsRnb->add($batiment);
        }
    }

    public function removeBatimentRnb(BatimentRnb $batiment): void
    {
        $this->batimentsRnb->removeElement($batiment);
    }
    
}