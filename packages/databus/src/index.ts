import {
  getFormattedEventName,
  getFormattedCustomEventName,
} from './utils/get-formatted-event-names';

interface IDatabus<T = Record<string, any>> {
  eventName: string;
  addEvent(params?: { detail?: T }): void;
  addCustomEvent(params: {
    eventId?: string;
    listener(event: CustomEvent<T>): void;
  }): void;
  addEventListener(params: {
    eventId?: string;
    listener(detail: T): void;
  }): void;
  addCustomEventListener(params?: { eventId?: string }): void;
}

type AddEventParamsType<T> = {
  eventId?: string;
  detail?: T;
};

type AddBaseEventParamsType<T> = AddEventParamsType<T> & {
  eventBaseName: string;
};

type AddEventListenerParamsType<T> = {
  eventId?: string;
  listener(detail: T): void;
};

type AddBaseEventListenerParamsType<T> = AddEventListenerParamsType<
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
   * addEvent - method for adding a new custom event
   * @param params - an object that stores the field "detail"
   * "detail" is an event-dependent value associated with this event
   */

  public addEvent = (params?: AddEventParamsType<T>) =>
    this.addBaseEvent({
      ...params,
      eventBaseName: getFormattedEventName(this.eventName),
    });

  public addCustomEvent = (params?: AddEventParamsType<T>) =>
    this.addBaseEvent({
      ...params,
      eventBaseName: getFormattedCustomEventName(this.eventName),
    });

  private addBaseEvent = ({
    eventId: id,
    detail,
    eventBaseName,
  }: AddBaseEventParamsType<T>) => {
    Databus.checkEventState(eventBaseName);

    const eventId = id || eventBaseName;
    const prevData = Databus.eventState[eventBaseName][eventId];

    if (prevData?.event) {
      console.warn(`Event ${eventId} was added earlier`);

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
   * AddEventListener - method for adding a new listener
   * @param eventId
   * @param listener - a function that will be called after receiving
   * a notification with the name of the type of the signed event
   */

  public addEventListener = (params: AddEventListenerParamsType<T>) =>
    this.addBaseEventListener({
      ...params,
      eventBaseName: getFormattedEventName(this.eventName),
    });

  public addCustomEventListener = (
    params: AddEventListenerParamsType<T>,
  ) =>
    this.addBaseEventListener({
      ...params,
      eventBaseName: getFormattedCustomEventName(this.eventName),
    });

  private addBaseEventListener = ({
    eventId: id,
    listener: pureListener,
    eventBaseName,
  }: AddBaseEventListenerParamsType<T>) => {
    Databus.checkEventState(eventBaseName);

    const eventId = id || eventBaseName;
    const listener = ({ detail }: CustomEvent) => pureListener(detail);
    const prevEventData = Databus.eventState[eventBaseName][eventId];

    if (prevEventData?.listener) {
      console.warn(`Listener ${eventId} was already added`);

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
  public static setData = ({ values }: { values: Record<string, any> }) => {
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
