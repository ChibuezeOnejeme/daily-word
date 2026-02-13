alter table "public"."notes" add column "title" text;
alter table "public"."notes" add column "updated_at" timestamp with time zone default now();
alter table "public"."notes" add column "tags" text[];
alter table "public"."notes" alter column "book" drop not null;
alter table "public"."notes" alter column "chapter" drop not null;
