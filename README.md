# Consultant Reservation System

This system was made as the final project for the LUT University
_Distributed Systems_ course.

Dependencies
---

The application requires the following dependencies to be 
installed:

> NodeJS + npm

> MongoDB


Running the system
---

The client-side runs via HTML+JS. The _serve_ package is one 
way to make it run, on port 3000 by default.

In order to run the back-end system, you need to make the
nodes that form the system run in their own ports. For 
instance, the handler runs on port 8000. Before the system
should be run, the database cluster should be running on
the background.

For each node, run the following:

> npm i

> npm run start

The first command installs each of the dependencies. The 
lower one runs a node. 
