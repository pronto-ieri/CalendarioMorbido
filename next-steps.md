# COSA MANCA IN MVP

## MISC

- IMPORTANTE: vogliamo supportare da subito l'internazionalizzazione
  - per ora e' tutto in italiano, ma deve poter leggere la lingua di sistema del dispositivo e passare a quella
- elimina il pulsante mappa perche' non la implementiamo in mvp.

### vista mobile

- header da allienare
- introdurre toast per compattare i bottoni

### font

- usa un font e un look and feel non piu' da mockup ma che sembri un prodotto finito.

# PUBBLICO

## CALENDARIO

- completamente assente
  - nella home page, il componente su cui si deve soffermare la vista di un visitatore e' proprio il calendario, popolato dagli eventi
    - codifica con i colori i diversi tipi di eventi

# AREA RISERVATA

- quando ho salvato un evento, voglio che nel calendario pubblico lo veda come contrassegnato come gia' salvato

- togliere latitudine e longitudine dal form di proposta evento

- luogo evento da dividere in:
  - comune
  - provincia
  - (regione gia' presente)

# AREA ADMIN

- un gestore deve poter cancellare un evento anche gia' approvato e questo deve sparire anche dai calendari personali degli utenti.
- il bottone di elimina comparira' solo ai gestori nella pagina pubblica dell'evento

# FUORI MVP (IGNORA PER ORA)

- mappa
  - tutta da implementare
  - filtri temporali

- eventi ricorrenti
  - da gestire nel DM
  - cambio data
  - sezione recensioni del tour (stelle, commenti, etc.)

- scraping evento dal suo sito tramite AI agent

- social network:
- gli utenti possono cercare altri utenti suoi amici e spulciare il loro calendario (da gestire permessi di visibilita')
