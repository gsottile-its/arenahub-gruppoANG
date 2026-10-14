insert into configurazione (chiave, valore) values
    ('max_tornei_per_utente', '3');


insert into tipologia_gioco (nome) values
    ('FPS'), ('Sportivo'), ('Picchiaduro'), ('MOBA'), ('Corse');


insert into gioco (nome, descrizione, fk_tipologia) values
    ('Valorant',          'Sparatutto tattico 5 contro 5',
        (select id_tipologia from tipologia_gioco where nome = 'FPS')),
    ('Counter-Strike 2',  'Sparatutto tattico a round',
        (select id_tipologia from tipologia_gioco where nome = 'FPS')),
    ('Calcio virtuale',   'Simulazione calcistica',
        (select id_tipologia from tipologia_gioco where nome = 'Sportivo')),
    ('Tekken 8',          'Picchiaduro 1 contro 1',
        (select id_tipologia from tipologia_gioco where nome = 'Picchiaduro')),
    ('League of Legends', 'MOBA a squadre 5 contro 5',
        (select id_tipologia from tipologia_gioco where nome = 'MOBA')),
    ('Mario Kart',        'Gioco di corse arcade',
        (select id_tipologia from tipologia_gioco where nome = 'Corse'));


insert into piattaforma (nome) values ('PC'), ('PS5'), ('Xbox'), ('Switch');


create extension if not exists pgcrypto with schema extensions;

insert into utente (nickname, nome, cognome, email, password_hash, ruolo) values
    ('admin', 'Admin', 'ArenaHub', 'admin@arenahub.it',
     extensions.crypt('Admin123!', extensions.gen_salt('bf', 10)), 'admin');

insert into utente (nickname, nome, cognome, email, password_hash)
select v.nickname, v.nome, v.cognome, v.email,
       extensions.crypt('Password123!', extensions.gen_salt('bf', 10))
from (values
    ('mario88',   'Mario',   'Rossi',    'mario.rossi@arenahub.it'),
    ('luca_g',    'Luca',    'Bianchi',  'luca.bianchi@arenahub.it'),
    ('giulia',    'Giulia',  'Verdi',    'giulia.verdi@arenahub.it'),
    ('sara_k',    'Sara',    'Neri',     'sara.neri@arenahub.it'),
    ('marco',     'Marco',   'Gallo',    'marco.gallo@arenahub.it'),
    ('elena',     'Elena',   'Conti',    'elena.conti@arenahub.it'),
    ('paolo_p',   'Paolo',   'Ferrari',  'paolo.ferrari@arenahub.it'),
    ('chiara',    'Chiara',  'Romano',   'chiara.romano@arenahub.it'),
    ('davide',    'Davide',  'Esposito', 'davide.esposito@arenahub.it'),
    ('anna',      'Anna',    'Ricci',    'anna.ricci@arenahub.it'),
    ('fabio',     'Fabio',   'Greco',    'fabio.greco@arenahub.it'),
    ('laura',     'Laura',   'Marino',   'laura.marino@arenahub.it')
) as v(nickname, nome, cognome, email);


insert into squadra (nome) values
    ('Fulmini'), ('Dragoni'), ('Falchi'), ('Lupi');


insert into membro_squadra (fk_squadra, fk_utente, ruolo_squadra)
select s.id_squadra, u.id_utente, v.ruolo::ruolo_squadra
from (values
    ('Fulmini', 'mario88', 'capo_squadra'),
    ('Fulmini', 'luca_g',  'giocatore'),
    ('Fulmini', 'giulia',  'riserva'),
    ('Dragoni', 'sara_k',  'capo_squadra'),
    ('Dragoni', 'marco',   'giocatore'),
    ('Dragoni', 'elena',   'riserva'),
    ('Falchi',  'paolo_p', 'capo_squadra'),
    ('Falchi',  'chiara',  'giocatore'),
    ('Falchi',  'davide',  'riserva'),
    ('Lupi',    'anna',    'capo_squadra'),
    ('Lupi',    'fabio',   'giocatore'),
    ('Lupi',    'laura',   'riserva')
) as v(squadra, nickname, ruolo)
join squadra s on s.nome = v.squadra
join utente  u on u.nickname = v.nickname;


insert into torneo (fk_organizzatore, fk_gioco, nome, max_posti, long_desc,
                    data_apertura_iscrizione, data_fine_iscrizione, stato,
                    giocatori_per_squadra, premio)
