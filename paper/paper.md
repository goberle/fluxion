# Introduction

La croissance des plateformes du Web est dû à la capacité d'internet' de favoriser le développement de services avec une mise en production minimale très rapide.
En quelques heures, il est possible de mettre en ligne un produit fonctionnel afin d'accueillir une première audience.
'*Release early, release often.*' est souvent entendu parmi les communautés open source pour capter rapidement une communauté d'utilisateurs.

Si le service répond correctement aux attentes de l'audience, celle-ci va très probablement grossir au fur et à mesure que le service gagne en popularité.
Afin de pouvoir faire face à cette croissance, la quantité de ressources utilisé par le service augmente en conséquence, et il arrive un moment dans le développement du produit où la taille des données à traiter et la quantité de ressources nécessaires, imposent l'utilisation d'un modèle de traitement plus efficace.
Ces modèles plus efficaces passent par une segmentation des échanges entre fonctions, en utilisant différents paradigmes de communication comme les approches three-tiers, les événements, les messages ou les flux. [bilbio]
Une fois segmenté, les différentes parties communiquent entre elles par un principe de messagerie le plus souvent asynchrone.
De très nombreux outils ont été définis qui permettent d'exprimer ces différentes parties, leurs interactions, et de prendre en charge l'acheminement des messages [Storm, MillWheel, Spark, TimeStream ...].
Cependant, ces outils utilisent des interfaces ou des langages particuliers. Il est nécessaire de former les équipes de développement à l'utilisation de ces nouveaux outils, d'engager des experts familiers avec ces outils et de réécrire le service initial en utilisant ces nouveaux outils.
Cette nouvelle architecture est globalement moins souple et moins propice aux changements rapides. // TODO à vérifier et documenter [biblio]
Ce changements de paradigmes de développement représente une prise de risque dans la poursuite du projet car ces outils sortent du cadre grand public suffisamment accessible pour favoriser l'émergence spontanée de nouveaux services.

Nous proposons un outil permettant d'éviter de forcer ce changement de paradigme en proposant une vision segmentée de programme "standard".
Nous visons des applications Web dont les sollicitations proviennent des flux de requêtes utilisateurs et dont le développement initial est réalisé selon une approche web 'classique' (serveur web / traitement applicatif / data).
Nous pensons qu'il est possible d'analyser cette classe d'applications dès les premières étapes d'exploitations afin de les re-exprimer plus ou moins concrètement sous la forme de flux d'échange.

Nous supposons que les applications serveur sont développés dans un langage dynamique comme Javascript, et nous proposons un outil capable d'identifier les flux internes, de définir des unités de traitement de ces flux, et de pouvoir gérer de manière dynamique ces unités.
L'outil identifie ces unités sans être intrusif dans le code existant mais en proposant une sur-expression du programme initial en utilisant le paradigme de fluxion que nous allons définir et qui servira au cœur de notre proposition.

// TODO
La section 2 présente le principe de fluxion en le positionnant par rapport à l'existant.
La section 3 ...

# Modèle d'exécution fluxionnel

