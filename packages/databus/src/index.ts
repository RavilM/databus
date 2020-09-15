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
  eventBaseName?: string;
};

type RegisterEventListenerParamsType<T> = {
  eventId?: string;
  listener(event: CustomEvent<T>): void;
  eventBaseName?: string;
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

  /**
   * getFormattedEventName is needed to format event names
   */
  public static getFormattedEventName = (name: string): string =>
    `@subscriber/${name}`;

  public static getData = ({ name }: { name: string }) =>
    Databus.dataState[name];

  private static getListenerToRemove = ({
    eventName,
    eventId,
    isCustomListener,
  }: {
    eventName: string;
    eventId: string;
    isCustomListener: boolean;
  }) => {
    const eventsBundle = isCustomListener
      ? Databus.eventState[eventName]
      : Databus.eventState[Databus.getFormattedEventName(eventName)];

    const event = eventsBundle ? eventsBundle[eventId] : null;

    return event?.listener;
  };

  public static dispatchEvent = ({
    eventName,
    eventId,
  }: {
    eventName: string;
    eventId?: string;
  }) => {
    const eventsBundle = Databus.eventState[eventName];

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
      eventBaseName: Databus.getFormattedEventName(this.eventName),
    });

  public registerCustomEvent = (params?: RegisterEventParamsType<T>) =>
    this.registerBaseEvent({ ...params, eventBaseName: this.eventName });

  private registerBaseEvent = ({
    eventId,
    detail,
    eventBaseName,
  }: RegisterEventParamsType<T> & { eventBaseName: string }) => {
    Databus.checkEventState(eventBaseName);

    const newEventName = eventId || eventBaseName;
    const prevData = Databus.eventState[eventBaseName][newEventName];

    if (prevData?.event) {
      console.warn(`Event ${newEventName} was registered earlier`);

      return;
    }

    Databus.eventState[eventBaseName][newEventName] = {
      ...prevData,
      event: new CustomEvent<T>(newEventName, {
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
      eventBaseName: Databus.getFormattedEventName(this.eventName),
    });

  public registerCustomEventListener = (
    params: RegisterEventListenerParamsType<T>,
  ) =>
    this.registerBaseEventListener({
      ...params,
      eventBaseName: this.eventName,
    });

  private registerBaseEventListener = ({
    eventId: id,
    listener: pureListener,
    eventBaseName,
  }: {
    eventId?: string;
    listener(event: CustomEvent<T>): void;
    eventBaseName: string;
  }) => {
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
    if (!this.eventName) {
      return;
    }

    const isCustomListener = Boolean(Databus.eventState[this.eventName]);
    const eventsBundleName = isCustomListener
      ? this.eventName
      : Databus.getFormattedEventName(this.eventName);

    // eslint error about options chaining
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const eventId = params?.eventId || eventsBundleName;

    const listener = Databus.getListenerToRemove({
      eventName: this.eventName,
      eventId,
      isCustomListener,
    });

    if (!listener) {
      console.warn(`Listener ${eventId} was already removed`);

      return;
    }

    window.removeEventListener(eventId, listener);

    delete Databus.eventState[eventsBundleName][eventId];
  };

  /**
   * setData - method for setting new data to dataState
   * @param values - keys
   */
  public setData = ({ values }: { values: Record<string, any> }) => {
    for (const valueName in values) {
      Databus.dataState[valueName] = values[valueName];

      const eventsBundleName = Databus.getFormattedEventName(valueName);
      const eventsBundle = Databus.eventState[eventsBundleName];

      if (eventsBundle) {
        for (const eventId in eventsBundle) {
          const event = eventsBundle[eventId].event;

          if (event) {
            Databus.dispatchEvent({
              eventName: eventsBundleName,
              eventId: eventId,
            });
          }
        }
      }
    }
  };
}
