var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { PureComponent } from 'react';
import { Databus } from '../databus';
export function subscriber(_a) {
    var getStateToProps = _a.getStateToProps;
    return function (WrappedComponent) {
        return /** @class */ (function (_super) {
            __extends(class_1, _super);
            function class_1(props) {
                var _this = this;
                console.log('lkfanlkfmdalkfmldaskmflksamd ');
                _this = _super.call(this, props) || this;
                _this.state = getStateToProps.reduce(function (accum, name) {
                    var _a;
                    new Databus({ name: name }).addCustomEvent();
                    new Databus({ name: name }).addEventListener({
                        listener: function () {
                            var _a;
                            _this.setState((_a = {}, _a[name] = Databus.dataState[name], _a));
                        },
                    });
                    return __assign(__assign({}, accum), (_a = {}, _a[name] = Databus.dataState[name], _a));
                }, {});
                return _this;
            }
            class_1.prototype.componentWillUnmount = function () {
                getStateToProps.forEach(function (name) {
                    console.log('componentWillUnmount ', name);
                    new Databus({ name: name }).removeEventListener();
                });
            };
            class_1.prototype.render = function () {
                return React.createElement(WrappedComponent, __assign({}, this.props, this.state));
            };
            return class_1;
        }(PureComponent));
    };
}
