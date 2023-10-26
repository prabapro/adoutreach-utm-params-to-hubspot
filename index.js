const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Define a middleware to enable CORS.
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '[YOUR_WEBSITE_DOMAIN]'); // Update your website's domain - eg: https://adoutreach.com.
	res.header('Access-Control-Allow-Methods', 'POST');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	next();
});

/**
 * Process HTTP POST request to create or update a contact in HubSpot.
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
app.post('/update-hubspot-crm', async (req, res) => {
	try {
		// Parse the JSON data from the request body.
		const data = req.body;

		// Ensure the presence of required data.
		if (!data || !data.email) {
			return res.status(400).send('⚠️ Invalid request. Email is required.');
		}

		// Extract data from the request body.
		const email = data.email;
		const first_name = data.first_name || '';
		const last_name = data.last_name || '';
		const utm_campaign = data.utm_campaign || '';
		const utm_source = data.utm_source || '';
		const utm_medium = data.utm_medium || '';
		const utm_content = data.utm_content || '';
		const utm_term = data.utm_term || '';
		const hs_google_click_id = data.gclid || '';
		const hs_facebook_click_id = data.fbclid || '';

		// Retrieve the HubSpot API key from environment variables.
		const hubspotApiKey = process.env.HUBSPOT_API_KEY;

		// Search for the contact by email.
		const searchRequestBody = {
			filterGroups: [
				{
					filters: [
						{
							propertyName: 'email',
							operator: 'EQ',
							value: email,
						},
					],
				},
			],
		};

		// Search for an existing contact.
		const searchResponse = await axios.post(
			'https://api.hubapi.com/crm/v3/objects/contacts/search',
			searchRequestBody,
			{
				headers: {
					Authorization: `Bearer ${hubspotApiKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		if (searchResponse.data.total === 0) {
			// If the contact doesn't exist, create a new contact in HubSpot.
			const newContact = {
				properties: {
					email: email,
					firstname: first_name,
					lastname: last_name,
					utm_campaign: utm_campaign,
					utm_source: utm_source,
					utm_medium: utm_medium,
					utm_content: utm_content,
					utm_term: utm_term,
					hs_google_click_id: hs_google_click_id,
					hs_facebook_click_id: hs_facebook_click_id,
				},
			};

			// Create a new contact.
			const createResponse = await axios.post(
				'https://api.hubapi.com/crm/v3/objects/contacts',
				newContact,
				{
					headers: {
						Authorization: `Bearer ${hubspotApiKey}`,
						'Content-Type': 'application/json',
					},
				}
			);

			console.log(`🚀 Contact created: ${email}`);
			res.status(201).send(`🚀 Contact created: ${email}`);
		} else {
			// If the contact exists, update the contact's properties.
			const contactId = searchResponse.data.results[0].id;

			// Construct the updateRequestBody object with properties to update.
			const updateRequestBody = {
				properties: {
					firstname: first_name,
					lastname: last_name,
					utm_campaign: utm_campaign,
					utm_source: utm_source,
					utm_medium: utm_medium,
				},
			};

			// Define additional properties you want to update.
			const additionalProperties = {
				utm_content: utm_content,
				utm_term: utm_term,
				hs_google_click_id: hs_google_click_id,
				hs_facebook_click_id: hs_facebook_click_id,
			};

			// Iterate over additional properties and add them to updateRequestBody if they have a value.
			for (const propName in additionalProperties) {
				const propValue = additionalProperties[propName];
				if (propValue !== undefined && propValue !== null && propValue !== '') {
					updateRequestBody.properties[propName] = propValue;
				}
			}

			// Update the contact.
			await axios.patch(
				`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
				updateRequestBody,
				{
					headers: {
						Authorization: `Bearer ${hubspotApiKey}`,
						'Content-Type': 'application/json',
					},
				}
			);

			console.log(`🔁 Contact updated: ${email}`);
			res.status(200).send(`🔁 Contact updated: ${email}`);
		}
	} catch (error) {
		console.error('Error:', error);
		res.status(500).send('😭 Error processing request.');
	}
});

// Deploy this Express app as a Google Cloud Function.
exports.updateHubspotContact = app;
