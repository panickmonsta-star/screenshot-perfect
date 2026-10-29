/**
 * Poster artwork module. Each poster is original generated artwork owned by
 * this project; importing through this module keeps a single place to swap
 * posters for Supabase Storage URLs in Milestone 2.
 */
import cintaDiBalikKaca from "@/assets/posters/cinta-di-balik-kaca.jpg";
import jakartaMidnight from "@/assets/posters/jakarta-midnight.jpg";
import penjagaHutanKabut from "@/assets/posters/penjaga-hutan-kabut.jpg";
import kopiPahitCintaManis from "@/assets/posters/kopi-pahit-cinta-manis.jpg";
import rahasiaVillaSenja from "@/assets/posters/rahasia-villa-senja.jpg";
import pewarisBandung from "@/assets/posters/pewaris-bandung.jpg";
import suaraDariBawahLaut from "@/assets/posters/suara-dari-bawah-laut.jpg";
import detektifKelasMalam from "@/assets/posters/detektif-kelas-malam.jpg";

export const posters = {
  cintaDiBalikKaca,
  jakartaMidnight,
  penjagaHutanKabut,
  kopiPahitCintaManis,
  rahasiaVillaSenja,
  pewarisBandung,
  suaraDariBawahLaut,
  detektifKelasMalam,
} as const;
