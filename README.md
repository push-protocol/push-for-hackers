# About Notification Identity - Definitions / Specs

## What is Notification Identity?
Identity defines where the notification is coming from and the rules by which we can get the payload json of that specific notification. Current supported identities are Minimal, IPFS, Direct and Subgraph.

## Specifications
Each notification identity carries at the least two parameters which are joined by **+** delimeter, the first parameter represents the identity type used (Minimal, IPFS, Direct, etc) and the second parameter represents either the hash or identifying information that can be used to fetch the necessary JSON which can also be made of composable information.

| Parameter  | Definition |
| ------------- | ------------- |
| Identity Type  | The type id representing from where the payload is stored or coming from  |
| Identity Info | Hash of the payload representing proof or pointer from which the storage can be retrieved |

#### Types of _payloadstorage
| Id  | Type | Definition |
| ------------- | ------------- | ------------- |
| 0 | Minimal | Recommended for Smart Contract  |
| 1 | IPFS | Indicates storage on IPFS |
| 2 | Direct Payload | Indicates storage of direct payload |
| 3 | Subgraph (TheGraph) | Indicates storage on the subgraph |

### Payload identity implementation - 

##### **Type 0** :arrow_right:	
>```Payload Storage + Notification Payload Type + Title + body ```


* ```Notification Payload Type``` - Type of notification (Broadcast, Subset, Targetted, Secret, etc)
  
* ```Title``` - This will be the title of the Message.
  
* ```Body``` - This will be the body/description of the Message.
  

> ```Example``` :thinking:	 0+1+Hello+This is brodacasted notification
  
* ```_payloadstorage``` is represented as **0**
  
* ```_payloadhash``` is represented as **1+Hello+This is brodacasted notification**

<br>

##### **Type 1** :arrow_right:	
>`Payload Storage + IPFS HASH (cid)`
Using type 2 is recommened as it's faster

* ```IPFS HASH``` - The hash of the json payload when uploaded to IPFS, is also called cid
  

>```Example``` :thinking:	1+b45165ed3cd437b9ffad02a2aad22a4ddc69162470e2622982889ce5826f6e3d
  
* ```_payloadstorage``` is represented as **1**
  
* ```_payloadhash``` is represented as **b45165ed3cd437b9ffad02a2aad22a4ddc69162470e2622982889ce5826f6e3d**
<br>

##### **Type 2** :arrow_right:	
> Payload Storage + JSON PAYLOAD SHA-256 HASH
> - `JSON PAYLOAD SHA-256 HASH` - The json payload

> Example 🤔	 2+{\"notification\":{\"title\":\"EPNS x LISCON\",\"body\":\"Dropping payload directly on push nodes at LISCON 2021.\"},\"data\":{\"acta\":\"\",\"aimg\":\"\",\"amsg\":\"Current BTC price is - 47,785.10USD\",\"asub\":\"\",\"type\":\"3\",\"secret\":\"\"}}
> 
- `_payloadstorage` is represented as **2**
- `_payloadhash` is represented as {\"notification\":{\"title\":\"EPNS x LISCON\",\"body\":\"Dropping payload directly on push nodes at LISCON 2021.\"},\"data\":{\"acta\":\"\",\"aimg\":\"\",\"amsg\":\"Current BTC price is - 47,785.10USD\",\"asub\":\"\",\"type\":\"3\",\"secret\":\"\"}}

<br>

##### **Type 3** :arrow_right:	
>`Payload Storage + GraphId + notification number[counter]`

* ```GraphId``` - This will be the id of subgraph. It is usually represented as `githubid/subgraph name` e.g - epns/epnssubgraph.
  
* ```notification number[counter]``` - It will keep the count of Notifications and will process in a successive manner
  

>```Example``` :thinking:	 3+graph:aiswaryawalter/graph-poc-sample+3
  
* ```_payloadstorage``` is represented as **3**
  
* ```_payloadhash``` is represented as **graph:aiswaryawalter/graph-poc-sample+3**
