(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SRPClient = factory());
})(this, (function () { 'use strict';

    var SRPClient = /** @class */ (function () {
        function SRPClient() {
        }
        return SRPClient;
    }());

    return SRPClient;

}));
//# sourceMappingURL=client.js.map
