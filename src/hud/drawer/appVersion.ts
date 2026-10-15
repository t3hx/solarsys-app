/**
 * @module hud/drawer/appVersion
 * @description Version affichee dans le cartouche du drawer. La valeur brute vient du
 * pipeline (`APP_VERSION` : `v1.0.0` en prod, `dev-<sha>` en preprod, `dev` en local) ;
 * on raccourcit juste le sha de preprod pour l'affichage.
 */

export function formatAppVersion(raw: string): string {
  if (!raw) return 'dev'
  const preprodBuild = /^(dev-[0-9a-f]{7})[0-9a-f]*$/.exec(raw)
  return preprodBuild ? preprodBuild[1] : raw
}
