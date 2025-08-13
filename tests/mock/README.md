# 'Mock' directory

This directory contains mock routines for retrieving data for the purposes of testing. The general idea is that we decouple from a persistent store when consuming data for unit level testing. This eliminates the need to stage data in a persistent store and the dependency to utilize one during testing operations. 


## ./sql-load-mocks.ts
Contains methods for emulating data produced by raw SQL queries. This strategy is used to load data in a efficient brute force manner, for which at a later point the data is translated into TypeORM models. The data is wrappered in table specific interfaces (located under ./src/repo/loaders).

The data returned from SQL based operations will contain low level fk attributes, and during the translation from these interfaces into their model counterparts, any relations between the entities must be manually established. 

## ./mock-utils.ts
Contains mock operations related to getting data for retrieving data in orm form.

## An example mock scenario
Both of the above mock files produce a set of related data that models a scenario where a series of operations introduce content into an originally empty tank, after which that common destination for all operations itself empties into a another tank. The gives us a small number of transactions, just enough to model a complete sequence.

* A work order is created to move an initial 100 gallons into tank 5.
* Two additional work orders are defined, each moving content into the common destination takn 5*
* A finall work order is defined, which moves the entire contents out of the tank*

