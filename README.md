
# Relay SMS workflow

User can navigate to a URL and enter a phone number.
Then, the user can trigger workflow with a phrase (eg. Text)
Allows user to send/receive messages from Relay to given phone number.

The app is live at [relay-sms.herokuapp.com](http://relay-sms.herokuapp.com/)

## Simplified Workflow Architecture
![architecture diagram](https://github.com/relaypro/sms-workflow/blob/main/assets/arch_diagram.png)
### Paths
`\` homepage

`\generate` renders a page where you can generate a prepopulated url with id

`\id\:id` renders a version of the homepage where device id is prepopulated in the backend

## Installation

clone the repository: 

```bash
git clone https://github.com/relaypro/sms-workflow.git
```

Make sure you have NodeJS installed, or download it from [NodeJS](https://nodejs.org/en/download/)

Run the following to make sure all relevant libraries and packages are installed:
```bash
npm install
```


## Local Usage (for testing purposes only)

There are a couple of environment variables. Create a .env file by running `touch .env` and place the variables and their values in the .env file.
Eg. 
```python
MONGODB_URI=<your_mongo_uri>
TWILIO_ACCOUNT_ID=<your_twilio_id>
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
TWILIO_NUMBER=<your_twilio_phone_number>
```

Register a workflow on your Relay device by

```bash
relay workflow:create --type=phrase --phrase=<input> --uri=wss://relay-sms.herokuapp.com/twilio --name twilio <device_id>
```

To run the application: 
```bash
npm start
```




## Future implementations
- [x] Ability to repeat a message

- [ ] Multiple user texting: “text Chase” “text John”

- [x] Phone texter should be able to initiate the conversation. Conversation should not be able to be terminated. eg. Manager should be able to Text a relay user at any time

- [ ] Use different phone numbers on Twilio side or ability to say who is sending a text on relay. (Assuming that at companies relays are being shared between shifts or something)

- [ ] Dockerize the application

## License
[MIT](https://choosealicense.com/licenses/mit/)
