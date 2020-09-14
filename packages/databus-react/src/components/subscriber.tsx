import React, { ComponentType, FC, useEffect, useState } from 'react';
import { uniqueId } from 'lodash-es';
import { Databus } from '@ravilm/databus';
import { mapperValues } from '../utils/mapped-values';
import {  StateType, StateToPropsMapperType } from '../types';

type AccumType<StateToProps> = {
  ids: { [key in keyof StateToProps]?: string };
} & StateType<StateToProps>;

type getStateToPropsType<StateToProps> = {
  [key: string]: StateToPropsMapperType<StateToProps>;
};

type PropsType<StateToProps> = {
  getStateToProps: getStateToPropsType<StateToProps>;
}

// todo rename
export const Subscriber = <
  StateToProps extends Record<string,string>,
  OwnProps extends Record<string,string>
>({
  getStateToProps,
}: PropsType<StateToProps>) => (
  WrappedComponent: ComponentType<OwnProps>,
): FC<StateToProps & OwnProps> => (props: OwnProps) => {
  const [state, setState] = useState<StateType<StateToProps>>({});

  useEffect(() => {
    const data = Object.keys(getStateToProps).reduce(
      (accum: AccumType<StateToProps>, name: string) => {
        const currentPropValues = getStateToProps[name];
        const databus = new Databus({ name: `@subscriber/${name}` });
        const id = uniqueId(`@subscriber/${name}__`);

        databus.addCustomEvent({ eventId: id });

        databus.addEventListener({
          eventId: id,
          listener: () => {
            setState(prevState => ({
              ...prevState,
              ...mapperValues(currentPropValues, name),
            }));
          },
        });

        return {
          ...accum,
          ...mapperValues(currentPropValues, name),
          ids: { ...accum.ids, [`@subscriber/${name}`]: id },
        };
      },
      {
        ids: {},
      },
    );

    const { ids, ...rest } = data;

    setState(prevState => ({
      ...prevState,
      ...rest,
    }));

    return () =>
      Object.keys(data.ids).forEach((key: string) =>
        new Databus({ name: key }).removeEventListener({
          eventId: data.ids[key],
        }),
      );
  }, []);

  return <WrappedComponent {...props} {...state} />;
};
