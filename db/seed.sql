create extension if not exists pgcrypto with schema extensions;

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

insert into utente (nickname, nome, cognome, email, password_hash, ruolo) values
    ('admin', 'Admin', 'ArenaHub', 'admin@arenahub.it',
     extensions.crypt('Admin123!', extensions.gen_salt('bf', 10)), 'admin');