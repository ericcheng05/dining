# dining

## Introduction

This web application is deployed on [Cloudflare Workers](https://workers.cloudflare.com/), written on Typescript and Hono Framework. The deployment is done via Github Action on wrangler  
You can visit the [Demo Site](https://dining.hlcheng.cf) for viewing the results

## Deployment

To deploy on your worker, please create:
- Secrets in the GitHub Action 
  - ```CLOUDFLARE_ACCOUNT_ID``` with your Account ID
  - ```CLOUDFLARE_API_TOKEN``` with your API Token
- Cloudflare D1 Database
- Cloudflare Worker KV
