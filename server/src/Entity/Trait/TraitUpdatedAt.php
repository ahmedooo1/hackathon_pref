<?php

declare(strict_types=1);

namespace App\Entity\Trait;

use DateTime;
use Doctrine\ORM\Mapping as ORM;

trait TraitUpdatedAt
{
    #[ORM\Column(type: 'datetime')]
    private DateTime $updatedAt;

    #[ORM\PrePersist]
    #[ORM\PreUpdate]
    public function setUpdatedat(): void
    {
        if (!isset($this->updatedAt)) {
            $this->updatedAt = new DateTime();
        }
    }

    public function getUpdatedat(): DateTime
    {
        return $this->updatedAt;
    }
}