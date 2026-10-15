# Déploiement

Référence du processus de mise en ligne. C'est le **standard** de tous les projets déployés
(figé le 2026-10-15) : ne pas le renégocier à chaque projet, le répliquer. Principe de base :
**les builds ne se font jamais sur le VPS** — la CI teste, construit l'image et la livre.

## Vue d'ensemble

```
push dev   ─→ CI (quality + e2e) ─→ image ghcr :preprod ─→ webhook ─→ Dokploy PREPROD
                                                                      └→ vérif /version.json

merge main ─→ CI (quality + e2e) ─→ version calculée (à blanc)
           ─→ image ghcr :latest + :vX.Y.Z ─→ webhook ─→ Dokploy PROD
           ─→ vérif /version.json en prod ─→ SEULEMENT ALORS : tag git vX.Y.Z + GitHub Release
```

Tout est automatique : on ne déploie jamais à la main. La preprod suit `dev` en continu,
la prod avance uniquement par merge `dev → main` (merge simple, jamais de squash), et chaque
merge sur `main` produit une version. **Une Release publiée = la prod sert cette version**,
par construction : le tag et la Release ne sont créés qu'après la preuve de mise en ligne.

## Environnements

| Env | Branche | Image | App Dokploy | Secret webhook | Variable URL |
|---|---|---|---|---|---|
| Preprod | `dev` | `ghcr.io/t3hx/solarsys-react-app:preprod` (+ `dev-<sha>`) | `solarsys-preprod` | `DOKPLOY_PREPROD_WEBHOOK_URL` | `PREPROD_URL` |
| Prod | `main` | `ghcr.io/t3hx/solarsys-react-app:latest` (+ `vX.Y.Z`, `main-<sha>`) | `solarsys` | `DOKPLOY_PROD_WEBHOOK_URL` | `PROD_URL` |

L'app est entièrement statique : **aucun secret runtime**, la même image sert les deux
environnements. L'image finale est `nginxinc/nginx-unprivileged` (non-root) qui sert `dist/`
sur le **port 8080**.

## Preuve de mise en ligne

Le Dockerfile écrit `dist/version.json` (`{"version":"vX.Y.Z"}` en prod, `dev-<sha>` en
preprod) via le build-arg `APP_VERSION`. Après le webhook, la CI interroge `version.json`
jusqu'à 5 minutes : si l'environnement ne sert pas la version attendue, **le job échoue** —
un webhook qui répond 200 sans rien déployer ne passe pas inaperçu.

La vérification se fait **à l'origine, par le tailnet** : la preprod via son DNS (qui
pointe sur l'IP Tailscale), la prod via `--resolve <host>:80:$VPS_TAILSCALE_IP` (variable
de repo) directement sur Traefik — car l'anti-bot de Cloudflare, qui proxifie la prod,
répond 403 aux IPs de datacenter des runners GitHub. L'ACL Tailscale de `tag:ci` doit donc
autoriser le VPS sur les ports **443 et 80**.

## Versioning