select u.id_utente, g.id_gioco, v.nome, v.max_posti, v.long_desc,
       v.apertura::timestamp, v.fine::timestamp, v.stato::stato_torneo,
       v.giocatori, v.premio
from (values
    ('admin',   'Tekken 8',          'Tekken 8 Open',           8,
     'Torneo a eliminazione diretta 1 contro 1',
     '2026-09-20 10:00', '2026-10-05 23:59', 'in_corso', 1, 'Coppa e 200 euro'),
    ('mario88', 'Mario Kart',        'Mario Kart Cup',          4,
     'Gran premio a 4 giocatori su Switch',
     '2026-10-10 10:00', '2026-10-30 23:59', 'iscrizioni_aperte', 1, 'Coppa'),
    ('admin',   'Calcio virtuale',   'Calcio Virtuale Team Cup', 4,
     'Torneo a squadre con semifinali e finale',
     '2026-09-25 10:00', '2026-10-12 23:59', 'iscrizioni_chiuse', 3, 'Trofeo e 300 euro'),
    ('mario88', 'League of Legends', 'League of Legends Winter Cup', 8,
     'Coppa invernale a squadre 5 contro 5',
     '2026-11-01 10:00', '2026-11-20 23:59', 'bozza', 5, '1000 euro'),
    ('admin',   'Counter-Strike 2',  'Counter-Strike 2 Masters', 4,
     'Torneo a squadre concluso',
     '2026-08-01 10:00', '2026-08-20 23:59', 'concluso', 3, '500 euro'),
    ('luca_g',  'Valorant',          'Valorant Showmatch',      8,
     'Torneo amichevole poi annullato',
     '2026-09-01 10:00', '2026-09-15 23:59', 'annullato', 5, null)
) as v(organizzatore, gioco, nome, max_posti, long_desc, apertura, fine, stato, giocatori, premio)
join utente u on u.nickname = v.organizzatore
join gioco  g on g.nome = v.gioco;


insert into piattaforme_torneo (fk_torneo, fk_piattaforma)
select t.id_torneo, p.id_piattaforma
from (values
    ('Tekken 8 Open',               'PS5'),
    ('Tekken 8 Open',               'PC'),
    ('Mario Kart Cup',              'Switch'),
    ('Calcio Virtuale Team Cup',    'PS5'),
    ('Calcio Virtuale Team Cup',    'Xbox'),
    ('League of Legends Winter Cup','PC'),
    ('Counter-Strike 2 Masters',    'PC'),
    ('Valorant Showmatch',          'PC')
) as v(torneo, piattaforma)
join torneo       t on t.nome = v.torneo
join piattaforma  p on p.nome = v.piattaforma;


insert into iscrizione (fk_torneo, fk_utente, data_iscrizione, stato)
select t.id_torneo, u.id_utente, v.data::timestamp, v.stato::stato_iscrizione
from (values
    ('Tekken 8 Open',  'mario88', '2026-09-21 09:00', 'confermata'),
    ('Tekken 8 Open',  'luca_g',  '2026-09-21 10:00', 'confermata'),
    ('Tekken 8 Open',  'giulia',  '2026-09-22 11:00', 'confermata'),
    ('Tekken 8 Open',  'sara_k',  '2026-09-22 12:00', 'confermata'),
    ('Tekken 8 Open',  'marco',   '2026-09-23 09:30', 'confermata'),
    ('Tekken 8 Open',  'elena',   '2026-09-24 15:00', 'confermata'),
    ('Tekken 8 Open',  'paolo_p', '2026-09-25 16:00', 'confermata'),
    ('Tekken 8 Open',  'chiara',  '2026-09-26 17:00', 'confermata'),
    ('Mario Kart Cup', 'luca_g',  '2026-10-11 09:00', 'confermata'),
    ('Mario Kart Cup', 'giulia',  '2026-10-11 10:00', 'confermata'),
    ('Mario Kart Cup', 'sara_k',  '2026-10-12 11:00', 'confermata'),
    ('Mario Kart Cup', 'marco',   '2026-10-12 12:00', 'in_attesa'),
    ('Mario Kart Cup', 'elena',   '2026-10-13 09:00', 'lista_attesa'),
    ('Mario Kart Cup', 'chiara',  '2026-10-13 18:00', 'lista_attesa'),
    ('Mario Kart Cup', 'paolo_p', '2026-10-11 20:00', 'ritirata')
) as v(torneo, nickname, data, stato)
join torneo t on t.nome = v.torneo
join utente u on u.nickname = v.nickname;


