# Introduction au modèle d'exécution fluxionnel

// TODO introduction plus poussée sur le contexte

Avec la croissance du web comme support de plateformes d'intermédiation, la question du traitement de l'information sous forme de flux se pose pleinement.
La possibilité de traiter l'information pendant son échange offre une maîtrise des délai qui devient nécessaire.

Contrairement au traitement par lot, le traitement par flux ne peut pas utiliser les opérateurs d'ensembles.
Il est nécessaire de repenser l'ensemble des opérations réalisable pour les traduire en opérateurs de flux.

# Lexique du modèle d'exécution fluxionnel

Le modèle d'exécution fluxionnel est composé de cinq éléments :

+ les fluxions
+ les messages
+ le système de messagerie
+ le système de supervision
+ Les bordures

Les fluxions sont des conteneurs de logique, tandis que les scopes sont des conteneurs de mémoires.

Une fluxion est l'association d'une adresse - permettant de recevoir des messages - et d'une fonction - permettant d'envoyer des messages.

Une fluxion peut également être associé à un scope.
Un scope est un conteneur mémoire, structuré et associé à un nom.

L'ensemble des noms de scope associé à une fluxion est appelée son contexte.

## Fluxion

Une fluxion est l'association d'une adresse unique dans le système de messagerie et d'une fonction de traitement de ces messages.
Une fluxion est déclenché par le système de messagerie à la réception d'un message.
La fluxion à la possibilité de :

+ modifier le message, et
+ envoyer un ou plusieurs messages.

## Message

Un message est une structure de donnée dynamique.
Il existe deux types de messages :

+ **les messages événements**  
    déclenchent les fluxions. Ils permettent aux fluxions d'échanger les flux d'information.
    Un message représente à la fois le signaux d'exécution et les données de traitement associé.
+ **les messages persistants**, ou scope  
    persistent les données nécessaire à la continuité du processus de traitement d'une fluxion.

## Système de messagerie

Le système de messagerie représente le squelette du modèle d'exécution.
Il tiens à jours l'annuaire d'adresses des fluxions, et permet l'échange de messages entre ces fluxions.

## Système de supervision

Le système de supervision rassemble des métriques sur l'écoulement des flux d'informations entre les fluxions, par l'intermédiaire du système de messagerie, et permet, grâce à ces métriques, de répartir les fluxions de manière optimale sur la topologie matériel, et de donner des indices à un opérateur humain sur la qualité de service global du système.

## Bordures

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


## `store(scps)`

La méthode `store` permet d'enregistrer un (ou plusieurs) scope.

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