import React, { ComponentType, PureComponent } from 'react';
import { Databus } from '../databus';

export const subscriber = <T extends any>({
  getStateToProps,
}: {
  getStateToProps: Array<string>;
}) => (WrappedComponent: ComponentType<T>): ComponentType<T> =>
  class extends PureComponent<T> {
    constructor(props: T) {
      super(props);

      this.state = getStateToProps.reduce(
        (accum: { [key: string]: any }, name: string) => {
          new Databus({ name }).addCustomEvent();

          new Databus({ name }).addEventListener({
            listener: () => {
              this.setState({ [name]: Databus.dataState[name] });
            },
          });

          return { ...accum, [name]: Databus.dataState[name] };
        },
        {},
      );
    }

    componentWillUnmount() {
      getStateToProps.forEach((name: string) =>
        new Databus({ name }).removeEventListener(),
      );
    }

    render() {
      return <WrappedComponent {...this.props} {...this.state} />;
    }
  };
