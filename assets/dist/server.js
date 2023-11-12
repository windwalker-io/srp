(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.SRPServer = factory());
})(this, (function () { 'use strict';

    var SRPServer = /** @class */ (function () {
        function SRPServer() {
        }
        return SRPServer;
    }());

    return SRPServer;

}));
//# sourceMappingURL=server.js.map
