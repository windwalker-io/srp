(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.SRP = {}));
})(this, (function (exports) { 'use strict';

    var SRPClient = /** @class */ (function () {
        function SRPClient() {
        }
        return SRPClient;
    }());

    var SRPServer = /** @class */ (function () {
        function SRPServer() {
        }
        return SRPServer;
    }());

    exports.SRPClient = SRPClient;
    exports.SRPServer = SRPServer;

}));
//# sourceMappingURL=srp.js.map
