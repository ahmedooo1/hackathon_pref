<?php

declare(strict_types=1);

namespace App\Entity\Trait;

use DateTime;
use Doctrine\ORM\Mapping as ORM;

trait TraitCreatedAt
{
    #[ORM\Column(type: 'datetime')]
    private DateTime $createdAt;

    #[ORM\PrePersist]
    public function setCreatedAt(): void
    {
        if (!isset($this->createdAt)) {
            $this->createdAt = new DateTime();
        }
    }

    public function getCreatedAt(): DateTime
    {
        return $this->createdAt;
    }
}