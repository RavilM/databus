interface DatabusType<T = { [key: string]: any }> {
  addCustomEvent(params?: { detail?: T }): void;
  addEventListener(params: {
    eventId?: string;
    listener(event: CustomEvent<T>): void;
  }): void;
  removeEventListener(params?: { eventId?: string }): void;
  dispatchEvent(params?: { eventId?: string }): void;
  setData(params: { values: { [key: string]: any } }): void;
}

/**
 * Name: '@subscriber/selectedSupplier': {[name]: event listener}
 * subscriber:
 * event
 * listener
 */

export class Databus<T = { [key: string]: any }> implements DatabusType {
  private eventName?: string;

  constructor(params?: { name: string }) {
    if (!params) {
      return;
    }

    const formattedEventName = Databus.getFormattedEventName(params.name);

    if (!Databus.eventState[formattedEventName]) {
      Databus.eventState[formattedEventName] = {};
    }

    this.eventName = formattedEventName;
  }

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
  static dataState: { [key: string]: any } = {};

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
  public addCustomEvent = (params?: { eventId?: string; detail?: T }) => {
    if (!this.eventName) {
      return;
    }

    const newEventName = params?.eventId || this.eventName;

    const prevData = Databus.eventState[this.eventName][newEventName];

    Databus.eventState[this.eventName][newEventName] = {
      ...prevData,
      event: new CustomEvent<T>(newEventName, {
        detail: params && params.detail,
      }),
    };
  };

  /**
   * addEventListener - method for adding a new listener
   * @param eventId
   * @param listener - a function that will be called after receiving
   * a notification with the name of the type of the signed event
   */
  public addEventListener = ({
    eventId,
    listener,
  }: {
    eventId?: string;
    listener(event: CustomEvent<T>): void;
  }) => {
    if (!this.eventName) {
      return;
    }

    const listenerName = eventId || this.eventName;
    const preparedListener = ({ detail }: CustomEvent) => listener(detail);

    const prevData = Databus.eventState[this.eventName][listenerName];

    Databus.eventState[this.eventName][listenerName] = {
      ...prevData,
      listener: preparedListener,
    };

    window.addEventListener(listenerName, preparedListener);
  };

  /**
   * removeEventListener - method to remove the listener with
   * the name of the type of the signed event
   */
  public removeEventListener = (params?: { eventId?: string }) => {
    if (!this.eventName) {
      return;
    }

    const listenerName = params?.eventId || this.eventName;

    const listenerForRemoving =
      Databus.eventState[this.eventName][listenerName].listener;

    if (listenerForRemoving) {
      window.removeEventListener(listenerName, listenerForRemoving);

      delete Databus.eventState[this.eventName][listenerName];
    }
  };

  /**
   * dispatchEvent - method for calling event
   * @param params - you can set event's name for calling
   * or a name will take from constructor
   */
  public dispatchEvent = (params?: { eventId?: string }) => {
    if (!this.eventName) {
      return;
    }

    const eventName = params?.eventId || this.eventName;

    const eventForDispatch =
      Databus.eventState[this.eventName][eventName].event;

    if (eventForDispatch) {
      window.dispatchEvent(eventForDispatch);
    }
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
  public setData = ({ values }: { values: { [key: string]: any } }) => {
    for (const name in values) {
      Databus.dataState[name] = values[name];

      const eventsBundleName = Databus.getFormattedEventName(name);
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

  public getData = (params?: { name: string }) => {
    const dataStateName = params?.name || this.eventName;

    if (dataStateName) {
      return Databus.dataState[dataStateName];
    }
  };
}
