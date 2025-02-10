"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
var Emittery = require("emittery");
var styler = require("stylefire");
var shallowequal = require("shallowequal");
var sideEffectManager = require("side-effect-manager");
var valueEnhancer = require("value-enhancer");
var resizeObserver = require("@juggle/resize-observer");
function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { "default": e };
}
var Emittery__default = /* @__PURE__ */ _interopDefaultLegacy(Emittery);
var styler__default = /* @__PURE__ */ _interopDefaultLegacy(styler);
var shallowequal__default = /* @__PURE__ */ _interopDefaultLegacy(shallowequal);
var style$4 = /* @__PURE__ */ (() => '.tele-fancy-scrollbar {\n  overscroll-behavior: contain;\n  overflow: auto;\n  overflow-y: scroll;\n  overflow-y: overlay;\n  -webkit-overflow-scrolling: touch;\n  -ms-overflow-style: -ms-autohiding-scrollbar;\n  scrollbar-width: auto;\n}\n.tele-fancy-scrollbar::-webkit-scrollbar {\n  height: 8px;\n  width: 8px;\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-track {\n  background-color: transparent;\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-thumb {\n  background-color: rgba(68, 78, 96, 0.1);\n  background-color: transparent;\n  border-radius: 4px;\n  transition: background-color 0.4s;\n}\n.tele-fancy-scrollbar:hover::-webkit-scrollbar-thumb {\n  background-color: rgba(68, 78, 96, 0.1);\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-thumb:hover {\n  background-color: rgba(68, 78, 96, 0.2);\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-thumb:active {\n  background-color: rgba(68, 78, 96, 0.2);\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-thumb:vertical {\n  min-height: 50px;\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-thumb:horizontal {\n  min-width: 50px;\n}\n.telebox-quarantine {\n  all: initial;\n  position: relative;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n}\n.telebox-body-wrap {\n  color: #191919;\n  color: var(--tele-boxColor, #191919);\n  flex: 1;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  position: relative;\n}\n.telebox-content {\n  width: 100%;\n  height: 100%;\n  position: relative;\n  background-color: #f5f5fc;\n  background-color: var(--tele-boxContainerBackground, #f5f5fc);\n}\n.telebox-box-stage {\n  position: absolute;\n  z-index: 1;\n  overflow: hidden;\n  background-color: #fff;\n  background-color: var(--tele-boxStageBackground, #fff);\n  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.08);\n  box-shadow: var(--tele-boxStageShadow, 0px 0px 16px rgba(0, 0, 0, 0.08));\n}\n.telebox-footer-wrap {\n  flex-shrink: 0;\n  display: flex;\n  flex-direction: column;\n  color: #191919;\n  color: var(--tele-boxFooterColor, #191919);\n  background-color: #fff;\n  background-color: var(--tele-boxFooterBackground, #fff);\n}\n.telebox-footer-wrap::before {\n  content: "";\n  display: block;\n  flex: 1;\n}\n.telebox-color-scheme-dark {\n  color-scheme: dark;\n}\n.telebox-color-scheme-dark .telebox-body-wrap {\n  color: #e9e9e9;\n  color: var(--tele-boxColor, #e9e9e9);\n}\n.telebox-color-scheme-dark .telebox-content {\n  background-color: #25282e;\n  background-color: var(--tele-boxContainerBackground, #25282e);\n}\n.telebox-color-scheme-dark .telebox-box-stage {\n  background-color: #272a30;\n  background-color: var(--tele-boxStageBackground, #272a30);\n  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.24);\n  box-shadow: var(--tele-boxStageShadow, 0px 0px 16px rgba(0, 0, 0, 0.24));\n}\n.telebox-color-scheme-dark .telebox-footer-wrap {\n  color: #e9e9e9;\n  color: var(--tele-boxFooterColor, #e9e9e9);\n  background-color: #383b42;\n  background-color: var(--tele-boxFooterBackground, #383b42);\n}\n.telebox-box {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 100;\n  transition: width 0.4s cubic-bezier(0.4, 0.9, 0.71, 1.02), height 0.4s cubic-bezier(0.55, 0.82, 0.63, 0.95), opacity 0.6s cubic-bezier(0.7, 0, 0.84, 0), transform 0.4s ease;\n}\n.telebox-box-main {\n  border: 1px solid #DFE0ED;\n  border: var(--tele-boxBorder, 1px solid #DFE0ED);\n  box-shadow: 6px 4px 25px 0px rgba(32, 35, 56, 0.2);\n  box-shadow: var(--tele-boxShadow, 6px 4px 25px 0px rgba(32, 35, 56, 0.2));\n  position: relative;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  border-radius: 8px;\n}\n.telebox-titlebar-wrap {\n  flex-shrink: 0;\n  position: relative;\n  z-index: 1;\n}\n.telebox-main {\n  position: relative;\n  flex: 1;\n  width: 100%;\n  overflow: hidden;\n}\n.telebox-quarantine-outer {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n.telebox-resize-handle {\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  position: absolute;\n  z-index: 2147483647;\n  touch-action: none;\n}\n.telebox-n {\n  width: 100%;\n  height: 5px;\n  left: 0;\n  top: -5px;\n  cursor: n-resize;\n}\n.telebox-s {\n  width: 100%;\n  height: 5px;\n  left: 0;\n  bottom: -5px;\n  cursor: s-resize;\n}\n.telebox-w {\n  width: 5px;\n  height: 100%;\n  left: -5px;\n  top: 0;\n  cursor: w-resize;\n}\n.telebox-e {\n  width: 5px;\n  height: 100%;\n  right: -5px;\n  top: 0;\n  cursor: e-resize;\n}\n.telebox-nw {\n  width: 15px;\n  height: 15px;\n  top: -5px;\n  left: -5px;\n  cursor: nw-resize;\n}\n.telebox-ne {\n  width: 15px;\n  height: 15px;\n  top: -5px;\n  right: -5px;\n  cursor: ne-resize;\n}\n.telebox-se {\n  width: 15px;\n  height: 15px;\n  bottom: -5px;\n  right: -5px;\n  cursor: se-resize;\n}\n.telebox-sw {\n  width: 15px;\n  height: 15px;\n  bottom: -5px;\n  left: -5px;\n  cursor: sw-resize;\n}\n.telebox-track-mask {\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 2147483647;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.0001);\n  cursor: move;\n}\n.telebox-cursor-n {\n  cursor: n-resize;\n}\n.telebox-cursor-s {\n  cursor: s-resize;\n}\n.telebox-cursor-w {\n  cursor: w-resize;\n}\n.telebox-cursor-e {\n  cursor: e-resize;\n}\n.telebox-cursor-nw {\n  cursor: nw-resize;\n}\n.telebox-cursor-ne {\n  cursor: ne-resize;\n}\n.telebox-cursor-se {\n  cursor: se-resize;\n}\n.telebox-cursor-sw {\n  cursor: sw-resize;\n}\n.telebox-maximized .telebox-resize-handles,\n.telebox-no-resize .telebox-resize-handles {\n  display: none;\n}\n.telebox-maximized {\n  box-shadow: none;\n  transition: none;\n}\n.telebox-minimized {\n  transition: width 0.05s cubic-bezier(0.4, 0.9, 0.71, 1.02), height 0.05s cubic-bezier(0.55, 0.82, 0.63, 0.95), opacity 0.6s cubic-bezier(0.7, 0, 0.84, 0), transform 0.6s ease;\n  opacity: 0;\n  pointer-events: none;\n  user-select: none;\n}\n.telebox-transforming {\n  will-change: transform;\n  transition: opacity 0.6s cubic-bezier(0.7, 0, 0.84, 0);\n}\n.telebox-readonly .telebox-resize-handle {\n  cursor: initial !important;\n  pointer-events: none !important;\n}\n.telebox-color-scheme-dark {\n  color-scheme: dark;\n}\n.telebox-color-scheme-dark .telebox-box-main {\n  border: 1px solid #383b42;\n  border: var(--tele-boxBorder, 1px solid #383b42);\n  box-shadow: 0px 4px 10px 0px rgba(56, 59, 66, 0.15);\n  box-shadow: var(--tele-boxShadow, 0px 4px 10px 0px rgba(56, 59, 66, 0.15));\n}')();
var shadowStyles = /* @__PURE__ */ (() => '.tele-fancy-scrollbar {\n  overscroll-behavior: contain;\n  overflow: auto;\n  overflow-y: scroll;\n  overflow-y: overlay;\n  -webkit-overflow-scrolling: touch;\n  -ms-overflow-style: -ms-autohiding-scrollbar;\n  scrollbar-width: auto;\n}\n.tele-fancy-scrollbar::-webkit-scrollbar {\n  height: 8px;\n  width: 8px;\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-track {\n  background-color: transparent;\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-thumb {\n  background-color: rgba(68, 78, 96, 0.1);\n  background-color: transparent;\n  border-radius: 4px;\n  transition: background-color 0.4s;\n}\n.tele-fancy-scrollbar:hover::-webkit-scrollbar-thumb {\n  background-color: rgba(68, 78, 96, 0.1);\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-thumb:hover {\n  background-color: rgba(68, 78, 96, 0.2);\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-thumb:active {\n  background-color: rgba(68, 78, 96, 0.2);\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-thumb:vertical {\n  min-height: 50px;\n}\n.tele-fancy-scrollbar::-webkit-scrollbar-thumb:horizontal {\n  min-width: 50px;\n}\n.telebox-quarantine {\n  all: initial;\n  position: relative;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n}\n.telebox-body-wrap {\n  color: #191919;\n  color: var(--tele-boxColor, #191919);\n  flex: 1;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  position: relative;\n}\n.telebox-content {\n  width: 100%;\n  height: 100%;\n  position: relative;\n  background-color: #f5f5fc;\n  background-color: var(--tele-boxContainerBackground, #f5f5fc);\n}\n.telebox-box-stage {\n  position: absolute;\n  z-index: 1;\n  overflow: hidden;\n  background-color: #fff;\n  background-color: var(--tele-boxStageBackground, #fff);\n  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.08);\n  box-shadow: var(--tele-boxStageShadow, 0px 0px 16px rgba(0, 0, 0, 0.08));\n}\n.telebox-footer-wrap {\n  flex-shrink: 0;\n  display: flex;\n  flex-direction: column;\n  color: #191919;\n  color: var(--tele-boxFooterColor, #191919);\n  background-color: #fff;\n  background-color: var(--tele-boxFooterBackground, #fff);\n}\n.telebox-footer-wrap::before {\n  content: "";\n  display: block;\n  flex: 1;\n}\n.telebox-color-scheme-dark {\n  color-scheme: dark;\n}\n.telebox-color-scheme-dark .telebox-body-wrap {\n  color: #e9e9e9;\n  color: var(--tele-boxColor, #e9e9e9);\n}\n.telebox-color-scheme-dark .telebox-content {\n  background-color: #25282e;\n  background-color: var(--tele-boxContainerBackground, #25282e);\n}\n.telebox-color-scheme-dark .telebox-box-stage {\n  background-color: #272a30;\n  background-color: var(--tele-boxStageBackground, #272a30);\n  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.24);\n  box-shadow: var(--tele-boxStageShadow, 0px 0px 16px rgba(0, 0, 0, 0.24));\n}\n.telebox-color-scheme-dark .telebox-footer-wrap {\n  color: #e9e9e9;\n  color: var(--tele-boxFooterColor, #e9e9e9);\n  background-color: #383b42;\n  background-color: var(--tele-boxFooterBackground, #383b42);\n}')();
var style$3 = /* @__PURE__ */ (() => '.telebox-titlebar {\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  box-sizing: border-box;\n  height: 40px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  user-select: none;\n  touch-action: manipulation;\n  color: #484C70;\n  color: var(--tele-titlebarColor, #484C70);\n  background-color: #EBECFA;\n  background-color: var(--tele-titlebarBackground, #EBECFA);\n  border-bottom: 0px solid #eeeef7;\n  border-bottom: var(--tele-titlebarBorderBottom, 0px solid #eeeef7);\n}\n\n.telebox-title-area {\n  padding-left: 16px;\n  overflow: hidden;\n  position: relative;\n  height: 100%;\n  flex: 1;\n  display: flex;\n  align-items: center;\n}\n\n.telebox-title {\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  color: #484C70;\n  color: var(--tele-titlebarColor, #484C70);\n  overflow: hidden;\n  margin: 0;\n  padding: 0;\n  font-size: 14px;\n  font-weight: 400;\n  font-family: PingFangSC-Regular, PingFang SC;\n  white-space: nowrap;\n  word-break: keep-all;\n  text-overflow: ellipsis;\n  flex: 1;\n}\n\n.telebox-drag-area {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  margin: auto;\n  z-index: 10;\n  touch-action: none;\n}\n\n.telebox-titlebar-btns {\n  padding-right: 16px;\n  white-space: nowrap;\n  word-break: keep-all;\n  margin-left: auto;\n  font-size: 0;\n  z-index: 11;\n}\n\n.telebox-titlebar-btn {\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  width: 22px;\n  height: 22px;\n  padding: 0;\n  outline: none;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n}\n\n.telebox-titlebar-btn ~ .telebox-titlebar-btn {\n  margin-left: 10px;\n}\n\n.telebox-titlebar-btn-icon {\n  width: 24px;\n  height: 24px;\n}\n\n.telebox-readonly .telebox-titlebar-btn {\n  cursor: not-allowed;\n}\n\n.telebox-titlebar-icon-minimize {\n  background: center/cover no-repeat;\n  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNGNUY1RkMiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik02LjA1MDI1IDEyQzYuMDUwMjUgMTEuNDQ3NyA2LjQ5Nzk3IDExIDcuMDUwMjUgMTFMMTYuOTQ5NyAxMUMxNy41MDIgMTEgMTcuOTQ5NyAxMS40NDc3IDE3Ljk0OTcgMTJDMTcuOTQ5NyAxMi41NTIzIDE3LjUwMiAxMyAxNi45NDk3IDEzTDcuMDUwMjUgMTNDNi40OTc5NyAxMyA2LjA1MDI1IDEyLjU1MjMgNi4wNTAyNSAxMloiIGZpbGw9IiM4RDhGQTYiLz4KPC9zdmc+Cg==");\n  background-image: var(--tele-titlebarIconMinimize, url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNGNUY1RkMiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik02LjA1MDI1IDEyQzYuMDUwMjUgMTEuNDQ3NyA2LjQ5Nzk3IDExIDcuMDUwMjUgMTFMMTYuOTQ5NyAxMUMxNy41MDIgMTEgMTcuOTQ5NyAxMS40NDc3IDE3Ljk0OTcgMTJDMTcuOTQ5NyAxMi41NTIzIDE3LjUwMiAxMyAxNi45NDk3IDEzTDcuMDUwMjUgMTNDNi40OTc5NyAxMyA2LjA1MDI1IDEyLjU1MjMgNi4wNTAyNSAxMloiIGZpbGw9IiM4RDhGQTYiLz4KPC9zdmc+Cg=="));\n}\n\n.telebox-titlebar-icon-maximize {\n  background: center/cover no-repeat;\n  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNGNUY1RkMiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzExNTMzXzI4Mjg4MykiPgo8cGF0aCBkPSJNMTcuNzUgNS43NUgxMy40ODQ0QzEzLjAzOTEgNS43NSAxMi44MTU2IDYuMjg3NSAxMy4xMjk3IDYuNjAzMTJMMTQuODUzMSA4LjMzMTI1TDEyLjY5MDYgMTAuNDg3NUMxMi40NjcyIDEwLjcwOTQgMTIuNDY3MiAxMS4wNzAzIDEyLjY4OTEgMTEuMjkzOEMxMi45MTA5IDExLjUxNzIgMTMuMjcxOSAxMS41MTcyIDEzLjQ5NTMgMTEuMjk1M0wxNS42NTc4IDkuMTM5MDZMMTcuMzgxMyAxMC44NjcyQzE3LjY5NTMgMTEuMTgyOCAxOC4yMzQ0IDEwLjk2MDkgMTguMjM1OSAxMC41MTU2TDE4LjI0ODQgNi4yNUMxOC4yNTE2IDUuOTc1IDE4LjAyNjYgNS43NSAxNy43NSA1Ljc1Wk0xMC41MDMxIDEyLjcwMzFMOC4zNDA2MyAxNC44NTk0TDYuNjE3MiAxMy4xMzEyQzYuMzAzMTMgMTIuODE1NiA1Ljc2NDA3IDEzLjAzNzUgNS43NjI1MSAxMy40ODI4TDUuNzUwMDEgMTcuNzQ4NEM1Ljc0ODQ1IDE4LjAyNSA1Ljk3MzQ1IDE4LjI1IDYuMjUwMDEgMTguMjVIMTAuNTE1NkMxMC45NjA5IDE4LjI1IDExLjE4NDQgMTcuNzEyNSAxMC44NzAzIDE3LjM5NjlMOS4xNDUzMiAxNS42NjcyTDExLjMwNzggMTMuNTEwOUMxMS41MzEzIDEzLjI4OTEgMTEuNTMxMyAxMi45MjgxIDExLjMwOTQgMTIuNzA0N0MxMS4wODc1IDEyLjQ4MTMgMTAuNzI2NiAxMi40ODEzIDEwLjUwMzEgMTIuNzAzMVoiIGZpbGw9IiM4RDhGQTYiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMTUzM18yODI4ODMiPgo8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1IDUpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==");\n  background-image: var(--tele-titlebarIconMaximize, url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNGNUY1RkMiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzExNTMzXzI4Mjg4MykiPgo8cGF0aCBkPSJNMTcuNzUgNS43NUgxMy40ODQ0QzEzLjAzOTEgNS43NSAxMi44MTU2IDYuMjg3NSAxMy4xMjk3IDYuNjAzMTJMMTQuODUzMSA4LjMzMTI1TDEyLjY5MDYgMTAuNDg3NUMxMi40NjcyIDEwLjcwOTQgMTIuNDY3MiAxMS4wNzAzIDEyLjY4OTEgMTEuMjkzOEMxMi45MTA5IDExLjUxNzIgMTMuMjcxOSAxMS41MTcyIDEzLjQ5NTMgMTEuMjk1M0wxNS42NTc4IDkuMTM5MDZMMTcuMzgxMyAxMC44NjcyQzE3LjY5NTMgMTEuMTgyOCAxOC4yMzQ0IDEwLjk2MDkgMTguMjM1OSAxMC41MTU2TDE4LjI0ODQgNi4yNUMxOC4yNTE2IDUuOTc1IDE4LjAyNjYgNS43NSAxNy43NSA1Ljc1Wk0xMC41MDMxIDEyLjcwMzFMOC4zNDA2MyAxNC44NTk0TDYuNjE3MiAxMy4xMzEyQzYuMzAzMTMgMTIuODE1NiA1Ljc2NDA3IDEzLjAzNzUgNS43NjI1MSAxMy40ODI4TDUuNzUwMDEgMTcuNzQ4NEM1Ljc0ODQ1IDE4LjAyNSA1Ljk3MzQ1IDE4LjI1IDYuMjUwMDEgMTguMjVIMTAuNTE1NkMxMC45NjA5IDE4LjI1IDExLjE4NDQgMTcuNzEyNSAxMC44NzAzIDE3LjM5NjlMOS4xNDUzMiAxNS42NjcyTDExLjMwNzggMTMuNTEwOUMxMS41MzEzIDEzLjI4OTEgMTEuNTMxMyAxMi45MjgxIDExLjMwOTQgMTIuNzA0N0MxMS4wODc1IDEyLjQ4MTMgMTAuNzI2NiAxMi40ODEzIDEwLjUwMzEgMTIuNzAzMVoiIGZpbGw9IiM4RDhGQTYiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMTUzM18yODI4ODMiPgo8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1IDUpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="));\n}\n\n.telebox-titlebar-icon-maximize.is-active {\n  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNGNUY1RkMiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzMxNV80NzQwOTQpIj4KPHBhdGggZD0iTTEwLjk3NzEgMTIuNTM3M0g2LjcxMTUyQzYuMjY2MjEgMTIuNTM3MyA2LjA0Mjc3IDEzLjA3NDggNi4zNTY4NCAxMy4zOTA0TDguMDgwMjcgMTUuMTE4Nkw1LjkxNzc3IDE3LjI3NDhDNS42OTQzNCAxNy40OTY3IDUuNjk0MzQgMTcuODU3NiA1LjkxNjIxIDE4LjA4MTFDNi4xMzgwOSAxOC4zMDQ1IDYuNDk5MDIgMTguMzA0NSA2LjcyMjQ2IDE4LjA4MjZMOC44ODQ5NiAxNS45MjY0TDEwLjYwODQgMTcuNjU0NUMxMC45MjI1IDE3Ljk3MDEgMTEuNDYxNSAxNy43NDgyIDExLjQ2MzEgMTcuMzAyOUwxMS40NzU2IDEzLjAzNzNDMTEuNDc3MSAxMi43NjIzIDExLjI1MzcgMTIuNTM3MyAxMC45NzcxIDEyLjUzNzNaTTE3LjI3NzEgNS45MTU0M0wxNS4xMTQ2IDguMDcxNjhMMTMuMzkxMiA2LjM0MzU2QzEzLjA3NzEgNi4wMjc5MyAxMi41MzgxIDYuMjQ5ODEgMTIuNTM2NSA2LjY5NTEyTDEyLjUyNCAxMC45NjA3QzEyLjUyMjUgMTEuMjM3MyAxMi43NDc1IDExLjQ2MjMgMTMuMDI0IDExLjQ2MjNIMTcuMjg5NkMxNy43MzUgMTEuNDYyMyAxNy45NTg0IDEwLjkyNDggMTcuNjQ0MyAxMC42MDkyTDE1LjkxOTMgOC44ODEwNkwxOC4wODE4IDYuNzI0ODFDMTguMzA1MyA2LjUwMjkzIDE4LjMwNTMgNi4xNDIgMTguMDgzNCA1LjkxODU2QzE3Ljg2MTUgNS42OTUxMiAxNy41MDA2IDUuNjkzNTYgMTcuMjc3MSA1LjkxNTQzWiIgZmlsbD0iIzhEOEZBNiIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzMxNV80NzQwOTQiPgo8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1IDUpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==");\n  background-image: var(--tele-titlebarIconMaximizeActive, url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNGNUY1RkMiLz4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzMxNV80NzQwOTQpIj4KPHBhdGggZD0iTTEwLjk3NzEgMTIuNTM3M0g2LjcxMTUyQzYuMjY2MjEgMTIuNTM3MyA2LjA0Mjc3IDEzLjA3NDggNi4zNTY4NCAxMy4zOTA0TDguMDgwMjcgMTUuMTE4Nkw1LjkxNzc3IDE3LjI3NDhDNS42OTQzNCAxNy40OTY3IDUuNjk0MzQgMTcuODU3NiA1LjkxNjIxIDE4LjA4MTFDNi4xMzgwOSAxOC4zMDQ1IDYuNDk5MDIgMTguMzA0NSA2LjcyMjQ2IDE4LjA4MjZMOC44ODQ5NiAxNS45MjY0TDEwLjYwODQgMTcuNjU0NUMxMC45MjI1IDE3Ljk3MDEgMTEuNDYxNSAxNy43NDgyIDExLjQ2MzEgMTcuMzAyOUwxMS40NzU2IDEzLjAzNzNDMTEuNDc3MSAxMi43NjIzIDExLjI1MzcgMTIuNTM3MyAxMC45NzcxIDEyLjUzNzNaTTE3LjI3NzEgNS45MTU0M0wxNS4xMTQ2IDguMDcxNjhMMTMuMzkxMiA2LjM0MzU2QzEzLjA3NzEgNi4wMjc5MyAxMi41MzgxIDYuMjQ5ODEgMTIuNTM2NSA2LjY5NTEyTDEyLjUyNCAxMC45NjA3QzEyLjUyMjUgMTEuMjM3MyAxMi43NDc1IDExLjQ2MjMgMTMuMDI0IDExLjQ2MjNIMTcuMjg5NkMxNy43MzUgMTEuNDYyMyAxNy45NTg0IDEwLjkyNDggMTcuNjQ0MyAxMC42MDkyTDE1LjkxOTMgOC44ODEwNkwxOC4wODE4IDYuNzI0ODFDMTguMzA1MyA2LjUwMjkzIDE4LjMwNTMgNi4xNDIgMTguMDgzNCA1LjkxODU2QzE3Ljg2MTUgNS42OTUxMiAxNy41MDA2IDUuNjkzNTYgMTcuMjc3MSA1LjkxNTQzWiIgZmlsbD0iIzhEOEZBNiIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzMxNV80NzQwOTQiPgo8cmVjdCB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1IDUpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="));\n}\n\n.telebox-titlebar-icon-close {\n  background: center/cover no-repeat;\n  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNGNUY1RkMiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNi4yMDcxIDkuMjA3MTFDMTYuNTk3NiA4LjgxNjU4IDE2LjU5NzYgOC4xODM0MiAxNi4yMDcxIDcuNzkyODlDMTUuODE2NiA3LjQwMjM3IDE1LjE4MzQgNy40MDIzNyAxNC43OTI5IDcuNzkyODlMMTIgMTAuNTg1OEw5LjIwNzExIDcuNzkyODlDOC44MTY1OCA3LjQwMjM3IDguMTgzNDIgNy40MDIzNyA3Ljc5Mjg5IDcuNzkyODlDNy40MDIzNyA4LjE4MzQyIDcuNDAyMzcgOC44MTY1OCA3Ljc5Mjg5IDkuMjA3MTFMMTAuNTg1OCAxMkw3Ljc5Mjg5IDE0Ljc5MjlDNy40MDIzNyAxNS4xODM0IDcuNDAyMzcgMTUuODE2NiA3Ljc5Mjg5IDE2LjIwNzFDOC4xODM0MiAxNi41OTc2IDguODE2NTggMTYuNTk3NiA5LjIwNzExIDE2LjIwNzFMMTIgMTMuNDE0MkwxNC43OTI5IDE2LjIwNzFDMTUuMTgzNCAxNi41OTc2IDE1LjgxNjYgMTYuNTk3NiAxNi4yMDcxIDE2LjIwNzFDMTYuNTk3NiAxNS44MTY2IDE2LjU5NzYgMTUuMTgzNCAxNi4yMDcxIDE0Ljc5MjlMMTMuNDE0MiAxMkwxNi4yMDcxIDkuMjA3MTFaIiBmaWxsPSIjOEQ4RkE2Ii8+Cjwvc3ZnPgo=");\n  background-image: var(--tele-titlebarIconClose, url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiNGNUY1RkMiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNi4yMDcxIDkuMjA3MTFDMTYuNTk3NiA4LjgxNjU4IDE2LjU5NzYgOC4xODM0MiAxNi4yMDcxIDcuNzkyODlDMTUuODE2NiA3LjQwMjM3IDE1LjE4MzQgNy40MDIzNyAxNC43OTI5IDcuNzkyODlMMTIgMTAuNTg1OEw5LjIwNzExIDcuNzkyODlDOC44MTY1OCA3LjQwMjM3IDguMTgzNDIgNy40MDIzNyA3Ljc5Mjg5IDcuNzkyODlDNy40MDIzNyA4LjE4MzQyIDcuNDAyMzcgOC44MTY1OCA3Ljc5Mjg5IDkuMjA3MTFMMTAuNTg1OCAxMkw3Ljc5Mjg5IDE0Ljc5MjlDNy40MDIzNyAxNS4xODM0IDcuNDAyMzcgMTUuODE2NiA3Ljc5Mjg5IDE2LjIwNzFDOC4xODM0MiAxNi41OTc2IDguODE2NTggMTYuNTk3NiA5LjIwNzExIDE2LjIwNzFMMTIgMTMuNDE0MkwxNC43OTI5IDE2LjIwNzFDMTUuMTgzNCAxNi41OTc2IDE1LjgxNjYgMTYuNTk3NiAxNi4yMDcxIDE2LjIwNzFDMTYuNTk3NiAxNS44MTY2IDE2LjU5NzYgMTUuMTgzNCAxNi4yMDcxIDE0Ljc5MjlMMTMuNDE0MiAxMkwxNi4yMDcxIDkuMjA3MTFaIiBmaWxsPSIjOEQ4RkE2Ii8+Cjwvc3ZnPgo="));\n}\n\n.telebox-color-scheme-dark {\n  color-scheme: dark;\n}\n\n.telebox-color-scheme-dark .telebox-title {\n  color: #e9e9e9;\n  color: var(--tele-titlebarColor, #e9e9e9);\n}\n\n.telebox-color-scheme-dark .telebox-titlebar {\n  color: #e9e9e9;\n  color: var(--tele-titlebarColor, #e9e9e9);\n  background-color: #383b42;\n  background-color: var(--tele-titlebarBackground, #383b42);\n  border-bottom: none;\n  border-bottom: var(--tele-titlebarBorderBottom, none);\n}')();
var TELE_BOX_COLOR_SCHEME = /* @__PURE__ */ ((TELE_BOX_COLOR_SCHEME2) => {
  TELE_BOX_COLOR_SCHEME2["Light"] = "light";
  TELE_BOX_COLOR_SCHEME2["Dark"] = "dark";
  TELE_BOX_COLOR_SCHEME2["Auto"] = "auto";
  return TELE_BOX_COLOR_SCHEME2;
})(TELE_BOX_COLOR_SCHEME || {});
var TELE_BOX_STATE = /* @__PURE__ */ ((TELE_BOX_STATE2) => {
  TELE_BOX_STATE2["Normal"] = "normal";
  TELE_BOX_STATE2["Minimized"] = "minimized";
  TELE_BOX_STATE2["Maximized"] = "maximized";
  return TELE_BOX_STATE2;
})(TELE_BOX_STATE || {});
var TELE_BOX_EVENT = /* @__PURE__ */ ((TELE_BOX_EVENT2) => {
  TELE_BOX_EVENT2["DarkMode"] = "dark_mode";
  TELE_BOX_EVENT2["PrefersColorScheme"] = "prefers_color_scheme";
  TELE_BOX_EVENT2["Close"] = "close";
  TELE_BOX_EVENT2["Focus"] = "focus";
  TELE_BOX_EVENT2["Blur"] = "blur";
  TELE_BOX_EVENT2["IntrinsicMove"] = "intrinsic_move";
  TELE_BOX_EVENT2["IntrinsicResize"] = "intrinsic_resize";
  TELE_BOX_EVENT2["ZIndex"] = "z_index";
  TELE_BOX_EVENT2["State"] = "state";
  TELE_BOX_EVENT2["Minimized"] = "minimized";
  TELE_BOX_EVENT2["Maximized"] = "maximized";
  TELE_BOX_EVENT2["Readonly"] = "readonly";
  TELE_BOX_EVENT2["Destroyed"] = "destroyed";
  return TELE_BOX_EVENT2;
})(TELE_BOX_EVENT || {});
var TELE_BOX_DELEGATE_EVENT = /* @__PURE__ */ ((TELE_BOX_DELEGATE_EVENT2) => {
  TELE_BOX_DELEGATE_EVENT2["Close"] = "close";
  TELE_BOX_DELEGATE_EVENT2["Maximize"] = "maximize";
  TELE_BOX_DELEGATE_EVENT2["Minimize"] = "minimize";
  return TELE_BOX_DELEGATE_EVENT2;
})(TELE_BOX_DELEGATE_EVENT || {});
var TELE_BOX_RESIZE_HANDLE = /* @__PURE__ */ ((TELE_BOX_RESIZE_HANDLE2) => {
  TELE_BOX_RESIZE_HANDLE2["North"] = "n";
  TELE_BOX_RESIZE_HANDLE2["South"] = "s";
  TELE_BOX_RESIZE_HANDLE2["West"] = "w";
  TELE_BOX_RESIZE_HANDLE2["East"] = "e";
  TELE_BOX_RESIZE_HANDLE2["NorthWest"] = "nw";
  TELE_BOX_RESIZE_HANDLE2["NorthEast"] = "ne";
  TELE_BOX_RESIZE_HANDLE2["SouthEast"] = "se";
  TELE_BOX_RESIZE_HANDLE2["SouthWest"] = "sw";
  return TELE_BOX_RESIZE_HANDLE2;
})(TELE_BOX_RESIZE_HANDLE || {});
const TeleBoxDragHandleType = "dh";
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function preventEvent(ev) {
  ev.stopPropagation();
  if (ev.cancelable) {
    ev.preventDefault();
  }
}
let defaultBoxCount = 1;
function getBoxDefaultName() {
  return `New Box ${defaultBoxCount++}`;
}
class DefaultTitleBar {
  constructor({
    readonly$,
    state$,
    title$,
    buttons,
    onEvent,
    onDragStart,
    namespace = "telebox"
  }) {
    this.sideEffect = new sideEffectManager.SideEffectManager();
    this.lastTitleBarClick = {
      timestamp: 0,
      clientX: -100,
      clientY: -100
    };
    this.handleTitleBarClick = (ev) => {
      var _a;
      if (!ev.isPrimary || this.readonly$.value) {
        return;
      }
      if (ev.button !== 0) {
        return;
      }
      if ((_a = ev.target.dataset) == null ? void 0 : _a.teleTitleBarNoDblClick) {
        return;
      }
      preventEvent(ev);
      const now = Date.now();
      if (now - this.lastTitleBarClick.timestamp <= 500) {
        if (Math.abs(ev.clientX - this.lastTitleBarClick.clientX) <= 5 && Math.abs(ev.clientY - this.lastTitleBarClick.clientY) <= 5) {
          if (this.onEvent) {
            this.onEvent({ type: TELE_BOX_DELEGATE_EVENT.Maximize });
          }
        }
      } else if (this.onDragStart) {
        this.onDragStart(ev);
      }
      this.lastTitleBarClick.timestamp = now;
      this.lastTitleBarClick.clientX = ev.clientX;
      this.lastTitleBarClick.clientY = ev.clientY;
    };
    this.readonly$ = readonly$;
    this.state$ = state$;
    this.title$ = title$;
    this.onEvent = onEvent;
    this.onDragStart = onDragStart;
    this.namespace = namespace;
    this.buttons = buttons || [
      {
        type: TELE_BOX_DELEGATE_EVENT.Minimize,
        iconClassName: this.wrapClassName("titlebar-icon-minimize")
      },
      {
        type: TELE_BOX_DELEGATE_EVENT.Maximize,
        iconClassName: this.wrapClassName("titlebar-icon-maximize"),
        isActive: (state) => state === TELE_BOX_STATE.Maximized
      },
      {
        type: TELE_BOX_DELEGATE_EVENT.Close,
        iconClassName: this.wrapClassName("titlebar-icon-close")
      }
    ];
    this.$dragArea = this.renderDragArea();
  }
  render() {
    if (!this.$titleBar) {
      this.$titleBar = document.createElement("div");
      this.$titleBar.className = this.wrapClassName("titlebar");
      const $titleArea = document.createElement("div");
      $titleArea.className = this.wrapClassName("title-area");
      $titleArea.dataset.teleBoxHandle = TeleBoxDragHandleType;
      const $title = document.createElement("h1");
      $title.className = this.wrapClassName("title");
      $title.dataset.teleBoxHandle = TeleBoxDragHandleType;
      $titleArea.appendChild($title);
      $titleArea.appendChild(this.$dragArea);
      const $buttonsContainer = document.createElement("div");
      $buttonsContainer.className = this.wrapClassName("titlebar-btns");
      this.buttons.forEach(({ iconClassName }, i) => {
        const teleTitleBarBtnIndex = String(i);
        const $btn = document.createElement("button");
        $btn.className = `${this.wrapClassName("titlebar-btn")} ${iconClassName}`;
        $btn.dataset.teleTitleBarBtnIndex = teleTitleBarBtnIndex;
        $btn.dataset.teleTitleBarNoDblClick = "true";
        $buttonsContainer.appendChild($btn);
      });
      this.sideEffect.addDisposer(this.title$.subscribe((title) => {
        $title.textContent = title;
        $title.title = title;
      }), "render-title");
      this.sideEffect.addDisposer(this.state$.subscribe((state) => {
        this.buttons.forEach((btn, i) => {
          var _a;
          if (btn.isActive) {
            (_a = $buttonsContainer.children[i]) == null ? void 0 : _a.classList.toggle("is-active", btn.isActive(state));
          }
        });
      }), "render-state-btns");
      this.sideEffect.addEventListener($buttonsContainer, "click", (ev) => {
        var _a;
        if (this.readonly$.value) {
          return;
        }
        const target = ev.target;
        const teleTitleBarBtnIndex = Number((_a = target.dataset) == null ? void 0 : _a.teleTitleBarBtnIndex);
        if (!Number.isNaN(teleTitleBarBtnIndex) && teleTitleBarBtnIndex < this.buttons.length) {
          preventEvent(ev);
          const btn = this.buttons[teleTitleBarBtnIndex];
          if (this.onEvent) {
            this.onEvent({
              type: btn.type,
              value: btn.value
            });
          }
        }
      }, {}, "render-btns-container-click");
      $titleArea.appendChild($buttonsContainer);
      this.$titleBar.appendChild($titleArea);
    }
    return this.$titleBar;
  }
  renderDragArea() {
    const $dragArea = document.createElement("div");
    $dragArea.className = this.wrapClassName("drag-area");
    $dragArea.dataset.teleBoxHandle = TeleBoxDragHandleType;
    this.sideEffect.addEventListener($dragArea, "pointerdown", this.handleTitleBarClick);
    return $dragArea;
  }
  dragHandle() {
    return this.$titleBar;
  }
  wrapClassName(className) {
    return `${this.namespace}-${className}`;
  }
  destroy() {
    this.sideEffect.flushAll();
    if (this.$titleBar) {
      this.$titleBar = void 0;
      this.onDragStart = void 0;
      this.onEvent = void 0;
    }
  }
}
function calcStageRect([rootRect, ratio]) {
  if (ratio <= 0 || rootRect.width <= 0 || rootRect.height <= 0) {
    return rootRect;
  }
  const preferredHeight = rootRect.width * ratio;
  if (preferredHeight === rootRect.height) {
    return rootRect;
  }
  if (preferredHeight < rootRect.height) {
    return {
      x: 0,
      y: (rootRect.height - preferredHeight) / 2,
      width: rootRect.width,
      height: preferredHeight
    };
  }
  const preferredWidth = rootRect.height / ratio;
  return {
    x: (rootRect.width - preferredWidth) / 2,
    y: 0,
    width: preferredWidth,
    height: rootRect.height
  };
}
const ResizeObserver$1 = window.ResizeObserver || resizeObserver.ResizeObserver;
class TeleBox {
  constructor({
    id = sideEffectManager.genUID(),
    title = getBoxDefaultName(),
    namespace = "telebox",
    visible = true,
    width = 0.5,
    height = 0.5,
    minWidth = 0,
    minHeight = 0,
    x = 0.1,
    y = 0.1,
    resizable = true,
    draggable = true,
    boxRatio = -1,
    focus = false,
    zIndex = 100,
    stageRatio = null,
    enableShadowDOM = true,
    titleBar,
    content,
    stage,
    footer,
    styles,
    userStyles,
    bodyStyle = null,
    stageStyle = null,
    darkMode$,
    fence$,
    root,
    rootRect$,
    managerMinimized$,
    managerMaximized$,
    managerReadonly$,
    managerStageRect$,
    managerStageRatio$,
    defaultBoxBodyStyle$,
    defaultBoxStageStyle$,
    collectorRect$
  }) {
    this.events = new Emittery__default["default"]();
    this._delegateEvents = new Emittery__default["default"]();
    this.handleTrackStart = (ev) => {
      var _a;
      return (_a = this._handleTrackStart) == null ? void 0 : _a.call(this, ev);
    };
    this._sideEffect = new sideEffectManager.SideEffectManager();
    this.id = id;
    this.namespace = namespace;
    this.enableShadowDOM = enableShadowDOM;
    const valManager = new valueEnhancer.ValManager();
    this._sideEffect.addDisposer(() => valManager.destroy());
    const title$ = new valueEnhancer.Val(title);
    const visible$ = new valueEnhancer.Val(visible);
    const resizable$ = new valueEnhancer.Val(resizable);
    const draggable$ = new valueEnhancer.Val(draggable);
    const boxRatio$ = new valueEnhancer.Val(boxRatio);
    const zIndex$ = new valueEnhancer.Val(zIndex);
    const focus$ = new valueEnhancer.Val(focus);
    const boxMaximized$ = new valueEnhancer.Val(null);
    const boxMinimized$ = new valueEnhancer.Val(null);
    const boxReadonly$ = new valueEnhancer.Val(null);
    const maximized$ = valueEnhancer.combine([boxMaximized$, managerMaximized$], ([boxMaximized, managerMaximized]) => boxMaximized != null ? boxMaximized : managerMaximized);
    const minimized$ = valueEnhancer.combine([boxMinimized$, managerMinimized$], ([boxMinimized, managerMinimized]) => boxMinimized != null ? boxMinimized : managerMinimized);
    const readonly$ = valueEnhancer.combine([boxReadonly$, managerReadonly$], ([boxReadonly, managerReadonly]) => boxReadonly != null ? boxReadonly : managerReadonly);
    const state$ = valueEnhancer.combine([minimized$, maximized$], ([minimized, maximized]) => minimized ? TELE_BOX_STATE.Minimized : maximized ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal);
    const minSize$ = new valueEnhancer.Val({
      width: clamp(minWidth, 0, 1),
      height: clamp(minHeight, 0, 1)
    }, { compare: shallowequal__default["default"] });
    const pxMinSize$ = valueEnhancer.combine([minSize$, managerStageRect$], ([minSize, managerStageRect]) => ({
      width: minSize.width * managerStageRect.width,
      height: minSize.height * managerStageRect.height
    }), { compare: shallowequal__default["default"] });
    const intrinsicSize$ = new valueEnhancer.Val({ width, height }, { compare: shallowequal__default["default"] });
    this._sideEffect.addDisposer(minSize$.reaction((minSize, skipUpdate) => {
      intrinsicSize$.setValue({
        width: Math.max(width, minSize.width),
        height: Math.max(height, minSize.height)
      }, skipUpdate);
    }));
    const intrinsicCoord$ = new valueEnhancer.Val({ x, y }, { compare: shallowequal__default["default"] });
    const pxIntrinsicSize$ = valueEnhancer.combine([intrinsicSize$, managerStageRect$], ([size, managerStageRect]) => ({
      width: managerStageRect.width * size.width,
      height: managerStageRect.height * size.height
    }), { compare: shallowequal__default["default"] });
    const pxIntrinsicCoord$ = valueEnhancer.combine([intrinsicCoord$, managerStageRect$], ([intrinsicCoord, managerStageRect]) => ({
      x: intrinsicCoord.x * managerStageRect.width,
      y: intrinsicCoord.y * managerStageRect.height
    }), { compare: shallowequal__default["default"] });
    const bodyStyle$ = new valueEnhancer.Val(bodyStyle);
    const stageStyle$ = new valueEnhancer.Val(stageStyle);
    const contentRoot$ = new valueEnhancer.Val(null);
    const bodyRect$ = new valueEnhancer.Val(managerStageRect$.value, {
      compare: shallowequal__default["default"]
    });
    const stageRatio$ = new valueEnhancer.Val(stageRatio);
    const finalStageRatio$ = valueEnhancer.combine([stageRatio$, managerStageRatio$], ([stageRatio2, managerStageRatio]) => stageRatio2 != null ? stageRatio2 : managerStageRatio);
    const stageRect$ = valueEnhancer.combine([bodyRect$, finalStageRatio$], calcStageRect, { compare: shallowequal__default["default"] });
    const propsValConfig = {
      darkMode: darkMode$,
      fence: fence$,
      rootRect: rootRect$,
      managerMinimized: managerMinimized$,
      managerMaximized: managerMaximized$,
      managerReadonly: managerReadonly$,
      managerStageRect: managerStageRect$,
      managerStageRatio: managerStageRatio$,
      defaultBoxBodyStyle: defaultBoxBodyStyle$,
      defaultBoxStageStyle: defaultBoxStageStyle$,
      collectorRect: collectorRect$
    };
    valueEnhancer.withReadonlyValueEnhancer(this, propsValConfig);
    const myReadonlyValConfig = {
      zIndex: zIndex$,
      focus: focus$,
      state: state$,
      minSize: minSize$,
      pxMinSize: pxMinSize$,
      intrinsicSize: intrinsicSize$,
      intrinsicCoord: intrinsicCoord$,
      pxIntrinsicSize: pxIntrinsicSize$,
      pxIntrinsicCoord: pxIntrinsicCoord$,
      bodyRect: bodyRect$,
      stageRect: stageRect$,
      minimized: minimized$,
      maximized: maximized$,
      readonly: readonly$
    };
    valueEnhancer.withReadonlyValueEnhancer(this, myReadonlyValConfig, valManager);
    const valConfig = {
      title: title$,
      visible: visible$,
      resizable: resizable$,
      draggable: draggable$,
      boxRatio: boxRatio$,
      boxMinimized: boxMinimized$,
      boxMaximized: boxMaximized$,
      boxReadonly: boxReadonly$,
      stageRatio: stageRatio$,
      bodyStyle: bodyStyle$,
      stageStyle: stageStyle$
    };
    valueEnhancer.withValueEnhancer(this, valConfig, valManager);
    this.titleBar = titleBar || new DefaultTitleBar({
      readonly$,
      state$,
      title$,
      namespace: this.namespace,
      onDragStart: (event) => {
        var _a;
        return (_a = this._handleTrackStart) == null ? void 0 : _a.call(this, event);
      },
      onEvent: (event) => this._delegateEvents.emit(event.type)
    });
    this._sideEffect.addDisposer(valueEnhancer.combine([boxRatio$, minimized$]).subscribe(([boxRatio2, minimized]) => {
      if (!minimized && boxRatio2 > 0) {
        this.transform(pxIntrinsicCoord$.value.x, pxIntrinsicCoord$.value.y, pxIntrinsicSize$.value.width, pxIntrinsicSize$.value.height);
      }
    }));
    this._sideEffect.addDisposer(fence$.subscribe((fence) => {
      if (fence) {
        this.move(pxIntrinsicCoord$.value.x, pxIntrinsicCoord$.value.y);
      }
    }));
    this.$box = this._render();
    contentRoot$.setValue(this.$content.parentElement);
    content && this.mountContent(content);
    stage && this.mountStage(stage);
    footer && this.mountFooter(footer);
    styles && this.mountStyles(styles);
    userStyles && this.mountUserStyles(userStyles);
    root.appendChild(this.$box);
    const watchValEvent = (val, event) => {
      this._sideEffect.addDisposer(val.reaction((v, skipUpdate) => {
        if (!skipUpdate) {
          this.events.emit(event, v);
        }
      }));
    };
    watchValEvent(darkMode$, TELE_BOX_EVENT.DarkMode);
    watchValEvent(readonly$, TELE_BOX_EVENT.Readonly);
    watchValEvent(zIndex$, TELE_BOX_EVENT.ZIndex);
    watchValEvent(minimized$, TELE_BOX_EVENT.Minimized);
    watchValEvent(maximized$, TELE_BOX_EVENT.Maximized);
    watchValEvent(state$, TELE_BOX_EVENT.State);
    watchValEvent(intrinsicSize$, TELE_BOX_EVENT.IntrinsicResize);
    watchValEvent(intrinsicCoord$, TELE_BOX_EVENT.IntrinsicMove);
    this._sideEffect.addDisposer([
      visible$.reaction((visible2, skipUpdate) => {
        if (!skipUpdate && !visible2) {
          this.events.emit(TELE_BOX_EVENT.Close);
        }
      }),
      focus$.reaction((focus2, skipUpdate) => {
        if (!skipUpdate) {
          this.events.emit(focus2 ? TELE_BOX_EVENT.Focus : TELE_BOX_EVENT.Blur);
        }
      })
    ]);
  }
  get minWidth() {
    return this._minSize$.value.width;
  }
  get minHeight() {
    return this._minSize$.value.height;
  }
  setMinWidth(minWidth, skipUpdate = false) {
    this._minSize$.setValue({ width: minWidth, height: this.minHeight }, skipUpdate);
  }
  setMinHeight(minHeight, skipUpdate = false) {
    this._minSize$.setValue({ width: this.minWidth, height: minHeight }, skipUpdate);
  }
  resize(width, height, skipUpdate = false) {
    this._intrinsicSize$.setValue({
      width: Math.max(width, this.minWidth),
      height: Math.max(height, this.minHeight)
    }, skipUpdate);
  }
  get intrinsicX() {
    return this._intrinsicCoord$.value.x;
  }
  get intrinsicY() {
    return this._intrinsicCoord$.value.y;
  }
  get intrinsicWidth() {
    return this._intrinsicSize$.value.width;
  }
  get intrinsicHeight() {
    return this._intrinsicSize$.value.height;
  }
  move(x, y, skipUpdate = false) {
    let safeX;
    let safeY;
    const managerStageRect = this.managerStageRect;
    const pxIntrinsicSize = this.pxIntrinsicSize;
    if (this.fence) {
      safeX = clamp(x, 0, managerStageRect.width - pxIntrinsicSize.width);
      safeY = clamp(y, 0, managerStageRect.height - pxIntrinsicSize.height);
    } else {
      safeX = clamp(x, -(pxIntrinsicSize.width - 120), 0 + managerStageRect.width - 20);
      safeY = clamp(y, 0, 0 + managerStageRect.height - 20);
    }
    this._intrinsicCoord$.setValue({
      x: safeX / managerStageRect.width,
      y: safeY / managerStageRect.height
    }, skipUpdate);
  }
  transform(x, y, width, height, skipUpdate = false) {
    const managerStageRect = this.managerStageRect;
    width = Math.max(width, this.pxMinSize.width);
    height = Math.max(height, this.pxMinSize.height);
    if (this.boxRatio > 0) {
      const newHeight = this.boxRatio * width;
      if (y !== this.pxIntrinsicCoord.y) {
        y -= newHeight - height;
      }
      height = newHeight;
    }
    if (y < 0) {
      y = 0;
      height = this.pxIntrinsicSize.height;
    }
    this.move(x, y, skipUpdate);
    this._intrinsicSize$.setValue({
      width: width / managerStageRect.width,
      height: height / managerStageRect.height
    }, skipUpdate);
  }
  mountContent(content) {
    var _a;
    (_a = this.$authorContent) == null ? void 0 : _a.remove();
    this.$authorContent = content;
    this.$content.appendChild(content);
  }
  unmountContent() {
    if (this.$authorContent) {
      this.$authorContent.remove();
      this.$authorContent = void 0;
    }
  }
  mountStage(stage) {
    var _a;
    (_a = this.$authorStage) == null ? void 0 : _a.remove();
    this.$authorStage = stage;
    if (!this.$stage) {
      this.$stage = this._renderStage();
    }
    this.$stage.appendChild(stage);
    if (!this.$stage.parentElement) {
      this.$body.appendChild(this.$stage);
    }
  }
  unmountStage() {
    var _a;
    if (this.$authorStage) {
      this.$authorStage.remove();
      this.$authorStage = void 0;
    }
    (_a = this.$stage) == null ? void 0 : _a.remove();
  }
  mountFooter(footer) {
    var _a;
    (_a = this.$authorFooter) == null ? void 0 : _a.remove();
    this.$authorFooter = footer;
    this.$footer.appendChild(footer);
  }
  unmountFooter() {
    if (this.$authorFooter) {
      this.$authorFooter.remove();
      this.$authorFooter = void 0;
    }
  }
  mountStyles(styles) {
    this.$styles.textContent = styles;
  }
  unmountStyles() {
    this.$styles.textContent = "";
  }
  mountUserStyles(styles) {
    this.$userStyles.textContent = styles;
  }
  unmountUserStyles() {
    this.$userStyles.textContent = "";
  }
  _render() {
    if (this.$box) {
      return this.$box;
    }
    const bindBoxStates = (el, disposerID) => {
      return this._sideEffect.addDisposer([
        this._readonly$.subscribe((readonly) => el.classList.toggle(this.wrapClassName("readonly"), readonly)),
        this._draggable$.subscribe((draggable) => el.classList.toggle(this.wrapClassName("no-drag"), !draggable)),
        this._resizable$.subscribe((resizable) => el.classList.toggle(this.wrapClassName("no-resize"), !resizable)),
        this._focus$.subscribe((focus) => el.classList.toggle(this.wrapClassName("blur"), !focus)),
        this._darkMode$.subscribe((darkMode) => {
          el.classList.toggle(this.wrapClassName("color-scheme-dark"), darkMode);
          el.classList.toggle(this.wrapClassName("color-scheme-light"), !darkMode);
        })
      ], disposerID);
    };
    this.$box = document.createElement("div");
    this.$box.classList.add(this.wrapClassName("box"));
    bindBoxStates(this.$box, "bind-box-state");
    this._sideEffect.add(() => {
      const minimizedClassName = this.wrapClassName("minimized");
      const maximizedClassName = this.wrapClassName("maximized");
      const MAXIMIZED_TIMER_ID = "box-maximized-timer";
      return this._state$.subscribe((state) => {
        this.$box.classList.toggle(minimizedClassName, state === TELE_BOX_STATE.Minimized);
        if (state === TELE_BOX_STATE.Maximized) {
          this._sideEffect.flush(MAXIMIZED_TIMER_ID);
          this.$box.classList.toggle(maximizedClassName, true);
        } else {
          this._sideEffect.setTimeout(() => {
            this.$box.classList.toggle(maximizedClassName, false);
          }, 0, MAXIMIZED_TIMER_ID);
        }
      });
    });
    this._sideEffect.addDisposer(this._visible$.subscribe((visible) => {
      this.$box.style.display = visible ? "block" : "none";
    }));
    this._sideEffect.addDisposer(this._zIndex$.subscribe((zIndex) => {
      this.$box.style.zIndex = String(zIndex);
    }));
    this.$box.dataset.teleBoxID = this.id;
    const boxStyler = styler__default["default"](this.$box);
    const boxStyles$ = valueEnhancer.combine([
      this._maximized$,
      this._minimized$,
      this._pxIntrinsicSize$,
      this._pxIntrinsicCoord$,
      this._collectorRect$,
      this._rootRect$,
      this._managerStageRect$
    ], ([
      maximized,
      minimized,
      pxIntrinsicSize,
      pxIntrinsicCoord,
      collectorRect,
      rootRect,
      managerStageRect
    ]) => {
      const styles = maximized ? {
        x: -managerStageRect.x,
        y: -managerStageRect.y,
        width: rootRect.width,
        height: rootRect.height,
        scaleX: 1,
        scaleY: 1
      } : {
        x: pxIntrinsicCoord.x,
        y: pxIntrinsicCoord.y,
        width: pxIntrinsicSize.width,
        height: pxIntrinsicSize.height,
        scaleX: 1,
        scaleY: 1
      };
      if (minimized && collectorRect) {
        const { width: boxWidth, height: boxHeight } = maximized ? this.rootRect : pxIntrinsicSize;
        styles.x = collectorRect.x - boxWidth / 2 + collectorRect.width / 2 - managerStageRect.x;
        styles.y = collectorRect.y - boxHeight / 2 + collectorRect.height / 2 - managerStageRect.y;
        styles.scaleX = collectorRect.width / boxWidth;
        styles.scaleY = collectorRect.height / boxHeight;
      }
      return styles;
    }, { compare: shallowequal__default["default"] });
    const boxStyles = boxStyles$.value;
    this.$box.style.width = boxStyles.width + "px";
    this.$box.style.height = boxStyles.height + "px";
    this.$box.style.transform = `translate(${boxStyles.x - 10}px,${boxStyles.y - 10}px)`;
    this._sideEffect.addDisposer(boxStyles$.subscribe((styles) => {
      boxStyler.set(styles);
    }));
    const $boxMain = document.createElement("div");
    $boxMain.className = this.wrapClassName("box-main");
    this.$box.appendChild($boxMain);
    const $titleBar = document.createElement("div");
    $titleBar.className = this.wrapClassName("titlebar-wrap");
    $titleBar.appendChild(this.titleBar.render());
    this.$titleBar = $titleBar;
    const $body = document.createElement("div");
    $body.className = this.wrapClassName("body-wrap");
    this.$body = $body;
    const $styles = document.createElement("style");
    this.$styles = $styles;
    $body.appendChild($styles);
    const $userStyles = document.createElement("style");
    this.$userStyles = $userStyles;
    $body.appendChild($userStyles);
    const $content = document.createElement("div");
    $content.className = this.wrapClassName("content") + " tele-fancy-scrollbar";
    this.$content = $content;
    this._sideEffect.addDisposer(valueEnhancer.combine([this._bodyStyle$, this._defaultBoxBodyStyle$], ([bodyStyle, defaultBoxBodyStyle]) => bodyStyle != null ? bodyStyle : defaultBoxBodyStyle).subscribe((style2) => $content.style.cssText = style2 || ""));
    $body.appendChild($content);
    const $footer = document.createElement("div");
    $footer.className = this.wrapClassName("footer-wrap");
    this.$footer = $footer;
    $boxMain.appendChild($titleBar);
    const $main = document.createElement("div");
    $main.className = this.wrapClassName("main");
    this.$main = $main;
    $boxMain.appendChild($main);
    const $quarantineOuter = document.createElement("div");
    $quarantineOuter.className = this.wrapClassName("quarantine-outer");
    $main.appendChild($quarantineOuter);
    const $quarantine = document.createElement("div");
    $quarantine.className = this.wrapClassName("quarantine");
    $quarantine.appendChild($body);
    $quarantine.appendChild($footer);
    if (this.enableShadowDOM) {
      bindBoxStates($quarantine, "bind-quarantine-state");
      const $shadowStyle = document.createElement("style");
      $shadowStyle.textContent = shadowStyles;
      $quarantine.insertBefore($shadowStyle, $quarantine.firstChild);
      const shadow = $quarantineOuter.attachShadow({ mode: "open" });
      shadow.appendChild($quarantine);
    } else {
      $quarantineOuter.appendChild($quarantine);
    }
    this._renderResizeHandlers();
    const updateBodyRect = () => {
      const rect = $body.getBoundingClientRect();
      this._bodyRect$.setValue({
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height
      });
    };
    this._sideEffect.add(() => {
      const observer = new ResizeObserver$1(() => {
        if (!this.minimized) {
          updateBodyRect();
        }
      });
      observer.observe($body);
      return () => observer.disconnect();
    });
    this._sideEffect.addDisposer(this._minimized$.reaction((minimized) => {
      if (!minimized) {
        this._sideEffect.setTimeout(updateBodyRect, 400, "minimized-content-rect-fix");
      }
    }));
    return this.$box;
  }
  _renderStage() {
    const $stage = document.createElement("div");
    $stage.className = this.wrapClassName("box-stage");
    const updateStageRect = (stageRect) => {
      $stage.style.top = stageRect.y + "px";
      $stage.style.left = stageRect.x + "px";
      $stage.style.width = stageRect.width + "px";
      $stage.style.height = stageRect.height + "px";
    };
    this._sideEffect.addDisposer([
      valueEnhancer.combine([this._stageStyle$, this._defaultBoxStageStyle$], ([stageStyle, defaultBoxStageStyle]) => stageStyle != null ? stageStyle : defaultBoxStageStyle).subscribe((styles) => {
        $stage.style.cssText = styles || "";
        updateStageRect(this._stageRect$.value);
      }),
      this._stageRect$.subscribe(updateStageRect)
    ], "box-stage-styles");
    return $stage;
  }
  _renderResizeHandlers() {
    const $resizeHandles = document.createElement("div");
    $resizeHandles.className = this.wrapClassName("resize-handles");
    Object.values(TELE_BOX_RESIZE_HANDLE).forEach((handleType) => {
      const $handle = document.createElement("div");
      $handle.className = this.wrapClassName(handleType) + " " + this.wrapClassName("resize-handle");
      $handle.dataset.teleBoxHandle = handleType;
      $resizeHandles.appendChild($handle);
    });
    this.$box.appendChild($resizeHandles);
    const TRACKING_DISPOSER_ID = "handle-tracking-listener";
    const transformingClassName = this.wrapClassName("transforming");
    let $trackMask;
    let trackStartX = 0;
    let trackStartY = 0;
    let trackStartWidth = 0;
    let trackStartHeight = 0;
    let trackStartPageX = 0;
    let trackStartPageY = 0;
    let trackingHandle;
    const handleTracking = (ev) => {
      if (!ev.isPrimary || this.state !== TELE_BOX_STATE.Normal) {
        return;
      }
      preventEvent(ev);
      let { pageX, pageY } = ev;
      if (pageY < 0) {
        pageY = 0;
      }
      const offsetX = pageX - trackStartPageX;
      const offsetY = pageY - trackStartPageY;
      let { x: newX, y: newY } = this.pxIntrinsicCoord;
      let { width: newWidth, height: newHeight } = this.pxIntrinsicSize;
      switch (trackingHandle) {
        case TELE_BOX_RESIZE_HANDLE.North: {
          newY = trackStartY + offsetY;
          newHeight = trackStartHeight - offsetY;
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.South: {
          newHeight = trackStartHeight + offsetY;
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.West: {
          newX = trackStartX + offsetX;
          newWidth = trackStartWidth - offsetX;
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.East: {
          newWidth = trackStartWidth + offsetX;
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.NorthWest: {
          newX = trackStartX + offsetX;
          newY = trackStartY + offsetY;
          newWidth = trackStartWidth - offsetX;
          newHeight = trackStartHeight - offsetY;
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.NorthEast: {
          newY = trackStartY + offsetY;
          newWidth = trackStartWidth + offsetX;
          newHeight = trackStartHeight - offsetY;
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.SouthEast: {
          newWidth = trackStartWidth + offsetX;
          newHeight = trackStartHeight + offsetY;
          break;
        }
        case TELE_BOX_RESIZE_HANDLE.SouthWest: {
          newX = trackStartX + offsetX;
          newWidth = trackStartWidth - offsetX;
          newHeight = trackStartHeight + offsetY;
          break;
        }
        default: {
          this.move(trackStartX + offsetX, trackStartY + offsetY);
          return;
        }
      }
      this.transform(newX, newY, newWidth, newHeight);
    };
    const handleTrackEnd = (ev) => {
      if (!ev.isPrimary) {
        return;
      }
      trackingHandle = void 0;
      if (!$trackMask) {
        return;
      }
      preventEvent(ev);
      this.$box.classList.toggle(transformingClassName, false);
      this._sideEffect.flush(TRACKING_DISPOSER_ID);
      $trackMask.remove();
    };
    const handleTrackStart = (ev) => {
      var _a;
      if (!ev.isPrimary || this.readonly) {
        return;
      }
      if (ev.button != null && ev.button !== 0) {
        return;
      }
      if (!this.draggable || trackingHandle || this.state !== TELE_BOX_STATE.Normal) {
        return;
      }
      const target = ev.target;
      if ((_a = target.dataset) == null ? void 0 : _a.teleBoxHandle) {
        preventEvent(ev);
        ({ x: trackStartX, y: trackStartY } = this.pxIntrinsicCoord);
        ({ width: trackStartWidth, height: trackStartHeight } = this.pxIntrinsicSize);
        ({ pageX: trackStartPageX, pageY: trackStartPageY } = ev);
        trackingHandle = target.dataset.teleBoxHandle;
        if (!$trackMask) {
          $trackMask = document.createElement("div");
        }
        const cursor = trackingHandle ? this.wrapClassName(`cursor-${trackingHandle}`) : "";
        $trackMask.className = this.wrapClassName(`track-mask${cursor ? ` ${cursor}` : ""}`);
        this.$box.appendChild($trackMask);
        this.$box.classList.add(transformingClassName);
        this._sideEffect.add(() => {
          window.addEventListener("pointermove", handleTracking, {
            passive: false
          });
          window.addEventListener("pointerup", handleTrackEnd, {
            passive: false
          });
          window.addEventListener("pointercancel", handleTrackEnd, {
            passive: false
          });
          return () => {
            window.removeEventListener("pointermove", handleTracking);
            window.removeEventListener("pointerup", handleTrackEnd);
            window.removeEventListener("pointercancel", handleTrackEnd);
          };
        }, TRACKING_DISPOSER_ID);
      }
    };
    this._handleTrackStart = handleTrackStart;
    this._sideEffect.addEventListener($resizeHandles, "pointerdown", handleTrackStart, {}, "box-resizeHandles-pointerdown");
  }
  async destroy() {
    this.$box.remove();
    this._sideEffect.flushAll();
    this._sideEffect.flushAll();
    await this.events.emit(TELE_BOX_EVENT.Destroyed);
    this.events.clearListeners();
    this._delegateEvents.clearListeners();
  }
  wrapClassName(className) {
    return `${this.namespace}-${className}`;
  }
}
var style$2 = /* @__PURE__ */ (() => ".telebox-manager-container {\n  position: relative;\n  overflow: hidden;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  --tele-managerContainerBackground: #f5f5fc;\n  --tele-managerStageBackground: #fff;\n  --tele-managerStageShadow: 0px 0px 16px rgba(0, 0, 0, 0.08);\n  --tele-boxContainerBackground: #f5f5fc;\n  --tele-boxStageBackground: #fff;\n  --tele-boxStageShadow: 0px 0px 16px rgba(0, 0, 0, 0.08);\n  --tele-boxColor: #191919;\n  --tele-boxBorder: 1px solid #DFE0ED;\n  --tele-boxShadow: 6px 4px 25px 0px rgba(32, 35, 56, 0.2);\n  --tele-boxFooterColor: #191919;\n  --tele-boxFooterBackground: #fff;\n  --tele-titlebarColor: #484C70;\n  --tele-titlebarBackground: #EBECFA;\n  --tele-titlebarBorderBottom: 0px solid #eeeef7;\n  --tele-titlebarTabColor: #484C70;\n  --tele-titlebarTabFocusColor: #FF5353;\n  --tele-titlebarTabBackground: #F0F1FC;\n  --tele-titlebarTabDividerColor: #e5e5f0;\n  --tele-collectorBackground: #8d8fa6;\n  --tele-collectorShadow: 6px 4px 25px 0px rgba(32, 35, 56, 0.2);\n  background: #f5f5fc;\n  background: var(--tele-managerContainerBackground, #f5f5fc);\n}\n.telebox-manager-container.telebox-is-maximized > .telebox-manager-stage, .telebox-manager-container.telebox-is-minimized > .telebox-manager-stage {\n  overflow: visible;\n}\n.telebox-manager-container.telebox-is-fullscreen .telebox-titlebar-icon-maximize,\n.telebox-manager-container.telebox-is-fullscreen .telebox-titlebar-icon-minimize {\n  display: none !important;\n}\n.telebox-manager-container.telebox-hide-fullscreen-titlebar .telebox-titlebar {\n  display: none !important;\n}\n.telebox-manager-stage {\n  position: relative;\n  overflow: hidden;\n  background: #fff;\n  background: var(--tele-managerStageBackground, #fff);\n  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.08);\n  box-shadow: var(--tele-managerStageShadow, 0px 0px 16px rgba(0, 0, 0, 0.08));\n}\n.telebox-color-scheme-dark {\n  color-scheme: dark;\n}\n.telebox-color-scheme-dark.telebox-manager-container {\n  --tele-managerContainerBackground: #25282e;\n  --tele-managerStageBackground: #272a30;\n  --tele-managerStageShadow: 0px 0px 16px rgba(0, 0, 0, 0.24);\n  --tele-boxContainerBackground: #25282e;\n  --tele-boxStageBackground: #272a30;\n  --tele-boxStageShadow: 0px 0px 16px rgba(0, 0, 0, 0.24);\n  --tele-boxColor: #e9e9e9;\n  --tele-boxBorder: 1px solid #383b42;\n  --tele-boxShadow: 0px 4px 10px 0px rgba(56, 59, 66, 0.15);\n  --tele-boxFooterColor: #e9e9e9;\n  --tele-boxFooterBackground: #383b42;\n  --tele-titlebarColor: #e9e9e9;\n  --tele-titlebarBackground: #383b42;\n  --tele-titlebarBorderBottom: none;\n  --tele-titlebarTabColor: #e9e9e9;\n  --tele-titlebarTabFocusColor: #357bf6;\n  --tele-titlebarTabBackground: transparent;\n  --tele-titlebarTabDividerColor: #7b88a0;\n  --tele-collectorBackground: #383b42;\n  --tele-collectorShadow: 0px 2px 6px 0px rgba(47, 65, 146, 0.15);\n  background: #25282e;\n  background: var(--tele-managerContainerBackground, #25282e);\n}\n.telebox-color-scheme-dark.telebox-manager-container > .telebox-manager-stage {\n  background: #272a30;\n  background: var(--tele-managerStageBackground, #272a30);\n  box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.24);\n  box-shadow: var(--tele-managerStageShadow, 0px 0px 16px rgba(0, 0, 0, 0.24));\n}")();
var style$1 = /* @__PURE__ */ (() => ".telebox-collector-wrp {\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  visibility: hidden;\n  position: absolute;\n  z-index: 5120;\n  border-radius: 50%;\n  cursor: pointer;\n  user-select: none;\n  pointer-events: none;\n  background-color: #fff;\n  height: 56px;\n  width: 56px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin: 0;\n  padding: 0;\n  border: none;\n  outline: none;\n  box-shadow: 6px 4px 25px 0px rgba(32, 35, 56, 0.2);\n  box-shadow: var(--tele-collectorShadow, 6px 4px 25px 0px rgba(32, 35, 56, 0.2));\n}\n\n.telebox-collector {\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  visibility: hidden;\n  display: block;\n  width: 48px;\n  height: 48px;\n  margin: 0;\n  padding: 0;\n  border: none;\n  outline: none;\n  font-size: 0;\n  border-radius: 50%;\n  cursor: pointer;\n  user-select: none;\n  pointer-events: none;\n  background-repeat: no-repeat;\n  background-size: 28px 28px;\n  background-position: center;\n  -webkit-tap-highlight-color: transparent;\n  background-color: #8d8fa6;\n  background-color: var(--tele-collectorBackground, #8d8fa6);\n}\n\n.telebox-collector-count {\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  position: absolute;\n  z-index: 5120;\n  border-radius: 100%;\n  user-select: none;\n  pointer-events: none;\n  background-color: #8d8fa6;\n  height: 14px;\n  min-width: 14px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  margin: 0;\n  padding: 0;\n  border: none;\n  outline: none;\n  right: 0px;\n  top: 0px;\n  border: 1px solid #fff;\n  color: #fff;\n  font-weight: 400;\n  font-size: 11px;\n}\n\n.telebox-collector-visible {\n  visibility: visible;\n  pointer-events: initial;\n}\n\n.telebox-collector-readonly {\n  cursor: not-allowed;\n}\n\n.telebox-color-scheme-dark {\n  color-scheme: dark;\n}\n\n.telebox-color-scheme-dark.telebox-collector {\n  background-color: #383b42;\n  background-color: var(--tele-collectorBackground, #383b42);\n  box-shadow: 0px 2px 6px 0px rgba(47, 65, 146, 0.15);\n  box-shadow: var(--tele-collectorShadow, 0px 2px 6px 0px rgba(47, 65, 146, 0.15));\n}")();
var collectorSVG = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzFfNDQyNDQpIj4KPGcgZmlsdGVyPSJ1cmwoI2ZpbHRlcjBfZF8xXzQ0MjQ0KSI+CjxwYXRoIGQ9Ik0xNC4wMDAyIDE2LjE5NTNDMTMuODI0NyAxNi4xOTUzIDEzLjY1MjIgMTYuMTQ5MSAxMy41MDAyIDE2LjA2MTVMNC41MDAxNyAxMC44NjQzQzQuMDIxNzggMTAuNTg3OSAzLjg1Nzk2IDkuOTc2MTIgNC4xMzQyOCA5LjQ5NzczQzQuMjIyMDQgOS4zNDU3OSA0LjM0ODIzIDkuMjE5NiA0LjUwMDE3IDkuMTMxODRMMTMuNTAwMiAzLjkzODQ4QzEzLjgwOTggMy43NjA3NCAxNC4xOTA1IDMuNzYwNzQgMTQuNTAwMiAzLjkzODQ4TDIzLjUwMDIgOS4xMzE4NEMyMy45Nzg2IDkuNDA4MTYgMjQuMTQyNCAxMC4wMiAyMy44NjYxIDEwLjQ5ODRDMjMuNzc4MyAxMC42NTAzIDIzLjY1MjEgMTAuNzc2NSAyMy41MDAyIDEwLjg2NDNMMTQuNTAwMiAxNi4wNjE1QzE0LjM0ODEgMTYuMTQ5MSAxNC4xNzU3IDE2LjE5NTMgMTQuMDAwMiAxNi4xOTUzWiIgZmlsbD0id2hpdGUiLz4KPC9nPgo8ZyBmaWx0ZXI9InVybCgjZmlsdGVyMV9kXzFfNDQyNDQpIj4KPHBhdGggZD0iTTIzLjUwMDIgMTMuMTMxOUwyMS41MzYxIDExLjk5ODVMMTQuNTAwMiAxNi4wNjE2QzE0LjE5MDcgMTYuMjQgMTMuODA5NiAxNi4yNCAxMy41MDAyIDE2LjA2MTZMNi40NjQyOCAxMS45OTg1TDQuNTAwMTcgMTMuMTMxOUM0LjAyMTc4IDEzLjQwODIgMy44NTc5NiAxNC4wMiA0LjEzNDI4IDE0LjQ5ODRDNC4yMjIwNCAxNC42NTA0IDQuMzQ4MjMgMTQuNzc2NiA0LjUwMDE3IDE0Ljg2NDNMMTMuNTAwMiAyMC4wNjE2QzEzLjgwOTYgMjAuMjQgMTQuMTkwNyAyMC4yNCAxNC41MDAyIDIwLjA2MTZMMjMuNTAwMiAxNC44NjQzQzIzLjk3ODYgMTQuNTg4IDI0LjE0MjQgMTMuOTc2MiAyMy44NjYxIDEzLjQ5NzhDMjMuNzc4MyAxMy4zNDU5IDIzLjY1MjEgMTMuMjE5NyAyMy41MDAyIDEzLjEzMTlaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjgiIHNoYXBlLXJlbmRlcmluZz0iY3Jpc3BFZGdlcyIvPgo8L2c+CjxnIGZpbHRlcj0idXJsKCNmaWx0ZXIyX2RfMV80NDI0NCkiPgo8cGF0aCBkPSJNMjMuNTAwMiAxNy4xMzE5TDIxLjUzNjEgMTUuOTk4NUwxNC41MDAyIDIwLjA2MTZDMTQuMTkwNyAyMC4yNCAxMy44MDk2IDIwLjI0IDEzLjUwMDIgMjAuMDYxNkw2LjQ2NDI4IDE1Ljk5ODVMNC41MDAxNyAxNy4xMzE5QzQuMDIxNzggMTcuNDA4MiAzLjg1Nzk2IDE4LjAyIDQuMTM0MjggMTguNDk4NEM0LjIyMjA0IDE4LjY1MDQgNC4zNDgyMyAxOC43NzY2IDQuNTAwMTcgMTguODY0M0wxMy41MDAyIDI0LjA2MTZDMTMuODA5NiAyNC4yNCAxNC4xOTA3IDI0LjI0IDE0LjUwMDIgMjQuMDYxNkwyMy41MDAyIDE4Ljg2NDNDMjMuOTc4NiAxOC41ODggMjQuMTQyNCAxNy45NzYyIDIzLjg2NjEgMTcuNDk3OEMyMy43NzgzIDE3LjM0NTkgMjMuNjUyMSAxNy4yMTk3IDIzLjUwMDIgMTcuMTMxOVoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNiIgc2hhcGUtcmVuZGVyaW5nPSJjcmlzcEVkZ2VzIi8+CjwvZz4KPC9nPgo8ZGVmcz4KPGZpbHRlciBpZD0iZmlsdGVyMF9kXzFfNDQyNDQiIHg9IjMiIHk9IjMuODA1MTgiIHdpZHRoPSIyMiIgaGVpZ2h0PSIxNC4zOTAxIiBmaWx0ZXJVbml0cz0idXNlclNwYWNlT25Vc2UiIGNvbG9yLWludGVycG9sYXRpb24tZmlsdGVycz0ic1JHQiI+CjxmZUZsb29kIGZsb29kLW9wYWNpdHk9IjAiIHJlc3VsdD0iQmFja2dyb3VuZEltYWdlRml4Ii8+CjxmZUNvbG9yTWF0cml4IGluPSJTb3VyY2VBbHBoYSIgdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDEyNyAwIiByZXN1bHQ9ImhhcmRBbHBoYSIvPgo8ZmVPZmZzZXQgZHk9IjEiLz4KPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMC41Ii8+CjxmZUNvbXBvc2l0ZSBpbjI9ImhhcmRBbHBoYSIgb3BlcmF0b3I9Im91dCIvPgo8ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwLjU1Mjk0MSAwIDAgMCAwIDAuNTYwNzg0IDAgMCAwIDAgMC42NTA5OCAwIDAgMCAwLjE1IDAiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJlZmZlY3QxX2Ryb3BTaGFkb3dfMV80NDI0NCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9ImVmZmVjdDFfZHJvcFNoYWRvd18xXzQ0MjQ0IiByZXN1bHQ9InNoYXBlIi8+CjwvZmlsdGVyPgo8ZmlsdGVyIGlkPSJmaWx0ZXIxX2RfMV80NDI0NCIgeD0iMyIgeT0iMTEuOTk4NSIgd2lkdGg9IjIyIiBoZWlnaHQ9IjEwLjE5NjgiIGZpbHRlclVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJzUkdCIj4KPGZlRmxvb2QgZmxvb2Qtb3BhY2l0eT0iMCIgcmVzdWx0PSJCYWNrZ3JvdW5kSW1hZ2VGaXgiLz4KPGZlQ29sb3JNYXRyaXggaW49IlNvdXJjZUFscGhhIiB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMTI3IDAiIHJlc3VsdD0iaGFyZEFscGhhIi8+CjxmZU9mZnNldCBkeT0iMSIvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIwLjUiLz4KPGZlQ29tcG9zaXRlIGluMj0iaGFyZEFscGhhIiBvcGVyYXRvcj0ib3V0Ii8+CjxmZUNvbG9yTWF0cml4IHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAuNTUyOTQxIDAgMCAwIDAgMC41NjA3ODQgMCAwIDAgMCAwLjY1MDk4IDAgMCAwIDAuMTUgMCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluMj0iQmFja2dyb3VuZEltYWdlRml4IiByZXN1bHQ9ImVmZmVjdDFfZHJvcFNoYWRvd18xXzQ0MjQ0Ii8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0iZWZmZWN0MV9kcm9wU2hhZG93XzFfNDQyNDQiIHJlc3VsdD0ic2hhcGUiLz4KPC9maWx0ZXI+CjxmaWx0ZXIgaWQ9ImZpbHRlcjJfZF8xXzQ0MjQ0IiB4PSIzIiB5PSIxNS45OTg1IiB3aWR0aD0iMjIiIGhlaWdodD0iMTAuMTk2OCIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIgcmVzdWx0PSJoYXJkQWxwaGEiLz4KPGZlT2Zmc2V0IGR5PSIxIi8+CjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjAuNSIvPgo8ZmVDb21wb3NpdGUgaW4yPSJoYXJkQWxwaGEiIG9wZXJhdG9yPSJvdXQiLz4KPGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMC41NTI5NDEgMCAwIDAgMCAwLjU2MDc4NCAwIDAgMCAwIDAuNjUwOTggMCAwIDAgMC4xNSAwIi8+CjxmZUJsZW5kIG1vZGU9Im5vcm1hbCIgaW4yPSJCYWNrZ3JvdW5kSW1hZ2VGaXgiIHJlc3VsdD0iZWZmZWN0MV9kcm9wU2hhZG93XzFfNDQyNDQiLz4KPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJlZmZlY3QxX2Ryb3BTaGFkb3dfMV80NDI0NCIgcmVzdWx0PSJzaGFwZSIvPgo8L2ZpbHRlcj4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xXzQ0MjQ0Ij4KPHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=";
class TeleBoxCollector {
  constructor({
    minimized$,
    readonly$,
    darkMode$,
    boxCount,
    namespace = "telebox",
    styles = {},
    root,
    onClick
  }) {
    this._sideEffect = new sideEffectManager.SideEffectManager();
    this.namespace = namespace;
    const valManager = new valueEnhancer.ValManager();
    this._sideEffect.addDisposer(() => valManager.destroy());
    const rect$ = new valueEnhancer.Val(void 0);
    const visible$ = valueEnhancer.derive(minimized$);
    const styles$ = new valueEnhancer.Val(styles);
    const el$ = new valueEnhancer.Val(document.createElement("button"));
    const wrp$ = new valueEnhancer.Val(document.createElement("div"));
    const count$ = new valueEnhancer.Val(document.createElement("div"));
    const valConfig = {
      styles: styles$,
      $collector: el$
    };
    valueEnhancer.withValueEnhancer(this, valConfig, valManager);
    const myReadonlyValConfig = {
      rect: rect$,
      visible: visible$
    };
    valueEnhancer.withReadonlyValueEnhancer(this, myReadonlyValConfig, valManager);
    el$.value.className = this.wrapClassName("collector");
    el$.value.style.backgroundImage = `url('${collectorSVG}')`;
    wrp$.value.className = this.wrapClassName("collector-wrp");
    count$.value.className = this.wrapClassName("collector-count");
    wrp$.value.appendChild(count$.value);
    this._sideEffect.addDisposer(el$.subscribe(($collector) => {
      this._sideEffect.add(() => {
        root.appendChild(wrp$.value);
        wrp$.value.appendChild($collector);
        return () => $collector.remove();
      }, "telebox-collector-mount");
      this._sideEffect.addEventListener($collector, "click", () => {
        if (!readonly$.value) {
          onClick == null ? void 0 : onClick();
        }
      }, {}, "telebox-collector-click");
      this._sideEffect.addDisposer([
        visible$.subscribe((visible) => {
          $collector.classList.toggle(this.wrapClassName("collector-visible"), visible);
          wrp$.value.classList.toggle(this.wrapClassName("collector-visible"), visible);
        }),
        boxCount.subscribe((count) => {
          count$.value.innerHTML = count.toString();
        }),
        readonly$.subscribe((readonly) => {
          wrp$.value.classList.toggle(this.wrapClassName("collector-readonly"), readonly);
        }),
        darkMode$.subscribe((darkMode) => {
          $collector.classList.toggle(this.wrapClassName("color-scheme-dark"), darkMode);
          $collector.classList.toggle(this.wrapClassName("color-scheme-light"), !darkMode);
          wrp$.value.classList.toggle(this.wrapClassName("color-scheme-dark"), darkMode);
          wrp$.value.classList.toggle(this.wrapClassName("color-scheme-light"), !darkMode);
        }),
        styles$.subscribe((styles2) => {
          Object.keys(styles2).forEach((key) => {
            const value = styles2[key];
            if (value != null) {
              wrp$.value.style[key] = value;
            }
          });
        }),
        minimized$.subscribe((minimized) => {
          if (minimized) {
            const { x, y, width, height } = $collector.getBoundingClientRect();
            const rootRect = root.getBoundingClientRect();
            rect$.setValue({
              x: x - rootRect.x,
              y: y - rootRect.y,
              width,
              height
            });
          }
        })
      ], "telebox-collector-el");
    }));
  }
  destroy() {
    this._sideEffect.flushAll();
  }
  wrapClassName(className) {
    return `${this.namespace}-${className}`;
  }
}
var TELE_BOX_MANAGER_EVENT = /* @__PURE__ */ ((TELE_BOX_MANAGER_EVENT2) => {
  TELE_BOX_MANAGER_EVENT2["Focused"] = "focused";
  TELE_BOX_MANAGER_EVENT2["Blurred"] = "blurred";
  TELE_BOX_MANAGER_EVENT2["Created"] = "created";
  TELE_BOX_MANAGER_EVENT2["Removed"] = "removed";
  TELE_BOX_MANAGER_EVENT2["State"] = "state";
  TELE_BOX_MANAGER_EVENT2["Maximized"] = "maximized";
  TELE_BOX_MANAGER_EVENT2["Minimized"] = "minimized";
  TELE_BOX_MANAGER_EVENT2["IntrinsicMove"] = "intrinsic_move";
  TELE_BOX_MANAGER_EVENT2["IntrinsicResize"] = "intrinsic_resize";
  TELE_BOX_MANAGER_EVENT2["ZIndex"] = "z_index";
  TELE_BOX_MANAGER_EVENT2["PrefersColorScheme"] = "prefers_color_scheme";
  TELE_BOX_MANAGER_EVENT2["DarkMode"] = "dark_mode";
  return TELE_BOX_MANAGER_EVENT2;
})(TELE_BOX_MANAGER_EVENT || {});
var style = /* @__PURE__ */ (() => ".telebox-max-titlebar {\n  user-select: none;\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  display: none;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  z-index: 5100;\n  border-top-left-radius: 6px;\n  border-top-right-radius: 6px;\n}\n.telebox-max-titlebar .telebox-title {\n  display: none;\n}\n.telebox-max-titlebar.telebox-max-titlebar-single-title .telebox-titles {\n  display: none;\n}\n.telebox-max-titlebar.telebox-max-titlebar-single-title .telebox-title {\n  display: block;\n}\n.telebox-max-titlebar-active {\n  display: flex;\n}\n.telebox-titles {\n  height: 100%;\n  margin: 0;\n  overflow-y: hidden;\n  overflow-x: scroll;\n  overflow-x: overlay;\n  -webkit-overflow-scrolling: touch;\n  -ms-overflow-style: -ms-autohiding-scrollbar;\n  scrollbar-width: auto;\n}\n.telebox-titles::-webkit-scrollbar {\n  height: 4px;\n  width: 4px;\n}\n.telebox-titles::-webkit-scrollbar-track {\n  background-color: transparent;\n}\n.telebox-titles::-webkit-scrollbar-thumb {\n  background-color: rgba(238, 238, 247, 0.8);\n  background-color: transparent;\n  border-radius: 2px;\n  transition: background-color 0.4s;\n}\n.telebox-titles:hover::-webkit-scrollbar-thumb {\n  background-color: rgba(238, 238, 247, 0.8);\n}\n.telebox-titles::-webkit-scrollbar-thumb:hover {\n  background-color: #eeeef7;\n}\n.telebox-titles::-webkit-scrollbar-thumb:active {\n  background-color: #eeeef7;\n}\n.telebox-titles::-webkit-scrollbar-thumb:vertical {\n  min-height: 50px;\n}\n.telebox-titles::-webkit-scrollbar-thumb:horizontal {\n  min-width: 50px;\n}\n.telebox-titles-content {\n  height: 100%;\n  display: flex;\n  flex-wrap: nowrap;\n  align-items: center;\n  padding: 0;\n}\n.telebox-titles-tab {\n  height: 100%;\n  overflow: hidden;\n  max-width: 120px;\n  min-width: 64px;\n  padding: 4px 6px;\n  outline: none;\n  font-size: 13px;\n  font-family: PingFangSC-Regular, PingFang SC;\n  font-weight: 400;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  word-break: keep-all;\n  border: none;\n  cursor: pointer;\n  user-select: none;\n  border-radius: 4px;\n  border: 0.5px solid #F0F1FC;\n  color: #484C70;\n  color: var(--tele-titlebarTabColor, #484C70);\n  background-color: #F0F1FC;\n  background-color: var(--tele-titlebarTabBackground, #F0F1FC);\n}\n.telebox-titles-tab:hover {\n  color: #484C70;\n  background-color: #EBECFA;\n}\n.telebox-titles-tab-focus {\n  color: #FF5353;\n  color: var(--tele-titlebarTabFocusColor, #FF5353);\n  background-color: #FFF5F5;\n  border-color: rgba(255, 83, 83, 0.2);\n}\n.telebox-titles-tab-focus:hover {\n  color: #FF5353;\n  color: var(--tele-titlebarTabFocusColor, #FF5353);\n  background-color: #FFF5F5;\n  border-color: rgba(255, 83, 83, 0.2);\n}\n.telebox-readonly .telebox-titles-tab {\n  cursor: not-allowed;\n}\n.telebox-color-scheme-dark {\n  color-scheme: dark;\n}\n.telebox-color-scheme-dark .telebox-titles-tab {\n  color: #e9e9e9;\n  color: var(--tele-titlebarTabColor, #e9e9e9);\n  background-color: transparent;\n  background-color: var(--tele-titlebarTabBackground, transparent);\n  border-right-color: #7b88a0;\n  border-right-color: var(--tele-titlebarTabDividerColor, #7b88a0);\n}\n.telebox-color-scheme-dark .telebox-titles-tab-focus {\n  color: #357bf6;\n  color: var(--tele-titlebarTabFocusColor, #357bf6);\n}")();
class MaxTitleBar extends DefaultTitleBar {
  constructor(config) {
    super(config);
    this.boxes$ = config.boxes$;
    this.rootRect$ = config.rootRect$;
    this.darkMode$ = config.darkMode$;
    config.root.appendChild(this.render());
  }
  focusBox(box) {
    var _a;
    if (this.focusedBox && this.focusedBox === box) {
      return;
    }
    if (this.$titles && this.state$.value === TELE_BOX_STATE.Maximized) {
      const { children } = this.$titles.firstElementChild;
      for (let i = children.length - 1; i >= 0; i -= 1) {
        const $tab = children[i];
        const id = (_a = $tab.dataset) == null ? void 0 : _a.teleBoxID;
        if (id) {
          if (box && id === box.id) {
            $tab.classList.toggle(this.wrapClassName("titles-tab-focus"), true);
          } else if (this.focusedBox && id === this.focusedBox.id) {
            $tab.classList.toggle(this.wrapClassName("titles-tab-focus"), false);
          }
        }
      }
    }
    this.focusedBox = box;
  }
  render() {
    if (this.$titleBar) {
      return this.$titleBar;
    }
    const $titleBar = super.render();
    $titleBar.classList.add(this.wrapClassName("max-titlebar"));
    this.sideEffect.addDisposer([
      valueEnhancer.combine([this.boxes$, this.state$]).subscribe(([boxes, state]) => {
        $titleBar.classList.toggle(this.wrapClassName("max-titlebar-active"), state === TELE_BOX_STATE.Maximized && boxes.length > 0);
      }),
      this.readonly$.subscribe((readonly) => {
        $titleBar.classList.toggle(this.wrapClassName("readonly"), readonly);
      }),
      valueEnhancer.combine([this.state$, this.boxes$]).subscribe(([state, titles]) => {
        if (state === TELE_BOX_STATE.Maximized) {
          $titleBar.classList.toggle(this.wrapClassName("max-titlebar-single-title"), titles.length === 1);
          if (titles.length !== 1) {
            $titleBar.replaceChild(this.renderTitles(), $titleBar.firstElementChild);
          }
        }
      })
    ], "max-render");
    const $titlesArea = document.createElement("div");
    $titlesArea.classList.add(this.wrapClassName("titles-area"));
    $titleBar.insertBefore($titlesArea, $titleBar.firstElementChild);
    return $titleBar;
  }
  destroy() {
    super.destroy();
    this.$titles = void 0;
    this.focusedBox = void 0;
  }
  renderTitles() {
    this.$titles = document.createElement("div");
    this.$titles.className = this.wrapClassName("titles");
    this.sideEffect.addEventListener(this.$titles, "wheel", (ev) => {
      if (!ev.deltaX) {
        ev.currentTarget.scrollBy({
          left: ev.deltaY > 0 ? 250 : -250,
          behavior: "smooth"
        });
      }
    }, { passive: false }, "max-render-wheel-titles");
    const $content = document.createElement("div");
    $content.className = this.wrapClassName("titles-content");
    this.$titles.appendChild($content);
    const disposers = this.boxes$.value.map((box) => {
      const $tab = document.createElement("button");
      $tab.className = this.wrapClassName("titles-tab");
      $tab.textContent = box.title;
      $tab.dataset.teleBoxID = box.id;
      $tab.dataset.teleTitleBarNoDblClick = "true";
      if (this.focusedBox && box.id === this.focusedBox.id) {
        $tab.classList.add(this.wrapClassName("titles-tab-focus"));
      }
      $content.appendChild($tab);
      return box._title$.reaction((title) => $tab.textContent = title);
    });
    this.sideEffect.addDisposer(() => disposers.forEach((disposer) => disposer()), "max-render-tab-titles");
    return this.$titles;
  }
}
const ResizeObserver = window.ResizeObserver || resizeObserver.ResizeObserver;
class TeleBoxManager {
  constructor({
    root = null,
    fullscreen = false,
    prefersColorScheme = TELE_BOX_COLOR_SCHEME.Light,
    minimized = false,
    maximized = false,
    fence = true,
    collector,
    namespace = "telebox",
    readonly = false,
    stageRatio = -1,
    containerStyle = "",
    stageStyle = "",
    defaultBoxBodyStyle = null,
    defaultBoxStageStyle = null,
    theme = null
  } = {}) {
    this.events = new Emittery__default["default"]();
    this._sideEffect = new sideEffectManager.SideEffectManager();
    this.namespace = namespace;
    const valManager = new valueEnhancer.ValManager();
    this._sideEffect.addDisposer(() => valManager.destroy());
    const root$ = new valueEnhancer.Val(root);
    const readonly$ = new valueEnhancer.Val(readonly);
    const fence$ = new valueEnhancer.Val(fence);
    const containerStyle$ = new valueEnhancer.Val(containerStyle);
    const stageStyle$ = new valueEnhancer.Val(stageStyle);
    const stageRatio$ = new valueEnhancer.Val(stageRatio);
    const defaultBoxBodyStyle$ = new valueEnhancer.Val(defaultBoxBodyStyle);
    const defaultBoxStageStyle$ = new valueEnhancer.Val(defaultBoxStageStyle);
    const fullscreen$ = new valueEnhancer.Val(fullscreen);
    const input_minimized$ = new valueEnhancer.Val(minimized);
    const input_maximized$ = new valueEnhancer.Val(maximized);
    const boxCount = new valueEnhancer.Val(0);
    const maximized$ = valueEnhancer.combine([input_maximized$, fullscreen$], ([maximized2, fullscreen2]) => fullscreen2 ? true : maximized2);
    const minimized$ = valueEnhancer.combine([input_minimized$, fullscreen$], ([minimized2, fullscreen2]) => fullscreen2 ? false : minimized2);
    this.setMaximized = (maximized2, skipUpdate) => input_maximized$.setValue(maximized2, skipUpdate);
    this.setMinimized = (minimized2, skipUpdate) => input_minimized$.setValue(minimized2, skipUpdate);
    this.delBoxCount = (count) => boxCount.setValue(count != null ? count : boxCount.value - 1);
    this.addBoxCount = (count) => boxCount.setValue(count != null ? count : boxCount.value + 1);
    const rootRect$ = new valueEnhancer.Val({
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    }, { compare: shallowequal__default["default"] });
    this._sideEffect.addDisposer(root$.subscribe((root2) => {
      this._sideEffect.add(() => {
        if (!root2) {
          return () => void 0;
        }
        const observer = new ResizeObserver(() => {
          const rect = root2.getBoundingClientRect();
          rootRect$.setValue({
            x: 0,
            y: 0,
            width: rect.width,
            height: rect.height
          });
        });
        observer.observe(root2);
        return () => observer.disconnect();
      }, "calc-root-rect");
    }));
    const stageRect$ = valueEnhancer.combine([rootRect$, stageRatio$], calcStageRect, {
      compare: shallowequal__default["default"]
    });
    this.boxes$ = new valueEnhancer.Val([]);
    this.topBox$ = new valueEnhancer.Val(void 0);
    this._sideEffect.addDisposer(this.boxes$.subscribe((boxes) => {
      if (boxes.length > 0) {
        const topBox = boxes.reduce((topBox2, box) => topBox2.zIndex > box.zIndex ? topBox2 : box);
        this.topBox$.setValue(topBox);
      } else {
        this.topBox$.setValue(void 0);
      }
    }));
    const prefersDarkMatch = window.matchMedia("(prefers-color-scheme: dark)");
    const prefersDark$ = new valueEnhancer.Val(false);
    if (prefersDarkMatch) {
      prefersDark$.setValue(prefersDarkMatch.matches);
      this._sideEffect.add(() => {
        const handler = (evt) => {
          prefersDark$.setValue(evt.matches);
        };
        if (prefersDarkMatch.addEventListener) {
          prefersDarkMatch.addEventListener("change", handler);
          return () => prefersDarkMatch.removeEventListener("change", handler);
        } else {
          prefersDarkMatch.addListener(handler);
          return () => prefersDarkMatch.removeListener(handler);
        }
      });
    }
    const prefersColorScheme$ = new valueEnhancer.Val(prefersColorScheme);
    this._sideEffect.addDisposer(prefersColorScheme$.reaction((prefersColorScheme2, skipUpdate) => {
      if (!skipUpdate) {
        this.events.emit(TELE_BOX_MANAGER_EVENT.PrefersColorScheme, prefersColorScheme2);
      }
    }));
    const darkMode$ = valueEnhancer.combine([prefersDark$, prefersColorScheme$], ([prefersDark, prefersColorScheme2]) => prefersColorScheme2 === "auto" ? prefersDark : prefersColorScheme2 === "dark");
    const state$ = valueEnhancer.combine([minimized$, maximized$], ([minimized2, maximized2]) => minimized2 ? TELE_BOX_STATE.Minimized : maximized2 ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal);
    const theme$ = new valueEnhancer.Val(theme, {
      compare: shallowequal__default["default"]
    });
    const readonlyValConfig = {
      darkMode: darkMode$,
      state: state$,
      root: root$,
      rootRect: rootRect$,
      stageRect: stageRect$,
      minimized: minimized$,
      maximized: maximized$
    };
    valueEnhancer.withReadonlyValueEnhancer(this, readonlyValConfig, valManager);
    const valConfig = {
      fullscreen: fullscreen$,
      prefersColorScheme: prefersColorScheme$,
      readonly: readonly$,
      fence: fence$,
      stageRatio: stageRatio$,
      containerStyle: containerStyle$,
      stageStyle: stageStyle$,
      defaultBoxBodyStyle: defaultBoxBodyStyle$,
      defaultBoxStageStyle: defaultBoxStageStyle$,
      theme: theme$
    };
    valueEnhancer.withValueEnhancer(this, valConfig, valManager);
    const closeBtnClassName = this.wrapClassName("titlebar-icon-close");
    const checkFocusBox = (ev) => {
      var _a;
      if (!ev.isPrimary || readonly$.value) {
        return;
      }
      const target = ev.target;
      if (!target.tagName) {
        return;
      }
      for (let el = target; el; el = el.parentElement) {
        if (el.classList && el.classList.contains(closeBtnClassName)) {
          return;
        }
        const id = (_a = el.dataset) == null ? void 0 : _a.teleBoxID;
        if (id) {
          const box = this.getBox(id);
          if (box) {
            this.focusBox(box);
            this.makeBoxTop(box);
            return;
          }
        }
      }
    };
    this._sideEffect.addEventListener(window, "pointerdown", checkFocusBox, true);
    this.$container = document.createElement("div");
    this.$container.className = this.wrapClassName("manager-container");
    this.setTheme(theme);
    this.$stage = document.createElement("div");
    this.$stage.className = this.wrapClassName("manager-stage");
    this.$container.appendChild(this.$stage);
    this._sideEffect.addDisposer([
      darkMode$.subscribe((darkMode) => {
        this.$container.classList.toggle(this.wrapClassName("color-scheme-dark"), darkMode);
        this.$container.classList.toggle(this.wrapClassName("color-scheme-light"), !darkMode);
      }),
      fullscreen$.subscribe((fullscreen2) => {
        this.$container.classList.toggle(this.wrapClassName("is-fullscreen"), Boolean(fullscreen2));
      }),
      valueEnhancer.combine([this.boxes$, fullscreen$], ([boxes, fullscreen2]) => fullscreen2 === "no-titlebar" || fullscreen2 === true && boxes.length <= 1).subscribe((hideSingleTabTitlebar) => {
        this.$container.classList.toggle(this.wrapClassName("hide-fullscreen-titlebar"), hideSingleTabTitlebar);
      }),
      maximized$.subscribe((maximized2) => {
        this.$container.classList.toggle(this.wrapClassName("is-maximized"), maximized2);
      }),
      minimized$.subscribe((minimized2) => {
        this.$container.classList.toggle(this.wrapClassName("is-minimized"), minimized2);
      }),
      valueEnhancer.combine([containerStyle$, theme$]).subscribe(([containerStyle2, theme2]) => {
        this.$container.style.cssText = containerStyle2;
        if (theme2) {
          Object.keys(theme2).forEach((key) => {
            var _a;
            this.$container.style.setProperty(`--tele-${key}`, (_a = theme2[key]) != null ? _a : null);
          });
        }
      }),
      stageStyle$.subscribe((stageStyle2) => {
        this.$stage.style.cssText = stageStyle2;
        this.$stage.style.width = stageRect$.value.width + "px";
        this.$stage.style.height = stageRect$.value.height + "px";
      }),
      stageRect$.subscribe((stageRect) => {
        this.$stage.style.width = stageRect.width + "px";
        this.$stage.style.height = stageRect.height + "px";
      }),
      root$.subscribe((root2) => {
        if (root2) {
          root2.appendChild(this.$container);
        } else if (this.$container.parentElement) {
          this.$container.remove();
        }
      })
    ]);
    this.collector = collector != null ? collector : new TeleBoxCollector({
      minimized$,
      readonly$,
      darkMode$,
      namespace,
      boxCount,
      root: this.$container,
      onClick: () => input_minimized$.setValue(false)
    });
    this.titleBar = new MaxTitleBar({
      namespace: this.namespace,
      title$: valueEnhancer.derive(this.topBox$, (topBox) => (topBox == null ? void 0 : topBox.title) || ""),
      boxes$: this.boxes$,
      darkMode$,
      readonly$,
      state$,
      rootRect$,
      root: this.$container,
      onEvent: (event) => {
        switch (event.type) {
          case TELE_BOX_DELEGATE_EVENT.Maximize: {
            this.setMaximized(!maximized$.value);
            break;
          }
          case TELE_BOX_DELEGATE_EVENT.Minimize: {
            this.setMinimized(true);
            break;
          }
          case TELE_BOX_EVENT.Close: {
            this.removeTopBox();
            this.focusTopBox();
            break;
          }
        }
      }
    });
    this._sideEffect.addDisposer([
      state$.reaction((state, skipUpdate) => {
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.State, state);
        }
      }),
      maximized$.reaction((maximized2, skipUpdate) => {
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.Maximized, maximized2);
        }
      }),
      minimized$.reaction((minimized2, skipUpdate) => {
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.Minimized, minimized2);
        }
      }),
      darkMode$.reaction((darkMode, skipUpdate) => {
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.DarkMode, darkMode);
        }
      })
    ]);
  }
  get boxes() {
    return this.boxes$.value;
  }
  get topBox() {
    return this.topBox$.value;
  }
  setState(state, skipUpdate = false) {
    switch (state) {
      case TELE_BOX_STATE.Maximized: {
        this.setMinimized(false, skipUpdate);
        this.setMaximized(true, skipUpdate);
        break;
      }
      case TELE_BOX_STATE.Minimized: {
        this.setMinimized(true, skipUpdate);
        this.setMaximized(false, skipUpdate);
        break;
      }
      default: {
        this.setMinimized(false, skipUpdate);
        this.setMaximized(false, skipUpdate);
        break;
      }
    }
    return this;
  }
  create(config = {}, smartPosition = true) {
    const box = new TeleBox({
      zIndex: this.topBox ? this.topBox.zIndex + 1 : 100,
      ...config,
      ...smartPosition ? this.smartPosition(config) : {},
      namespace: this.namespace,
      root: this.$stage,
      darkMode$: this._darkMode$,
      fence$: this._fence$,
      rootRect$: this._rootRect$,
      managerStageRect$: this._stageRect$,
      managerStageRatio$: this._stageRatio$,
      managerMaximized$: this._maximized$,
      managerMinimized$: this._minimized$,
      managerReadonly$: this._readonly$,
      collectorRect$: this.collector._rect$,
      defaultBoxBodyStyle$: this._defaultBoxBodyStyle$,
      defaultBoxStageStyle$: this._defaultBoxStageStyle$
    });
    if (box.focus) {
      this.focusBox(box);
      if (smartPosition) {
        this.makeBoxTop(box);
      }
    }
    this.boxes$.setValue([...this.boxes, box]);
    this._sideEffect.addDisposer([
      box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Maximize, () => {
        this.setMaximized(!this.maximized);
      }),
      box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Minimize, () => {
        this.setMinimized(true);
      }),
      box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Close, () => {
        this.remove(box);
        this.focusTopBox();
      }),
      box._intrinsicCoord$.reaction((_, skipUpdate) => {
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.IntrinsicMove, box);
        }
      }),
      box._intrinsicSize$.reaction((_, skipUpdate) => {
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.IntrinsicResize, box);
        }
      }),
      box._zIndex$.reaction((_, skipUpdate) => {
        if (this.boxes.length > 0) {
          const topBox = this.boxes.reduce((topBox2, box2) => topBox2.zIndex > box2.zIndex ? topBox2 : box2);
          this.topBox$.setValue(topBox);
        }
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.ZIndex, box);
        }
      })
    ]);
    this.events.emit(TELE_BOX_MANAGER_EVENT.Created, box);
    this.addBoxCount();
    return box;
  }
  query(config) {
    return config ? this.boxes.filter(this.teleBoxMatcher(config)) : [...this.boxes];
  }
  queryOne(config) {
    return config ? this.boxes.find(this.teleBoxMatcher(config)) : this.boxes[0];
  }
  update(boxID, config, skipUpdate = false) {
    const box = this.boxes.find((box2) => box2.id === boxID);
    if (box) {
      return this.updateBox(box, config, skipUpdate);
    }
  }
  updateAll(config, skipUpdate = false) {
    this.boxes.forEach((box) => {
      this.updateBox(box, config, skipUpdate);
    });
  }
  remove(boxOrID, skipUpdate = false) {
    const index = this.getBoxIndex(boxOrID);
    if (index >= 0) {
      const boxes = this.boxes.slice();
      const deletedBoxes = boxes.splice(index, 1);
      this.boxes$.setValue(boxes);
      deletedBoxes.forEach((box) => box.destroy());
      if (!skipUpdate) {
        if (this.boxes.length <= 0) {
          this.setMaximized(false);
          this.setMinimized(false);
        }
        this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, deletedBoxes);
      }
      this.delBoxCount();
      return deletedBoxes[0];
    }
    return;
  }
  removeTopBox() {
    if (this.topBox) {
      return this.remove(this.topBox);
    }
    return;
  }
  removeAll(skipUpdate = false) {
    const deletedBoxes = this.boxes$.value;
    this.boxes$.setValue([]);
    deletedBoxes.forEach((box) => box.destroy());
    if (!skipUpdate) {
      if (this.boxes.length <= 0) {
        this.setMaximized(false);
        this.setMinimized(false);
      }
      this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, deletedBoxes);
    }
    this.delBoxCount(0);
    return deletedBoxes;
  }
  mount(root) {
    this._root$.setValue(root);
  }
  unmount() {
    this._root$.setValue(null);
  }
  destroy(skipUpdate = false) {
    this.events.clearListeners();
    this._sideEffect.flushAll();
    this.removeAll(skipUpdate);
    this.collector.destroy();
    this.titleBar.destroy();
  }
  wrapClassName(className) {
    return `${this.namespace}-${className}`;
  }
  focusBox(boxOrID, skipUpdate = false) {
    const targetBox = this.getBox(boxOrID);
    if (targetBox) {
      this.boxes.forEach((box) => {
        if (targetBox === box) {
          let focusChanged = false;
          if (!targetBox.focus) {
            focusChanged = true;
            targetBox._focus$.setValue(true, skipUpdate);
          }
          if (focusChanged && !skipUpdate) {
            this.events.emit(TELE_BOX_MANAGER_EVENT.Focused, targetBox);
          }
        } else if (box.focus) {
          this.blurBox(box, skipUpdate);
        }
      });
      this.titleBar.focusBox(targetBox);
    }
  }
  focusTopBox() {
    if (this.topBox && !this.topBox.focus) {
      return this.focusBox(this.topBox);
    }
  }
  blurBox(boxOrID, skipUpdate = false) {
    const targetBox = this.getBox(boxOrID);
    if (targetBox) {
      if (targetBox.focus) {
        targetBox._focus$.setValue(false, skipUpdate);
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.Blurred, targetBox);
        }
      }
      if (this.titleBar.focusedBox === targetBox) {
        this.titleBar.focusBox();
      }
    }
  }
  blurAll(skipUpdate = false) {
    this.boxes.forEach((box) => {
      if (box.focus) {
        box._focus$.setValue(false, skipUpdate);
        if (!skipUpdate) {
          this.events.emit(TELE_BOX_MANAGER_EVENT.Blurred, box);
        }
      }
    });
    if (this.titleBar.focusedBox) {
      this.titleBar.focusBox();
    }
  }
  teleBoxMatcher(config) {
    const keys = Object.keys(config);
    return (box) => keys.every((key) => config[key] === box[key]);
  }
  updateBox(box, config, skipUpdate = false) {
    var _a, _b, _c, _d, _e, _f;
    if (config.x != null || config.y != null) {
      box._intrinsicCoord$.setValue({
        x: (_a = config.x) != null ? _a : box.intrinsicX,
        y: (_b = config.y) != null ? _b : box.intrinsicY
      }, skipUpdate);
    }
    if (config.width != null || config.height != null) {
      box._intrinsicSize$.setValue({
        width: (_c = config.width) != null ? _c : box.intrinsicWidth,
        height: (_d = config.height) != null ? _d : box.intrinsicHeight
      }, skipUpdate);
    }
    if (config.title != null) {
      box._title$.setValue(config.title);
    }
    if (config.visible != null) {
      box._visible$.setValue(config.visible, skipUpdate);
    }
    if (config.resizable != null) {
      box._resizable$.setValue(config.resizable, skipUpdate);
    }
    if (config.draggable != null) {
      box._draggable$.setValue(config.draggable, skipUpdate);
    }
    if (config.boxRatio != null) {
      box._boxRatio$.setValue(config.boxRatio, skipUpdate);
    }
    if (config.zIndex != null) {
      box._zIndex$.setValue(config.zIndex, skipUpdate);
    }
    if (config.stageRatio !== void 0) {
      box.setStageRatio(config.stageRatio, skipUpdate);
    }
    if (config.content != null) {
      box.mountContent(config.content);
    }
    if (config.footer != null) {
      box.mountFooter(config.footer);
    }
    if (config.minHeight != null || config.minWidth != null) {
      box._minSize$.setValue({
        width: (_e = config.minWidth) != null ? _e : box.minWidth,
        height: (_f = config.minHeight) != null ? _f : box.minHeight
      }, skipUpdate);
    }
  }
  smartPosition(rect) {
    let { x, y } = rect;
    const { width = 0.5, height = 0.5 } = rect;
    const stageRect = this.stageRect;
    const topBox = this.topBox;
    if (x == null) {
      let pxX = 20;
      if (topBox) {
        const pxPreferredX = topBox.pxIntrinsicCoord.x + 20;
        const pxIntrinsicWidth = width * stageRect.width;
        if (pxPreferredX + pxIntrinsicWidth <= stageRect.width) {
          pxX = pxPreferredX;
        }
      }
      x = pxX / stageRect.width;
    }
    if (y == null) {
      let pxY = 20;
      if (topBox) {
        const pxPreferredY = topBox.pxIntrinsicCoord.y + 20;
        const pxIntrinsicHeight = height * stageRect.height;
        if (pxPreferredY + pxIntrinsicHeight <= stageRect.height) {
          pxY = pxPreferredY;
        }
      }
      y = pxY / stageRect.height;
    }
    return { x, y, width, height };
  }
  makeBoxTop(box, skipUpdate = false) {
    if (this.topBox) {
      if (box !== this.topBox) {
        box._zIndex$.setValue(this.topBox.zIndex + 1, skipUpdate);
      }
    }
  }
  getBoxIndex(boxOrID) {
    return typeof boxOrID === "string" ? this.boxes.findIndex((box) => box.id === boxOrID) : this.boxes.findIndex((box) => box === boxOrID);
  }
  getBox(boxOrID) {
    return typeof boxOrID === "string" ? this.boxes.find((box) => box.id === boxOrID) : boxOrID;
  }
}
exports.DefaultTitleBar = DefaultTitleBar;
exports.TELE_BOX_COLOR_SCHEME = TELE_BOX_COLOR_SCHEME;
exports.TELE_BOX_DELEGATE_EVENT = TELE_BOX_DELEGATE_EVENT;
exports.TELE_BOX_EVENT = TELE_BOX_EVENT;
exports.TELE_BOX_MANAGER_EVENT = TELE_BOX_MANAGER_EVENT;
exports.TELE_BOX_RESIZE_HANDLE = TELE_BOX_RESIZE_HANDLE;
exports.TELE_BOX_STATE = TELE_BOX_STATE;
exports.TeleBox = TeleBox;
exports.TeleBoxCollector = TeleBoxCollector;
exports.TeleBoxDragHandleType = TeleBoxDragHandleType;
exports.TeleBoxManager = TeleBoxManager;
//# sourceMappingURL=telebox-insider.cjs.js.map
