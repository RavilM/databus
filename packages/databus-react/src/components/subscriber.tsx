import React, { ComponentType, FC, useEffect, useState } from 'react';
import { uniqueId } from 'lodash-es';
import { Databus } from '@ravilm/databus';

type RestStateType<StateType> = { [key in keyof StateType]?: any };
type StateType<StateToProps> = {
  ids: { [key in keyof StateToProps]?: string };
} & RestStateType<StateToProps>;

export const subscriber = <
  StateToProps extends { [key: string]: string },
  OwnProps extends {}
>({
  getStateToProps,
}: {
  getStateToProps: Array<string>;
}) => (
  WrappedComponent: ComponentType<OwnProps>,
): FC<StateToProps & OwnProps> => (props: OwnProps) => {
  const [state, setState] = useState<RestStateType<StateToProps>>({});

  useEffect(() => {
    const data = getStateToProps.reduce(
      (accum: StateType<StateToProps>, name: string) => {
        const databus = new Databus({ name: `@subscriber/${name}` });
        const id = uniqueId(`@subscriber/${name}__`);

        databus.addCustomEvent({ eventId: id });

        databus.addEventListener({
          eventId: id,
          listener: () => {
            setState(prevState => ({
              ...prevState,
              [name]: Databus.dataState[name],
            }));
          },
        });

        return {
          ...accum,
          [name]: Databus.dataState[name],
          ids: { ...accum.ids, [`@subscriber/${name}`]: id },
        };
      },
      {
        ids: {},
      },
    );

    const { ids, ...rest } = data;

    setState(rest as RestStateType<StateToProps>);

    return () =>
      Object.keys(data.ids).forEach((key: string) =>
        new Databus({ name: key }).removeEventListener({
          eventId: data.ids[key],
        }),
      );
  }, []);

  return <WrappedComponent {...props} {...state} />;
};
