import { Databus } from '@ravilm/databus';
import { StateType, GetDataType, StateToPropsMapperType } from '../types';

export const mapperValues = <StateToProps extends Record<string, string>>(
  currentPropValues: StateToPropsMapperType<StateToProps>,
  name: string,
): StateType<StateToProps> =>
  Object.entries(currentPropValues).reduce(
    (
      accumValues: StateType<StateToProps>,
      [fieldName, selectFunc]: [string, GetDataType],
    ) => {
      const selectedData = Databus.dataState[name];

      return selectedData
        ? {
            ...accumValues,
            [fieldName]: selectFunc(selectedData),
          }
        : accumValues;
    },
    {},
  );
