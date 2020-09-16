import {
  getFormattedEventName,
  getFormattedCustomEventName,
} from './utils/get-formatted-event-names';

interface IDatabus<T = Record<string, any>> {
  eventName: string;
  registerEvent(params?: { detail?: T }): void;
  registerCustomEvent(params: {
    eventId?: string;
    listener(event: CustomEvent<T>): void;
  }): void;
  registerEventListener(params: {
    eventId?: string;
    listener(event: CustomEvent<T>): void;
  }): void;
  registerCustomEventListener(params?: { eventId?: string }): void;
  removeEventListener(params?: { eventId?: string }): void;
  setData(params: { values: { [key: string]: any } }): void;
}

type RegisterEventParamsType<T> = {
  eventId?: string;
  detail?: T;
};

type RegisterBaseEventParamsType<T> = RegisterEventParamsType<T> & {
  eventBaseName: string;
};

type RegisterEventListenerParamsType<T> = {
  eventId?: string;
  listener(event: CustomEvent<T>): void;
};

type RegisterBaseEventListenerParamsType<T> = RegisterEventListenerParamsType<
  T
> & {
  eventBaseName: string;
};

/**
 * Name: '@subscriber/selectedSupplier': {[name]: event listener}
 * subscriber:
 * event
 * listener
 */

export class Databus<T = Record<string, any>> implements IDatabus {
  public eventName: string;

  constructor(params: { name: string }) {
    this.eventName = params.name;
  }

  public static checkEventState = (eventName: string) => {
    if (!Databus.eventState[eventName]) {
      Databus.eventState[eventName] = {};
    }
  };

  /**
   * eventState is needed for storing information about events by key.
   * It has a object structure:
   * event - is a custom event
   * listener - is a listener, what will listen events
   */
  public static eventState: {
    [key: string]: {
      [key: string]: {
        event?: CustomEvent;
        listener?: (event: CustomEvent) => void;
      };
    };
  } = {};

  /**
   * dataState is needed for storing data that will share by subscriber
   */
  public static dataState: Record<string, any> = {};

  public static getData = ({ name }: { name: string }) =>
    Databus.dataState[name];

  private static getEventBundleName = (eventName: string): string | null => {
    const eventSectionName = getFormattedEventName(eventName);

    if (Databus.eventState[eventSectionName]) {
      return eventSectionName;
    }

    const customEventSectionName = getFormattedCustomEventName(eventName);

    if (Databus.eventState[customEventSectionName]) {
      return customEventSectionName;
    }

    return null;
  };

  public static dispatchEvent = ({
    eventName,
    eventId,
  }: {
    eventName: string;
    eventId?: string;
  }) => {
    const eventsBundleName = Databus.getEventBundleName(eventName);

    if (!eventsBundleName) {
      return;
    }

    const eventsBundle = Databus.eventState[eventsBundleName];

    if (eventId) {
      const searchedEvent = eventsBundle[eventId]?.event;

      if (searchedEvent) {
        window.dispatchEvent(searchedEvent);
      }

      return;
    }

    for (const key in eventsBundle) {
      const searchedEvent = eventsBundle[key].event;

      if (searchedEvent) {
        window.dispatchEvent(searchedEvent);
      }
    }
  };

  /**
   * registerEvent - method for adding a new custom event
   * @param params - an object that stores the field "detail"
   * "detail" is an event-dependent value associated with this event
   */

  public registerEvent = (params?: RegisterEventParamsType<T>) =>
    this.registerBaseEvent({
      ...params,
      eventBaseName: getFormattedEventName(this.eventName),
    });

  public registerCustomEvent = (params?: RegisterEventParamsType<T>) =>
    this.registerBaseEvent({
      ...params,
      eventBaseName: getFormattedCustomEventName(this.eventName),
    });

  private registerBaseEvent = ({
    eventId: id,
    detail,
    eventBaseName,
  }: RegisterBaseEventParamsType<T>) => {
    Databus.checkEventState(eventBaseName);

    const eventId = id || eventBaseName;
    const prevData = Databus.eventState[eventBaseName][eventId];

    if (prevData?.event) {
      console.warn(`Event ${eventId} was registered earlier`);

      return;
    }

    Databus.eventState[eventBaseName][eventId] = {
      ...prevData,
      event: new CustomEvent<T>(eventId, {
        detail: detail,
      }),
    };
  };

  /**
   * registerEventListener - method for adding a new listener
   * @param eventId
   * @param listener - a function that will be called after receiving
   * a notification with the name of the type of the signed event
   */

  public registerEventListener = (params: RegisterEventListenerParamsType<T>) =>
    this.registerBaseEventListener({
      ...params,
      eventBaseName: getFormattedEventName(this.eventName),
    });

  public registerCustomEventListener = (
    params: RegisterEventListenerParamsType<T>,
  ) =>
    this.registerBaseEventListener({
      ...params,
      eventBaseName: getFormattedCustomEventName(this.eventName),
    });

  private registerBaseEventListener = ({
    eventId: id,
    listener: pureListener,
    eventBaseName,
  }: RegisterBaseEventListenerParamsType<T>) => {
    Databus.checkEventState(eventBaseName);

    const eventId = id || eventBaseName;
    const listener = ({ detail }: CustomEvent) => pureListener(detail);
    const prevEventData = Databus.eventState[eventBaseName][eventId];

    if (prevEventData?.listener) {
      console.warn(`Listener ${eventId} was already registered`);

      return;
    }

    Databus.eventState[eventBaseName][eventId] = {
      ...prevEventData,
      listener,
    };

    window.addEventListener(eventId, listener);
  };

  /**
   * removeEventListener - method to remove the listener with
   * the name of the type of the signed event
   */
  public removeEventListener = (params?: { eventId?: string }) => {
    const eventsBundleName = Databus.getEventBundleName(this.eventName);

    if (!eventsBundleName) {
      return;
    }

    const searchedEventId = params?.eventId || eventsBundleName;
    const eventsBundle = Databus.eventState[eventsBundleName];
    const eventData = eventsBundle[searchedEventId];
    const eventListener = eventData?.listener;

    if (!eventListener) {
      console.warn(`Listener ${searchedEventId} was already removed`);

      return;
    }

    window.removeEventListener(searchedEventId, eventListener);

    delete Databus.eventState[eventsBundleName][searchedEventId];

    if (Object.keys(eventsBundle).length === 0) {
      delete Databus.eventState[eventsBundleName];
    }
  };

  /**
   * setData - method for setting new data to dataState
   * @param values - keys
   */
  public setData = ({ values }: { values: Record<string, any> }) => {
    for (const valueName in values) {
      Databus.dataState[valueName] = values[valueName];

      const eventsBundleName = getFormattedEventName(valueName);
      const eventsBundle = Databus.eventState[eventsBundleName];

      if (!eventsBundle) {
        return;
      }

      for (const eventId in eventsBundle) {
        const event = eventsBundle[eventId].event;

        if (event) {
          Databus.dispatchEvent({
            eventName: valueName,
            eventId: eventId,
          });
        }
      }
    }
  };
}
