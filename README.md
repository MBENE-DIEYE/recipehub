# AfriCook

Piattaforma web per scoprire e condividere ricette della cucina africana. Ogni utente registrato può aggiungere le proprie ricette e salvare quelle degli altri tra i preferiti.

Demo online: https://recipehub-opal-nu.vercel.app/

## Stack tecnologico

- **React** — UI con componenti funzionali e hooks
- **Vite** — build tool per sviluppo e bundling
- **Supabase** — database PostgreSQL, autenticazione e Row Level Security
- **Tailwind CSS** — stile utility-first
- **Vercel** — hosting e deploy continuo

## Funzionalità

- Registrazione e login con email/password
- Aggiunta di ricette (titolo, categoria, tempo di preparazione)
- Ricerca per titolo o categoria in tempo reale
- Paginazione (6 ricette per pagina)
- Aggiunta/rimozione dai preferiti persistente
- Eliminazione ricetta (solo il proprietario, con conferma)
- Design responsive per desktop e mobile

## Scelte tecniche rilevanti

**Row Level Security (RLS):** ogni operazione sul database è protetta da policy Supabase — un utente può leggere tutte le ricette ma modificare/eliminare solo le proprie.

**Trigger PostgreSQL:** alla registrazione di ogni nuovo utente in `auth.users`, un trigger crea automaticamente il profilo corrispondente in `public.users`, evitando race condition tra signup e primo insert.

**Stato preferiti:** la verifica se una ricetta è nei preferiti avviene lato server (query su `favorites`) e non in locale, garantendo consistenza dopo il refresh.

## Avvio locale

```bash
npm install
```

Crea un file `.env` nella root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

```bash
npm run dev
```
