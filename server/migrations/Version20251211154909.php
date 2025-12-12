<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251211154909 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'fix propriétés nullable dans Adresse';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE adresse ALTER cas_adresse DROP NOT NULL');
        $this->addSql('ALTER TABLE adresse ALTER source DROP NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE adresse ALTER cas_adresse SET NOT NULL');
        $this->addSql('ALTER TABLE adresse ALTER source SET NOT NULL');
    }
}