Le principe de modèle d'exécution fluxionnel est d'identifier des unités d'exécution autonomes fondés sur des flux.
Une unité est autonome quand elle peut être déplacé dynamiquement d'environnement d'exécution pendant sont activité.
Déplacer une unité d'exécution nécessite de déplacer avec le code d'exécution son contexte courant. C'est à dire l'ensemble des variables d'état et de mémoire provenant des exécutions précédentes de la fonction.
Dans notre approche, ce contexte est encapsulé sous forme de flux pour être manipulé par l'unité d'exécution.
(Pour notre approche nous "transférons" ce contexte dans un flux propre à l'unité déplacé.) Ainsi, déplacer une telle unité consiste à déplacer le code fonctionnel vers une nouvelle destination puis de rediriger les flux d'entrées et de sorties en conséquence. Une telle unité peut alors être déplacé de nœud en nœud sans y être supprimée(?).
Seul les flux doivent être redirigés en conséquence.

Nous avons appelé cette unité d'exécution autonome une fluxion. C'est à dire une fonction, au sens de la programmation fonctionnelle ne dépendant pour ses entrées et ne produisant sur ses sorties que des flux.

## Définition du modèle fluxionnel

L'idée principale est de pouvoir déplacer à chaud des unités d'exécution. L'approche classique consiste à déplacer la pile / le tas de variable sans se préoccuper des flux associés. Dans notre cas, on transforme tout en flux.

+ Non adhérence à l'architecture d'exécution.
+ Compatibilité avec le modèle d'exécution.
+ Compatibilité avec le modèle d'entrée / sortie global.









---
OLD

---
Un service web exprimé selon ce modèle d'exécution encapsule sa logique dans des fluxions.
Ces fluxions composent la chaîne de traitement traversé par le flux de requêtes utilisateurs.

Les fluxions ont chacune une adresse distincte dans un système de messagerie leurs permettant de communiquer entre elles pour faire suivre le flux d'information de la réception d'une requête à l'envoi de la réponse.
Les fluxions n'ont pas d'états afin de réduire l'adhérence aux systèmes physique support, c'est pourquoi elles manipulent également des scopes, en plus des messages éphémères du flux d'information : des structures persisté par le système de messagerie.
Une fluxion est enregistré avec un contexte : une liste des noms de scope, afin de renseigner le système de messagerie des différents scopes nécessaires à son exécution.
Un système de supervision, reçois du système de messagerie des informations sur l'écoulement des flux dans l'application, ce afin d'organiser les fluxions de manière optimale sur l'architecture physique.
L'implémentation se fait en Javascript, certaines contraintes techniques découlent de ce choix technique.

Nous appelons ce nouveau modèle d'exécution : modèle d'exécution fluxionnel, composé de quatre éléments :

+ les fluxions
+ les messages
+ le système de messagerie
+ le système de supervision

---

# Lexique

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

Les bordures du systèmes sont des fluxions qui font l'interface avec l'extérieur du système.
Il existe deux types de fluxion en bordures :

+ les **entrées**  
    permettent de recevoir des connections client entrantes suivant le protocole HTTP.
    C'est donc le premier maillon de la chaîne de traitement.
    Pour chaque connexion entrante, l'entrée va générer une bordure de sortie permettant de répondre au client.
+ les **sorties**  
    permettent d'envoyer le résultat de la chaîne de traitement au client.
    C'est donc le dernier maillon de la chaîne de traitement.

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

# Interface entre le système de messagerie et les fluxions.


## Enregistrement d'une fluxion

Lors du lancement du service web, avant de pouvoir recevoir des requêtes clientes, le système de messagerie doit prendre connaissance des différentes fluxion de la chaîne de traitement.
Une fluxion doit être enregistré au préalable dans le système à l'aide de la méthode `register(addr, scps, fn)`.

Le système de messagerie enregistre l'association entre l'adresse et la fluxion enregistré.
Une fois la fluxion enregistré, il lui est possible de recevoir des messages, et d'en échanger.

Pendant l'enregistrement, il est possible de renseigner un objet contenant les scopes nécessaire à la fluxion.


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



# Questions ouvertes sur le modèle d'exécution fluxionnel




# Compilation depuis une approche classique vers ce modèle d'exécution fluxionnel

## Différences entre l'approche classique et le modèle d'exécution fluxionnel

Nous listons ici l'ensemble des points de différence entre les deux modèles nécessitant une transformation lors de la compilation.

Nous considérons qu'un service web se situe dans un sous-ensemble des programmes classiques écrit dans un langage dynamique.
Ce sous-ensemble implique que le programme soit structuré de manière à enchaîner des traitements séquentiellement les uns après les autres.

### Utilisation de la mémoire

// TODO préciser techniquement
Dans le modèle classique, la mémoire est centrale.
Elle est cependant cloisonné en scopes de fonctions, et en contexte d'exécution.
Une fonction n'as accès qu'à son scope, et au contexte dans lequel elle est exécutée.

Dans le modèle fluxionnel, la mémoire est décentralisé et encapsulé dans des scopes.

1. Une fonction n'utilise aucune mémoire, ou n'utilise aucune persistance entre ses invocations.
    -> pas de scope

```
function(mon_argument) {
    return mon_argument + 3; // traitements
}
```


2. Une fonction utilise une closure comme scope et elle est la seule à accéder à cette closure.
    -> scope représentant la closure

```
function(mon_scope) {
    // mon_scope accessible
    return function(mon_argument) {
        // mon_argument et mon_scope accessible
        return mon_scope + mon_argument; // traitements
    }
}
```

3. Une fonction utilise une closure comme scope et elle n'est pas la seule à accéder à cette closure, cas de l'objet global.
    -> scope représentant la closure, partagé entre les fluxions.

```
var global ...

function fn1(mon_scope) {
    // global, mon_argument accessibles
    return mon_scope + global; // traitements
}

function fn2(mon_scope) {
    // global, mon_argument accessibles
    return mon_scope + global; // traitements
}
```


### Appel de fonction

// TODO à détailler et préciser
Dans le modèle classique d'un service web, les fonctions de traitement sont appelé les unes après les autres en suivant un principe de chaîne de traitement.

Dans le modèle fluxionnel, le pointeur d'exécution est passé de manière événementiel, porté par le système de messagerie.

1. Une fonction appelle une autre fonction à la fin de son exécution
    -> la fluxion représentant la fonction appelante envoie un message à la fluxion représentant la fonction appelée.

```
function(req) {
    // traitements sur req
    return next(req);
}
```

fluxion appelante -> fluxion appelée

2. Une fonction appelle une autre fonction avant la fin de son exécution.
    -> la fonction appelante est découpé en deux fluxions.
    la fluxion représentant la fonction appelée va servir d'intermédiaire entre ces deux fluxions.

fluxion appelante 1 -> fluxion appelée -> fluxion appelante 2