insert into iscrizione (fk_torneo, fk_squadra, data_iscrizione, stato)
select t.id_torneo, s.id_squadra, v.data::timestamp, v.stato::stato_iscrizione
from (values
    ('Calcio Virtuale Team Cup', 'Fulmini', '2026-09-26 10:00', 'confermata'),
    ('Calcio Virtuale Team Cup', 'Dragoni', '2026-09-27 11:00', 'confermata'),
    ('Calcio Virtuale Team Cup', 'Falchi',  '2026-09-28 12:00', 'confermata'),
    ('Calcio Virtuale Team Cup', 'Lupi',    '2026-09-29 13:00', 'confermata'),
    ('Counter-Strike 2 Masters', 'Fulmini', '2026-08-02 10:00', 'confermata'),
    ('Counter-Strike 2 Masters', 'Dragoni', '2026-08-03 11:00', 'confermata'),
    ('Counter-Strike 2 Masters', 'Falchi',  '2026-08-04 12:00', 'confermata'),
    ('Counter-Strike 2 Masters', 'Lupi',    '2026-08-05 13:00', 'confermata')
) as v(torneo, squadra, data, stato)
join torneo  t on t.nome = v.torneo
join squadra s on s.nome = v.squadra;


insert into partita (fk_torneo, round, fk_iscrizione_a, fk_iscrizione_b,
                     punteggio_a, punteggio_b, fk_vincitore, data_partita, stato)
select t.id_torneo, v.rnd, ia.id_iscrizione, ib.id_iscrizione,
       v.pa, v.pb, iv.id_iscrizione, v.data::timestamp, v.stato::stato_partita
from (values
    ('mario88', 'luca_g',  1, 2,    1,    'mario88', '2026-10-08 18:00', 'conclusa'),
    ('giulia',  'sara_k',  1, 0,    2,    'sara_k',  '2026-10-08 19:00', 'conclusa'),
    ('marco',   'elena',   1, 1,    2,    'elena',   '2026-10-09 18:00', 'conclusa'),
    ('paolo_p', 'chiara',  1, 2,    0,    'paolo_p', '2026-10-09 19:00', 'conclusa'),
    ('mario88', 'sara_k',  2, null, null, null,      '2026-10-14 18:00', 'in_corso'),
    ('elena',   'paolo_p', 2, null, null, null,      '2026-10-15 19:00', 'programmata')
) as v(a, b, rnd, pa, pb, vincitore, data, stato)
join torneo t on t.nome = 'Tekken 8 Open'
join utente ua on ua.nickname = v.a
join utente ub on ub.nickname = v.b
join iscrizione ia on ia.fk_torneo = t.id_torneo and ia.fk_utente = ua.id_utente
join iscrizione ib on ib.fk_torneo = t.id_torneo and ib.fk_utente = ub.id_utente
left join utente uv on uv.nickname = v.vincitore
left join iscrizione iv on iv.fk_torneo = t.id_torneo and iv.fk_utente = uv.id_utente;


insert into partita (fk_torneo, round, fk_iscrizione_a, fk_iscrizione_b,
                     punteggio_a, punteggio_b, fk_vincitore, data_partita, stato)
select t.id_torneo, v.rnd, ia.id_iscrizione, ib.id_iscrizione,
       v.pa, v.pb, iv.id_iscrizione, v.data::timestamp, v.stato::stato_partita
from (values
    ('Fulmini', 'Dragoni', 1, 13, 9,  'Fulmini', '2026-08-25 18:00', 'conclusa'),
    ('Falchi',  'Lupi',    1, 13, 11, 'Falchi',  '2026-08-25 19:00', 'conclusa'),
    ('Fulmini', 'Falchi',  2, 13, 10, 'Fulmini', '2026-08-27 20:00', 'conclusa')
) as v(a, b, rnd, pa, pb, vincitore, data, stato)
join torneo t on t.nome = 'Counter-Strike 2 Masters'
join squadra sa on sa.nome = v.a
join squadra sb on sb.nome = v.b
join squadra sv on sv.nome = v.vincitore
join iscrizione ia on ia.fk_torneo = t.id_torneo and ia.fk_squadra = sa.id_squadra
join iscrizione ib on ib.fk_torneo = t.id_torneo and ib.fk_squadra = sb.id_squadra
join iscrizione iv on iv.fk_torneo = t.id_torneo and iv.fk_squadra = sv.id_squadra;