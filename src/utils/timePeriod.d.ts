export declare const TIME_PERIODS: readonly [{
    readonly key: "all";
    readonly label: "All";
}, {
    readonly key: "lastHour";
    readonly label: "Last hour";
}, {
    readonly key: "today";
    readonly label: "Today";
}, {
    readonly key: "last24h";
    readonly label: "Last 24 hours";
}, {
    readonly key: "last7d";
    readonly label: "Last 7 days";
}, {
    readonly key: "last2w";
    readonly label: "Last 2 weeks";
}, {
    readonly key: "last30d";
    readonly label: "Last 30 days";
}, {
    readonly key: "last6m";
    readonly label: "Last 6 months";
}];
export type TimePeriod = typeof TIME_PERIODS[number]['key'];
export declare function getStartDate(period: TimePeriod): Date | null;
//# sourceMappingURL=timePeriod.d.ts.map