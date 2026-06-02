-- ============================================================================
-- CalendarioMorbido — dati di esempio (eventi approvati)
-- Esegui DOPO 0001_init.sql. Eseguito come owner, bypassa la RLS.
-- ============================================================================

insert into public.events
  (title, description, start_date, end_date, region, official_url,
   start_comune, start_provincia, end_comune, end_provincia)
values
  ('Granfondo del Chianti', 'Pedalata cicloturistica tra le colline e i vigneti del Chianti, adatta a tutti.',
   '2026-09-12', '2026-09-13', 'Toscana', 'https://example.com/chianti',
   'Firenze', 'Firenze', 'Siena', 'Siena'),

  ('Lungo il Po in bici', 'Itinerario lento e pianeggiante lungo il fiume Po, tra argini e borghi.',
   '2026-07-05', '2026-07-05', 'Emilia-Romagna', 'https://example.com/po',
   'Piacenza', 'Piacenza', null, null),

  ('Dolomiti Soft Tour', 'Tre giorni tra i passi dolomitici a ritmo turistico, soste panoramiche incluse.',
   '2026-08-21', '2026-08-23', 'Trentino-Alto Adige', 'https://example.com/dolomiti',
   'Bolzano', 'Bolzano', 'Cortina d''Ampezzo', 'Belluno'),

  ('Pedalata delle Langhe', 'Giro tra le colline patrimonio UNESCO, con tappa enogastronomica.',
   '2026-10-04', '2026-10-04', 'Piemonte', 'https://example.com/langhe',
   'Alba', 'Cuneo', 'Barolo', 'Cuneo'),

  ('Riviera Ligure Slow', 'Lungo la costa tra mare e ulivi, percorso facile e panoramico.',
   '2026-06-14', '2026-06-14', 'Liguria', 'https://example.com/riviera',
   'Sanremo', 'Imperia', 'Imperia', 'Imperia'),

  ('Anello del Lago di Garda', 'Giro cicloturistico attorno al lago, con vista sulle Prealpi.',
   '2026-05-30', '2026-05-31', 'Veneto', 'https://example.com/garda',
   'Peschiera del Garda', 'Verona', null, null),

  ('Ciclovia dei Trabocchi', 'La costa abruzzese tra trabocchi e calette, su ex ferrovia.',
   '2026-09-26', '2026-09-26', 'Abruzzo', 'https://example.com/trabocchi',
   'Ortona', 'Chieti', 'Vasto', 'Chieti'),

  ('Salento in bici', 'Tra mari, masserie e ulivi secolari nel cuore del Salento.',
   '2026-10-17', '2026-10-18', 'Puglia', 'https://example.com/salento',
   'Lecce', 'Lecce', 'Otranto', 'Lecce'),

  ('Etna Slow Ride', 'Pedalata cicloturistica alle pendici del vulcano, tra colate e vigneti.',
   '2026-09-05', '2026-09-05', 'Sicilia', 'https://example.com/etna',
   'Catania', 'Catania', 'Nicolosi', 'Catania'),

  ('Sardegna Costa Smeralda Tour', 'Tre giorni lungo la costa nord-est, tra calette e macchia mediterranea.',
   '2026-06-06', '2026-06-08', 'Sardegna', 'https://example.com/sardegna',
   'Olbia', 'Sassari', 'Palau', 'Sassari'),

  ('Castelli Romani Ride', 'Anello tra i borghi dei Castelli Romani e il lago di Albano.',
   '2026-04-25', '2026-04-25', 'Lazio', 'https://example.com/castelli',
   'Frascati', 'Roma', null, null);

-- ----------------------------------------------------------------------------
-- Per promuovere un utente ad amministratore (dopo la registrazione):
--
-- update public.profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'puccio-94@live.it');
-- ----------------------------------------------------------------------------
