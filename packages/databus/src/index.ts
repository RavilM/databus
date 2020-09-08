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

    const { name } = params;

    if (!Databus.eventState[name]) {
      Databus.eventState[name] = {};
    }

    this.eventName = name;
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
   * addCustomEvent - method for adding a new custom event
   * @param params - an object that stores the field "detail"
   * "detail" is an event-dependent value associated with this event
   */
  public addCustomEvent = (params?: { eventId?: string; detail?: T }) => {
    if (!this.eventName) {
      return;
    }

    const newEventName = params?.eventId || this.eventName;

    const prevData = Databus.eventState[this.eventName][newEventName] || {};

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

    const prevData = Databus.eventState[this.eventName][listenerName] || {};

    Databus.eventState[this.eventName][listenerName] = {
      ...prevData,
      listener,
    };

    window.addEventListener(listenerName, listener);
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

    const eventForDispatch =
      Databus.eventState[this.eventName][params?.eventId || this.eventName]
        .event;

    if (eventForDispatch) {
      window.dispatchEvent(eventForDispatch);
    }
  };

  static dispatchEvent = ({
    name,
    eventId,
  }: {
    name: string;
    eventId?: string;
  }) => {
    if (eventId) {
      const eventForDispatch = Databus.eventState[name][eventId]?.event;

      if (eventForDispatch) {
        window.dispatchEvent(eventForDispatch);
      }

      return;
    }

    const eventsFromState = Databus.eventState[name];

    for (const key in eventsFromState) {
      const eventForDispatch = eventsFromState[key].event;

      if (eventForDispatch) {
        window.dispatchEvent(eventForDispatch);
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

      const nameEvents = `@subscriber/${name}`;
      const events = Databus.eventState[nameEvents];

      if (events) {
        for (const key in events) {
          const event = events[key].event;

          if (event) {
            Databus.dispatchEvent({ name: nameEvents, eventId: key });
          }
        }
      }
    }
  };

  public getData = (params?: { name: string }) => {
    if (params) {
      return Databus.dataState[params.name];
    }

    if (this.eventName) {
      return Databus.dataState[this.eventName];
    }
  };
}
