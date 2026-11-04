-- Milkshakes : un visuel par recette (visuels d'illustration, signalés « Photo d'illustration »).
-- Données uniquement. Seules les lignes encore sur les anciens visuels du seed sont modifiées :
-- une image choisie ou importée depuis /admin/menu n'est jamais écrasée.
UPDATE "product_images" AS i
SET "src" = v."src", "alt" = v."alt"
FROM (VALUES
  ('dubai-shake', '/images/food/milkshake-pistache.webp', '/images/products/milkshake-dubai.webp', 'Dubai Shake : pistache, pâte à tartiner et chantilly dans son gobelet (visuel d’illustration)'),
  ('dubai-shake', '/images/food/dubai-shake.webp', '/images/products/milkshake-dubai.webp', 'Dubai Shake : pistache, pâte à tartiner et chantilly dans son gobelet (visuel d’illustration)'),
  ('milkshake-a-composer', '/images/food/milkshake-caramel.webp', '/images/products/milkshake-a-composer.webp', 'Milkshake à composer, ici au coulis caramel avec gaufrette au chocolat blanc (visuel d’illustration)'),
  ('milkshake-a-composer', '/images/food/milkshake-caramel-bueno.webp', '/images/products/milkshake-a-composer.webp', 'Milkshake à composer, ici au coulis caramel avec gaufrette au chocolat blanc (visuel d’illustration)')
) AS v("slug", "old", "src", "alt"), "products" AS p
WHERE p."slug" = v."slug"
  AND i."product_id" = p."id"
  AND i."src" = v."old";
--> statement-breakpoint
INSERT INTO "product_images" ("product_id", "src", "alt", "is_primary")
SELECT p."id", '/images/products/milkshake-bueno-bomb.webp', 'Bueno Bomb’ : gaufrettes au chocolat, pâte à tartiner et chantilly dans son gobelet (visuel d’illustration)', true
FROM "products" AS p
WHERE p."slug" = 'bueno-bomb'
  AND NOT EXISTS (SELECT 1 FROM "product_images" AS i WHERE i."product_id" = p."id");
--> statement-breakpoint
UPDATE "products" AS p
SET "needs_final_product_photo" = true
WHERE p."slug" IN ('dubai-shake', 'bueno-bomb')
  AND EXISTS (SELECT 1 FROM "product_images" AS i WHERE i."product_id" = p."id" AND i."src" LIKE '/images/products/milkshake-%');
