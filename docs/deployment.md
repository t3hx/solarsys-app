# Déploiement

Référence du processus de mise en ligne. C'est le **standard** de tous les projets déployés
(figé le 2026-10-15) : ne pas le renégocier à chaque projet, le répliquer.

## Vue d'ensemble

```
push dev   ─→ CI (quality + e2e) ─→ image ghcr :preprod ──→ webhook ─→ Dokploy PREPROD
merge main ─→ CI (quality + e2e) ─→ tag vX.Y.Z + Release ─→ image ghcr :latest + :vX.Y.Z
                                                          └→ webhook ─→ Dokploy PROD
```

Tout est automatique : on ne déploie jamais à la main. La preprod suit `dev` en continu,
la prod avance uniquement par merge `dev → main` (merge simple, jamais de squash), et chaque
merge sur `main` produit une version.

## Environnements

| Env | Branche | Image | App Dokploy | Secret webhook |
|---|---|---|---|---|
| Preprod | `dev` | `ghcr.io/t3hx/solarsys-app:preprod` (+ `dev-<sha>`) | `solarsys-preprod` | `DOKPLOY_PREPROD_WEBHOOK_URL` |
| Prod | `main` | `ghcr.io/t3hx/solarsys-app:latest` (+ `vX.Y.Z`, `main-<sha>`) | `solarsys` | `DOKPLOY_PROD_WEBHOOK_URL` |

L'app est entièrement statique : **aucun secret runtime**, la même image sert les deux
environnements. L'image finale est `nginxinc/nginx-unprivileged` (non-root) qui sert `dist/`
sur le **port 8080**.

## Versioning

Automatique, calculé au merge sur `main` depuis les Conventional Commits
(`mathieudutour/github-tag-action`) :

- `fix:`, et tout le reste par défaut → **patch** ;
- `feat:` → **minor** ;
- `feat!:` / `BREAKING CHANGE:` → **major**.

Le job `release` pose le tag git `vX.Y.Z`, publie une **GitHub Release** avec notes
générées, puis l'image prod est taguée `latest` **et** `vX.Y.Z` : on peut épingler ou
rollbacker une version précise dans Dokploy en changeant le tag de l'image.

## Garde-fous

- `pr-checks.yml` : titre de PR au format Conventional Commits ; vers `main`, seule la
  branche `dev` est acceptée.
- Les jobs `deploy-*` skippent proprement tant que leur secret webhook n'existe pas.
- Hook local `~/.claude/hooks/guard-main-push.sh` : tout `git push` vers `main` exige une
  confirmation explicite (pousser `main` = déployer).

## Mise en place Dokploy (runbook)

À faire une fois par projet (les deux apps sont identiques, seuls le tag d'image, le
domaine et le webhook changent) :

1. Le package ghcr doit être **public** (page du package → Package settings → Danger Zone →
   Change visibility → Public). Sinon, renseigner un PAT `read:packages` dans Dokploy.
2. Dans Dokploy : **Create Service → Application**, nommer (`solarsys` / `solarsys-preprod`).
3. Provider **Docker** → image `ghcr.io/t3hx/solarsys-app:latest` (prod) ou `:preprod`
   (preprod). Pas de credentials (package public).
4. Onglet **Advanced** → Container Port : `8080`. Healthcheck sur `/` si le formulaire
   existe dans la version de Dokploy.
5. Onglet **Domains** → host (`solarsys.<domaine>` / `preprod.solarsys.<domaine>`),
   port `8080`, HTTPS avec certificat **Let's Encrypt**. Le DNS (enregistrement A vers le
   VPS) doit exister au préalable.
6. Onglet **Deployments** → copier la **Webhook URL** et la poser en secret GitHub :
   `gh secret set DOKPLOY_PROD_WEBHOOK_URL` (ou `DOKPLOY_PREPROD_WEBHOOK_URL`).
7. Premier déploiement : bouton **Deploy** dans Dokploy (ensuite le webhook prend le relais).

## Dépannage

- **Le deploy job skippe** : le secret webhook correspondant n'est pas posé (étape 6).
- **Dokploy ne pull pas l'image** : vérifier que le package ghcr est public et que le tag
  existe (`docker manifest inspect ghcr.io/t3hx/solarsys-app:preprod`).
- **Rollback prod** : dans Dokploy, remplacer le tag `latest` par le `vX.Y.Z` voulu et
  Deploy ; revenir à `latest` une fois le correctif mergé.
- **Pas de nouvelle version créée** : le job `release` ne tourne que sur push `main` ;
  `default_bump: patch` garantit un tag à chaque merge.
