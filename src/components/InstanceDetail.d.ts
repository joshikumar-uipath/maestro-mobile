import type { ProcessInstanceGetResponse } from '@uipath/uipath-typescript/maestro-processes';
interface InstanceDetailProps {
    instance: ProcessInstanceGetResponse;
    onClose: () => void;
}
export declare function InstanceDetail({ instance, onClose }: InstanceDetailProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=InstanceDetail.d.ts.map