import { http, HttpResponse } from 'msw';

export const handlers = [
  // Example handler - replace with your actual API endpoints
  http.get('/api/example', () => {
    return HttpResponse.json({
      data: 'Mocked response',
    });
  }),
]; 