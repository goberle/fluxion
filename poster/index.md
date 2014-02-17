---
last_name:          Brodu
first_name:         Etienne
team:               Dice
advisors:
    -   last_name:  Frénot
        first_name: Stéphane
    -   last_name:  Oblé
        first_name: Frédéric
    -   last_name:  Cellier
        first_name: Fabien
partners:
    -               Worldline
topic:              How to abstract web services usage variation from developpement in a context of data streams.
keywords:
    -               dataflow
    -               distributed systems
    -               scalability
layout: participant #filled by organisers
year:   #to be filled by organisers
id:     #to be filled by organisers
slot:   #to be filled by organisers
---
<!-- abstract below | 200 words max | skip line for new paragraphs -->

Web services handle a fluctuating number of connected users implying variation of resources usage.
These connections are usually processed by web services as a stream of user requests.

To be able to handle these variations in the stream, classical solutions offer developers an API to split the web service into parts, and dynamically distribute them onto multiple machines to balance the load.

We offer to automatically transpile a web service from regular code to multiple atomic stateless parts instead of constraining developers to adhere to a specific syntax.

Our destination model of transpilation is composed of atomic stateless parts containing the logic, listening for messages, and sending modified messages to other parts.
A messaging system delivers messages between the parts.

To allow these stateless parts to store states, the messaging system binds a memory context with the message just before delivering it to the parts, and stores back modifications.

The messaging system then would be able to distribute these atomic parts between machines to balance the load from each part, and move memory contexts accordingly.

Using transpilation instead of a specific API, this approach keeps the scalability distinct from development, allowing developers to focus on business logic, and not en scalability issue, thus allowing small business to rapidly grow a user base.