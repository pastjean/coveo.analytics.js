import { AnalyticsRequestClient } from './analyticsRequestClient';
import { EventType } from '../events';
import { VisitorIdProvider } from './analyticsRequestClient';

export class BeaconAnalyticsClient implements AnalyticsRequestClient {
    constructor(private baseUrl: string,
        private token: string,
        private visitorIdProvider: VisitorIdProvider) { }

    public sendEvent(eventType: EventType, request: any): Promise<void> {
        if (!navigator.sendBeacon) {
            throw new Error(`navigator.sendBeacon is not supported in this browser. Consider adding a polyfill like "sendbeacon-polyfill".`);
        }
        const parsedRequestDataKey = this.getParsedRequestDataKey(eventType);
        const parsedRequestData = `${parsedRequestDataKey}=${encodeURIComponent(JSON.stringify(request))}`;
        const visitorId = this.visitorIdProvider.currentVisitorId;
        const queryParams = `?access_token=${this.token}${visitorId ? `&visitorId=${visitorId}` : ''}`;
        const url = `${this.baseUrl}/analytics/${eventType}${queryParams}`;
        // tslint:disable-next-line: no-console
        console.log(`Sending beacon for "${eventType}" with: `, JSON.stringify(request));
        navigator.sendBeacon(url, new Blob([parsedRequestData], { type: 'application/x-www-form-urlencoded' }));
        return;
    }

    private getParsedRequestDataKey(eventType: EventType): string {
        return `${eventType}Event`;
    }
}
