# Tank Tracing Demo

## Background
This is a Typescript based project that models an aspect of a manufacturing process. 

The purpose of the this effort is to demonstrate 'complex' business logic (not every app is a CRUD app!), and what I would consider a thourough supporting set of unit tests. 

From a testing perspective, we are using a mock approach where the dependency on the data tier is abstracted, and functions to supply mock data are provided.

TypeORM is used for an ORM solution. Since we are focused on a mock approach, and just illustrating various operations, there is no complete support for actual ORM interaction with a persistence source.

I have choosen this domain problem as there is enough 'meat' within the object modeling to make this interesting. This is based on my personal experience in the beverage manufacturing industry, although instead of manufacturing orange juice, the project was focused on wine. As these operations are common to any beverage manufacturing process, and we are focused on those common mechanics, and the industry is different, no sensitive IP from my previous employer is exposed (really take that seriously from a personal perspective).  

As a bonus, we will address some potential performance issues. 

Although this a partial implementation, the real world ida would be that we would enapsulate this logic in an API instance.  

### The domain problem
Imagine an organization responsible for producing a consumer packaged beverage. Let's say it is orange juice, why not? The overall process is simple at a ten thousand foot level. Oranges are initally purchased, washed, the juice is extracted, initially filtered, transfered to equipment for performing pastrization, cooled, and placed into bulk storage tanks. From that point, the content is further processed on a 'just in time' bases where small batches are then drawn and then additional steps are performed until final consumer packaging is applied.

So, we don't need to be an expert in manufacturing to get a general understanding, the entire process can be summarized as the following. 

* Raw material (oranges) is purchased
* A series of operations are performed until the material is placed into consumer ready packages. 

Whitch in turn, intrduces a series of requirements, as follows. 

* The ability to track work (work orders)
* The ability to view the current contents of a tank 
* The ability to view the content of a tank at a previous point in time 
* The ability to isolate an operation at a previous point in time, and trace all related activity from that location and point in time forward historically (think in the event that we need to perform a product recall and we need to identify everything that was sold within the scope of the recall.
* The ability to select a given tank/storage unit/piece of equipment, and view all related activity for that tank from the time it was empty and the first operation was performed to the final operation where all contents have transferred out or the last recoded operation.

This application provides the functionalty to perform operations defined by the above requirements.

### Understanding 'movements'
Each operation is modeled as 'movement'. Arguably this could be renamed to 'activity' or 'operation'. Associated with each movement is a 'movement segment', one representing the previous state of the begging on the operation, and the second representing the state after the operation. For example, if we are moving content from 'point a' to 'point b', the movement segment representing how much was in the origin tank  

### Optimizing for performance (bonus points)
Operations such as performing historical trace operations result in a lot of read operations through the ORM layer given a traditional approach. This represents a potential performance issue/opportunity, which I have personally experienced in the past. Imagine a high volume operation (my past experience was with an organization that was the worlds largest in it's space) where hundreds in upwards of thousand of operations occur on a daily basis, and then a request comes in to correct data entry from a point in time twp months in the past. This easily results in thousands of operations that come into play, and a lot of those 5ms calls to retrieve data. 

The solution? We take an approach where data is bulk loaded into memory unopn initialization, and all further operations are performed against the in memory model. Computer science 101 as in memory lookups are 'fast' and we can make the assumption that the amount of data we need to store in memory is reasonable for this approach (yes there are other approaches, but this illustrates on). 

Yes, with an in memory model we need to address state changes, which is beyond the scope of this demo, however noted. We are just illustrating loading data, and then supporting higher level business loevel functions. 

#### Loading data prior to business operations
So given an approach where we load all data into memory prior to satisfying any requests for executing business logic, we want to optimize the loading process, and the approoach is as follows.

* Identify all objects/entities in scope for which have no relations identified. Load these via the ORM layer (i.e. .findAll() )
* For the remaining objects, for which have relations to the above objects (uni-directional), load each individual entity via a direct sql command, on a table by table basis, proxied through the ORM provided APIs, and then manually establish the relations. High effort, but an optimized approach, we make the assumption that the level of effort is worth the performance tradeoff (i.e. do we want a new instance to spawn up after a 30 minute load or withing 90% reduction in the loading time).

 

## Running the application
Standard node stuff....

`yarn install`

`yarn run test`

## Project structure
./src/:
	base directory for all code
	
./tests/
	and where the tests live
	
./src/models
	location for there the TypeORM model definitions are 
	
./src/repo
	repository definitions, or where data is retrieved from the persistent store. since this is not an full implementation, we are defining them only for the purposes of how to mock the underlying calls for testing efforts.

## The object model

The following is the object model, a direct one to one relationship to the tables in the support persistent store.

[object model]

### Value objects 

Value objects have been defined to abstract/simplify the process on interpret activity on a given tank.

Operations to satisfy requirements such as 'what are the entire series of operations performed from begining to the end of a selected tank for a given historical movement? Makes sense to flatten/simplify/digest the underlying data representation and return more context specific information for the higher level client request.

## Understanding how operations are linked
Given the nature of the problem at hand, the nature of how invidiual events are linked warrants a little explanation. 

At the lowest level of the work order model is the movement segment entity. For each operation, two movement segments are defined, each representing a 'side' of of the operation. Each movement segment side has an association with a tank, and additionally there are references to other movement segments to other movement segments. Traversing the references between movement segments is the path for 'walking' through a series of avtivity to get an understanding of a series of related events. 

Lets take a look at an example scenario which involves a series of transfers into an empty tank, after which the entire contents are transferred into another tank. We will group these operations into 3 separate work orders. The first introduces content into the empty tank, the next series of operations defines an operation where additional content is introduced into the tank from two separate origins, and then finally everything is empties out into another tank. A separate work order is created for each individal set of operations, for a total of three. For the first and last operation, a single 'movement' definition is established. For the middle intermediate work order, two movements are defined, as the scope of work involves moving content from two separate, distinct sources. So given 3 work orders, a combined total of 4 movements, we end up with a total of 8 movement segment definitions, each linked to each other to reflect the event sequence. Let's take a look at what the resulting records look like.

[example]

So we can observe that the 'next' and 'previous' references between movement segments reflect the series of events. If we are concerned with a series of events for a specific tank, let's say for example 'show me everything that has occurred for 'tank 100' from the initial point where it was empty until an empty state again', we simply need to traverse the series of movement segment references which define the association with the tank that we are focused on.  
     
## Executing unit tests
A suite of tests has been created using the Jest framework. Given the complexity during the optimized data retrieval process, and the number of conditional checks performed during tracing operations, a significant amount of effort has been placed into backing business logic with unit level tests. A mock based approach has been used to eliminate any dependencies on a persistent store. A series of dedicated classes have been established under the ./tests/mock directory in order to  