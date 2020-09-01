var Databus = /** @class */ (function () {
    function Databus(params) {
        var _this = this;
        this.addCustomEvent = function (params) {
            if (!_this.eventName) {
                return;
            }
            Databus.eventState[_this.eventName].event = new CustomEvent(_this.eventName, {
                detail: params && params.detail,
            });
        };
        this.addEventListener = function (_a) {
            var listener = _a.listener;
            if (!_this.eventName) {
                return;
            }
            Databus.eventState[_this.eventName].listener = listener;
            window.addEventListener(_this.eventName, listener);
        };
        this.removeEventListener = function () {
            if (!_this.eventName) {
                return;
            }
            var listenerForRemoving = Databus.eventState[_this.eventName].listener;
            if (listenerForRemoving) {
                window.removeEventListener(_this.eventName, listenerForRemoving);
            }
        };
        this.dispatchEvent = function (params) {
            var eventForDispatch;
            if (params) {
                eventForDispatch = Databus.eventState[params.name].event;
            }
            else if (_this.eventName) {
                eventForDispatch = Databus.eventState[_this.eventName].event;
            }
            if (eventForDispatch) {
                window.dispatchEvent(eventForDispatch);
            }
        };
        this.setData = function (_a) {
            var values = _a.values;
            for (var name_1 in values) {
                Databus.dataState[name_1] = values[name_1];
                _this.dispatchEvent({ name: name_1 });
            }
        };
        if (!params) {
            return;
        }
        var name = params.name;
        if (!Databus.eventState[name]) {
            Databus.eventState[name] = {};
        }
        this.eventName = name;
    }
    Databus.eventState = {};
    Databus.dataState = {};
    return Databus;
}());
export { Databus };
