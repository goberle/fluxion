# Compteur à état

Nous avons developpé un compteur de visite enregistrant les visite des utilisateurs suivant l'id fourni dans leur requète, selon deux approches différentes : en javascript classique, et selon une approche de fluxions.

Pour tester ces deux programmes, lancer :

    node main-clq.js

ou

    node main-flx.js

Puis tester en entrant l'adresse : `localhost:8080/A` puis `localhost:8080/B`

En accédant ces deux adresse plusieurs fois, on observe les compteurs associé à ces deux id s'incrémenter.

## description de l'implémentation classique

Nous utilisons `express` pour établir un serveur web minimal.
La fonction `add` renvoie la valeur passé en paramètre incrémenté.
La fonction `router`, en utilisant la fonction `add` incrémente le compteur enregistré pour l'id passé en paramètre.
La fonction `send`, répond au client la valeur du compteur retourné par la fonction `router`

## description de l'implémentation fluxionnelle

### système de messagerie

Le système de messagerie inter-fluxion est implémenter dans le module `fluxion.js`. Ce module expose les méthodes :

+ `register(flx, source)` : perment d'abonner la fluxion `flx` à la source de message `source`.
+ `post(msg)` : permet d'envoyer un message composé de :
    * `type` : le nom de la source de message.
    * `body` : le corp du message.
+ `m(type, body)` : utilitaire facilitant la création d'un message.
+ `next(arg, source)` : permet de persister un état `arg` à distribuer lors de la prochaine distribution de message sur la source `source`.
  Lors de la distribution d'un message, il est concaténé avec chacun des états persistés.
  Le système envoie cet ensemble de message à chacune des fluxion abonné à cette source.
  Les execution sont empilé de cette manière :  

  `fl1 (arg1) ... fln(arg1) fl1(arg2) ... fln(arg2) ... fln(argm)`

+ `exist(source)` : permet de vérifier si la source `source` est écouté par des fluxions.

### Implémentation

L'implémentation par l'approche fluxionnelle suit le même schema que l'implémantation classique.

![alt text](graph.svg "Title")

1. À la reception d'une requète par la fonction `app.get`, celle-ci va créer la fluxion `send`.
Ces deux éléments, `app.get` et `send`, communiquent avec la couche réseau en relation avec le client, et ne peuvent donc pas être distribué vers un autre noeud.

2. La fonction `app.get` envoie un message à la fluction `router` contenant l'id fournit dans la requète, et l'uuid de la connection.

3. La fluxion `router`, à la reception d'6n message va tester l'existence d'une fluxion correspondant à l'id reçu, à l'aide de la fonction `exist`.
Si besoin, la fluxion `router` créée une fluxion `add` et l'abonne sur la source `add_id`, où id correspond à l'id reçu.

4. et persiste un état dans la file d'état de la source `add_id`.
Il existe donc dans le système autant de fluxion `add` et de source `add_id` que d'id, cependant, les fluxions étant absente d'état, toutes les fluxions `add` sont intercheangeables.

5. La fluxion `router` fait passer le message à la fluxion correspondant à l'id reçu.
Celle-ci reçois le message enrichie de l'état préalablement persisté dans la source.

6. La fluxion `add` persiste un incrément de l'état reçu.

7. Et fais passer le message avec la dernière valeur à la fluxion `send`.

