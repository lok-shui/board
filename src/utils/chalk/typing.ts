export type ChalkInfo = {
    container: Element;
    start: number;
    end: number;
    css?: string;
    className?: string | string[];
    id?: string | undefined;

    text?: string;
    textOrder?: number;

    element?: string;
    elementOrder?: number;
};
