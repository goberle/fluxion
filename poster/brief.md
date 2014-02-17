# Problème

Comment rendre un service web élastique automatiquement ?

Le ratio performance / coût des services web est lié à leurs élasticité face au traitement des connections courante.

Cette élasticité viens de la capacité d'un service web à s'étendre sur un ensemble de machine.

Une application élastique est en mesure d'utiliser le minimum de ressources lorsqu'elle n'est pas sollicité, tout en répondant correctement à la monté en charge.

# État de l'art

Il existe des frameworks permettant d'écrire des applications élastiques :
Storm, TimeStream, MillWheel etc ...

# Avantage significatif

Mais ces frameworks imposent au développeur de se plier à un cadre d'execution particulier.

Tandis que nous proposons d'abstraire ces contraintes pour le développeurs.
(à la fois l'abstraction de la topologie du réseau, et de la topologie de l'application)

# Réalisations & Avancées

Nous proposons le modèle fluxionnel :

> explication des fluxions

# Projet

Dans un premier temps, développer un langage de programmation fluxionnel.
Puis travailler sur l'automatisation de la transpilation javascript -> fluxionnel

---

Approche Storm

Comment assurer la croissance d'un service web sans induire de coût de developpement supplémentaire ?
Comment assurer la croissance d'un service web dans un contexte de flux web ?
Comment utiliser les flux pour assurer la croissance d'un service web ?
Comment permettre le developpement d'une application web sans surcout de developpement ?
Comment abstraire les implications de la croissance d'un service web ?
Comment automatiser l'élasticisation d'un service web grâce au flux ?
Comment abstraire les conséquences de la croissance d'un service web ?

Comment abstraire la croissance d'un service web de son developpement ?

