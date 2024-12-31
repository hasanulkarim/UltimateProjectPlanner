// Google Calendar API configuration
const GOOGLE_API_KEY = 'AIzaSyCBEwTInNY_QyIfX7wnNMxJWcrTS1gF4J4';
const GOOGLE_CLIENT_ID = '99415995406-njklgnlofqjujthn6qhaq4ehhvm2dqc8.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let gapiInitialized = false;
let gisInitialized = false;
let tokenClient: google.accounts.oauth2.TokenClient;

export const initGoogleCalendar = async () => {
  if (!gapiInitialized) {
    await loadGapiClient();
  }
  if (!gisInitialized) {
    await loadGisClient();
  }
};

const loadGapiClient = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: GOOGLE_API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          gapiInitialized = true;
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    };
    script.onerror = () => reject(new Error('Failed to load Google API script'));
    document.body.appendChild(script);
  });
};

const loadGisClient = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => {
      try {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: '', // Will be set later
        });
        gisInitialized = true;
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
    document.body.appendChild(script);
  });
};

const getAccessToken = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client not initialized'));
      return;
    }

    // Callback when the user has authorized the app
    tokenClient.callback = async (resp) => {
      if (resp.error) {
        reject(resp);
      }
      resolve();
    };

    // Prompt the user to select a Google Account and ask for consent
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const addToGoogleCalendar = async (task: Task): Promise<string | null> => {
  try {
    await initGoogleCalendar();
    await getAccessToken();

    const event = {
      summary: task.title,
      description: task.description,
      start: {
        dateTime: `${task.date}T${task.startTime}:00`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(
          new Date(`${task.date}T${task.startTime}`).getTime() + task.duration * 60000
        ).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    return response.result.id;
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error);
    return null;
  }
};
