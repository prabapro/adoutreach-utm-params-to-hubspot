# AdOutreach - Create/Update Hubspot Contacts with Campaign Parameters

This is an Express.js application that handles HTTP POST requests to create or update contacts in HubSpot CRM. It allows you to synchronize contact information captured using Google Tag Manager with your HubSpot account, including properties like first name, last name, UTM parameters, Facebook & Google Click Identifiers (FBCLID,GCLID) and more.

## Prerequisites

1. A Google Cloud Project with necessary [IAM permissions](#gcp-iam-permissions).

2. Hubspot Private App Access Token (API Key) - 🔗 [Documentation](https://developers.hubspot.com/docs/api/private-apps)

3. gcloud CLI installed on your local machine - 🔗 [Documentation](https://cloud.google.com/sdk/docs/install)

## GCP IAM Permissions

- You will need `Cloud Functions Developer (roles/cloudfunctions.developer)` IAM role for deploying this application as a Google Cloud Function. Refer [this documentation](https://cloud.google.com/functions/docs/reference/iam/roles#cloudfunctions.developer) for more details.

- In addition to above, the user must be added to the service account as well;
  1. Go to **IAM and Admin > Service Accounts**
  1. Click on the default service account `[project_id]@appspot.gserviceaccount.com`
  1. Click on **Permissions** tab
  1. Click on **Grant Access** button
  1. Enter the user email & assign `Service Account User (iam.serviceAccountUser)` role
  1. Click **Save**

## Setup

### 1. Create a Hubspot Private App & Contact Properties

1. Go to **Hubspot Settings > Integrations > Private Apps** & create an app with below scopes;

   - `crm.objects.contacts.write`
   - `crm.objects.contacts.read`

2. Copy the Access Token. This will be used when deploying the Cloud Function.

3. Go to **Hubspot Settings > Properties** and create below properties;

   - `UTM Campaign` (Internal name: `utm_campaign`)
   - `UTM Source` (Internal name: `utm_source`)
   - `UTM Medium` (Internal name: `utm_medium`)
   - `UTM Content` (Internal name: `utm_content`)
   - `UTM Term` (Internal name: `utm_term`)

   > - Internal names will be generated automatically. Eg: `utm_campaign` for `UTM Campaign`.

   > - Hubspot has both `Facebook click id` & `Google ad click id` already, so no need to create them manually.

### 2. Deploy as a Google Cloud Function

1. Update your domain name on line 9 of [index.js](./index.js#L9) file.

2. Deploy your Cloud Function using below gcloud command. Make sure to replace `[YOUR_HUBSPOT_PRIVATE_APP_API_KEY]` with your actual HubSpot API key, `[YOUR_GCP_PROJECT_REGION]` with your GCP region and `[YOUR_GCP_PROJECT_ID]` with your GCP project ID.

```
gcloud functions deploy updateHubspotContact \
 --runtime nodejs16 \
 --trigger-http \
 --allow-unauthenticated \
 --update-env-vars HUBSPOT_API_KEY=[YOUR_HUBSPOT_PRIVATE_APP_API_KEY] \
 --region=[YOUR_GCP_PROJECT_REGION] \
 --project=[YOUR_GCP_PROJECT_ID]
```

3. Go to The **Cloud Function > Trigger** & copy the **Trigger URL**

> Eg: `https://[PROJECT_REGION]-[PROJECT_ID].cloudfunctions.net/updateHubspotContact`

### 3. Google Tag Manager

1. Download [container-export.json](./container-export.json) & import it into your GTM workspace.

2. Replace `[YOUR_CLOUD_FUNCTION_URL]` on **cHTML - Send Request to Hubspot API to update contacts** tag.

3. Update `email`, `first_name` & `last_name` with your actual variables.

4. Replace **CE - updateHubspot** trigger with your own trigger based on your setup.
