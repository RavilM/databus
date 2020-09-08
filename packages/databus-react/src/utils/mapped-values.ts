import { Databus } from '@ravilm/databus';
import {
  StateType,
  ObjectType,
  GetDataType,
  StateToPropsMapperType,
} from '../types';

export const mapperValues = <StateToProps extends ObjectType>(
  currentPropValues: StateToPropsMapperType<StateToProps>,
  name: string,
): StateType<StateToProps> =>
  Object.entries(currentPropValues).reduce(
    (
      accumValues: StateType<StateToProps>,
      [key, func]: [string, GetDataType],
    ) => {
      return {
        ...accumValues,
        [key]: func(Databus.dataState[name]),
      };
    },
    {},
  );
