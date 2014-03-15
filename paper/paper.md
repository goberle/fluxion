# Introduction au modèle d'exécution fluxionnel

// TODO introduction plus poussée sur le contexte

Avec la croissance du web comme support de plateformes d'intermédiation, la question du traitement de l'information sous forme de flux se pose pleinement.
La possibilité de traiter l'information pendant son échange offre une maîtrise des délai qui devient nécessaire.

Contrairement au traitement par lot, le traitement par flux ne peut pas utiliser les opérateurs d'ensembles.
Il est nécessaire de repenser l'ensemble des opérations réalisable pour les traduire en opérateurs de flux.

// TODO traitement par flux pour être capable d'élasticiser l'application proportionnellement (the scalability part from dynmaic scalability).

// TODO Répartition dynamique des étapes du flux pour s'adapter dynamiquement à la charge (the dynamic part from dynmaic scalability).

Nous proposons un nouveau modèle d'exécution permettant d'exprimer un service web sous forme de suite de traitements traversé par un flux d'information : depuis la réception d'une requête cliente, jusqu'à l'envoie de la réponse à ce même client.

Cette suite de traitement est composé de parties que l'on appel fluxion.
Un service web exprimé selon ce modèle d'exécution est composé exclusivement de fluxions.
Ces fluxions ont chacune une adresse distincte dans un système de messagerie leurs permettant de communiquer entre elles pour faire suivre le flux d'information de la réception d'une requête à l'envoi de la réponse.

Les fluxions n'ont pas d'état pour réduire l'adhérence aux système physique support, c'est pourquoi, elles manipulent, également, en plus des messages éphémères du flux d'information, des scopes : des structures persisté par le système de messagerie.
Une fluxion décrit un contexte permettant d'identifier les différents scopes dont elle à besoin.

Un système de supervision, reçois du système de messagerie des informations sur l'écoulement des flux dans l'application, ce afin d'organiser les fluxions de manière optimale sur l'architecture physique.

L'implémentation se fait en Javascript, certaines contraintes techniques découlent de ce choix technique.

# Lexique du modèle d'exécution fluxionnel

Le modèle d'exécution fluxionnel est composé de quatre éléments :

+ les fluxions
+ les messages
+ le système de messagerie
+ le système de supervision

## Adresse

L'application étant composé de plusieurs fluxions distinctes, afin de structurer ces fluxions pour former la chaîne de traitement, les fluxions sont identifiée par une adresse unique dans le système de messagerie.

Chaque fluxion connaît l'adresse de la fluxion suivante dans la chaîne de traitement afin de lui faire suivre le flux de message.

Une adresse est une chaîne de caractère.
Pour des raisons techniques, les même contraintes s'applique sur les variables en JavaScript que sur les adresses.

Certaines fluxions sont en bordure du système : les fluxion d'entrée dans le système reçoivent les requêtes client, les fluxion de sortie du système renvoie les réponses au client,
Une fluxion d'entrée a une adresse commençant par le caractère `/` correspondant à l'URL disponible publiquement pour accéder à cette chaîne de transformation.
// TODO Une fluxion de sortie à une adresse commençant / finissant par ..

## Contexte

Les fluxions n'ayant pas d'état propre, afin de persister la continuation du traitement entre les réception de messages, elle manipule des scopes persistant cette continuation.
Une fluxion est donc enregistré dans le système de messagerie, non seulement par une adresse unique, mais également par un contexte : l'ensemble des noms des scopes nécessaires à la fluxion lors de la réception d'un message.

Un contexte est un tableau de nom de scope.
Pour des raisons techniques, un nom de scope suit les même contrainte que les adresses et les variables en Javascript.

## Fluxion

Une fluxion est identifié de manière unique dans le système de messagerie par une adresse.
Une fluxion est une fonction de traitement de flux.

Elle est invoqué par le système de messagerie à la réception d'un message.
La fluxion a la possibilité de :

+ modifier le message, et
+ envoyer un (ou plusieurs) message à la (ou les) prochaine fluxion dans la chaîne de traitement.

Afin de faciliter sa migration entre différents environnement physiques, une fluxion, tout comme une fonction, n'a pas d'état propre.
Afin de pouvoir persister la continuation du traitement entre la réception de messages, il existe deux types de messages manipulé par les fluxions :

+ les messages, structures de données éphémères échangé par le système de messagerie et
+ les scopes, structures de données persisté par le système de messagerie.

## Message

Les messages sont des structures de données composant le flux d'information éphémère échangé entre les fluxion.
Ils représentent à la fois :

+ le signal d'invocation du traitement d'une partie du flux
+ les données du flux à traiter

Un message est composé d'une adresse, et d'un corps :
    
    {
        addr: ma_fluxion, // adresse de destination du message
        body: // corps du message, optionnel
            {}, [], "", ...
    }

