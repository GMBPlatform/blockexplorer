# README FOR GMB EXPLORER PROJECT

# Inspection
SeongKee, Kim ( sk.quant@gmail.com)

## RUN

##### COMMAND

- Execution of the server can be done with the command "npm start" or "node bin/www".
- It is recommended to use "PM2" or such process management tools for a more flexible environment.

##### BUILD-CLIENT

-Builds the source code of the client. The command is "npm run-script build-clientjs." This command allows JavaScript source codes on the Web's client level to be minifed using the module bundler "babel" and obfuscated using uglify-js.

##### IN CASE OF RUNTIME ERROR

- If the port "42079" is not connected, this means that there is no connection with "IS".
- If the port "21979" is not connected, this means that there is no connection with "SCA".
- If the server is not connected to the mainnet, most functions will not work.

##### CONNECT TO NODE

- All database hosts except the local database are received by "NN" and database access information can be retrieved from the system's environment variables.
- All host information except "IS" is allocated globally when the server is running.

## ENVIRONMENT VARIABLES

> All static database information is stored in the system environment variable. The following is a list of environmental variables in use in this project. If the database host, user, password, etc. has been changed or the environment variable has not been set, the environment variable can be configured by referring to the table below.

| LOCAL                   | IS                   | SCA                   |
| :---------------------- | :------------------- | :-------------------- |
| EXPLORER_LOCAL_HOST     | EXPLORER_IS_HOST     |                       |
| EXPLORER_LOCAL_USER     | EXPLORER_IS_USER     | EXPLORER_SCA_USER     |
| EXPLORER_LOCAL_PASSWORD | EXPLORER_IS_PASSWORD | EXPLORER_SCA_PASSWORD |
| EXPLORER_LOCAL_SCHEMA   |                      |                       |
|                         | EXPLORER_IS_PORT     |                       |

## STRUCTURE

##### DIRECTORY STRUCTURE & FUNCTION INFORMATION

- blockexplorer

  - bin
    - www
      > www → The node server execution script.
    ***
  - controllers

    - commonUtils.js

      > hashRegex → Regular expression pattern to check if the string corresponds to a hexadecimal string

      > returnUTCTime → The function that converts the Date string into UTC time Format.

      > returnUTCTimeList → A function that returns a UTC TIME list for an array of entered time Format.

      > hexPadding → A function that pads the entered value to fit two bytes.

      > transactionGenerator → The function that returns the transaction JSON object.

      > messageGenerator → A function that returns the data form to and from the scheduler when communicating with the front end of the socket in real-time.

      > numberWithCommas → A function that is returned by adding a comma to the entered integer value.

      > bufferPaddingGenerator → The function returned by padding count variables in the buffer.

      > xorGenerator → The function that returns two parameters entered with Exclusive OR.

      > rightSignBufferGenerator → A function that calculates Exclusive OR only the note object of the contract and returns it to the buffer.

      > leftSignBufferGenerator → A function that returns the Reclamation by replacing the remaining objects with buffers, except Note and Sign.

      > getBalance → A function that returns the balance of that wallet address.

    - providerControllers.js

      > initBlock → API to initialize block pages by selecting block information from the local database.

      > initTransaction → API to initialize transaction pages by selecting transaction information from the local database

      > initDashboard → The api that initializes the information required on the main page by selecting it from the local database.

      > initLedger → Api to return the account by selecting the remittance record from SCA to the entered address.

    - schedulerControllers.js

      > transaction → The mainnet sends a POST request to the API whenever a transaction is received. The controller is an API for updating the number of transactions and the contents of the transaction table in real-time.

      > block → transaction → The mainnet sends a POST request to the API whenever a block is received. The controller is an API for updating the number of blocks and the contents of the block table in real-time.

      > node → NN sends a list of nodes to this API. This API updates the list of nodes received at the front end in real-time.


    - viewControllers.js
      > index, wallet, transaction, block →  This controller is responsible for rendering and returning the specified view file when a GET request is received in the mapped URI.

      > search → This controller performs a search for blocks, transactions, and wallets. The search value is entered in the query of the request and selected in the local database to apply the resultant value to the view for rendering.

    - walletControllers.js

      > generatePage → This controller is responsible for rendering and returning the specified view file when a GET request is received in the mapped URI.

      > generateApi → Create wallet information by passing the body value(password and mnemonic) of the received request over to the factor in the function of generating the Wallet.

      > informationPage → This controller is responsible for rendering and returning the specified view file when a GET request is received in the mapped URI.

      > informationApi → Return the view page with the information from the wallet delivered at the front end (master public key, master private key, chain code, child keys).

      > loadKeyfilePage → This controller is responsible for rendering and returning the specified view file when a GET request is received in the mapped URI.

      > loadKeyfileApi → The key file is already decoded and handled at the front end, and only the data inside the file is passed. This API generates wallet information by passing the data it receives to the Wallet generation function.

      > loadDirectPage → This controller is responsible for rendering and returning the specified view file when a GET request is received in the mapped URI.

      > loadDirectApi → Create wallet information by passing the body value(password, mnemonic, random number) of the received request over to the factor in the function of generating the Wallet.

      > transactionTransferPage → This controller is responsible for rendering and returning the specified view file when a GET request is received in the mapped URI.

      > transactionTransferApi → This API reconstructs the data on the body of the request into an object to match the contract format and sends the transaction to the mainnet with a signature attached.

      > balanceApi → This API requires the receipt of an object-type wallet address (e.g. { address : "..." }) or a string of wallet addresses. Returns the balance of the wallet address entered.

      > ledgerApi → This API requires the receipt of an object-type wallet address or a string of wallet addresses. Returns the transaction ledger of the wallet address entered.
    ---

- modules

  - chartModule.js
    > A module that sends chart data on the main page to the front in real time.
  - dbModule.js
    > Module that returns database objects (using mysql2). If you do not enter the config parameter, connect it to the local database. If you enter the config parameter, connect it to the database.
  - socketModule.js
    > Module that returns SocketIO objects. Use this module in the server executable (www) to allocate socket objects globally.
  - tcpModule.js
    > This module is used to obtain data or obtain HOST information by connecting to IS, NN, etc.

  ***

- public

  - customcss
    > In addition to the template design, the custom CSS is a defined file.
  - customjs

    - blockClient.js
      > A front-end script for constructing a block table and processing dynamic paging.
    - transactionClient.js
      > A front-end script for constructing a transaction table and processing dynamic paging.
    - walletClient.js
      > A front-end script that is configured to act as a SPA(Single Page Application) for wallet-related functions such as wallet creation, wallet lookup, and remittance.
    - headerClient.js
      > A script that implements the functions performed in the header.
    - indexClient.js
      > A script that connects with a block explorer server and SocketIO to retrieve real-time information from the main page, and implements features such as search.
    - ejs.min.js
      > The client version of the ejs template engine.

  - resources
    > Directory configured with all JavaScript, CSS, and so on related templates.

  ***

  - routes
    > A collection of routers that map the URL to which the request is received to find the appropriate controller.

  ***

- utils

  > Script for generating all functions and seeds related to wallet creation in secp256r1.

  ***

- views
  - 404.ejs
  - block.ejs
  - blockInfo.ejs
  - header.ejs
  - index.ejs
  - transaction.ejs
  - transactionInfo.ejs
  - wallet.ejs
  - walletContract.ejs
  - walletGenerate.ejs
  - walletInformation.ejs
  - walletLedger.ejs
  - walletLoadDirect.ejs
  - walletLoadKeyfile.ejs
  - walletSidebar.ejs
  - walletTransfer.ejs
  - wrong.ejs
  ***
- app.js
