interface DatabusType<T = Record<string, any>> {
  registerEvent(params?: { detail?: T }): void;
  registerEventListener(params: {
    eventId?: string;
    listener(event: CustomEvent<T>): void;
  }): void;
  removeEventListener(params?: { eventId?: string }): void;
  setData(params: { values: { [key: string]: any } }): void;
}

/**
 * Name: '@subscriber/selectedSupplier': {[name]: event listener}
 * subscriber:
 * event
 * listener
 */

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

export class Databus<T = { [key: string]: any }> implements DatabusType {
  eventName: string;

  constructor(params: { name: string }) {
    this.eventName = params.name;
  }

  public static checkForEventState = (eventName: string) => {
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
  static eventState: {
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
  static dataState: Record<string, any> = {};

  /**
   * getFormattedEventName is needed to format event names
   */
  static getFormattedEventName = (name: string): string =>
    `@subscriber/${name}`;

  /**
   * addCustomEvent - method for adding a new custom event
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

  public registerBaseEvent = ({
    eventId,
    detail,
    eventBaseName,
  }: RegisterEventParamsType<T> & { eventBaseName: string }) => {
    const newEventName = eventId || eventBaseName;

    // check if exists newEventName
    Databus.checkForEventState(eventBaseName);

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

  private getListenerToRemove = ({
    eventId,
    isListenerCustom,
  }: {
    eventId: string;
    isListenerCustom: boolean;
  }) => {
    const eventsBundle = isListenerCustom
      ? Databus.eventState[this.eventName]
      : Databus.eventState[Databus.getFormattedEventName(this.eventName)];

    const event = eventsBundle ? eventsBundle[eventId] : null;

    return event?.listener;
  };

  /**
   * addEventListener - method for adding a new listener
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
    listener,
    eventBaseName,
  }: {
    eventId?: string;
    listener(event: CustomEvent<T>): void;
    eventBaseName: string;
  }) => {
    const eventId = id || eventBaseName;

    const preparedListener = ({ detail }: CustomEvent) => listener(detail);

    Databus.checkForEventState(eventBaseName);

    const prevData = Databus.eventState[eventBaseName][eventId];

    if (prevData?.listener) {
      console.warn(`Listener ${eventId} was registered earlier`);

      return;
    }

    Databus.eventState[eventBaseName][eventId] = {
      ...prevData,
      listener: preparedListener,
    };

    window.addEventListener(eventId, preparedListener);
  };

  /**
   * removeEventListener - method to remove the listener with
   * the name of the type of the signed event
   */
  public removeEventListener = (params?: { eventId?: string }) => {
    if (!this.eventName) {
      return;
    }

    const isListenerCustom = Boolean(Databus.eventState[this.eventName]);

    const eventsBundleName = isListenerCustom
      ? this.eventName
      : Databus.getFormattedEventName(this.eventName);

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const eventId = params?.eventId || eventsBundleName;

    const listenerToRemove = this.getListenerToRemove({
      eventId,
      isListenerCustom,
    });

    if (!listenerToRemove) {
      console.warn(`Listener ${eventId} was removed earlier`);

      return;
    }

    window.removeEventListener(eventId, listenerToRemove);

    delete Databus.eventState[eventsBundleName][eventId];
  };

  static dispatchEvent = ({
    eventName,
    eventId,
  }: {
    eventName: string;
    eventId?: string;
  }) => {
    const eventsBundle = Databus.eventState[eventName];

    if (eventId) {
      const eventForDispatch = eventsBundle[eventId]?.event;

      if (eventForDispatch) {
        window.dispatchEvent(eventForDispatch);
      }

      return;
    }

    for (const key in eventsBundle) {
      const eventFromState = eventsBundle[key].event;

      if (eventFromState) {
        window.dispatchEvent(eventFromState);
      }
    }
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

  static getData = ({ name }: { name: string }) => Databus.dataState[name];
}
