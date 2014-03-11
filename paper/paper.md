# Introduction au modèle d'exection fluxionnel

TODO, comment justifie-t-on ce nouveau modèle d'execution ?

# Lexique du modèle d'execution fluxionnel

Le modèle d'execution fluxionnel est composé de deux éléments :

+ les fluxions
+ les scopes

Les fluxions sont des conteneurs de logique, tandis que les scopes sont des conteneurs de mémoires.

Une fluxion est l'association d'une adresse - permettant de recevoir des messages - et d'une fonction - permettant d'envoyer des messages.

Une fluxion peut également être associé à un scope.
Un scope est un conteneur mémoire, structuré et associé à un nom.

L'ensemble des noms de scope associé à une fluxion est appellé son contexte.

## Fluxion : addresse + fonction

Une fluxion est l'association d'une adresse, permettant de recevoir des messages, et d'une fonction permettant de traiter ces messages.
Pour chaque reception d'un message, la fonction est appellé avec pour argument ce message. La fonction va ensuite pouvoir :

+ modifier le message
+ modifier les scopes parmi son contexte
+ envoyer des messages.

## Scope : nom + mémoire

Un scope est l'association d'un dénominateur et d'une zone mémoire structuré.
Un scope peut être associer à une ou plusieurs fluxions.

# Interface vers un modèle d'execution fluxionnel

## `register(name, ctx, scps, fn)`

L'enregistrement d'une fluxion se fait par la méthode `register`.

+ `name` est le nom de la fluxion avant qu'elle ne soit associé à une adresse
+ `ctx` est le contexte à associé à la fluxion : la liste des scopes dont elle aura besoin lors de son execution à la reception d'un message.
+ `scps` est un argument optionnel permettant d'initialiser les scopes necessarie à la fluxion lors de son execution à la reception d'un message :

    {my_scope : {my_var : my_value, my_other_var : my_other_value}}

+ `fn` est la fonction à executer à la reception d'un message.

## `link(name, addr)`

Une fois la fluxion enregistré, avant de pouvoir être utilisé, elle doit être lié à une adresse.
Pendant cette phase de liaison, les scopes vont être initialisé.

## `store(scps)`

La méthode `store` permet d'initilaliser plusieurs scope de manière indépendante à l'enregistrement des fluxions auquelles ils sont associés.

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