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
preprod) via le build-arg `APP_VERSION`. Après le webhook, la CI interroge
`<URL>/version.json` jusqu'à 5 minutes : si l'environnement ne sert pas la version attendue,
**le job échoue** — un webhook qui répond 200 sans rien déployer ne passe pas inaperçu.

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

## Mise en place Dokploy (runbook)

À faire une fois par projet (les deux apps sont identiques, seuls le tag d'image, le
domaine et le webhook changent) :

1. Le package ghcr doit être **public** (page du package → Package settings → Danger Zone →
   Change visibility → Public). Sinon, renseigner un PAT `read:packages` dans Dokploy.
2. Dans Dokploy : **Create Service → Application**, nommer (`solarsys` / `solarsys-preprod`).
3. Provider **Docker** → image `ghcr.io/t3hx/solarsys-react-app:latest` (prod) ou `:preprod`
   (preprod). Pas de credentials (package public).
4. Onglet **Advanced** → Container Port : `8080`. Healthcheck sur `/` si le formulaire
   existe dans la version de Dokploy.
5. Onglet **Domains** → host (`solarsys.<domaine>` / `preprod.solarsys.<domaine>`),
   port `8080`, HTTPS avec certificat **Let's Encrypt**. Le DNS (enregistrement A vers le
   VPS) doit exister au préalable.
6. Onglet **Deployments** → copier la **Webhook URL** et la poser en secret GitHub :
   `gh secret set DOKPLOY_PROD_WEBHOOK_URL` (ou `DOKPLOY_PREPROD_WEBHOOK_URL`).
7. Poser les variables d'URL publiques pour la vérification :
   `gh variable set PROD_URL --body "https://solarsys.<domaine>"` (et `PREPROD_URL`).
8. Premier déploiement : bouton **Deploy** dans Dokploy (ensuite le webhook prend le relais).

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
