import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PatchNodeRequest {
  nodeType: string;
  currentNodeContent: any;
  instruction: string;
  siblingContext?: any;
}

export interface PatchNodeResponse {
  nodeId: string;
  updatedContent: any;
  changeSummary: string;
  version: number;
}

/**
 * Talks to the two real backend endpoints:
 *  - GET  /api/projects/generate?prompt=...  (Server-Sent Events stream)
 *  - PATCH /api/nodes/:nodeId                (surgical self-healing patch)
 *
 * Previously there was no service like this at all on the frontend —
 * node-chat.component.ts used a fake setTimeout() instead of a real call.
 */
@Injectable({ providedIn: 'root' })
export class ProjectApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  generateProject(prompt: string): Observable<any> {
    return new Observable((subscriber) => {
      const url = `${this.baseUrl}/projects/generate?prompt=${encodeURIComponent(prompt)}`;
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.done) {
          eventSource.close();
          subscriber.complete();
          return;
        }
        subscriber.next(data);
      };

      eventSource.onerror = (err) => {
        eventSource.close();
        subscriber.error(err);
      };

      return () => eventSource.close();
    });
  }

  patchNode(nodeId: string, request: PatchNodeRequest): Observable<PatchNodeResponse> {
    return this.http.patch<PatchNodeResponse>(`${this.baseUrl}/nodes/${nodeId}`, request);
  }
}
