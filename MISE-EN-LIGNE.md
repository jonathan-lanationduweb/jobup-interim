# À faire avant la mise en ligne sur interimjobup.com

## Obligatoire — sinon le site restera invisible sur Google

- [ ] Supprimer la balise <meta name="robots" content="noindex, nofollow">
      des SIX pages : index, metiers, accompagnement, deposer-un-cv, faq,
      contact. Supprimer aussi le commentaire qui la précède.
- [ ] Supprimer robots.txt (version développement) et renommer
      robots.production.txt en robots.txt.
- [ ] Vérifier : https://interimjobup.com/robots.txt doit afficher
      « Allow: / » et la ligne Sitemap.
- [ ] Vérifier le code source de chaque page : plus aucune occurrence
      de « noindex ».

## Ensuite

- [ ] Déclarer interimjobup.com dans Google Search Console.
- [ ] Y soumettre sitemap.xml.
- [ ] Demander l'indexation de la page d'accueil.
- [ ] Vérifier que www.interimjobup.com redirige en 301 vers
      interimjobup.com, et HTTP vers HTTPS.
- [ ] Envoyer un CV de test et vérifier qu'il arrive bien.
- [ ] Créer les pages Mentions légales et Politique de confidentialité,
      puis remplacer les liens « # » du pied de page.
