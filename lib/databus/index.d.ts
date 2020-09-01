interface DatabusType<T = {
    [key: string]: any;
}> {
    addCustomEvent(params?: {
        detail?: T;
    }): void;
    addEventListener(params: {
        listener(event: CustomEvent<T>): void;
    }): void;
    removeEventListener(): void;
    dispatchEvent(): void;
    setData(params: {
        values: {
            [key: string]: any;
        };
    }): void;
}
export declare class Databus<T = {
    [key: string]: any;
}> implements DatabusType {
    private eventName?;
    constructor(params?: {
        name: string;
    });
    static eventState: {
        [key: string]: {
            event?: CustomEvent;
            listener?: (event: CustomEvent) => void;
        };
    };
    static dataState: {
        [key: string]: any;
    };
    addCustomEvent: (params?: {
        detail?: T | undefined;
    } | undefined) => void;
    addEventListener: ({ listener, }: {
        listener(event: CustomEvent<T>): void;
    }) => void;
    removeEventListener: () => void;
    dispatchEvent: (params?: {
        name: string;
    } | undefined) => void;
    setData: ({ values }: {
        values: {
            [key: string]: any;
        };
    }) => void;
}
export {};