Les messages sont acheminé entre les fluxions par le système de messagerie.
À la réception d'un message, le système de messagerie invoque la fluxion destinataire du message.
Cette fluxion renvoie à son tour un message, acheminé par le système de messagerie jusqu'à la prochaine fluxion.


## Scopes

Les scopes persistent les données nécessaire à la continuité du processus de traitement d'une fluxion.

Lors de l'invocation d'une fluxion, le système de messagerie 

// TODO parler des noms, de l'enregsitrement des noms dans le système
// TODO détailler la façon dont le système de messagerie :
// + gère les scopes, comment ils sont persisté
// + comment ils sont associé à une fluxion à la reception d'un message
// + comment ils sont récupérer après l'invocation d'une fluxion
// + comment ils sont déplacé d'une machine à l'autre

## Système de messagerie

Le système de messagerie tiens à jours l'annuaire d'adresses des fluxions, et s'occupe d'acheminer les message d'une fluxion à l'autre.
Cette dernière fonction peut être comparé au scheduler d'un système d'exploitation classique.

// TODO détailler techniquement

## Système de supervision

Le système de supervision rassemble des métriques sur l'écoulement des flux d'informations entre les fluxions, par l'intermédiaire du système de messagerie, et permet, grâce à ces métriques, de répartir les fluxions de manière optimale sur la topologie matériel, et de donner des indices à un opérateur humain sur la qualité de service global du système.

// TODO détailler techniquement

## Bordures

// TODO virer ça, l'incorporer avec le paragraphe sur les fluxions.

Les bordures du systèmes sont des fluxions qui font l'interface avec l'extérieur du système.
Il existe deux types de bordures :

+ les **entrées**  
    permettent de recevoir des connections client entrantes suivant le protocole HTTP.
    C'est donc le premier maillon de la chaîne de traitement.
    Pour chaque connexion entrante, l'entrée va générer une bordure de sortie permettant de répondre au client.
+ les **sorties**  
    permettent d'envoyer le résultat de la chaîne de traitement au client.
    C'est donc le dernier maillon de la chaîne de traitement.

# Interface entre le système de messagerie et les fluxions.

## `register(addr, scps, fn)`

L'enregistrement d'une fluxion se fait par la méthode `register`.

+ `addr` est l'adresse de la fluxion lui permettant de recevoir des messages.
+ `scps` est le (ou les) scope nécessaire à la fluxion.
+ `fn` est la fonction à exécuter à la réception d'un message.

## `link(addr)`

Une fois la fluxion enregistré, avant de pouvoir être utilisé, elle doit être lié à une adresse.
Pendant cette phase de liaison, les scopes vont être initialisé.
> Cette étape est optionnelle, car prise en charge par le système de messagerie.


## `registerScope(scps)`

La méthode `registerScope` permet d'enregistrer un scope.

## `post(msg)`

La méthode `post` permet de poster un message.
Un message est un objet ayant la structure suivante :

    {
        addr : 'destination',
        body : {
            my_var : my_value,
            my_other_var : my_other_value
        }
    }




# Détails des mécanismes du modèle d'exécution.

## Enregistrement d'une fluxion

Lors du lancement du service web, avant de pouvoir recevoir des requêtes clientes, le système de messagerie doit prendre connaissance des différentes fluxion de la chaîne de traitement.
Une fluxion doit être enregistré au préalable dans le système à l'aide de la méthode `register(addr, scps, fn)`.

Le système de messagerie enregistre l'association entre l'adresse et la fluxion enregistré.
Une fois la fluxion enregistré, il lui est possible de recevoir des messages, et d'en échanger.

Pendant l'enregistrement, il est possible de renseigner un objet contenant les scopes nécessaire à la fluxion.

## Réception d'un message

1. Le système de messagerie reçois un message provenant d'une fluxion, ou de la requête d'un client.
Le message a la forme : `{addr: ma_fluxion, body: mon_message}`

2. Il transmet ce message à la fluxion en destinataire du message.
La fluxion destinataire peut se trouver sur une autre machine physique, auquel cas, les deux parties du système de messagerie présentes sur les deux machines physique se passent le message.

3. Juste avant d'invoquer la fluxion, le système de messagerie regroupe le message et le ou les scopes dont dépendent la fluxion.

4. Le système de messagerie invoque ensuite la fluxion et lui passe le regroupement ce regroupement de message et de scope.

5. La fluxion opère un traitement sur cette structure.

6. La fluxion renvoie ensuite un message et les scopes modifiés.
Le système de messagerie reçois ce message renvoyé, et ce cycle recommence.

Les noms sont utilisés pour router les messages entre fluxions, un message est donc rooté à travers les fluxions par le framework selon le modèle suivant. Soit A et B deux fluxions échangeant le message m. La fluxion A utilise un compteur propre (cpt).   

Ins: post(m, A) -> F: searchScope(A) -> F: eval(m+scope, A) -> f: localExec -> f: post(m2, B) -> f: registerScope(A)

// Ins : système d'entrée
// F: Framework
// f: fluxion















