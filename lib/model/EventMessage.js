/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 - Ramiro González Maciel <ramiro@modusbox.com>
 - Valentin Genev <valentin.genev@modusbox.com>

 --------------
 ******/
'use strict';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require('crypto');
const Uuid = require('uuid4');
const TRACE_ID_REGEX = /^[0-9abcdef]{32}$/;
const SPAN_ID_REGEX = /^[0-9abcdef]{16}$/;
/**
 * EventType represents the different types of events.
 */
var EventType;
(function (EventType) {
    EventType["undefined"] = "undefined";
    EventType["log"] = "log";
    EventType["audit"] = "audit";
    EventType["trace"] = "trace";
})(EventType || (EventType = {}));
exports.EventType = EventType;
/**
 * Actions for event type Log
 */
var LogEventAction;
(function (LogEventAction) {
    LogEventAction["info"] = "info";
    LogEventAction["debug"] = "debug";
    LogEventAction["verbose"] = "verbose";
    LogEventAction["performance"] = "perf";
    LogEventAction["warning"] = "warn";
    LogEventAction["error"] = "error";
})(LogEventAction || (LogEventAction = {}));
exports.LogEventAction = LogEventAction;
/**
 * Actions for event type Audit
 */
var AuditEventAction;
(function (AuditEventAction) {
    AuditEventAction["default"] = "default";
    AuditEventAction["start"] = "start";
    AuditEventAction["finish"] = "finish";
    AuditEventAction["ingress"] = "ingress";
    AuditEventAction["egress"] = "egress";
})(AuditEventAction || (AuditEventAction = {}));
exports.AuditEventAction = AuditEventAction;
/**
 * Actions for event type trace
 */
var TraceEventAction;
(function (TraceEventAction) {
    TraceEventAction["span"] = "span";
})(TraceEventAction || (TraceEventAction = {}));
exports.TraceEventAction = TraceEventAction;
var NullEventAction;
(function (NullEventAction) {
    NullEventAction["undefined"] = "undefined";
})(NullEventAction || (NullEventAction = {}));
exports.NullEventAction = NullEventAction;
/**
 * Enum that represents the event status types
 */
var EventStatusType;
(function (EventStatusType) {
    EventStatusType["success"] = "success";
    EventStatusType["failed"] = "failed";
})(EventStatusType || (EventStatusType = {}));
exports.EventStatusType = EventStatusType;
var HttpRequestOptions;
(function (HttpRequestOptions) {
    HttpRequestOptions["w3c"] = "w3c";
    HttpRequestOptions["xb3"] = "xb3";
})(HttpRequestOptions || (HttpRequestOptions = {}));
exports.HttpRequestOptions = HttpRequestOptions;
/**
 * Describes class for extracting types and their actions based on type input
 */
class TypeAction {
    getType() {
        return this.type;
    }
    getAction() {
        return this.action;
    }
    constructor(typeAction) {
        this.type = typeAction.type;
        this.action = typeAction.action;
    }
}
/**
 * Returns new `TypeEventTypeAction` object with type = 'log'
 */
class LogEventTypeAction extends TypeAction {
    constructor(actionParam = NullEventAction.undefined) {
        if (typeof actionParam === 'object' && 'action' in actionParam)
            super({ type: LogEventTypeAction.type, action: actionParam.action });
        else
            super({ type: LogEventTypeAction.type, action: actionParam });
    }
    static getType() {
        return LogEventTypeAction.type;
    }
}
LogEventTypeAction.type = EventType.log;
exports.LogEventTypeAction = LogEventTypeAction;
/**
 * Returns new `TypeEventTypeAction` object with type = 'audit'
 */
class AuditEventTypeAction extends TypeAction {
    constructor(actionParam = NullEventAction.undefined) {
        if (typeof actionParam === 'object' && 'action' in actionParam)
            super({ type: AuditEventTypeAction.type, action: actionParam.action });
        else
            super({ type: AuditEventTypeAction.type, action: actionParam });
    }
    static getType() {
        return AuditEventTypeAction.type;
    }
}
AuditEventTypeAction.type = EventType.audit;
exports.AuditEventTypeAction = AuditEventTypeAction;
/**
 * Returns new `TypeEventTypeAction` object with type = 'trace'
 */
