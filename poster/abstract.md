# Liquefy the cloud

## Author names

+ Etienne Brodu - student - etienne.brodu@insa-lyon.fr
+ Stéphane Frénot - stephane.frenot@insa-lyon.fr
+ Frédéric Oblé - frederic.oble@worldline.fr
+ Fabien Cellier - fabien.cellier@worldline.fr

## Affiliation
INRIA, CITI, INSA de Lyon, Worldline

Web services handle a fluctuating number of connected users implying variation of resources usage.
These connections are usually processed by web services as a stream of user requests.

To be able to handle these variations in the stream, classical solutions offer developers an API to split the web service into parts, and dynamically distribute them onto multiple machines to balance the load.

We offer to automatically transpile a web service from regular code to multiple atomic stateless parts instead of constraining developers to adhere to a specific syntax.

Our destination model of transpilation is composed of atomic stateless parts containing the logic, listening for messages, and sending modified messages to other parts.
A messaging system delivers messages between the parts.

To allow these stateless parts to store states, the messaging system bind a memory context with the message just before delivering it to the parts, and store back modifications.

The messaging system then would be able to distribute these atomic parts between machines to balance the load from each part, and move memory contexts accordingly.

Using transpilation instead of a specific API, this approach keeps the scalability distinct from development, allowing developers to focus on business logic, and not en scalability issue, thus allowing small business to rapidly grow a user base.