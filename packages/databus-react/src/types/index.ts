export type StateType<StateToProps> = { [key in keyof StateToProps]?: any };

export type ObjectType = { [key: string]: string };

export type GetDataType = (data: any) => any;

export type StateToPropsMapperType<StateToProps> = {
  [key in keyof StateToProps]: GetDataType;
};
