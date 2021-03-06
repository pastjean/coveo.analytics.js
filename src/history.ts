import {getAvailableStorage, WebStorage} from './storage';

export const STORE_KEY: string = '__coveo.analytics.history';
export const MAX_NUMBER_OF_HISTORY_ELEMENTS: number = 20;
export const MIN_THRESHOLD_FOR_DUPLICATE_VALUE: number = 1000 * 60;
export const MAX_VALUE_SIZE = 75;

export class HistoryStore {
    private store: WebStorage;
    constructor(store?: WebStorage) {
        this.store = store || getAvailableStorage();
    }

    /**
     * @deprecated Synchronous method is deprecated, use addElementAsync instead. This method will NOT work with react-native.
     */
    addElement(elem: HistoryElement) {
        elem.internalTime = new Date().getTime();
        this.cropQueryElement(elem);
        let currentHistory = this.getHistoryWithInternalTime();
        if (currentHistory != null) {
            if (this.isValidEntry(elem)) {
                this.setHistory([elem].concat(currentHistory));
            }
        } else {
            this.setHistory([elem]);
        }
    }

    async addElementAsync(elem: HistoryElement) {
        elem.internalTime = new Date().getTime();
        this.cropQueryElement(elem);
        let currentHistory = await this.getHistoryWithInternalTimeAsync();
        if (currentHistory != null) {
            if (this.isValidEntry(elem)) {
                this.setHistory([elem].concat(currentHistory));
            }
        } else {
            this.setHistory([elem]);
        }
    }

    /**
     * @deprecated Synchronous method is deprecated, use getHistoryAsync instead. This method will NOT work with react-native.
     */
    getHistory(): HistoryElement[] {
        const history = this.getHistoryWithInternalTime();
        return this.stripInternalTime(history);
    }

    async getHistoryAsync(): Promise<HistoryElement[]> {
        const history = await this.getHistoryWithInternalTimeAsync();
        return this.stripInternalTime(history);
    }

    private getHistoryWithInternalTime(): HistoryElement[] {
        try {
            const elements = this.store.getItem(STORE_KEY);
            if (elements && typeof elements === 'string') {
                return JSON.parse(elements) as HistoryElement[];
            } else {
                return [];
            }
        } catch (e) {
            // When using the Storage APIs (localStorage/sessionStorage)
            // Safari says that those APIs are available but throws when making
            // a call to them.
            return [];
        }
    }

    private async getHistoryWithInternalTimeAsync(): Promise<HistoryElement[]> {
        try {
            const elements = await this.store.getItem(STORE_KEY);
            if (elements) {
                return JSON.parse(elements) as HistoryElement[];
            } else {
                return [];
            }
        } catch (e) {
            // When using the Storage APIs (localStorage/sessionStorage)
            // Safari says that those APIs are available but throws when making
            // a call to them.
            return [];
        }
    }

    setHistory(history: HistoryElement[]) {
        try {
            this.store.setItem(STORE_KEY, JSON.stringify(history.slice(0, MAX_NUMBER_OF_HISTORY_ELEMENTS)));
        } catch (e) {
            /* refer to this.getHistory() */
        }
    }

    clear() {
        try {
            this.store.removeItem(STORE_KEY);
        } catch (e) {
            /* refer to this.getHistory() */
        }
    }

    getMostRecentElement(): HistoryElement | null {
        let currentHistory = this.getHistoryWithInternalTime();
        if (currentHistory != null) {
            const sorted = currentHistory.sort((first: HistoryElement, second: HistoryElement) => {
                // Internal time might not be set for all history element (on upgrade).
                // Ensure to return the most recent element for which we have a value for internalTime.
                return (second.internalTime || 0) - (first.internalTime || 0);
            });
            return sorted[0];
        }
        return null;
    }

    private cropQueryElement(elem: HistoryElement) {
        if (elem.name && elem.name.toLowerCase() == 'query' && elem.value != null) {
            elem.value = elem.value.slice(0, MAX_VALUE_SIZE);
        }
    }

    private isValidEntry(elem: HistoryElement): boolean {
        let lastEntry = this.getMostRecentElement();

        if (lastEntry && lastEntry.value == elem.value) {
            return (elem.internalTime || 0) - (lastEntry.internalTime || 0) > MIN_THRESHOLD_FOR_DUPLICATE_VALUE;
        }
        return true;
    }

    private stripInternalTime(history: HistoryElement[]): HistoryElement[] {
        return history.map((part) => {
            const {name, time, value} = part;
            return {name, time, value};
        });
    }
}

export interface HistoryElement {
    name: string;
    value: string;
    time: string;
    internalTime?: number;
}

export interface HistoryViewElement extends HistoryElement {
    title?: string;
}

export default HistoryStore;
