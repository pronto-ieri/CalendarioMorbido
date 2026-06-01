-- ============================================================================
-- CalendarioMorbido — dati di esempio (eventi approvati)
-- Esegui DOPO 0001_init.sql. Eseguito come owner, bypassa la RLS.
-- ============================================================================

insert into public.events
  (title, description, start_date, end_date, region, official_url,
   start_location_name, start_lat, start_lng,
   end_location_name, end_lat, end_lng)
values
  ('Granfondo del Chianti', 'Pedalata cicloturistica tra le colline e i vigneti del Chianti, adatta a tutti.',
   '2026-09-12', '2026-09-13', 'Toscana', 'https://example.com/chianti',
   'Firenze', 43.769600, 11.255800, 'Siena', 43.318600, 11.330700),

  ('Lungo il Po in bici', 'Itinerario lento e pianeggiante lungo il fiume Po, tra argini e borghi.',
   '2026-07-05', '2026-07-05', 'Emilia-Romagna', 'https://example.com/po',
   'Piacenza', 45.052500, 9.692900, null, null, null),

  ('Dolomiti Soft Tour', 'Tre giorni tra i passi dolomitici a ritmo turistico, soste panoramiche incluse.',
   '2026-08-21', '2026-08-23', 'Trentino-Alto Adige', 'https://example.com/dolomiti',
   'Bolzano', 46.498300, 11.354700, 'Cortina d''Ampezzo', 46.536600, 12.135700),

  ('Pedalata delle Langhe', 'Giro tra le colline patrimonio UNESCO, con tappa enogastronomica.',
   '2026-10-04', '2026-10-04', 'Piemonte', 'https://example.com/langhe',
   'Alba', 44.700000, 8.035600, 'Barolo', 44.610900, 7.943600),

  ('Riviera Ligure Slow', 'Lungo la costa tra mare e ulivi, percorso facile e panoramico.',
   '2026-06-14', '2026-06-14', 'Liguria', 'https://example.com/riviera',
   'Sanremo', 43.815400, 7.776300, 'Imperia', 43.886000, 8.027300),

  ('Anello del Lago di Garda', 'Giro cicloturistico attorno al lago, con vista sulle Prealpi.',
   '2026-05-30', '2026-05-31', 'Veneto', 'https://example.com/garda',
   'Peschiera del Garda', 45.439900, 10.690700, null, null, null),

  ('Ciclovia dei Trabocchi', 'La costa abruzzese tra trabocchi e calette, su ex ferrovia.',
   '2026-09-26', '2026-09-26', 'Abruzzo', 'https://example.com/trabocchi',
   'Ortona', 42.355200, 14.402600, 'Vasto', 42.110700, 14.708900),

  ('Salento in bici', 'Tra mari, masserie e ulivi secolari nel cuore del Salento.',
   '2026-10-17', '2026-10-18', 'Puglia', 'https://example.com/salento',
   'Lecce', 40.351500, 18.175000, 'Otranto', 40.146900, 18.486100),

  ('Etna Slow Ride', 'Pedalata cicloturistica alle pendici del vulcano, tra colate e vigneti.',
   '2026-09-05', '2026-09-05', 'Sicilia', 'https://example.com/etna',
   'Catania', 37.507900, 15.083000, 'Nicolosi', 37.614400, 15.026600),

  ('Sardegna Costa Smeralda Tour', 'Tre giorni lungo la costa nord-est, tra calette e macchia mediterranea.',
   '2026-06-06', '2026-06-08', 'Sardegna', 'https://example.com/sardegna',
   'Olbia', 40.923900, 9.498700, 'Palau', 41.177900, 9.387700),

  ('Castelli Romani Ride', 'Anello tra i borghi dei Castelli Romani e il lago di Albano.',
   '2026-04-25', '2026-04-25', 'Lazio', 'https://example.com/castelli',
   'Frascati', 41.808900, 12.679900, null, null, null);

-- ----------------------------------------------------------------------------
-- Per promuovere un utente ad amministratore (dopo la registrazione):
--
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'puccio-94@live.it');
-- ----------------------------------------------------------------------------
