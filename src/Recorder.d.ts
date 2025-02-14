import { EventMessage } from "./model/EventMessage";
import { EventLoggingServiceClient } from "./transport/EventLoggingServiceClient";
/**
 * Describes Event Recorder interface
 * @param recorder instance of EventLogingServiceClient or another recorder
 * @param preProcess preprocessing method with null implementation in the current release
 * @param postProcess postprocessing method with null implementation in the current release
 * @param record the method that records the event depending on the recorder implementation
 */
interface IEventRecorder {
    recorder: EventLoggingServiceClient | Function;
    preProcess: (event: EventMessage) => EventMessage;
    postProcess?: (result: any) => any;
    record: (event: EventMessage, callback?: (result: any) => void) => Promise<any>;
}
declare class DefaultLoggerRecorder implements IEventRecorder {
    recorder: Function;
    constructor(recorder?: EventLoggingServiceClient);
    preProcess: (event: EventMessage) => EventMessage;
    postProcess: (result: any) => any;
    record(event: EventMessage): Promise<any>;
}
declare class DefaultSidecarRecorder implements IEventRecorder {
    recorder: EventLoggingServiceClient;
    constructor(recorder: EventLoggingServiceClient);
    preProcess: (event: EventMessage) => EventMessage;
    postProcess: (result: any) => any;
    record(event: EventMessage): Promise<any>;
}
declare class DefaultSidecarRecorderAsync implements IEventRecorder {
    recorder: EventLoggingServiceClient;
    constructor(recorder: EventLoggingServiceClient);
    preProcess: (event: EventMessage) => EventMessage;
    record(event: EventMessage, callback?: (result: any) => void): Promise<any>;
}
export { DefaultLoggerRecorder, DefaultSidecarRecorder, DefaultSidecarRecorderAsync, IEventRecorder };
