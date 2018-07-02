# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

## Getting Started

```
npm install
npm run generate-images
npm start
```

Open [localhost:8000](http://localhost:8000)


## Project Overview: Stage 2

Project Overview
For the Restaurant Reviews projects, you will incrementally convert a static webpage to a mobile-ready web application. In Stage Two, you will take the responsive, accessible design you built in Stage One and connect it to an external server. You’ll begin by using asynchronous JavaScript to request JSON data from the server. You’ll store data received from the server in an offline database using IndexedDB, which will create an app shell architecture. Finally, you’ll work to optimize your site to meet performance benchmarks, which you’ll test using Lighthouse.

## Getting Started
Fork and clone the [server repository](https://github.com/udacity/mws-restaurant-stage-2). You’ll use this development server to develop your project code.

```
npm install
npm run generate-images //once
npm run build-assets
npm start
```
Node: make sure that on DBHelper.js port is set to the same port as your server port

LightHouse results: 
Please see [json](./lighthouse/[s2]-8000-20180626T154031.json) form lightHouse folder(can be imported into chrome devtools)

![results](./lighthouse/[s2]-screen.png)

## Project Overview: Stage 2

Project Overview
For the Restaurant Reviews projects, you will incrementally convert a static webpage to a mobile-ready web application. In Stage Three, you will take the connected application you yu built in Stage One and Stage Two and add additional functionality. You will add a form to allow users to create their own reviews. If the app is offline, your form will defer updating to the remote database until a connection is established. Finally, you’ll work to optimize your site to meet even stricter performance benchmarks than the previous project, and test again using Lighthouse.

## Getting Started
Fork and clone the [server repository](https://github.com/udacity/mws-restaurant-stage-3). You’ll use this development server to develop your project code.

```
npm install
npm run generate-images //once
npm run build-assets
npm start
```
Node: make sure that on DBHelper.js port is set to the same port as your server port

LightHouse results: 
Please see [json](./lighthouse/[s3]-8000-20180702T074644.json) form lightHouse folder(can be imported into chrome devtools)

![results](./lighthouse/[s3]-screen.png)




