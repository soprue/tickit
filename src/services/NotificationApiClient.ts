interface ApiResponse<T> {
  data: T;
}

export interface ServerSection {
  id: string;
  title: string;
  isFixed: boolean;
}

export interface ServerReminder {
  id: number;
  text: string;
  time: string | null;
  isAllDay: boolean;
  notified: boolean;
  done: boolean;
  sectionId: string;
}

export class NotificationApiClient {
  constructor(private readonly apiUrl = process.env.VITE_API_URL || 'http://localhost:3000') {}

  async markReminderNotified(reminderId: number, accessToken: string) {
    const response = await fetch(this.apiUrl + '/api/reminders/' + reminderId, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken,
      },
      body: JSON.stringify({ notified: true }),
    });

    if (!response.ok) {
      throw new Error('PATCH /api/reminders/' + reminderId + ' failed with ' + response.status);
    }
  }

  async fetchSections(accessToken: string) {
    const response = await fetch(this.apiUrl + '/api/sections', {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    if (!response.ok) {
      throw new Error('GET /api/sections failed with ' + response.status);
    }

    const body = (await response.json()) as ApiResponse<ServerSection[]>;
    return body.data;
  }

  async fetchReminders(accessToken: string) {
    const response = await fetch(this.apiUrl + '/api/reminders', {
      headers: {
        Authorization: 'Bearer ' + accessToken,
      },
    });

    if (!response.ok) {
      throw new Error('GET /api/reminders failed with ' + response.status);
    }

    const body = (await response.json()) as ApiResponse<ServerReminder[]>;
    return body.data;
  }
}