Automatique, calculé au merge sur `main` depuis les Conventional Commits
(`mathieudutour/github-tag-action`, à blanc d'abord) :

- **première release du repo → `v1.0.0`** ;
- `fix:`, et tout le reste par défaut → **patch** ;
- `feat:` → **minor** ;
- `feat!:` / `BREAKING CHANGE:` → **major**.

L'image prod est taguée `latest` **et** `vX.Y.Z` : on peut épingler ou rollbacker une
version précise dans Dokploy en changeant le tag de l'image. Le tag git et la **GitHub
Release** (notes générées) sont posés en fin de pipeline, après la vérification prod.

## Garde-fous

- `pr-checks.yml` : titre de PR au format Conventional Commits ; vers `main`, seule la
  branche `dev` est acceptée.
- **Prod : jamais de skip silencieux.** Secret webhook ou variable `PROD_URL` manquants =
  job rouge. En preprod, le webhook manquant skippe avec un notice (période de bootstrap),
  mais une fois branché la vérification devient bloquante aussi.
- Vérification `/version.json` après chaque déploiement (voir ci-dessus).
- Les runs de PR obsolètes sont annulés (`concurrency`) ; les déploiements sont mis en file,
  jamais interrompus en vol.
- Hook local `~/.claude/hooks/guard-main-push.sh` : tout `git push` vers `main` exige une
  confirmation explicite (pousser `main` = déployer).

## Topologie réseau

Le VPS n'expose rien directement au web public :

- **Apps publiques (prod)** : exposées par le **tunnel Cloudflare** — on ajoute une route
  *Public Hostname* dans Zero Trust → Tunnels, c'est elle qui crée l'entrée DNS proxyfiée
  et Cloudflare termine le TLS.
- **Apps privées (preprod, Dokploy, outils)** : enregistrement A manuel (DNS only) vers
  l'**IP Tailscale** du VPS — joignables uniquement depuis le tailnet. Les certificats
  Let's Encrypt sont émis par Traefik via le **challenge DNS** (API Cloudflare), donc pas
  besoin d'être joignable publiquement.
- **Runners GitHub** : Dokploy (webhooks) et la preprod étant sur le tailnet, les jobs de
  deploy rejoignent le tailnet en **node éphémère** (`tailscale/github-action`, `tag:ci`,
  client OAuth Tailscale → secrets `TS_OAUTH_CLIENT_ID` / `TS_OAUTH_SECRET`).

## Mise en place Dokploy (runbook)

À faire une fois par projet (les deux apps sont identiques, seuls le tag d'image, le
domaine et le webhook changent) :

1. Le package ghcr est **public** d'office (il hérite de la visibilité du repo — vérifier
   sur la page du package si le repo est privé, sinon PAT `read:packages` dans Dokploy).
2. Dans Dokploy : projet (`solarsys`) → **deux environnements** (`production`, `preprod`) →
   dans chacun, **Create Service → Application** (`solarsys` / `solarsys-preprod`).
3. Provider **Docker** → image **complète, registre inclus** :
   `ghcr.io/t3hx/solarsys-react-app:latest` (prod) ou `:preprod` (preprod). Pas de
   credentials (package public).
4. DNS selon la topologie ci-dessus : route tunnel Cloudflare (prod) / enregistrement A
   vers l'IP Tailscale (preprod).
5. Onglet **Domains** → host (`solarsys.nspace.link` / `sol-pprod.nspace.link`), path `/`,
   **container port `8080`**, HTTPS, Cert `letsencrypt`.
6. Onglet **Deployments** → copier la **Webhook URL** et la poser en secret GitHub :
   `gh secret set DOKPLOY_PROD_WEBHOOK_URL` (ou `DOKPLOY_PREPROD_WEBHOOK_URL`).
7. Poser les variables d'URL pour la vérification :
   `gh variable set PROD_URL --body "https://solarsys.nspace.link"` (et `PREPROD_URL`).
8. Une fois par tailnet : tag `tag:ci` dans les ACLs Tailscale + client OAuth (scope
   Auth Keys Write, tag `tag:ci`) → secrets `TS_OAUTH_CLIENT_ID` / `TS_OAUTH_SECRET`.
9. Premier déploiement : bouton **Deploy** dans Dokploy (ensuite le webhook prend le relais).

## Dépannage

- **`deploy-prod` rouge « secret/variable not set »** : étapes 6–7 du runbook non faites.
- **`deploy-*` rouge « never served »** : le webhook a répondu mais rien n'est en ligne —
  regarder les logs de déploiement dans Dokploy (pull de l'image, démarrage du conteneur).
- **Dokploy ne pull pas l'image** : vérifier que le package ghcr est public et que le tag
  existe (`docker manifest inspect ghcr.io/t3hx/solarsys-react-app:preprod`).
- **Rollback prod** : dans Dokploy, remplacer le tag `latest` par le `vX.Y.Z` voulu et
  Deploy ; revenir à `latest` une fois le correctif mergé.
- **Merge sur `main` sans Release publiée** : le déploiement a échoué (c'est voulu : pas de
  version fantôme). Corriger, re-merger ou relancer le run — la version recalculée sera la
  même tant que le tag n'existe pas.
