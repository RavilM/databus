interface DatabusType<T = { [key: string]: any }> {
  addCustomEvent(params?: { detail?: T }): void;
  addEventListener(params: { listener(event: CustomEvent<T>): void }): void;
  removeEventListener(): void;
  dispatchEvent(): void;
  setData(params: { values: { [key: string]: any } }): void;
}

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
      event?: CustomEvent;
      listener?: (event: CustomEvent) => void;
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
  public addCustomEvent = (params?: { detail?: T }) => {
    if (!this.eventName) {
      return;
    }

    Databus.eventState[this.eventName].event = new CustomEvent<T>(
      this.eventName,
      {
        detail: params && params.detail,
      },
    );
  };

  /**
   * addEventListener - method for adding a new listener
   * @param listener - a function that will be called after receiving
   * a notification with the name of the type of the signed event
   */
  public addEventListener = ({
    listener,
  }: {
    listener(event: CustomEvent<T>): void;
  }) => {
    if (!this.eventName) {
      return;
    }

    Databus.eventState[this.eventName].listener = listener;

    window.addEventListener(this.eventName, listener);
  };

  /**
   * removeEventListener - method to remove the listener with
   * the name of the type of the signed event
   */
  public removeEventListener = () => {
    if (!this.eventName) {
      return;
    }

    const listenerForRemoving = Databus.eventState[this.eventName].listener;

    if (listenerForRemoving) {
      window.removeEventListener(this.eventName, listenerForRemoving);
    }
  };

  /**
   * dispatchEvent - method for calling event
   * @param params - you can set event's name for calling
   * or a name will take from constructor
   */
  public dispatchEvent = (params?: { name: string }) => {
    let eventForDispatch;

    if (params) {
      eventForDispatch = Databus.eventState[params.name].event;
    } else if (this.eventName) {
      eventForDispatch = Databus.eventState[this.eventName].event;
    }

    if (eventForDispatch) {
      window.dispatchEvent(eventForDispatch);
    }
  };

  /**
   * setData - method for setting new data to dataState
   * @param values
   */
  public setData = ({ values }: { values: { [key: string]: any } }) => {
    for (const name in values) {
      Databus.dataState[name] = values[name];

      this.dispatchEvent({ name });
    }
  };
}