class TraceEventTypeAction extends TypeAction {
    constructor(actionParam = NullEventAction.undefined) {
        if (typeof actionParam === 'object' && 'action' in actionParam)
            super({ type: TraceEventTypeAction.type, action: actionParam.action });
        else
            super({ type: TraceEventTypeAction.type, action: actionParam });
    }
    static getType() {
        return TraceEventTypeAction.type;
    }
}
TraceEventTypeAction.type = EventType.trace;
exports.TraceEventTypeAction = TraceEventTypeAction;
// type requiredSampled = Required<{ readonly sampled: 0|1 }>
// type SpanContext = requiredSampled & Partial<TypeSpanContext>
class EventTraceMetadata {
    constructor(spanContext) {
        this.startTimestamp = (new Date()).toISOString(); // ISO 8601
        let { service = '', traceId = newTraceId(), spanId = newSpanId(), parentSpanId, sampled, flags, startTimestamp, tags = {}, finishTimestamp } = spanContext;
        this.service = service;
        if (!(TRACE_ID_REGEX.test(traceId))) {
            throw new Error(`Invalid traceId: ${traceId}`);
        }
        this.traceId = traceId;
        if (!(SPAN_ID_REGEX.test(spanId))) {
            throw new Error(`Invalid spanId: ${spanId}`);
        }
        this.spanId = spanId;
        if (parentSpanId && !(SPAN_ID_REGEX.test(parentSpanId))) {
            throw new Error(`Invalid parentSpanId: ${parentSpanId}`);
        }
        this.parentSpanId = parentSpanId;
        this.sampled = sampled; // ? sampled : this.sampled
        this.flags = flags; // ? flags : this.flags
        this.tags = tags;
        if (startTimestamp instanceof Date) {
            this.startTimestamp = startTimestamp.toISOString(); // ISO 8601
        }
        else if (startTimestamp) {
            this.startTimestamp = startTimestamp;
        }
        this.finishTimestamp = finishTimestamp;
        return this;
    }
    static create(service) {
        return new EventTraceMetadata({ service });
    }
}
exports.EventTraceMetadata = EventTraceMetadata;
class EventStateMetadata {
    /**
     * Creates new state object
     * @param status
     * @param code
     * @param description
     */
    constructor(status, code, description) {
        this.status = EventStatusType.success;
        this.status = status;
        this.code = code;
        this.description = description;
        return this;
    }
    /**
     * Creates success state object
     * @param code
     * @param description
     */
    static success(code, description) {
        return new EventStateMetadata(EventStatusType.success, code, description);
    }
    /**
     * Creates failed state object
     * @param code
     * @param description
     */
    static failed(code, description) {
        return new EventStateMetadata(EventStatusType.failed, code, description);
    }
}
exports.EventStateMetadata = EventStateMetadata;
class EventMetadata {
    /**
     * Creates metadata object based on the passed message
     * @param eventMetadata
     */
    constructor(eventMetadata) {
        this.id = Uuid();
        this.type = EventType.undefined;
        this.action = NullEventAction.undefined;
        let { createdAt = new Date().toISOString(), state } = eventMetadata, restParams = __rest(eventMetadata, ["createdAt", "state"]);
        if (createdAt instanceof Date) {
            this.createdAt = createdAt.toISOString(); // ISO 8601
        }
        else {
            this.createdAt = createdAt;
        }
        this.state = state;
        Object.assign(this, restParams);
    }
    /**
     * Creates log type event metadata
     * @param eventMetadata
     */
    static log(eventMetadata) {
        let typeAction = new LogEventTypeAction({ action: eventMetadata.action });
        return new EventMetadata(Object.assign(eventMetadata, typeAction));
    }
    /**
     * Creates trace type event metadata
     * @param eventMetadata
     */
    static trace(eventMetadata) {
        let typeAction = new TraceEventTypeAction({ action: eventMetadata.action });
        return new EventMetadata(Object.assign(eventMetadata, typeAction));
    }
    /**
     * Creates audit type event metadata
     * @param eventMetadata
     */
    static audit(eventMetadata) {
        let typeAction = new AuditEventTypeAction({ action: eventMetadata.action });
        let a = (Object.assign(eventMetadata, typeAction));
        return new EventMetadata(a);
    }
}
exports.EventMetadata = EventMetadata;
class EventMessage {
    /**
     * Creates event message
     * @param eventMessageContent message content based on the `TypeEventMessage`
     */
    constructor(eventMessageContent) {
        this.type = '';
        this.id = Uuid();
        return Object.assign(this, eventMessageContent);
    }
}
exports.EventMessage = EventMessage;
/**
 * Defines the log responses
 */
var LogResponseStatus;
(function (LogResponseStatus) {
    LogResponseStatus["UNDEFINED"] = "undefined";
    LogResponseStatus["pending"] = "pending";
    LogResponseStatus["accepted"] = "accepted";
    LogResponseStatus["error"] = "error";
})(LogResponseStatus || (LogResponseStatus = {}));
exports.LogResponseStatus = LogResponseStatus;
class LogResponse {
    constructor(status) {
        this.status = LogResponseStatus.UNDEFINED;
        this.status = status;
    }
}
exports.LogResponse = LogResponse;
function newTraceId() {
    return crypto.randomBytes(16).toString('hex');
}
function newSpanId() {
    return crypto.randomBytes(8).toString('hex');
}
//# sourceMappingURL=EventMessage.js.map