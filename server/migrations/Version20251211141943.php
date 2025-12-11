<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251211141943 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'fix typo rnb_id';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX uniq_11917487fc6eb833');
        $this->addSql('ALTER TABLE batiment_rnb RENAME COLUMN rnd_id TO rnb_id');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_11917487D905E7EF ON batiment_rnb (rnb_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_11917487D905E7EF');
        $this->addSql('ALTER TABLE batiment_rnb RENAME COLUMN rnb_id TO rnd_id');
        $this->addSql('CREATE UNIQUE INDEX uniq_11917487fc6eb833 ON batiment_rnb (rnd_id)');
    }
}
