import React from 'react';
export declare function subscriber<T = any>({ getStateToProps, }: {
    getStateToProps: Array<string>;
}): (WrappedComponent: React.ComponentType<T>) => React.ComponentType<T>;
